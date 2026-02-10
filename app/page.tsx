import Link from "next/link";
import Image from "next/image";
import { Search, Building2, ArrowRight, Package, MapPin, TrendingUp } from "lucide-react";
import HeroSlider from "@/components/layout/HeroSlider";

const SUPPLIERS = [
  {
    id: "tenant-1",
    name: "Precision Machining Group",
    saleTitle: "2024 Industrial Surplus Sale",
    itemCount: 142,
    location: "Roanoke, VA",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tenant-2",
    name: "Global Restaurant Liquidators",
    saleTitle: "High-End Kitchen Equipment Event",
    itemCount: 85,
    location: "Washington, DC",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "tenant-3",
    name: "Apex Corporate Assets",
    saleTitle: "HQ Tech & Furniture Disposition",
    itemCount: 320,
    location: "Arlington, VA",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <HeroSlider />

      {/* Search & Tenants Stats */}
      <div className="mx-auto -mt-10 max-w-5xl px-6 relative z-10">
        <div className="flex border-4 border-primary bg-white shadow-[12px_12px_0px_0px_rgba(11,43,83,0.2)]">
          <div className="flex flex-1 items-center px-6">
            <Search className="mr-4 h-5 w-5 text-primary" />
            <input 
              type="text" 
              placeholder="Search by product, model, or supplier..." 
              className="w-full py-6 text-lg font-bold outline-none text-neutral placeholder:text-neutral/30"
            />
          </div>
          <button className="bg-primary px-10 text-xs font-black uppercase tracking-widest text-white hover:bg-secondary transition-colors">
            Search
          </button>
        </div>
      </div>

      {/* Seller CTA */}
      <section className="px-6 py-12 mt-12">
        <div className="mx-auto max-w-7xl bg-white border-4 border-primary p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[16px_16px_0px_0px_rgba(4,154,158,0.1)]">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-tight max-w-xl text-center md:text-left text-primary">
            Become a VirginiaLiquidation.com Seller today
          </h2>
          <Link 
            href="/sell" 
            className="bg-primary text-white px-10 py-5 text-sm font-black uppercase tracking-widest transition-all hover:bg-secondary shadow-[4px_4px_0px_0px_rgba(11,43,83,0.2)] whitespace-nowrap"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Featured Suppliers (Tenants) */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16">
            <div className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-secondary">Trusted Partners</div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-primary">Featured Suppliers</h2>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {SUPPLIERS.map((supplier) => (
            <div key={supplier.id} className="group">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-2 border-primary/20 mb-6 transition-all group-hover:border-primary">
                <Image
                  src={supplier.image}
                  alt={supplier.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white border-2 border-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary shadow-[4px_4px_0px_0px_rgba(4,154,158,1)]">
                  {supplier.itemCount} Lots Available
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral/50">{supplier.name}</span>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-primary transition-colors text-primary">{supplier.saleTitle}</h3>
                  <Link 
                    href="/auctions" 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-primary pb-1 transition-all hover:gap-4 text-primary"
                  >
                    View Supplier Catalog <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Why Multi-Tenant (Features) */}
      <section className="bg-light/10 py-24 border-y border-light">
        <div className="px-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-20 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
              <div>
                <div className="text-secondary font-black uppercase tracking-[0.3em] text-xs mb-4">FEATURES</div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-primary mb-8 leading-none">
                  Do more with exceptional
                </h2>
                <p className="text-neutral/60 font-medium leading-relaxed max-w-xl">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4 p-8 bg-white border-2 border-primary/10 shadow-[8px_8px_0px_0px_rgba(4,154,158,0.1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">Package, Lot or Freight</h4>
                  <p className="text-neutral/60 text-xs font-bold uppercase tracking-tight leading-relaxed">Merchandise on Liquidation.com comes in all sizes</p>
                </div>
                <div className="space-y-4 p-8 bg-white border-2 border-primary/10 shadow-[8px_8px_0px_0px_rgba(4,154,158,0.1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">Ship It Or Pick It Up</h4>
                  <p className="text-neutral/60 text-xs font-bold uppercase tracking-tight leading-relaxed">warehouses across the country</p>
                </div>
                <div className="space-y-4 p-8 bg-white border-2 border-primary/10 shadow-[8px_8px_0px_0px_rgba(4,154,158,0.1)]">
                  <div className="h-12 w-12 bg-primary text-white flex items-center justify-center">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary leading-tight">Largest Auction Stock</h4>
                  <p className="text-neutral/60 text-xs font-bold uppercase tracking-tight leading-relaxed">70-90% off retail prices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-2 border-primary p-12 shadow-[12px_12px_0px_0px_rgba(11,43,83,1)] bg-white">
          <div className="text-center md:text-left">
            <div className="text-6xl font-black tabular-nums leading-none mb-2 text-primary">1,240+</div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral/40">Total Active Lots</div>
          </div>
          <div className="h-[2px] w-12 bg-primary md:h-12 md:w-[2px]"></div>
          <div className="text-center md:text-left">
            <div className="text-6xl font-black tabular-nums leading-none mb-2 text-primary">48</div>
            <div className="text-xs font-black uppercase tracking-widest text-neutral/40">Certified Suppliers</div>
          </div>
          <div className="h-[2px] w-12 bg-primary md:h-12 md:w-[2px]"></div>
          <Link 
            href="/auctions" 
            className="bg-primary text-white px-10 py-6 text-sm font-black uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 hover:bg-secondary"
          >
            Start Bidding Now
          </Link>
        </div>
      </div>
    </section>
  </div>
  );
}
