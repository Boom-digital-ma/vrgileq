import { outbidTemplate } from './templates/outbid';
import { winningTemplate } from './templates/won';
import { closingSoonTemplate } from './templates/closing-soon';

const FROM_EMAIL = process.env.NEXT_PUBLIC_RESEND_FROM || 'Virginia Liquidation <onboarding@resend.dev>';

async function sendResendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL: RESEND_API_KEY is missing. Email skipped.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API Error:', error);
    }
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
  }
}

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
  await sendResendEmail({
    to,
    subject: `Outbid alert: ${auctionTitle}`,
    html: outbidTemplate(bidderName, auctionTitle, newAmount, auctionUrl),
  });
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
  await sendResendEmail({
    to,
    subject: `Closing Soon: ${auctionTitle}`,
    html: closingSoonTemplate(bidderName, auctionTitle, currentPrice, auctionUrl, timeLeft),
  });
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
  await sendResendEmail({
    to,
    subject: `CONGRATULATIONS! You won: ${auctionTitle}`,
    html: winningTemplate(bidderName, auctionTitle, winningAmount, checkoutUrl),
  });
}
