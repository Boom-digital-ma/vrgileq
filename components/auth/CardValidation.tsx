'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { savePaymentMethod } from '@/app/actions/payment'
import { Loader2, CreditCard, ShieldCheck, AlertCircle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CardValidation({ 
    onOptionalSuccess, 
    onPaymentMethodCreated 
}: { 
    onOptionalSuccess?: () => void,
    onPaymentMethodCreated?: (id: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      })

      if (stripeError) throw new Error(stripeError.message)

      if (onPaymentMethodCreated) {
        onPaymentMethodCreated(paymentMethod.id)
        setSuccess(true)
        return
      }

      const result = await savePaymentMethod(paymentMethod.id)
      if (!result.success) throw new Error('Failed to save payment method')

      setSuccess(true)
      if (onOptionalSuccess) onOptionalSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] flex flex-col items-center text-center italic animate-in zoom-in-95 duration-500">
        <div className="bg-white p-3 rounded-full shadow-sm mb-6">
            <ShieldCheck className="h-10 w-10 text-emerald-500" />
        </div>
        <h3 className="font-bold uppercase text-emerald-700 font-display text-xl tracking-tight">Transmission Secure</h3>
        <p className="text-[10px] font-bold text-emerald-600/70 mt-2 uppercase tracking-widest">Your digital wallet has been synchronized.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-[32px] italic">
      <div className="p-8 space-y-8">
        <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Lock size={22} />
            </div>
            <div>
                <h3 className="font-bold uppercase text-secondary font-display text-lg tracking-tight">Payment Protocol</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Stripe-encrypted verification</p>
            </div>
        </div>

        <div className="p-6 bg-zinc-50 border-2 border-zinc-100 rounded-2xl shadow-inner transition-all focus-within:border-primary/20 focus-within:bg-white">
            <CardElement options={{
            style: {
                base: {
                fontSize: '16px',
                color: '#0B2B53',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                '::placeholder': { color: '#94A3B8' },
                },
            }
            }} />
        </div>

        {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-[10px] font-bold uppercase flex items-center gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={16} /> {error}
            </div>
        )}

        <button
            disabled={loading || !stripe}
            className="w-full bg-secondary text-white py-5 rounded-2xl font-bold uppercase tracking-[0.1em] hover:bg-primary transition-all active:scale-[0.98] shadow-xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50"
        >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck size={18} />}
            Synchronize Card
        </button>
        
        <div className="pt-6 border-t border-zinc-50">
            <p className="text-[8px] font-bold text-zinc-300 uppercase text-center leading-loose">
                By executing this protocol, you authorize Virginia Liquidation to perform a temporary $1 authorization to validate your credentials. Funds are never permanently withdrawn.
            </p>
        </div>
      </div>
    </form>
  )
}
