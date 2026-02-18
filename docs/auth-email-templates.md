# 🛠️ Supabase Auth Email Templates (SaaS Premium Redesign)

Copy and paste these into **Supabase Dashboard -> Auth -> Email Templates**.

## 1. Confirm Signup
**Subject:** `{{ .Token }} is your verification code for Virginia Liquidation`

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0B2B53; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .code-box { background-color: #F0FDFA; border: 2px dashed #049A9E; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; }
    .code-value { font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 800; color: #049A9E; letter-spacing: 0.2em; margin: 0; }
    .label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://virginialiquidation.com/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
    </div>
    <div class="content">
      <h1 class="h1">Verify Your Identity</h1>
      <p>Welcome to the marketplace. To complete your secure registration and gain bidding authorization, please use the following transmission code:</p>
      
      <div class="code-box">
        <div class="label">Secure Verification Code</div>
        <div class="code-value">{{ .Token }}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #64748B; font-style: italic;">This protocol code will expire in 15 minutes for security reasons. If you did not initiate this request, please disregard this transmission.</p>
    </div>
    <div class="footer">
      <p>© 2026 Virginia Liquidation. All rights reserved.</p>
      <p>Industrial B2B Marketplace • Northern Virginia</p>
    </div>
  </div>
</body>
</html>
```

---

## 2. Reset Password
**Subject:** `{{ .Token }} is your recovery code`

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0B2B53; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .code-box { background-color: #F8FAFC; border: 2px solid #0B2B53; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center; }
    .code-value { font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 800; color: #0B2B53; letter-spacing: 0.2em; margin: 0; }
    .label { font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://virginialiquidation.com/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180">
    </div>
    <div class="content">
      <h1 class="h1">Password Recovery</h1>
      <p>A master password reset protocol was initiated. Use the following authorization code to gain access to your account credentials:</p>
      
      <div class="code-box">
        <div class="label">Authorization Token</div>
        <div class="code-value">{{ .Token }}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6;">Enter this code on the verification screen to finalize your security update.</p>
    </div>
    <div class="footer">
      <p>Virginia Liquidation Support Team</p>
      <p>(703) 768-9000 • support@virginialiquidation.com</p>
    </div>
  </div>
</body>
</html>
```

---

## 3. Change Email Address
**Subject:** `{{ .Token }} is your email change code`

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; }
    .header { background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #E5E7EB; }
    .content { padding: 40px; }
    .code-box { background-color: #F1F5F9; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; }
    .code-value { font-family: monospace; font-size: 32px; font-weight: 800; color: #0B2B53; letter-spacing: 0.1em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://virginialiquidation.com/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="150">
    </div>
    <div class="content">
      <h2 style="color: #0B2B53; margin-top: 0;">Confirm Email Change</h2>
      <p>You requested to modify your primary digital mail. Use the code below to authorize this synchronization:</p>
      
      <div class="code-box">
        <div class="code-value">{{ .Token }}</div>
      </div>

      <p style="font-size: 12px; color: #94A3B8;">If you did not request this change, please secure your account immediately via the bidder portal.</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Invite User
**Subject:** `You have been invited to Virginia Liquidation`

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0B2B53; color: #ffffff; }
    .container { max-width: 600px; margin: 40px auto; background-color: #0B2B53; border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .content { padding: 60px 40px; text-align: center; }
    .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; margin: 32px 0; box-shadow: 0 10px 20px rgba(4, 154, 158, 0.3); }
    .h1 { font-size: 32px; font-weight: 800; text-transform: uppercase; font-style: italic; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <img src="https://virginialiquidation.com/images/logo-virginia-white.png" alt="Virginia Liquidation" width="200" style="margin-bottom: 40px;">
      <h1 class="h1">Authorized Invitation</h1>
      <p style="color: rgba(255,255,255,0.6); line-height: 1.6;">You have been invited to join the Virginia Liquidation marketplace as an authorized platform operator.</p>
      
      <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>

      <p style="font-size: 11px; color: rgba(255,255,255,0.3); border-top: 1px solid rgba(255,255,255,0.1); pt: 30px; margin-top: 40px;">
        This invitation grants secure access to industrial inventory and bidding protocols.
      </p>
    </div>
  </div>
</body>
</html>
```
