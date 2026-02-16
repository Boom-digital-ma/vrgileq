'use client'

import { useState } from 'react'
import { signup, login } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, CreditCard, ShieldCheck } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { useRouter } from 'next/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Étape 1 : Création du compte
  async function handleAccountCreation(formData: FormData) {
    setLoading(true)
    setError(null)
    
    // On récupère les infos pour se connecter automatiquement après
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Pour l'étape 2, on a besoin que l'utilisateur soit connecté
      // Note: Supabase peut demander une vérification d'email selon ta config.
      // Ici on suppose que l'utilisateur peut continuer vers la carte.
      setStep(2)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light/10 flex items-center justify-center p-6 font-sans text-neutral">
      <div className="w-full max-w-md bg-white border-4 border-primary shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] p-8">
        
        {/* Progress Indicator */}
        <div className="flex gap-2 mb-8">
            <div className={`h-2 flex-1 border-2 border-primary ${step >= 1 ? 'bg-primary' : ''}`}></div>
            <div className={`h-2 flex-1 border-2 border-primary ${step >= 2 ? 'bg-secondary' : ''}`}></div>
        </div>

        {step === 1 ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <Link href="/" className="mb-6">
                <img 
                  src="/images/logo-virginia-transparent.png" 
                  alt="Virginia Liquidation" 
                  className="h-16 w-auto"
                />
              </Link>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Create Account</h1>
              <p className="text-neutral/50 text-[10px] font-black uppercase tracking-widest mt-2 text-center">Step 1: Personal Information</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-xs font-bold uppercase border-2 bg-red-50 border-red-600 text-red-600">
                {error}
              </div>
            )}

            <form action={handleAccountCreation} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Full Name</label>
                <input name="fullName" type="text" required className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary" placeholder="JOHN DOE" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Email Address</label>
                <input name="email" type="email" required className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary" placeholder="EMAIL@EXAMPLE.COM" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Password</label>
                <input name="password" type="password" required className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary" placeholder="••••••••" />
              </div>

              <button disabled={loading} className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Continue to Security"}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-secondary p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Verify Identity</h1>
              <p className="text-neutral/50 text-[10px] font-black uppercase tracking-widest mt-2 text-center text-balance">
                Final Step: Add a payment method to authorize your bids.
              </p>
            </div>

            <Elements stripe={stripePromise}>
                <CardValidation onOptionalSuccess={() => {
                    setTimeout(() => router.push('/auctions'), 2000)
                }} />
            </Elements>

            <p className="text-[8px] font-bold text-neutral/30 uppercase mt-6 text-center leading-relaxed">
                Security Policy: A valid credit card is required to participate in auctions. 
                Your information is encrypted and secured by Stripe.
            </p>
          </div>
        )}

        {step === 1 && (
            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-neutral/40">
            Already have an account? <Link href="/auth/signin" className="text-secondary underline decoration-2 underline-offset-4">Sign In</Link>
            </p>
        )}
      </div>
    </div>
  )
}
