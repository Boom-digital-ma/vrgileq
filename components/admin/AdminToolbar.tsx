"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Gavel, Package, Users, BarChart3, Shield, ArrowRight, ExternalLink, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function AdminToolbar() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalBids: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();
        
        if (data?.role === "admin") {
          setProfile(data);
          setIsVisible(true);
          fetchStats();
        }
      }
    }

    async function fetchStats() {
        const [auctionsCount, bidsCount] = await Promise.all([
            supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('status', 'live'),
            supabase.from('bids').select('id', { count: 'exact', head: true })
        ]);
        setStats({
            activeAuctions: auctionsCount.count || 0,
            totalBids: bidsCount.count || 0
        });
    }

    getProfile();
  }, [supabase]);

  if (!isVisible) return null;

  return (
    <div className="bg-secondary text-white py-2 px-4 sticky top-0 z-[100] shadow-xl border-b border-teal-500/30 backdrop-blur-md bg-secondary/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-500/30">
            <Shield className="h-3.5 w-3.5 text-teal-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400">Admin Mode</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <div className="flex items-center gap-2">
                <Gavel className="h-3 w-3" />
                <span>{stats.activeAuctions} Live Items</span>
            </div>
            <div className="h-3 w-px bg-zinc-700" />
            <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3" />
                <span>{stats.totalBids} Total Bids</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-all border border-white/5"
          >
            <Home size={14} />
            Back to Website
          </Link>
          <Link 
            href="/admin" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-lg transition-all border border-white/5"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </Link>
          <Link 
            href="/admin/events" 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-teal-500 text-secondary px-4 py-1.5 rounded-lg transition-all hover:bg-teal-400"
          >
            Manage Events
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
