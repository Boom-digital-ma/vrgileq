import React from 'react';

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using VirginiaLiquidation.com, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use this website."
  },
  {
    title: "2. Registration & Eligibility",
    content: "You must be at least 18 years of age to register and participate in auctions. You agree to provide accurate, current, and complete information during the registration process."
  },
  {
    title: "3. Bidding & Auctions",
    content: "Every bid placed is a binding contract. Once a bid is placed, it cannot be retracted. Virginia Liquidation utilizes a dynamic closing system where last-minute bids extend the auction time."
  },
  {
    title: "4. Buyer's Premium & Payments",
    content: "A buyer's premium (typically 15-20%) is added to the hammer price of all items. Payments are automatically processed using the credit card on file immediately following the close of the event."
  },
  {
    title: "5. Removal & Abandonment",
    content: "Buyers are responsible for the removal of all purchased items during the specified removal times. Items not removed within the designated period will be considered abandoned and may be subject to disposal fees."
  },
  {
    title: "6. Warranty & Condition",
    content: "All items are sold 'AS IS, WHERE IS' with no warranties, expressed or implied. Virginia Liquidation makes every effort to provide accurate descriptions, but physical inspection is strongly recommended."
  }
];

export default function TermsPage() {
  return (
    <div className="bg-white font-sans tracking-tight text-neutral">
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <header className="mb-20">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">LEGAL</div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-secondary mb-8">
            Terms of Sale <br />& Use
          </h1>
          <p className="text-sm font-black uppercase tracking-widest text-neutral/40">Last Updated: February 2026</p>
        </header>

        <div className="space-y-16">
          {SECTIONS.map((section, i) => (
            <div key={i} className="border-l-4 border-primary pl-8 py-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-secondary mb-4">{section.title}</h2>
              <p className="text-neutral/70 font-medium leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-24 p-10 bg-light/10 border-2 border-primary border-dashed text-center">
          <p className="text-sm font-bold uppercase tracking-tight text-neutral/60 mb-6">
            Questions about our terms?
          </p>
          <a href="mailto:legal@virginialiquidation.com" className="text-primary font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-8">
            legal@virginialiquidation.com
          </a>
        </div>
      </section>
    </div>
  );
}
