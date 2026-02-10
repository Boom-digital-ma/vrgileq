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
import PROCESS_STEPS_DATA from "@/data/process-steps.json";
import EVENT_TYPES from "@/data/event-types.json";

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardCheck, FileSignature, Tags, Globe, MousePointer2, Megaphone, 
  Search, Timer, CreditCard, Truck, FileSpreadsheet, DollarSign
};

const PROCESS_STEPS = PROCESS_STEPS_DATA.map(step => ({
  ...step,
  icon: ICON_MAP[step.icon]
}));

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
