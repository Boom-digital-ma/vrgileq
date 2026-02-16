import React from 'react';
import { 
  History, 
  Globe, 
  Gavel, 
  Users, 
  Building2, 
  Briefcase, 
  HeartHandshake, 
  Scale,
  ArrowRight
} from 'lucide-react';
import CORPORATE_FAMILY_DATA from "@/data/corporate-family.json";

const ICON_MAP: Record<string, React.ElementType> = {
  Scale, HeartHandshake, Briefcase, Globe, Building2
};

const CORPORATE_FAMILY = CORPORATE_FAMILY_DATA.map(company => ({
  ...company,
  icon: ICON_MAP[company.icon]
}));

export default function AboutPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="mb-32 text-center">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">OUR STORY</div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-secondary mb-8 leading-none">
            The Stuff You Need <br />
            <span className="text-primary">At The Price You Set</span>
          </h1>
          <p className="text-xl text-neutral/60 font-medium max-w-3xl mx-auto leading-relaxed italic">
            "Born in 1981, we evolved from traditional auctions to become a market leader in internet-only, event-based liquidations."
          </p>
        </div>

        {/* HISTORY & MISSION Grid */}
        <div className="grid md:grid-cols-2 gap-20 mb-32 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-primary/10 text-primary px-6 py-2 border border-primary/20 text-[10px] font-black uppercase tracking-widest">
              <History className="w-4 h-4" />
              Est. 1981
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-secondary leading-tight">
              Innovation & Heritage
            </h2>
            <div className="space-y-6 text-neutral/70 font-medium text-lg leading-relaxed">
              <p>
                Virginia Liquidation was founded to provide asset recovery services to the business community. With the emergence of the digital revolution, we innovated an <strong className="text-secondary">online-only solution</strong> combining the benefits of traditional liquidation with the efficiency of the internet.
              </p>
              <p>
                Today, we conduct sales large and small throughout the United States, honoring our legacy of innovation and high-quality service.
              </p>
            </div>
          </div>
          
          {/* Visual/Stats Card */}
          <div className="bg-white p-12 border-4 border-primary shadow-[20px_20px_0px_0px_rgba(4,154,158,1)]">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-secondary mb-8 border-b-2 border-primary pb-4">What We Sell</h3>
            <ul className="grid grid-cols-1 gap-6">
              {[
                "High-end designer furniture",
                "Diesel generators & Industrial gear",
                "Restaurant & Franchise closures",
                "IT Switchgear & Technology",
                "Corporate Headquarters",
                "Party Rental Companies"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-neutral font-black uppercase tracking-tight group">
                  <div className="h-2 w-8 bg-primary group-hover:w-12 transition-all"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* THE "UN-EBAY" SECTION */}
        <div className="bg-secondary text-white p-12 md:p-20 mb-32 shadow-[24px_24px_0px_0px_rgba(4,154,158,1)] relative overflow-hidden">
          <div className="relative z-10 grid lg:grid-cols-[1.2fr_1fr] gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">The &quot;Un-eBay&quot;</h2>
              <div className="space-y-6 text-white/80 font-medium text-lg leading-relaxed">
                <p>
                  Unlike eBay or Craigslist, which sell a single item to a single buyer, <strong className="text-primary uppercase">VirginiaLiquidation.com is an event-based liquidation site.</strong>
                </p>
                <p>
                  We are a little bit traditional (with previews and pickups), a little bit eBay (online bidding), and something altogether different. Each event has a specific location, scheduled preview, closing, and removal time.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white/5 border-2 border-white/10 p-8 hover:bg-white/10 transition-all group">
                <Gavel className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-xl uppercase tracking-tight mb-2">Event Based</h3>
                <p className="text-white/60 text-sm font-medium">We sell entire inventories from specific locations, not just single items.</p>
              </div>
              <div className="bg-white/5 border-2 border-white/10 p-8 hover:bg-white/10 transition-all group">
                <Users className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="font-black text-xl uppercase tracking-tight mb-2">Many Assets, Many Buyers</h3>
                <p className="text-white/60 text-sm font-medium">Efficiently connecting bulk sellers with mass buyers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CORPORATE FAMILY GRID */}
        <div className="mb-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-secondary mb-4">Our Corporate Family</h2>
            <div className="h-1 w-24 bg-primary mx-auto"></div>
            <p className="text-neutral/50 font-black uppercase tracking-widest text-[10px] mt-6">Comprehensive solutions for every asset class.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CORPORATE_FAMILY.map((company, index) => (
              <div key={index} className="bg-white p-10 border-2 border-light hover:border-primary transition-all group hover:shadow-[12px_12px_0px_0px_rgba(4,154,158,1)]">
                <div className="w-14 h-14 bg-light/30 border-2 border-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <company.icon className="w-7 h-7 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-black text-xl uppercase tracking-tight text-secondary mb-4">{company.name}</h3>
                <p className="text-sm text-neutral/60 font-medium leading-relaxed">
                  {company.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT CTA */}
        <div className="bg-light/10 border-4 border-dashed border-primary/30 p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-secondary mb-6">
            Have a project? Let&apos;s discuss.
          </h2>
          <p className="text-neutral/60 font-medium mb-10 max-w-2xl mx-auto uppercase tracking-tight text-lg">
            Call us to discuss your orderly liquidation or specialty auction project.
          </p>
          <a 
            href="tel:7037689000" 
            className="inline-flex items-center gap-4 bg-primary text-white px-12 py-6 text-sm font-black uppercase tracking-widest hover:bg-secondary transition-all shadow-[8px_8px_0px_0px_rgba(11,43,83,0.2)]"
          >
            (703) 768-9000 <ArrowRight className="w-5 h-5" />
          </a>
        </div>

      </section>
    </div>
  );
}
