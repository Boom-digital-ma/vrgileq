'use client'

import { useState, Suspense } from 'react'
import { verifyOTP } from '@/app/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

function VerifyContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const type = (searchParams.get('type') as 'signup' | 'recovery') || 'signup'

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const otp = formData.get('otp') as string
    const result = await verifyOTP(email, otp, type)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      if (type === 'recovery') {
        router.push('/auth/reset-password')
      } else {
        window.location.href = '/auctions?verified=true'
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans text-secondary italic">
      <div className="w-full max-w-md bg-white rounded-[48px] border border-zinc-100 shadow-2xl shadow-secondary/5 p-10 md:p-12 relative overflow-hidden">
        
        <div className="flex flex-col items-center mb-12 text-center relative z-10">
          <div className="h-16 w-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary mb-8 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Verify <span className="text-primary">Identity</span>.</h1>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-4 max-w-[240px] leading-relaxed">
            Enter the transmission code sent to <br/><span className="text-secondary font-black">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-bold uppercase flex items-center gap-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-8 relative z-10">
          <div className="group/input">
            <input 
              name="otp" 
              type="text" 
              required 
              maxLength={8}
              className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-[24px] py-6 text-center text-3xl font-bold tracking-[0.4em] text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none shadow-inner"
              placeholder="000000"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-secondary text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-2xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Access"}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-zinc-50 text-center relative z-10">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                Didn't receive the code? <button className="text-primary hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/20">Resend Protocol</button>
            </p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center italic text-[10px] font-bold uppercase tracking-widest text-zinc-300">Synchronizing...</div>}>
            <VerifyContent />
        </Suspense>
    )
}
