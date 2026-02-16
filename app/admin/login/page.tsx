'use client'

import { useState } from 'react'
import { login } from '@/app/actions/auth'
import { Lock, Mail, ArrowLeft, Loader2, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans antialiased text-zinc-900">
      <div className="w-full max-w-[440px]">
        {/* Brand/Back link */}
        <div className="mb-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white h-5 w-5" />
                </div>
                <span className="font-bold tracking-tight text-lg">Control Center</span>
            </div>
            <Link href="/" className="text-zinc-400 hover:text-zinc-900 transition-colors text-sm font-medium flex items-center gap-1 group">
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Public site
            </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-zinc-500 text-sm">Please enter your administrator credentials to access the management console.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-zinc-700 ml-1">Administrator Email</label>
              <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                  <input 
                      name="email" 
                      type="email" 
                      required 
                      autoFocus
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-10 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-400 font-medium"
                      placeholder="name@company.com" 
                  />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                  <label className="text-[13px] font-semibold text-zinc-700">Security Key</label>
              </div>
              <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                  <input 
                      name="password" 
                      type="password" 
                      required 
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-10 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-400 font-medium"
                      placeholder="••••••••••••" 
                  />
              </div>
            </div>

            <div className="pt-2">
                <button 
                    disabled={loading}
                    className="w-full bg-zinc-900 h-11 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            Authenticate Access
                            <ChevronRight size={16} />
                        </>
                    )}
                </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-zinc-400 text-xs">
            © {new Date().getFullYear()} Virginia Liquidation LLC. <br/>
            Authorized personnel access only. Secure encryption active.
        </p>
      </div>
    </div>
  )
}
