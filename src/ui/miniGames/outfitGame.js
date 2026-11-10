// Outfit Dress-Up Game: Pick an outfit FOR your partner!
import { soundEngine } from '../../audio.js';

export const OUTFIT_OPTIONS = {
  hats: [
    { id: 'none', label: 'None' },
    { id: 'beret', label: 'French Beret' },
    { id: 'straw', label: 'Straw Hat' },
    { id: 'beanie', label: 'Teal Beanie' },
    { id: 'flower', label: 'Pink Flower' }
  ],
  topColors: [
    { id: '#f472b6', label: 'Sweet Pink', hex: '#f472b6' },
    { id: '#60a5fa', label: 'Sky Blue', hex: '#60a5fa' },
    { id: '#a7f3d0', label: 'Soft Mint', hex: '#a7f3d0' },
    { id: '#c084fc', label: 'Lavender', hex: '#c084fc' },
    { id: '#fed7aa', label: 'Warm Peach', hex: '#fed7aa' },
    { id: '#fde047', label: 'Sunny Yellow', hex: '#fde047' }
  ],
  bottomColors: [
    { id: '#cbd5e1', label: 'Light Denim', hex: '#cbd5e1' },
    { id: '#94a3b8', label: 'Soft Slate', hex: '#94a3b8' },
    { id: '#ffffff', label: 'Cloud White', hex: '#ffffff' },
    { id: '#78350f', label: 'Warm Mocha', hex: '#78350f' },
    { id: '#fbcfe8', label: 'Pastel Rose', hex: '#fbcfe8' }
  ],
  accessories: [
    { id: 'none', label: 'None' },
    { id: 'glasses', label: 'Cute Glasses' },
    { id: 'scarf', label: 'Warm Scarf' },
    { id: 'bow', label: 'Pink Bow' }
  ]
};

export class OutfitGame {
  constructor(containerEl, syncService, roomService, onApplyLook) {
    this.container = containerEl;
    this.syncService = syncService;
    this.roomService = roomService;
    this.onApplyLook = onApplyLook;
    this.isOpen = false;

    // My current selections FOR my partner
    this.myPicks = {
      hat: 'straw',
      topColor: '#f472b6',
      bottomColor: '#cbd5e1',
      accessory: 'glasses'
    };

    this.buildDOM();
  }

  buildDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'game-modal hidden';
    this.modal.id = 'modal-outfit';

