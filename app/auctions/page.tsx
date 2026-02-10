import Link from "next/link";
import { Filter, Search, Grid, List as ListIcon } from "lucide-react";
import AuctionCard from "@/components/auction/AuctionCard";

const PRODUCTS = [
  {
    id: "001",
    title: "2024 Industrial CNC Machine - Haas VF-2",
    supplier: "Precision Machining Group",
    price: 42500,
    endsAt: "4h 12m",
    image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?auto=format&fit=crop&q=80&w=800",
    bidCount: 12,
    manufacturer: "Haas",
    model: "VF-2",
    description: "2024 Industrial CNC Machine - Haas VF-2 Vertical Machining Center. Includes 12,000-rpm spindle, side-mount tool changer, and Haas Next Generation Control. Pristine condition, original owner.",
  },
  {
    id: "002",
    title: "Commercial Grade Convection Oven - Vulcan VC4",
    supplier: "Global Restaurant Liquidators",
    price: 3200,
    endsAt: "1d 6h",
    image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&q=80&w=800",
    bidCount: 8,
    manufacturer: "Vulcan",
    model: "VC4-Single",
    description: "Vulcan VC4 Series Single Deck Natural Gas Convection Oven. Stainless steel front, sides, and top. Electronic spark ignition system.",
  },
  {
    id: "003",
    title: "Herman Miller Aeron Chair Set (6 Units)",
    supplier: "Apex Corporate Assets",
    price: 1800,
    endsAt: "2d 4h",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800",
    bidCount: 24,
    manufacturer: "Herman Miller",
    model: "Aeron Size B",
    description: "Set of 6 Herman Miller Aeron chairs. Graphite frame, tuxedo pellicle. Fully adjustable arms, posturefit SL hardware. Minimal wear.",
  },
  {
    id: "004",
    title: "Heavy Duty Forklift - CAT 2023 Model",
    supplier: "Precision Machining Group",
    price: 15500,
    endsAt: "6h 45m",
    image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=800",
    bidCount: 5,
    manufacturer: "Caterpillar (CAT)",
    model: "GP25N",
    description: "2023 CAT GP25N Pneumatic Tire Forklift. 5,000 lb capacity. Solid pneumatic tires. Side shifter. Full maintenance records included.",
  },
];

export default function CatalogPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      {/* Header Info */}
      <div className="bg-light/10 border-b border-light py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-primary">Global Catalog</h1>
          <p className="text-neutral/60 font-medium max-w-2xl">
            Live products from all verified tenants. Filter by supplier, category, or ending time.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[80px] z-10 bg-white border-b border-light py-4 px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest border-2 border-primary px-4 py-2 hover:bg-primary hover:text-white transition-colors text-primary">
              <Filter className="h-4 w-4" /> All Suppliers
            </button>
            <div className="hidden sm:flex items-center gap-2 border-b-2 border-primary py-2">
              <Search className="h-4 w-4 text-neutral/40" />
              <input type="text" placeholder="Search lots..." className="text-xs font-bold uppercase tracking-widest outline-none bg-transparent text-neutral placeholder:text-neutral/30" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex border-2 border-primary">
              <button className="p-2 bg-primary text-white"><Grid className="h-4 w-4" /></button>
              <button className="p-2 text-primary hover:bg-light/20"><ListIcon className="h-4 w-4" /></button>
            </div>
            <select className="text-xs font-black uppercase tracking-widest border-2 border-primary px-4 py-2 outline-none appearance-none cursor-pointer text-primary bg-transparent">
              <option>Sort: Ending Soonest</option>
              <option>Sort: Highest Bid</option>
              <option>Sort: Most Active</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((product) => (
              <AuctionCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}