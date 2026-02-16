import { resend } from '../resend';
import { outbidTemplate } from './templates/outbid';
import { winningTemplate } from './templates/won';

const FROM_EMAIL = 'Virginia Liquidation <notifications@virginialiquidation.com>';

export async function sendOutbidEmail({
  to,
  bidderName,
  auctionTitle,
  newAmount,
  auctionUrl,
}: {
  to: string;
  bidderName: string;
  auctionTitle: string;
  newAmount: number;
  auctionUrl: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Outbid alert: ${auctionTitle}`,
      html: outbidTemplate(bidderName, auctionTitle, newAmount, auctionUrl),
    });
  } catch (error) {
    console.error('Failed to send outbid email:', error);
  }
}

export async function sendWinningEmail({
  to,
  bidderName,
  auctionTitle,
  winningAmount,
  checkoutUrl,
}: {
  to: string;
  bidderName: string;
  auctionTitle: string;
  winningAmount: number;
  checkoutUrl: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `CONGRATULATIONS! You won: ${auctionTitle}`,
      html: winningTemplate(bidderName, auctionTitle, winningAmount, checkoutUrl),
    });
  } catch (error) {
    console.error('Failed to send winning email:', error);
  }
}
