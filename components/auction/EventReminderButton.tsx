'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, Loader2, Check, Star } from 'lucide-react'
import { toggleEventReminder, checkEventReminder } from '@/app/actions/reminders'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function EventReminderButton({ 
    eventId, 
    startAt, 
    isUpcoming, 
    variant = 'card' 
}: { 
    eventId: string, 
    startAt: string, 
    isUpcoming: boolean, 
    variant?: 'card' | 'page' 
}) {
    const [isSet, setIsSet] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        checkEventReminder(eventId).then(({ isSet }) => setIsSet(isSet))
    }, [eventId])

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        setLoading(true)
        try {
            const res = await toggleEventReminder(eventId)
            if (res.error === 'Unauthorized') {
                const loginMsg = isUpcoming 
                    ? "Please log in to set reminders." 
                    : "Please log in to watch this event."
                toast.error(loginMsg)
                return
            }
            if (res.error) {
                toast.error("Failed to update reminder.")
                return
            }
            
            if (res.added) {
                setIsSet(true)
                const successMsg = isUpcoming 
                    ? "We'll notify you when this event starts!" 
                    : "Event added to watchlist!"
                toast.success(successMsg, {
                    icon: <Check className="text-emerald-500" />,
                    duration: 4000
                })
            } else if (res.removed) {
                setIsSet(false)
                const infoMsg = isUpcoming
                    ? "Reminder removed."
                    : "Event removed from watchlist."
                toast.info(infoMsg)
            }
        } catch (err) {
            toast.error("An error occurred.")
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    const buttonLabel = isUpcoming 
        ? (isSet ? "Reminder Set" : "Notify Me") 
        : (isSet ? "Watching Event" : "Watch Event")

    if (variant === 'page') {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border active:scale-[0.98]",
                    isSet 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                        : "bg-white text-zinc-500 border-zinc-200 hover:text-primary hover:border-primary"
                )}
            >
                {loading ? <Loader2 size={14} className="animate-spin" /> : (
                    isUpcoming ? (
                        isSet ? <BellRing size={14} className="fill-current" /> : <Bell size={14} />
                    ) : (
                        <Star size={14} className={isSet ? "fill-current" : ""} />
                    )
                )}
                {buttonLabel}
            </button>
        )
    }

    // Default 'card' variant (small button)
    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            aria-label={isUpcoming ? (isSet ? "Remove Reminder" : "Set Reminder") : (isSet ? "Remove from Watchlist" : "Add to Watchlist")}
            className={cn(
                "p-2 rounded-full transition-all border shadow-sm active:scale-[0.98]",
                isSet 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" 
                    : "bg-white text-zinc-400 border-zinc-100 hover:text-primary hover:border-primary/20"
            )}
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : (
                isUpcoming ? (
                    isSet ? <BellRing size={14} className="fill-current" /> : <Bell size={14} />
                ) : (
                    <Star size={14} className={isSet ? "fill-current" : ""} />
                )
            )}
        </button>
    )
}
