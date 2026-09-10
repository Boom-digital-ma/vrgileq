'use client'

import { useState, useRef } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, AlertCircle, User, ArrowRight, Terminal } from 'lucide-react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      // FORCE FULL RELOAD TO ENSURE HEADER UPDATES
      if (result.role === 'admin' || result.role === 'moderator') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/auctions'
      }
    }
  }

  const handleQuickLogin = (email: string) => {
    if (formRef.current) {
        const emailInput = formRef.current.querySelector('input[name="email"]') as HTMLInputElement
        const passwordInput = formRef.current.querySelector('input[name="password"]') as HTMLInputElement
        
        if (emailInput && passwordInput) {
            emailInput.value = email
            passwordInput.value = "Pass'121"
            formRef.current.requestSubmit()
        }
    }
  }

  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4 mb-2"
  const inputClasses = "w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary placeholder:text-zinc-300 focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none [&:-webkit-autofill]:[-webkit-text-fill-color:#0B2B53] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#fafafa_inset]"

  return (
    <div className="flex w-full items-center justify-center bg-zinc-50 p-4 font-sans text-secondary italic">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-zinc-100 bg-white p-6 shadow-2xl shadow-secondary/5 md:p-8">
        
        <div className="relative z-10 mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <User size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Sign <span className="text-primary">In</span>.</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Access your account</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-[10px] font-bold uppercase text-rose-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form ref={formRef} action={handleSubmit} className="relative z-10 space-y-5">
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
          
          <div className="space-y-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
              <Link href="/auth/forgot-password" className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors underline underline-offset-4 decoration-primary/20">Forgot password?</Link>
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
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary py-4 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-2xl shadow-secondary/10 transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gavel size={18} />}
            Sign In
          </button>
        </form>

        {process.env.NODE_ENV !== 'production' && (
            <div className="relative z-10 mt-5 border-t border-zinc-50 pt-5">
                <p className="mb-3 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                    <Terminal size={12} /> Dev Quick Access
                </p>
                <div className="space-y-2">
                    {['doigrouyokixe-9365@yopmail.com', 'jegramuyatru-1717@yopmail.com', 'mijahoiwowi-2691@yopmail.com'].map(email => (
                        <button 
                            key={email}
                            onClick={() => handleQuickLogin(email)}
                            disabled={loading}
                            className="w-full text-left px-4 py-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[10px] font-bold uppercase text-zinc-500 hover:text-secondary transition-all truncate border border-transparent hover:border-zinc-200"
                        >
                            {email}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="relative z-10 mt-6 border-t border-zinc-50 pt-5 text-center">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300">New here?</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary transition-all group">
                Create Free Account <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}
