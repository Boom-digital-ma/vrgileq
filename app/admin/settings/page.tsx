'use client'

import React from "react"
import { useForm } from "@refinedev/core"
import { Save, Loader2, Shield, Globe, Bell, CreditCard, Percent, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SettingsPage() {
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
            title: "Financial Protocols",
            icon: Percent,
            description: "Manage fees, taxes and deposit requirements.",
            fields: [
                { label: "Buyer's Premium (%)", name: "buyers_premium", type: "number", step: "0.01", defaultValue: settings.buyers_premium },
                { label: "Sales Tax Rate (%)", name: "tax_rate", type: "number", step: "0.01", defaultValue: settings.tax_rate },
                { label: "Default Registration Deposit ($)", name: "default_deposit", type: "number", defaultValue: settings.default_deposit },
            ]
        },
        {
            title: "Bidding Engine",
            icon: Zap,
            description: "Configure anti-sniping and automated rules.",
            fields: [
                { label: "Auto-Extend Trigger (Mins)", name: "auto_extend_threshold_mins", type: "number", defaultValue: settings.auto_extend_threshold_mins },
                { label: "Auto-Extend Duration (Mins)", name: "auto_extend_duration_mins", type: "number", defaultValue: settings.auto_extend_duration_mins },
            ]
        },
        {
            title: "Site Security & Features",
            icon: Shield,
            description: "Control access and advanced bidding features.",
            fields: [
                { 
                    label: "Maintenance Mode", 
                    name: "maintenance_mode", 
                    type: "checkbox", 
                    defaultValue: settings.maintenance_mode,
                    info: "Restrict public access to Admins only."
                },
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
            description: "Contact details and public announcements.",
            fields: [
                { label: "Public Support Email", name: "support_email", type: "email", defaultValue: settings.support_email },
                { label: "Contact Phone", name: "support_phone", type: "text", defaultValue: settings.support_phone },
                { label: "Global Header Announcement", name: "global_announcement", type: "text", placeholder: "e.g. System Maintenance tonight at 10 PM", defaultValue: settings.global_announcement },
            ]
        }
    ]

    return (
        <div className="space-y-8 text-zinc-900 font-sans pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-widest text-[10px]">Platform Configuration & Policy Control</p>
            </div>

            {queryResult?.isError && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-medium flex items-center gap-3 italic">
                    <Shield size={16} />
                    Note: Database table 'site_settings' not found. Displaying interface in preview mode.
                </div>
            )}

            <form onSubmit={(e) => {
                e.preventDefault()
                if (queryResult?.isError) {
                    toast.error("Storage table missing. Please run migrations first.")
                    return
                }
                const formData = new FormData(e.currentTarget)
                
                const data: any = Object.fromEntries(formData.entries())
                data.maintenance_mode = formData.get('maintenance_mode') === 'on'
                data.proxy_bidding_enabled = formData.get('proxy_bidding_enabled') === 'on'
                
                onFinish(data)
            }} className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm space-y-6 flex flex-col">
                            <div className="flex items-center gap-4 pb-6 border-b border-zinc-50">
                                <div className="h-12 w-12 bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0">
                                    <section.icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">{section.title}</h2>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 italic">{section.description}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {section.fields.map((field, fIdx) => (
                                    <div key={fIdx}>
                                        <label className={labelClasses}>{field.label}</label>
                                        {field.type === 'checkbox' ? (
                                            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                                                <input 
                                                    name={field.name}
                                                    type="checkbox"
                                                    key={String(field.defaultValue)}
                                                    defaultChecked={!!field.defaultValue}
                                                    className="h-5 w-5 rounded border-zinc-300 text-primary focus:ring-primary"
                                                />
                                                <span className="text-[10px] font-bold text-zinc-500 italic">{(field as any).info}</span>
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
                    ))}

                    <div className="bg-zinc-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden lg:col-span-2">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="text-primary" size={24} />
                                <h2 className="text-sm font-black uppercase tracking-widest">Commit All Changes</h2>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-medium italic">
                                Modifying financial rules or bidding logic will affect all active auctions immediately. Ensure your legal terms reflect these settings.
                            </p>
                        </div>
                        <div className="mt-8 relative z-10">
                            <button 
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-white text-zinc-900 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {formLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Global Configuration
                            </button>
                        </div>
                        <div className="absolute -top-10 -right-10 h-64 w-64 bg-white/5 blur-3xl rounded-full"></div>
                    </div>
                </div>
            </form>
        </div>
    )
}
