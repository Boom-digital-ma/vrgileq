import { getResend } from '../resend';
import { outbidTemplate } from './templates/outbid';
import { winningTemplate } from './templates/won';
import { closingSoonTemplate } from './templates/closing-soon';

const FROM_EMAIL = process.env.NEXT_PUBLIC_RESEND_FROM || 'Virginia Liquidation <onboarding@resend.dev>';

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
    const resend = getResend();
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

export async function sendClosingSoonEmail({
  to,
  bidderName,
  auctionTitle,
  currentPrice,
  auctionUrl,
  timeLeft,
}: {
  to: string;
  bidderName: string;
  auctionTitle: string;
  currentPrice: number;
  auctionUrl: string;
  timeLeft: string;
}) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Closing Soon: ${auctionTitle}`,
      html: closingSoonTemplate(bidderName, auctionTitle, currentPrice, auctionUrl, timeLeft),
    });
  } catch (error) {
    console.error('Failed to send closing soon email:', error);
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
    const resend = getResend();
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
