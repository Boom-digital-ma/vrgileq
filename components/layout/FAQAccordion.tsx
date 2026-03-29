"use client";

import { useState } from "react";
import { ChevronDown, LucideIcon, Zap, Package, ShieldCheck, Eye, MapPin, Truck, History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Zap,
  Package,
  ShieldCheck,
  Eye,
  MapPin,
  Truck,
  History,
  TrendingUp
};

interface FAQItem {
  q: string;
  a: string;
  iconName: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, i) => {
        const Icon = ICON_MAP[item.iconName] || Package;
        return (
          <div 
            key={i} 
            className={cn(
              "group bg-zinc-50/50 border border-zinc-100 rounded-[32px] italic transition-all duration-500 overflow-hidden",
              openIndex === i ? "bg-white shadow-xl shadow-secondary/5 border-primary/20" : "hover:bg-white hover:border-zinc-200"
            )}
          >
            <button 
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-6 p-8 text-left transition-colors"
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center border transition-all shrink-0",
                openIndex === i ? "bg-primary/10 border-primary/20 text-primary" : "bg-white border-zinc-100 text-zinc-300 group-hover:text-primary"
              )}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  "text-base font-black text-secondary uppercase tracking-tight transition-colors",
                  openIndex === i ? "text-primary" : "group-hover:text-primary"
                )}>
                  {item.q}
                </h4>
              </div>
              <ChevronDown 
                  size={20} 
                  className={cn(
                      "text-zinc-300 transition-transform duration-500",
                      openIndex === i ? "rotate-180 text-primary" : "group-hover:text-primary"
                  )} 
              />
            </button>
            
            <div 
              className={cn(
                  "transition-all duration-500 ease-in-out",
                  openIndex === i ? "max-h-[500px] opacity-100 pb-8 px-8 ml-16" : "max-h-0 opacity-0 pointer-events-none"
              )}
            >
              <div className="text-[13px] text-zinc-500 font-medium uppercase leading-relaxed whitespace-pre-line pr-8">
                {item.a}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
