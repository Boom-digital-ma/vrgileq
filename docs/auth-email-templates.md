# 🛠️ Supabase Auth Email Templates (Reference)

Copy and paste these into **Supabase Dashboard -> Auth -> Email Templates**.

## 1. Confirm Signup
**Subject:** `{{ .Token }} is your verification code for Virginia Liquidation`

**Body:**
```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 4px solid #049A9E;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #049A9E; text-transform: uppercase; font-size: 24px; letter-spacing: -0.05em; font-style: italic; margin: 0;">Virginia Liquidation</h1>
    <p style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #464646; margin-top: 5px;">Industrial & Commercial Auctions</p>
  </div>

  <h2 style="color: #0B2B53; text-transform: uppercase; font-size: 32px; letter-spacing: -0.05em; margin-bottom: 20px;">Verify Your Identity</h2>
  
  <p style="color: #464646; font-size: 16px; line-height: 1.6;">Hello,</p>
  <p style="color: #464646; font-size: 16px; line-height: 1.6;">Welcome to the marketplace. Please use the following 6-digit code to complete your registration and secure your account:</p>

  <div style="background-color: #f4f4f4; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #049A9E;">
    <span style="font-family: monospace; font-size: 48px; font-weight: 900; letter-spacing: 0.3em; color: #049A9E;">{{ .Token }}</span>
  </div>

  <p style="color: #464646; font-size: 14px; line-height: 1.6; font-style: italic;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>

  <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px; color: #999; font-size: 12px; text-align: center;">
    © 2026 Virginia Liquidation. All rights reserved.<br>
    Industrial assets, commercial equipment, and estate liquidations.
  </div>
</div>
```

---

## 2. Reset Password
**Subject:** `{{ .Token }} is your recovery code`

**Body:**
```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 4px solid #0B2B53;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #049A9E; text-transform: uppercase; font-size: 24px; letter-spacing: -0.05em; font-style: italic; margin: 0;">Virginia Liquidation</h1>
  </div>

  <h2 style="color: #0B2B53; text-transform: uppercase; font-size: 32px; letter-spacing: -0.05em; margin-bottom: 20px;">Password Recovery</h2>
  
  <p style="color: #464646; font-size: 16px; line-height: 1.6;">A request was made to reset your password. Use the authorization code below to gain access to your account:</p>

  <div style="background-color: #0B2B53; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #049A9E; box-shadow: 8px 8px 0px 0px #049A9E;">
    <span style="font-family: monospace; font-size: 48px; font-weight: 900; letter-spacing: 0.3em; color: #049A9E;">{{ .Token }}</span>
  </div>

  <p style="color: #464646; font-size: 14px; line-height: 1.6;">Enter this code on the verification screen to set a new secure password.</p>

  <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px; color: #999; font-size: 12px;">
    Virginia Liquidation Support Team<br>
    (703) 768-9000
  </div>
</div>
```

---

## 3. Change Email Address
**Subject:** `{{ .Token }} is your email change code`

**Body:**
```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 4px solid #DADADA;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #049A9E; text-transform: uppercase; font-size: 24px; letter-spacing: -0.05em; font-style: italic; margin: 0;">Virginia Liquidation</h1>
  </div>

  <h2 style="color: #0B2B53; text-transform: uppercase; font-size: 32px; letter-spacing: -0.05em; margin-bottom: 20px;">Confirm Email Change</h2>
  
  <p style="color: #464646; font-size: 16px; line-height: 1.6;">You requested to change your account email. Use the following code to verify this change:</p>

  <div style="background-color: #f4f4f4; padding: 30px; text-align: center; margin: 30px 0; border: 2px solid #DADADA;">
    <span style="font-family: monospace; font-size: 48px; font-weight: 900; letter-spacing: 0.3em; color: #0B2B53;">{{ .Token }}</span>
  </div>

  <p style="color: #464646; font-size: 14px; line-height: 1.6; font-style: italic;">If you did not request this change, please secure your account immediately.</p>
</div>
```

---

## 4. Invite User
**Subject:** `You have been invited to Virginia Liquidation`

**Body:**
```html
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 4px solid #049A9E; background-color: #0B2B53; color: white;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #049A9E; text-transform: uppercase; font-size: 24px; letter-spacing: -0.05em; font-style: italic; margin: 0;">Virginia Liquidation</h1>
  </div>

  <h2 style="color: white; text-transform: uppercase; font-size: 32px; letter-spacing: -0.05em; margin-bottom: 20px;">Private Invitation</h2>
  
  <p style="color: #DADADA; font-size: 16px; line-height: 1.6;">You have been invited to join the Virginia Liquidation marketplace as an authorized user.</p>

  <div style="margin: 40px 0; text-align: center;">
    <a href="{{ .ConfirmationURL }}" style="background-color: #049A9E; color: white; padding: 18px 35px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 14px; letter-spacing: 0.1em; border-radius: 0;">Accept Invitation</a>
  </div>

  <p style="color: #DADADA; font-size: 12px; line-height: 1.6; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
    By clicking the button above, you will be able to set your password and access the platform.
  </p>
</div>
```
