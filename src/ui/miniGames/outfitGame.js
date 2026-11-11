// Outfit Dress-Up Game: Pick and Equip Outfits Seamlessly!
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
          <span class="modal-title">👗 Style & Wardrobe</span>
          <button class="modal-close-btn" id="outfit-close-btn" aria-label="Close">✕</button>
        </div>
        <p class="modal-desc">Pick custom colors & hats! Wear it on yourself or gift it to your partner.</p>

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

        <div class="outfit-status" id="outfit-status">Select your favorite look!</div>

        <div class="modal-footer" style="display:flex; gap:8px; width:100%; justify-content:center; flex-wrap:wrap;">
          <button class="btn-primary" id="outfit-wear-self-btn" style="flex:1; min-width:140px; background:linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);">Wear on Myself ✨</button>
          <button class="btn-primary" id="outfit-submit-btn" style="flex:1; min-width:140px; background:linear-gradient(135deg, #ec4899 0%, #db2777 100%);">Gift to Partner 🎁</button>
          <button class="btn-secondary hidden" id="outfit-accept-btn" style="width:100%;">Accept Partner's Gift ✨</button>
        </div>
      </div>
    `;

    this.container.appendChild(this.modal);

    this.statusEl = this.modal.querySelector('#outfit-status');
    this.wearSelfBtn = this.modal.querySelector('#outfit-wear-self-btn');
    this.submitBtn = this.modal.querySelector('#outfit-submit-btn');
    this.acceptBtn = this.modal.querySelector('#outfit-accept-btn');
    this.closeBtn = this.modal.querySelector('#outfit-close-btn');

    this.closeBtn.addEventListener('click', () => this.close());
    this.wearSelfBtn.addEventListener('click', () => this.wearOnSelf());
    this.submitBtn.addEventListener('click', () => this.submitPicks());
    this.acceptBtn.addEventListener('click', () => this.acceptPartnerLook());

    // Selection handlers
    this.modal.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const val = btn.getAttribute('data-val');
        this.myPicks[type] = val;

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
    this.statusEl.textContent = 'Select items and choose Wear or Gift!';
    this.statusEl.className = 'outfit-status';
    this.submitBtn.disabled = false;
    this.wearSelfBtn.disabled = false;
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add('hidden');
  }

  // Instant equip to local player and sync to Firebase!
  async wearOnSelf() {
    const uid = this.roomService.user?.uid;
    if (!uid) return;

    soundEngine.playCheer();
    if (this.onApplyLook) {
      this.onApplyLook(uid, this.myPicks);
    }
    if (this.roomService.roomId) {
      await this.syncService.setPartnerOutfit(uid, this.myPicks);
    }
    this.statusEl.textContent = '✨ You are now wearing this look!';
    this.statusEl.className = 'outfit-status revealed';
    setTimeout(() => this.close(), 900);
  }

  // Send look as a gift to partner
  async submitPicks() {
    const uid = this.roomService.user?.uid;
    if (!uid) return;

    soundEngine.playPop();
    this.statusEl.textContent = '🎁 Sent to your partner!';
    this.statusEl.className = 'outfit-status waiting';
    await this.syncService.submitOutfitPick(this.myPicks);
    setTimeout(() => this.close(), 1200);
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
      this.statusEl.textContent = '💖 Look equipped!';
      setTimeout(() => this.close(), 800);
    }
  }

  renderState(state) {
    if (!this.isOpen) return;
    const partnerUid = this.roomService.partnerUid;
    const partnerSubmitted = state?.picks && partnerUid && state.picks[partnerUid];

    if (partnerSubmitted) {
      this.acceptBtn.classList.remove('hidden');
      this.acceptBtn.textContent = `Accept Gift from Partner ✨`;
    } else {
      this.acceptBtn.classList.add('hidden');
    }
  }
}
