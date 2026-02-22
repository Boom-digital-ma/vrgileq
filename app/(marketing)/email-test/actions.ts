'use server'

import { sendOutbidEmail } from '@/lib/emails';

export async function testEmailAction(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }

  console.log('[TEST_EMAIL] Initiating test dispatch to:', email);
  console.log('[TEST_EMAIL] RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
  console.log('[TEST_EMAIL] NEXT_PUBLIC_RESEND_FROM:', process.env.NEXT_PUBLIC_RESEND_FROM);

  try {
    await sendOutbidEmail({
      to: email,
      bidderName: 'Test User',
      auctionTitle: 'Test Auction Item #1234',
      newAmount: 999.99,
      auctionUrl: 'http://localhost:3000/auctions/test-auction'
    });

    console.log('[TEST_EMAIL] Dispatch function completed successfully (check inbox/spam)');
    return { success: true, message: 'Email dispatched via Resend API' };
  } catch (error: any) {
    console.error('[TEST_EMAIL] Critical Failure:', error);
    return { success: false, error: error.message || 'Unknown error during dispatch' };
  }
}
