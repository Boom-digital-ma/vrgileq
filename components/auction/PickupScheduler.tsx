'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, CheckCircle2, Loader2, AlertCircle, MapPin, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bookPickupSlot } from '@/app/actions/sales'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/admin/Modal'

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
  onSuccess?: () => void
}

export default function PickupScheduler({ saleId, eventId, currentSlotId, slots, isPaid, onSuccess }: PickupSchedulerProps) {
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()
  const currentSlot = slots.find(s => s.id === currentSlotId)

  const handleBook = async (slotId: string) => {
    setLoading(true)
    const res = await bookPickupSlot(saleId, slotId)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Pickup scheduled successfully')
      setIsModalOpen(false)
      router.refresh()
      if (onSuccess) onSuccess()
    }
    setLoading(false)
  }

  return (
    <>
      <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm italic">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Calendar className={currentSlot ? "text-emerald-500" : "text-zinc-400"} size={18} />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Logistics & Removal</h3>
            </div>
            {currentSlot && (
                <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter border border-emerald-100">
                    Appointment Set
                </span>
            )}
        </div>

        <div className="p-8">
            {currentSlot ? (
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-zinc-900 font-display uppercase tracking-tight">
                                {format(new Date(currentSlot.start_at), 'EEEE, MMMM dd')}
                            </p>
                            <p className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                                {format(new Date(currentSlot.start_at), 'hh:mm a')} - {format(new Date(currentSlot.end_at), 'hh:mm a')}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border border-zinc-200 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm active:scale-95"
                    >
                        Change Appointment
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mb-4 border border-dashed border-zinc-200">
                        <MapPin size={32} strokeWidth={1} />
                    </div>
                    <p className="text-zinc-400 text-sm font-medium mb-6 uppercase tracking-tight">No removal appointment has been scheduled yet.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-zinc-200 hover:bg-primary transition-all active:scale-95 flex items-center gap-2"
                    >
                        Schedule Pickup <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Removal Protocol"
        maxWidth="max-w-3xl"
      >
        <div className="p-8 sm:p-10 space-y-8 font-sans">
            <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Availability Matrix</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed uppercase italic">
                    Select a verified 15-minute window for asset extraction. Note: High-capacity slots may be restricted during peak hours.
                </p>
            </div>

            {!isPaid && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-xs italic font-medium uppercase">
                    <AlertCircle className="shrink-0" size={16} />
                    <p>Financial synchronization required. Appointment can only be finalized once invoice is fully settled.</p>
                </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                        <p className="text-zinc-300 font-bold uppercase text-[10px] tracking-widest">No slots generated for this event.</p>
                    </div>
                ) : (
                    slots.map((slot) => {
                        const isFull = slot.booking_count >= slot.max_capacity
                        const slotDate = slot.start_at ? new Date(slot.start_at) : null;
                        const isValid = slotDate && !isNaN(slotDate.getTime());
                        const isSelected = slot.id === currentSlotId;

                        return (
                            <button
                                key={slot.id}
                                disabled={loading || isFull || !isValid || isSelected}
                                onClick={() => handleBook(slot.id)}
                                className={cn(
                                    "p-5 rounded-2xl border-2 transition-all text-center flex flex-col gap-1 relative overflow-hidden",
                                    isSelected ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg" :
                                    isFull || !isValid 
                                        ? "bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed" 
                                        : "bg-white border-zinc-100 hover:border-primary hover:shadow-md text-zinc-900 group"
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                    {isValid ? format(slotDate, 'MMM dd') : '---'}
                                </span>
                                <span className="font-bold text-sm italic">{isValid ? format(slotDate, 'hh:mm a') : '--:--'}</span>
                                <span className={cn(
                                    "text-[8px] font-black uppercase mt-1",
                                    isSelected ? "text-emerald-600" : "text-zinc-300 group-hover:text-primary"
                                )}>
                                    {isSelected ? 'Confirmed' : (isFull ? 'At Capacity' : `${slot.max_capacity - slot.booking_count} Available`)}
                                </span>
                            </button>
                        )
                    })
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Synchronizing Logistics...</p>
                </div>
            )}
        </div>
      </Modal>
    </>
  )
}
