'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Gavel, Star, Trophy, Clock, Package, ArrowRight, CreditCard, ShieldCheck, Plus, Trash2, ShieldAlert, Loader2, History, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CardValidation from '@/components/auth/CardValidation'
import { getPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } from '@/app/actions/payment'
import { changeEmail } from '@/app/actions/auth'
import { updateProfile, deleteAccount } from '@/app/actions/users'
import { cn } from '@/lib/utils'

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

  const handleEmailChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    const newEmail = formData.get('email') as string
    
    const res = await changeEmail(newEmail)
    if (res.error) {
        setMessage({ text: res.error, type: 'error' })
    } else {
        setMessage({ text: res.success || 'Success', type: 'success' })
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
        setMessage({ text: res.error, type: 'error' })
    } else {
        setMessage({ text: res.success || 'Profile Updated', type: 'success' })
        fetchData() // Refresh local state
    }
    setProfileLoading(false)
  }

  const handleDeleteCard = async (paymentMethodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method? This may restrict your ability to bid on active auctions.")) {
        return
    }

    setLoading(true)
    const res = await deletePaymentMethod(paymentMethodId)
    if (res.success) {
        await fetchData() // Refresh the list
    } else {
        alert("Failed to delete card: " + res.error)
    }
    setLoading(false)
  }

  const handleSetDefault = async (paymentMethodId: string) => {
    setLoading(true)
    const res = await setDefaultPaymentMethod(paymentMethodId)
    if (res.success) {
        await fetchData()
    } else {
        alert("Error: " + res.error)
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    const firstConfirm = confirm("CRITICAL ACTION: Are you sure you want to PERMANENTLY delete your account? All bidding history and won items will be archived and you will lose access.")
    if (!firstConfirm) return

    const secondConfirm = confirm("FINAL WARNING: This action cannot be undone. Type 'DELETE' is not required but please confirm one last time.")
    if (!secondConfirm) return

    setLoading(true)
    const res = await deleteAccount()
    if (res.success) {
        // Clear client side and redirect
        await supabase.auth.signOut()
        window.location.href = '/?account_deleted=true'
    } else {
        alert("Error deleting account: " + res.error)
        setLoading(false)
    }
  }

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
                <div className="text-2xl font-black">{loading ? '...' : data.bids.length}</div>
            </div>
            <div className="bg-secondary p-4 min-w-[120px] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] text-primary">
                <div className="text-[8px] font-black uppercase text-primary/60">Lots Won</div>
                <div className="text-2xl font-black">{loading ? '...' : data.won.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Content Grid */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0">
            <nav className="flex flex-col gap-2 sticky top-24">
              {[
                { id: 'bids', label: 'Live Bids', icon: Gavel },
                { id: 'won', label: 'Won Items', icon: Trophy },
                { id: 'watchlist', label: 'Watchlist', icon: Star },
                { id: 'payment', label: 'Payment Wallet', icon: CreditCard },
                { id: 'info', label: 'Account Info', icon: User },
                { id: 'security', label: 'Account Security', icon: ShieldCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-2",
                    activeTab === tab.id 
                    ? "bg-primary text-white border-primary shadow-[4px_4px_0px_0px_rgba(11,43,83,1)] italic" 
                    : "text-neutral border-transparent hover:border-light hover:bg-light/5"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-neutral/20 animate-pulse">
                    <History size={48} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Records...</p>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {activeTab === 'payment' && (
                    <div className="space-y-8">
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
                          <div className="animate-in fade-in slide-in-from-top-4 duration-300 max-w-2xl">
                              <div className="flex justify-between items-center mb-4">
                                  <span className="text-[10px] font-black uppercase text-primary">Enter Card Details</span>
                                  <button onClick={() => setShowAddCard(false)} className="text-[10px] font-black uppercase text-neutral/40 hover:text-primary underline">Cancel</button>
                              </div>
                              <Elements stripe={stripePromise}>
                                  <CardValidation onOptionalSuccess={() => {
                                      fetchData();
                                      setShowAddCard(false);
                                  }} />
                              </Elements>
                          </div>
                                      ) : (
                                          <div className="grid grid-cols-1 gap-4">
                                              {data.cards.map((card) => (                                  <div key={card.id} className="bg-white border-2 border-primary p-6 flex items-center justify-between group hover:shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] transition-all italic">
                                                                      <div className="flex items-center gap-4">
                                                                          <div className="bg-primary p-3 text-white">
                                                                              <CreditCard size={20} />
                                                                          </div>
                                                                          <div>
                                                                              <div className="flex items-center gap-2 mb-1">
                                                                                  <p className="font-black uppercase text-sm leading-none">{card.brand} •••• {card.last4}</p>
                                                                                  <span className="flex items-center gap-1 bg-primary/10 text-primary text-[8px] font-black uppercase px-1.5 py-0.5 border border-primary/20">
                                                                                      <ShieldCheck size={10} /> Verified
                                                                                  </span>
                                                                              </div>
                                                                              <p className="text-[10px] font-bold text-neutral/40 uppercase">Expires {card.exp_month}/{card.exp_year}</p>
                                                                          </div>
                                                                      </div>                                      <div className="flex items-center gap-4">
                                          {card.id === data.profile?.default_payment_method_id ? (
                                              <div className="flex flex-col items-end gap-1">
                                                  <span className="bg-primary text-white text-[8px] font-black uppercase px-2 py-1 shadow-[2px_2px_0px_0px_rgba(11,43,83,1)]">Primary Account</span>
                                                  <span className="text-[7px] font-bold text-primary uppercase italic">Used for automated holds</span>
                                              </div>
                                          ) : (
                                              <button 
                                                  onClick={() => handleSetDefault(card.id)}
                                                  className="text-[8px] font-black uppercase text-neutral/40 hover:text-primary underline decoration-2 underline-offset-4"
                                              >
                                                  Make Default
                                              </button>
                                          )}
                                          <button 
                                              onClick={() => handleDeleteCard(card.id)}
                                              className="text-neutral/20 hover:text-red-600 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                      </div>
                                  </div>
                              ))}
                              {data.cards.length === 0 && (
                                  <div className="col-span-full text-center py-12 border-2 border-dashed border-light rounded-xl">
                                      <ShieldAlert className="mx-auto h-8 w-8 text-neutral/20 mb-2" />
                                      <p className="text-[10px] font-black uppercase text-neutral/30 italic">No payment methods stored</p>
                                  </div>
                              )}
                          </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-12">
                      <div className="border-b-2 border-light pb-4">
                          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Account Security</h2>
                          <p className="text-[10px] font-bold text-neutral/40 uppercase">Manage your credentials and access</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="bg-white border-2 border-primary p-8 shadow-[8px_8px_0px_0px_rgba(4,154,158,1)]">
                              <h3 className="text-sm font-black uppercase tracking-widest mb-6">Change Email Address</h3>
                              
                              {message && (
                                  <div className={`mb-6 p-4 border-2 font-bold text-xs uppercase flex items-center gap-2 ${
                                      message.type === 'success' ? 'bg-green-50 border-green-600 text-green-600' : 'bg-red-50 border-red-600 text-red-600'
                                  }`}>
                                      {message.text}
                                  </div>
                              )}

                              <form onSubmit={handleEmailChange} className="space-y-6">
                                  <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-2">Current Email</label>
                                      <input type="text" disabled defaultValue={user?.email} className="w-full border-2 border-light p-3 font-bold bg-light/5 text-neutral/40 cursor-not-allowed" />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">New Email Address</label>
                                      <input name="email" type="email" required className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5 text-primary" placeholder="NEW-EMAIL@EXAMPLE.COM" />
                                  </div>
                                  <button 
                                      disabled={emailLoading}
                                      className="w-full bg-primary py-4 text-white font-black uppercase tracking-widest hover:bg-secondary transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] disabled:opacity-50"
                                  >
                                      {emailLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Request Email Change"}
                                  </button>
                              </form>
                          </div>

                          <div className="space-y-8">
                              <div className="bg-zinc-900 p-8 text-white h-fit shadow-[8px_8px_0px_0px_rgba(4,154,158,1)] text-center">
                                  <h3 className="text-sm font-black uppercase tracking-widest mb-4 text-primary">Password Management</h3>
                                  <p className="text-xs text-white/40 mb-6 italic leading-relaxed text-left">
                                      To change your password, you must request a recovery code. For security reasons, you will be logged out of other devices.
                                  </p>
                                  <Link href="/auth/forgot-password" className="inline-block border-2 border-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all">
                                      Initiate Reset
                                  </Link>
                              </div>

                              <div className="border-4 border-rose-600 p-8 bg-rose-50/30 text-center">
                                  <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 mb-4">Danger Zone</h3>
                                  <p className="text-xs text-rose-600/60 mb-6 italic leading-relaxed font-bold text-left">
                                      Permanently delete your account and all associated data. This action is irreversible.
                                  </p>
                                  <button 
                                      onClick={handleDeleteAccount}
                                      disabled={loading}
                                      className="bg-rose-600 text-white px-8 py-4 font-black uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-[6px_6px_0px_0px_rgba(159,18,57,1)] active:translate-y-1 disabled:opacity-50"
                                  >
                                      Delete My Account Forever
                                  </button>
                              </div>
                          </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'info' && (
                    <div className="space-y-12">
                      <div className="border-b-2 border-light pb-4">
                          <h2 className="text-2xl font-black uppercase tracking-tighter italic">Personal Information</h2>
                          <p className="text-[10px] font-bold text-neutral/40 uppercase">Update your identity and contact details</p>
                      </div>

                      {message && (
                          <div className={`p-4 border-2 font-bold text-xs uppercase flex items-center gap-2 ${
                              message.type === 'success' ? 'bg-green-50 border-green-600 text-green-600' : 'bg-red-50 border-red-600 text-red-600'
                          }`}>
                              {message.text}
                          </div>
                      )}

                      <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="md:col-span-2 bg-white border-2 border-primary p-8 shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] space-y-6">
                              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-light pb-2">Identity</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Full Legal Name</label>
                                      <input name="fullName" type="text" defaultValue={data.profile?.full_name} className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Mobile Phone</label>
                                      <input name="phone" type="tel" defaultValue={data.profile?.phone} className="w-full border-2 border-primary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                  </div>
                              </div>
                          </div>

                          <div className="md:col-span-2 bg-white border-2 border-secondary p-8 shadow-[8px_8px_0px_0px_rgba(4,154,158,1)] space-y-6">
                              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-light pb-2 text-secondary">Location & Tax Address</h3>
                              <div className="space-y-6">
                                  <div>
                                      <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Street Address</label>
                                      <input name="address" type="text" defaultValue={data.profile?.address_line} className="w-full border-2 border-secondary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                      <div>
                                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">Country</label>
                                          <select name="country" defaultValue={data.profile?.country || 'USA'} className="w-full border-2 border-secondary p-3 font-bold focus:outline-none">
                                              <option value="USA">United States</option>
                                              <option value="CAN">Canada</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">State / Province</label>
                                          <input name="state" type="text" defaultValue={data.profile?.state} className="w-full border-2 border-secondary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                      <div>
                                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">City</label>
                                          <input name="city" type="text" defaultValue={data.profile?.city} className="w-full border-2 border-secondary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-2">ZIP Code</label>
                                          <input name="zip" type="text" defaultValue={data.profile?.zip_code} className="w-full border-2 border-secondary p-3 font-bold focus:outline-none focus:bg-light/5" />
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="md:col-span-2">
                              <button 
                                  disabled={profileLoading}
                                  className="w-full bg-secondary py-5 text-primary font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] active:translate-y-1 disabled:opacity-50"
                              >
                                  {profileLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Save Profile Changes"}
                              </button>
                          </div>
                      </form>
                    </div>
                  )}

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {data.watchlist.length === 0 ? (
                        <div className="col-span-full">
                          <EmptyState message="Your watchlist is empty" link="/auctions" linkText="Add Items" />
                        </div>
                      ) : (
                        data.watchlist.map((auction) => (
                          <div key={auction.id} className="border-2 border-primary p-4 group hover:shadow-[8px_8px_0px_0px_rgba(11,43,83,1)] transition-all italic bg-white">
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
            )}
          </div>
        </div>
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
