"use client";

import { BookOpen, Gavel, Package, Shield, Truck, CreditCard, Wrench, HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminHelpPage() {
  const sections = [
    {
      title: "Navigation & Access",
      icon: Shield,
      content: [
        "Admin Toolbar: The black bar at the top of the public site gives you real-time stats and quick access to the dashboard.",
        "Quick Edit: Found on every item card in the catalog. Click 'Edit' to jump directly to that item's management page.",
        "Admin Mode: Your account cannot place bids. The system automatically blocks admin bidding to maintain marketplace integrity."
      ]
    },
    {
      title: "Inventory Management",
      icon: Package,
      content: [
        "Events: Use 'Draft' status to build your event privately. Only you can see it on the public site (Preview Mode).",
        "ManyFastScan: Bulk import lots using Excel. Ensure image filenames match your lot numbers (e.g., 101-1.jpg).",
        "Staggered Closing: Items close 2 minutes apart by default. This prevents website overload and keeps users engaged."
      ]
    },
    {
      title: "Logistics & Pickups",
      icon: Truck,
      content: [
        "Slot Generation: In the event details, use 'Generate Slots' to create pickup appointments for buyers.",
        "Mark Collected: When a buyer arrives, verify their Gate Pass and click 'Mark Collected' to record the asset removal.",
        "Logistics Dashboard: A focused view showing only today and tomorrow's scheduled pickups."
      ]
    },
    {
      title: "Bidding & Finance",
      icon: Gavel,
      content: [
        "Spy Mode: Admins can see the real names of bidders and their 'Max Bid' (Proxy) limits in the bidding history.",
        "Invoicing: At the end of an event, click 'Generate Invoices' to group all items won by a single buyer into one bill.",
        "Buyer's Premium: Configurable in Settings. This fee is automatically added to the final hammer price."
      ]
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 text-zinc-900">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-primary">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
                <BookOpen size={24} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Platform Knowledge Base</h1>
        </div>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] ml-14">Administrative Protocol & Operating Guide</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all group">
            <div className="flex items-center gap-4 mb-6">
                <div className="bg-zinc-900 text-white p-3 rounded-2xl group-hover:bg-primary transition-colors">
                    <section.icon size={20} />
                </div>
                <h3 className="font-bold text-lg uppercase italic tracking-tight">{section.title}</h3>
            </div>
            <ul className="space-y-4">
                {section.content.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-500 leading-relaxed italic">
                        <ChevronRight size={14} className="shrink-0 text-primary mt-1" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-secondary rounded-[40px] p-10 text-white relative overflow-hidden italic shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-400">
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational Excellence</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Need direct assistance?</h2>
                <p className="text-white/60 text-sm max-w-md uppercase font-medium leading-relaxed">
                    If you encounter a technical anomaly or require protocol clarification, contact the system architects immediately.
                </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center min-w-[200px]">
                <p className="text-[9px] font-black uppercase tracking-widest text-teal-400 mb-1">System Support</p>
                <p className="text-lg font-bold">nabil@boom-digital.ma</p>
            </div>
        </div>
        <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-primary/10 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
}
