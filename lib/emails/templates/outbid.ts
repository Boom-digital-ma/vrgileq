export const outbidTemplate = (bidderName: string, auctionTitle: string, newAmount: number, auctionUrl: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
  <h1 style="color: #049A9E; text-transform: uppercase; letter-spacing: -0.05em;">You've been outbid!</h1>
  <p>Hello ${bidderName},</p>
  <p>Someone just placed a higher bid of <strong>$${newAmount.toLocaleString()}</strong> on <strong>"${auctionTitle}"</strong>.</p>
  <div style="margin: 30px 0;">
    <a href="${auctionUrl}" style="background-color: #049A9E; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px;">Place a higher bid</a>
  </div>
  <p style="color: #666; font-size: 12px; margin-top: 40px;">Virginia Liquidation • Industrial Auctions</p>
</div>
`;
