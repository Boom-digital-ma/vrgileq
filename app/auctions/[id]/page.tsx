import ImageGallery from "@/components/auction/ImageGallery";
import BiddingWidget from "@/components/auction/BiddingWidget";

const LOT_DATA = {
  id: "001",
  auctionId: "IND-2024",
  auctionTitle: "Surplus Industrial Equipment from Precision Machining Facility",
  title: "2024 Industrial CNC Machine - Haas VF-2",
  price: 42500.0,
  endsAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
  location: "Roanoke, VA 24018",
  removalDate: "Friday, Feb 13, 2026",
  images: [
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=1200",
  ],
  specs: {
    Model: "VF-2",
    Year: "2024",
    Power: "30HP",
    RPM: "12000",
    Travels: "30\" x 16\" x 20\"",
    Controller: "Haas NGC",
  },
};

export default function AuctionDetailPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      {/* Auction Info Banner */}
      <div className="bg-light/10 border-b border-light py-8 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-secondary">
            Auction ID: {LOT_DATA.auctionId}
          </div>
          <h2 className="mb-6 text-2xl font-bold uppercase tracking-tight sm:text-3xl text-primary">
            {LOT_DATA.auctionTitle}
          </h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-1">Location</div>
              <div className="text-sm font-bold text-neutral">{LOT_DATA.location}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-1">Starts Closing</div>
              <div className="text-sm font-bold uppercase text-neutral">{LOT_DATA.endsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral/50 mb-1">Removal</div>
              <div className="text-sm font-bold uppercase text-neutral">{LOT_DATA.removalDate}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-secondary">
              Lot #{LOT_DATA.id}
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase sm:text-6xl lg:w-2/3 text-primary">
              {LOT_DATA.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_400px]">
          {/* Left Column */}
          <div className="flex flex-col gap-16">
            <ImageGallery images={LOT_DATA.images} />

            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary bg-white px-0">
                  Specifications
                </h2>
                <div className="h-[1px] flex-1 bg-primary"></div>
              </div>
              <div className="grid grid-cols-1 border-t border-light md:grid-cols-2">
                {Object.entries(LOT_DATA.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-light py-4 md:odd:pr-8 md:even:pl-8"
                  >
                    <span className="font-bold uppercase text-neutral/50 text-[10px] tracking-widest">{key}</span>
                    <span className="font-bold text-neutral text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary bg-white px-0">
                  Description
                </h2>
                <div className="h-[1px] flex-1 bg-primary"></div>
              </div>
              <p className="text-xl leading-relaxed text-neutral font-medium">
                This late-model Haas VF-2 vertical machining center is in pristine condition. 
                Features the Haas Next Generation Control, high-speed spindle, and side-mount tool changer. 
                Original owner, meticulously maintained with full service records available. 
                Includes chip conveyor and programmable coolant nozzle.
              </p>
            </section>
          </div>

          {/* Right Column */}
          <aside className="relative">
            <BiddingWidget initialPrice={LOT_DATA.price} endsAt={LOT_DATA.endsAt} />
          </aside>
        </div>
      </div>
    </div>
  </div>
  );
}