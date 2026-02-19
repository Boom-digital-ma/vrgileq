'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { Gavel, Loader2, CreditCard, ShieldCheck, ArrowRight, ArrowLeft, MapPin, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
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

  const nextStep = () => {
    /* VALIDATION DISABLED FOR TESTING
    if (step === 1) {
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
            setError("All identity fields are required.")
            return
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Security codes do not match.")
            return
        }
        const phoneRegex = /[+]?[0-9\s\-()]{10,20}/
        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid mobile phone number.")
            return
        }
    }
    if (step === 2) {
        if (!formData.address || !formData.city || !formData.zip) {
            setError("Physical location details are required for logistics.")
            return
        }
    }
    */
    setError(null)
    setStep(s => (s < 4 ? (s + 1) as any : s))
  }
  const prevStep = () => {
    setError(null)
    setStep(s => (s > 1 ? (s - 1) as any : s))
  }

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

  const labelClasses = "block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4 mb-2"
  const inputClasses = "w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-3.5 sm:py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none"

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 sm:p-6 font-sans text-secondary">
      <div className="w-full max-w-2xl bg-white rounded-[32px] sm:rounded-[48px] border border-zinc-100 shadow-2xl shadow-secondary/5 p-6 sm:p-10 relative overflow-hidden italic">
        
        {/* Modern Progress Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-end gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 justify-center md:justify-end">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3">
                        <div className={cn(
                            "h-2 w-2 rounded-full transition-all duration-500",
                            step === i ? "bg-primary scale-125 sm:scale-150 shadow-[0_0_10px_rgba(4,154,158,0.5)]" : (step > i ? "bg-secondary" : "bg-zinc-100")
                        )} />
                        {i < 4 && <div className={cn("h-[1px] w-4 sm:w-10 bg-zinc-100", step > i && "bg-secondary/20")} />}
                    </div>
                ))}
            </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-bold uppercase flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5 mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 rounded-[18px] sm:rounded-[20px] flex items-center justify-center text-primary shrink-0">
                    <User size={24} className="sm:size-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Identity</h1>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Personal Access Protocols</p>
                </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClasses}>Full Legal Name</label>
                    <input type="text" value={formData.fullName} onChange={e => updateForm({ fullName: e.target.value })} className={inputClasses} placeholder="FULL NAME" />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Mobile Phone</label>
                    <input type="tel" value={formData.phone} onChange={e => updateForm({ phone: e.target.value })} className={inputClasses} placeholder="(703) 000-0000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Digital Mail</label>
                <input type="email" value={formData.email} onChange={e => updateForm({ email: e.target.value })} className={inputClasses} placeholder="EMAIL@DOMAIN.COM" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClasses}>Security Code</label>
                    <input type="password" value={formData.password} onChange={e => updateForm({ password: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>Confirm Code</label>
                    <input type="password" value={formData.confirmPassword} onChange={e => updateForm({ confirmPassword: e.target.value })} className={inputClasses} placeholder="••••••••" />
                </div>
              </div>

              <button onClick={nextStep} className="w-full bg-secondary text-white py-5 sm:py-6 rounded-3xl font-bold text-[11px] sm:text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-xl shadow-secondary/10 flex items-center justify-center gap-3">
                Next: Physical Location <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ADDRESS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5 mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 rounded-[18px] sm:rounded-[20px] flex items-center justify-center text-primary shrink-0">
                    <MapPin size={24} className="sm:size-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Location</h1>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Tax & Logistics Compliance</p>
                </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className={labelClasses}>Street Address</label>
                <input type="text" value={formData.address} onChange={e => updateForm({ address: e.target.value })} className={inputClasses} placeholder="STREET ADDRESS" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClasses}>Country</label>
                    <select value={formData.country} onChange={e => updateForm({ country: e.target.value })} className={cn(inputClasses, "appearance-none")}>
                        <option value="USA">United States</option>
                        <option value="CAN">Canada</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>State / Province</label>
                    <select value={formData.state} onChange={e => updateForm({ state: e.target.value })} className={cn(inputClasses, "appearance-none")}>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className={labelClasses}>City Hub</label>
                    <input type="text" value={formData.city} onChange={e => updateForm({ city: e.target.value })} className={inputClasses} placeholder="CITY" />
                </div>
                <div className="space-y-2">
                    <label className={labelClasses}>ZIP Identifier</label>
                    <input type="text" value={formData.zip} onChange={e => updateForm({ zip: e.target.value })} className={inputClasses} placeholder="ZIP CODE" />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={prevStep} className="bg-zinc-50 border-2 border-zinc-100 px-6 sm:px-8 py-5 sm:py-6 rounded-3xl font-bold uppercase tracking-widest text-zinc-400 hover:bg-white hover:text-secondary transition-all flex items-center justify-center">
                    <ArrowLeft size={18} />
                </button>
                <button onClick={nextStep} className="flex-1 bg-secondary text-white py-5 sm:py-6 rounded-3xl font-bold text-[11px] sm:text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-xl shadow-secondary/10 flex items-center justify-center gap-3">
                    Next: Verification <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5 mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 rounded-[18px] sm:rounded-[20px] flex items-center justify-center text-primary shrink-0">
                    <CreditCard size={24} className="sm:size-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Security</h1>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2 italic">Bidder Credit Authorization</p>
                </div>
            </div>

            <div className="bg-zinc-50 p-6 sm:p-8 rounded-[32px] border border-zinc-100 mb-8">
                <Elements stripe={stripePromise} options={{ locale: 'en' }}>
                    <CardValidation hideHeader onPaymentMethodCreated={(id) => {
                        updateForm({ paymentMethodId: id })
                        nextStep()
                    }} />
                </Elements>
            </div>

            <button onClick={prevStep} className="w-full text-zinc-300 hover:text-primary py-2 font-bold uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3">
                <ArrowLeft size={14} /> Back to Location
            </button>
          </div>
        )}

        {/* STEP 4: TERMS & SUBMIT */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5 mb-8">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 rounded-[18px] sm:rounded-[20px] flex items-center justify-center text-primary shrink-0">
                    <FileText size={24} className="sm:size-7" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary font-display uppercase leading-none">Agreements</h1>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Final Master Protocol</p>
                </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100 p-6 sm:p-8 rounded-[32px] mb-8 h-48 sm:h-64 overflow-y-auto font-medium text-[11px] text-zinc-400 leading-relaxed uppercase shadow-inner italic">
                <h4 className="font-bold text-secondary mb-6 border-b border-zinc-200 pb-2">Master Bidding Agreement</h4>
                <p className="mb-6">1. ELIGIBILITY: You must be 18 years of age or older to participate in auctions. Every registration is a legal commitment to comply with industrial regulations.</p>
                <p className="mb-6">2. BIDDING PROTOCOL: Every bid is a legally binding contract. Successful bidders are mandated to complete the acquisition process.</p>
                <p className="mb-6">3. FINANCIALS: A buyer's premium is applied to the hammer price. Transactions are processed immediately upon event closure.</p>
                <p className="mb-6">4. ASSET CONDITION: All items are sold "as-is". Technical assessment reports are provided for verification but do not constitute warranties.</p>
                <p>By executing the signature below (checkbox), you acknowledge full comprehension of these technical and legal protocols.</p>
            </div>

            <label className={cn(
                "flex items-center gap-4 p-5 sm:p-6 rounded-[24px] border-2 transition-all cursor-pointer mb-8 group",
                acceptedTerms ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-primary/20"
            )}>
                <div className={cn(
                    "h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    acceptedTerms ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-200 group-hover:border-primary"
                )}>
                    {acceptedTerms && <CheckCircle2 size={14} strokeWidth={3} />}
                </div>
                <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} className="hidden" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Execute Agreement Signature</span>
            </label>

            <div className="flex gap-4">
                <button onClick={prevStep} disabled={loading} className="bg-zinc-50 border-2 border-zinc-100 px-6 sm:px-8 py-5 sm:py-6 rounded-3xl font-bold uppercase text-zinc-400 hover:bg-white hover:text-secondary transition-all disabled:opacity-50">
                    <ArrowLeft size={18} />
                </button>
                <button 
                    onClick={handleFinalSignup} 
                    disabled={loading || !acceptedTerms}
                    className="flex-1 bg-secondary text-white py-5 sm:py-6 rounded-[32px] font-bold text-[11px] sm:text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-2xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 size={18} /> Finalize Account Execution</>}
                </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-zinc-50 text-center relative z-10">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300 italic">Virginia Liquidation • Industrial Governance active</p>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </div>
    </div>
  )
}
