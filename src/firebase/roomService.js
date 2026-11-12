// Room Management & Presence Service
import {
  dbRef,
  dbSet,
  dbGet,
  dbUpdate,
  dbOnValue,
  dbOff,
  dbOnDisconnect,
  dbRunTransaction,
  getServerTimestamp,
  signIn,
  getCurrentUser
} from './config.js';

// New: Generate exactly 4-digit numeric room codes
export function generateRoomCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const DEFAULT_OUTFIT_P1 = {
  hat: 'none',
  topColor: '#38bdf8',    // Default Boyish/Host color
  bottomColor: '#cbd5e1',
  accessory: 'none'
};

export const DEFAULT_OUTFIT_P2 = {
  hat: 'none',
  topColor: '#f472b6',    // Default Girlish/Partner color
  bottomColor: '#94a3b8',
  accessory: 'none'
};

export class RoomService {
  constructor() {
    this.roomId = null;
    this.user = null;
    this.slot = null;
    this.nickname = '';
    this.gender = 'boy'; // Default
    this.roomUnsubscribe = null;
    this.partnerSlot = null;
    this.partnerUid = null;
    this.onRoomUpdated = null;
  }

  async initAuth() {
    try {
      const cred = await signIn();
      this.user = cred.user || getCurrentUser();
      return this.user;
    } catch (err) {
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found')) {
        throw new Error('Anonymous Auth is not enabled in Firebase.');
      }
      throw err;
    }
  }

  // Updated to accept gender parameter from UI
  async createRoom(nickname = '', gender = 'boy') {
    await this.initAuth();
    const uid = this.user.uid;
    const cleanNick = (nickname || 'Player 1').slice(0, 12);
    this.nickname = cleanNick;
    this.gender = gender;
    this.slot = 1;

    let attempts = 0;
    let roomCode = '';
    let roomRef = null;

    // Try finding an empty 4-digit room code
    while (attempts < 5) {
      roomCode = generateRoomCode();
      roomRef = dbRef(`rooms/${roomCode}`);
      const snap = await dbGet(roomRef);
      if (!snap.exists()) break;
      attempts++;
    }

    this.roomId = roomCode;

    const initialData = {
      meta: {
        createdAt: getServerTimestamp(),
        hostUid: uid,
        status: 'waiting'
      },
      players: {
        [uid]: {
          slot: 1,
          nick: cleanNick,
          gender: gender, // Save chosen gender
          online: true,
          lastSeen: getServerTimestamp(),
          outfit: DEFAULT_OUTFIT_P1
        }
      },
      state: {
        [uid]: {
          x: -0.8,
          z: 4.5,
          rotY: Math.PI / 2,
          anim: 'idle',
          holding: false,
          ts: getServerTimestamp()
        }
      },
      hands: {
        p1Holding: false,
        p2Holding: false
      },
      spots: {
        bike: { occupants: { driver: null, passenger: null }, extra: { x: 8, z: 4, rotY: 0 } },
        swing: { occupants: { seat1: null, seat2: null }, extra: {} },
        teaStall: { occupants: { seat: null }, extra: { cupHolder: null, teaState: 'idle' } }
        // Farming and Pets will be added to spots later in Phase 4
      }
    };

    await dbSet(roomRef, initialData);
    await this._setupPresence(roomCode, uid);
    this._listenToRoom(roomCode);
    return { roomId: roomCode, slot: 1, uid };
  }

  // Updated to accept gender parameter and strict 4-digit numeric validation
  async joinRoom(roomCode, nickname = '', gender = 'boy') {
    await this.initAuth();
    const cleanCode = (roomCode || '').trim();

    // Strict numeric validation
    if (cleanCode.length !== 4 || !/^\d{4}$/.test(cleanCode)) {
      throw new Error('Please enter a valid 4-digit numeric room code.');
    }

    const uid = this.user.uid;
    const cleanNick = (nickname || 'Player 2').slice(0, 12);
    this.nickname = cleanNick;
    this.gender = gender;

    const roomRef = dbRef(`rooms/${cleanCode}`);
    const snap = await dbGet(roomRef);

    if (!snap.exists()) {
      throw new Error('Room not found. Please check the code.');
    }

    const roomData = snap.val();
    const players = roomData.players || {};
    const existingPlayerUids = Object.keys(players);

    if (players[uid]) {
      this.roomId = cleanCode;
      this.slot = players[uid].slot;
      this.gender = gender || players[uid].gender || 'boy';
      await dbUpdate(dbRef(`rooms/${cleanCode}/players/${uid}`), {
        online: true,
        gender: this.gender,
        nick: cleanNick,
        lastSeen: getServerTimestamp()
      });
      await this._setupPresence(cleanCode, uid);
      this._listenToRoom(cleanCode);
      return { roomId: cleanCode, slot: this.slot, uid };
    }

    // Check for offline/abandoned players so rooms never get permanently locked as "full"
    const activePlayerUids = existingPlayerUids.filter(id => {
      const p = players[id];
      if (p.online === false) return false;
      return true;
    });

    if (existingPlayerUids.length >= 2 && activePlayerUids.length >= 2) {
      throw new Error('This room is full (maximum 2 players).');
    }

    // Reuse slot from offline player or unassigned slot
    let assignedSlot = 2;
    if (!players || Object.keys(players).length === 0) {
      assignedSlot = 1;
    } else {
      const takenSlots = Object.entries(players)
        .filter(([id, p]) => p.online !== false || activePlayerUids.includes(id))
        .map(([id, p]) => p.slot);
      assignedSlot = takenSlots.includes(1) ? 2 : 1;
    }
    this.slot = assignedSlot;
    this.roomId = cleanCode;

    const defaultOutfit = this.slot === 1 ? DEFAULT_OUTFIT_P1 : DEFAULT_OUTFIT_P2;

    const updates = {
      [`players/${uid}`]: {
        slot: this.slot,
        nick: cleanNick,
        gender: gender, // Save chosen gender
        online: true,
        lastSeen: getServerTimestamp(),
        outfit: defaultOutfit
      },
      [`state/${uid}`]: {
        x: 0.8,
        z: 4.5,
        rotY: -Math.PI / 2,
        anim: 'idle',
        holding: false,
        ts: getServerTimestamp()
      },
      'meta/status': 'active'
    };

    await dbUpdate(roomRef, updates);
    await this._setupPresence(cleanCode, uid);
    this._listenToRoom(cleanCode);

    return { roomId: cleanCode, slot: this.slot, uid };
  }

  async _setupPresence(roomCode, uid) {
    const playerRef = dbRef(`rooms/${roomCode}/players/${uid}/online`);
    const disconnectHandler = dbOnDisconnect(playerRef);
    await disconnectHandler.set(false);

    const handKey = this.slot === 1 ? 'p1Holding' : 'p2Holding';
    const handRef = dbRef(`rooms/${roomCode}/hands/${handKey}`);
    const handDisconnect = dbOnDisconnect(handRef);
    await handDisconnect.set(false);

    const spotsRef = dbRef(`rooms/${roomCode}/spots`);
    const spotsSnap = await dbGet(spotsRef);
    if (spotsSnap.exists()) {
      const spots = spotsSnap.val();
      for (const [spotId, spot] of Object.entries(spots)) {
        if (spot.occupants) {
          for (const [seatName, occupantUid] of Object.entries(spot.occupants)) {
            if (occupantUid === uid) {
              const seatRef = dbRef(`rooms/${roomCode}/spots/${spotId}/occupants/${seatName}`);
              await dbOnDisconnect(seatRef).set(null);
            }
          }
        }
      }
    }
  }

  _listenToRoom(roomCode) {
    const roomRef = dbRef(`rooms/${roomCode}`);
    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
    }

    this.roomUnsubscribe = dbOnValue(roomRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const players = data.players || {};

      let partnerUid = null;
      let partnerData = null;
      for (const [id, p] of Object.entries(players)) {
        if (id !== this.user.uid) {
          partnerUid = id;
          partnerData = p;
          break;
        }
      }

      this.partnerUid = partnerUid;
      this.partnerSlot = partnerData ? partnerData.slot : null;

      if (this.onRoomUpdated) {
        this.onRoomUpdated(data, partnerData);
      }
    });
  }

  async reconnect() {
    if (!this.roomId || !this.user) return;
    try {
      await dbUpdate(dbRef(`rooms/${this.roomId}/players/${this.user.uid}`), {
        online: true,
        lastSeen: getServerTimestamp()
      });
      await this._setupPresence(this.roomId, this.user.uid);
    } catch (_) { }
  }

  async leaveRoom() {
    if (!this.roomId || !this.user) return;
    try {
      await dbUpdate(dbRef(`rooms/${this.roomId}/players/${this.user.uid}`), {
        online: false
      });
      const handKey = this.slot === 1 ? 'p1Holding' : 'p2Holding';
      await dbSet(dbRef(`rooms/${this.roomId}/hands/${handKey}`), false);
    } catch (e) { }

    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
      this.roomUnsubscribe = null;
    }
    this.roomId = null;
  }
}

export const roomService = new RoomService();
if (typeof window !== 'undefined') {
  window.roomService = roomService;
  window.addEventListener('pagehide', () => {
    if (roomService.roomId && roomService.user) {
      roomService.leaveRoom().catch(() => { });
    }
  });
  window.addEventListener('beforeunload', () => {
    if (roomService.roomId && roomService.user) {
      roomService.leaveRoom().catch(() => { });
    }
  });
}