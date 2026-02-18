import { test, expect } from '@playwright/test';

test.describe('Watchlist Management Flow', () => {

  test('User can add and remove items from watchlist', async ({ page }) => {
    test.setTimeout(120000);

    // 1. LOGIN
    await page.goto('/auth/signin');
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill('jegramuyatru-1717@yopmail.com');
    await page.getByPlaceholder('••••••••').fill('Pass’121');
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();
    await expect(page).toHaveURL(/.*\/(profile|auctions)/);

    // 2. GO TO CATALOG AND SELECT AN EVENT
    await page.goto('/auctions');
    
    // Click on the first event to see its lots
    const firstEvent = page.locator('a[href^="/events/"]').first();
    await firstEvent.click();
    
    // Wait for the event page content to be visible
    await page.waitForURL(/.*\/events\/.*/);
    // Wait for the grid of lots to appear
    const lotGrid = page.locator('div.grid').filter({ has: page.locator('article, .group.flex.flex-col.bg-white') });
    await lotGrid.first().waitFor({ state: 'visible' });

    // 3. FIND FIRST LOT AND GET ITS TITLE
    // Use a more specific selector to avoid picking up event titles or headers
    const lotCard = page.locator('div.group.flex.flex-col.bg-white').filter({
        has: page.locator('button[aria-label*="Watchlist"]')
    }).first();
    
    await lotCard.waitFor({ state: 'visible' });
    const rawTitle = await lotCard.locator('h2').innerText();
    const itemTitle = rawTitle.trim();
    
    console.log(`Testing with lot: "${itemTitle}"`);

    // 4. TOGGLE WATCHLIST (ADD)
    const watchButton = lotCard.getByLabel(/Add to Watchlist/i);
    const removeButton = lotCard.getByLabel(/Remove from Watchlist/i);

    // Ensure clean state
    if (await removeButton.isVisible()) {
        await removeButton.click();
        await page.waitForTimeout(1000);
    }
    
    // Add to watchlist
    await lotCard.getByLabel(/Add to Watchlist/i).click();
    
    // Verify success (toast or button toggle)
    await expect(page.getByText(/Added to watchlist/i).or(removeButton).first()).toBeVisible({ timeout: 10000 });

    // 5. VERIFY IN PROFILE
    await page.goto('/profile');
    await page.getByRole('button', { name: /Watchlist/i }).click();
    
    // Check if the title exists in the watchlist tab
    await expect(page.getByText(itemTitle, { exact: false }).first()).toBeVisible({ timeout: 15000 });

    // 6. REMOVE FROM WATCHLIST (From Profile)
    // Find the link wrapping the title and click it
    const profileItemLink = page.locator('main').getByRole('link', { name: itemTitle, exact: false }).first();
    await profileItemLink.click();
    await page.waitForURL(/.*\/auctions\/.*/, { timeout: 20000 });
    
    // Click remove
    await page.getByLabel(/Remove from Watchlist/i).click();
    
    // Verify toast
    await expect(page.getByText(/Removed from watchlist/i)).toBeVisible();

    // 7. FINAL CHECK IN PROFILE
    await page.goto('/profile');
    await page.getByRole('button', { name: /Watchlist/i }).click();
    await expect(page.getByText(itemTitle, { exact: false })).not.toBeVisible();
  });

});
