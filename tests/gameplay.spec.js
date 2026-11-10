import { test, expect } from '@playwright/test';

test.describe('Our Little Town - Couple Game End-to-End Suite', () => {

  test('1. Verify portrait overlay appears in portrait orientation (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    // Rotate overlay should be visible in portrait
    const rotateOverlay = page.locator('#rotate-overlay');
    await expect(rotateOverlay).toBeVisible();
    await expect(page.locator('#rotate-overlay h2')).toContainText('Please Rotate Your Phone');

    // Screenshot portrait warning
    await page.screenshot({ path: 'tests/screenshots/1-portrait-overlay.png' });
  });

  test('2. Verify PWA manifest and service worker', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');

    // Check manifest
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.status()).toBe(200);
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('Our Little Town');
    expect(manifest.display).toBe('fullscreen');
    expect(manifest.orientation).toBe('landscape');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('3. Full Two-Player Couple Gameplay Lifecycle', async ({ browser }) => {
    // Context 1: Player A (Landscape Phone 844x390)
    const contextA = await browser.newContext({
      viewport: { width: 844, height: 390 }
    });
    const pageA = await contextA.newPage();

    // Context 2: Player B (Landscape Phone 844x390)
    const contextB = await browser.newContext({
      viewport: { width: 844, height: 390 }
    });
    const pageB = await contextB.newPage();

    // 1. Player A opens landing and creates room
    await pageA.goto('/');
    await pageA.fill('#landing-nickname', 'Sunny');
    await pageA.click('#btn-create-room');

    // Verify Player A is on waiting screen and gets 5-character code
    const waitingCodeEl = pageA.locator('#waiting-room-code');
    await expect(waitingCodeEl).toBeVisible({ timeout: 15000 });
    const roomCode = (await waitingCodeEl.textContent()).trim();
    expect(roomCode.length).toBe(5);
    console.log(`[Test] Created Room Code: ${roomCode}`);

    await pageA.screenshot({ path: 'tests/screenshots/2-playerA-waiting.png' });

    // 2. Player B joins with room code
    await pageB.goto(`/?room=${roomCode}`);
    await pageB.fill('#landing-nickname', 'Luna');
    await pageB.click('#btn-join-room');

    // Both should now be in the game, waiting screen dismissed
    await expect(pageA.locator('#screen-waiting')).toBeHidden({ timeout: 10000 });
    await expect(pageA.locator('#hud-presence-text')).toContainText('Partner connected');
    await expect(pageB.locator('#hud-presence-text')).toContainText('Partner connected');

    await pageA.waitForTimeout(1000);
    await pageA.screenshot({ path: 'tests/screenshots/3-playerA-connected.png' });
    await pageB.screenshot({ path: 'tests/screenshots/4-playerB-connected.png' });

    // 3. Move Player A with keyboard controls
    await pageA.keyboard.press('KeyW');
    await pageA.waitForTimeout(200);

    // 4. Test Hold Hands: Players spawn near center facing each other (<2.5 units)
    const holdBtnA = pageA.locator('#hud-hold-hands-btn');
    const holdBtnB = pageB.locator('#hud-hold-hands-btn');

    // Verify hold button appears
    await expect(holdBtnA).toBeVisible({ timeout: 8000 });
    await expect(holdBtnB).toBeVisible({ timeout: 8000 });

    // Both players press and hold
    await holdBtnA.dispatchEvent('pointerdown');
    await holdBtnB.dispatchEvent('pointerdown');
    await pageA.waitForTimeout(600);

    await expect(holdBtnA).toHaveClass(/active-holding/);
    await expect(holdBtnB).toHaveClass(/active-holding/);
    await pageA.screenshot({ path: 'tests/screenshots/5-holding-hands-A.png' });
    await pageB.screenshot({ path: 'tests/screenshots/5-holding-hands-B.png' });

    // Release hand hold
    await holdBtnA.dispatchEvent('pointerup');
    await holdBtnB.dispatchEvent('pointerup');
    await pageA.waitForTimeout(400);

    // 5. Send Emoji Reaction from Player A
    await pageA.click('#hud-emoji-btn');
    await expect(pageA.locator('.emoji-tray')).toBeVisible();
    await pageA.locator('.emoji-btn').first().click(); // Click ❤️

    // Verify emoji floats on Player B screen
    await expect(pageB.locator('.floating-emoji')).toBeVisible({ timeout: 8000 });
    await pageB.screenshot({ path: 'tests/screenshots/6-emoji-received-B.png' });

    // 6. Test Tic-Tac-Toe Mini Game
    await pageA.click('#hud-games-btn');
    await pageA.click('#choice-tictactoe');
    await expect(pageA.locator('#modal-tictactoe')).toBeVisible();

    await pageB.click('#hud-games-btn');
    await pageB.click('#choice-tictactoe');
    await expect(pageB.locator('#modal-tictactoe')).toBeVisible();

    // Player A ('X') plays cell 0
    await pageA.waitForTimeout(400);
    await pageA.locator('.ttt-cell[data-index="0"]').click();
    await pageA.waitForTimeout(600);

    // Cell 0 should reflect on both screens
    await expect(pageA.locator('.ttt-cell[data-index="0"]')).toHaveText('X');
    await expect(pageB.locator('.ttt-cell[data-index="0"]')).toHaveText('X');

    await pageA.screenshot({ path: 'tests/screenshots/7-tictactoe-match.png' });

    // Close Tic-Tac-Toe
    await pageA.click('#ttt-close-btn');
    await pageB.click('#ttt-close-btn');

    // 7. Test Outfit Game
    await pageA.click('#hud-games-btn');
    await pageA.click('#choice-outfit');
    await expect(pageA.locator('#modal-outfit')).toBeVisible();

    await pageB.click('#hud-games-btn');
    await pageB.click('#choice-outfit');
    await expect(pageB.locator('#modal-outfit')).toBeVisible();

    // Player A picks and submits
    await pageA.click('#outfit-submit-btn');
    await pageA.waitForTimeout(300);

    // Player B picks and submits
    await pageB.click('#outfit-submit-btn');
    await pageB.waitForTimeout(600);

    // Reveal status should be active on both
    await expect(pageA.locator('#outfit-status')).toHaveClass(/revealed/);
    await expect(pageB.locator('#outfit-status')).toHaveClass(/revealed/);

    await pageA.screenshot({ path: 'tests/screenshots/8-outfit-revealed-A.png' });
    await pageB.screenshot({ path: 'tests/screenshots/8-outfit-revealed-B.png' });

    await pageA.click('#outfit-close-btn');
    await pageB.click('#outfit-close-btn');

    // 8. Test Partner Disconnect
    // Leave room and close Player B's tab
    await pageB.evaluate(async () => {
      if (window.roomService) {
        await window.roomService.leaveRoom();
      }
    });
    await pageB.close({ runBeforeUnload: true });
    await pageA.waitForTimeout(1000);

    // Confirm Player A shows "Your partner went offline"
    await expect(pageA.locator('#hud-presence-badge')).toHaveClass(/offline/, { timeout: 10000 });
    await expect(pageA.locator('#hud-offline-banner')).toBeVisible({ timeout: 10000 });

    await pageA.screenshot({ path: 'tests/screenshots/9-partner-offline-A.png' });

    // Clean up
    await contextA.close().catch(() => {});
    await contextB.close().catch(() => {});
  });

});
