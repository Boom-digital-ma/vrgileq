import Link from "next/link";
import { Filter, Search, Grid, List as ListIcon } from "lucide-react";
import AuctionCard from "@/components/auction/AuctionCard";
import PRODUCTS from "@/data/products.json";

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