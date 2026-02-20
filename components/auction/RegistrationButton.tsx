'use client'

import { useState, useEffect } from 'react'
import { registerForEvent, checkRegistration } from '@/app/actions/registrations'
import { getPaymentMethods } from '@/app/actions/payment'
import { updateProfile } from '@/app/actions/users'
import { Loader2, ShieldCheck, AlertCircle, CreditCard, Plus, ChevronRight, Lock, MapPin, Phone, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { Modal } from '@/components/admin/Modal'
import { cn } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type RegistrationStep = 'idle' | 'profile' | 'payment_selector' | 'payment_add'

export default function RegistrationButton({ 
    eventId, 
    depositAmount,
    isUpcoming = false
}: { 
    eventId: string, 
    depositAmount: number,
    isUpcoming?: boolean 
}) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [status, setStatus] = useState<{ registered: boolean, status?: string }>({ registered: false })
  const [cards, setCards] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('idle')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA'
  })

  const supabase = createClient()
  const router = useRouter()

  const isProfileComplete = (p: any) => {
    return p?.phone && p?.address_line && p?.city && p?.zip_code && p?.full_name;
  }

  useEffect(() => {
    setMounted(true)
    let isMounted = true;
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return;
      setUser(user)
      if (user) {
        try {
            const [regRes, cardsRes, profileRes] = await Promise.all([
                checkRegistration(eventId),
                getPaymentMethods(),
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ])
            if (isMounted) {
                setStatus(regRes)
                setCards(cardsRes)
                setProfile(profileRes.data)
                
                if (profileRes.data) {
                    setProfileData({
                        fullName: profileRes.data.full_name || '',
                        phone: profileRes.data.phone || '',
                        address: profileRes.data.address_line || '',
                        city: profileRes.data.city || '',
                        state: profileRes.data.state || '',
                        zip: profileRes.data.zip_code || '',
                        country: profileRes.data.country || 'USA'
                    })
                }

                if (profileRes.data?.default_payment_method_id) {
                    setSelectedCardId(profileRes.data.default_payment_method_id)
                } else if (cardsRes.length > 0) {
                    setSelectedCardId(cardsRes[0].id)
                }
            }
        } catch (err) {
            console.error("Init aborted", err);
        }
      }
      if (isMounted) setLoading(false)
    }
    init()
    return () => { isMounted = false };
  }, [eventId, supabase])

  const handleInitialClick = () => {
    if (!user) {
        router.push('/auth/signin')
        return
    }

    if (!isProfileComplete(profile)) {
        setCurrentStep('profile')
    } else if (cards.length === 0) {
        setCurrentStep('payment_add')
    } else if (cards.length === 1) {
        handleRegister(cards[0].id)
    } else {
        setCurrentStep('payment_selector')
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistering(true)
    setError(null)

    const formData = new FormData()
    Object.entries(profileData).forEach(([key, value]) => formData.append(key, value))

    const res = await updateProfile(formData)
    if (res.success) {
        // Refresh profile locally
        const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(updatedProfile)
        
        // Move to next step
        if (cards.length === 0) {
            setCurrentStep('payment_add')
        } else if (cards.length === 1) {
            handleRegister(cards[0].id)
        } else {
            setCurrentStep('payment_selector')
        }
    } else {
        setError(res.error || 'Failed to update profile')
    }
    setRegistering(false)
  }

  const handleRegister = async (pmId: string) => {
    setRegistering(true)
    setError(null)

    const res = await registerForEvent(eventId, pmId)

    if (res.success) {
      setStatus({ registered: true, status: 'authorized' })
      setCurrentStep('idle')
    } else if (res.error) {
      setError(res.error)
    }
    setRegistering(false)
  }

  // Prevent Hydration Mismatch
  if (!mounted) return null

  if (loading) return (
    <button disabled className="w-full bg-zinc-50 border border-zinc-100 py-4 rounded-2xl text-zinc-300 font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 italic animate-pulse">
      <Loader2 className="h-4 w-4 animate-spin" /> Syncing Status
    </button>
  )

  if (status.registered) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex items-center gap-4 text-emerald-600 italic shadow-sm">
        <div className="bg-white p-2 rounded-full shadow-sm">
            <ShieldCheck size={20} />
        </div>
        <div>
            <p className="font-bold uppercase text-[10px] tracking-wider leading-none">Authorization Active</p>
            <p className="text-[10px] font-medium opacity-70 uppercase mt-1">Ready for Bidding Room</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-bold uppercase flex items-center gap-3 italic animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}
        
        <button 
          onClick={handleInitialClick}
          disabled={registering || isUpcoming}
          className={cn(
            "w-full py-5 rounded-[24px] font-bold uppercase text-[11px] tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-3 italic",
            isUpcoming 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5" 
                : "bg-primary text-white hover:bg-secondary shadow-xl shadow-primary/20"
          )}
        >
          {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : (isUpcoming ? <Lock size={14} /> : <Lock size={14} />)}
          {isUpcoming ? "Registration Pending" : "Authorize Bidding"}
        </button>
      </div>

      <Modal 
        isOpen={currentStep !== 'idle'} 
        onClose={() => setCurrentStep('idle')} 
        title={
            currentStep === 'profile' ? "Account Completion" :
            currentStep === 'payment_add' ? "Identity Verification" : "Bidding Account"
        } 
        maxWidth="max-w-md"
      >
        <div className="p-6 sm:p-8 space-y-6">
            {/* STEP: PROFILE */}
            {currentStep === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-6 italic">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <User size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Profile Validation</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium uppercase leading-relaxed">
                            Industrial regulations require a verified identity for bidding authorization.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Full Name</label>
                                <input 
                                    required
                                    value={profileData.fullName}
                                    onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Enter full legal name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Mobile Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                    <input 
                                        required
                                        type="tel"
                                        pattern="[+]?[0-9\s\-()]{10,20}"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({...profileData, phone: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 pl-10 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                        </div>


                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Company / Street Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                                <input 
                                    required
                                    value={profileData.address}
                                    onChange={e => setProfileData({...profileData, address: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 pl-10 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="123 Industrial Ave"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">City</label>
                                <input 
                                    required
                                    value={profileData.city}
                                    onChange={e => setProfileData({...profileData, city: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Richmond"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Zip Code</label>
                                <input 
                                    required
                                    value={profileData.zip}
                                    onChange={e => setProfileData({...profileData, zip: e.target.value})}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="23173"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={registering}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                    >
                        {registering ? <Loader2 size={16} className="animate-spin" /> : <>Continue to Payment <ChevronRight size={14} /></>}
                    </button>
                </form>
            )}

            {/* STEP: PAYMENT ADD */}
            {currentStep === 'payment_add' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center italic">
                        <div className="flex items-center gap-2 text-primary">
                            <CreditCard size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Financial Protocol</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {!isProfileComplete(profile) && (
                                <button 
                                    onClick={() => setCurrentStep('profile')}
                                    className="text-[9px] font-bold uppercase text-zinc-400 hover:text-primary transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            {cards.length > 0 && (
                                <button 
                                    onClick={() => setCurrentStep('payment_selector')}
                                    className="text-[9px] font-bold uppercase text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/20"
                                >
                                    Switch Card
                                </button>
                            )}
                        </div>
                    </div>

                    
                    <p className="text-[11px] text-zinc-400 font-medium uppercase leading-relaxed italic">
                        A valid industrial-grade payment method is required to secure your bidding capacity.
                    </p>

                    <Elements stripe={stripePromise} options={{ locale: 'en' }}>
                        <CardValidation hideHeader onOptionalSuccess={async () => {
                            const newCards = await getPaymentMethods()
                            setCards(newCards)
                            if (newCards.length > 0) handleRegister(newCards[0].id)
                        }} />
                    </Elements>
                </div>
            )}

            {/* STEP: PAYMENT SELECTOR */}
            {currentStep === 'payment_selector' && (
                <div className="space-y-8 italic">
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Authorization Source</h4>
                        <p className="text-[11px] font-medium text-zinc-300 uppercase leading-relaxed">Choose card for the ${depositAmount.toLocaleString()} security hold.</p>
                    </div>
                    
                    <div className="space-y-3">
                        {cards.map((card) => {
                            const isDefault = card.id === profile?.default_payment_method_id;
                            const isSelected = selectedCardId === card.id;
                            
                            return (
                                <button 
                                    key={card.id}
                                    onClick={() => setSelectedCardId(card.id)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                        isSelected 
                                            ? "bg-secondary border-secondary shadow-xl shadow-secondary/10 text-white" 
                                            : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            isSelected ? "bg-white/10" : "bg-white border border-zinc-100 group-hover:bg-primary group-hover:text-white"
                                        )}>
                                            <CreditCard size={16} strokeWidth={isSelected ? 2.5 : 2} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold uppercase tracking-tight">{card.brand} •••• {card.last4}</p>
                                                {isDefault && (
                                                    <span className={cn(
                                                        "text-[7px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm",
                                                        isSelected ? "bg-primary text-white" : "bg-secondary text-white"
                                                    )}>Primary</span>
                                                )}
                                            </div>
                                            <p className={cn("text-[9px] font-medium uppercase opacity-50", isSelected ? "text-white" : "text-zinc-300")}>Expires {card.exp_month}/{card.exp_year}</p>
                                        </div>
                                    </div>
                                    {isSelected && <ShieldCheck size={18} className="text-primary animate-in zoom-in duration-300" />}
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => setCurrentStep('payment_add')}
                            className="w-full py-2 text-[10px] font-bold uppercase text-zinc-300 hover:text-primary transition-all flex items-center justify-center gap-2 group"
                        >
                            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> Register Another Account
                        </button>

                        <button 
                            onClick={() => handleRegister(selectedCardId!)}
                            disabled={registering || !selectedCardId}
                            className="w-full bg-primary text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {registering ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Authorization <ChevronRight size={16} className="text-white/50" /></>}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </Modal>
    </>
  )
}

