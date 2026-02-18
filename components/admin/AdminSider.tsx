'use client'

import React from "react"
import { useLogout, useMenu, useNavigation } from "@refinedev/core"
import { 
  LayoutDashboard, 
  Gavel, 
  Layers, 
  Users as UsersIcon, 
  LogOut, 
  Package,
  Calendar,
  Settings,
  FileText,
  Truck
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const AdminSider = ({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) => {
  const { mutate: logout } = useLogout()
  const pathname = usePathname()

  const menuGroups = [
    {
      label: "Main",
      items: [
        { label: "Overview", route: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      label: "Inventory Management",
      items: [
        { label: "Auction Events", route: "/admin/events", icon: Calendar },
        { label: "Lots Inventory", route: "/admin/auctions", icon: Package },
      ]
    },
    {
      label: "Post-Auction & Logistics",
      items: [
        { label: "Sales & Invoices", route: "/admin/sales", icon: FileText },
        { label: "Warehouse Logistics", route: "/admin/logistics", icon: Truck },
      ]
    },
    {
      label: "Platform Data",
      items: [
        { label: "Live Bids", route: "/admin/bids", icon: Gavel },
        { label: "Users", route: "/admin/users", icon: UsersIcon },
        { label: "Categories", route: "/admin/categories", icon: Layers },
      ]
    }
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-zinc-200 flex flex-col h-screen font-sans antialiased transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
                  <Package className="text-white h-5 w-5" />
              </div>
              <div className="flex flex-col">
                  <span className="font-black uppercase tracking-tighter text-zinc-900 text-lg leading-none italic">Virginia</span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Liquidation</span>
              </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-900">
            <LogOut className="rotate-180" size={20} />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.route || (item.route !== '/admin' && pathname.startsWith(item.route))
                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all group",
                      isActive 
                        ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={cn(isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-900")} />
                      {item.label}
                    </div>
                    {isActive && <div className="h-1 w-1 rounded-full bg-primary" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile / Logout */}
      <div className="p-4 border-t border-zinc-50 space-y-2">
        <Link 
          href="/admin/settings"
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
            pathname === "/admin/settings" 
              ? "bg-zinc-900 text-white shadow-xl shadow-zinc-200" 
              : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
          )}
        >
            <Settings size={18} />
            System Settings
        </Link>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
    </>
  )
}
