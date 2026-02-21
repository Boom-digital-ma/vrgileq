"use client";

import { useState, useEffect } from "react";

export default function SystemTime({ serverTime }: { serverTime?: string }) {
  const [displayTime, setDisplayTime] = useState("");

  useEffect(() => {
    if (!serverTime) return;

    // Calcul de la différence entre l'heure serveur et l'heure navigateur
    const serverDate = new Date(serverTime).getTime();
    const browserDate = Date.now();
    const offset = serverDate - browserDate;

    const updateClock = () => {
      const nowWithOffset = new Date(Date.now() + offset);
      setDisplayTime(nowWithOffset.toLocaleTimeString());
    };

    // Mise à jour immédiate
    updateClock();

    // Lancement du cycle temps réel
    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, [serverTime]);

  if (!serverTime) return null;

  return (
    <span className="text-[8px] font-black text-primary bg-primary/5 backdrop-blur-sm px-2 py-1 rounded-md uppercase tracking-widest border border-primary/10 shadow-sm">
        Server Time: {displayTime || "..."}
    </span>
  );
}
