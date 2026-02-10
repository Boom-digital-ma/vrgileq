import React from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white font-sans tracking-tight text-neutral flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <header className="mb-12 text-center">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4">SECURE ACCESS</div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-secondary mb-4">Sign In</h1>
          <p className="text-neutral/60 font-medium">Access your bidding dashboard and saved lots.</p>
        </header>

        <div className="bg-light/10 border-4 border-primary p-8 md:p-10 shadow-[16px_16px_0px_0px_rgba(4,154,158,1)]">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                <input 
                  type="email" 
                  className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Password</label>
                <button type="button" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-secondary">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                <input 
                  type="password" 
                  className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="w-full bg-primary text-white py-5 font-black uppercase tracking-[0.2em] text-xs hover:bg-secondary transition-all shadow-[6px_6px_0px_0px_rgba(11,43,83,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3">
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-neutral/40">
          Don&apos;t have an account? <br />
          <Link href="/auth/signup" className="text-primary hover:text-secondary underline decoration-2 underline-offset-8 mt-4 inline-block">Join Virginia Liquidation</Link>
        </p>
      </div>
    </div>
  );
}
