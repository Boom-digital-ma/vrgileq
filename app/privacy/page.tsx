import React from 'react';

const SECTIONS = [
  {
    title: "Information Collection",
    content: "We collect information you provide directly to us when you register for an account, place a bid, or communicate with us. This may include your name, email, phone number, and payment information."
  },
  {
    title: "Use of Information",
    content: "We use the information we collect to process your transactions, manage your account, improve our services, and communicate with you about upcoming auction events."
  },
  {
    title: "Sharing of Information",
    content: "We do not sell your personal information. We may share information with third-party service providers (such as payment processors) only as necessary to provide our services."
  },
  {
    title: "Data Security",
    content: "Virginia Liquidation takes reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access."
  },
  {
    title: "Your Choices",
    content: "You may update or correct your account information at any time by logging into your account or contacting us directly. You may also opt out of marketing communications."
  }
];

export default function PrivacyPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <header className="mb-20">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">PRIVACY</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-secondary mb-8">
            Privacy Policy
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-neutral/40">Effective Date: February 2026</p>
        </header>

        <div className="space-y-16">
          {SECTIONS.map((section, i) => (
            <div key={i} className="border-l-4 border-secondary pl-8 py-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-secondary mb-4">{section.title}</h2>
              <p className="text-neutral/70 font-medium leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 p-10 bg-secondary text-white shadow-[12px_12px_0px_0px_rgba(4,154,158,1)] text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-6 opacity-70">
            Privacy Concerns?
          </p>
          <a href="mailto:privacy@virginialiquidation.com" className="text-primary font-black uppercase tracking-widest text-xl hover:text-white transition-colors">
            privacy@virginialiquidation.com
          </a>
        </div>
      </section>
    </div>
  );
}
