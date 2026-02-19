'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bookPickupSlot } from '@/app/actions/sales'
import { toast } from 'sonner'

interface Slot {
  id: string
  start_at: string
  end_at: string
  max_capacity: number
  booking_count: number
}

interface PickupSchedulerProps {
  saleId: string
  eventId: string
  currentSlotId?: string
  slots: Slot[]
  isPaid: boolean
}

export default function PickupScheduler({ saleId, eventId, currentSlotId, slots, isPaid }: PickupSchedulerProps) {
  const [loading, setLoading] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const currentSlot = slots.find(s => s.id === currentSlotId)

  const handleBook = async (slotId: string) => {
    setLoading(true)
    const res = await bookPickupSlot(saleId, slotId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Pickup scheduled successfully')
      setShowGrid(false)
    }
    setLoading(false)
  }

  if (currentSlot && !showGrid) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-[24px] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in duration-500 italic">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-1">Pickup Scheduled</p>
            <h4 className="text-xl font-bold text-zinc-900 font-display">
              {currentSlot.start_at ? format(new Date(currentSlot.start_at), 'EEEE, MMMM dd') : 'Invalid Date'}
            </h4>
            <p className="text-sm text-emerald-700 font-medium">
              at {currentSlot.start_at ? format(new Date(currentSlot.start_at), 'hh:mm a') : '--:--'} - {currentSlot.end_at ? format(new Date(currentSlot.end_at), 'hh:mm a') : '--:--'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowGrid(true)}
          className="text-xs font-bold uppercase text-emerald-600 border-b-2 border-emerald-200 hover:border-emerald-600 transition-all pb-0.5"
        >
          Change Appointment
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-neutral-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <Calendar className="text-teal-600" size={20} />
            <h3 className="text-lg font-bold text-prussian-blue font-geist uppercase tracking-tight">Schedule Your Pickup</h3>
        </div>
        {showGrid && currentSlot && (
            <button 
                onClick={() => setShowGrid(false)}
                className="text-xs font-bold uppercase text-zinc-400 hover:text-zinc-900 transition-colors"
            >
                Cancel
            </button>
        )}
      </div>

      {!isPaid && (
        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-sm">
          <AlertCircle className="shrink-0" size={18} />
          <p>Please note: Pickup can only be finalized once payment is fully processed.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.length === 0 ? (
          <p className="col-span-full text-center py-8 text-neutral-400 italic text-sm">
            No pickup slots have been generated for this event yet.
          </p>
        ) : (
          slots.map((slot) => {
            const isFull = slot.booking_count >= slot.max_capacity
            const slotDate = slot.start_at ? new Date(slot.start_at) : null;
            const isValid = slotDate && !isNaN(slotDate.getTime());

            return (
              <button
                key={slot.id}
                disabled={loading || isFull || !isValid}
                onClick={() => handleBook(slot.id)}
                className={cn(
                  "p-4 rounded-2xl border transition-all text-center flex flex-col gap-1",
                  (isFull || !isValid) 
                    ? "bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed" 
                    : "bg-white border-neutral-100 hover:border-teal-600 hover:shadow-md text-prussian-blue"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {isValid ? format(slotDate, 'MMM dd') : '---'}
                </span>
                <span className="font-bold font-geist italic">{isValid ? format(slotDate, 'hh:mm a') : '--:--'}</span>
                <span className="text-[9px] font-medium uppercase text-neutral-400 mt-1">
                  {isFull ? 'Fully Booked' : (!isValid ? 'Invalid Slot' : `${slot.max_capacity - slot.booking_count} left`)}
                </span>
              </button>
            )
          })
        )}
      </div>

      {loading && (
        <div className="mt-6 flex justify-center">
          <Loader2 className="animate-spin text-teal-600" />
        </div>
      )}
    </div>
  )
}
