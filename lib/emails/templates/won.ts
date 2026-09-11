export const winningTemplate = (bidderName: string, auctionTitle: string, winningAmount: number, checkoutUrl: string, imageUrl?: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #fff; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #049A9E; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .price-box { background-color: #F0FDFA; border: 1px solid #CCFBF1; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
    .price-label { font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .price-value { font-size: 32px; font-weight: 800; color: #0B2B53; margin: 0; }
    .button { display: inline-block; background-color: #0B2B53; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s ease; box-shadow: 4px 4px 0px 0px #049A9E; }
    .lot-title { color: #0B2B53; font-weight: 700; }
    .product-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 16px; margin-bottom: 24px; border: 1px solid #E5E7EB; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="h1">You Won!</h1>
      <p>Congratulations <strong>${bidderName}</strong>,</p>

      ${imageUrl ? `<img src="${imageUrl}" alt="${auctionTitle}" class="product-image">` : ''}

      <p>You are the winning bidder on:</p>

      <p class="lot-title" style="margin-top: 24px; font-size: 18px;">${auctionTitle}</p>

      <div class="price-box">
        <div class="price-label">Winning Price</div>
        <div class="price-value">$${winningAmount.toLocaleString()}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">View your invoice and schedule your pickup from your account.</p>

      <div style="text-align: center;">
        <a href="${checkoutUrl}" class="button">View My Invoice</a>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Virginialiquidation.com All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
