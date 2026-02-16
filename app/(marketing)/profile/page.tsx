'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gavel, Star, Trophy, Clock, Package, ArrowRight, CreditCard, ShieldCheck, Plus, Trash2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { getPaymentMethods } from '@/app/actions/payment'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'bids' | 'won' | 'watchlist' | 'payment'>('bids')
  const [data, setData] = useState<{ bids: any[], won: any[], watchlist: any[], profile: any, cards: any[] }>({ 
    bids: [], won: [], watchlist: [], profile: null, cards: [] 
  })
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/auth/signin'
      return
    }
    setUser(user)

    const [profileRes, cardsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        getPaymentMethods()
    ])

    const { data: bids } = await supabase
      .from('bids')
      .select('*, auctions(*, auction_images(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const uniqueBidsMap = new Map()
    bids?.forEach(bid => {
      if (!uniqueBidsMap.has(bid.auction_id) && bid.auctions.status === 'live') {
          uniqueBidsMap.set(bid.auction_id, bid)
      }
    })

    const { data: won } = await supabase
      .from('auctions')
      .select('*, auction_images(*)')
      .eq('winner_id', user.id)
      .eq('status', 'sold')

    const { data: watch } = await supabase
      .from('watchlist')
      .select('*, auctions(*, auction_images(*))')
      .eq('user_id', user.id)

    setData({
      bids: Array.from(uniqueBidsMap.values()),
      won: won || [],
      watchlist: watch?.map(w => w.auctions) || [],
      profile: profileRes.data,
      cards: cardsRes
    })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [supabase])

  if (loading) return <div className="p-20 text-center animate-pulse uppercase font-black">Loading Dashboard...</div>

  return (
    <div className="bg-white min-h-screen font-sans tracking-tight text-neutral">
      {/* Header Profile */}
      <div className="bg-primary py-16 px-6 text-white border-b-8 border-secondary">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">Bidder Dashboard</div>
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-none flex items-center gap-4 italic">
              {user?.user_metadata?.full_name || 'My Account'}
              {data.profile?.is_verified && (
                <ShieldCheck className="h-8 w-8 text-secondary" />
              )}
            </h1>
            <p className="text-white/60 font-bold mt-2 uppercase text-xs">{user?.email}</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 border border-white/20 min-w-[120px]">
                <div className="text-[8px] font-black uppercase text-white/40">Active Bids</div>
                <div className="text-2xl font-black">{data.bids.length}</div>
            </div>
            <div className="bg-secondary p-4 min-w-[120px] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] text-primary">
                <div className="text-[8px] font-black uppercase text-primary/60">Lots Won</div>
                <div className="text-2xl font-black">{data.won.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-[144px] z-20 bg-white border-b-2 border-primary overflow-x-auto">
        <div className="mx-auto max-w-7xl flex min-w-max md:min-w-0">
          {[
            { id: 'bids', label: 'Live Bids', icon: Gavel },
            { id: 'won', label: 'Won Items', icon: Trophy },
            { id: 'watchlist', label: 'Watchlist', icon: Star },
            { id: 'payment', label: 'Payment Wallet', icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-6 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white italic' 
                : 'text-neutral hover:bg-light/10'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        {activeTab === 'payment' && (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b-2 border-light pb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Secure Wallet</h2>
                    <p className="text-[10px] font-bold text-neutral/40 uppercase">Manage your authorized payment methods</p>
                </div>
                {!showAddCard && (
                    <button 
                        onClick={() => setShowAddCard(true)}
                        className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,1)]"
                    >
                        <Plus size={14} /> Add New Card
                    </button>
                )}
            </div>

            {showAddCard ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase text-primary">Enter Card Details</span>
                        <button onClick={() => setShowAddCard(false)} className="text-[10px] font-black uppercase text-neutral/40 hover:text-primary underline">Cancel</button>
                    </div>
                    <Elements stripe={stripePromise}>
                        <CardValidation onOptionalSuccess={() => { setShowAddCard(false); fetchData(); }} />
                    </Elements>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {data.cards.map((card) => (
                        <div key={card.id} className="bg-white border-2 border-primary p-6 flex items-center justify-between group hover:shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] transition-all italic">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary p-3 text-white">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="font-black uppercase text-sm leading-none">{card.brand} •••• {card.last4}</p>
                                    <p className="text-[10px] font-bold text-neutral/40 uppercase mt-1">Expires {card.exp_month}/{card.exp_year}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {card.id === data.profile?.default_payment_method_id && (
                                    <span className="bg-green-50 text-green-600 text-[8px] font-black uppercase px-2 py-1 border border-green-200">Default</span>
                                )}
                                <button className="text-neutral/20 hover:text-red-600 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {data.cards.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed border-light rounded-xl">
                            <ShieldAlert className="mx-auto h-8 w-8 text-neutral/20 mb-2" />
                            <p className="text-[10px] font-black uppercase text-neutral/30 italic">No payment methods stored</p>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}

        {/* ... (garder le reste des tabs existants) */}
        {activeTab === 'bids' && (
          <div className="space-y-6">
            {data.bids.length === 0 ? (
              <EmptyState message="No active bids found" link="/auctions" linkText="Browse Auctions" />
            ) : (
              data.bids.map((bid) => (
                <AuctionRow key={bid.id} auction={bid.auctions} bidAmount={bid.amount} status={bid.status} />
              ))
            )}
          </div>
        )}

        {activeTab === 'won' && (
          <div className="space-y-6">
            {data.won.length === 0 ? (
              <EmptyState message="You haven't won any auctions yet" link="/auctions" linkText="Start Bidding" />
            ) : (
              data.won.map((auction) => (
                <AuctionRow key={auction.id} auction={auction} bidAmount={auction.current_price} isWon />
              ))
            )}
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.watchlist.length === 0 ? (
              <div className="col-span-full">
                <EmptyState message="Your watchlist is empty" link="/auctions" linkText="Add Items" />
              </div>
            ) : (
              data.watchlist.map((auction) => (
                <div key={auction.id} className="border-2 border-primary p-4 group hover:shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] transition-all italic">
                    <div className="relative aspect-video mb-4 overflow-hidden border-2 border-primary">
                        <Image 
                            src={auction.auction_images?.[0]?.url || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad"} 
                            alt={auction.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform"
                        />
                    </div>
                    <h3 className="font-black uppercase text-sm mb-2 line-clamp-1">{auction.title}</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-primary">${auction.current_price?.toLocaleString()}</span>
                        <Link href={`/auctions/${auction.id}`} className="bg-primary text-white p-2 hover:bg-secondary transition-colors">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function AuctionRow({ auction, bidAmount, status, isWon }: { auction: any, bidAmount: number, status?: string, isWon?: boolean }) {
  const isWinning = status === 'active';
  
  return (
    <div className="flex flex-col md:flex-row items-center gap-6 border-2 border-primary p-6 hover:bg-light/5 transition-colors group italic">
      <div className="relative h-24 w-full md:w-40 shrink-0 overflow-hidden border-2 border-primary">
        <Image 
            src={auction.auction_images?.[0]?.url || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad"} 
            alt={auction.title} 
            fill 
            className="object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0 text-center md:text-left">
        <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-1">Lot #{auction.id.slice(0,8)}</div>
        <h3 className="text-xl font-black uppercase truncate group-hover:text-secondary transition-colors">{auction.title}</h3>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-neutral/60">
                <Clock className="h-3 w-3" /> Ends: {new Date(auction.ends_at).toLocaleDateString()}
            </div>
            {isWon && (
                <div className="flex items-center gap-1 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-0.5 border border-green-200">
                    <Package className="h-3 w-3" /> Paid & Ready for Removal
                </div>
            )}
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
        <div className="text-[10px] font-black uppercase tracking-widest text-neutral/40 text-right">Your Last Bid</div>
        <div className="text-2xl font-black text-primary">${bidAmount?.toLocaleString()}</div>
        {!isWon && (
            <div className={`text-[10px] font-black uppercase px-3 py-1 border-2 ${
                isWinning ? 'bg-green-600 text-white border-green-600' : 'bg-red-50 text-red-600 border-red-600 animate-pulse'
            }`}>
                {isWinning ? 'Winning' : 'Outbid'}
            </div>
        )}
      </div>

      <Link href={`/auctions/${auction.id}`} className="bg-primary text-white p-4 hover:bg-secondary transition-colors shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]">
        <ArrowRight className="h-6 w-6" />
      </Link>
    </div>
  )
}

function EmptyState({ message, link, linkText }: { message: string, link: string, linkText: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-light bg-light/5 text-center italic">
      <div className="bg-light p-4 rounded-full mb-6">
        <Package className="h-12 w-12 text-neutral/20" />
      </div>
      <h3 className="text-2xl font-black uppercase text-neutral/30 mb-6">{message}</h3>
      <Link href={link} className="bg-primary px-8 py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-[6px_6px_0px_0px_rgba(11,43,83,1)]">
        {linkText}
      </Link>
    </div>
  )
}
