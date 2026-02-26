import { Newspaper, ArrowRight, Calendar, User, Tag, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function BlogPage() {
  const posts = [
    {
      title: "Liquidation Auctions in Maryland: The Complete Guide",
      slug: "liquidation-auctions-maryland",
      date: "Feb 25, 2026",
      category: "Guides",
      excerpt: "Everything you need to know about buying Home Depot returns and overstock inventory in the DMV region.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Industry Insights</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                The <br/> <span className="text-primary">Journal</span>.
            </h1>
            <p className="max-w-2xl text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Expert analysis on liquidation markets, resale strategies, and DMV auction news.
            </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/5 blur-[120px] rounded-full translate-x-1/2" />
      </section>

      {/* Blog Feed */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {posts.map((post, i) => (
                    <Link key={i} href={`/blog/${post.slug}`} className="group flex flex-col italic">
                        <div className="aspect-[16/10] bg-zinc-100 rounded-[40px] overflow-hidden border border-zinc-100 mb-8 relative shadow-sm transition-all group-hover:shadow-xl group-hover:shadow-secondary/5 group-hover:-translate-y-2">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-6 left-6">
                                <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary border border-zinc-100">
                                    {post.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</div>
                            <div className="h-1 w-1 bg-zinc-300 rounded-full" />
                            <div className="flex items-center gap-1.5"><User size={12} /> Registry Team</div>
                        </div>
                        <h2 className="text-2xl font-bold text-secondary font-display uppercase leading-tight mb-4 group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>
                        <p className="text-zinc-500 text-sm leading-relaxed uppercase mb-8 line-clamp-3">
                            {post.excerpt}
                        </p>
                        <div className="mt-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1 w-fit group-hover:text-secondary group-hover:border-secondary transition-all">
                            Read Article <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-24 px-6 bg-secondary text-white relative overflow-hidden italic">
        <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-4xl font-bold font-display uppercase italic mb-6">Stay ahead of the market.</h2>
            <p className="text-white/50 text-lg uppercase font-medium mb-12">
                Join 5,000+ local Maryland buyers receiving weekly auction alerts and inventory insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                    type="email" 
                    placeholder="EMAIL@DOMAIN.COM" 
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-widest outline-none focus:bg-white/10 focus:border-primary transition-all"
                />
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-secondary transition-all shadow-xl shadow-primary/20">
                    Subscribe
                </button>
            </div>
        </div>
        <div className="absolute top-[-100px] left-[-100px] h-64 w-64 bg-primary/10 blur-[100px] rounded-full" />
      </section>
    </div>
  );
}
