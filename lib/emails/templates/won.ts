export const winningTemplate = (bidderName: string, auctionTitle: string, winningAmount: number, checkoutUrl: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
  <h1 style="color: #049A9E; text-transform: uppercase; letter-spacing: -0.05em;">You won the auction!</h1>
  <p>Congratulations ${bidderName},</p>
  <p>You are the winning bidder for <strong>"${auctionTitle}"</strong> with a final bid of <strong>$${winningAmount.toLocaleString()}</strong>.</p>
  <p>Please proceed to checkout to finalize your purchase and arrange removal.</p>
  <div style="margin: 30px 0;">
    <a href="${checkoutUrl}" style="background-color: #0B2B53; color: white; padding: 15px 25px; text-decoration: none; font-weight: bold; text-transform: uppercase; font-size: 14px;">Complete Purchase</a>
  </div>
  <p style="color: #666; font-size: 12px; margin-top: 40px;">Virginia Liquidation • Industrial Auctions</p>
</div>
`;
