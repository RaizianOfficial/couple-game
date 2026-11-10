// Real-time synchronization service for position, animations, spots, reactions, and games
import {
  dbRef,
  dbSet,
  dbUpdate,
  dbOnValue,
  dbRunTransaction,
  dbPush,
  getServerTimestamp
} from './config.js';
import { roomService } from './roomService.js';

// Heartbeat interval (ms) — keep presence alive so Firebase onDisconnect
// doesn't trigger on brief network hiccups (25 s is well under the ~60 s timeout)
const HEARTBEAT_MS = 25_000;

export class SyncService {
  constructor() {
    this.lastWriteTime = 0;
    this.writeInterval = 80; // ~12.5 Hz (within 10-15 Hz requirement)
    this.lastWrittenState = { x: null, z: null, rotY: null, anim: null };
    
    // Partner state interpolation buffer
    this.partnerTarget = { x: 0, z: 0, rotY: 0, anim: 'idle' };
    this.partnerCurrent = { x: 0, z: 0, rotY: 0, anim: 'idle' };
    this.hasPartnerState = false;

    // Reactions rate limiter
    this.lastReactionTime = 0;
    this.reactionListeners = new Set();
    this.processedReactions = new Set();

    // Spot state listeners
    this.spotsData = {};
    this.handsData = { p1Holding: false, p2Holding: false };

    // Games state
    this.tictactoeState = null;
    this.outfitState = null;

    this.unsubscribers = [];
    this._heartbeatTimer = null;
  }

  init(roomId, uid, partnerUid) {
    this.cleanup();
    this.roomId = roomId;
    this.uid = uid;
    this.partnerUid = partnerUid;

    // Start heartbeat — ping presence every 25 s to prevent spurious disconnects
    this._heartbeatTimer = setInterval(async () => {
      if (!this.roomId || !this.uid) return;
      try {
        await dbUpdate(dbRef(`rooms/${this.roomId}/players/${this.uid}`), {
          online: true,
          lastSeen: getServerTimestamp()
        });
      } catch (_) {}
    }, HEARTBEAT_MS);

    // 1. Listen to partner's state
    if (partnerUid) {
      const partnerStateRef = dbRef(`rooms/${roomId}/state/${partnerUid}`);
      const unsubPartner = dbOnValue(partnerStateRef, (snap) => {
        if (!snap.exists()) return;
        const val = snap.val();
        this.partnerTarget.x = val.x ?? 0;
        this.partnerTarget.y = val.y ?? 0;
        this.partnerTarget.z = val.z ?? 0;
        this.partnerTarget.rotY = val.rotY ?? 0;
        this.partnerTarget.anim = val.anim || 'idle';
        if (!this.hasPartnerState) {
          // snap immediately on first packet
          this.partnerCurrent.x = this.partnerTarget.x;
          this.partnerCurrent.y = this.partnerTarget.y;
          this.partnerCurrent.z = this.partnerTarget.z;
          this.partnerCurrent.rotY = this.partnerTarget.rotY;
          this.partnerCurrent.anim = this.partnerTarget.anim;
          this.hasPartnerState = true;
        }
      });
      this.unsubscribers.push(unsubPartner);
    }

    // 2. Listen to hands state
    const handsRef = dbRef(`rooms/${roomId}/hands`);
    const unsubHands = dbOnValue(handsRef, (snap) => {
      if (snap.exists()) {
        this.handsData = snap.val();
      }
    });
    this.unsubscribers.push(unsubHands);

    // 3. Listen to spots state
    const spotsRef = dbRef(`rooms/${roomId}/spots`);
    const unsubSpots = dbOnValue(spotsRef, (snap) => {
      if (snap.exists()) {
        this.spotsData = snap.val();
      }
    });
    this.unsubscribers.push(unsubSpots);

    // 4. Listen to reactions
    const reactionsRef = dbRef(`rooms/${roomId}/reactions`);
    const unsubReactions = dbOnValue(reactionsRef, (snap) => {
      if (!snap.exists()) return;
      const reactions = snap.val();
      const now = Date.now();
      for (const [id, r] of Object.entries(reactions)) {
        if (!this.processedReactions.has(id)) {
          this.processedReactions.add(id);
          // Only trigger if reaction is recent (less than 6 seconds old)
          if (!r.ts || (typeof r.ts === 'number' && now - r.ts < 6000)) {
            this.reactionListeners.forEach(cb => cb(r));
          }
        }
      }
    });
    this.unsubscribers.push(unsubReactions);

    // 5. Listen to Mini-games
    const tttRef = dbRef(`rooms/${roomId}/games/tictactoe`);
    const unsubTTT = dbOnValue(tttRef, (snap) => {
      this.tictactoeState = snap.exists() ? snap.val() : null;
      if (this.onTicTacToeUpdated) this.onTicTacToeUpdated(this.tictactoeState);
    });
    this.unsubscribers.push(unsubTTT);

    const outfitRef = dbRef(`rooms/${roomId}/games/outfit`);
    const unsubOutfit = dbOnValue(outfitRef, (snap) => {
      this.outfitState = snap.exists() ? snap.val() : null;
      if (this.onOutfitUpdated) this.onOutfitUpdated(this.outfitState);
    });
    this.unsubscribers.push(unsubOutfit);
  }

