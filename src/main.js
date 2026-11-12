// Main Application Entry Point & Game Loop Coordinator
import * as THREE from 'three';
import { GameEngine } from './game/engine.js';
import { Town } from './game/town.js';
import { Character } from './game/character.js';
import { BikeSpot } from './game/spots/bike.js';
import { BuggySpot } from './game/spots/buggy.js';
import { SwingSpot } from './game/spots/swing.js';
import { ParkCanopySwingSpot } from './game/spots/canopySwing.js';
import { TeaStallSpot } from './game/spots/teaStall.js';
import { HelicopterSpot } from './game/spots/helicopter.js';
import { CoupleHouseSpot } from './game/spots/house.js';
import { PlaygroundSpot } from './game/spots/playground.js';
import { TreeChoppingSystem } from './game/spots/treeChopping.js';
import { FarmingSpot } from './game/spots/farming.js';
import { ChairSpotSystem } from './game/spots/chair.js';
import { PetSystem } from './game/pets.js';
import { HandHoldingSystem } from './game/hands.js';
import { VirtualJoystick } from './ui/joystick.js';
import { TouchLookController } from './ui/touchLook.js';
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

  initPWA() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(e => { }));
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredInstallPrompt = e;
      document.getElementById('pwa-install-banner')?.classList.remove('hidden');
    });
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (this.deferredInstallPrompt) {
        this.deferredInstallPrompt.prompt();
        await this.deferredInstallPrompt.userChoice;
        this.deferredInstallPrompt = null;
        document.getElementById('pwa-install-banner')?.classList.add('hidden');
      }
    });
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => document.getElementById('pwa-install-banner')?.classList.add('hidden'));

    this.requestWakeLock();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.requestWakeLock();
        if (roomService.roomId && roomService.user) roomService.reconnect();
      }
    });
    window.addEventListener('online', () => {
      if (roomService.roomId && roomService.user) roomService.reconnect();
    });
  }

  async requestWakeLock() {
    if ('wakeLock' in navigator) try { this.wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { }
  }

  initDOM() {
    this.screenLanding = document.getElementById('screen-landing');
    this.screenWaiting = document.getElementById('screen-waiting');
    this.landingError = document.getElementById('landing-error');
    this.waitingRoomCode = document.getElementById('waiting-room-code');
    const roomParam = new URLSearchParams(window.location.search).get('room');
    if (roomParam) {
      const roomInput = document.getElementById('landing-room-code');
      // FORCE 4-Digit Cleanup from Old URLs
      const cleanedNum = roomParam.replace(/[^0-9]/g, '').slice(0, 4);
      if (roomInput && cleanedNum.length > 0) roomInput.value = cleanedNum;
    }
  }

  init3D() {
    this.engine = new GameEngine(document.getElementById('canvas-container'));
    this.town = new Town(this.engine.scene, this.engine);
    this.bike = new BikeSpot(this.engine.scene, this.town);
    this.buggy = new BuggySpot(this.engine.scene, this.town);
    this.swing = new SwingSpot(this.engine.scene, this.town);
    this.canopySwing = new ParkCanopySwingSpot(this.engine.scene, this.town);
    this.teaStall = new TeaStallSpot(this.engine.scene, this.town);
    this.helicopter = new HelicopterSpot(this.engine.scene, this.town);
    this.coupleHouse = new CoupleHouseSpot(this.engine.scene, this.town);
    this.playground = new PlaygroundSpot(this.engine.scene, this.town);
    this.treeChopping = new TreeChoppingSystem(this.engine.scene, this.town);
    this.farming = new FarmingSpot(this.engine.scene, this.town);
    this.chairSystem = new ChairSpotSystem(this.engine.scene, this.town);
    this.petSystem = new PetSystem(this.engine.scene, this.town);

    // Sync farming changes to network
    this.farming.onPlotChanged = (plotId, state, cropType, growTimer) => {
      syncService.updatePlotState(plotId, state, cropType, growTimer);
    };

    this.isJumping = false;
    this.jumpVelY = 0;
    this.playerY = 0;
    this.heliAscending = false;
    this.heliDescending = false;
    this.hugTimer = 0;
    this.slideProgress = null;
    this.elevatorRide = null;
    this.handsSystem = new HandHoldingSystem(this.engine.scene);
    this.myChar = null;
    this.partnerChar = null;
    this.currentSpot = null;
  }

  initUI() {
    this.joystick = new VirtualJoystick(document.getElementById('joystick-mount'));
    const uiLayer = document.getElementById('ui-layer');
    this.touchLook = new TouchLookController(uiLayer, this.engine);

    this.hud = new GameHUD(uiLayer, {
      onHoldHandsStart: () => syncService.setHandHolding(true),
      onHoldHandsEnd: () => syncService.setHandHolding(false),
      onJump: () => this.handleJump(),
      onHug: () => this.handleHug(),
      onAscendStart: () => { this.heliAscending = true; },
      onAscendEnd: () => { this.heliAscending = false; },
      onDescendStart: () => { this.heliDescending = true; },
      onDescendEnd: () => { this.heliDescending = false; },
      onInteract: (action) => this.handleInteraction(action),
      onToggleSpeed: () => this.handleToggleVehicleSpeed(),
      onToggleEmoji: () => this.emojiSystem.toggle(),
      onOpenGames: (gameType) => {
        if (gameType === 'tictactoe') this.tictactoeGame.open();
        if (gameType === 'outfit') this.outfitGame.open();
      },
      onToggleDayNight: () => {
        // Propose to switch Day/Night to partner
        const targetIsNight = !this.engine.isNight;
        if (!roomService.partnerUid) {
          // Solo mode: Switch immediately
          this.applyDayNightState(targetIsNight);
        } else {
          syncService.proposeDayNight(targetIsNight);
          const label = targetIsNight ? 'Night' : 'Day';
          this.emojiSystem.spawnFloatingReaction(`☀️ Request sent to partner for ${label}!`, window.innerWidth / 2, 100);
        }
      },
      onToggleQuality: () => {
        const next = this.engine.quality === 'high' ? 'low' : 'high';
        this.engine.setQuality(next);
        return next;
      },
      onToggleFullscreen: () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
        else document.exitFullscreen().catch(() => { });
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        if (this.currentSpot === 'heli_pilot') this.heliAscending = true;
        else if (!this.currentSpot) this.handleJump();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') {
        if (this.currentSpot === 'heli_pilot') this.heliDescending = true;
        else if (this.currentSpot === 'bike_driver' || this.currentSpot === 'buggy_driver') this.handleToggleVehicleSpeed();
      } else if (e.code === 'KeyF') {
        if (this.currentSpot === 'bike_driver' || this.currentSpot === 'buggy_driver') this.handleToggleVehicleSpeed();
      } else if (e.code === 'KeyE') {
        if (this.hud && this.hud.interactAction) this.handleInteraction(this.hud.interactAction);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') this.heliAscending = false;
      else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') this.heliDescending = false;
    });

    this.emojiSystem = new EmojiSystem(uiLayer, (payload) => syncService.sendReaction(payload));
    syncService.onReaction((r) => {
      const isMine = (r.uid === roomService.user?.uid);
      const targetChar = !isMine ? this.partnerChar : this.myChar;

      if (targetChar) {
        const screenPos = this.toScreenPosition(targetChar.group.position);
        this.emojiSystem.spawnFloatingReaction(r.emoji, screenPos.x, screenPos.y - 60, r.type);

        if (r.type === 'meme' || r.emoji.startsWith('meme')) {
          soundEngine.playMemeAudio(r.emoji);
        }

        if (r.emoji === '😡' || r.emoji === '😤' || r.emoji === 'I HATE YOU') {
          soundEngine.playAngry();
          targetChar.anim = 'angry';
          setTimeout(() => { if (targetChar && targetChar.anim === 'angry') targetChar.anim = 'idle'; }, 1800);
        } else if (r.emoji === '🫂' || r.emoji === 'COME HERE') {
          this.triggerHugAnimation();
        }
      }
    });

    // Real-Time Listeners for Farming & Pets sync
    syncService.onFarmingUpdated = (farmData) => {
      if (this.farming) this.farming.applySyncState(farmData);
    };

    syncService.onPetsUpdated = (petsData) => {
      if (this.petSystem) this.petSystem.applySyncState(petsData);
    };

    // Environment Day/Night Live Sync & Vote Response Listener
    syncService.onEnvironmentUpdated = (env) => {
      if (env && env.isNight !== undefined) {
        this.applyDayNightState(env.isNight);
      }
    };

    syncService.onDayNightVote = (vote) => {
      if (!vote) {
        if (this.hud) this.hud.hideDayNightVotePrompt();
        return;
      }
      if (vote.status === 'approved') {
        this.applyDayNightState(vote.isNight);
        if (this.hud) this.hud.hideDayNightVotePrompt();
      } else if (vote.status === 'pending' && vote.proposedBy !== roomService.user?.uid) {
        // Prompt this player for approval!
        if (this.hud) {
          this.hud.showDayNightVotePrompt(vote.targetIsNight, () => {
            syncService.respondDayNight(true, vote.targetIsNight);
          }, () => {
            syncService.respondDayNight(false, vote.targetIsNight);
          });
        }
      }
    };

    this.tictactoeGame = new TicTacToeGame(uiLayer, syncService, roomService);
    this.outfitGame = new OutfitGame(uiLayer, syncService, roomService, (uid, outfit) => {
      const char = (uid === roomService.user?.uid) ? this.myChar : this.partnerChar;
      if (char) {
        char.applyOutfit(outfit);
        char.anim = 'cheer';
        setTimeout(() => { if (char) char.anim = 'idle'; }, 2500);
      }
    });

    let lastPromptedLookHash = null;
    const originalOutfitHandler = syncService.onOutfitUpdated;
    syncService.onOutfitUpdated = (outfitState) => {
      if (originalOutfitHandler) originalOutfitHandler(outfitState);
      if (this.outfitGame) this.outfitGame.renderState(outfitState);
      const partnerUid = roomService.partnerUid;
      if (outfitState?.picks && partnerUid && outfitState.picks[partnerUid]) {
        const lookForMe = outfitState.picks[partnerUid];
        const hash = JSON.stringify(lookForMe);
        if (hash !== lastPromptedLookHash) {
          lastPromptedLookHash = hash;
          this.hud.showLookInvite(roomService.partnerNick || 'Partner', lookForMe, async (acceptedLook) => {
            if (this.myChar) {
              this.myChar.applyOutfit(acceptedLook);
              this.myChar.anim = 'cheer';
              setTimeout(() => { if (this.myChar) this.myChar.anim = 'idle'; }, 2500);
            }
            if (roomService.roomId && roomService.user?.uid) syncService.setPartnerOutfit(roomService.user.uid, acceptedLook);
            const pos = this.toScreenPosition(this.myChar.group.position);
            this.emojiSystem.spawnFloatingReaction('✨', pos.x, pos.y - 60);
          }, () => this.outfitGame.open());
        }
      }
    };
  }

  handleToggleVehicleSpeed() {
    let mode = 'normal';
    if (this.currentSpot === 'bike_driver') {
      mode = this.bike.toggleSpeedMode();
      this.hud.showSpeedButton(true, mode);
      soundEngine.playPop();
      const pos = this.toScreenPosition(this.bike.group.position);
      this.emojiSystem.spawnFloatingReaction(mode === 'fast' ? '🚀 Turbo Fast!' : '⚡ Normal Speed', pos.x, pos.y - 70);
    } else if (this.currentSpot === 'buggy_driver') {
      mode = this.buggy.toggleSpeedMode();
      this.hud.showSpeedButton(true, mode);
      soundEngine.playPop();
      const pos = this.toScreenPosition(this.buggy.group.position);
      this.emojiSystem.spawnFloatingReaction(mode === 'fast' ? '🚀 Turbo Fast!' : '⚡ Normal Speed', pos.x, pos.y - 70);
    }
  }

  applyDayNightState(isNight) {
    if (this.engine) this.engine.setDayNight(isNight);
    if (this.town) this.town.setStreetLampsNight(isNight);
    if (this.hud) this.hud.setDayNightState(isNight);
    if (this.myChar) this.myChar.setNightTorch(isNight);
    if (this.partnerChar) this.partnerChar.setNightTorch(isNight);
  }

  toScreenPosition(worldPos) {
    const v = worldPos.clone();
    v.y += 1.4;
    v.project(this.engine.camera);
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;
    return { x: (v.x * widthHalf) + widthHalf, y: -(v.y * heightHalf) + heightHalf };
  }

  initFlow() {
    document.getElementById('btn-create-room')?.addEventListener('click', async () => {
      try {
        const btn = document.getElementById('btn-create-room');
        btn.disabled = true;
        this.landingError.textContent = 'Creating room...';
        soundEngine.playPop();

        // Pass the chosen gender from UI to character
        const genderInput = document.getElementById('landing-gender');
        const selectedGender = genderInput ? genderInput.value : 'boy';

        const res = await roomService.createRoom(document.getElementById('landing-nickname')?.value?.trim() || '', selectedGender);
        this.onRoomReady(res.roomId, 1);
      } catch (err) { this.landingError.textContent = err.message; document.getElementById('btn-create-room').disabled = false; }
    });

    document.getElementById('btn-join-room')?.addEventListener('click', async () => {
      try {
        const code = document.getElementById('landing-room-code')?.value?.trim();
        if (!code || code.length !== 4 || !/^\d{4}$/.test(code)) return this.landingError.textContent = 'Enter a strict 4-digit code.';

        const btn = document.getElementById('btn-join-room');
        btn.disabled = true;
        this.landingError.textContent = 'Joining...';
        soundEngine.playPop();

        const genderInput = document.getElementById('landing-gender');
        const selectedGender = genderInput ? genderInput.value : 'boy';

        const res = await roomService.joinRoom(code, document.getElementById('landing-nickname')?.value?.trim() || '', selectedGender);
        this.onRoomReady(res.roomId, res.slot);
      } catch (err) { this.landingError.textContent = err.message; document.getElementById('btn-join-room').disabled = false; }
    });

    // Waiting Screen Copy, Share & Cancel handlers
    document.getElementById('waiting-copy-btn')?.addEventListener('click', () => {
      const rawCode = this.waitingRoomCode?.textContent?.trim() || '';
      const pureCode = rawCode.replace(/[^0-9]/g, '').slice(0, 4);
      navigator.clipboard?.writeText(pureCode).then(() => {
        const copyBtn = document.getElementById('waiting-copy-btn');
        if (copyBtn) {
          copyBtn.textContent = '✓ Copied ' + pureCode + '!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 1800);
        }
      });
      soundEngine.playPop();
    });

    document.getElementById('waiting-share-btn')?.addEventListener('click', () => {
      const rawCode = this.waitingRoomCode?.textContent?.trim() || '';
      const pureCode = rawCode.replace(/[^0-9]/g, '').slice(0, 4);
      const shareUrl = `${window.location.origin}${window.location.pathname}?room=${pureCode}`;
      if (navigator.share) {
        navigator.share({
          title: 'Our Little Town',
          text: `Join my room in Our Little Town! Room code: ${pureCode}`,
          url: shareUrl
        }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl).then(() => {
          const shareBtn = document.getElementById('waiting-share-btn');
          if (shareBtn) {
            shareBtn.textContent = '✓ Link Copied!';
            setTimeout(() => { shareBtn.textContent = '🔗 Share Link'; }, 1800);
          }
        });
      }
      soundEngine.playPop();
    });

    document.getElementById('waiting-cancel-btn')?.addEventListener('click', () => {
      soundEngine.playPop();
      window.location.href = window.location.origin + window.location.pathname;
    });
  }

  onRoomReady(roomId, slot) {
    this.screenLanding.classList.add('hidden');
    this.hud.setRoomCode(roomId);

    // Inject Gender on Spawn
    this.myChar = new Character(slot, roomService.nickname, this.engine.scene, roomService.gender);
    this.myChar.isLocal = true;

    if (slot === 1) {
      this.myChar.setPosition(-0.8, 4.5, Math.PI / 2);
      this.waitingRoomCode.textContent = roomId;
      this.screenWaiting.classList.remove('hidden');
      this.hud.setPresence('waiting');
    } else {
      this.myChar.setPosition(0.8, 4.5, -Math.PI / 2);
      this.screenWaiting.classList.add('hidden');
      this.hud.setPresence('online');
      document.body.classList.add('in-game');
    }
    roomService.onRoomUpdated = (r, p) => this.handleRoomUpdate(r, p);
    this.engine.render((delta) => this.onTick(delta));
  }

  handleRoomUpdate(roomData, partnerData) {
    if (!partnerData) {
      this.hud.setPresence('waiting');
      if (this.partnerChar) this.partnerChar.group.visible = false;
      return;
    }
    const isOnline = partnerData.online !== false;
    this.hud.setPresence(isOnline ? 'online' : 'offline');
    if (this.partnerChar) this.partnerChar.group.visible = isOnline;
    if (!this.screenWaiting.classList.contains('hidden')) {
      this.screenWaiting.classList.add('hidden');
      document.body.classList.add('in-game');
      soundEngine.playCheer();
    }
    if (!this.partnerChar) {
      // Inject Partner Gender on Spawn
      this.partnerChar = new Character(partnerData.slot, partnerData.nick, this.engine.scene, partnerData.gender || 'boy');
      this.partnerChar.setPosition(partnerData.slot === 1 ? -0.8 : 0.8, 4.5, partnerData.slot === 1 ? Math.PI / 2 : -Math.PI / 2, 0);
      if (this.engine.isNight) this.partnerChar.setNightTorch(true);
      syncService.init(roomService.roomId, roomService.user.uid, roomService.partnerUid);
    }
    if (partnerData.outfit) this.partnerChar.applyOutfit(partnerData.outfit);
    if (!isOnline && this.handsSystem.isConnected) syncService.setHandHolding(false);
  }

  onTick(delta) {
    const move = this.joystick.getMovement(this.engine.getCameraVectors());
    const myPos = this.myChar ? this.myChar.getPosition() : null;
    const partnerPos = this.partnerChar && this.partnerChar.group.visible ? this.partnerChar.getPosition() : null;

    if (this.partnerChar && this.partnerChar.group.visible) {
      const interp = syncService.updatePartnerInterpolation(delta);
      this.partnerChar.setPosition(interp.x, interp.z, interp.rotY, interp.y || 0);
      this.partnerChar.anim = interp.anim || 'idle';
      this.partnerChar.update(delta);
    }

    const withinHoldRange = myPos && partnerPos && this.handsSystem.checkProximity(myPos, partnerPos);
    this.hud.showHoldHandsButton(Boolean(withinHoldRange && !this.currentSpot));
    const isHandsConnected = this.handsSystem.update(this.myChar, this.partnerChar, syncService.isBothHolding(), delta);
    this.hud.setHandsConnected(isHandsConnected);

    if (this.isJumping) {
      this.jumpVelY -= 15.0 * delta;
      this.playerY += this.jumpVelY * delta;

      const houseX = this.coupleHouse.position.x;
      const houseZ = this.coupleHouse.position.z;
      const isOverHouse = (myPos && myPos.x > houseX - 5 && myPos.x < houseX + 5 && myPos.z > houseZ - 5 && myPos.z < houseZ + 5);
      const floorLevel = (isOverHouse && this.playerY >= 2.8) ? 2.8 : 0;

      if (this.playerY <= floorLevel) {
        this.playerY = floorLevel;
        this.jumpVelY = 0;
        this.isJumping = false;
      }
    }

    if (this.hugTimer > 0) {
      this.hugTimer -= delta;
      if (this.myChar) this.myChar.anim = 'hug';
      if (this.partnerChar) this.partnerChar.anim = 'hug';
    }

    if (this.elevatorRide) {
      this.elevatorRide.elapsed += delta;
      const t = Math.min(1, this.elevatorRide.elapsed / this.elevatorRide.duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.playerY = THREE.MathUtils.lerp(this.elevatorRide.startY, this.elevatorRide.targetY, ease);
      this.coupleHouse.setElevatorY(this.playerY + 0.25);
      this.myChar.setPosition(this.elevatorRide.x, this.elevatorRide.z, undefined, this.playerY);
      this.myChar.anim = 'idle';
      this.myChar.update(delta);
      syncService.sendState(this.elevatorRide.x, this.elevatorRide.z, this.myChar.group.rotation.y, 'idle', false, this.playerY);
      syncService.updateSpotExtra('coupleHouse', { isLightOn: this.coupleHouse.isLightOn, elevatorY: this.playerY + 0.25, elevatorMoving: t < 1 });

      if (t >= 1) {
        this.playerY = this.elevatorRide.targetY;
        this.elevatorRide = null;
        soundEngine.playBell();
      }
    } else if (this.myChar && !this.currentSpot) {
      let speed = isHandsConnected ? 2.6 : 3.8;
      if (isHandsConnected && partnerPos) {
        const dx = myPos.x - partnerPos.x, dz = myPos.z - partnerPos.z;
        if (Math.hypot(dx, dz) > 1.8) {
          const pAngle = Math.atan2(dz, dx);
          move.x -= Math.cos(pAngle) * 0.35;
          move.z -= Math.sin(pAngle) * 0.35;
        }
      }
      if (move.isMoving) {
        const nextX = myPos.x + move.x * speed * delta;
        const nextZ = myPos.z + move.z * speed * delta;
        if (!this.town.checkCollision(nextX, nextZ, 0.35)) this.myChar.setPosition(nextX, nextZ, undefined, this.playerY);
        else this.myChar.group.position.y = this.playerY;

        let diff = Math.atan2(move.x, move.z) - this.myChar.group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.myChar.group.rotation.y += diff * Math.min(1, delta * 14);

        if (this.isJumping) this.myChar.anim = 'jump';
        else if (this.hugTimer <= 0) this.myChar.anim = 'walk';
      } else {
        this.myChar.group.position.y = this.playerY;
        if (this.hugTimer > 0) this.myChar.anim = 'hug';
        else if (this.isJumping) this.myChar.anim = 'jump';
        else this.myChar.anim = 'idle';
      }
      this.myChar.update(delta);
      const cur = this.myChar.getPosition();
      syncService.sendState(cur.x, cur.z, cur.rotY, this.myChar.anim, false, this.playerY);
    }

    this.swing.update(delta);
    this.canopySwing.update(delta, Boolean(syncService.spotsData?.canopySwing?.occupants?.seat1 || syncService.spotsData?.canopySwing?.occupants?.seat2));
    this.teaStall.update(delta);
    this.helicopter.update(delta, this.currentSpot === 'heli_pilot');
    this.coupleHouse.update(delta, this.currentSpot === 'bed_left' || this.currentSpot === 'bed_right');
    this.playground.update(delta);
    this.treeChopping.update(delta);
    this.farming.update(delta);
    if (this.petSystem) {
      this.petSystem.update(delta, this.myChar, this.partnerChar, roomService.user?.uid, roomService.partnerUid);
    }
    this.hud.setWoodCount(this.treeChopping.woodInventory);
    this.hud.setCropCount(this.farming.cropInventory);

    if (this.currentSpot === 'heli_pilot') {
      this.helicopter.isFlying = true;
      if (this.heliAscending) this.helicopter.altitude = Math.min(26.0, this.helicopter.altitude + 7.5 * delta);
      else if (this.heliDescending) this.helicopter.altitude = Math.max(0, this.helicopter.altitude - 7.5 * delta);
      if (move.isMoving) {
        this.helicopter.group.position.x += move.x * 11.0 * delta;
        this.helicopter.group.position.z += move.z * 11.0 * delta;
        let diff = Math.atan2(move.x, move.z) - this.helicopter.group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.helicopter.group.rotation.y += diff * Math.min(1, delta * 8);
        this.helicopter.pitch = -0.16;
        this.helicopter.roll = Math.sin(diff) * 0.2;
      } else { this.helicopter.pitch = 0; this.helicopter.roll = 0; }
      this.helicopter.group.position.y = this.helicopter.altitude;
      const seat = this.helicopter.getPilotSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.helicopter.group.rotation.y, seat.y - 0.28);
      this.myChar.anim = 'ride';
      this.myChar.update(delta);
      syncService.updateSpotExtra('helicopter', { x: this.helicopter.group.position.x, y: this.helicopter.altitude, z: this.helicopter.group.position.z, rotY: this.helicopter.group.rotation.y, pitch: this.helicopter.pitch, roll: this.helicopter.roll });
      syncService.sendState(seat.x, seat.z, this.helicopter.group.rotation.y, 'ride', false, seat.y - 0.28);
    } else if (this.currentSpot === 'heli_passenger') {
      const seat = this.helicopter.getPassengerSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.helicopter.group.rotation.y, seat.y - 0.28);
      this.myChar.anim = 'passenger';
      this.myChar.update(delta);
      syncService.sendState(seat.x, seat.z, this.helicopter.group.rotation.y, 'passenger', false, seat.y - 0.28);
    } else if (this.currentSpot === 'bike_driver') {
      this.bike.updateMovement(move.x, move.z, delta);
      const seat = this.bike.getDriverSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.bike.group.rotation.y, seat.y - 0.28);
      this.myChar.anim = 'ride';
      this.myChar.update(delta);
      syncService.updateSpotExtra('bike', { x: this.bike.group.position.x, z: this.bike.group.position.z, rotY: this.bike.group.rotation.y });
      syncService.sendState(seat.x, seat.z, this.bike.group.rotation.y, 'ride', false, seat.y - 0.28);
    } else if (this.currentSpot === 'bike_passenger') {
      const seat = this.bike.getPassengerSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.bike.group.rotation.y, seat.y - 0.28);
      this.myChar.anim = 'passenger';
      this.myChar.update(delta);
      syncService.sendState(seat.x, seat.z, this.bike.group.rotation.y, 'passenger', false, seat.y - 0.28);
    } else if (this.currentSpot === 'buggy_driver') {
      this.buggy.updateMovement(move.x, move.z, delta);
      const seat = this.buggy.getDriverSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.buggy.group.rotation.y, seat.y - 0.24);
      this.myChar.anim = 'ride';
      this.myChar.update(delta);
      syncService.updateSpotExtra('buggy', { x: this.buggy.group.position.x, z: this.buggy.group.position.z, rotY: this.buggy.group.rotation.y });
      syncService.sendState(seat.x, seat.z, this.buggy.group.rotation.y, 'ride', false, seat.y - 0.24);
    } else if (this.currentSpot === 'buggy_passenger') {
      const seat = this.buggy.getPassengerSeatWorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.buggy.group.rotation.y, seat.y - 0.24);
      this.myChar.anim = 'passenger';
      this.myChar.update(delta);
      syncService.sendState(seat.x, seat.z, this.buggy.group.rotation.y, 'passenger', false, seat.y - 0.24);
    } else if (this.currentSpot === 'canopy_seat1' || this.currentSpot === 'canopy_seat2') {
      const seat = this.currentSpot === 'canopy_seat1' ? this.canopySwing.getSeat1WorldPos() : this.canopySwing.getSeat2WorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.canopySwing.rotationY, seat.y - 0.05);
      this.myChar.anim = 'swing';
      this.myChar.update(delta);
      syncService.sendState(seat.x, seat.z, this.canopySwing.rotationY, 'swing', false, seat.y - 0.05);
    } else if (this.currentSpot === 'swing_1' || this.currentSpot === 'swing_2') {
      const seat = this.currentSpot === 'swing_1' ? this.swing.getSeat1WorldPos() : this.swing.getSeat2WorldPos();
      this.myChar.setPosition(seat.x, seat.z, this.swing.rotationY, seat.y + 0.08);
      this.myChar.anim = 'swing';
      this.myChar.update(delta);
      syncService.sendState(seat.x, seat.z, this.swing.rotationY, 'swing', false, seat.y + 0.08);
    } else if (this.currentSpot?.startsWith('bench_')) {
      const isLeft = this.currentSpot.endsWith('_left');
      const benchId = this.currentSpot.replace(/^bench_/, '').replace(/_(left|right)$/, '');
      const bench = this.chairSystem.getBenchById(benchId);
      if (bench) {
        const seat = this.chairSystem.getSeatWorldPos(bench, isLeft);
        this.myChar.setPosition(seat.x, seat.z, bench.rotationY, seat.y - 0.05);
        this.myChar.anim = 'sit';
        this.myChar.update(delta);
        syncService.sendState(seat.x, seat.z, bench.rotationY, 'sit', false, seat.y - 0.05);
      }
    } else if (this.currentSpot === 'playground_slide') {
      this.slideProgress = (this.slideProgress || 0) + delta * 0.7;
      const slidePos = this.playground.getSlideWorldPos(this.slideProgress);
      this.myChar.setPosition(slidePos.x, slidePos.z, this.playground.rotationY, slidePos.y);
      this.myChar.anim = 'slide';
      this.myChar.update(delta);
      if (this.slideProgress >= 1.0) {
        soundEngine.playCheer();
        const bot = this.playground.getSlideBottomPos();
        this.myChar.setPosition(bot.x, bot.z, this.playground.rotationY, 0);
        this.myChar.anim = 'idle';
        this.currentSpot = null;
        this.slideProgress = null;
      }
    } else if (this.currentSpot === 'bed_left' || this.currentSpot === 'bed_right') {
      const pos = this.coupleHouse.getBedWorldPosition(this.currentSpot === 'bed_left' ? 'left' : 'right');
      this.myChar.setPosition(pos.x, pos.z, this.coupleHouse.rotationY, pos.y);
      this.myChar.anim = 'sleep';
      this.myChar.update(delta);
      syncService.sendState(pos.x, pos.z, this.coupleHouse.rotationY, 'sleep', false, pos.y);
    }

    if (this.currentSpot !== 'heli_pilot' && syncService.spotsData?.helicopter?.extra) {
      const hex = syncService.spotsData.helicopter.extra;
      if (hex.x !== undefined) this.helicopter.setTransform(hex.x, hex.y || 0, hex.z, hex.rotY || 0, hex.pitch || 0, hex.roll || 0);
    }

    if (this.currentSpot !== 'bike_driver' && syncService.spotsData?.bike?.extra) {
      const bx = syncService.spotsData.bike.extra;
      if (bx.x !== undefined && bx.z !== undefined) this.bike.setTransform(bx.x, bx.z, bx.rotY || 0);
    }

    if (this.currentSpot !== 'buggy_driver' && syncService.spotsData?.buggy?.extra) {
      const bg = syncService.spotsData.buggy.extra;
      if (bg.x !== undefined && bg.z !== undefined) this.buggy.setTransform(bg.x, bg.z, bg.rotY || 0);
    }

    if (syncService.spotsData?.coupleHouse?.extra) {
      const houseExtra = syncService.spotsData.coupleHouse.extra;
      if (houseExtra.isLightOn !== undefined && houseExtra.isLightOn !== this.coupleHouse.isLightOn) {
        this.coupleHouse.setLightState(houseExtra.isLightOn);
      }
      if (!this.elevatorRide && houseExtra.elevatorY !== undefined) {
        this.coupleHouse.setElevatorY(houseExtra.elevatorY);
      }
    }

    this.updateContextInteraction(myPos);

    if (this.myChar) {
      this.engine.setCharacterFacing(this.myChar.group.rotation.y);
      this.engine.setCameraTarget(this.myChar.group.position.clone());
    }
  }

  handleJump() {
    if (this.currentSpot || this.isJumping) return;
    this.isJumping = true;
    this.jumpVelY = 5.2;
    soundEngine.playPop();
  }

  handleHug() {
    if (this.currentSpot) return;
    this.triggerHugAnimation();
    syncService.sendReaction('🫂');
  }

  triggerHugAnimation() {
    this.hugTimer = 2.8;
    if (this.myChar) this.myChar.anim = 'hug';
    if (this.partnerChar) this.partnerChar.anim = 'hug';
    soundEngine.playHugChime();
    if (this.myChar) {
      const pos = this.toScreenPosition(this.myChar.group.position);
      for (let i = 0; i < 3; i++) setTimeout(() => this.emojiSystem.spawnFloatingReaction('💖', pos.x + (Math.random() - 0.5) * 50, pos.y - 60 - i * 18), i * 200);
    }
  }

  updateContextInteraction(myPos) {
    if (!myPos) return;
    const partnerPos = this.partnerChar && this.partnerChar.group.visible ? this.partnerChar.getPosition() : null;
    this.hud.showHugButton(Boolean(partnerPos && Math.hypot(myPos.x - partnerPos.x, myPos.z - partnerPos.z) < 2.4 && !this.currentSpot));
    this.hud.showFlightControls(this.currentSpot === 'heli_pilot');

    if (this.currentSpot) {
      let icon = '🚪', label = 'Leave Spot';
      if (this.currentSpot === 'heli_pilot' || this.currentSpot === 'heli_passenger') { icon = '🚁'; label = 'Exit Helicopter'; }
      else if (this.currentSpot === 'bike_driver' || this.currentSpot === 'bike_passenger') { icon = '🛵'; label = 'Dismount Scooter'; }
      else if (this.currentSpot === 'buggy_driver' || this.currentSpot === 'buggy_passenger') { icon = '🚙'; label = 'Exit Buggy'; }
      else if (this.currentSpot.startsWith('canopy_')) { icon = '🌸'; label = 'Leave Canopy Swing'; }
      else if (this.currentSpot.startsWith('swing')) { icon = '🎠'; label = 'Get Off Swing'; }
      else if (this.currentSpot.startsWith('bench')) { icon = '🧍'; label = 'Stand Up'; }
      else if (this.currentSpot.startsWith('bed_')) { icon = '☀️'; label = 'Wake Up'; }
      this.hud.setInteractAction({ type: 'exit_spot', icon, label });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    if (this.elevatorRide) {
      this.hud.setInteractAction({ type: 'riding_elevator', icon: '🛗', label: 'Elevator Moving...' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    const switchPos = this.coupleHouse.getLightSwitchWorldPos();
    if (Math.hypot(myPos.x - switchPos.x, myPos.z - switchPos.z) < 2.2) {
      this.hud.setInteractAction({ type: 'toggle_light', icon: '💡', label: 'Toggle Lights' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }
    const elevatorBotPos = this.coupleHouse.getElevatorBottomWorldPos();
    if (Math.hypot(myPos.x - elevatorBotPos.x, myPos.z - elevatorBotPos.z) < 2.0 && this.playerY < 1) {
      this.hud.setInteractAction({ type: 'elevator_up', icon: '🛗', label: 'Take Elevator Up' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }
    const elevatorTopPos = this.coupleHouse.getElevatorTopWorldPos();
    if (Math.hypot(myPos.x - elevatorTopPos.x, myPos.z - elevatorTopPos.z) < 2.0 && this.playerY > 2) {
      this.hud.setInteractAction({ type: 'elevator_down', icon: '🛗', label: 'Take Elevator Down' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    const bedLPos = this.coupleHouse.getBedWorldPosition('left');
    const bedRPos = this.coupleHouse.getBedWorldPosition('right');
    if (Math.hypot(myPos.x - bedLPos.x, myPos.z - bedLPos.z) < 2.0) {
      this.hud.setInteractAction({ type: 'sleep_bed_left', icon: '💤', label: 'Sleep in Bed' });
      this.hud.setSecondaryInteractAction(null);
      return;
    } else if (Math.hypot(myPos.x - bedRPos.x, myPos.z - bedRPos.z) < 2.0) {
      this.hud.setInteractAction({ type: 'sleep_bed_right', icon: '💤', label: 'Sleep in Bed' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    const heliDist = Math.hypot(myPos.x - this.helicopter.group.position.x, myPos.z - this.helicopter.group.position.z);
    if (heliDist < 3.8) {
      const occ = syncService.spotsData?.helicopter?.occupants || {};
      if (!occ.driver) {
        this.hud.setInteractAction({ type: 'heli_pilot', icon: '🚁', label: 'Fly Helicopter' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!occ.passenger) {
        this.hud.setInteractAction({ type: 'heli_passenger', icon: '🚁', label: 'Ride as Passenger' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    const bikeDist = Math.hypot(myPos.x - this.bike.group.position.x, myPos.z - this.bike.group.position.z);
    if (bikeDist < 3.2) {
      const occ = syncService.spotsData?.bike?.occupants || {};
      if (!occ.driver) {
        this.hud.setInteractAction({ type: 'bike_drive', icon: '🛵', label: 'Drive Scooter' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!occ.passenger) {
        this.hud.setInteractAction({ type: 'bike_passenger', icon: '🛵', label: 'Ride Behind Partner' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    // Buggy Vehicle Spot (2 Seats)
    const buggyDist = Math.hypot(myPos.x - this.buggy.group.position.x, myPos.z - this.buggy.group.position.z);
    if (buggyDist < 3.2) {
      const occ = syncService.spotsData?.buggy?.occupants || {};
      if (!occ.driver) {
        this.hud.setInteractAction({ type: 'buggy_drive', icon: '🚙', label: 'Drive Buggy' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!occ.passenger) {
        this.hud.setInteractAction({ type: 'buggy_passenger', icon: '🚙', label: 'Ride with Partner 💕' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    // Canopy Romantic Swing Spot (2 Seats)
    const canopyDist = Math.hypot(myPos.x - this.canopySwing.position.x, myPos.z - this.canopySwing.position.z);
    if (canopyDist < 3.0) {
      const occ = syncService.spotsData?.canopySwing?.occupants || {};
      if (!occ.seat1) {
        this.hud.setInteractAction({ type: 'canopy_1', icon: '🌸', label: 'Sit on Canopy Swing' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!occ.seat2) {
        this.hud.setInteractAction({ type: 'canopy_2', icon: '🌸', label: 'Sit with Partner 💕' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    const swingDist = Math.hypot(myPos.x - this.swing.position.x, myPos.z - this.swing.position.z);
    if (swingDist < 2.8) {
      const occ = syncService.spotsData?.swing?.occupants || {};
      if (!occ.seat1) {
        this.hud.setInteractAction({ type: 'swing_1', icon: '🎠', label: 'Ride Swing' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!occ.seat2) {
        this.hud.setInteractAction({ type: 'swing_2', icon: '🎠', label: 'Ride Swing' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    const nearBench = this.chairSystem.getNearestBench(myPos, 2.4);
    if (nearBench) {
      const occ = syncService.spotsData?.[nearBench.id]?.occupants || {};
      const leftOccupied = Boolean(occ.left);
      const rightOccupied = Boolean(occ.right);

      if (!leftOccupied && !rightOccupied) {
        const myPreferredSide = (roomService.slot === 2) ? 'right' : 'left';
        this.hud.setInteractAction({ type: 'sit_bench', bench: nearBench, side: myPreferredSide, icon: '🪑', label: 'Sit on Bench' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (leftOccupied && !rightOccupied) {
        this.hud.setInteractAction({ type: 'sit_bench', bench: nearBench, side: 'right', icon: '🪑', label: 'Sit Beside Partner 💕' });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (!leftOccupied && rightOccupied) {
        this.hud.setInteractAction({ type: 'sit_bench', bench: nearBench, side: 'left', icon: '🪑', label: 'Sit Beside Partner 💕' });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    const slideDist = Math.hypot(myPos.x - (this.playground.position.x - 4.0), myPos.z - this.playground.position.z);
    if (slideDist < 3.2) {
      this.hud.setInteractAction({ type: 'playground_slide', icon: '🛝', label: 'Slide Down!' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    const farmPlot = this.farming.getNearestPlot(myPos, 2.5);
    if (farmPlot) {
      let icon = '🌱', label = 'Till Soil';
      if (farmPlot.state === 'tilled') { icon = '🌾'; label = 'Plant Seed'; }
      else if (farmPlot.state === 'seeded') { icon = '💧'; label = 'Water Crop'; }
      else if (farmPlot.state === 'ready') { icon = '✨'; label = 'Harvest Crop!'; }
      else if (farmPlot.state === 'growing') { icon = '⏳'; label = 'Growing...'; }
      this.hud.setInteractAction({ type: 'farm_plot', plot: farmPlot, icon, label });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    const nTree = this.treeChopping.getNearestTree(myPos, 2.5);
    if (nTree) {
      this.hud.setInteractAction({ type: 'chop_tree', tree: nTree, icon: '🪓', label: `Chop Tree (${nTree.health}/3)` });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    // 8.5 CUTE PET TAMING & PETTING
    const nPet = this.petSystem.getNearestPet(myPos, 2.4);
    if (nPet) {
      if (!nPet.tamedBy) {
        this.hud.setInteractAction({ type: 'tame_pet', pet: nPet, icon: '🐾', label: `Tame ${nPet.name}!` });
        this.hud.setSecondaryInteractAction(null);
        return;
      } else if (nPet.tamedBy === roomService.user?.uid) {
        this.hud.setInteractAction({ type: 'pet_animal', pet: nPet, icon: '💖', label: `Pet ${nPet.name} 🥰` });
        this.hud.setSecondaryInteractAction({ type: 'untame_pet', pet: nPet, icon: '🔓', label: `Untame ${nPet.name}` });
        return;
      } else {
        this.hud.setInteractAction({ type: 'pet_animal', pet: nPet, icon: '👋', label: `Say Hi to ${nPet.name}` });
        this.hud.setSecondaryInteractAction(null);
        return;
      }
    }

    const stallDist = Math.hypot(myPos.x - this.teaStall.position.x, myPos.z - this.teaStall.position.z);
    if (stallDist < 2.6) {
      this.hud.setInteractAction({ type: 'tea_cup', icon: '🍵', label: this.myChar.isHoldingCup ? 'Finish Tea' : 'Drink Warm Chai' });
      this.hud.setSecondaryInteractAction(null);
      return;
    }

    this.hud.setInteractAction(null);
    this.hud.setSecondaryInteractAction(null);
  }

  async handleInteraction(action) {
    if (!action) return;
    if (action.type === 'exit_spot') { await this.exitSpot(); return; }

    if (action.type === 'toggle_light') {
      const newState = this.coupleHouse.toggleLight();
      soundEngine.playPop();
      syncService.updateSpotExtra('coupleHouse', {
        isLightOn: newState,
        elevatorY: this.coupleHouse.elevatorCabin ? this.coupleHouse.elevatorCabin.position.y : 0.25
      });
    }
    else if (action.type === 'elevator_up') {
      if (this.elevatorRide) return;
      const botPos = this.coupleHouse.getElevatorBottomWorldPos();
      this.elevatorRide = { startY: 0, targetY: 2.9, duration: 1.2, elapsed: 0, x: botPos.x, z: botPos.z };
      this.myChar.setPosition(botPos.x, botPos.z, undefined, this.playerY);
      soundEngine.playElevator(true);
      syncService.updateSpotExtra('coupleHouse', { isLightOn: this.coupleHouse.isLightOn, elevatorY: 0.25, elevatorMoving: true });
    }
    else if (action.type === 'elevator_down') {
      if (this.elevatorRide) return;
      const topPos = this.coupleHouse.getElevatorTopWorldPos();
      this.elevatorRide = { startY: 2.9, targetY: 0, duration: 1.2, elapsed: 0, x: topPos.x, z: topPos.z };
      this.myChar.setPosition(topPos.x, topPos.z, undefined, this.playerY);
      soundEngine.playElevator(false);
      syncService.updateSpotExtra('coupleHouse', { isLightOn: this.coupleHouse.isLightOn, elevatorY: 3.2, elevatorMoving: true });
    }
    else if (action.type === 'heli_pilot') {
      if (await syncService.claimSeat('helicopter', 'driver')) { this.currentSpot = 'heli_pilot'; soundEngine.playHelicopter(); }
    }
    else if (action.type === 'heli_passenger') {
      if (await syncService.claimSeat('helicopter', 'passenger')) { this.currentSpot = 'heli_passenger'; soundEngine.playHelicopter(); }
    }
    else if (action.type === 'bike_drive') {
      if (await syncService.claimSeat('bike', 'driver')) {
        this.currentSpot = 'bike_driver';
        this.hud.showSpeedButton(true, this.bike.speedMode);
        soundEngine.playBell();
      }
    }
    else if (action.type === 'bike_passenger') {
      if (await syncService.claimSeat('bike', 'passenger')) { this.currentSpot = 'bike_passenger'; soundEngine.playPop(); }
    }
    else if (action.type === 'buggy_drive') {
      if (await syncService.claimSeat('buggy', 'driver')) {
        this.currentSpot = 'buggy_driver';
        this.hud.showSpeedButton(true, this.buggy.speedMode);
        soundEngine.playPop();
      }
    }
    else if (action.type === 'buggy_passenger') {
      if (await syncService.claimSeat('buggy', 'passenger')) { this.currentSpot = 'buggy_passenger'; soundEngine.playPop(); }
    }
    else if (action.type === 'canopy_1') {
      if (await syncService.claimSeat('canopySwing', 'seat1')) { this.currentSpot = 'canopy_seat1'; soundEngine.playPop(); }
    }
    else if (action.type === 'canopy_2') {
      if (await syncService.claimSeat('canopySwing', 'seat2')) { this.currentSpot = 'canopy_seat2'; soundEngine.playPop(); }
    }
    else if (action.type === 'swing_1') {
      if (await syncService.claimSeat('swing', 'seat1')) { this.currentSpot = 'swing_1'; soundEngine.playPop(); }
    }
    else if (action.type === 'swing_2') {
      if (await syncService.claimSeat('swing', 'seat2')) { this.currentSpot = 'swing_2'; soundEngine.playPop(); }
    }
    else if (action.type === 'sit_bench') {
      const side = action.side || (roomService.slot === 2 ? 'right' : 'left');
      if (await syncService.claimSeat(action.bench.id, side)) { this.currentSpot = `bench_${action.bench.id}_${side}`; soundEngine.playPop(); }
    }
    else if (action.type === 'sleep_bed_left') { this.currentSpot = 'bed_left'; soundEngine.playSleep(); }
    else if (action.type === 'sleep_bed_right') { this.currentSpot = 'bed_right'; soundEngine.playSleep(); }
    else if (action.type === 'playground_slide') { this.currentSpot = 'playground_slide'; this.slideProgress = 0; soundEngine.playPop(); }
    else if (action.type === 'chop_tree') {
      this.myChar.anim = 'chop'; this.treeChopping.chop(action.tree); this.hud.setWoodCount(this.treeChopping.woodInventory);
      setTimeout(() => { if (this.myChar && this.myChar.anim === 'chop') this.myChar.anim = 'idle'; }, 750);
    }
    else if (action.type === 'farm_plot') {
      this.myChar.anim = 'farm';
      const result = this.farming.interact(action.plot);
      if (result?.type === 'seeded') soundEngine.playPlantSeed();
      else if (result?.type === 'watered') soundEngine.playWaterCrop();
      else if (result?.type === 'harvested') soundEngine.playHarvest();
      else soundEngine.playPop();
      this.hud.setCropCount(this.farming.cropInventory);
      setTimeout(() => { if (this.myChar && this.myChar.anim === 'farm') this.myChar.anim = 'idle'; }, 850);
    }
    else if (action.type === 'tea_cup') {
      this.myChar.isHoldingCup = !this.myChar.isHoldingCup;
      if (this.myChar.isHoldingCup) soundEngine.playSip();
      else soundEngine.playPop();
    }
    else if (action.type === 'tame_pet') {
      this.myChar.anim = 'cheer';
      this.petSystem.tamePet(action.pet, roomService.user?.uid, roomService.nickname);
      syncService.tamePetSync(action.pet.id, roomService.nickname);
      const pos = this.toScreenPosition(this.myChar.group.position);
      this.emojiSystem.spawnFloatingReaction('💖', pos.x, pos.y - 60);
      setTimeout(() => { if (this.myChar) this.myChar.anim = 'idle'; }, 1500);
    }
    else if (action.type === 'pet_animal') {
      this.myChar.anim = 'cheer';
      soundEngine.playPop();
      const pos = this.toScreenPosition(action.pet.group.position);
      this.emojiSystem.spawnFloatingReaction('✨', pos.x, pos.y - 40);
      setTimeout(() => { if (this.myChar) this.myChar.anim = 'idle'; }, 1200);
    }
    else if (action.type === 'untame_pet') {
      this.petSystem.untamePet(action.pet);
      syncService.untamePetSync(action.pet.id);
      const pos = this.toScreenPosition(action.pet.group.position);
      this.emojiSystem.spawnFloatingReaction('💨 Bye!', pos.x, pos.y - 40);
      if (this.hud) this.hud.setSecondaryInteractAction(null);
    }
  }

  async exitSpot() {
    if (!this.currentSpot) return;
    soundEngine.playPop();
    const prev = this.currentSpot;

    if (prev === 'heli_pilot') { await syncService.releaseSeat('helicopter', 'driver'); this.helicopter.isFlying = false; }
    else if (prev === 'heli_passenger') { await syncService.releaseSeat('helicopter', 'passenger'); }
    else if (prev === 'bike_driver') { await syncService.releaseSeat('bike', 'driver'); }
    else if (prev === 'bike_passenger') { await syncService.releaseSeat('bike', 'passenger'); }
    else if (prev === 'buggy_driver') { await syncService.releaseSeat('buggy', 'driver'); }
    else if (prev === 'buggy_passenger') { await syncService.releaseSeat('buggy', 'passenger'); }
    else if (prev === 'canopy_seat1') { await syncService.releaseSeat('canopySwing', 'seat1'); }
    else if (prev === 'canopy_seat2') { await syncService.releaseSeat('canopySwing', 'seat2'); }
    else if (prev === 'swing_1') { await syncService.releaseSeat('swing', 'seat1'); }
    else if (prev === 'swing_2') { await syncService.releaseSeat('swing', 'seat2'); }

    this.currentSpot = null;
    this.hud.showSpeedButton(false);
    if (this.myChar) {
      this.myChar.anim = 'idle';
      this.myChar.modelRoot.position.y = 0;
      this.myChar.modelRoot.rotation.x = 0;
      this.myChar.group.position.y = 0;

      if (prev.startsWith('heli')) {
        this.myChar.setPosition(this.helicopter.group.position.x + 1.8, this.helicopter.group.position.z + 1.2, 0, this.playerY);
      } else if (prev === 'bike_driver') {
        this.myChar.setPosition(this.bike.group.position.x - 1.0, this.bike.group.position.z, this.bike.group.rotation.y, 0);
      } else if (prev === 'bike_passenger') {
        this.myChar.setPosition(this.bike.group.position.x + 1.0, this.bike.group.position.z, this.bike.group.rotation.y, 0);
      } else if (prev === 'buggy_driver') {
        this.myChar.setPosition(this.buggy.group.position.x - 1.5, this.buggy.group.position.z, this.buggy.group.rotation.y, 0);
      } else if (prev === 'buggy_passenger') {
        this.myChar.setPosition(this.buggy.group.position.x + 1.5, this.buggy.group.position.z, this.buggy.group.rotation.y, 0);
      } else if (prev === 'canopy_seat1' || prev === 'canopy_seat2') {
        this.myChar.setPosition(this.canopySwing.position.x + 1.6, this.canopySwing.position.z + 1.6, this.canopySwing.rotationY, 0);
      } else if (prev === 'swing_1') {
        this.myChar.setPosition(this.swing.position.x - 1.2, this.swing.position.z + 1.2, this.swing.rotationY, 0);
      } else if (prev === 'swing_2') {
        this.myChar.setPosition(this.swing.position.x + 1.2, this.swing.position.z + 1.2, this.swing.rotationY, 0);
      } else if (prev.startsWith('bench_')) {
        const isLeft = prev.endsWith('_left');
        const side = isLeft ? 'left' : 'right';
        const benchId = prev.replace(/^bench_/, '').replace(/_(left|right)$/, '');
        await syncService.releaseSeat(benchId, side);
        const bench = this.chairSystem.getBenchById(benchId);
        if (bench) {
          const dismount = this.chairSystem.getDismountWorldPos(bench);
          this.myChar.setPosition(dismount.x, dismount.z, bench.rotationY, 0);
        }
      } else if (prev.startsWith('bed_')) {
        const wakePos = this.coupleHouse.getWakeUpWorldPosition(prev === 'bed_left' ? 'left' : 'right');
        this.playerY = 2.9;
        this.myChar.setPosition(wakePos.x, wakePos.z, this.coupleHouse.rotationY, this.playerY);
        this.myChar.anim = 'cheer';
        setTimeout(() => { if (this.myChar && this.myChar.anim === 'cheer') this.myChar.anim = 'idle'; }, 1200);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => window.app = new App());