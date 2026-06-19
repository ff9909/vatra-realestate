"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, LayoutGrid, Clock, ImagePlus, X, Check, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/components/PropertyCard";

const CITIES = ["Tiranë", "Durrës", "Vlorë", "Korçë", "Pogradec", "Sarandë", "Shkodër"];
const TYPES = ["Apartament", "Vilë", "Shtëpi", "Penthouse", "Zyrë", "Truall"];

export default function AgentDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [agent, setAgent] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [tab, setTab] = useState("list");
  const [myProperties, setMyProperties] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/agjent/hyrje");
        return;
      }
      const userId = sessionData.session.user.id;
      const { data: agentRow } = await supabase.from("agents").select("*").eq("id", userId).single();
      setAgent(agentRow);
      setLoadingAuth(false);

      if (agentRow?.status === "approved") {
        loadMyProperties(userId);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMyProperties(agentId) {
    const { data } = await supabase
      .from("properties")
      .select("*, property_images(image_url, sort_order)")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });
    setMyProperties(data || []);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loadingAuth) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-stone-400">Duke ngarkuar...</div>;
  }

  if (!agent || agent.status !== "approved") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-5">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-stone-200">
          <Clock size={32} className="mx-auto mb-4 text-copper" />
          <h1 className="font-serif text-xl text-ink mb-2">Llogaria në pritje</h1>
          <p className="text-stone-500 text-sm mb-6">
            {agent?.status === "rejected"
              ? "Kërkesa jote për llogari agjenti nuk u miratua. Kontakto administratorin për më shumë informacion."
              : "Llogaria jote ende pret miratimin nga administratori. Do mund të postosh prona pasi të aktivizohet."}
          </p>
          <button onClick={handleLogout} className="text-sm text-stone-500 hover:underline">Dil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-ink text-white">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-serif text-lg">Vatra.al — Paneli i Agjentit</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70 hidden sm:inline">Mirëserdhe, {agent.full_name}</span>
            <button onClick={() => router.push("/")} className="text-sm px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 transition flex items-center gap-1.5">
              <Eye size={14} /> Shiko Faqen
            </button>
            <button onClick={handleLogout} className="text-sm px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-1.5">
              <LogOut size={14} /> Dil
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {toast && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-olive text-white flex items-center gap-2 text-sm">
            <Check size={16} /> {toast}
          </div>
        )}

        <div className="flex gap-2 mb-6 border-b border-stone-200">
          <button
            onClick={() => setTab("list")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === "list" ? "border-copper text-ink" : "border-transparent text-stone-500 hover:text-ink"}`}
          >
            <LayoutGrid size={15} /> Pronat e Mia ({myProperties.length})
          </button>
          <button
            onClick={() => setTab("new")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${tab === "new" ? "border-copper text-ink" : "border-transparent text-stone-500 hover:text-ink"}`}
          >
            <Plus size={15} /> Posto Pronë të Re
          </button>
        </div>

        {tab === "list" && (
          <PropertyList properties={myProperties} />
        )}

        {tab === "new" && (
          <NewPropertyForm
            supabase={supabase}
            agentId={agent.id}
            onSuccess={() => {
              setToast("Prona u postua me sukses!");
              loadMyProperties(agent.id);
              setTab("list");
              setTimeout(() => setToast(""), 3500);
            }}
          />
        )}
      </div>
    </div>
  );
}

function PropertyList({ properties }) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-20 text-stone-400 bg-white rounded-2xl border border-dashed border-stone-300">
        <ImagePlus size={32} className="mx-auto mb-3" />
        <p>Nuk ke postuar ende asnjë pronë.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {properties.map((p) => {
        const img = p.property_images?.[0]?.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80";
        return (
          <div key={p.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} className="w-28 h-28 object-cover shrink-0" alt={p.title} />
            <div className="p-3 flex-1">
              <span className="text-xs text-copper font-semibold">{p.listing_type} · {p.status}</span>
              <h4 className="font-medium text-ink text-sm leading-snug">{p.title}</h4>
              <p className="text-xs text-stone-500 mt-1">{p.city} · {p.area}m²</p>
              <p className="text-sm font-semibold text-ink mt-1">{formatPrice(p.price, p.listing_type)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NewPropertyForm({ supabase, agentId, onSuccess }) {
  const [form, setForm] = useState({
    title: "", type: "Apartament", listingType: "Shitje", city: "Tiranë",
    price: "", beds: "", baths: "", area: "", description: "", featured: false,
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 8);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.price || !form.area) {
      setError("Plotëso titullin, çmimin dhe sipërfaqen.");
      return;
    }
    setSubmitting(true);

    const { data: propRow, error: insertError } = await supabase
      .from("properties")
      .insert({
        agent_id: agentId,
        title: form.title,
        property_type: form.type,
        listing_type: form.listingType,
        city: form.city,
        price: Number(form.price),
        beds: Number(form.beds) || 0,
        baths: Number(form.baths) || 1,
        area: Number(form.area),
        description: form.description,
        featured: form.featured,
      })
      .select()
      .single();

    if (insertError || !propRow) {
      setError("Gabim gjatë postimit: " + (insertError?.message || "provo përsëri"));
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split(".").pop();
      const path = `${agentId}/${propRow.id}/${Date.now()}_${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("property-photos")
        .upload(path, file);

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("property-photos").getPublicUrl(path);
        await supabase.from("property_images").insert({
          property_id: propRow.id,
          image_url: urlData.publicUrl,
          sort_order: i,
        });
      }
    }

    setSubmitting(false);
    onSuccess();
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200 p-6 max-w-2xl space-y-4">
      <Field label="Titulli i pronës" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="p.sh. Apartament 2+1, Bllok" />

      <div className="grid grid-cols-2 gap-4">
        <Select label="Lloji i pronës" value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={TYPES} />
        <Select label="Shitje apo Qera" value={form.listingType} onChange={(v) => setForm({ ...form, listingType: v })} options={["Shitje", "Qera"]} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select label="Qyteti" value={form.city} onChange={(v) => setForm({ ...form, city: v })} options={CITIES} />
        <Field label="Çmimi (€)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} placeholder="150000" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Dhoma gjumi" type="number" value={form.beds} onChange={(v) => setForm({ ...form, beds: v })} placeholder="2" />
        <Field label="Banjo" type="number" value={form.baths} onChange={(v) => setForm({ ...form, baths: v })} placeholder="1" />
        <Field label="Sip. (m²)" type="number" value={form.area} onChange={(v) => setForm({ ...form, area: v })} placeholder="95" />
      </div>

      <div>
        <label className="text-xs font-medium text-stone-600 mb-1 block">Përshkrimi (opsional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          placeholder="Detaje shtesë rreth pronës..."
          className="w-full px-3 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-copper"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-stone-600 mb-1 block">Fotot e pronës (deri 8)</label>
        <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm" />
        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-copper" />
        Shfaqe si pronë e veçuar në faqen kryesore
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg bg-copper text-white font-medium hover:bg-copper/90 transition disabled:opacity-50">
        {submitting ? "Duke postuar..." : "Posto Pronën"}
      </button>
    </form>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-600 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-copper"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-600 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 outline-none">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
