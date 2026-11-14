// Game HUD & Contextual Touch Controls
import { soundEngine } from '../audio.js';

export class GameHUD {
  constructor(containerEl, callbacks) {
    this.container = containerEl;
    this.callbacks = callbacks;

    this.isHoldingHands = false;
    this.interactAction = null;

    this.buildDOM();
    this.initEvents();
  }

  buildDOM() {
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'game-hud';

    // We add the specific styling needed for the Phase 2 compact tray dynamically.
    const styleBlock = document.createElement('style');
    styleBlock.textContent = `
      .emoji-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }
      .tray-icon-btn {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: none;
        background: rgba(255, 255, 255, 0.1);
        font-size: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.1s, background 0.15s;
      }
      .tray-icon-btn:active { transform: scale(1.1); background: rgba(255, 255, 255, 0.3); }
      .tray-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
        margin: 8px 0;
      }
      .msg-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 110px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .msg-list::-webkit-scrollbar { width: 4px; }
      .msg-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 2px; }
      .tray-text-btn {
        width: 100%;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 8px;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        text-align: center;
        letter-spacing: 0.5px;
        cursor: pointer;
      }
      .tray-text-btn:active { background: rgba(236, 72, 153, 0.6); }
      
      .floating-text-msg {
        position: absolute;
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
        padding: 8px 16px;
        border-radius: 20px;
        border: 2px solid #fff;
        box-shadow: 0 4px 16px rgba(219, 39, 119, 0.4);
        transform: translate(-50%, -50%);
        animation: floatUpMsg 3s forwards cubic-bezier(0.2, 0.8, 0.2, 1);
        pointer-events: none;
        white-space: nowrap;
      }
      @keyframes floatUpMsg {
        0% { opacity: 0; transform: translate(-50%, 0) scale(0.6); }
        15% { opacity: 1; transform: translate(-50%, -20px) scale(1.1); }
        85% { opacity: 1; transform: translate(-50%, -60px) scale(1.0); }
        100% { opacity: 0; transform: translate(-50%, -80px) scale(0.8); }
      }
    `;
    this.hudEl.appendChild(styleBlock);

    this.hudEl.innerHTML += `
      <!-- Top Bar -->
      <div class="hud-top-bar">
        <div class="room-chip" id="hud-room-chip">
          <span class="chip-label">Room:</span>
          <span class="chip-code" id="hud-room-code">----</span>
          <button class="chip-copy-btn" id="hud-copy-btn" title="Copy Room Link">📋</button>
        </div>
        <div class="presence-badge" id="hud-presence-badge">
          <span class="presence-dot"></span>
          <span class="presence-text" id="hud-presence-text">Waiting...</span>
        </div>
        <div class="hud-inventory" id="hud-inventory-pill">
          <span class="inv-item" title="Wood">🪵 <span id="hud-wood-val">0</span></span>
          <span class="inv-item" title="Harvested Crops">🌾 <span id="hud-crop-val">0</span></span>
        </div>
        <div class="hud-top-actions">
          <button class="icon-btn" id="hud-daynight-btn" title="Toggle Day/Night">☀️ Day</button>
          <button class="icon-btn" id="hud-quality-btn" title="Toggle Quality">✨ High</button>
          <button class="icon-btn" id="hud-fs-btn" title="Fullscreen">⛶</button>
        </div>
      </div>

      <!-- Right Action Controls Area -->
      <div class="hud-right-actions">
        <!-- Helicopter Aerial Controls -->
        <div class="hud-flight-row hidden" id="hud-flight-controls">
          <button class="action-btn flight-btn" id="hud-ascend-btn">⬆️ Ascend</button>
          <button class="action-btn flight-btn" id="hud-descend-btn">⬇️ Descend</button>
        </div>

        <!-- Vehicle Speed Toggle Button (Bike & Buggy) -->
        <button class="action-btn speed-btn hidden" id="hud-speed-btn">
          <span class="btn-icon" id="hud-speed-icon">⚡</span>
          <span class="btn-label" id="hud-speed-label">Speed: Normal</span>
        </button>

        <div class="hud-jump-sit-row">
          <button class="action-btn jump-btn" id="hud-jump-btn">🦘 Jump</button>
          <button class="action-btn sit-btn" id="hud-sit-btn">🧘 Sit</button>
        </div>
        <button class="action-btn hug-btn hidden" id="hud-hug-btn">🫂 Hug ❤️</button>
        <button class="action-btn hold-hands-btn hidden" id="hud-hold-hands-btn">
          <span class="btn-icon">🤝</span>
          <span class="btn-label">Hold Hands</span>
        </button>
        
        <!-- Dynamic Interact Button (for Pets, Trees, etc) -->
        <button class="action-btn interact-btn hidden" id="hud-interact-btn">
          <span class="btn-icon" id="hud-interact-icon">✨</span>
          <span class="btn-label" id="hud-interact-label">Interact</span>
        </button>

        <!-- Secondary Interact Button (e.g. Untame Pet) -->
        <button class="action-btn secondary-interact-btn hidden" id="hud-secondary-interact-btn">
          <span class="btn-icon" id="hud-secondary-interact-icon">🔓</span>
          <span class="btn-label" id="hud-secondary-interact-label">Untame</span>
        </button>

        <div class="hud-util-row">
          <button class="round-btn emoji-toggle-btn" id="hud-emoji-btn" title="Send Reaction">💬</button>
          <button class="round-btn games-menu-btn" id="hud-games-btn" title="Mini-Games">🎮</button>
        </div>
      </div>

      <!-- Games Menu Popup Modal -->
      <div class="games-menu-modal hidden" id="hud-games-menu">
        <div class="games-menu-card">
          <div class="games-menu-header">
            <span>Play Together</span>
            <button class="modal-close-btn" id="hud-games-menu-close">✕</button>
          </div>
          <div class="games-options">
            <button class="game-choice-btn" id="choice-tictactoe">
              <span class="game-icon">❌⭕</span>
              <div class="game-info">
                <strong>Tic-Tac-Toe</strong>
                <small>Classic turn-based 3x3 match</small>
              </div>
            </button>
            <button class="game-choice-btn" id="choice-outfit">
              <span class="game-icon">👗👒</span>
              <div class="game-info">
                <strong>Style Partner</strong>
                <small>Pick a cute outfit for each other</small>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div class="partner-offline-banner hidden" id="hud-offline-banner">
        <span>💔 Your partner went offline. Waiting...</span>
      </div>
    `;

    this.container.appendChild(this.hudEl);

    // Elements Map
    this.roomCodeEl = this.hudEl.querySelector('#hud-room-code');
    this.copyBtn = this.hudEl.querySelector('#hud-copy-btn');
    this.presenceBadge = this.hudEl.querySelector('#hud-presence-badge');
    this.presenceText = this.hudEl.querySelector('#hud-presence-text');
    this.dayNightBtn = this.hudEl.querySelector('#hud-daynight-btn');
    this.qualityBtn = this.hudEl.querySelector('#hud-quality-btn');
    this.fullscreenBtn = this.hudEl.querySelector('#hud-fs-btn');
    this.holdHandsBtn = this.hudEl.querySelector('#hud-hold-hands-btn');
    this.interactBtn = this.hudEl.querySelector('#hud-interact-btn');
    this.interactIcon = this.hudEl.querySelector('#hud-interact-icon');
    this.interactLabel = this.hudEl.querySelector('#hud-interact-label');
    this.secondaryInteractBtn = this.hudEl.querySelector('#hud-secondary-interact-btn');
    this.secondaryInteractIcon = this.hudEl.querySelector('#hud-secondary-interact-icon');
    this.secondaryInteractLabel = this.hudEl.querySelector('#hud-secondary-interact-label');
    this.speedBtn = this.hudEl.querySelector('#hud-speed-btn');
    this.speedIcon = this.hudEl.querySelector('#hud-speed-icon');
    this.speedLabel = this.hudEl.querySelector('#hud-speed-label');
    this.jumpBtn = this.hudEl.querySelector('#hud-jump-btn');
    this.sitBtn = this.hudEl.querySelector('#hud-sit-btn');
    this.hugBtn = this.hudEl.querySelector('#hud-hug-btn');
    this.flightControls = this.hudEl.querySelector('#hud-flight-controls');
    this.ascendBtn = this.hudEl.querySelector('#hud-ascend-btn');
    this.descendBtn = this.hudEl.querySelector('#hud-descend-btn');
    this.woodVal = this.hudEl.querySelector('#hud-wood-val');
    this.cropVal = this.hudEl.querySelector('#hud-crop-val');
    this.emojiBtn = this.hudEl.querySelector('#hud-emoji-btn');
    this.gamesBtn = this.hudEl.querySelector('#hud-games-btn');
    this.gamesMenu = this.hudEl.querySelector('#hud-games-menu');
    this.gamesMenuClose = this.hudEl.querySelector('#hud-games-menu-close');
    this.offlineBanner = this.hudEl.querySelector('#hud-offline-banner');
  }