    this.modal.innerHTML = `
      <div class="modal-card modal-large">
        <div class="modal-header">
          <span class="modal-title">👗 Style Your Partner!</span>
          <button class="modal-close-btn" id="outfit-close-btn" aria-label="Close">✕</button>
        </div>
        <p class="modal-desc">Pick a sweet look for your partner. When you both submit, reveal the styles!</p>

        <div class="outfit-sections">
          <!-- Hat -->
          <div class="outfit-row">
            <span class="row-label">Hat:</span>
            <div class="pill-group" id="hat-pills">
              ${OUTFIT_OPTIONS.hats.map(h => `<button class="pill-btn ${h.id === this.myPicks.hat ? 'active' : ''}" data-type="hat" data-val="${h.id}">${h.label}</button>`).join('')}
            </div>
          </div>

          <!-- Top Color -->
          <div class="outfit-row">
            <span class="row-label">Top:</span>
            <div class="color-swatches" id="top-swatches">
              ${OUTFIT_OPTIONS.topColors.map(c => `<button class="swatch-btn ${c.id === this.myPicks.topColor ? 'active' : ''}" style="background-color:${c.hex};" data-type="topColor" data-val="${c.id}" title="${c.label}"></button>`).join('')}
            </div>
          </div>

          <!-- Bottom Color -->
          <div class="outfit-row">
            <span class="row-label">Bottom:</span>
            <div class="color-swatches" id="bottom-swatches">
              ${OUTFIT_OPTIONS.bottomColors.map(c => `<button class="swatch-btn ${c.id === this.myPicks.bottomColor ? 'active' : ''}" style="background-color:${c.hex};" data-type="bottomColor" data-val="${c.id}" title="${c.label}"></button>`).join('')}
            </div>
          </div>

          <!-- Accessory -->
          <div class="outfit-row">
            <span class="row-label">Accessory:</span>
            <div class="pill-group" id="acc-pills">
              ${OUTFIT_OPTIONS.accessories.map(a => `<button class="pill-btn ${a.id === this.myPicks.accessory ? 'active' : ''}" data-type="accessory" data-val="${a.id}">${a.label}</button>`).join('')}
            </div>
          </div>
        </div>

        <div class="outfit-status" id="outfit-status">Choose items and tap Submit!</div>

        <div class="modal-footer">
          <button class="btn-primary" id="outfit-submit-btn">Submit Look for Partner</button>
          <button class="btn-primary hidden" id="outfit-accept-btn" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);">Accept Partner's Look ✨</button>
          <button class="btn-secondary hidden" id="outfit-keep-btn">Keep This Look</button>
          <button class="btn-secondary hidden" id="outfit-replay-btn">Play Again</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modal);

    this.statusEl = this.modal.querySelector('#outfit-status');
    this.submitBtn = this.modal.querySelector('#outfit-submit-btn');
    this.acceptBtn = this.modal.querySelector('#outfit-accept-btn');
    this.keepBtn = this.modal.querySelector('#outfit-keep-btn');
    this.replayBtn = this.modal.querySelector('#outfit-replay-btn');
    this.closeBtn = this.modal.querySelector('#outfit-close-btn');

    this.closeBtn.addEventListener('click', () => this.close());
    this.submitBtn.addEventListener('click', () => this.submitPicks());
    this.acceptBtn.addEventListener('click', () => this.acceptPartnerLook());
    this.keepBtn.addEventListener('click', () => this.keepLook());
    this.replayBtn.addEventListener('click', () => this.restart());

    // Register real-time sync listener
    this.syncService.onOutfitUpdated = (state) => {
      this.renderState(state);
    };

    // Selection handlers
    this.modal.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const val = btn.getAttribute('data-val');
        this.myPicks[type] = val;

        // Update active class on siblings
        btn.parentElement.querySelectorAll(`[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        soundEngine.playPop();
      });
    });
  }

  open() {
    this.isOpen = true;
    this.modal.classList.remove('hidden');
    soundEngine.playPop();
    this.renderState(this.syncService.outfitState);
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add('hidden');
  }

  async submitPicks() {
    const uid = this.roomService.user?.uid;
    if (!uid) return;

    soundEngine.playPop();
    const currState = this.syncService.outfitState || { picks: {}, revealed: false };
    const newPicks = {
      ...(currState.picks || {}),
      [uid]: { ...this.myPicks }
    };

    // Check if both submitted
    const partnerUid = this.roomService.partnerUid;
    const bothSubmitted = partnerUid && newPicks[uid] && newPicks[partnerUid];

    const updatedState = {
      picks: newPicks,
      revealed: Boolean(bothSubmitted)
    };

    await this.syncService.updateOutfit(updatedState);
  }

  async restart() {
    soundEngine.playPop();
    await this.syncService.updateOutfit({
      picks: {},
      revealed: false
    });
  }

  async acceptPartnerLook() {
    const uid = this.roomService.user?.uid;
    const partnerUid = this.roomService.partnerUid;
    const state = this.syncService.outfitState;

    if (state?.picks && partnerUid && state.picks[partnerUid]) {
      const lookForMe = state.picks[partnerUid];
      soundEngine.playCheer();
      if (this.onApplyLook) {
        this.onApplyLook(uid, lookForMe);
      }
      if (this.roomService.roomId && uid) {
        await this.syncService.setPartnerOutfit(uid, lookForMe);
      }
      this.statusEl.textContent = '💖 Look accepted & equipped!';
      this.statusEl.className = 'outfit-status revealed';
      this.acceptBtn.classList.add('hidden');
      this.keepBtn.classList.remove('hidden');
    }
  }

  async keepLook() {
    soundEngine.playCheer();
    this.close();
  }

  renderState(state) {
    if (!this.isOpen) return;
    const uid = this.roomService.user?.uid;
    const partnerUid = this.roomService.partnerUid;

    const mySubmitted = state?.picks && state.picks[uid];
    const partnerSubmitted = state?.picks && partnerUid && state.picks[partnerUid];

    if (state?.revealed) {
      this.statusEl.textContent = '✨ Tada! Revealed! Look at your partner’s new style!';
      this.statusEl.className = 'outfit-status revealed';
      this.submitBtn.classList.add('hidden');
      this.acceptBtn.classList.remove('hidden');
      this.keepBtn.classList.remove('hidden');
      this.replayBtn.classList.remove('hidden');

      // Apply the partner's pick to my character!
      if (partnerSubmitted && this.onApplyLook) {
        this.onApplyLook(uid, state.picks[partnerUid]);
      }
      if (mySubmitted && this.onApplyLook && partnerUid) {
        this.onApplyLook(partnerUid, state.picks[uid]);
      }
    } else if (mySubmitted && !partnerSubmitted) {
      this.statusEl.textContent = '💌 Look submitted! Waiting for partner to choose...';
      this.statusEl.className = 'outfit-status waiting';
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Submitted (Waiting...)';
      this.keepBtn.classList.add('hidden');
      this.replayBtn.classList.add('hidden');
    } else {
      this.statusEl.textContent = 'Pick a style for your partner and tap Submit!';
      this.statusEl.className = 'outfit-status';
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Submit Look for Partner';
      this.submitBtn.classList.remove('hidden');
      this.keepBtn.classList.add('hidden');
      this.replayBtn.classList.add('hidden');
    }
  }
}
