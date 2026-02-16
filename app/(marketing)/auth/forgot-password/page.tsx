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
      // Rediriger vers la vérification OTP avec l'email en paramètre
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&type=recovery`)
    }
  }

  return (
    <div className="min-h-screen bg-light/10 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border-4 border-primary shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/auth/signin" className="self-start mb-6 text-[10px] font-black uppercase tracking-widest text-neutral/40 flex items-center gap-2 hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <div className="bg-primary p-3 mb-4">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Reset Access</h1>
          <p className="text-neutral/50 text-[10px] font-black uppercase tracking-widest mt-2">Recover Your Account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-600 text-xs font-bold uppercase flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Registered Email</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary"
              placeholder="EMAIL@EXAMPLE.COM"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Send Secure Code"}
          </button>
        </form>
      </div>
    </div>
  )
}
