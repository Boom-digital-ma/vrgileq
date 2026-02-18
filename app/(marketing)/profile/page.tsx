'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gavel, Star, Trophy, Clock, Package, ArrowRight, CreditCard, ShieldCheck, Plus, Trash2, ShieldAlert, Loader2, History, User, Settings, Lock, ChevronRight, FileText, Truck } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { getPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } from '@/app/actions/payment'
import { changeEmail } from '@/app/actions/auth'
import { updateProfile, deleteAccount } from '@/app/actions/users'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'bids' | 'won' | 'watchlist' | 'payment' | 'security' | 'info'>('bids')
  const [data, setData] = useState<{ bids: any[], won: any[], watchlist: any[], profile: any, cards: any[] }>({ 
    bids: [], won: [], watchlist: [], profile: null, cards: [] 
  })
  const [loading, setLoading] = useState(true)
  const [emailLoading, setEmailLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
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
      .select('*, auctions(*, auction_images(*), auction_events(title))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const uniqueBidsMap = new Map()
    bids?.forEach(bid => {
      if (!uniqueBidsMap.has(bid.auction_id) && bid.auctions.status === 'live') {
          uniqueBidsMap.set(bid.auction_id, bid)
      }
    })

    const { data: won } = await supabase
      .from('sales')
      .select('*, auction:auctions(*, auction_images(*), auction_events(title))')
      .eq('winner_id', user.id)

    const { data: watch } = await supabase
      .from('watchlist')
      .select('*, auctions(*, auction_images(*), auction_events(title))')
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

  const handleEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const newEmail = formData.get('email') as string
    
    const res = await changeEmail(newEmail)
    if (res.error) {
        toast.error(res.error)
    } else {
        toast.success(res.success || 'Success')
    }
    setEmailLoading(false)
  }

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setProfileLoading(true)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    
    const res = await updateProfile(formData)
    if (res.error) {
        toast.error(res.error)
    } else {
        toast.success(res.success || 'Profile Updated')
        fetchData()
    }
    setProfileLoading(false)
  }

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!confirm("Are you sure? This may restrict your ability to bid.")) return
    setLoading(true)
    const res = await deletePaymentMethod(paymentMethodId)
    if (res.success) {
        toast.success("Card removed successfully")
        await fetchData()
    } else {
        toast.error("Failed to delete card: " + res.error)
    }
    setLoading(false)
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    setLoading(true)
    const res = await setDefaultPaymentMethod(paymentMethodId)
    if (res.success) {
        toast.success("Primary card updated")
        await fetchData()
    } else {
        toast.error("Error: " + res.error)
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm("CRITICAL: Permanently delete your account?")) return
    setLoading(true)
    const res = await deleteAccount()
    if (res.success) {
        await supabase.auth.signOut()
        window.location.href = '/?account_deleted=true'
    } else {
        toast.error("Error: " + res.error)
        setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-50 min-h-screen font-sans antialiased text-secondary italic">
      {/* SaaS Premium Header */}
      <div className="bg-white border-b border-zinc-100 pt-20 pb-16 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-primary rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Bidder Dashboard</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-secondary font-display uppercase leading-none">
              {user?.user_metadata?.full_name?.split(' ')[0] || 'My Account'}.
            </h1>
            <div className="flex items-center gap-3 mt-4">
                {data.profile?.is_verified && (
                    <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                        <ShieldCheck size={12} /> Verified Member
                    </div>
                )}
                <span className="text-zinc-300 text-[10px] font-bold uppercase tracking-widest">{user?.email}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 min-w-[140px] shadow-sm">
                <div className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest mb-1">Active Bids</div>
                <div className="text-3xl font-bold text-secondary font-display tabular-nums leading-none">{loading ? '---' : data.bids.length}</div>
            </div>
            <div className="bg-secondary p-6 rounded-3xl min-w-[140px] shadow-xl shadow-secondary/10 text-white italic">
                <div className="text-[9px] font-bold uppercase text-white/40 tracking-widest mb-1">Lots Won</div>
                <div className="text-3xl font-bold font-display tabular-nums leading-none">{loading ? '---' : data.won.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent opacity-50" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* SaaS Sidebar Nav */}
          <aside className="lg:w-64 shrink-0">
            <nav className="flex flex-col gap-1.5 sticky top-32">
              {[
                { id: 'bids', label: 'Live Bids', icon: Gavel },
                { id: 'won', label: 'Won Items', icon: Trophy },
                { id: 'watchlist', label: 'Watchlist', icon: Star },
                { id: 'payment', label: 'Secure Wallet', icon: CreditCard },
                { id: 'info', label: 'Identity', icon: User },
                { id: 'security', label: 'Security', icon: Lock },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center justify-between px-5 py-3 text-[11px] font-bold uppercase tracking-tight transition-all rounded-xl border",
                    activeTab === tab.id 
                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/10" 
                    : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-secondary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    {tab.label}
                  </div>
                  {activeTab === tab.id && <ChevronRight size={14} className="text-primary" />}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
                <div className="py-24 text-center">
                    <Loader2 size={32} className="mx-auto text-primary animate-spin mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Synchronizing records...</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                  
                  {activeTab === 'payment' && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-end border-b border-zinc-100 pb-6">
                          <div>
                              <h2 className="text-2xl font-bold uppercase tracking-tight font-display text-secondary">Secure Wallet</h2>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Manage verified payment protocols</p>
                          </div>
                          {!showAddCard && (
                              <button 
                                  onClick={() => setShowAddCard(true)}
                                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-secondary transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                              >
                                  <Plus size={14} /> Register New Card
                              </button>
                          )}
                      </div>

                      {showAddCard ? (
                          <div className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm max-w-2xl animate-in slide-in-from-top-4 duration-500">
                              <div className="flex justify-between items-center mb-10">
                                  <div className="flex items-center gap-2 text-primary">
                                    <Lock size={16} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Card Entry</span>
                                  </div>
                                  <button onClick={() => setShowAddCard(false)} className="text-[10px] font-bold uppercase text-zinc-300 hover:text-rose-500 transition-colors">Discard</button>
                              </div>
                              <Elements stripe={stripePromise}>
                                  <CardValidation onOptionalSuccess={() => { fetchData(); setShowAddCard(false); }} />
                              </Elements>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 gap-4">
                              {data.cards.map((card) => (
                                <div key={card.id} className="bg-white border border-zinc-100 p-6 rounded-[32px] flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-secondary/5">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-zinc-50 rounded-[20px] flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors border border-zinc-50">
                                            <CreditCard size={24} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="font-bold text-secondary uppercase text-sm tracking-tight">{card.brand} •••• {card.last4}</p>
                                                <span className="bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border border-emerald-100">Verified</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Expires {card.exp_month}/{card.exp_year}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 px-4">
                                        {card.id === data.profile?.default_payment_method_id ? (
                                            <div className="text-right">
                                                <span className="bg-secondary text-white text-[8px] font-bold uppercase px-3 py-1 rounded-lg shadow-sm">Primary Account</span>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleSetDefault(card.id)} className="text-[10px] font-bold uppercase text-zinc-300 hover:text-primary transition-all">Set Primary</button>
                                        )}
                                        <button onClick={() => handleDeleteCard(card.id)} className="p-2.5 bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 rounded-xl transition-all"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                              ))}
                              {data.cards.length === 0 && (
                                  <div className="py-20 text-center bg-white rounded-[40px] border border-zinc-100 shadow-sm border-dashed">
                                      <ShieldAlert size={48} className="mx-auto text-zinc-100 mb-4" />
                                      <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">No payment methods registered</p>
                                  </div>
                              )}
                          </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'info' && (
                    <div className="space-y-10">
                      <div className="border-b border-zinc-100 pb-6">
                          <h2 className="text-2xl font-bold uppercase tracking-tight font-display text-secondary">Identity Registry</h2>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Official contact & location data</p>
                      </div>

                      <form onSubmit={handleProfileUpdate} className="space-y-8">
                          <div className="bg-white p-10 rounded-[40px] border border-zinc-100 shadow-sm space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Legal Name</label>
                                      <input name="fullName" type="text" defaultValue={data.profile?.full_name} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Mobile Hub</label>
                                      <input name="phone" type="tel" defaultValue={data.profile?.phone} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Physical Address</label>
                                  <input name="address" type="text" defaultValue={data.profile?.address_line} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">City</label>
                                      <input name="city" type="text" defaultValue={data.profile?.city} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">State</label>
                                      <input name="state" type="text" defaultValue={data.profile?.state} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">ZIP</label>
                                      <input name="zip" type="text" defaultValue={data.profile?.zip_code} className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                              </div>
                          </div>
                          <button disabled={profileLoading} className="w-full bg-secondary text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all active:scale-[0.98] shadow-2xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50 italic">
                              {profileLoading ? <Loader2 size={18} className="animate-spin" /> : <Settings size={18} />} Save Registry Update
                          </button>
                      </form>
                    </div>
                  )}

                  {activeTab === 'bids' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
                        <Gavel size={20} className="text-primary" />
                        <h2 className="text-2xl font-bold uppercase font-display text-secondary italic">Active Participations</h2>
                      </div>
                      {data.bids.length === 0 ? (
                        <EmptyState message="No active participations detected" link="/auctions" linkText="Explore Catalog" />
                      ) : (
                        data.bids.map((bid) => (
                          <AuctionRow key={bid.id} auction={bid.auctions} bidAmount={bid.amount} status={bid.status} />
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'won' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
                        <Trophy size={20} className="text-primary" />
                        <h2 className="text-2xl font-bold uppercase font-display text-secondary italic">Acquisition History</h2>
                      </div>
                      {data.won.length === 0 ? (
                        <EmptyState message="No won assets in record" link="/auctions" linkText="Start Bidding" />
                      ) : (
                        data.won.map((sale) => (
                          <AuctionRow 
                            key={sale.id} 
                            auction={sale.auction} 
                            bidAmount={sale.hammer_price} 
                            isWon 
                            saleId={sale.id}
                            status={sale.status}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'watchlist' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 mb-8 border-b border-zinc-100 pb-6">
                        <Star size={20} className="text-primary" />
                        <h2 className="text-2xl font-bold uppercase font-display text-secondary italic">Saved for Review</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.watchlist.length === 0 ? (
                          <div className="col-span-full"><EmptyState message="Watchlist is currently clear" link="/auctions" linkText="Add Industrial Assets" /></div>
                        ) : (
                          data.watchlist.map((auction) => (
                            <div key={auction.id} className="bg-white border border-zinc-100 p-5 rounded-[32px] group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-secondary/5 italic">
                                <div className="relative aspect-video mb-6 overflow-hidden rounded-2xl border border-zinc-50">
                                    <Image src={auction.auction_images?.[0]?.url || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad"} alt={auction.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="400px" />
                                </div>
                                <h3 className="font-bold uppercase text-sm mb-4 line-clamp-1 text-secondary group-hover:text-primary transition-colors">{auction.title}</h3>
                                <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                                    <span className="text-xl font-bold text-secondary font-display">${auction.current_price?.toLocaleString()}</span>
                                    <Link href={`/auctions/${auction.id}`} className="bg-zinc-50 text-zinc-400 p-3 rounded-xl hover:bg-primary hover:text-white transition-all border border-zinc-100">
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-10">
                      <div className="border-b border-zinc-100 pb-6">
                          <h2 className="text-2xl font-bold uppercase tracking-tight font-display text-secondary">Security Protocols</h2>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Credentials & System Access</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                          <div className="bg-white border border-zinc-100 p-10 rounded-[40px] shadow-sm">
                              <h3 className="text-sm font-bold uppercase tracking-widest text-secondary mb-8 border-b border-zinc-50 pb-4">Email Synchronization</h3>
                              <form onSubmit={handleEmailChange} className="space-y-6">
                                  <div className="space-y-2">
                                      <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 ml-4">Current Verified Mail</label>
                                      <input disabled defaultValue={user?.email} className="w-full bg-zinc-50/50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-zinc-300 italic cursor-not-allowed" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-4">New Digital Mail</label>
                                      <input name="email" type="email" required className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                                  </div>
                                  <button disabled={emailLoading} className="w-full bg-secondary text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all active:scale-[0.98] shadow-lg shadow-secondary/10">
                                      {emailLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Initiate Change"}
                                  </button>
                              </form>
                          </div>
                          <div className="space-y-6">
                              <div className="bg-secondary p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-secondary/20">
                                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Password Protocol</h3>
                                  <p className="text-xs text-white/40 leading-relaxed uppercase mb-8">Execute a secure recovery sequence to modify your master password.</p>
                                  <Link href="/auth/forgot-password" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                                      Initiate Recovery <ArrowRight size={14} />
                                  </Link>
                                  <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-primary/10 blur-2xl rounded-full" />
                              </div>
                              <div className="bg-rose-50 border border-rose-100 p-10 rounded-[40px]">
                                  <h3 className="text-sm font-bold uppercase tracking-widest text-rose-600 mb-4">Decommission Account</h3>
                                  <p className="text-xs text-rose-400 leading-relaxed uppercase mb-8">Permanently archive all bidder data and acquisitions. This process is irreversible.</p>
                                  <button onClick={handleDeleteAccount} className="text-[10px] font-bold uppercase tracking-widest text-rose-600 border-b-2 border-rose-200 hover:border-rose-600 transition-all pb-1">
                                      Execute Archive Sequence
                                  </button>
                              </div>
                          </div>
                      </div>
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AuctionRow({ auction, bidAmount, status, isWon, saleId }: { auction: any, bidAmount: number, status?: string, isWon?: boolean, saleId?: string }) {
  const isWinning = status === 'active';
  const imgUrl = auction.auction_images?.[0]?.url || auction.image_url || "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad";

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 bg-white border border-zinc-100 p-6 rounded-[32px] group hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-secondary/5 italic">
      <div className="relative h-24 w-full md:w-40 shrink-0 overflow-hidden rounded-2xl border border-zinc-50">
        <Image src={imgUrl} alt={auction.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" sizes="200px" />
      </div>
      
      <div className="flex-1 min-w-0 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
          <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Asset Ref #{auction.id.slice(0,8)}</span>
          {auction.auction_events?.title && (
            <>
              <span className="h-1 w-1 rounded-full bg-zinc-200" />
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{auction.auction_events.title}</span>
            </>
          )}
        </div>
        <h3 className="text-xl font-bold text-secondary uppercase truncate group-hover:text-primary transition-colors font-display leading-tight">{auction.title}</h3>
        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-3">
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-zinc-400">
                <Clock size={12} className="text-primary" /> Ends {new Date(auction.ends_at).toLocaleDateString()}
            </div>
            {isWon && (
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    <Package size={12} /> Ready for Pickup
                </div>
            )}
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
        <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Valuation</p>
        <div className="text-2xl font-bold text-secondary font-display tabular-nums italic leading-none">${bidAmount?.toLocaleString()}</div>
        {!isWon ? (
            <div className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mt-2",
                isWinning ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
            )}>
                {isWinning ? "Leading" : "Outbid"}
            </div>
        ) : (
          saleId && (
            <div className="mt-2 flex gap-2">
              <Link 
                href={`/invoices/${saleId}`}
                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-md"
              >
                <FileText size={12} /> Invoice
              </Link>
              {isWon && status === 'paid' && (
                <Link 
                  href={`/gate-pass/${saleId}`}
                  target="_blank"
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md"
                >
                  <Truck size={12} /> Gate Pass
                </Link>
              )}
            </div>
          )
        )}
      </div>

      <Link href={`/auctions/${auction.id}`} className="bg-zinc-50 text-zinc-400 p-5 rounded-[20px] hover:bg-primary hover:text-white transition-all border border-zinc-100 group-hover:border-primary">
        <ArrowRight size={24} />
      </Link>
    </div>
  )
}

function EmptyState({ message, link, linkText }: { message: string, link: string, linkText: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[48px] border border-zinc-100 shadow-sm italic text-center">
      <div className="h-20 w-20 bg-zinc-50 rounded-[32px] flex items-center justify-center text-zinc-100 mb-8 border border-zinc-50">
        <Package size={40} strokeWidth={1} />
      </div>
      <h3 className="text-2xl font-bold uppercase font-display text-zinc-200 mb-8 tracking-tighter">{message}</h3>
      <Link href={link} className="bg-secondary text-white px-10 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary transition-all shadow-xl shadow-secondary/10">
        {linkText}
      </Link>
    </div>
  )
}
