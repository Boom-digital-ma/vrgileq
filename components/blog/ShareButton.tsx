"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
}

export default function ShareButton({ title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => { void handleShare(); }}
      aria-label="Share this article"
      className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3 text-zinc-400 transition-all hover:border-primary hover:text-primary"
    >
      {copied ? <span className="text-[10px] font-bold uppercase">Copied</span> : <Share2 size={18} />}
    </button>
  );
}
