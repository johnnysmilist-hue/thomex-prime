"use client";

import { useState, useEffect } from "react";

export default function FlashSaleTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const target = new Date(endTime).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setEnded(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (ended) {
    return <span className="text-xs font-semibold">Sale ended</span>;
  }

  return (
    <div className="flex gap-1 text-xs font-bold">
      <span className="bg-black/30 rounded px-2 py-1">{timeLeft.hours}</span>
      <span className="self-center">:</span>
      <span className="bg-black/30 rounded px-2 py-1">{timeLeft.minutes}</span>
      <span className="self-center">:</span>
      <span className="bg-black/30 rounded px-2 py-1">{timeLeft.seconds}</span>
    </div>
  );
}
