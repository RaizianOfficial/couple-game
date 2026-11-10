// Game HUD & Contextual Touch Controls
import { soundEngine } from '../audio.js';

export class GameHUD {
  constructor(containerEl, callbacks) {
    this.container = containerEl;
    this.callbacks = callbacks; // { onHoldHandsStart, onHoldHandsEnd, onInteract, onToggleEmoji, onOpenGames, onToggleQuality, onToggleFullscreen }

    this.isHoldingHands = false;
    this.interactAction = null; // null | { type: 'bike_drive' | 'bike_passenger' | 'bike_exit' | 'swing' | 'swing_exit' | 'tea_sip' | 'tea_pass' | 'tea_exit', label: string }

    this.buildDOM();
    this.initEvents();
  }

  buildDOM() {
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'game-hud';

    this.hudEl.innerHTML = `
      <!-- Top Bar -->
      <div class="hud-top-bar">
        <div class="room-chip" id="hud-room-chip">
          <span class="chip-label">Room:</span>
          <span class="chip-code" id="hud-room-code">-----</span>
          <button class="chip-copy-btn" id="hud-copy-btn" title="Copy Room Link">📋</button>
        </div>

        <div class="presence-badge" id="hud-presence-badge">
          <span class="presence-dot"></span>
          <span class="presence-text" id="hud-presence-text">Waiting...</span>
        </div>

        <div class="hud-top-actions">
          <button class="icon-btn" id="hud-quality-btn" title="Toggle Quality (High/Low)">✨ High</button>
          <button class="icon-btn" id="hud-fs-btn" title="Fullscreen">⛶</button>
        </div>
      </div>

      <!-- Right Action Controls Area -->
      <div class="hud-right-actions">
        <!-- Hold Hands Context Button -->
        <button class="action-btn hold-hands-btn hidden" id="hud-hold-hands-btn">
          <span class="btn-icon">🤝</span>
          <span class="btn-label">Hold Hands</span>
        </button>

        <!-- Dynamic Context Interact Button -->
        <button class="action-btn interact-btn hidden" id="hud-interact-btn">
          <span class="btn-icon" id="hud-interact-icon">✨</span>
          <span class="btn-label" id="hud-interact-label">Interact</span>
        </button>

        <!-- Secondary Utility Buttons Row -->
        <div class="hud-util-row">
          <button class="round-btn emoji-toggle-btn" id="hud-emoji-btn" title="Send Emoji">
            😍
          </button>
          <button class="round-btn games-menu-btn" id="hud-games-btn" title="Mini-Games">
            🎮
          </button>
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

      <!-- Partner Offline Overlay Banner -->
      <div class="partner-offline-banner hidden" id="hud-offline-banner">
        <span>💔 Your partner went offline. Waiting for them to return...</span>
      </div>
    `;

    this.container.appendChild(this.hudEl);

    // Elements
    this.roomCodeEl = this.hudEl.querySelector('#hud-room-code');
    this.copyBtn = this.hudEl.querySelector('#hud-copy-btn');
    this.presenceBadge = this.hudEl.querySelector('#hud-presence-badge');
    this.presenceText = this.hudEl.querySelector('#hud-presence-text');
    this.qualityBtn = this.hudEl.querySelector('#hud-quality-btn');
    this.fullscreenBtn = this.hudEl.querySelector('#hud-fs-btn');
    this.holdHandsBtn = this.hudEl.querySelector('#hud-hold-hands-btn');
    this.interactBtn = this.hudEl.querySelector('#hud-interact-btn');
    this.interactIcon = this.hudEl.querySelector('#hud-interact-icon');
    this.interactLabel = this.hudEl.querySelector('#hud-interact-label');
    this.emojiBtn = this.hudEl.querySelector('#hud-emoji-btn');
    this.gamesBtn = this.hudEl.querySelector('#hud-games-btn');
    this.gamesMenu = this.hudEl.querySelector('#hud-games-menu');
    this.gamesMenuClose = this.hudEl.querySelector('#hud-games-menu-close');
    this.offlineBanner = this.hudEl.querySelector('#hud-offline-banner');
  }

  initEvents() {
    // Hold Hands Press-and-Hold
    const startHold = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.isHoldingHands = true;
      this.holdHandsBtn.classList.add('pressed');
      if (this.callbacks.onHoldHandsStart) this.callbacks.onHoldHandsStart();
    };

