"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export default function SecretLogo() {
  const [clicks, setClicks] = useState(0);
  const timerRef = useRef(null);
  const router = useRouter();

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClicks(0), 3000);

    if (next >= 5) {
      setClicks(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      router.push("/agjent/hyrje");
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Vatra.al"
      className="flex items-center gap-2 select-none"
    >
      <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
        <Home size={18} className="text-cream" />
      </div>
      <span className="font-serif text-xl text-ink tracking-tight">
        Vatra<span className="text-copper">.al</span>
      </span>
    </button>
  );
}
