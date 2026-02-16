'use client'

import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { savePaymentMethod } from '@/app/actions/payment'
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react'

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
      // 1. Créer le PaymentMethod
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
      })

      if (stripeError) throw new Error(stripeError.message)

      console.log("CLIENT: PaymentMethod created ->", paymentMethod.id)

      // 2. Si on est en mode "standalone" (signup), on renvoie juste l'ID
      if (onPaymentMethodCreated) {
        console.log("CLIENT: Standalone mode, returning ID to parent")
        onPaymentMethodCreated(paymentMethod.id)
        setSuccess(true)
        return
      }

      // 3. Sinon, on enregistre dans le profil (flux dashboard)
      console.log("CLIENT: Dashboard mode, calling savePaymentMethod action")
      const result = await savePaymentMethod(paymentMethod.id)
      console.log("CLIENT: savePaymentMethod result ->", result)
      
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
      <div className="bg-green-50 border-2 border-green-600 p-6 flex flex-col items-center text-center">
        <ShieldCheck className="h-12 w-12 text-green-600 mb-4" />
        <h3 className="font-black uppercase text-green-600">Account Verified</h3>
        <p className="text-xs font-bold text-green-800 mt-2">Your payment method has been secured.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border-2 border-primary p-6 bg-white shadow-[8px_8px_0px_0px_rgba(11,43,83,1)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary p-2">
            <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
            <h3 className="font-black uppercase text-sm leading-none">Security Verification</h3>
            <p className="text-[10px] font-bold text-neutral/40 uppercase mt-1">A $1 authorization will be performed</p>
        </div>
      </div>

      <div className="p-4 border-2 border-light bg-light/5 mb-6">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#0B2B53',
              '::placeholder': { color: '#aab7c4' },
            },
          }
        }} />
      </div>

      {error && (
        <div className="text-red-600 text-[10px] font-black uppercase mb-4 p-2 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      <button
        disabled={loading || !stripe}
        className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Verify & Save Card"}
      </button>
      
      <p className="text-[8px] font-bold text-neutral/30 uppercase mt-4 text-center leading-relaxed">
        By verifying, you authorize Virginia Liquidation to perform a temporary $1 hold to validate your card. 
        This is not a permanent charge.
      </p>
    </form>
  )
}