  initEvents() {
    let holdStartTime = 0;
    const startHold = (e) => {
      e.preventDefault(); e.stopPropagation();
      holdStartTime = Date.now();
      if (!this.isHoldingHands) {
        this.isHoldingHands = true;
        this.holdHandsBtn.classList.add('pressed');
        if (this.callbacks.onHoldHandsStart) this.callbacks.onHoldHandsStart();
      }
    };
    const endHold = (e) => {
      e.preventDefault(); e.stopPropagation();
      if (Date.now() - holdStartTime > 400 && this.isHoldingHands) {
        this.isHoldingHands = false;
        this.holdHandsBtn.classList.remove('pressed');
        if (this.callbacks.onHoldHandsEnd) this.callbacks.onHoldHandsEnd();
      }
    };

    this.holdHandsBtn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      if (Date.now() - holdStartTime <= 400 && this.isHoldingHands && this.holdHandsBtn.classList.contains('active-holding')) {
        this.isHoldingHands = false;
        this.holdHandsBtn.classList.remove('pressed', 'active-holding');
        if (this.callbacks.onHoldHandsEnd) this.callbacks.onHoldHandsEnd();
      }
    });

    this.holdHandsBtn.addEventListener('pointerdown', startHold);
    this.holdHandsBtn.addEventListener('pointerup', endHold);
    this.jumpBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (this.callbacks.onJump) this.callbacks.onJump(); });
    this.sitBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (this.callbacks.onSit) this.callbacks.onSit(); });
    this.hugBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (this.callbacks.onHug) this.callbacks.onHug(); });

    const bindHoldButton = (btn, onStart, onEnd) => {
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (onStart) onStart(); });
      btn.addEventListener('pointerup', (e) => { e.preventDefault(); if (onEnd) onEnd(); });
      btn.addEventListener('pointercancel', (e) => { e.preventDefault(); if (onEnd) onEnd(); });
      btn.addEventListener('pointerleave', (e) => { e.preventDefault(); if (onEnd) onEnd(); });
    };
    bindHoldButton(this.ascendBtn, this.callbacks.onAscendStart, this.callbacks.onAscendEnd);
    bindHoldButton(this.descendBtn, this.callbacks.onDescendStart, this.callbacks.onDescendEnd);

    this.interactBtn.addEventListener('click', () => {
      soundEngine.playPop();
      if (this.callbacks.onInteract && this.interactAction) {
        this.callbacks.onInteract(this.interactAction);
      }
    });

    this.secondaryInteractBtn.addEventListener('click', () => {
      soundEngine.playPop();
      if (this.callbacks.onInteract && this.secondaryInteractAction) {
        this.callbacks.onInteract(this.secondaryInteractAction);
      }
    });

    if (this.speedBtn) {
      this.speedBtn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        soundEngine.playPop();
        if (this.callbacks.onToggleSpeed) this.callbacks.onToggleSpeed();
      });
    }

    this.emojiBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleEmoji) this.callbacks.onToggleEmoji();
    });

    this.gamesBtn.addEventListener('click', () => { soundEngine.playPop(); this.gamesMenu.classList.toggle('hidden'); });
    this.gamesMenuClose.addEventListener('click', () => { this.gamesMenu.classList.add('hidden'); });
    this.hudEl.querySelector('#choice-tictactoe').addEventListener('click', () => { this.gamesMenu.classList.add('hidden'); if (this.callbacks.onOpenGames) this.callbacks.onOpenGames('tictactoe'); });
    this.hudEl.querySelector('#choice-outfit').addEventListener('click', () => { this.gamesMenu.classList.add('hidden'); if (this.callbacks.onOpenGames) this.callbacks.onOpenGames('outfit'); });

    this.dayNightBtn.addEventListener('click', () => {
      soundEngine.playPop();
      if (this.callbacks.onToggleDayNight) this.callbacks.onToggleDayNight();
    });

    this.qualityBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleQuality) {
        const newQuality = this.callbacks.onToggleQuality();
        this.qualityBtn.textContent = newQuality === 'high' ? '✨ High' : '⚡ Low';
      }
    });
    this.fullscreenBtn.addEventListener('click', () => { if (this.callbacks.onToggleFullscreen) this.callbacks.onToggleFullscreen(); });

    this.copyBtn.addEventListener('click', () => {
      const rawCode = this.roomCodeEl.textContent || '';
      const pureCode = rawCode.replace(/[^0-9]/g, '').slice(0, 4);
      navigator.clipboard?.writeText(pureCode).then(() => {
        this.copyBtn.textContent = '✓';
        setTimeout(() => this.copyBtn.textContent = '📋', 1500);
      });
      soundEngine.playPop();
    });
  }

  setRoomCode(code) { this.roomCodeEl.textContent = code; }

  setPresence(status) {
    this.presenceBadge.className = `presence-badge ${status}`;
    if (status === 'waiting') { this.presenceText.textContent = 'Waiting for partner...'; this.offlineBanner.classList.add('hidden'); }
    else if (status === 'online') { this.presenceText.textContent = 'Partner connected ❤️'; this.offlineBanner.classList.add('hidden'); }
    else if (status === 'offline') { this.presenceText.textContent = 'Partner went offline 💔'; this.offlineBanner.classList.remove('hidden'); }
  }

  showHoldHandsButton(visible) { this.holdHandsBtn.classList.toggle('hidden', !visible); }
  showHugButton(visible) { this.hugBtn.classList.toggle('hidden', !visible); }
  showFlightControls(visible) { this.flightControls.classList.toggle('hidden', !visible); }
  showSpeedButton(visible, currentMode = 'normal') {
    if (!this.speedBtn) return;
    if (visible) {
      this.speedBtn.classList.remove('hidden');
      if (currentMode === 'fast') {
        this.speedBtn.classList.add('turbo');
        if (this.speedIcon) this.speedIcon.textContent = '🚀';
        if (this.speedLabel) this.speedLabel.textContent = 'Speed: Fast';
      } else {
        this.speedBtn.classList.remove('turbo');
        if (this.speedIcon) this.speedIcon.textContent = '⚡';
        if (this.speedLabel) this.speedLabel.textContent = 'Speed: Normal';
      }
    } else {
      this.speedBtn.classList.add('hidden');
    }
  }
  setSitState(isSitting) {
    if (this.sitBtn) {
      this.sitBtn.textContent = isSitting ? '🧍 Stand' : '🧘 Sit';
      if (isSitting) this.sitBtn.classList.add('active-sitting');
      else this.sitBtn.classList.remove('active-sitting');
    }
  }

  showSitButton(visible) {
    if (this.sitBtn) {
      if (visible) this.sitBtn.classList.remove('hidden');
      else this.sitBtn.classList.add('hidden');
    }
  }

  setWoodCount(count) { if (this.woodVal) this.woodVal.textContent = count; }
  setCropCount(count) { if (this.cropVal) this.cropVal.textContent = count; }

  setHandsConnected(isConnected) {
    if (!this.holdHandsBtn) return;
    this.holdHandsBtn.classList.toggle('active-holding', isConnected);
    const labelEl = this.holdHandsBtn.querySelector('.btn-label');
    if (labelEl) {
      labelEl.textContent = isConnected ? 'Holding Hands ❤️' : 'Hold Hands';
    } else {
      this.holdHandsBtn.textContent = isConnected ? '🤝 Holding Hands ❤️' : '🤝 Hold Hands';
    }
  }

  setInteractAction(action) {
    this.interactAction = action;
    if (action) {
      this.interactBtn.classList.remove('hidden');
      this.interactIcon.textContent = action.icon || '✨';
      this.interactLabel.textContent = action.label || 'Interact';
    } else {
      this.interactBtn.classList.add('hidden');
    }
  }

  setSecondaryInteractAction(action) {
    this.secondaryInteractAction = action;
    if (action) {
      this.secondaryInteractBtn.classList.remove('hidden');
      this.secondaryInteractIcon.textContent = action.icon || '🔓';
      this.secondaryInteractLabel.textContent = action.label || 'Untame';
    } else {
      this.secondaryInteractBtn.classList.add('hidden');
    }
  }

  setDayNightState(isNight) {
    if (this.dayNightBtn) {
      this.dayNightBtn.textContent = isNight ? '🌙 Night' : '☀️ Day';
    }
  }

  showDayNightVotePrompt(targetIsNight, onApprove, onDecline) {
    if (this.dayNightVoteEl) this.dayNightVoteEl.remove();
    this.dayNightVoteEl = document.createElement('div');
    this.dayNightVoteEl.className = 'partner-look-invite';
    const label = targetIsNight ? 'switch to Night 🌙' : 'switch to Day ☀️';
    this.dayNightVoteEl.innerHTML = `
      <div class="look-invite-content">
        <span class="invite-icon">${targetIsNight ? '🌙' : '☀️'}</span>
        <div class="invite-text">
          <strong>Partner requested to ${label}!</strong>
          <small>Do you approve?</small>
        </div>
      </div>
      <div class="look-invite-actions">
        <button class="btn-accept-look" id="hud-vote-yes">Approve 👍</button>
        <button class="btn-dismiss-look" id="hud-vote-no">Decline ✕</button>
      </div>
    `;
    this.hudEl.appendChild(this.dayNightVoteEl);

    this.dayNightVoteEl.querySelector('#hud-vote-yes').addEventListener('click', () => {
      soundEngine.playCheer();
      if (onApprove) onApprove();
      this.hideDayNightVotePrompt();
    });

    this.dayNightVoteEl.querySelector('#hud-vote-no').addEventListener('click', () => {
      soundEngine.playPop();
      if (onDecline) onDecline();
      this.hideDayNightVotePrompt();
    });
  }

  hideDayNightVotePrompt() {
    if (this.dayNightVoteEl) {
      this.dayNightVoteEl.remove();
      this.dayNightVoteEl = null;
    }
  }

  showLookInvite(partnerNick, outfit, onAccept, onView) {
    if (this.lookInviteEl) this.lookInviteEl.remove();
    this.lookInviteEl = document.createElement('div');
    this.lookInviteEl.className = 'partner-look-invite';
    this.lookInviteEl.innerHTML = `
      <div class="look-invite-content"><span class="invite-icon">👗</span><div class="invite-text"><strong>${partnerNick || 'Partner'} styled a look!</strong><small>Tap Accept to wear it!</small></div></div>
      <div class="look-invite-actions"><button class="btn-accept-look" id="hud-btn-accept-look">Accept ✨</button><button class="btn-dismiss-look" id="hud-btn-view-look">View</button></div>
    `;
    this.hudEl.appendChild(this.lookInviteEl);
    this.lookInviteEl.querySelector('#hud-btn-accept-look').addEventListener('click', () => { soundEngine.playCheer(); if (onAccept) onAccept(outfit); this.hideLookInvite(); });
    this.lookInviteEl.querySelector('#hud-btn-view-look').addEventListener('click', () => { if (onView) onView(); this.hideLookInvite(); });
  }

  hideLookInvite() { if (this.lookInviteEl) { this.lookInviteEl.remove(); this.lookInviteEl = null; } }
}