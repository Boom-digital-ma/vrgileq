'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-light/10 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white border-4 border-primary shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] p-8">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-6">
            <img 
              src="/images/logo-virginia-transparent.png" 
              alt="Virginia Liquidation" 
              className="h-16 w-auto"
            />
          </Link>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-primary">Bidder Login</h1>
          <p className="text-neutral/50 text-[10px] font-black uppercase tracking-widest mt-2">Welcome Back</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-600 text-red-600 text-xs font-bold uppercase flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary"
              placeholder="EMAIL@EXAMPLE.COM"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral/50">Password</label>
              <Link href="#" className="text-[8px] font-black uppercase tracking-widest text-secondary underline decoration-2 underline-offset-2">Forgot Password?</Link>
            </div>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary"
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Enter Auction Room"}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-neutral/40">
          New Bidder? <Link href="/auth/signup" className="text-secondary underline decoration-2 underline-offset-4">Create Account</Link>
        </p>
      </div>
    </div>
  )
}
