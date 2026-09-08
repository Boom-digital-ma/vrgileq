import Link from "next/link";
import { cn } from "@/lib/utils";

const legalPages = [
  { id: "terms", label: "Terms", href: "/terms" },
  { id: "bid-terms", label: "Bid Terms", href: "/bid-terms" },
  { id: "privacy", label: "Privacy", href: "/privacy" },
] as const;

type LegalPageId = typeof legalPages[number]["id"];

export default function LegalNavigation({ current }: { current: LegalPageId }) {
  return (
    <nav aria-label="Legal documents" className="flex flex-wrap items-center justify-center gap-2">
      {legalPages.map((page) => (
        <Link
          key={page.id}
          href={page.href}
          aria-current={page.id === current ? "page" : undefined}
          className={cn(
            "rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
            page.id === current
              ? "border-secondary bg-secondary text-white"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-primary/30 hover:text-primary"
          )}
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
