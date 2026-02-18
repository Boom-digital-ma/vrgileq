import { test, expect } from '@playwright/test';

// Use the existing account provided by the user
const recoveryUser = 'jegramuyatru-1717';
const recoveryEmail = `${recoveryUser}@yopmail.com`;
const originalPassword = 'NewSecurePass123!';
const tempPassword = 'Pass’121';

test.describe('Account Recovery Flow', () => {

  test('Should recover password using Yopmail OTP', async ({ page }) => {
    test.setTimeout(120000);

    // 1. REQUEST RECOVERY
    await page.goto('/auth/forgot-password');
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill(recoveryEmail);
    await page.getByRole('button', { name: /Transmit Recovery Link/i }).click();

    // Verify redirection to verification page
    await expect(page).toHaveURL(/.*type=recovery/, { timeout: 15000 });

    // 2. EXTRACT OTP FROM YOPMAIL
    const context = page.context();
    const mailPage = await context.newPage();
    
    // Go to yopmail homepage
    await mailPage.goto('https://yopmail.com/en/');
    await mailPage.fill('#login', recoveryUser);
    await mailPage.keyboard.press('Enter');
    
    await mailPage.waitForTimeout(3000); 
    
    let otpCode = '';
    // Try to find the code for up to 60 seconds
    for (let i = 0; i < 12; i++) {
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
        await mailPage.waitForTimeout(5000);
        await mailPage.locator('#refresh').click().catch(() => {});
    }

    if (!otpCode) throw new Error("Recovery OTP not found in Yopmail");
    await mailPage.close();

    // 3. VERIFY OTP
    await page.getByPlaceholder('000000').fill(otpCode);
    await page.getByRole('button', { name: /Authorize Access/i }).click();

    // 4. RESET PASSWORD
    await expect(page).toHaveURL(/.*\/auth\/reset-password/, { timeout: 15000 });
    await page.locator('input[name="password"]').fill(tempPassword);
    await page.locator('input[name="confirm"]').fill(tempPassword);
    await page.getByRole('button', { name: /Execute Credentials Update/i }).click();

    // 5. FINAL LOGIN CHECK WITH NEW PASSWORD
    await expect(page).toHaveURL(/.*\/auth\/signin/, { timeout: 15000 });
    await page.getByPlaceholder('EMAIL@DOMAIN.COM').fill(recoveryEmail);
    await page.getByPlaceholder('••••••••').fill(tempPassword);
    await page.getByRole('button', { name: /Enter Auction Room/i }).click();

    // Redirection to auctions or profile means success
    await expect(page).toHaveURL(/.*\/(auctions|profile)/, { timeout: 15000 });
    
    // NOTE: To keep the test repeatable, you might want to reset the password back 
    // to originalPassword manually or via another test step.
  });

});
