// Main Application Entry Point & Game Loop Coordinator
import * as THREE from 'three';
import { GameEngine } from './game/engine.js';
import { Town } from './game/town.js';
import { Character } from './game/character.js';
import { BikeSpot } from './game/spots/bike.js';
import { SwingSpot } from './game/spots/swing.js';
import { TeaStallSpot } from './game/spots/teaStall.js';
import { HandHoldingSystem } from './game/hands.js';
import { VirtualJoystick } from './ui/joystick.js';
import { GameHUD } from './ui/hud.js';
import { EmojiSystem } from './ui/emojiTray.js';
import { TicTacToeGame } from './ui/miniGames/ticTacToe.js';
import { OutfitGame } from './ui/miniGames/outfitGame.js';
import { roomService } from './firebase/roomService.js';
import { syncService } from './firebase/syncService.js';
import { soundEngine } from './audio.js';

class App {
  constructor() {
    this.initPWA();
    this.initDOM();
    this.init3D();
    this.initUI();
    this.initFlow();
  }

  // 1. PWA & Mobile Setup
  initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('[SW] Registration failed:', err);
        });
      });
    }

    // Android/Desktop Chrome beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.classList.remove('hidden');
    });

    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (this.deferredInstallPrompt) {
          this.deferredInstallPrompt.prompt();
          await this.deferredInstallPrompt.userChoice;
          this.deferredInstallPrompt = null;
          document.getElementById('pwa-install-banner')?.classList.add('hidden');
        }
      });
    }

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
      document.getElementById('pwa-install-banner')?.classList.add('hidden');
    });

    // iOS Safari Add to Home Screen detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.navigator.standalone === true;
    if (isIOS && !isStandalone) {
      const iosBanner = document.getElementById('ios-install-banner');
      if (iosBanner) iosBanner.classList.remove('hidden');
    }

    document.getElementById('ios-dismiss-btn')?.addEventListener('click', () => {
      document.getElementById('ios-install-banner')?.classList.add('hidden');
    });

    // Request Screen Wake Lock
    this.requestWakeLock();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.requestWakeLock();
      }
    });

    // Attempt landscape lock
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {}
    }
  }

  initDOM() {
    this.screenLanding = document.getElementById('screen-landing');
    this.screenWaiting = document.getElementById('screen-waiting');
    this.landingError = document.getElementById('landing-error');
    this.waitingRoomCode = document.getElementById('waiting-room-code');

    // Check URL parameters for ?room=ABCDE
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
      const roomInput = document.getElementById('landing-room-code');
      if (roomInput) roomInput.value = roomParam.toUpperCase().slice(0, 5);
    }
  }

  init3D() {
    const container = document.getElementById('canvas-container');
    this.engine = new GameEngine(container);
    this.town = new Town(this.engine.scene);

    // Interactive spots
    this.bike = new BikeSpot(this.engine.scene, this.town);
    this.swing = new SwingSpot(this.engine.scene, this.town);
    this.teaStall = new TeaStallSpot(this.engine.scene, this.town);

    // Hands system
    this.handsSystem = new HandHoldingSystem(this.engine.scene);

    // Characters
    this.myChar = null;
    this.partnerChar = null;

    // Local interaction state
    this.currentSpot = null; // null | 'bike_driver' | 'bike_passenger' | 'swing_seat1' | 'swing_seat2' | 'tea_holding' | 'tea_sipping'
  }

  initUI() {
    // Joystick
    const joystickMount = document.getElementById('joystick-mount');
    this.joystick = new VirtualJoystick(joystickMount);

    // HUD
    const uiLayer = document.getElementById('ui-layer');
    this.hud = new GameHUD(uiLayer, {
      onHoldHandsStart: () => {
        syncService.setHandHolding(true);
      },
      onHoldHandsEnd: () => {
        syncService.setHandHolding(false);
      },
      onInteract: (action) => this.handleInteraction(action),
      onToggleEmoji: () => this.emojiSystem.toggle(),
      onOpenGames: (gameType) => {
        if (gameType === 'tictactoe') this.tictactoeGame.open();
        if (gameType === 'outfit') this.outfitGame.open();
      },
      onToggleQuality: () => {
        const next = this.engine.quality === 'high' ? 'low' : 'high';
        this.engine.setQuality(next);
        return next;
      },
      onToggleFullscreen: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      }
    });

    // Emoji System
    this.emojiSystem = new EmojiSystem(uiLayer, (emoji) => {
      return syncService.sendReaction(emoji);
    });

    // Listen to reactions from partner
    syncService.onReaction((r) => {
      const isFromPartner = r.uid !== roomService.user?.uid;
      const targetChar = isFromPartner ? this.partnerChar : this.myChar;
      if (targetChar) {
        const screenPos = this.toScreenPosition(targetChar.group.position);
        this.emojiSystem.spawnFloatingEmoji(r.emoji, screenPos.x, screenPos.y - 60);
      }
    });

    // Mini-Games
    this.tictactoeGame = new TicTacToeGame(uiLayer, syncService, roomService);
    this.outfitGame = new OutfitGame(uiLayer, syncService, roomService, (uid, outfit) => {
      if (uid === roomService.user?.uid && this.myChar) {
        this.myChar.applyOutfit(outfit);
        this.myChar.anim = 'cheer';
        setTimeout(() => { if (this.myChar) this.myChar.anim = 'idle'; }, 2500);
      } else if (this.partnerChar) {
        this.partnerChar.applyOutfit(outfit);
        this.partnerChar.anim = 'cheer';
        setTimeout(() => { if (this.partnerChar) this.partnerChar.anim = 'idle'; }, 2500);
      }
    });

    // Privacy Modal
    const privacyModal = document.getElementById('modal-privacy');
    document.getElementById('btn-open-privacy')?.addEventListener('click', () => {
      privacyModal?.classList.remove('hidden');
    });
    document.getElementById('privacy-close-btn')?.addEventListener('click', () => {
      privacyModal?.classList.add('hidden');
    });
    document.getElementById('privacy-ok-btn')?.addEventListener('click', () => {
      privacyModal?.classList.add('hidden');
    });
  }

  // Convert 3D world coordinate to 2D screen coordinate for UI emojis
  toScreenPosition(worldPos) {
    const v = worldPos.clone();
    v.y += 1.4; // head height
    v.project(this.engine.camera);

    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;

    return {
      x: (v.x * widthHalf) + widthHalf,
      y: -(v.y * heightHalf) + heightHalf
    };
  }

  // 2. Room Flow
  initFlow() {
    const btnCreate = document.getElementById('btn-create-room');
    const btnJoin = document.getElementById('btn-join-room');
    const inputNick = document.getElementById('landing-nickname');
    const inputCode = document.getElementById('landing-room-code');

    btnCreate?.addEventListener('click', async () => {
      try {
        btnCreate.disabled = true;
        this.landingError.textContent = 'Creating room...';
        soundEngine.playPop();

        const nick = inputNick?.value?.trim() || '';
        const res = await roomService.createRoom(nick);
        this.onRoomReady(res.roomId, 1);
      } catch (err) {
        this.landingError.textContent = err.message;
        btnCreate.disabled = false;
      }
    });

    btnJoin?.addEventListener('click', async () => {
      try {
        const code = inputCode?.value?.trim().toUpperCase();
        if (!code || code.length !== 5) {
          this.landingError.textContent = 'Please enter a 5-letter room code.';
          return;
        }
        btnJoin.disabled = true;
        this.landingError.textContent = 'Joining room...';
        soundEngine.playPop();

        const nick = inputNick?.value?.trim() || '';
        const res = await roomService.joinRoom(code, nick);
        this.onRoomReady(res.roomId, res.slot);
      } catch (err) {
        this.landingError.textContent = err.message;
        btnJoin.disabled = false;
      }
    });

    // Waiting Screen Actions
    document.getElementById('waiting-copy-btn')?.addEventListener('click', () => {
      const code = this.waitingRoomCode.textContent;
      navigator.clipboard?.writeText(code).then(() => {
        soundEngine.playPop();
        const btn = document.getElementById('waiting-copy-btn');
        if (btn) btn.textContent = 'Copied!';
        setTimeout(() => { if (btn) btn.textContent = 'Copy Code'; }, 1500);
      });
    });

    document.getElementById('waiting-share-btn')?.addEventListener('click', () => {
      const code = this.waitingRoomCode.textContent;
      const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
      if (navigator.share) {
        navigator.share({ title: 'Our Little Town', text: `Join me in Our Little Town! Room code: ${code}`, url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url).then(() => {
          soundEngine.playPop();
          const btn = document.getElementById('waiting-share-btn');
          if (btn) btn.textContent = 'Link Copied!';
          setTimeout(() => { if (btn) btn.textContent = 'Share Link'; }, 1500);
        });
      }
    });

    document.getElementById('waiting-cancel-btn')?.addEventListener('click', async () => {
      soundEngine.playPop();
      await roomService.leaveRoom();
      window.location.href = window.location.pathname;
    });
  }

  onRoomReady(roomId, slot) {
    this.screenLanding.classList.add('hidden');
    this.hud.setRoomCode(roomId);

    // Instantiate local character
    this.myChar = new Character(slot, roomService.nickname, this.engine.scene);
    this.myChar.isLocal = true;

    if (slot === 1) {
      this.myChar.setPosition(-1.0, 0, Math.PI / 2);
      // Host shows waiting screen until partner connects
      this.waitingRoomCode.textContent = roomId;
      this.screenWaiting.classList.remove('hidden');
      this.hud.setPresence('waiting');
    } else {
      this.myChar.setPosition(1.0, 0, -Math.PI / 2);
      // Guest transitions directly to gameplay
      this.screenWaiting.classList.add('hidden');
      this.hud.setPresence('online');
    }

    // Room update listener
    roomService.onRoomUpdated = (roomData, partnerData) => {
      this.handleRoomUpdate(roomData, partnerData);
    };

    // Start render loop
    this.startLoop();
  }

  handleRoomUpdate(roomData, partnerData) {
    if (!partnerData) {
      this.hud.setPresence('waiting');
      if (this.partnerChar) {
        this.partnerChar.group.visible = false;
      }
      return;
    }

    // Partner is in room
    const isPartnerOnline = partnerData.online !== false;
    this.hud.setPresence(isPartnerOnline ? 'online' : 'offline');

    // Dismiss waiting screen once partner arrives
    if (!this.screenWaiting.classList.contains('hidden')) {
      this.screenWaiting.classList.add('hidden');
      soundEngine.playCheer();
    }

    // Initialize partner character if needed
    if (!this.partnerChar) {
      this.partnerChar = new Character(partnerData.slot, partnerData.nick, this.engine.scene);
      this.partnerChar.applyOutfit(partnerData.outfit);
      // Initialize sync service
      syncService.init(roomService.roomId, roomService.user.uid, roomService.partnerUid);
    }

    this.partnerChar.group.visible = isPartnerOnline;
    if (partnerData.outfit) {
      this.partnerChar.applyOutfit(partnerData.outfit);
    }

    // If partner went offline, release any joined hands or shared bike
    if (!isPartnerOnline) {
      if (this.handsSystem.isConnected) {
        syncService.setHandHolding(false);
      }
      if (this.currentSpot === 'bike_passenger' && !roomData.spots?.bike?.occupants?.driver) {
        this.exitSpot();
      }
    }
  }

  // 3. Main Tick & Input Loop
  startLoop() {
    this.engine.render((delta) => {
      this.onTick(delta);
    });
  }

  onTick(delta) {
    const move = this.joystick.getMovement();
    const myPos = this.myChar ? this.myChar.getPosition() : null;
    const partnerPos = this.partnerChar && this.partnerChar.group.visible ? this.partnerChar.getPosition() : null;

    // 1. Update Partner Interpolation
    if (this.partnerChar && this.partnerChar.group.visible) {
      const interp = syncService.updatePartnerInterpolation(delta);
      this.partnerChar.setPosition(interp.x, interp.z, interp.rotY);
      this.partnerChar.anim = interp.anim || 'idle';
      this.partnerChar.update(delta);
    }

    // 2. Hand Holding Evaluation
    const withinHoldRange = myPos && partnerPos && this.handsSystem.checkProximity(myPos, partnerPos);
    this.hud.showHoldHandsButton(Boolean(withinHoldRange && !this.currentSpot));

    const bothHolding = syncService.isBothHolding();
    const isHandsConnected = this.handsSystem.update(this.myChar, this.partnerChar, bothHolding, delta);
    this.hud.setHandsConnected(isHandsConnected);

    // 3. Movement Execution
    if (this.myChar && !this.currentSpot) {
      let speed = isHandsConnected ? 2.4 : 3.2; // Gentle cooperative pace when holding hands

      if (isHandsConnected && partnerPos) {
        // Tether distance clamp: keep partners side-by-side gracefully
        const dx = myPos.x - partnerPos.x;
        const dz = myPos.z - partnerPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 2.0) {
          // Gently pull closer
          const pullAngle = Math.atan2(dz, dx);
          move.x -= Math.cos(pullAngle) * 0.4;
          move.z -= Math.sin(pullAngle) * 0.4;
        }
      }

      if (move.isMoving) {
        const nextX = myPos.x + move.x * speed * delta;
        const nextZ = myPos.z + move.z * speed * delta;

        // Town collision check
        if (!this.town.checkCollision(nextX, nextZ, 0.35)) {
          this.myChar.setPosition(nextX, nextZ);
        }

        // Face movement direction
        const rotY = Math.atan2(move.x, move.z);
        this.myChar.group.rotation.y = rotY;
        this.myChar.anim = 'walk';
      } else {
        this.myChar.anim = 'idle';
      }

      this.myChar.update(delta);

      // Throttled sync to Firebase (10-15 Hz)
      const cur = this.myChar.getPosition();
      syncService.sendState(cur.x, cur.z, cur.rotY, this.myChar.anim);
    }

    // 4. Update Spots & Riding Physics
    this.bike.frontWheel.rotation.x += delta * 0.5; // subtle idle rotation
    this.swing.update(delta);
    this.teaStall.update(delta);

    // If currently driving bike
    if (this.currentSpot === 'bike_driver') {
      const moved = this.bike.updateMovement(move.x, move.z, delta);
      const seatPos = this.bike.getDriverSeatWorldPos();
      this.myChar.setPosition(seatPos.x, seatPos.z, this.bike.group.rotation.y);
      this.myChar.anim = moved ? 'ride' : 'sit';
      this.myChar.update(delta);

      // Sync bike transform
      syncService.updateSpotExtra('bike', {
        x: this.bike.group.position.x,
        z: this.bike.group.position.z,
        rotY: this.bike.group.rotation.y
      });
      syncService.sendState(seatPos.x, seatPos.z, this.bike.group.rotation.y, this.myChar.anim);
    } else if (this.currentSpot === 'bike_passenger') {
      const seatPos = this.bike.getPassengerSeatWorldPos();
      this.myChar.setPosition(seatPos.x, seatPos.z, this.bike.group.rotation.y);
      this.myChar.anim = 'sit';
      this.myChar.update(delta);
      syncService.sendState(seatPos.x, seatPos.z, this.bike.group.rotation.y, 'sit');
    } else if (this.currentSpot === 'swing_seat1') {
      const seatPos = this.swing.getSeat1WorldPos();
      this.myChar.setPosition(seatPos.x, seatPos.z, this.swing.rotationY);
      this.myChar.anim = 'sit';
      this.myChar.update(delta);
      syncService.sendState(seatPos.x, seatPos.z, this.swing.rotationY, 'sit');
    } else if (this.currentSpot === 'swing_seat2') {
      const seatPos = this.swing.getSeat2WorldPos();
      this.myChar.setPosition(seatPos.x, seatPos.z, this.swing.rotationY);
      this.myChar.anim = 'sit';
      this.myChar.update(delta);
      syncService.sendState(seatPos.x, seatPos.z, this.swing.rotationY, 'sit');
    }

    // If partner is driving bike and I am not, sync bike transform from partner
    if (this.currentSpot !== 'bike_driver' && syncService.spotsData?.bike?.extra) {
      const bex = syncService.spotsData.bike.extra;
      if (bex.x !== undefined && bex.z !== undefined) {
        this.bike.setTransform(bex.x, bex.z, bex.rotY || 0);
      }
    }

    // 5. Contextual Spot Interaction Assessment
    this.updateContextInteraction(myPos);

    // 6. Camera Follow
    if (this.myChar) {
      const targetPos = this.myChar.group.position.clone();
      if (isHandsConnected && this.partnerChar) {
        // Center between both partners
        targetPos.add(this.partnerChar.group.position).multiplyScalar(0.5);
      }
      this.engine.setCameraTarget(targetPos);
    }
  }

  // Evaluate proximity to spots and show relevant context button on HUD
  updateContextInteraction(myPos) {
    if (!myPos) return;

    // If currently occupying a spot, offer "Get off / Leave"
    if (this.currentSpot) {
      this.hud.setInteractAction({
        type: 'exit_spot',
        icon: '🚪',
        label: this.currentSpot.startsWith('bike') ? 'Get Off Bike' : (this.currentSpot.startsWith('swing') ? 'Stand Up' : 'Leave Stall')
      });
      return;
    }

    const spots = syncService.spotsData || {};
    const bikeDist = Math.hypot(myPos.x - this.bike.group.position.x, myPos.z - this.bike.group.position.z);
    const swingDist = Math.hypot(myPos.x - this.swing.position.x, myPos.z - this.swing.position.z);
    const teaDist = Math.hypot(myPos.x - this.teaStall.position.x, myPos.z - (this.teaStall.position.z + 1.2));

    if (bikeDist < 2.2) {
      const driver = spots.bike?.occupants?.driver;
      const passenger = spots.bike?.occupants?.passenger;

      if (!driver) {
        this.hud.setInteractAction({ type: 'bike_drive', icon: '🚲', label: 'Ride Bike' });
        return;
      } else if (!passenger) {
        this.hud.setInteractAction({ type: 'bike_passenger', icon: '🚲', label: 'Sit Behind' });
        return;
      }
    }

    if (swingDist < 2.4) {
      const s1 = spots.swing?.occupants?.seat1;
      const s2 = spots.swing?.occupants?.seat2;
      if (!s1 || !s2) {
        this.hud.setInteractAction({ type: 'swing_sit', icon: '🪁', label: 'Sit on Swing' });
        return;
      }
    }

    if (teaDist < 2.2) {
      const holder = spots.teaStall?.extra?.cupHolder;
      if (!holder) {
        this.hud.setInteractAction({ type: 'tea_pickup', icon: '🍵', label: 'Pick Up Cup' });
        return;
      } else if (holder === roomService.user?.uid) {
        this.hud.setInteractAction({ type: 'tea_sip_pass', icon: '🍵', label: 'Sip & Pass Cup' });
        return;
      }
    }

    // No interactive spot nearby
    this.hud.setInteractAction(null);
  }

  // Handle tap on HUD interact button
  async handleInteraction(action) {
    if (!action) return;

    if (action.type === 'exit_spot') {
      await this.exitSpot();
      return;
    }

    if (action.type === 'bike_drive') {
      const success = await syncService.claimSeat('bike', 'driver');
      if (success) {
        this.currentSpot = 'bike_driver';
        soundEngine.playBell();
      }
    } else if (action.type === 'bike_passenger') {
      const success = await syncService.claimSeat('bike', 'passenger');
      if (success) {
        this.currentSpot = 'bike_passenger';
        soundEngine.playPop();
      }
    } else if (action.type === 'swing_sit') {
      const s1Success = await syncService.claimSeat('swing', 'seat1');
      if (s1Success) {
        this.currentSpot = 'swing_seat1';
        soundEngine.playPop();
      } else {
        const s2Success = await syncService.claimSeat('swing', 'seat2');
        if (s2Success) {
          this.currentSpot = 'swing_seat2';
          soundEngine.playPop();
        }
      }
    } else if (action.type === 'tea_pickup') {
      const success = await syncService.claimSeat('teaStall', 'seat');
      if (success) {
        await syncService.updateSpotExtra('teaStall', { cupHolder: roomService.user.uid, teaState: 'holding' });
        this.teaStall.attachCupToHand(this.myChar.rightHand);
        soundEngine.playPop();
      }
    } else if (action.type === 'tea_sip_pass') {
      soundEngine.playSip();
      // Pass cup to partner
      const partnerUid = roomService.partnerUid;
      if (partnerUid) {
        await syncService.updateSpotExtra('teaStall', { cupHolder: partnerUid, teaState: 'passed' });
        this.teaStall.returnCupToCounter();
        // Spawn cute heart
        const pos = this.toScreenPosition(this.myChar.group.position);
        this.emojiSystem.spawnFloatingEmoji('💖', pos.x, pos.y - 40);
        soundEngine.playHandHold();
      }
    }
  }

  async exitSpot() {
    if (!this.currentSpot) return;
    soundEngine.playPop();

    if (this.currentSpot === 'bike_driver') {
      await syncService.releaseSeat('bike', 'driver');
    } else if (this.currentSpot === 'bike_passenger') {
      await syncService.releaseSeat('bike', 'passenger');
    } else if (this.currentSpot === 'swing_seat1') {
      await syncService.releaseSeat('swing', 'seat1');
    } else if (this.currentSpot === 'swing_seat2') {
      await syncService.releaseSeat('swing', 'seat2');
    } else if (this.currentSpot.startsWith('tea')) {
      await syncService.releaseSeat('teaStall', 'seat');
      await syncService.updateSpotExtra('teaStall', { cupHolder: null, teaState: 'idle' });
      this.teaStall.returnCupToCounter();
    }

    this.currentSpot = null;
    if (this.myChar) {
      this.myChar.anim = 'idle';
      this.myChar.modelRoot.position.y = 0;
    }
  }
}

// Bootstrap on window load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
