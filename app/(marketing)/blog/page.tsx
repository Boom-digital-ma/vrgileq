import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

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
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* Page Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 italic md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Auction Tips</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-none tracking-tighter text-secondary font-display uppercase md:text-5xl">
                Auction <br/> <span className="text-primary">Guides</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Simple tips to help you understand auctions, bidding, and pickup.
            </p>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 bg-primary/5 blur-[100px] rounded-full translate-x-1/2" />
      </section>

      {/* Blog Feed */}
      <section className="px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post, i) => (
                    <Link key={i} href={`/blog/${post.slug}`} className="group flex flex-col italic">
                        <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-[32px] border border-zinc-100 bg-zinc-100 shadow-sm transition-all group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-secondary/5">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute left-4 top-4">
                                <span className="rounded-xl border border-zinc-100 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-secondary backdrop-blur-md">
                                    {post.category}
                                </span>
                            </div>
                        </div>
                        <div className="mb-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            <div className="flex items-center gap-1.5"><Calendar size={12} /> {post.date}</div>
                            <div className="h-1 w-1 bg-zinc-300 rounded-full" />
                            <div className="flex items-center gap-1.5"><User size={12} /> Registry Team</div>
                        </div>
                        <h2 className="mb-3 text-2xl font-bold leading-tight text-secondary font-display uppercase transition-colors group-hover:text-primary">
                            {post.title}
                        </h2>
                        <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-zinc-500 uppercase">
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
    </div>
  );
}
