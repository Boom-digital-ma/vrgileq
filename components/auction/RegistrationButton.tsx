'use client'

import { useState, useEffect } from 'react'
import { registerForEvent, checkRegistration } from '@/app/actions/registrations'
import { getPaymentMethods } from '@/app/actions/payment'
import { Loader2, ShieldCheck, AlertCircle, CreditCard, Plus, ChevronRight, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { Modal } from '@/components/admin/Modal'
import { cn } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function RegistrationButton({ eventId, depositAmount }: { eventId: string, depositAmount: number }) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [status, setStatus] = useState<{ registered: boolean, status?: string }>({ registered: false })
  const [cards, setCards] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

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

    if (cards.length === 0) {
        setIsCardModalOpen(true)
    } else if (cards.length === 1) {
        handleRegister(cards[0].id)
    } else {
        setIsSelectorOpen(true)
    }
  }

  const handleRegister = async (pmId: string) => {
    setRegistering(true)
    setError(null)

    const res = await registerForEvent(eventId, pmId)

    if (res.success) {
      setStatus({ registered: true, status: 'authorized' })
      setIsSelectorOpen(false)
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
          disabled={registering}
          className="w-full bg-primary text-white py-5 rounded-[24px] font-bold uppercase text-[11px] tracking-[0.2em] hover:bg-secondary transition-all shadow-xl shadow-primary/20 active:scale-[0.98] flex items-center justify-center gap-3 italic"
        >
          {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock size={14} />}
          Authorize Bidding
        </button>
      </div>

      {/* MODAL: Saisie nouvelle carte */}
      <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title="Identity Verification" maxWidth="max-w-md">
        <div className="p-10 space-y-8 italic">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-primary">
                    <CreditCard size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Financial Protocol</span>
                </div>
                {cards.length > 0 && (
                    <button 
                        onClick={() => { setIsCardModalOpen(false); setIsSelectorOpen(true); }}
                        className="text-[9px] font-bold uppercase text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/20"
                    >
                        Switch Card
                    </button>
                )}
            </div>
            
            <p className="text-sm text-zinc-400 font-medium uppercase leading-relaxed">
                A valid industrial-grade payment method is required to secure your bidding capacity.
            </p>

            <Elements stripe={stripePromise}>
                <CardValidation onOptionalSuccess={async () => {
                    const newCards = await getPaymentMethods()
                    setCards(newCards)
                    setIsCardModalOpen(false)
                    if (newCards.length > 0) handleRegister(newCards[0].id)
                }} />
            </Elements>
        </div>
      </Modal>

      {/* MODAL: Sélection de carte */}
      <Modal isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} title="Bidding Account" maxWidth="max-w-md">
        <div className="p-10 space-y-10 italic">
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
                                "w-full p-5 rounded-[24px] border-2 transition-all flex items-center justify-between group",
                                isSelected 
                                    ? "bg-secondary border-secondary shadow-2xl shadow-secondary/20 text-white" 
                                    : "bg-zinc-50 border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-colors",
                                    isSelected ? "bg-white/10" : "bg-white border border-zinc-100 group-hover:bg-primary group-hover:text-white"
                                )}>
                                    <CreditCard size={18} strokeWidth={isSelected ? 2.5 : 2} />
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

            <button 
                onClick={() => { setIsSelectorOpen(false); setIsCardModalOpen(true); }}
                className="w-full py-2 text-[10px] font-bold uppercase text-zinc-300 hover:text-primary transition-all flex items-center justify-center gap-2 group"
            >
                <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" /> Register Another Account
            </button>

            <button 
                onClick={() => handleRegister(selectedCardId!)}
                disabled={registering || !selectedCardId}
                className="w-full bg-primary text-white py-6 rounded-3xl font-bold uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-secondary transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 disabled:opacity-50"
            >
                {registering ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Authorization <ChevronRight size={16} className="text-white/50" /></>}
            </button>
        </div>
      </Modal>
    </>
  )
}
