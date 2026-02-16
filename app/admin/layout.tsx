'use client'

import React, { useEffect, useState, useMemo } from "react"
import { Refine, AuthProvider } from "@refinedev/core"
import { dataProvider, liveProvider } from "@refinedev/supabase"
import routerProvider from "@refinedev/nextjs-router"
import { createClient } from "@/lib/supabase/client"
import { AdminSider } from "@/components/admin/AdminSider"
import { usePathname } from "next/navigation"
import { Package } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  
  const supabaseClient = useMemo(() => createClient(), [])
  
  const supabaseDataProvider = useMemo(() => dataProvider(supabaseClient), [supabaseClient])
  const supabaseLiveProvider = useMemo(() => liveProvider(supabaseClient), [supabaseClient])

  const supabaseAuthProvider: AuthProvider = useMemo(() => ({
    login: async ({ email, password }) => {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error };
      return { success: true, redirectTo: "/admin" };
    },
    logout: async () => {
      const { error } = await supabaseClient.auth.signOut();
      if (error) return { success: false, error };
      return { success: true, redirectTo: "/admin/login" };
    },
    check: async () => {
      try {
        const { data, error } = await supabaseClient.auth.getSession();
        if (error || !data.session) {
          return { authenticated: false, redirectTo: "/admin/login" };
        }

        // VERIFY ADMIN ROLE
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();

        if (profile?.role !== 'admin') {
          // If not admin, sign out and redirect
          await supabaseClient.auth.signOut();
          return { authenticated: false, redirectTo: "/admin/login", error: { message: "Access Denied: Admins Only", name: "Unauthorized" } };
        }

        return { authenticated: true };
      } catch (err) {
        return { authenticated: false, redirectTo: "/admin/login" };
      }
    },
    getPermissions: async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return null;
        
        const { data, error } = await supabaseClient
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (error) return null;
        return data?.role;
      } catch (err) {
        return null;
      }
    },
    getIdentity: async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data?.user) return { ...data.user, name: data.user.email };
      return null;
    },
    onError: async (error) => {
      // More descriptive logging
      if (error?.status === 401 || error?.status === 403) {
          console.warn("Unauthorized/Forbidden access detected:", error.message);
      } else {
          console.error("Auth Provider Error Details:", JSON.stringify(error, null, 2));
      }
      return { error };
    },
  }), [supabaseClient]);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-zinc-50 font-sans tracking-tight">{children}</div>
  }

  return (
    <Refine
      dataProvider={supabaseDataProvider}
      liveProvider={supabaseLiveProvider}
      authProvider={supabaseAuthProvider}
      routerProvider={routerProvider}
      resources={[
        {
          name: "dashboard",
          list: "/admin",
          meta: { label: "Overview" }
        },
        {
          name: "auctions",
          list: "/admin/auctions",
          show: "/admin/auctions/:id",
          meta: { label: "Lots Inventory" }
        },
        {
          name: "auction_events",
          list: "/admin/events",
          show: "/admin/events/:id",
          create: "/admin/events/create",
          meta: { label: "Auction Events" }
        },
        {
            name: "categories",
            list: "/admin/categories",
        },
        {
            name: "bids",
            list: "/admin/bids",
            meta: { label: "Transactions" }
        },
        {
            name: "profiles",
            list: "/admin/users",
            show: "/admin/users/:id",
            meta: { label: "Users" }
        },
        {
            name: "site_settings",
            list: "/admin/settings",
            meta: { label: "System Settings" }
        },
      ]}
      options={{ syncWithLocation: true }}
    >
      <div className="flex min-h-screen bg-zinc-50/50">
        <AdminSider isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="lg:hidden h-16 bg-white border-b border-zinc-200 flex items-center px-4 sticky top-0 z-30">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </button>
            <div className="ml-4 flex items-center gap-2">
              <Package className="text-zinc-900 h-5 w-5" />
              <span className="font-black uppercase tracking-tighter text-zinc-900 italic">Virginia Admin</span>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Refine>
  )
}
