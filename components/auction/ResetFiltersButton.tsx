"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ResetFiltersButton({ id, isActive }: { id: string, isActive: boolean }) {
    return (
        <Link 
            href={`/events/${id}`}
            onClick={() => {
                window.dispatchEvent(new Event('reset-auction-grid'));
            }}
            className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all whitespace-nowrap",
                isActive ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300"
            )}
        >
            All Items
        </Link>
    )
}
