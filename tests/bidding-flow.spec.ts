import { test, expect } from '@playwright/test';

test.describe('Bidding Logic Flow', () => {

  test('User can place a bid on a live item', async ({ page }) => {
    test.setTimeout(120000);

    // 1. LOGIN
    await page.goto('/auth/signin');
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill('jegramuyatru-1717@yopmail.com');
    await page.getByPlaceholder('••••••••').fill('Pass’121');
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();
    await expect(page).toHaveURL(/.*\/(profile|auctions)/);

    // 2. GO TO CATALOG AND SELECT FIRST LIVE ITEM
    await page.goto('/auctions');
    
    // We need a live auction. Let's find the first one.
    const firstAuction = page.locator('article, .group.flex.flex-col.bg-white').first();
    await firstAuction.waitFor({ state: 'visible' });
    await firstAuction.click();

    // 3. CHECK AUTHORIZATION
    // If not registered, we might need to click the registration button
    const regButton = page.getByRole('button', { name: /Authorize Bidding/i }).or(page.getByRole('button', { name: /Passport/i }));
    if (await regButton.isVisible()) {
        await regButton.click();
        // Handle Stripe hold if it's the first time
        const stripeIframe = page.frameLocator('iframe[name^="__privateStripeFrame"], iframe[title*="payment"]').first();
        if (await stripeIframe.locator('input[name="cardnumber"]').isVisible()) {
            await stripeIframe.locator('input[name="cardnumber"]').pressSequentially('4242424242424242', { delay: 50 });
            await stripeIframe.locator('input[name="exp-date"]').pressSequentially('1230', { delay: 50 });
            await stripeIframe.locator('input[name="cvc"]').pressSequentially('123', { delay: 50 });
            await page.getByRole('button', { name: /Authorize \$/i }).click();
            await expect(page.getByText(/Authorization Confirmed/i)).toBeVisible({ timeout: 20000 });
        }
    }

    // 4. PLACE BID
    const biddingWidget = page.locator('form').filter({ has: page.getByRole('button', { name: /Place Bid/i }) });
    await biddingWidget.waitFor({ state: 'visible' });

    // Get current price to calculate next bid
    const currentPriceText = await page.locator('.text-primary.font-display').first().innerText();
    const currentPrice = parseInt(currentPriceText.replace(/[^0-9]/g, ''));
    const nextBid = currentPrice + 100;

    // Fill bid amount
    await page.locator('input[type="number"]').fill(nextBid.toString());
    
    // Click Bid
    await page.getByRole('button', { name: /Place Bid/i }).click();

    // 5. VERIFY SUCCESS
    // Check for toast success
    await expect(page.getByText(/Bid placed successfully/i)).toBeVisible();
    
    // Verify the price updated in the UI
    const newPriceText = await page.locator('.text-primary.font-display').first().innerText();
    expect(newPriceText).toContain(nextBid.toLocaleString());

    // Verify it appears in real-time activity
    await expect(page.locator('text=Real-time Activity')).toBeVisible();
    await expect(page.getByText(`$${nextBid.toLocaleString()}`)).toBeVisible();
  });

  test('Proxy Bidding (Max Bid) activation', async ({ page }) => {
    // 1. LOGIN
    await page.goto('/auth/signin');
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill('jegramuyatru-1717@yopmail.com');
    await page.getByPlaceholder('••••••••').fill('Pass’121');
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();

    // 2. GO TO AN ITEM
    await page.goto('/auctions');
    await page.locator('article, .group.flex.flex-col.bg-white').first().click();

    // 3. ACTIVATE PROXY
    const proxyToggle = page.locator('button').filter({ hasText: /Proxy Bidding/i }).or(page.locator('.relative.inline-flex.h-6.w-11'));
    if (await proxyToggle.isVisible()) {
        await proxyToggle.click();
        await expect(page.getByText(/Your Maximum Limit/i)).toBeVisible();
        
        // Fill a high max bid
        await page.locator('input[type="number"]').fill('10000');
        await expect(page.getByRole('button', { name: /Set Maximum/i })).toBeVisible();
    }
  });

});
