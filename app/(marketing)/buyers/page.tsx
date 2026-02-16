import React from 'react';
import Link from 'next/link';
import { Gavel, Truck, Eye, CreditCard, AlertTriangle, Info, CheckCircle2, ShieldCheck, ArrowRight, Users, Megaphone } from 'lucide-react';

export default function BuyersPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="mb-24 text-center">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 text-center">BUYER GUIDE</div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-secondary mb-6 leading-none">
            Welcome to <br />Virginia Liquidation
          </h1>
          <p className="text-xl text-neutral/60 font-medium max-w-2xl mx-auto italic">"The stuff you need at the price you set."</p>
        </header>

        {/* 1 & 2: INTRODUCTION */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <article className="bg-white p-10 border-2 border-primary shadow-[12px_12px_0px_0px_rgba(4,154,158,1)] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-primary text-white flex items-center justify-center font-black">1</div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-secondary">Before We Begin</h2>
            </div>
            <p className="text-neutral/70 font-medium leading-relaxed">
              Unlike traditional live auctions or eBay online-only auctions, Virginia Liquidation brings you a piece of every aspect of the auction buying experience. We are a little bit traditional (with previews and pickups), a little bit eBay (online bidding), and something altogether different (event-based photo catalogs and credit card only payments). Even if you're familiar with our auctions, take a look around; you will likely find information about our process, policies, or techniques which will help you better navigate the site and have the best bidding experience possible.
            </p>
          </article>

          <article className="bg-white p-10 border-2 border-secondary shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-secondary text-white flex items-center justify-center font-black">2</div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-secondary">Getting Started</h2>
            </div>
            <p className="text-neutral/70 font-medium leading-relaxed mb-6">
              We are the place to get great values. To ensure that buyers get the stuff they need at the price they set, we have developed buyer rights and responsibilities. Please read thoroughly through this page for a smooth buying experience.
            </p>
            <div className="mt-auto">
              <span className="bg-secondary/10 text-secondary px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                Internet-only sales throughout the United States
              </span>
            </div>
          </article>
        </div>

        {/* 3, 4, 5, 6: THE PROCESS */}
        <div className="mb-32">
          <div className="flex items-center gap-4 mb-16">
            <div className="h-12 w-12 bg-primary text-white flex items-center justify-center font-black">3-6</div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-secondary">The Buying Process</h2>
            <div className="h-[2px] flex-1 bg-primary/20"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="h-16 w-16 bg-light/30 flex items-center justify-center shrink-0 border-2 border-primary/20 group hover:border-primary transition-colors">
                  <Gavel className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary mb-3">3. Bidding</h3>
                  <p className="text-neutral/60 font-medium leading-relaxed">
                    Once you are registered, bidding is easy. Visit an open event with an active catalog. Click the item to enter bidding. Place the Bid Required in the 'your bid' box and your Max bid in the 'your maximum bid' box. Bids are processed at the bottom of EACH page. Enter your username and password to confirm.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="h-16 w-16 bg-light/30 flex items-center justify-center shrink-0 border-2 border-primary/20 group hover:border-primary transition-colors">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary mb-3">4. Removal</h3>
                  <p className="text-neutral/60 font-medium leading-relaxed">
                    All items are assumed to be picked up at the physical location noted in the event details. Virginia Liquidation does not offer any type of shipping, packing, or assistance during removal. Our clients often need their location empty; items not picked up during the removal will be considered abandoned.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex gap-8">
                <div className="h-16 w-16 bg-light/30 flex items-center justify-center shrink-0 border-2 border-primary/20 group hover:border-primary transition-colors">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary mb-3">5. Inspection</h3>
                  <p className="text-neutral/60 font-medium leading-relaxed">
                    Most events feature a preview inspection or open house one or two days prior to the conclusion of the auction. This is a showcase of the items at their physical location. You must register before bidding. Bidders should carefully consider the photos, details, and terms of sale, then bid accordingly if there is no preview.
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="h-16 w-16 bg-light/30 flex items-center justify-center shrink-0 border-2 border-primary/20 group hover:border-primary transition-colors">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-secondary mb-3">6. Payment</h3>
                  <p className="text-neutral/60 font-medium leading-relaxed">
                    Accepted forms of payment are MasterCard/Visa. You must have available balance on your credit card for your auto purchases. At the conclusion of the event, your card is automatically charged for the entire amount of your purchases. Please note: A 15% buyer's premium will be added to each purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7: TERMINATION POLICY */}
        <div className="mb-32 border-4 border-red-600 bg-white shadow-[20px_20px_0px_0px_rgba(220,38,38,0.1)]">
          <div className="bg-red-600 px-8 py-6 flex items-center gap-4">
            <div className="h-10 w-10 bg-white text-red-600 flex items-center justify-center font-black">7</div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white">Bidder Responsibility & Termination Policy</h2>
          </div>
          
          <div className="p-12">
            <p className="mb-12 text-neutral/80 font-medium leading-relaxed text-lg">
              We are so grateful that you choose Virginia Liquidation Auctions. Out of respect for our sellers and for the vast majority of buyers that take these responsibilities to heart, we will terminate a buyer's bidding privileges after two infractions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="flex gap-6 p-8 bg-yellow-50 border-2 border-yellow-200">
                <AlertTriangle className="h-8 w-8 text-yellow-600 shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-yellow-700 mb-2">First Occurrence</h4>
                  <p className="text-neutral/70 font-medium leading-relaxed">
                    If a buyer does not live up to their responsibilities... we will suspend bidding privileges until one of our customer service team members is able to speak with the buyer and resolve the issue.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 p-8 bg-red-50 border-2 border-red-200">
                <ShieldCheck className="h-8 w-8 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-red-700 mb-2">Final Occurrence</h4>
                  <p className="text-neutral/70 font-medium leading-relaxed">
                    If a buyer does not live up to their responsibilities... a second time, we will terminate bidding privileges.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block bg-neutral text-white px-6 py-3 text-sm font-black uppercase tracking-widest">
                "This termination policy makes everyone equal, every time."
              </div>
            </div>
          </div>
        </div>

        {/* 8: GREAT DEALS */}
        <div className="bg-secondary text-white p-16 shadow-[24px_24px_0px_0px_rgba(4,154,158,1)] mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-12 w-12 bg-primary text-white flex items-center justify-center font-black text-xl">8</div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">With Great Deals Come Responsibilities</h2>
          </div>
          
          <p className="text-xl font-medium text-white/80 mb-12 leading-relaxed italic">
            "In order to keep those exciting deals coming, we have to be responsible and respectful to their owners. This means:"
          </p>

          <div className="grid md:grid-cols-1 gap-6">
            {[
              "Picking up items during specified removal times and only during specified removal times.",
              "Bringing all tools, people, and resources to safely disassemble and remove items.",
              "Bidding only on those items you are serious about winning.",
              "Following through on auction purchases.",
              "Understanding that your credit card will be charged immediately following the close of an event."
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-1 group-hover:bg-primary transition-colors">
                  <ArrowRight className="h-4 w-4 text-primary group-hover:text-white" />
                </div>
                <p className="text-lg md:text-2xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors text-white">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTAs */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* SELLERS CTA */}
          <div className="bg-white border-4 border-primary p-12 flex flex-col items-center text-center shadow-[16px_16px_0px_0px_rgba(4,154,158,0.1)] transition-transform hover:-translate-y-2">
            <Users className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-secondary mb-4">Sellers</h2>
            <p className="text-neutral/60 font-bold uppercase tracking-tight text-sm mb-8">
              Find out more on our sellers page.
            </p>
            <Link 
              href="/sellers" 
              className="bg-primary text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)]"
            >
              Click Here
            </Link>
          </div>

          {/* REFERRALS CTA */}
          <div className="bg-white border-4 border-secondary p-12 flex flex-col items-center text-center shadow-[16px_16px_0px_0px_rgba(11,43,83,0.1)] transition-transform hover:-translate-y-2">
            <Megaphone className="w-12 h-12 text-secondary mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-secondary mb-4">Referrals</h2>
            <p className="text-neutral/60 font-bold uppercase tracking-tight text-sm mb-8">
              We are proud to pay up to 20% referral fees. Have a lead?
            </p>
            <Link 
              href="/contact" 
              className="bg-secondary text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-[4px_4px_0px_0px_rgba(4,154,158,0.2)]"
            >
              Click Here
            </Link>
          </div>
        </div>

      </section>
    </div>
  );
}
