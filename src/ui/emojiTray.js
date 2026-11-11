// Sweet Emoji Reactions, Custom Text Messages & Meme Sounds Tray (Compact Square Layout)
import { soundEngine } from '../audio.js';

// Strict Emoji List & Custom Text Messages defined in requirements
export const SWEET_EMOJIS = ['😭', '👍🏻', '🥺', '😘', '😍', '💗', '😏', '😡'];
export const CUSTOM_MSGS = ['I LOVE YOU', 'I HATE YOU', 'COME HERE', 'GO', 'HIDE', 'SORRY', 'SLEEP TIME'];
export const MEME_SOUNDS = [
  { id: 'meme_aayein', label: 'Aayein 🍆', key: 'aayein' },
  { id: 'meme_huh', label: 'Huh? 🐱', key: 'huh' },
  { id: 'meme_fahhh', label: 'Faaah 😮', key: 'fahhh' },
  { id: 'meme_chappal', label: 'Chappal 🩴', key: 'chappal' },
  { id: 'meme_punch', label: 'Punch 🥊', key: 'punch' },
  { id: 'meme_snore', label: 'Sleeping 💤', key: 'snore' },
  { id: 'meme_emotional', label: 'Emotional 🎻', key: 'emotional' }
];

export class EmojiSystem {
  constructor(containerEl, onSendReaction) {
    this.container = containerEl;
    this.onSendReaction = onSendReaction;
    this.isOpen = false;
    this.activeTab = 'emoji'; // 'emoji' | 'msgs' | 'memes'
    this.floatingLayer = null;

    this.buildDOM();
  }

  buildDOM() {
    // Compact Square Box Layout (<300px x ~280px)
    this.tray = document.createElement('div');
    this.tray.className = 'compact-square-tray hidden';

    // Top Navigation Tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tray-tabs';

    const tabEmoji = document.createElement('button');
    tabEmoji.className = 'tray-tab-btn active';
    tabEmoji.textContent = '😊 Emojis';

    const tabMsgs = document.createElement('button');
    tabMsgs.className = 'tray-tab-btn';
    tabMsgs.textContent = '💬 Msgs';

    const tabMemes = document.createElement('button');
    tabMemes.className = 'tray-tab-btn';
    tabMemes.textContent = '🎵 Memes';

    tabsContainer.appendChild(tabEmoji);
    tabsContainer.appendChild(tabMsgs);
    tabsContainer.appendChild(tabMemes);
    this.tray.appendChild(tabsContainer);

    // Tab 1: Emoji Grid Section (4x2 / 3x3 compact square)
    this.emojiPanel = document.createElement('div');
    this.emojiPanel.className = 'tray-panel emoji-panel';

    SWEET_EMOJIS.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.className = 'tray-icon-btn';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', `Send ${emoji}`);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerReaction(emoji, 'emoji');
      });
      this.emojiPanel.appendChild(btn);
    });
    this.tray.appendChild(this.emojiPanel);

    // Tab 2: Custom Text Message List Section (Scrollable & tidy)
    this.msgPanel = document.createElement('div');
    this.msgPanel.className = 'tray-panel msg-panel hidden';

    CUSTOM_MSGS.forEach((msg) => {
      const btn = document.createElement('button');
      btn.className = 'tray-text-btn';
      btn.textContent = msg;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerReaction(msg, 'message');
      });
      this.msgPanel.appendChild(btn);
    });
    this.tray.appendChild(this.msgPanel);

    // Tab 3: Meme Audio Section (Meme 1, Meme 2, Meme 3, Meme 4)
    this.memePanel = document.createElement('div');
    this.memePanel.className = 'tray-panel meme-panel hidden';

    MEME_SOUNDS.forEach((meme) => {
      const btn = document.createElement('button');
      btn.className = 'tray-meme-btn';
      btn.textContent = meme.label;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerReaction(meme.key, 'meme');
      });
      this.memePanel.appendChild(btn);
    });
    this.tray.appendChild(this.memePanel);

    // Tab switching handlers
    const switchTab = (tab) => {
      this.activeTab = tab;
      tabEmoji.classList.toggle('active', tab === 'emoji');
      tabMsgs.classList.toggle('active', tab === 'msgs');
      tabMemes.classList.toggle('active', tab === 'memes');

      this.emojiPanel.classList.toggle('hidden', tab !== 'emoji');
      this.msgPanel.classList.toggle('hidden', tab !== 'msgs');
      this.memePanel.classList.toggle('hidden', tab !== 'memes');
      soundEngine.playPop();
    };

    tabEmoji.addEventListener('click', (e) => { e.stopPropagation(); switchTab('emoji'); });
    tabMsgs.addEventListener('click', (e) => { e.stopPropagation(); switchTab('msgs'); });
    tabMemes.addEventListener('click', (e) => { e.stopPropagation(); switchTab('memes'); });

    // Using tray-mount or fallback
    const mount = document.getElementById('tray-mount');
    if (mount) {
      mount.appendChild(this.tray);
    } else {
      this.container.appendChild(this.tray);
    }

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

  async triggerReaction(content, type) {
    if (this.onSendReaction) {
      const payload = { content, type };
      const sent = await this.onSendReaction(payload);
      if (sent) {
        soundEngine.playPop();
        this.close();
      }
    }
  }

  // Show floating element above character on screen
  spawnFloatingReaction(content, screenX, screenY, type = 'emoji') {
    const clampedX = Math.max(60, Math.min(window.innerWidth - 60, screenX || window.innerWidth / 2));
    const clampedY = Math.max(80, Math.min(window.innerHeight - 80, screenY || window.innerHeight / 2));

    const el = document.createElement('div');

    if (type === 'meme') {
      const match = MEME_SOUNDS.find(m => m.key === content);
      const label = match ? match.label : content.toUpperCase();
      el.className = 'floating-text-msg meme-bubble';
      el.textContent = `🎵 ${label}`;
    } else if (content.length <= 4) {
      el.className = 'floating-emoji';
      el.textContent = content;
    } else {
      el.className = 'floating-text-msg';
      el.textContent = content;
    }

    el.style.left = `${clampedX}px`;
    el.style.top = `${clampedY}px`;

    this.floatingLayer.appendChild(el);

    const duration = content.length <= 4 ? 2000 : 3000;
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, duration);
  }
}
