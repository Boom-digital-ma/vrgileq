'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, MapPin, User, FileText, CheckCircle2 } from 'lucide-react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const US_STATES = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", 
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", 
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

export default function SignUpPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const router = useRouter()

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    country: 'USA',
    state: 'Virginia',
    city: '',
    zip: '',
    paymentMethodId: ''
  })

  const updateForm = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }))
  }

  const nextStep = () => setStep(s => (s < 4 ? (s + 1) as any : s))
  const prevStep = () => setStep(s => (s > 1 ? (s - 1) as any : s))

  async function handleFinalSignup() {
    if (!acceptedTerms) {
        setError("You must accept the terms and conditions.")
        return
    }

    setLoading(true)
    setError(null)

    const finalData = new FormData()
    Object.entries(formData).forEach(([key, value]) => finalData.append(key, value))

    const result = await signup(finalData, formData.paymentMethodId)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}&type=signup`)
    }
  }

  const labelClasses = "block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2"
  const inputClasses = "w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary placeholder:text-neutral/20"

  return (
    <div className="min-h-screen bg-light/10 flex items-center justify-center p-6 font-sans text-neutral">
      <div className="w-full max-w-xl bg-white border-4 border-primary shadow-[16px_16px_0px_0px_rgba(11,43,83,1)] p-10 relative overflow-hidden">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-10">
            <Link href="/">
                <img src="/images/logo-virginia-transparent.png" alt="Logo" className="h-10 w-auto" />
            </Link>
            <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn(
                        "h-1.5 w-8 border-2 border-primary transition-all",
                        step >= i ? "bg-primary" : "bg-transparent"
                    )} />
                ))}
            </div>
        </div>

        {error && (
          <div className="mb-8 p-4 text-xs font-bold uppercase border-2 bg-red-50 border-red-600 text-red-600 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 rotate-180" />
            {error}
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary p-3 text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                    <User size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Identity</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mt-1">Step 1 of 4: Personal Access</p>
                </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Full Legal Name</label>
                    <input type="text" value={formData.fullName} onChange={e => updateForm({ fullName: e.target.value })} className={inputClasses} placeholder="JOHN DOE" />
                </div>
                <div>
                    <label className={labelClasses}>Mobile Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => updateForm({ phone: e.target.value })} className={inputClasses} placeholder="(703) 000-0000" />
                </div>
              </div>
              <div>
                <label className={labelClasses}>Email Address</label>
                <input type="email" value={formData.email} onChange={e => updateForm({ email: e.target.value })} className={inputClasses} placeholder="EMAIL@EXAMPLE.COM" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Create Password</label>
                    <input type="password" value={formData.password} onChange={e => updateForm({ password: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
                <div>
                    <label className={labelClasses}>Confirm Password</label>
                    <input type="password" value={formData.confirmPassword} onChange={e => updateForm({ confirmPassword: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>

              <button onClick={nextStep} className="w-full bg-primary py-5 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-3 active:translate-y-1">
                Next: Physical Address <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary p-3 text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                    <MapPin size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Location</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mt-1">Step 2 of 4: Tax & Shipping</p>
                </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClasses}>Street Address</label>
                <input type="text" value={formData.address} onChange={e => updateForm({ address: e.target.value })} className={inputClasses} placeholder="123 INDUSTRIAL WAY" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Country</label>
                    <select value={formData.country} onChange={e => updateForm({ country: e.target.value })} className={inputClasses}>
                        <option value="USA">United States</option>
                        <option value="CAN">Canada</option>
                    </select>
                </div>
                <div>
                    <label className={labelClasses}>State / Province</label>
                    <select value={formData.state} onChange={e => updateForm({ state: e.target.value })} className={inputClasses}>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>City</label>
                    <input type="text" value={formData.city} onChange={e => updateForm({ city: e.target.value })} className={inputClasses} placeholder="ALEXANDRIA" />
                </div>
                <div>
                    <label className={labelClasses}>ZIP Code</label>
                    <input type="text" value={formData.zip} onChange={e => updateForm({ zip: e.target.value })} className={inputClasses} placeholder="22301" />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="flex-1 border-2 border-primary py-5 font-black uppercase tracking-widest hover:bg-light/10 transition-all flex items-center justify-center gap-3">
                    <ArrowLeft size={18} /> Back
                </button>
                <button onClick={nextStep} className="flex-[2] bg-primary py-5 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center gap-3">
                    Next: Security <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary p-3 text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                    <CreditCard size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Verification</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mt-1">Step 3 of 4: Bidder Authorization</p>
                </div>
            </div>

            <Elements stripe={stripePromise}>
                <CardValidation onPaymentMethodCreated={(id) => {
                    updateForm({ paymentMethodId: id })
                    nextStep()
                }} />
            </Elements>

            <button onClick={prevStep} className="mt-6 w-full border-2 border-primary py-4 font-black uppercase tracking-widest hover:bg-light/10 transition-all flex items-center justify-center gap-3">
                <ArrowLeft size={18} /> Modify Information
            </button>
          </div>
        )}

        {/* STEP 4: TERMS & SUBMIT */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary p-3 text-white shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none italic">Agreements</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mt-1">Final Step: Master Agreement</p>
                </div>
            </div>

            <div className="border-4 border-primary p-6 mb-8 h-64 overflow-y-auto font-medium text-xs text-neutral/60 leading-relaxed bg-zinc-50 scrollbar-thin scrollbar-thumb-primary">
                <h4 className="font-black uppercase text-neutral mb-4 italic underline underline-offset-4">Terms of Use & Bidding Agreement</h4>
                <p className="mb-4">1. ELIGIBILITY: You must be 18 years of age or older to participate in auctions. By registering, you represent that you have the legal capacity to enter into binding contracts.</p>
                <p className="mb-4">2. BIDDING: Every bid is a legally binding contract. If you are the high bidder, you are obligated to complete the purchase.</p>
                <p className="mb-4">3. PAYMENT: A buyer's premium will be added to the high bid. All items must be paid for in full prior to removal.</p>
                <p className="mb-4">4. AS-IS WHERE-IS: All assets are sold "as-is" without warranty or guarantee. We encourage on-site inspection prior to bidding.</p>
                <p className="mb-4">5. REMOVAL: The buyer is responsible for the removal of all assets within the specified timeframe. Failure to remove assets may result in forfeiture of funds.</p>
                <p>By checking the box below, you acknowledge that you have read, understood, and agreed to all terms listed above and in our full Terms & Conditions document.</p>
            </div>

            <label className="flex items-center gap-4 p-4 border-2 border-primary bg-light/5 cursor-pointer mb-8 group transition-colors hover:bg-primary/5">
                <input 
                    type="checkbox" 
                    checked={acceptedTerms} 
                    onChange={e => setAcceptedTerms(e.target.checked)} 
                    className="h-6 w-6 border-2 border-primary text-primary focus:ring-0"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral italic">I accept the auction terms and conditions</span>
            </label>

            <div className="flex gap-4">
                <button onClick={prevStep} disabled={loading} className="flex-1 border-2 border-primary py-5 font-black uppercase tracking-widest hover:bg-light/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                    <ArrowLeft size={18} /> Back
                </button>
                <button 
                    onClick={handleFinalSignup} 
                    disabled={loading || !acceptedTerms}
                    className="flex-[2] bg-secondary py-5 text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[8px_8px_0px_0px_rgba(4,154,158,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 size={18} /> Create Your Account</>}
                </button>
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-[10px] font-black uppercase tracking-widest text-neutral/20 border-t border-light pt-6 italic">
            Virginia Liquidation • Northern Virginia's Premier Marketplace
        </p>
      </div>
    </div>
  )
}
