import { createAdminClient, createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CheckCircle2, XCircle, Package, Calendar, MapPin, ShieldCheck, Clock, Truck, Loader2 } from 'lucide-react'
import { cn, formatEventDate } from '@/lib/utils'
import { markAsCollected } from '@/app/actions/sales'

export const dynamic = 'force-dynamic'

interface VerifyGatePassProps {
  params: Promise<{ id: string }>
}

export default async function VerifyGatePass({ params }: VerifyGatePassProps) {
  const { id } = await params
  const supabaseAdmin = createAdminClient()
  const supabaseAuth = await createClient()

  // 1. Vérifier si l'utilisateur qui regarde la page est un Admin
  const { data: { user: currentUser } } = await supabaseAuth.auth.getUser()
  
  let isAdmin = false
  if (currentUser) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  // 2. Récupérer les données de la vente
  const { data: sale, error } = await supabaseAdmin
    .from('sales')
    .select(`
      id,
      invoice_number,
      status,
      collected_at,
      total_amount,
      winner:profiles (
        full_name
      ),
      event:auction_events (
        title,
        location
      ),
      sale_items (
        auction:auctions (
          lot_number,
          title
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full bg-white p-10 rounded-[40px] shadow-xl border border-zinc-100">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tighter italic text-zinc-900 mb-2">Invalid Pass</h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">This record does not exist or has been revoked.</p>
        </div>
      </div>
    )
  }

  const isPaid = sale.status === 'paid'
  const isCollected = !!sale.collected_at

  // Masking name for public verification (Privacy)
  const nameParts = (sale.winner as any).full_name.split(' ')
  const maskedName = nameParts.map((p: string) => p[0] + '***').join(' ')

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[48px] shadow-2xl border border-zinc-100 overflow-hidden italic">
        
        {/* Verification Status Header */}
        <div className={cn(
          "p-10 text-center text-white relative overflow-hidden",
          isPaid ? (isCollected ? "bg-zinc-900" : "bg-emerald-500") : "bg-rose-500"
        )}>
          <div className="relative z-10">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              {isPaid ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">
              {isPaid ? (isCollected ? "COLLECTED" : "VALID PASS") : "PAYMENT PENDING"}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-70">
              Security Verification Protocol
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 blur-3xl rounded-full"></div>
        </div>

        <div className="p-10 space-y-8">
          {/* Admin Action Button */}
          {isAdmin && isPaid && !isCollected && (
            <form action={async () => {
              'use server'
              await markAsCollected(sale.id)
            }}>
              <button 
                type="submit"
                className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
              >
                <Truck size={18} /> Confirm Collection & Exit
              </button>
              <p className="text-[9px] text-zinc-400 font-bold uppercase text-center mt-3 tracking-widest italic">
                Authorized Admin: {currentUser?.email}
              </p>
            </form>
          )}

          {isCollected && (
             <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center">
                <p className="text-emerald-700 font-black uppercase text-xs tracking-widest italic">
                   Asset has left the premises
                </p>
             </div>
          )}

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Pass ID</p>
              <p className="text-sm font-bold text-zinc-900 font-mono">GP-{sale.invoice_number.split('-')[1]}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Buyer Initials</p>
              <p className="text-sm font-bold text-zinc-900 uppercase">{maskedName}</p>
            </div>
          </div>

          {/* Asset List */}
          <div>
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package size={14} className="text-primary" /> Authorized Assets
            </h3>
            <div className="space-y-3">
              {sale.sale_items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-sm font-bold text-zinc-700 truncate max-w-[200px]">{item.auction.title}</span>
                  <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded">#{item.auction.lot_number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-4 pt-4 border-t border-zinc-50">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-zinc-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Location</p>
                <p className="text-xs font-bold text-zinc-600">{(sale.event as any)?.location || 'Virginia Warehouse'}</p>
              </div>
            </div>
            {isCollected && (
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Collected At</p>
                  <p className="text-xs font-bold text-zinc-600">{formatEventDate(sale.collected_at)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="pt-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 text-zinc-300">
              <ShieldCheck size={14} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Virginia Liquidation Digital Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
