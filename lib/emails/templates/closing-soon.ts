export const closingSoonTemplate = (bidderName: string, auctionTitle: string, currentPrice: number, auctionUrl: string, timeLeft: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #0B2B53; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .alert-box { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px; margin: 24px 0; }
    .alert-label { font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .lot-title { color: #0B2B53; font-weight: 700; font-size: 18px; margin-bottom: 12px; }
    .stats { display: flex; justify-content: space-between; border-top: 1px solid #F1F5F9; pt: 16px; margin-top: 16px; }
    .button { display: inline-block; background-color: #0B2B53; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_SITE_URL || 'https://virginialiquidation.com'}/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="h1">Auction Closing Soon</h1>
      <p>Hello <strong>${bidderName}</strong>,</p>
      <p>An industrial asset in your watchlist is approaching its final minutes. Final authorizations are now being accepted.</p>
      
      <div class="alert-box">
        <div class="alert-label">Monitored Asset</div>
        <div class="lot-title">${auctionTitle}</div>
        
        <div style="margin-top: 16px;">
          <table width="100%">
            <tr>
              <td>
                <div style="font-size: 10px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Current Valuation</div>
                <div style="font-size: 20px; font-weight: 800; color: #0B2B53;">$${currentPrice.toLocaleString()}</div>
              </td>
              <td align="right">
                <div style="font-size: 10px; color: #E11D48; text-transform: uppercase; font-weight: 700;">Closing In</div>
                <div style="font-size: 20px; font-weight: 800; color: #E11D48;">${timeLeft}</div>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">Don't lose this acquisition opportunity. Place your final bid now to secure the asset.</p>
      
      <div style="text-align: center;">
        <a href="${auctionUrl}" class="button">Place Final Bid</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Virginia Liquidation. All rights reserved.</p>
      <p>Industrial B2B Marketplace • Northern Virginia</p>
    </div>
  </div>
</body>
</html>
`;
