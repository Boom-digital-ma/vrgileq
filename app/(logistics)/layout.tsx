'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function LogisticsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
      <main className="min-h-screen bg-zinc-50">
        {children}
      </main>
    </Elements>
  )
}
