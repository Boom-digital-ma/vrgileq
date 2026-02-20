import { Resend } from 'resend';

// Initialize with a fallback string to prevent crash if key is missing during evaluation
export const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key');
