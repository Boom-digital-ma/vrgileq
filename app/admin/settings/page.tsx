'use client'

import React from "react"
import { useForm } from "@refinedev/core"
import { Save, Loader2, Shield, Globe, Bell, CreditCard, Percent, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SettingsPage() {
    const [activeTab, setActiveTab] = React.useState(0)
    const result = useForm({
        resource: "site_settings",
        action: "edit",
        id: "global",
        redirect: false,
        onMutationSuccess: () => toast.success("Configuration updated successfully"),
        onMutationError: (err) => toast.error("Update failed: " + err.message)
    })

    const { onFinish, formLoading } = result
    const queryResult = (result as any).queryResult || (result as any).query
    const settings = (queryResult as any)?.data?.data || {}

    const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900 font-sans disabled:opacity-50"
    const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans"

    const sections = [
        {
            title: "Financials",
            icon: Percent,
            description: "Fees & Deposits",
            fields: [
                { label: "Buyer's Premium (%)", name: "buyers_premium", type: "number", step: "0.01", defaultValue: settings.buyers_premium },
                { label: "Sales Tax Rate (%)", name: "tax_rate", type: "number", step: "0.01", defaultValue: settings.tax_rate },
                { label: "Default Registration Deposit ($)", name: "default_deposit", type: "number", defaultValue: settings.default_deposit },
            ]
        },
        {
            title: "Bidding",
            icon: Zap,
            description: "Automation Rules",
            fields: [
                { label: "Auto-Extend Trigger (Mins)", name: "auto_extend_threshold_mins", type: "number", defaultValue: settings.auto_extend_threshold_mins },
                { label: "Auto-Extend Duration (Mins)", name: "auto_extend_duration_mins", type: "number", defaultValue: settings.auto_extend_duration_mins },
            ]
        },
        {
            title: "Security",
            icon: Shield,
            description: "Access Control",
            fields: [
                { 
                    label: "Maintenance Mode", 
                    name: "maintenance_mode", 
                    type: "checkbox", 
                    defaultValue: settings.maintenance_mode,
                    info: "Restrict public access to Admins only."
                },
                { label: "Maintenance Details", name: "maintenance_details", type: "text", placeholder: "e.g. Server upgrade, estimated 2 hours.", defaultValue: settings.maintenance_details },
                { 
                    label: "Proxy Bidding (Max Bid)", 
                    name: "proxy_bidding_enabled", 
                    type: "checkbox", 
                    defaultValue: settings.proxy_bidding_enabled,
                    info: "Enable automated bidding system."
                },
            ]
        },
        {
            title: "Communications",
            icon: Globe,
            description: "Public Profile",
            fields: [
                { label: "Public Support Email", name: "support_email", type: "email", defaultValue: settings.support_email },
                { label: "Contact Phone", name: "support_phone", type: "text", defaultValue: settings.support_phone },
                { label: "Global Header Announcement", name: "global_announcement", type: "text", placeholder: "e.g. System Maintenance tonight at 10 PM", defaultValue: settings.global_announcement },
                { label: "Announcement Details Link", name: "announcement_link", type: "text", placeholder: "e.g. /guides/maintenance or https://...", defaultValue: settings.announcement_link },
                { label: "Announcement Details (Popup Text)", name: "announcement_text", type: "text", placeholder: "If text is provided, 'Details' will open a popup instead of following the link.", defaultValue: settings.announcement_text },
            ]
        }
    ]

    return (
        <div className="space-y-8 text-zinc-900 font-sans pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic">System Settings</h1>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Platform Configuration & Policy Control</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Centralized Engine Active</span>
                </div>
            </div>

            {queryResult?.isError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 italic">
                    <Shield size={16} />
                    Note: Site Settings Table Pending Migration. Displaying Preview Mode.
                </div>
            )}

            <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const data: any = Object.fromEntries(formData.entries())
                data.maintenance_mode = formData.get('maintenance_mode') === 'on'
                data.proxy_bidding_enabled = formData.get('proxy_bidding_enabled') === 'on'
                onFinish(data)
            }} className="space-y-8">
                
                {/* HORIZONTAL TABS */}
                <div className="bg-white border border-zinc-200 p-2 rounded-[24px] shadow-sm flex items-center gap-2 overflow-x-auto">
                    {sections.map((section, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveTab(idx)}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                activeTab === idx 
                                    ? "bg-zinc-900 text-white shadow-xl" 
                                    : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                            )}
                        >
                            <section.icon size={16} className={cn(activeTab === idx ? "text-primary" : "text-zinc-300")} />
                            {section.title}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ACTIVE SECTION CONTENT */}
                    <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-[40px] p-10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-5 mb-10 pb-8 border-b border-zinc-50">
                            <div className="h-14 w-14 bg-zinc-900 rounded-[20px] flex items-center justify-center shrink-0 shadow-xl shadow-zinc-900/10">
                                {React.createElement(sections[activeTab].icon, { size: 24, className: "text-primary" })}
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-zinc-900 italic">{sections[activeTab].title}</h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">{sections[activeTab].description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {sections[activeTab].fields.map((field, fIdx) => (
                                <div key={fIdx} className={cn(field.type === 'text' && (field.name === 'maintenance_details' || field.name?.includes('announcement')) ? "md:col-span-2" : "")}>
                                    <label className={labelClasses}>{field.label}</label>
                                    {field.type === 'checkbox' ? (
                                        <div className="flex items-center gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-primary/20 transition-all">
                                            <input 
                                                name={field.name}
                                                type="checkbox"
                                                key={String(field.defaultValue)}
                                                defaultChecked={!!field.defaultValue}
                                                className="h-6 w-6 rounded-lg border-zinc-300 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                            />
                                            <span className="text-[11px] font-bold text-zinc-500 italic uppercase tracking-tight">{(field as any).info}</span>
                                        </div>
                                    ) : (
                                        <input 
                                            name={field.name}
                                            type={field.type}
                                            step={(field as any).step}
                                            placeholder={(field as any).placeholder}
                                            defaultValue={field.defaultValue}
                                            className={inputClasses}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS SIDEBAR */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-zinc-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-zinc-900/20">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Save className="text-primary" size={20} />
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-widest italic">Persist Engine</h2>
                                </div>
                                <p className="text-[10px] text-white/40 leading-relaxed mb-10 font-medium italic uppercase">
                                    Financial policy updates or bidding logic changes will trigger immediate global recalculations. Verify your legal disclosure before confirming.
                                </p>
                                
                                <button 
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full bg-white text-zinc-900 py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} className="fill-current" />}
                                    Commit Configuration
                                </button>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Shield size={120} />
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-[32px] p-6 text-center">
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] italic">Last System Synchronization</p>
                            <p className="text-xs font-bold text-zinc-900 mt-2 font-mono">{new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
