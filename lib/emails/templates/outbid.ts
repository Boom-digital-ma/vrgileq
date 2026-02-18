export const outbidTemplate = (bidderName: string, auctionTitle: string, newAmount: number, auctionUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0B2B53; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #E11D48; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .price-box { background-color: #FFF1F2; border: 1px solid #FFE4E6; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
    .price-label { font-size: 10px; font-weight: 800; color: #E11D48; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .price-value { font-size: 32px; font-weight: 800; color: #0B2B53; margin: 0; }
    .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
    .lot-title { color: #0B2B53; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.com'}/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="h1">Outbid Alert!</h1>
      <p>Attention <strong>${bidderName}</strong>,</p>
      <p>You have been outbid on the following industrial asset. Your previous authorization has been superseded by a new high bid.</p>
      
      <p class="lot-title" style="margin-top: 24px; font-size: 18px;">${auctionTitle}</p>
      
      <div class="price-box">
        <div class="price-label">Current High Bid</div>
        <div class="price-value">$${newAmount.toLocaleString()}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Don't miss out on this opportunity. Increase your bid or set a maximum proxy bid to automatically defend your position.</p>
      
      <div style="text-align: center;">
        <a href="${auctionUrl}" class="button">Increase My Bid</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Virginia Liquidation. All rights reserved.</p>
      <p>123 Industrial Way, Richmond, VA 23219</p>
    </div>
  </div>
</body>
</html>
`;
