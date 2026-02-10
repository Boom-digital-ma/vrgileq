import React from 'react';
import { 
  ClipboardCheck, 
  FileSignature, 
  Tags, 
  Globe, 
  MousePointer2, 
  Megaphone, 
  Search, 
  Timer, 
  CreditCard, 
  Truck, 
  FileSpreadsheet, 
  DollarSign,
  Upload
} from 'lucide-react';

const PROCESS_STEPS = [
  { step: "01", title: "Evaluation", icon: ClipboardCheck, desc: "Virginia Liquidation will interview you regarding the specifics of your project then prepare a schedule and tailored sales solution." },
  { step: "02", title: "Engagement", icon: FileSignature, desc: "Virginia Liquidation will forward a letter of agreement outlining the details of sale and the project scope." },
  { step: "03", title: "Identification", icon: Tags, desc: "We provide staff and materials necessary to prepare a detailed inventory. This can be completed by either our staff or the seller." },
  { step: "04", title: "Web Posting", icon: Globe, desc: "We prepare event details and inventory for the web. Most events are posted within 1-3 days of the identification process." },
  { step: "05", title: "Online Preview", icon: MousePointer2, desc: "Once posted, the inventory is fully searchable for preview and immediate bidding. The phase can be tailored to your schedule." },
  { step: "06", title: "Marketing", icon: Megaphone, desc: "We utilize direct mail, newsletters, web promotion, social media, and press releases immediately upon posting." },
  { step: "07", title: "Inspection", icon: Search, desc: "Most events include a one-day presale inspection or open house, conducted one or two days prior to the event closing." },
  { step: "08", title: "Event Closing", icon: Timer, desc: "The event closes dynamically (3-10 items per minute). Our system automatically extends time on any last-minute bids." },
  { step: "09", title: "Processing", icon: CreditCard, desc: "At the conclusion of the sale, all bidder transactions are automatically processed and receipts are emailed to winning bidders." },
  { step: "10", title: "Removal", icon: Truck, desc: "Removal is supervised by our staff or the seller. We coordinate disconnects and removals during days, evenings, or weekends." },
  { step: "11", title: "Reconciliation", icon: FileSpreadsheet, desc: "We prepare a detailed reconciliation with complete bidding history, revenue, costs of sale and proceeds disbursement." },
  { step: "12", title: "Settlement", icon: DollarSign, desc: "After delivery of the reconciliation report and sale proceeds, we conduct a closing interview to ensure complete satisfaction." }
];

const EVENT_TYPES = [
  {
    title: "Event Based Sales",
    desc: "Unlike eBay or craigslist, which sell a single item to a single buyer, VirginiaLiquidation.com is an event-based site where each event sells many assets to many buyers with set previews, closing and removal."
  },
  {
    title: "Employee Sales",
    desc: "We provide solutions for organizations wanting employees or associates to have exclusive purchase opportunities, ensuring a fun, fair, and efficient buying experience."
  },
  {
    title: "Virginia Supervised Events",
    desc: "From evaluation to site handover, we manage identification, marketing, sales, and transactions. Sellers only need to identify items; we handle the rest for a turn-key success."
  },
  {
    title: "Bulk Sales",
    desc: "For assets best suited for a single purchaser, we provide solutions that achieve the most commercially reasonable sale within your schedule and removal requirements."
  },
  {
    title: "Self-Supervised Events",
    desc: "Ideal for fewer assets, we provide inventory tools and barcode equipment so you can manage your own cataloging while benefiting from our marketing and financial processing."
  },
  {
    title: "Inventories & Valuations",
    desc: "We quickly prepare detailed asset inventories with barcodes, photos, and full specs (model, serial numbers, etc.) to provide accurate information for relocation or liquidation decisions."
  }
];

