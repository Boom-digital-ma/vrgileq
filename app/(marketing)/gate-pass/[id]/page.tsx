import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import PrintInvoiceButton from '@/components/auction/PrintInvoiceButton'
import { CheckCircle2, Truck, Calendar, Clock, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface GatePassPageProps {
  params: Promise<{ id: string }>
}

export default async function GatePassPage({ params }: GatePassPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // 2. Fetch Sale Data with pickup info
  const { data: sale, error } = await supabase
    .from('sales')
    .select(`
      *,
      auction:auctions (
        title,
        lot_number,
        description,
        image_url
      ),
      winner:profiles (
        full_name,
        email,
        phone
      ),
      event:auction_events (
        title,
        location
      ),
      pickup_slot:pickup_slots (
        start_at,
        end_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !sale) {
    console.error('Gate Pass fetch error:', error)
    return notFound()
  }

  // 3. Authorization check
  if (sale.winner_id !== user.id && user.user_metadata?.role !== 'admin') {
    return redirect('/profile')
  }

  // 4. Verification Check: Must be PAID to have a gate pass
  if (sale.status !== 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
        <div className="max-w-md w-full bg-white p-12 rounded-[48px] shadow-xl border border-zinc-100 text-center">
          <div className="h-20 w-20 bg-amber-50 rounded-[32px] flex items-center justify-center text-amber-500 mx-auto mb-8 border border-amber-100">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-4 uppercase tracking-tighter italic font-geist">Payment Required</h1>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            Your Gate Pass will be generated automatically once your payment has been confirmed as <strong>PAID</strong>.
          </p>
          <Link href={`/invoices/${sale.id}`} className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg">
            View Invoice
          </Link>
        </div>
      </div>
    )
  }

  // Generate a verification URL for the QR Code (pointing back to this page or an admin check)
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gate-pass/${sale.id}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationUrl)}`

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Actions - Hidden on print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-prussian-blue font-geist italic uppercase tracking-tighter">Gate Pass / Bon de Sortie</h1>
          <PrintInvoiceButton />
        </div>

        {/* Gate Pass Container */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-neutral-200/50 overflow-hidden border border-neutral-100 print:shadow-none print:border-none print:rounded-none relative">
          
          {/* Top Stamp / Status */}
          <div className="absolute top-8 right-8 rotate-12 opacity-20 print:opacity-100 pointer-events-none">
            <div className="border-4 border-emerald-500 text-emerald-500 px-6 py-2 rounded-xl font-black uppercase text-3xl tracking-widest">
              RELEASED
            </div>
          </div>

          {/* Header */}
          <div className="p-10 sm:p-12 border-b-4 border-double border-neutral-100">
            <Image 
              src="/images/logo-virginia-transparent.png" 
              alt="Virginia Liquidation" 
              width={180} 
              height={50} 
              className="mb-8 h-10 w-auto object-contain grayscale print:grayscale-0"
            />
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black font-geist italic uppercase tracking-tighter text-prussian-blue leading-none">Gate Pass</h2>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em] mt-2">Authorization for Removal</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-1">Pass Number</p>
                <p className="text-xl font-bold font-mono">GP-{sale.invoice_number.split('-')[1]}</p>
              </div>
            </div>
          </div>

          <div className="p-10 sm:p-12 space-y-12">
            
            {/* Primary Details: QR & Appointment */}
            <div className="flex flex-col sm:flex-row gap-12 items-center sm:items-start bg-zinc-50 rounded-[32px] p-8 border border-zinc-100">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-200 shrink-0">
                <img src={qrCodeUrl} alt="Verification QR" className="w-32 h-32" />
                <p className="text-[8px] font-bold text-center mt-2 uppercase tracking-widest text-zinc-400">Scan to Verify</p>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                    <Truck size={12} /> Removal Appointment
                  </h3>
                  {sale.pickup_slot ? (
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-prussian-blue">
                        {format(new Date(sale.pickup_slot.start_at), 'EEEE, MMMM dd, yyyy')}
                      </p>
                      <p className="text-lg font-medium text-teal-600">
                        {format(new Date(sale.pickup_slot.start_at), 'hh:mm a')} - {format(new Date(sale.pickup_slot.end_at), 'hh:mm a')}
                      </p>
                    </div>
                  ) : (
                    <p className="text-rose-500 font-bold italic underline">Appointment Not Scheduled</p>
                  )}
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                    <MapPin size={12} /> Pickup Location
                  </h3>
                  <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                    {sale.event?.location || 'Virginia Liquidation Main Warehouse'}<br />
                    Richmond, VA, United States
                  </p>
                </div>
              </div>
            </div>

            {/* Lot Verification */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 border-b border-neutral-100 pb-2">Authorized Assets</h3>
              <div className="flex gap-6 items-center">
                <div className="h-20 w-20 rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden shrink-0">
                   {sale.auction.image_url && <img src={sale.auction.image_url} className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Lot #{sale.auction.lot_number || '---'}</p>
                  <h4 className="text-xl font-bold text-prussian-blue leading-tight">{sale.auction.title}</h4>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">ID: {sale.auction_id}</p>
                </div>
              </div>
            </div>

            {/* Holder Info */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-neutral-200">
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Registered Owner</h3>
                  <p className="font-bold text-prussian-blue">{sale.winner.full_name}</p>
                  <p className="text-xs text-neutral-500">{sale.winner.phone}</p>
               </div>
               <div className="text-right">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Invoice Reference</h3>
                  <p className="font-bold text-prussian-blue">{sale.invoice_number}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Status: PAID & CLEARED</p>
               </div>
            </div>

            {/* Security Notes */}
            <div className="mt-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
               <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed text-center">
                 This document authorizes the holder to remove the specified assets from the premises. 
                 Identity verification may be required at the gate. Any tampering with this pass 
                 will result in immediate cancellation of removal rights.
               </p>
            </div>
          </div>
          
          {/* Footer Cut line */}
          <div className="p-8 border-t border-neutral-100 flex justify-between items-center text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic">
            <span>Virginia Liquidation Official Gate Pass</span>
            <span>Auth v1.0 • 2026</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  )
}
