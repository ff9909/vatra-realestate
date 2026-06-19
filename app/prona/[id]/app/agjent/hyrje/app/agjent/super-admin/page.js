"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Check, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export default function SuperAdminPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user || user.email !== SUPER_ADMIN_EMAIL) {
        router.push("/agjent/hyrje");
        return;
      }
      setAuthorized(true);
      loadAgents();
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAgents() {
    const { data } = await supabase.from("agents").select("*").order("created_at", { ascending: false });
    setAgents(data || []);
  }

  async function updateStatus(id, status) {
    await supabase.from("agents").update({ status }).eq("id", id);
    loadAgents();
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading || !authorized) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-stone-400">Duke verifikuar...</div>;
  }

  const pending = agents.filter((a) => a.status === "pending");
  const approved = agents.filter((a) => a.status === "approved");
  const rejected = agents.filter((a) => a.status === "rejected");

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-ink text-white">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-serif text-lg flex items-center gap-2">
            <ShieldCheck size={20} /> Super Admin — Vatra.al
          </span>
          <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5">
            <LogOut size={14} /> Dil
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8 space-y-10">
        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Në Pritje të Miratimit ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-stone-400 text-sm">Asnjë kërkesë në pritje.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-medium text-ink">{a.full_name}</p>
                    <p className="text-sm text-stone-500">{a.email} {a.phone && `· ${a.phone}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(a.id, "approved")} className="px-3 py-2 rounded-lg bg-olive text-white text-sm font-medium flex items-center gap-1.5 hover:bg-olive/90">
                      <Check size={15} /> Mirato
                    </button>
                    <button onClick={() => updateStatus(a.id, "rejected")} className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium flex items-center gap-1.5 hover:bg-red-700">
                      <X size={15} /> Refuzo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink mb-4">Agjentë Aktivë ({approved.length})</h2>
          {approved.length === 0 ? (
            <p className="text-stone-400 text-sm">Asnjë agjent aktiv ende.</p>
          ) : (
            <div className="space-y-2">
              {approved.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink">{a.full_name}</p>
                    <p className="text-sm text-stone-500">{a.email}</p>
                  </div>
                  <button onClick={() => updateStatus(a.id, "rejected")} className="text-sm text-red-600 hover:underline">
                    Hiq aksesin
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {rejected.length > 0 && (
          <section>
            <h2 className="font-serif text-xl text-ink mb-4">Të Refuzuar ({rejected.length})</h2>
            <div className="space-y-2">
              {rejected.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between opacity-60">
                  <div>
                    <p className="font-medium text-ink">{a.full_name}</p>
                    <p className="text-sm text-stone-500">{a.email}</p>
                  </div>
                  <button onClick={() => updateStatus(a.id, "approved")} className="text-sm text-olive hover:underline">
                    Rivendos
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
