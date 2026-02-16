'use client'

import React from "react"
import { useForm } from "@refinedev/core"
import { Save, Loader2, Shield, Globe, Bell, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
    // We use useForm to handle settings (assuming a single record in site_settings table)
    // For a static MVP, we'll simulate the UI structure
    const result = useForm({
        resource: "site_settings",
        action: "edit",
        id: "global",
        redirect: false
    })

    const { onFinish, formLoading } = result
    const queryResult = (result as any).queryResult || (result as any).query

    const settings = (queryResult as any)?.data?.data || {}

    const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium text-zinc-900 font-sans disabled:opacity-50"
    const labelClasses = "text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block font-sans"

    const sections = [
        {
            title: "Platform Economics",
            icon: CreditCard,
            fields: [
                { label: "Buyer's Premium (%)", name: "buyers_premium", type: "number", placeholder: "15", defaultValue: settings.buyers_premium || 15 },
                { label: "Default Deposit Amount ($)", name: "default_deposit", type: "number", placeholder: "500", defaultValue: settings.default_deposit || 500 },
            ]
        },
        {
            title: "Support & Contact",
            icon: Globe,
            fields: [
                { label: "Public Support Email", name: "support_email", type: "email", placeholder: "support@virginialiquidation.com", defaultValue: settings.support_email },
                { label: "Contact Phone", name: "support_phone", type: "text", placeholder: "(703) 555-0123", defaultValue: settings.support_phone },
            ]
        },
        {
            title: "System Availability",
            icon: Shield,
            fields: [
                { 
                    label: "Maintenance Mode", 
                    name: "maintenance_mode", 
                    type: "checkbox", 
                    defaultValue: settings.maintenance_mode,
                    info: "If enabled, only logged-in admins can access the public site."
                },
            ]
        }
    ]

    return (
        <div className="space-y-8 text-zinc-900 font-sans">
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
                if (queryResult?.isError) return alert("Storage table missing. Please run migrations first.")
                const formData = new FormData(e.currentTarget)
                
                const data: any = Object.fromEntries(formData.entries())
                // Proper boolean handling for checkboxes in Refine/Supabase
                data.maintenance_mode = formData.get('maintenance_mode') === 'on'
                
                onFinish(data)
            }} className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {sections.map((section, idx) => (
                        <div key={idx} className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-zinc-50">
                                <div className="p-2 bg-zinc-900 rounded-lg">
                                    <section.icon size={18} className="text-white" />
                                </div>
                                <h2 className="text-sm font-black uppercase tracking-widest">{section.title}</h2>
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
                                                placeholder={field.placeholder}
                                                defaultValue={field.defaultValue}
                                                className={inputClasses}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="bg-zinc-900 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="text-primary" size={24} />
                                <h2 className="text-sm font-black uppercase tracking-widest">Security Override</h2>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-medium italic">
                                Changing platform economics (Buyer's Premium) will affect all future invoices. 
                                Ensure you have legal clearance before modifying these parameters.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                <Bell size={12} />
                                Logs will track this change
                            </div>
                        </div>
                        <div className="mt-8 relative z-10">
                            <button 
                                type="submit"
                                disabled={formLoading}
                                className="w-full bg-white text-zinc-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                            >
                                {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Commit Configuration
                            </button>
                        </div>
                        <div className="absolute -top-10 -right-10 h-40 w-40 bg-white/5 blur-3xl rounded-full"></div>
                    </div>
                </div>
            </form>
        </div>
    )
}
