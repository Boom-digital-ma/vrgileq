'use client'

import { useState, Suspense } from 'react'
import { verifyOTP } from '@/app/actions/auth'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react'

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
        // Force full reload to /auctions to ensure Header and session are updated
        window.location.href = '/auctions?verified=true'
      }
    }
  }

  return (
    <div className="min-h-screen bg-light/10 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border-4 border-primary shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] p-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-secondary p-3 mb-4 shadow-[4px_4px_0px_0px_rgba(4,154,158,1)]">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Verify Identity</h1>
          <p className="text-neutral/50 text-[10px] font-black uppercase tracking-widest mt-2 max-w-[240px]">
            Enter the secure code sent to <br/><span className="text-secondary">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-600 text-xs font-bold uppercase flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <input 
              name="otp" 
              type="text" 
              required 
              maxLength={8}
              className="w-full border-2 border-primary p-4 text-center text-2xl font-black tracking-[0.3em] focus:outline-none focus:bg-light/5 text-primary placeholder:text-light"
              placeholder="00000000"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Authorize Access"}
          </button>
        </form>

        <p className="mt-8 text-center text-[8px] font-black uppercase tracking-widest text-neutral/40">
          Didn't receive code? <button className="text-secondary underline decoration-2 underline-offset-4">Resend OTP</button>
        </p>
      </div>
    </div>
  )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    )
}
