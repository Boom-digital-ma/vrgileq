'use client'

import { useState, useEffect } from 'react'
import { registerForEvent, checkRegistration } from '@/app/actions/registrations'
import { getPaymentMethods } from '@/app/actions/payment'
import { Loader2, ShieldCheck, AlertCircle, CreditCard, Plus, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import CardValidation from '@/components/auth/CardValidation'
import { Modal } from '@/components/admin/Modal'
import { cn } from '@/lib/utils'

export default function RegistrationButton({ eventId, depositAmount }: { eventId: string, depositAmount: number }) {
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
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const [regRes, cardsRes, profileRes] = await Promise.all([
            checkRegistration(eventId),
            getPaymentMethods(),
            supabase.from('profiles').select('*').eq('id', user.id).single()
        ])
        setStatus(regRes)
        setCards(cardsRes)
        setProfile(profileRes.data)
        
        // Auto-select the default card if available
        if (profileRes.data?.default_payment_method_id) {
            setSelectedCardId(profileRes.data.default_payment_method_id)
        } else if (cardsRes.length > 0) {
            setSelectedCardId(cardsRes[0].id)
        }
      }
      setLoading(false)
    }
    init()
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

  if (loading) return (
    <button disabled className="w-full bg-secondary/50 py-4 text-white/50 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 italic">
      <Loader2 className="h-4 w-4 animate-spin" /> Verifying Status
    </button>
  )

  if (status.registered) {
    return (
      <div className="bg-emerald-500/10 border-2 border-emerald-500 p-4 flex items-center gap-3 text-emerald-500 italic shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]">
        <ShieldCheck className="shrink-0" />
        <div>
            <p className="font-black uppercase text-[10px] leading-none">Access Granted</p>
            <p className="text-[10px] font-bold opacity-80 uppercase mt-1 tracking-tighter">Bidding Authorization Active</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500 text-rose-500 text-[10px] font-bold uppercase flex items-center gap-2 italic">
                <AlertCircle size={14} /> {error}
            </div>
        )}
        
        <button 
          onClick={handleInitialClick}
          disabled={registering}
          className="w-full bg-primary py-4 text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-secondary border-2 border-transparent hover:border-primary transition-all shadow-[8px_8px_0px_0px_rgba(4,154,158,0.2)] active:translate-y-1 italic"
        >
          {registering ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Authorize Bidding"}
        </button>
      </div>

      {/* MODAL: Saisie nouvelle carte */}
      <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title="Secure Identity Verification" maxWidth="max-w-md">
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] text-zinc-400 font-bold uppercase italic">
                    A valid payment method is required.
                </p>
                {cards.length > 0 && (
                    <button 
                        onClick={() => { setIsCardModalOpen(false); setIsSelectorOpen(true); }}
                        className="text-[10px] font-black uppercase text-primary underline decoration-2 underline-offset-4"
                    >
                        Return to List
                    </button>
                )}
            </div>
            <CardValidation onOptionalSuccess={async () => {
                const newCards = await getPaymentMethods()
                setCards(newCards)
                setIsCardModalOpen(false)
                if (newCards.length > 0) handleRegister(newCards[0].id)
            }} />
        </div>
      </Modal>

      {/* MODAL: Sélection de carte (si plusieurs) */}
      <Modal isOpen={isSelectorOpen} onClose={() => setIsSelectorOpen(false)} title="Select Bidding Account" maxWidth="max-w-md">
        <div className="p-8 space-y-6">
            <p className="text-[10px] text-zinc-400 font-bold uppercase italic">Choose which card to use for the ${depositAmount.toLocaleString()} authorization hold:</p>
            
            <div className="space-y-3">
                {cards.map((card) => {
                    const isDefault = card.id === profile?.default_payment_method_id;
                    const isSelected = selectedCardId === card.id;
                    
                    return (
                        <button 
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={cn(
                                "w-full p-4 border-2 flex items-center justify-between transition-all italic relative overflow-hidden",
                                isSelected 
                                    ? "border-primary bg-primary/5 shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]" 
                                    : "border-zinc-100 text-zinc-400 hover:border-zinc-200"
                            )}
                        >
                            <div className="flex items-center gap-3 text-left relative z-10">
                                <CreditCard size={18} className={isSelected ? "text-primary" : "text-zinc-300"} />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className={cn(
                                            "text-xs font-black uppercase",
                                            isSelected ? "text-zinc-900" : "text-zinc-400"
                                        )}>{card.brand} •••• {card.last4}</p>
                                        {isDefault && (
                                            <span className="bg-primary text-white text-[6px] font-black uppercase px-1 py-0.5 shadow-[1px_1px_0px_0px_rgba(11,43,83,1)]">Primary</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold opacity-50 uppercase">Exp {card.exp_month}/{card.exp_year}</p>
                                </div>
                            </div>
                            {isSelected && <ShieldCheck size={16} className="text-primary relative z-10" />}
                        </button>
                    );
                })}
            </div>

            <button 
                onClick={() => { setIsSelectorOpen(false); setIsCardModalOpen(true); }}
                className="w-full py-2 text-[10px] font-black uppercase text-zinc-400 hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={14} /> Add another card
            </button>

            <button 
                onClick={() => handleRegister(selectedCardId!)}
                disabled={registering || !selectedCardId}
                className="w-full bg-zinc-900 py-4 text-white font-black uppercase text-xs tracking-widest mt-4 flex items-center justify-center gap-2 active:translate-y-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]"
            >
                {registering ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Authorization <ChevronRight size={16}/></>}
            </button>
        </div>
      </Modal>
    </>
  )
}