    const endHold = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.isHoldingHands) {
        this.isHoldingHands = false;
        this.holdHandsBtn.classList.remove('pressed');
        if (this.callbacks.onHoldHandsEnd) this.callbacks.onHoldHandsEnd();
      }
    };

    this.holdHandsBtn.addEventListener('pointerdown', startHold);
    this.holdHandsBtn.addEventListener('pointerup', endHold);
    this.holdHandsBtn.addEventListener('pointercancel', endHold);
    this.holdHandsBtn.addEventListener('pointerleave', endHold);

    // Interact button tap
    this.interactBtn.addEventListener('click', () => {
      soundEngine.playPop();
      if (this.callbacks.onInteract && this.interactAction) {
        this.callbacks.onInteract(this.interactAction);
      }
    });

    // Emoji toggle
    this.emojiBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleEmoji) this.callbacks.onToggleEmoji();
    });

    // Games menu
    this.gamesBtn.addEventListener('click', () => {
      soundEngine.playPop();
      this.gamesMenu.classList.toggle('hidden');
    });

    this.gamesMenuClose.addEventListener('click', () => {
      this.gamesMenu.classList.add('hidden');
    });

    this.hudEl.querySelector('#choice-tictactoe').addEventListener('click', () => {
      this.gamesMenu.classList.add('hidden');
      if (this.callbacks.onOpenGames) this.callbacks.onOpenGames('tictactoe');
    });

    this.hudEl.querySelector('#choice-outfit').addEventListener('click', () => {
      this.gamesMenu.classList.add('hidden');
      if (this.callbacks.onOpenGames) this.callbacks.onOpenGames('outfit');
    });

    // Quality Toggle
    this.qualityBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleQuality) {
        const newQuality = this.callbacks.onToggleQuality();
        this.qualityBtn.textContent = newQuality === 'high' ? '✨ High' : '⚡ Low';
      }
    });

    // Fullscreen toggle
    this.fullscreenBtn.addEventListener('click', () => {
      if (this.callbacks.onToggleFullscreen) this.callbacks.onToggleFullscreen();
    });

    // Copy room link
    this.copyBtn.addEventListener('click', () => {
      const code = this.roomCodeEl.textContent;
      const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
      navigator.clipboard?.writeText(url).then(() => {
        this.copyBtn.textContent = '✓';
        setTimeout(() => this.copyBtn.textContent = '📋', 1500);
      });
      soundEngine.playPop();
    });
  }

  setRoomCode(code) {
    this.roomCodeEl.textContent = code;
  }

  setPresence(status) {
    // status: 'waiting' | 'online' | 'offline'
    this.presenceBadge.className = `presence-badge ${status}`;
    if (status === 'waiting') {
      this.presenceText.textContent = 'Waiting for partner...';
      this.offlineBanner.classList.add('hidden');
    } else if (status === 'online') {
      this.presenceText.textContent = 'Partner connected ❤️';
      this.offlineBanner.classList.add('hidden');
    } else if (status === 'offline') {
      this.presenceText.textContent = 'Partner went offline 💔';
      this.offlineBanner.classList.remove('hidden');
    }
  }

  showHoldHandsButton(visible) {
    this.holdHandsBtn.classList.toggle('hidden', !visible);
    if (!visible && this.isHoldingHands) {
      this.isHoldingHands = false;
      this.holdHandsBtn.classList.remove('pressed');
      if (this.callbacks.onHoldHandsEnd) this.callbacks.onHoldHandsEnd();
    }
  }

  setHandsConnected(isConnected) {
    this.holdHandsBtn.classList.toggle('active-holding', isConnected);
    if (isConnected) {
      this.holdHandsBtn.querySelector('.btn-label').textContent = 'Holding Hands ❤️';
    } else {
      this.holdHandsBtn.querySelector('.btn-label').textContent = 'Hold Hands';
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

  // Look Share Banner with Accept button
  showLookInvite(partnerNick, outfit, onAccept, onView) {
    if (this.lookInviteEl) {
      this.lookInviteEl.remove();
    }

    const name = partnerNick || 'Partner';
    this.lookInviteEl = document.createElement('div');
    this.lookInviteEl.className = 'partner-look-invite';
    this.lookInviteEl.id = 'hud-look-invite';
    this.lookInviteEl.innerHTML = `
      <div class="look-invite-content">
        <span class="invite-icon">👗</span>
        <div class="invite-text">
          <strong>${name} styled a new look for you!</strong>
          <small>Tap Accept to wear it now!</small>
        </div>
      </div>
      <div class="look-invite-actions">
        <button class="btn-accept-look" id="hud-btn-accept-look">Accept ✨</button>
        <button class="btn-dismiss-look" id="hud-btn-view-look">View</button>
      </div>
    `;

    this.hudEl.appendChild(this.lookInviteEl);

    this.lookInviteEl.querySelector('#hud-btn-accept-look').addEventListener('click', () => {
      soundEngine.playCheer();
      if (onAccept) onAccept(outfit);
      this.hideLookInvite();
    });

    this.lookInviteEl.querySelector('#hud-btn-view-look').addEventListener('click', () => {
      if (onView) onView();
      this.hideLookInvite();
    });
  }

  hideLookInvite() {
    if (this.lookInviteEl) {
      this.lookInviteEl.remove();
      this.lookInviteEl = null;
    }
  }
}
