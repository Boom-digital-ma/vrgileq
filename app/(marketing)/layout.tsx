'use client'

import { loadStripe } from '@stripe/stripe-js'
import { usePathname } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith('/auth/')
  const isMinimalPage = isAuthPage || pathname === '/profile'

  return (
    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
      <div className="flex min-h-screen flex-col">
        <Header minimal={isMinimalPage} />
        <main className={isAuthPage ? "flex flex-1" : "flex-1"}>
          {children}
        </main>
        <Footer hideBanner={pathname === '/how-it-works'} minimal={isMinimalPage} />
      </div>
    </Elements>
  )
}