  // Update own position to Firebase (throttled to 10-15 Hz, only if changed)
  sendState(x, z, rotY, anim, force = false, y = 0) {
    if (!this.roomId || !this.uid) return;
    const now = performance.now();
    if (!force && now - this.lastWriteTime < this.writeInterval) return;

    // Check if changed significantly
    const dx = Math.abs(x - (this.lastWrittenState.x ?? 999));
    const dy = Math.abs(y - (this.lastWrittenState.y ?? 999));
    const dz = Math.abs(z - (this.lastWrittenState.z ?? 999));
    const drot = Math.abs(rotY - (this.lastWrittenState.rotY ?? 999));
    const animChanged = anim !== this.lastWrittenState.anim;

    if (!force && dx < 0.02 && dy < 0.02 && dz < 0.02 && drot < 0.03 && !animChanged) {
      return;
    }

    this.lastWriteTime = now;
    this.lastWrittenState = { x, y, z, rotY, anim };

    const stateRef = dbRef(`rooms/${this.roomId}/state/${this.uid}`);
    dbUpdate(stateRef, {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      z: Math.round(z * 100) / 100,
      rotY: Math.round(rotY * 100) / 100,
      anim,
      ts: getServerTimestamp()
    }).catch(() => {});
  }

  // Partner interpolation update in game loop
  updatePartnerInterpolation(delta) {
    if (!this.hasPartnerState) return this.partnerTarget;
    // Smooth exponential lerp
    const t = Math.min(1, delta * 12);
    this.partnerCurrent.x += (this.partnerTarget.x - this.partnerCurrent.x) * t;
    this.partnerCurrent.y += ((this.partnerTarget.y || 0) - (this.partnerCurrent.y || 0)) * t;
    this.partnerCurrent.z += (this.partnerTarget.z - this.partnerCurrent.z) * t;
    
    // Smooth angle lerp (shortest path)
    let diff = this.partnerTarget.rotY - this.partnerCurrent.rotY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.partnerCurrent.rotY += diff * t;
    this.partnerCurrent.anim = this.partnerTarget.anim;

    return this.partnerCurrent;
  }

  // Hand holding toggle
  async setHandHolding(isHolding) {
    if (!this.roomId) return;
    const key = roomService.slot === 1 ? 'p1Holding' : 'p2Holding';
    const handRef = dbRef(`rooms/${this.roomId}/hands/${key}`);
    await dbSet(handRef, isHolding);
  }

  isBothHolding() {
    return Boolean(this.handsData?.p1Holding && this.handsData?.p2Holding);
  }

  // Emoji Reactions (Rate limit: 1 per 600ms)
  async sendReaction(emoji) {
    const now = Date.now();
    if (now - this.lastReactionTime < 600) {
      return false; // Throttled
    }
    this.lastReactionTime = now;

    if (!this.roomId || !this.uid) return false;
    const reactionsRef = dbRef(`rooms/${this.roomId}/reactions`);
    dbPush(reactionsRef, {
      uid: this.uid,
      emoji,
      ts: getServerTimestamp()
    });
    return true;
  }

  onReaction(callback) {
    this.reactionListeners.add(callback);
    return () => this.reactionListeners.delete(callback);
  }

  // Spot claim with transaction to prevent race conditions
  async claimSeat(spotId, seatName) {
    if (!this.roomId || !this.uid) return false;
    const seatRef = dbRef(`rooms/${this.roomId}/spots/${spotId}/occupants/${seatName}`);
    
    const result = await dbRunTransaction(seatRef, (currentVal) => {
      if (currentVal === null || currentVal === undefined || currentVal === this.uid) {
        return this.uid; // Successfully claim seat
      }
      return undefined; // Already occupied, abort transaction
    });

    return result.committed && result.snapshot.val() === this.uid;
  }

  async releaseSeat(spotId, seatName) {
    if (!this.roomId || !this.uid) return;
    const seatRef = dbRef(`rooms/${this.roomId}/spots/${spotId}/occupants/${seatName}`);
    await dbRunTransaction(seatRef, (currentVal) => {
      if (currentVal === this.uid) {
        return null;
      }
      return undefined;
    });
  }

  async updateSpotExtra(spotId, extraData) {
    if (!this.roomId) return;
    // Throttle high-frequency updates (e.g. bike driving physics at 60 FPS) to ~14 Hz to eliminate latency & queue lag
    const now = performance.now();
    this._lastSpotExtraWrite = this._lastSpotExtraWrite || {};
    if (this._lastSpotExtraWrite[spotId] && (now - this._lastSpotExtraWrite[spotId] < 70)) {
      return;
    }
    this._lastSpotExtraWrite[spotId] = now;
    const extraRef = dbRef(`rooms/${this.roomId}/spots/${spotId}/extra`);
    await dbUpdate(extraRef, extraData).catch(() => {});
  }

  // Mini-Game Actions
  async updateTicTacToe(gameState) {
    if (!this.roomId) return;
    const tttRef = dbRef(`rooms/${this.roomId}/games/tictactoe`);
    await dbSet(tttRef, gameState);
  }

  async updateOutfit(outfitState) {
    if (!this.roomId) return;
    const outfitRef = dbRef(`rooms/${this.roomId}/games/outfit`);
    await dbSet(outfitRef, outfitState);
  }

  async setPartnerOutfit(partnerUid, outfit) {
    if (!this.roomId) return;
    const outfitRef = dbRef(`rooms/${this.roomId}/players/${partnerUid}/outfit`);
    await dbSet(outfitRef, outfit);
  }

  cleanup() {
    this.unsubscribers.forEach(u => typeof u === 'function' && u());
    this.unsubscribers = [];
    this.hasPartnerState = false;
    this.processedReactions.clear();
  }
}

export const syncService = new SyncService();
