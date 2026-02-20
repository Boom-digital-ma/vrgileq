# Supabase Auth Email Templates (Robust Inline Version)

Copy the code blocks below and paste them into the corresponding sections in **Dashboard Supabase -> Authentication -> Email Templates**.

---

## 1. Confirm Signup
**Subject:** `{{ .Token }} is your verification code for Virginia Liquidation`

```html
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; color: #464646;">
  <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #F3F4F6;">
    <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="120" style="display: block; margin: 0 auto; width: 120px; height: auto;">
  </div>
  <div style="padding: 40px;">
    <h1 style="color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic;">Verify Your Identity</h1>
    <p style="margin-bottom: 24px; line-height: 1.6;">Welcome to the marketplace. To complete your secure registration and gain bidding authorization, please use the following transmission code:</p>
    <div style="background-color: #F0FDFA; border: 2px dashed #049A9E; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
      <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Secure Verification Code</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 800; color: #049A9E; letter-spacing: 0.2em; margin: 0;">{{ .Token }}</div>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #64748B; font-style: italic;">This protocol code will expire in 15 minutes for security reasons.</p>
  </div>
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6;">
    <p style="margin: 4px 0;">© 2026 Virginia Liquidation. All rights reserved.</p>
    <p style="margin: 4px 0;">Industrial B2B Marketplace • Northern Virginia</p>
  </div>
</div>
```

---

## 2. Reset Password
**Subject:** `Reset your Virginia Liquidation security code`

```html
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; color: #464646;">
  <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #F3F4F6;">
    <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="120" style="display: block; margin: 0 auto; width: 120px; height: auto;">
  </div>
  <div style="padding: 40px;">
    <h1 style="color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic;">Reset Security Code</h1>
    <p style="margin-bottom: 24px; line-height: 1.6;">A request has been initiated to reset your access credentials. Use the protocol code below to proceed with the recovery sequence:</p>
    <div style="background-color: #FEF2F2; border: 2px dashed #EF4444; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
      <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Recovery Access Code</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 800; color: #EF4444; letter-spacing: 0.2em; margin: 0;">{{ .Token }}</div>
    </div>
    <p style="font-size: 14px; line-height: 1.6; color: #64748B; font-style: italic;">If you did not authorize this request, please contact security immediately.</p>
  </div>
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6;">
    <p style="margin: 4px 0;">© 2026 Virginia Liquidation. All rights reserved.</p>
  </div>
</div>
```

---

## 3. Magic Link
**Subject:** `Access your Virginia Liquidation bidding dashboard`

```html
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; color: #464646;">
  <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #F3F4F6;">
    <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="120" style="display: block; margin: 0 auto; width: 120px; height: auto;">
  </div>
  <div style="padding: 40px; text-align: center;">
    <h1 style="color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic;">Instant Access</h1>
    <p style="margin-bottom: 32px; line-height: 1.6;">Click the secure transmission node below to gain immediate access to your bidding profile.</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #049A9E; color: #ffffff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; box-shadow: 0 10px 15px -3px rgba(4, 154, 158, 0.3);">Execute Authentication</a>
    <p style="margin-top: 32px; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em;">This link is valid for single use only.</p>
  </div>
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6;">
    <p style="margin: 4px 0;">© 2026 Virginia Liquidation. All rights reserved.</p>
  </div>
</div>
```

---

## 4. Change Email Address
**Subject:** `Confirm your new digital hub for Virginia Liquidation`

```html
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; color: #464646;">
  <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #F3F4F6;">
    <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="120" style="display: block; margin: 0 auto; width: 120px; height: auto;">
  </div>
  <div style="padding: 40px;">
    <h1 style="color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic;">Update Digital Hub</h1>
    <p style="margin-bottom: 24px; line-height: 1.6;">Please use the following verification code to confirm your new primary contact email:</p>
    <div style="background-color: #F0FDFA; border: 2px dashed #049A9E; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
      <div style="font-size: 10px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Email Transfer Code</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 48px; font-weight: 800; color: #049A9E; letter-spacing: 0.2em; margin: 0;">{{ .Token }}</div>
    </div>
  </div>
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6;">
    <p style="margin: 4px 0;">© 2026 Virginia Liquidation. All rights reserved.</p>
  </div>
</div>
```

---

## 5. User Invitation
**Subject:** `You have been authorized to join Virginia Liquidation`

```html
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; color: #464646;">
  <div style="background-color: #F9FAFB; padding: 30px; text-align: center; border-bottom: 1px solid #F3F4F6;">
    <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-transparent.png" alt="Virginia Liquidation" width="120" style="display: block; margin: 0 auto; width: 120px; height: auto;">
  </div>
  <div style="padding: 40px; text-align: center;">
    <h1 style="color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic;">Account Provisioned</h1>
    <p style="margin-bottom: 32px; line-height: 1.6;">An industrial bidding account has been provisioned for you. Execute the activation protocol below to set your credentials.</p>
    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #0B2B53; color: #ffffff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; box-shadow: 0 10px 15px -3px rgba(11, 43, 83, 0.3);">Activate My Account</a>
    <p style="margin-top: 32px; font-size: 11px; color: #94A3B8; text-transform: uppercase;">Virginia Liquidation • Authorized Entry Only</p>
  </div>
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6;">
    <p style="margin: 4px 0;">© 2026 Virginia Liquidation. All rights reserved.</p>
  </div>
</div>
```
