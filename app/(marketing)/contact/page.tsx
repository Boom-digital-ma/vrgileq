"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type ContactField = "name" | "email" | "subject" | "message";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "");
    const message = String(formData.get("message") || "").trim();
    const nextErrors: Partial<Record<ContactField, string>> = {};

    if (!name) nextErrors.name = "Please enter your full name.";
    if (!email) {
      nextErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!subject) nextErrors.subject = "Please select a subject.";
    if (!message) nextErrors.message = "Please enter a message.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = Object.keys(nextErrors)[0] as ContactField;
      form.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Message transmitted successfully", {
        description: "Our technical support team will contact you within 24 business hours.",
    });
    setLoading(false);
    form.reset();
  };

  const clearError = (field: ContactField) => {
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  };

  const contactInfo = [
    { label: "Bidding Support", value: "support@virginialiquidation.com", icon: Mail },
    { label: "Direct Phone", value: "+1 (703) 869-1965", icon: Phone },
    { label: "Office Location", value: "6415 Virginia Manor Rd, Beltsville, MD 20705", icon: MapPin },
    { label: "Availability", value: "Tue - Sat, 11am - 5pm EST", icon: Clock },
  ];

  return (
    <div className="bg-zinc-50 font-sans antialiased text-secondary">
      {/* SaaS Premium Header */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 py-10 italic md:py-12">
        <div className="relative z-10 mx-auto max-w-7xl text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
                <div className="h-[1px] w-6 bg-primary" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Inquiry Gateway</span>
                <div className="h-[1px] w-6 bg-primary" />
            </div>
            <h1 className="mb-4 text-4xl font-black leading-none tracking-tighter text-secondary font-display uppercase md:text-5xl">
                Reach <br/> <span className="text-primary">Contact</span>.
            </h1>
            <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg font-medium leading-relaxed uppercase">
                Technical support and strategic consulting for Northern Virginia&apos;s premier industrial marketplace.
            </p>
        </div>
        <div className="absolute -top-24 -left-24 h-64 w-64 bg-primary/5 blur-[100px] rounded-full" />
      </section>

      {/* Main Grid: Form & Info */}
      <section className="px-6 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
                
                {/* Modern SaaS Form */}
                <div className="rounded-[40px] border border-zinc-100 bg-white p-6 shadow-sm italic md:p-10">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <MessageSquare size={20} />
                        </div>
                        <h2 className="text-2xl font-bold font-display uppercase text-secondary">Send a Message</h2>
                    </div>

                    <form noValidate onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                                <input name="name" type="text" placeholder="Your full name" onChange={() => clearError("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-3 text-sm font-bold text-secondary italic outline-none transition-all focus:border-primary/20 focus:bg-white aria-[invalid=true]:border-rose-300" />
                                {errors.name && <p id="name-error" className="ml-4 text-[10px] font-bold text-rose-600">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Email Address</label>
                                <input name="email" type="email" placeholder="you@example.com" onChange={() => clearError("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className="w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-3 text-sm font-bold text-secondary italic outline-none transition-all focus:border-primary/20 focus:bg-white aria-[invalid=true]:border-rose-300" />
                                {errors.email && <p id="email-error" className="ml-4 text-[10px] font-bold text-rose-600">{errors.email}</p>}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Subject</label>
                            <select name="subject" defaultValue="" onChange={() => clearError("subject")} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} className="w-full appearance-none rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-3 text-sm font-bold text-secondary italic outline-none transition-all focus:border-primary/20 focus:bg-white aria-[invalid=true]:border-rose-300">
                                <option value="" disabled>Select a subject</option>
                                <option>BIDDING HELP</option>
                                <option>SELLER SERVICES</option>
                                <option>PICKUP & REMOVAL</option>
                                <option>TECHNICAL SUPPORT</option>
                                <option>OTHER</option>
                            </select>
                            {errors.subject && <p id="subject-error" className="ml-4 text-[10px] font-bold text-rose-600">{errors.subject}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Message</label>
                            <textarea name="message" rows={4} placeholder="How can we help?" onChange={() => clearError("message")} aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className="w-full resize-none rounded-2xl border-2 border-zinc-100 bg-zinc-50 px-5 py-3 text-sm font-bold text-secondary italic outline-none transition-all focus:border-primary/20 focus:bg-white aria-[invalid=true]:border-rose-300"></textarea>
                            {errors.message && <p id="message-error" className="ml-4 text-[10px] font-bold text-rose-600">{errors.message}</p>}
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-secondary py-4 text-sm font-bold uppercase tracking-[0.2em] text-white italic shadow-2xl shadow-secondary/10 transition-all hover:bg-primary active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={18} />}
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-5 italic">
                    <div className="rounded-[32px] border border-zinc-100 bg-white p-7 shadow-sm">
                        <h3 className="mb-6 border-b border-zinc-50 pb-3 text-sm font-bold uppercase tracking-widest text-zinc-900">Contact Information</h3>
                        <div className="space-y-6">
                            {contactInfo.map((info, i) => (
                                <div key={i} className="group flex items-start gap-4">
                                    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-2.5 text-zinc-300 transition-all group-hover:bg-primary/5 group-hover:text-primary">
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

                    <div className="relative overflow-hidden rounded-[32px] bg-secondary p-7 text-white shadow-2xl shadow-secondary/20">
                        <div className="relative z-10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/20 text-primary">
                                <ShieldCheck size={24} />
                            </div>
                            <h4 className="mb-3 text-xl font-bold font-display uppercase">Business Services</h4>
                            <p className="text-sm text-white/40 leading-relaxed uppercase font-medium">
                                Talk with our team about selling equipment, inventory, or other business assets.
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

function Loader2(props: React.SVGProps<SVGSVGElement>) {
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
