import { CreditCard, FileText, Gavel, MapPin, Scale, ShieldAlert } from "lucide-react";
import Link from "next/link";

const terms = [
  {
    number: "1",
    title: "Acceptance of Terms",
    content: "By placing a bid on VirginiaLiquidation.com, you agree to pay for all items won and comply with all auction, payment, and pickup instructions.",
    icon: Gavel,
  },
  {
    number: "2",
    title: "Binding Agreement",
    content: 'A successful bid constitutes a legally binding agreement between you and Cannella Pan LLC, doing business as VirginiaLiquidation.com ("VirginiaLiquidation.com"). You are responsible for all bids placed through your account, whether placed personally or by anyone accessing your account with your authorization.',
    icon: CreditCard,
  },
  {
    number: "3",
    title: "Payment and Buyer's Premium",
    content: "Winning bids are charged to the payment method on file after the auction closes. The buyer's premium shown on each lot is added to the winning bid, and items cannot be released until payment is complete.",
    icon: CreditCard,
  },
  {
    number: "4",
    title: "Item Condition",
    content: "All items are sold as-is and where-is. Review photos, descriptions, and condition details before placing a bid.",
    icon: ShieldAlert,
  },
  {
    number: "5",
    title: "Pickup",
    content: "Schedule pickup within the timeframe listed on your invoice. Bring your gate pass and the identification required for collection.",
    icon: MapPin,
  },
  {
    number: "6",
    title: "Returns and Refunds",
    content: "All sales are final unless Virginia Liquidation determines otherwise under its return and refund policy.",
    icon: FileText,
  },
];

export default function BidTermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-secondary">
      <section className="relative overflow-hidden border-b border-zinc-100 bg-white px-6 pb-16 pt-20 text-center italic">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="h-px w-6 bg-primary" />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary">Auction Rules</span>
            <div className="h-px w-6 bg-primary" />
          </div>
          <h1 className="mb-6 font-display text-5xl font-black uppercase leading-none tracking-tighter md:text-6xl">
            Bid <span className="text-primary">Terms</span>.
          </h1>
          <p className="mx-auto max-w-2xl text-base font-medium uppercase leading-relaxed text-zinc-400 md:text-lg">
            Important rules for bidding, payment, and pickup at Virginia Liquidation.
          </p>
        </div>
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl space-y-6">
          {terms.map((term) => (
            <article key={term.number} className="flex gap-5 rounded-[32px] border border-zinc-100 bg-white p-7 shadow-sm md:p-9">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary">
                <term.icon size={22} />
              </div>
              <div>
                <h2 className="mb-3 font-display text-xl font-bold uppercase tracking-tight">
                  <span className="mr-2 text-primary">{term.number}.</span>{term.title}
                </h2>
                <p className="text-sm font-medium leading-relaxed text-zinc-500">{term.content}</p>
              </div>
            </article>
          ))}

          <article className="rounded-[32px] border border-secondary/10 bg-secondary p-7 text-white shadow-xl md:p-9">
            <div className="mb-5 flex items-center gap-3 text-primary">
              <Scale size={22} />
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                <span className="mr-2">7.</span>Indemnification
              </h2>
            </div>
            <p className="text-sm font-medium leading-relaxed text-white/70">
              You agree to indemnify and hold harmless Cannella Pan LLC, doing business as VirginiaLiquidation.com, and its owners, officers, employees, agents, contractors, and affiliates from and against any claims, losses, liabilities, damages, costs, or expenses, including reasonable attorneys&apos; fees, arising out of or relating to:
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm font-medium leading-relaxed text-white/70">
              <li>Your breach of these Terms and Conditions;</li>
              <li>Your misuse of the VirginiaLiquidation.com website or auction services;</li>
              <li>Your violation of any applicable law or regulation; or</li>
              <li>Your violation of the rights of any third party.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-white px-6 py-16 text-center italic">
        <h2 className="mb-6 font-display text-2xl font-bold uppercase">Ready to bid?</h2>
        <Link href="/auctions" className="inline-flex items-center gap-3 rounded-2xl bg-primary px-10 py-5 text-[11px] font-bold uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-secondary">
          Browse Auctions <Gavel size={16} />
        </Link>
      </section>
    </div>
  );
}
