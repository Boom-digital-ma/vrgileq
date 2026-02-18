export const closingSoonTemplate = (bidderName: string, auctionTitle: string, currentPrice: number, auctionUrl: string, timeLeft: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-top: 4px solid #049A9E;">
  <h1 style="color: #0B2B53; text-transform: uppercase; letter-spacing: -0.05em; font-style: italic;">Auction Closing Soon!</h1>
  <p>Hello ${bidderName},</p>
  <p>An item in your watchlist is about to close. Don't miss your chance to place a final bid!</p>
  
  <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #eee; margin: 20px 0;">
    <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #049A9E;">${auctionTitle}</h2>
    <p style="margin: 0; font-size: 14px;"><strong>Current Price:</strong> $${currentPrice.toLocaleString()}</p>
    <p style="margin: 5px 0 0 0; font-size: 14px; color: #ff4d4f;"><strong>Time Left:</strong> ${timeLeft}</p>
  </div>

  <div style="margin: 30px 0; text-align: center;">
    <a href="${auctionUrl}" style="background-color: #049A9E; color: white; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px; box-shadow: 4px 4px 0px 0px #0B2B53;">View Auction Now</a>
  </div>

  <p style="color: #666; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; pt: 20px;">
    Virginia Liquidation • Industrial Auctions<br/>
    You are receiving this email because this item is in your watchlist.
  </p>
</div>
`;
