import { test, expect } from '@playwright/test';

// Generate a random email for each test run to use with yopmail.com
const randomUser = `bidder-${Math.floor(Math.random() * 100000)}`;
const randomEmail = `${randomUser}@yopmail.com`;

test.describe('Authentication Global Flow', () => {

  test('Full Signup Flow (End-to-End)', async ({ page }) => {
    // INCREASE TIMEOUT for this very long E2E journey
    test.setTimeout(120000);
    
    await page.goto('/auth/signup');

    // STEP 1: Identity
    await page.getByPlaceholder('FULL NAME').fill('Test Automation User');
    await page.getByPlaceholder('(703) 000-0000').fill('7031234567');
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill(randomEmail);
    await page.locator('input[type="password"]').first().fill('Password123!');
    await page.locator('input[type="password"]').last().fill('Password123!');
    await page.getByRole('button', { name: /Next: Physical Location/i }).click();

    // STEP 2: Location
    await page.getByPlaceholder('STREET ADDRESS').fill('123 Industrial Way');
    await page.getByPlaceholder('CITY').fill('Richmond');
    await page.getByPlaceholder('ZIP CODE').fill('23219');
    await page.getByRole('button', { name: /Next: Verification/i }).click();

    // STEP 3: Security (Stripe)
    // Stripe Elements is inside an iframe. Use a more robust selector for the frame.
    const stripeIframe = page.frameLocator('iframe[name^="__privateStripeFrame"], iframe[title*="payment"], iframe[title*="card"]').first();
    
    // Wait for the card number field to be ready
    const cardNumberInput = stripeIframe.locator('input[name="cardnumber"]');
    await cardNumberInput.waitFor({ state: 'visible', timeout: 20000 });

    // Type the test card number sequentially (more reliable for Stripe)
    await cardNumberInput.pressSequentially('4242424242424242', { delay: 50 });
    
    // Fill expiry
    await stripeIframe.locator('input[name="exp-date"]').pressSequentially('1230', { delay: 50 });
    
    // Fill CVC
    await stripeIframe.locator('input[name="cvc"]').pressSequentially('123', { delay: 50 });
    
    // Fill Zip if required
    const zipInput = stripeIframe.locator('input[name="postal"]');
    if (await zipInput.isVisible()) {
        await zipInput.fill('23219');
    }

    // Click "Synchronize Card"
    await page.getByRole('button', { name: /Synchronize Card/i }).click();

    // Verify transmission success (Step 4 is automatically triggered on success)
    await expect(page.getByText('Agreements', { exact: true })).toBeVisible({ timeout: 15000 });

    // STEP 4: Agreements
    // Use getByText for more reliability on the signature label
    await page.getByText('Execute Agreement Signature').click();
    
    // Finalize - Wait for the button to be enabled
    const finalizeButton = page.getByRole('button', { name: /Finalize Account Execution/i });
    await expect(finalizeButton).toBeEnabled();
    await finalizeButton.click();

    // If redirection fails, check if an error message appeared on the page
    try {
        await expect(page).toHaveURL(/.*\/auth\/verify/, { timeout: 15000 });
    } catch (e) {
        // If timeout reached, check for visible error alert
        const errorAlert = page.locator('.bg-rose-50');
        if (await errorAlert.isVisible()) {
            const errorText = await errorAlert.textContent();
            throw new Error(`Signup failed with error: ${errorText}`);
        }
        throw e;
    }

    await expect(page.getByText(/Verify Identity/i)).toBeVisible();
    await expect(page.getByText(/Enter the transmission code/i)).toBeVisible();

    // --- AUTOMATED OTP EXTRACTION FROM YOPMAIL ---
    const context = page.context();
    const mailPage = await context.newPage();
    
    // Go to yopmail homepage
    await mailPage.goto('https://yopmail.com/en/');
    
    // Fill the login input and press Enter
    await mailPage.fill('#login', randomUser);
    await mailPage.keyboard.press('Enter');
    
    await mailPage.waitForTimeout(3000); // Wait for transition to inbox
    
    let otpCode = '';
    // Try to find the code for up to 90 seconds (18 attempts)
    for (let i = 0; i < 18; i++) {
        const mailFrame = mailPage.frame({ name: 'ifmail' });
        if (mailFrame) {
            const bodyText = await mailFrame.innerText('body');
            // Regex to find a 6 to 8-digit code
            const match = bodyText.match(/\b\d{6,8}\b/); 
            if (match) {
                otpCode = match[0];
                break;
            }
        }
        await mailPage.waitForTimeout(5000); // Wait 5s before next attempt
        await mailPage.locator('#refresh').click().catch(() => {});
    }

    if (!otpCode) throw new Error("Could not find OTP code (6-8 digits) in Yopmail inbox after 90 seconds");

    // Close mail page and return to main
    await mailPage.close();
    
    // Fill the OTP
    await page.getByPlaceholder('000000').fill(otpCode);
    await page.getByRole('button', { name: /Authorize Access/i }).click();

    // Final verification: Should land on auctions page with verified flag in URL
    await expect(page).toHaveURL(/.*verified=true/, { timeout: 15000 });
  });

  test('Login Success & Logout', async ({ page }) => {
    await page.goto('/auth/signin');

    // Fill credentials
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill('jegramuyatru-1717@yopmail.com');
    await page.getByPlaceholder('••••••••').fill('Pass’121');
    
    // Click login
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();

    // Verify redirection (accepts either profile or auctions catalog)
    await expect(page).toHaveURL(/.*\/(profile|auctions)/, { timeout: 10000 });
    
    // TEST LOGOUT
    // Use the reliable aria-label we just added
    await page.getByLabel('Logout').click();

    // Should redirect to home after full page reload
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
  });

  test('Login Failure Flow', async ({ page }) => {
    await page.goto('/auth/signin');

    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill('wrong@example.com');
    await page.getByPlaceholder('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();

    // Should show error
    await expect(page.getByText(/Invalid login credentials/i)).toBeVisible();
  });

  test('Navigation accessibility when logged out', async ({ page }) => {
    await page.goto('/');
    
    // Check if Header has Join and Sign In
    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Join/i })).toBeVisible();
    
    // Try to access profile directly - should redirect
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*\/auth\/signin/);
  });

});
