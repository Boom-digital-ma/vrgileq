import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { cn, formatEventDate } from '@/lib/utils'
import PrintInvoiceButton from '@/components/auction/PrintInvoiceButton'
import PickupScheduler from '@/components/auction/PickupScheduler'
import { Truck } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface InvoicePageProps {
  params: Promise<{ id: string }>
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch User Session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // 2. Fetch Sale/Invoice Data with related info
  const { data: sale, error } = await supabase
    .from('sales')
    .select(`
      *,
      auction:auctions (
        title,
        lot_number,
        description
      ),
      winner:profiles (
        full_name,
        email,
        phone,
        address_line,
        city,
        state,
        zip_code,
        country
      ),
      event:auction_events (
        title,
        location
      )
    `)
    .eq('id', id)
    .single()

  if (error || !sale) {
    console.error('Invoice fetch error:', error)
    return notFound()
  }

  // 4. Fetch available pickup slots for this event
  const { data: slots } = await supabase
    .from('pickup_slots_with_counts')
    .select('*')
    .eq('event_id', sale.event_id)
    .order('start_at', { ascending: true })

  // 5. Authorization check (extra safety though RLS handles it)
  if (sale.winner_id !== user.id && user.user_metadata?.role !== 'admin') {
    return redirect('/profile')
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Actions - Hidden on print */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-prussian-blue font-geist">Invoice Details</h1>
          <div className="flex gap-3">
            {sale.status === 'paid' && (
              <Link 
                href={`/gate-pass/${sale.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm text-xs font-bold"
              >
                <Truck size={18} />
                Gate Pass
              </Link>
            )}
            <PrintInvoiceButton />
          </div>
        </div>

        {/* Invoice Container */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-neutral-200/50 overflow-hidden border border-neutral-100 print:shadow-none print:border-none print:rounded-none">
          {/* Header */}
          <div className="bg-prussian-blue p-8 sm:p-12 text-white flex flex-col sm:flex-row justify-between gap-8 items-start">
            <div>
              <Image 
                src="/images/logo-virginia-white.png" 
                alt="Virginia Liquidation" 
                width={200} 
                height={60} 
                className="mb-6 h-12 w-auto object-contain"
              />
              <div className="space-y-1 opacity-80 text-sm">
                <p>123 Industrial Way</p>
                <p>Richmond, VA 23219</p>
                <p>United States</p>
                <p>support@virginialiquidation.com</p>
              </div>
            </div>
            <div className="text-right sm:text-right w-full sm:w-auto">
              <h2 className="text-4xl font-bold font-geist italic uppercase tracking-tighter mb-2">Invoice</h2>
              <div className="space-y-1 text-sm font-medium">
                <p className="opacity-60 uppercase text-xs tracking-widest">Number</p>
                <p className="text-xl">{sale.invoice_number}</p>
                <p className="opacity-60 uppercase text-xs tracking-widest mt-4">Date</p>
                <p>{formatEventDate(sale.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {/* Pickup Scheduling Section - Hidden on print */}
            <div className="mb-12 print:hidden">
              <PickupScheduler 
                saleId={sale.id}
                eventId={sale.event_id}
                currentSlotId={sale.pickup_slot_id}
                slots={slots || []}
                isPaid={sale.status === 'paid'}
              />
            </div>

            {/* Bill To / Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Bill To</h3>
                <div className="space-y-1 font-geist">
                  <p className="text-lg font-bold text-prussian-blue">{sale.winner.full_name}</p>
                  <p className="text-neutral-600">{sale.winner.email}</p>
                  {sale.winner.phone && <p className="text-neutral-600">{sale.winner.phone}</p>}
                  <p className="text-neutral-600 mt-2">
                    {sale.winner.address_line}<br />
                    {sale.winner.city}, {sale.winner.state} {sale.winner.zip_code}<br />
                    {sale.winner.country}
                  </p>
                </div>
              </div>
              <div className="sm:text-right">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Auction Details</h3>
                <div className="space-y-1">
                  <p className="font-bold text-prussian-blue">{sale.event?.title || 'Industrial Liquidation'}</p>
                  <p className="text-neutral-500 text-sm">{sale.event?.location || 'Online Auction'}</p>
                  <div className="mt-4 inline-block px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-tight border border-teal-100">
                    Status: {sale.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-12">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-100">
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-neutral-400">Description</th>
                    <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-neutral-400">Lot #</th>
                    <th className="py-4 text-right text-xs font-bold uppercase tracking-widest text-neutral-400">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  <tr>
                    <td className="py-6">
                      <p className="font-bold text-prussian-blue text-lg">{sale.auction.title}</p>
                      <p className="text-sm text-neutral-500 max-w-md line-clamp-1">{sale.auction.description}</p>
                    </td>
                    <td className="py-6 text-right font-medium text-neutral-600">
                      {sale.auction.lot_number || 'N/A'}
                    </td>
                    <td className="py-6 text-right font-bold text-prussian-blue">
                      ${Number(sale.hammer_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-80 space-y-3">
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Hammer Price</span>
                  <span>${Number(sale.hammer_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Buyer's Premium ({sale.buyers_premium_rate}%)</span>
                  <span>${Number(sale.buyers_premium_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-neutral-500">
                  <span>Taxes ({sale.tax_rate}%)</span>
                  <span>${Number(sale.tax_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-3 border-t border-neutral-100 flex justify-between items-center">
                  <span className="font-bold text-prussian-blue">Total Amount</span>
                  <span className="text-2xl font-bold text-teal-600">
                    ${Number(sale.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-20 pt-8 border-t border-neutral-50 text-center">
              <p className="text-neutral-400 text-sm italic">
                Thank you for your business. Please arrange for pickup/removal within 5 business days.
              </p>
              <p className="text-neutral-300 text-[10px] mt-4 uppercase tracking-[0.2em]">
                Virginia Liquidation • Industrial Auction Solutions
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\:hidden { display: none !important; }
          @page { margin: 0; }
        }
      `}} />
    </div>
  )
}
