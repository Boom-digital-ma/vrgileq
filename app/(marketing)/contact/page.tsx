"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Message transmitted successfully", {
        description: "Our technical support team will contact you within 24 business hours.",
    });
    setLoading(false);
    (e.target as HTMLFormElement).reset();
  };

  const contactInfo = [
    { label: "Bidding Support", value: "support@virginialiquidation.com", icon: Mail },
    { label: "Direct Phone", value: "(703) 768-9000", icon: Phone },
    { label: "Office Location", value: "Alexandria, VA 22301", icon: MapPin },
    { label: "Availability", value: "Mon - Fri, 9am - 5pm EST", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="bg-white border-b border-zinc-100 pt-24 pb-20 relative overflow-hidden italic">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-[1px] w-10 bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Inquiry Gateway</span>
                <div className="h-[1px] w-10 bg-primary" />
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-secondary leading-[0.85] font-display uppercase mb-8">
                Reach <br/> <span className="text-primary">Contact</span>.
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl font-medium leading-relaxed uppercase">
                Technical support and strategic consulting for Northern Virginia's premier industrial marketplace.
            </p>
        </div>
        <div className="absolute -top-24 -left-24 h-96 w-96 bg-primary/5 blur-[120px] rounded-full" />
      </section>

      {/* Main Grid: Form & Info */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-start">
                
                {/* Modern SaaS Form */}
                <div className="bg-white p-8 md:p-16 rounded-[48px] border border-zinc-100 shadow-sm italic">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-2xl font-bold font-display uppercase text-secondary">Transmit Message</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Identity Name</label>
                                <input required type="text" placeholder="FULL NAME" className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Digital Mail</label>
                                <input required type="email" placeholder="EMAIL@DOMAIN.COM" className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Inquiry Subject</label>
                            <select className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none appearance-none">
                                <option>BIDDING ASSISTANCE</option>
                                <option>SELLER SERVICES</option>
                                <option>LOGISTICS & REMOVAL</option>
                                <option>TECHNICAL SUPPORT</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Detailed Inquiry</label>
                            <textarea required rows={5} placeholder="DESCRIBE YOUR REQUEST IN DETAIL..." className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-2xl py-4 px-6 text-sm font-bold text-secondary focus:outline-none focus:border-primary/20 focus:bg-white transition-all italic outline-none resize-none"></textarea>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="w-full bg-secondary text-white py-6 rounded-3xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-[0.98] shadow-2xl shadow-secondary/10 flex items-center justify-center gap-3 disabled:opacity-50 italic"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                            Contact Us
                        </button>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8 italic">
                    <div className="bg-white border border-zinc-100 rounded-[40px] p-10 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 mb-10 border-b border-zinc-50 pb-4">Contact Matrix</h3>
                        <div className="space-y-10">
                            {contactInfo.map((info, i) => (
                                <div key={i} className="flex items-start gap-5 group">
                                    <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 text-zinc-300 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                        <info.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{info.label}</p>
                                        <p className="text-[13px] font-bold text-secondary uppercase tracking-tight group-hover:text-primary transition-colors">{info.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-secondary rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-secondary/20">
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20">
                                <ShieldCheck size={24} />
                            </div>
                            <h4 className="text-xl font-bold font-display uppercase mb-4">Enterprise Grade</h4>
                            <p className="text-sm text-white/40 leading-relaxed uppercase font-medium">
                                Direct consultation for high-value industrial asset liquidation and corporate recovery strategies.
                            </p>
                        </div>
                        <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-primary/10 blur-2xl rounded-full" />
                    </div>
                </div>

            </div>
        </div>
      </section>
    </div>
  );
}

function Loader2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
