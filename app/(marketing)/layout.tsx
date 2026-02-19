'use client'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </Elements>
  )
}
