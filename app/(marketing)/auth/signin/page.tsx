'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, AlertCircle, User, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4 mb-2"
  const inputClasses = "w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none"

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans text-secondary italic">
      <div className="w-full max-w-md bg-white rounded-[48px] border border-zinc-100 shadow-2xl shadow-secondary/5 p-10 md:p-12 relative overflow-hidden">
        
        <div className="flex flex-col items-center mb-12 relative z-10">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <User size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Bidder <span className="text-primary">Login</span>.</h1>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Secure Access Gateway</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-bold uppercase flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-8 relative z-10">
          <div className="space-y-2">
            <label className={labelClasses}>Digital Mail</label>
            <input 
              name="email" 
              type="email" 
              required 
              className={inputClasses}
              placeholder="EMAIL@DOMAIN.COM"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Credentials</label>
              <Link href="/auth/forgot-password" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/20">Recovery?</Link>
            </div>
            <input 
              name="password" 
              type="password" 
              required 
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-secondary text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-2xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gavel size={18} />}
            Enter Auction Room
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-zinc-50 text-center relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 mb-4">New to the platform?</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-all group">
                Create Bidder Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}
