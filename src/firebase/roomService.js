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

const SAFE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += SAFE_CHARS.charAt(Math.floor(Math.random() * SAFE_CHARS.length));
  }
  return code;
}

export const DEFAULT_OUTFIT_P1 = {
  hat: 'none',
  topColor: '#f472b6',    // Sweet pink
  bottomColor: '#cbd5e1', // Soft denim
  accessory: 'none'
};

export const DEFAULT_OUTFIT_P2 = {
  hat: 'none',
  topColor: '#60a5fa',    // Baby sky blue
  bottomColor: '#94a3b8', // Soft slate
  accessory: 'none'
};

export class RoomService {
  constructor() {
    this.roomId = null;
    this.user = null;
    this.slot = null;
    this.nickname = '';
    this.roomUnsubscribe = null;
    this.partnerSlot = null;
    this.partnerUid = null;
    this.onRoomUpdated = null;
    this.onPartnerLeft = null;
    this.onPartnerJoined = null;
  }

  async initAuth() {
    const cred = await signIn();
    this.user = cred.user || getCurrentUser();
    return this.user;
  }

  async createRoom(nickname = '') {
    await this.initAuth();
    const uid = this.user.uid;
    const cleanNick = (nickname || 'Player 1').slice(0, 12);
    this.nickname = cleanNick;
    this.slot = 1;

    let attempts = 0;
    let roomCode = '';
    let roomRef = null;

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
          online: true,
          lastSeen: getServerTimestamp(),
          outfit: DEFAULT_OUTFIT_P1
        }
      },
      state: {
        [uid]: {
          x: -1.0,
          z: 0,
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
        bike: { occupants: { driver: null, passenger: null }, extra: { x: 4, z: 2, rotY: 0 } },
        swing: { occupants: { seat1: null, seat2: null }, extra: {} },
        teaStall: { occupants: { seat: null }, extra: { cupHolder: null, teaState: 'idle' } }
      }
    };

    await dbSet(roomRef, initialData);
    await this._setupPresence(roomCode, uid);
    this._listenToRoom(roomCode);
    return { roomId: roomCode, slot: 1, uid };
  }

  async joinRoom(roomCode, nickname = '') {
    await this.initAuth();
    const cleanCode = (roomCode || '').toUpperCase().trim();
    if (cleanCode.length !== 5) {
      throw new Error('Please enter a valid 5-character room code.');
    }

    const uid = this.user.uid;
    const cleanNick = (nickname || 'Player 2').slice(0, 12);
    this.nickname = cleanNick;

    const roomRef = dbRef(`rooms/${cleanCode}`);
    const snap = await dbGet(roomRef);

    if (!snap.exists()) {
      throw new Error('Room not found. Please check the code.');
    }

    const roomData = snap.val();
    const players = roomData.players || {};
    const existingPlayerUids = Object.keys(players);

    // If player is already in room (reconnection)
    if (players[uid]) {
      this.roomId = cleanCode;
      this.slot = players[uid].slot;
      await dbUpdate(dbRef(`rooms/${cleanCode}/players/${uid}`), {
        online: true,
        lastSeen: getServerTimestamp()
      });
      await this._setupPresence(cleanCode, uid);
      this._listenToRoom(cleanCode);
      return { roomId: cleanCode, slot: this.slot, uid };
    }

    // Room full check (max 2 players)
    if (existingPlayerUids.length >= 2) {
      throw new Error('This room is full (maximum 2 players).');
    }

    // Assign slot 2 (or 1 if 1 is empty)
    const takenSlots = Object.values(players).map(p => p.slot);
    this.slot = takenSlots.includes(1) ? 2 : 1;
    this.roomId = cleanCode;

    const defaultOutfit = this.slot === 1 ? DEFAULT_OUTFIT_P1 : DEFAULT_OUTFIT_P2;

    const updates = {
      [`players/${uid}`]: {
        slot: this.slot,
        nick: cleanNick,
        online: true,
        lastSeen: getServerTimestamp(),
        outfit: defaultOutfit
      },
      [`state/${uid}`]: {
        x: 1.0,
        z: 0,
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

    // Also clear hand holding on disconnect
    const handKey = this.slot === 1 ? 'p1Holding' : 'p2Holding';
    const handRef = dbRef(`rooms/${roomCode}/hands/${handKey}`);
    const handDisconnect = dbOnDisconnect(handRef);
    await handDisconnect.set(false);

    // Release any seats on disconnect
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

      // Identify partner
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

  async leaveRoom() {
    if (!this.roomId || !this.user) return;
    try {
      await dbUpdate(dbRef(`rooms/${this.roomId}/players/${this.user.uid}`), {
        online: false
      });
      const handKey = this.slot === 1 ? 'p1Holding' : 'p2Holding';
      await dbSet(dbRef(`rooms/${this.roomId}/hands/${handKey}`), false);
    } catch (e) {}

    if (this.roomUnsubscribe) {
      this.roomUnsubscribe();
      this.roomUnsubscribe = null;
    }
    this.roomId = null;
  }
}

export const roomService = new RoomService();
