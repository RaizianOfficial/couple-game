// Sweet Emoji Reactions Tray & Floating 3D/Screen World Animation
import { soundEngine } from '../audio.js';

export const SWEET_EMOJIS = ['❤️', '😍', '😂', '🥰', '😘', '✨', '👏', '🌹'];

export class EmojiSystem {
  constructor(containerEl, onSendEmoji) {
    this.container = containerEl;
    this.onSendEmoji = onSendEmoji;
    this.isOpen = false;
    this.floatingLayer = null;

    this.buildDOM();
  }

  buildDOM() {
    // Emoji Tray Floating Bar
    this.tray = document.createElement('div');
    this.tray.className = 'emoji-tray hidden';

    SWEET_EMOJIS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', `Send ${emoji}`);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerEmoji(emoji);
      });
      this.tray.appendChild(btn);
    });

    this.container.appendChild(this.tray);

    // Floating reaction container for animations
    this.floatingLayer = document.createElement('div');
    this.floatingLayer.className = 'floating-reactions-layer';
    this.container.appendChild(this.floatingLayer);
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.tray.classList.toggle('hidden', !this.isOpen);
    soundEngine.playPop();
  }

  close() {
    this.isOpen = false;
    this.tray.classList.add('hidden');
  }

  async triggerEmoji(emoji) {
    if (this.onSendEmoji) {
      const sent = await this.onSendEmoji(emoji);
      if (sent) {
        soundEngine.playPop();
        this.close();
      }
    }
  }

  // Show floating emoji above character on screen
  spawnFloatingEmoji(emoji, screenX, screenY) {
    const clampedX = Math.max(40, Math.min(window.innerWidth - 40, screenX || window.innerWidth / 2));
    const clampedY = Math.max(60, Math.min(window.innerHeight - 60, screenY || window.innerHeight / 2));

    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emoji;
    el.style.left = `${clampedX}px`;
    el.style.top = `${clampedY}px`;

    this.floatingLayer.appendChild(el);
    soundEngine.playPop();

    // Remove element after animation completes (~2s)
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 2000);
  }
}
