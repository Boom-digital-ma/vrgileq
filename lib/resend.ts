import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend() {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY || 're_missing_key';
    resendInstance = new Resend(key);
  }
  return resendInstance;
}
