import React from 'react';
import Link from 'next/link';
import { Mail, Lock, User, Phone, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white font-sans tracking-tight text-neutral flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">
        <header className="mb-12 text-center">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4">MEMBER REGISTRATION</div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-secondary mb-4">Join The Exchange</h1>
          <p className="text-neutral/60 font-medium">Get exclusive access to overstock assets and industrial liquidations.</p>
        </header>

        <div className="bg-white border-4 border-secondary p-8 md:p-12 shadow-[20px_20px_0px_0px_rgba(11,43,83,1)]">
          <form className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                  <input 
                    type="text" 
                    className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                  <input 
                    type="tel" 
                    className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary focus:outline-none transition-colors"
                    placeholder="(703) 000-0000"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                <input 
                  type="email" 
                  className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary focus:outline-none transition-colors"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral/30" />
                <input 
                  type="password" 
                  className="w-full border-2 border-light bg-white p-4 pl-12 font-bold focus:border-primary focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-primary" />
                <label className="text-[10px] font-bold uppercase tracking-tight text-neutral/60 leading-relaxed">
                  I agree to the <Link href="/terms" className="text-primary underline">Terms of Sale</Link> and understand the <Link href="/buyers" className="text-primary underline">Bidder Responsibilities</Link>.
                </label>
              </div>
            </div>

            <button className="w-full bg-secondary text-white py-6 font-black uppercase tracking-[0.2em] text-xs hover:bg-primary transition-all shadow-[8px_8px_0px_0px_rgba(4,154,158,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-3">
              Create My Account <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="mt-12 text-center text-xs font-bold uppercase tracking-widest text-neutral/40">
          Already a member? <br />
          <Link href="/auth/signin" className="text-primary hover:text-secondary underline decoration-2 underline-offset-8 mt-4 inline-block">Sign In To Your Account</Link>
        </p>
      </div>
    </div>
  );
}
