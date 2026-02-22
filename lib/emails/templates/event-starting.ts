export const eventStartingTemplate = (userName: string, eventTitle: string, eventUrl: string, startAt: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
    .container { max-w-600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 16px; margin-top: 40px; border: 1px solid #e4e4e7; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-weight: 900; font-size: 24px; color: #0B2B53; text-transform: uppercase; letter-spacing: 2px; }
    .title { font-size: 24px; font-weight: 800; color: #0B2B53; margin-bottom: 16px; text-transform: uppercase; }
    .text { color: #52525b; line-height: 1.6; font-size: 16px; margin-bottom: 24px; }
    .highlight { color: #049A9E; font-weight: 700; }
    .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; margin-top: 20px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f4f4f5; text-align: center; color: #a1a1aa; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Virginia Liquidation</div>
    </div>
    <h1 class="title">Event Starting Soon!</h1>
    <p class="text">Hello ${userName},</p>
    <p class="text">
      The event you are watching, <span class="highlight">${eventTitle}</span>, is about to begin.
    </p>
    <p class="text">
        Start Time: <strong>${new Date(startAt).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })}</strong>
    </p>
    <div style="text-align: center;">
      <a href="${eventUrl}" class="button">Enter Auction Room</a>
    </div>
    <p class="text" style="margin-top: 30px; font-size: 14px; text-align: center;">
      Prepare your bids early. Good luck!
    </p>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Virginia Liquidation. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
