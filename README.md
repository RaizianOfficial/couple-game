# 🌸 Our Little Town - A Two-Player Couple Game (Web, PWA)

A sweet, dreamy, real-time two-player web game. Two people, each on their own phone (or desktop), join the same room online, see each other live in a small isometric 2.5D city, walk around, hold hands, use fun interactive spots (tandem bike, twin swing, cozy tea stall), send sweet emoji reactions, and play couple mini-games.

Tone: cute, romantic-but-innocent, family-friendly. No explicit content, no tracking scripts, no third-party analytics.

---

## 🌟 Highlights & Features

1. **Isometric 2.5D Pastel City (Three.js)**
   - Orthographic camera calibrated at isometric angle (35.26° elevation, 45° rotation).
   - Dreamy pastel palette: peach, lavender, baby pink, soft mint, warm sunset sky gradient.
   - Low-poly procedural 3D town: bakery, flower cottage, bookshop, glowing street lamp posts, park benches, cobblestone paths, and a tranquil pond with floating lotus lilies.
   - Zero external images or 3D model files: everything is procedurally generated with code primitives.

2. **Low-Poly Couple Characters**
   - Capsule body, sphere head, custom hair, limbs, and facial blushes.
   - Smooth walk animations with leg/arm swing and idle breathing bob.
   - Real-time shadows for both characters with grounded blob shadows.

3. **Consent-Based Cooperative Hand Holding**
   - When within ~2.5 units, a "Hold Hands" button appears on both screens.
   - Hands join only while **both** players are pressing and holding their button.
   - Joined hands render a glowing ribbon with floating heart particles.
   - Cooperative movement: walks side by side, smoothly blending and averaging inputs.

4. **Interactive Spots**
   - **Tandem Bicycle**: Front driver seat (steers bike with joystick) and rear passenger seat.
   - **Twin Swing**: Dual wooden swing set with synchronized swinging physics.
   - **Tea Stall**: Cozy stall with a single shared tea cup, steam particle animations, and a "Pass the Cup" action that pops a sweet heart.
   - Transactions prevent race conditions or claiming occupied spots.

5. **Sweet Emoji Reactions**
   - Emoji tray with sweet emojis: ❤️, 😍, 😂, 🥰, 😘, ✨, 👏, 🌹.
   - Floats up smoothly in 3D/screen space above the sender's character on the partner's screen.
   - Rate limited to 1 emoji per 600 ms.

6. **Couple Mini-Games**
   - **Tic-Tac-Toe**: 3x3 board, synced turns, win/draw animations, and play-again restart.
   - **Style Your Partner**: Pick hats, top colors, bottom colors, and accessories for each other. Simultaneous reveal with cheerful celebration animation!

7. **PWA & Mobile First**
   - Native PWA with `manifest.json` (fullscreen, landscape, pastel theme).
   - Hand-written Service Worker (`sw.js`) caching app shell for instant offline launch.
   - Automatic portrait rotation overlay: "Please rotate your phone".
   - Virtual analog touch joystick with dead zone and camera-relative direction projection.
   - Screen Wake Lock API to prevent phone screens from dimming during gameplay.

8. **Privacy by Design**
   - Anonymous Firebase authentication only.
   - No tracking, no analytics, no external ads or cookies.
   - Nickname is optional and lives only inside the temporary room.

---

## 🚀 Setup & Development

### Prerequisites
- Node.js (v18+ or v22+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase (.env)
Create a `.env` file in the project root (see `.env.example`):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

> **Note on Local Multi-Tab Simulation:**  
> If `VITE_FIREBASE_*` keys are not provided or default placeholders are used, the game automatically switches to an in-memory `BroadcastChannel` local simulator. This lets you test two players simultaneously across two browser windows/tabs immediately without needing cloud credentials!

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Build for Production
```bash
npm run build
```
The optimized bundle is placed in `dist/` (gzipped total size is ~226 kB, well within the 1 MB budget).

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🔒 Firebase Security Rules & Deployment

Deploy the Firebase Realtime Database rules (`database.rules.json`):

```bash
# Ensure Firebase CLI is installed and logged in
firebase login
firebase use your-project-id

# Deploy only the database rules
firebase deploy --only database
```

### Deploying to Firebase Hosting
```bash
firebase deploy --only hosting
```

---

## 🧪 Automated Testing (Playwright)

Run the full end-to-end multi-player test suite:
```bash
npm run test:e2e
```
The automated test verifies:
1. Portrait rotation overlay when viewport is 390x844.
2. PWA manifest validity and Service Worker registration.
3. Player A creates room with a 5-letter code.
4. Player B joins with code (`?room=ABCDE`).
5. Live multi-player presence and movement interpolation.
6. Cooperative Hand Holding (requires mutual button press).
7. Sweet Emoji Reactions floating on partner's screen.
8. Tic-Tac-Toe mini-game match.
9. Outfit Change Game styling and reveal.
10. Partner disconnect detection and graceful seat/hands release.

---

## 📋 Known Limitations

1. **Orientation Lock on iOS Safari**: Apple Safari does not permit programmatic `screen.orientation.lock()`. The game includes a responsive full-screen rotation warning overlay as an automatic fallback.
2. **Audio Auto-Play Policies**: Browsers require a user gesture (e.g. tap on Create Room or joystick) before Web Audio can produce sound. Audio context automatically resumes upon first touch.
3. **Room Expiry**: Rooms are transient; Firebase transactions maintain seat occupancy, and `onDisconnect` cleans up presence. For permanent room purges after 24h, a Firebase Scheduled Cloud Function can be attached.