export default function SellersPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="mb-24">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4 text-center md:text-left">FOR SELLERS</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-secondary mb-12 leading-none">
            We Are Leaders And <br />Pioneers In This Market
          </h1>
          
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-primary">
                An Event-Based Company <br />Maximizing Success
              </h2>
              <p className="text-neutral/70 font-medium leading-relaxed">
                Liquidations are special events with unique methods of merchandising and marketing
                which have been refined by liquidators and auctioneers for hundreds of years. Our
                methods create a competitive bidding environment that pits the bidders against each
                other rather than the Seller.
              </p>
              <p className="text-neutral/70 font-medium leading-relaxed">
                In our business every client is different. Each liquidation event has a unique beginning,
                middle and end. We treat each event like one-time-only cannot miss opportunities to
                encourage the best price for our clients. Below is a listing of event types.
              </p>
            </div>
            <div className="space-y-6">
              <p className="text-neutral/70 font-medium leading-relaxed">
                The key to maximizing the success of any personal property liquidation is to provide
                the purchaser with complete product information and to conduct the sale in a
                manner which promotes comfort, flexibility and confidence with the purchase
                decision.
              </p>
              <p className="text-neutral/70 font-medium leading-relaxed">
                Many of the innovative marketing and merchandising techniques we employ have been
                developed by Virginia Liquidation. Our pioneering use of online marketing, online presentation and
                online sales allows Virginia Liquidation to provide solutions with unprecedented speed. Your
                project can benefit from our ability to quickly prepare and present your assets for sale
                in record time.
              </p>
              <div className="pt-4">
                <p className="text-secondary font-black uppercase tracking-widest text-sm italic">
                  Let us help you choose the perfect fit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TWO COLUMNS: INFO & FORM */}
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 mb-32">
          
          {/* LEFT: EVENT TYPES INFO */}
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-secondary whitespace-nowrap">
                Liquidation Events
              </h2>
              <div className="h-[2px] flex-1 bg-primary/20"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {EVENT_TYPES.map((type, idx) => (
                <div key={idx} className="bg-white p-8 border-2 border-primary shadow-[8px_8px_0px_0px_rgba(4,154,158,1)]">
                  <h3 className="font-black text-lg uppercase tracking-tight mb-4 text-secondary">{type.title}</h3>
                  <p className="text-neutral/60 font-medium leading-relaxed text-sm">{type.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-secondary text-white p-10 shadow-[12px_12px_0px_0px_rgba(4,154,158,1)]">
              <h3 className="text-xl font-black uppercase tracking-widest text-primary mb-4">Why Choose Us?</h3>
              <p className="text-lg font-medium leading-relaxed opacity-90 italic">
                &quot;The Virginia Liquidation process has been carefully crafted over many years dedicated to 
                <span className="text-primary font-black"> low client impact and maximum return.</span>&quot;
              </p>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="bg-white p-10 border-4 border-primary shadow-[20px_20px_0px_0px_rgba(11,43,83,0.1)] h-fit">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-secondary border-b-2 border-primary pb-4">Start Selling Today</h3>
            <form className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-2">Project Title</label>
                <input type="text" className="w-full border-2 border-light p-4 text-sm font-bold focus:border-primary focus:outline-none transition-colors" placeholder="e.g. Restaurant Closure" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-2">Description of Assets</label>
                <textarea rows={4} className="w-full border-2 border-light p-4 text-sm font-bold focus:border-primary focus:outline-none transition-colors" placeholder="Brief summary of what you are selling..." />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-2">Seller&apos;s Contact Info</label>
                <input type="text" className="w-full border-2 border-light p-4 text-sm font-bold focus:border-primary focus:outline-none transition-colors" placeholder="Phone or Email" />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-neutral/40 mb-2">Attachments (Optional)</label>
                <div className="group cursor-pointer flex flex-col items-center justify-center w-full border-2 border-dashed border-light p-8 bg-light/10 hover:bg-primary/5 hover:border-primary transition-all">
                  <Upload className="w-8 h-8 text-neutral/30 group-hover:text-primary mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral/40 group-hover:text-primary">Upload Photos/List</span>
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white font-black py-5 uppercase tracking-[0.2em] text-xs hover:bg-secondary transition-all shadow-[6px_6px_0px_0px_rgba(11,43,83,0.2)] active:translate-x-1 active:translate-y-1 active:shadow-none">
                Submit Project
              </button>
            </form>
          </div>
        </div>

        {/* PROCESS SECTION (12 Steps) */}
        <div className="border-t-2 border-light pt-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-secondary mb-4">
              Our No-Hassle Process
            </h2>
            <div className="h-1 w-24 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {PROCESS_STEPS.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white p-8 border-2 border-light hover:border-primary transition-all h-full flex flex-col items-center text-center group-hover:shadow-[8px_8px_0px_0px_rgba(4,154,158,1)]">
                  
                  <div className="w-12 h-12 bg-light/20 flex items-center justify-center mb-6 text-primary font-black text-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  
                  <item.icon className="w-8 h-8 text-neutral/30 mb-4 group-hover:text-primary transition-colors" />
                  
                  <h3 className="font-black text-secondary uppercase tracking-tight mb-3">{item.title}</h3>
                  <p className="text-xs text-neutral/50 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}
