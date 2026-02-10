import React from 'react';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-20">
          
          {/* INFO */}
          <div>
            <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">GET IN TOUCH</div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-secondary mb-12">Contact Us</h1>
            
            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center border-2 border-primary">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-neutral/40 mb-1">Call Us</h4>
                  <p className="text-xl font-black text-secondary">(703) 768-9000</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center border-2 border-primary">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-neutral/40 mb-1">Email</h4>
                  <p className="text-xl font-black text-secondary">info@virginialiquidation.com</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="h-12 w-12 bg-primary/10 flex items-center justify-center border-2 border-primary">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-black uppercase text-xs tracking-widest text-neutral/40 mb-1">Headquarters</h4>
                  <p className="text-xl font-black text-secondary leading-tight uppercase">
                    Northern Virginia <br /> 
                    Alexandria, VA 22301
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="bg-light/10 border-2 border-primary p-10 md:p-16 shadow-[20px_20px_0px_0px_rgba(4,154,158,1)]">
            <h3 className="text-2xl font-black uppercase mb-8 text-secondary flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-primary" /> Send a Message
            </h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Full Name</label>
                <input type="text" className="w-full border-2 border-light p-4 font-bold focus:border-primary outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Email Address</label>
                <input type="email" className="w-full border-2 border-light p-4 font-bold focus:border-primary outline-none transition-colors" />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Subject</label>
                <select className="w-full border-2 border-light p-4 font-bold focus:border-primary outline-none transition-colors appearance-none bg-white">
                  <option>General Inquiry</option>
                  <option>Buying Question</option>
                  <option>Selling a Project</option>
                  <option>Appraisal Services</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral/40">Message</label>
                <textarea rows={6} className="w-full border-2 border-light p-4 font-bold focus:border-primary outline-none transition-colors"></textarea>
              </div>
              <button className="md:col-span-2 bg-primary text-white py-6 font-black uppercase tracking-[0.2em] hover:bg-secondary transition-all">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
