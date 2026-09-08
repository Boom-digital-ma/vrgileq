'use client'

import { useState } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'
import Link from 'next/link'
import { KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const email = formData.get('email') as string
    const result = await requestPasswordReset(email)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&type=recovery`)
    }
  }

  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4 mb-2"
  const inputClasses = "w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none"

  return (
    <div className="flex w-full items-center justify-center bg-zinc-50 p-4 font-sans text-secondary italic">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl shadow-secondary/5 md:p-8">
        
        <div className="relative z-10 mb-6 flex flex-col items-center">
          <Link href="/auth/signin" className="group mb-6 flex self-start items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-300 transition-colors hover:text-primary">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign In
          </Link>
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary shadow-inner">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Reset <span className="text-primary">Password</span>.</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Enter your email to continue</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-[10px] font-bold uppercase text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="relative z-10 space-y-5">
          <div className="space-y-2">
            <label className={labelClasses}>Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className={inputClasses}
              placeholder="you@example.com"
            />
          </div>

          <button 
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-secondary/10 transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Code"}
          </button>
        </form>

        <div className="relative z-10 mt-6 border-t border-zinc-50 pt-5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300 italic">Virginia Liquidation</p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}
