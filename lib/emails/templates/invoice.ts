export const invoiceTemplate = (params: {
  customerName: string;
  invoiceNumber: string;
  items: { title: string; lotNumber?: number; price: number }[];
  hammerTotal: number;
  buyersPremium: number;
  tax: number;
  totalAmount: number;
  invoiceUrl: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Plus Jakarta Sans', Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB; color: #464646; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #E5E7EB; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
    .header { background-color: #fff; padding: 40px; text-align: center; }
    .content { padding: 40px; }
    .footer { padding: 30px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
    .h1 { color: #0B2B53; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 16px; font-style: italic; }
    .invoice-num { color: #049A9E; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }
    .item-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #F3F4F6; }
    .item-title { font-size: 14px; font-weight: 600; color: #0B2B53; }
    .item-lot { font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.05em; }
    .item-price { font-size: 14px; font-weight: 700; color: #0B2B53; }
    .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .summary-label { color: #9CA3AF; font-weight: 600; }
    .summary-value { color: #0B2B53; font-weight: 700; }
    .total-box { background-color: #0B2B53; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center; }
    .total-label { font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
    .total-value { font-size: 32px; font-weight: 800; color: #ffffff; margin: 0; }
    .button { display: inline-block; background-color: #049A9E; color: #ffffff; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 4px 4px 0px 0px #0B2B53; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://xiqvzoedklamiwpgizfy.supabase.co/storage/v1/object/public/auction-images/images/logo-virginia-white.png" alt="Virginia Liquidation" width="180" style="display: block; margin: 0 auto;">
    </div>
    <div class="content">
      <h1 class="h1">Your Invoice</h1>
      <p class="invoice-num">${params.invoiceNumber}</p>
      <p>Hi <strong>${params.customerName}</strong>,</p>
      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 24px;">Your invoice is ready. Here is a summary of your winning lots:</p>

      <!-- Items -->
      <div style="margin-bottom: 24px;">
        ${params.items.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
            <div>
              ${item.lotNumber ? `<div style="font-size: 10px; font-weight: 800; color: #049A9E; text-transform: uppercase; letter-spacing: 0.05em;">Lot #${item.lotNumber}</div>` : ''}
              <div style="font-size: 14px; font-weight: 600; color: #0B2B53;">${item.title}</div>
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0B2B53;">$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        `).join('')}
      </div>

      <!-- Summary -->
      <div style="border-top: 2px solid #F3F4F6; padding-top: 16px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
          <span style="color: #9CA3AF; font-weight: 600;">Subtotal</span>
          <span style="color: #0B2B53; font-weight: 700;">$${params.hammerTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
          <span style="color: #9CA3AF; font-weight: 600;">Buyer's Premium</span>
          <span style="color: #0B2B53; font-weight: 700;">$${params.buyersPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
          <span style="color: #9CA3AF; font-weight: 600;">Tax</span>
          <span style="color: #0B2B53; font-weight: 700;">$${params.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="total-box">
        <div class="total-label">Amount Due</div>
        <div class="total-value">$${params.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>

      <p style="font-size: 14px; line-height: 1.6; margin-bottom: 32px;">View your full invoice and pay online from your account.</p>

      <div style="text-align: center;">
        <a href="${params.invoiceUrl}" class="button">View & Pay Invoice</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Virginialiquidation.com All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
