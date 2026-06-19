"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function AgentAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/agjent/paneli");
    });
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError("Email ose fjalëkalim i gabuar.");
      return;
    }
    router.push("/agjent/paneli");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!fullName || !email || !password) {
      setError("Plotëso të gjitha fushat e detyrueshme.");
      return;
    }
    if (password.length < 6) {
      setError("Fjalëkalimi duhet të ketë të paktën 6 shkronja/numra.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });
    setBusy(false);
    if (signUpError) {
      setError(signUpError.message.includes("already registered")
        ? "Ky email është regjistruar tashmë."
        : "Gabim: " + signUpError.message);
      return;
    }
    setInfo("U regjistrove me sukses! Llogaria jote pret miratimin e administratorit. Do njoftohesh kur të aktivizohet.");
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-5">
      <div className="bg-cream rounded-2xl p-8 max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-copper flex items-center justify-center mb-4">
          {mode === "login" ? <Lock size={20} className="text-white" /> : <UserPlus size={20} className="text-white" />}
        </div>

        {mode === "login" ? (
          <>
            <h1 className="font-serif text-2xl text-ink mb-1">Hyrje për Agjentë</h1>
            <p className="text-stone-500 text-sm mb-6">Logohu për të menaxhuar pronat e tua.</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="agjenti@email.com" />
              <Field label="Fjalëkalimi" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && <p className="text-sm text-olive">{info}</p>}
              <button disabled={busy} type="submit" className="w-full py-3 rounded-lg bg-ink text-white font-medium hover:bg-ink/90 transition disabled:opacity-50">
                {busy ? "Duke u futur..." : "Hyr"}
              </button>
            </form>
            <button onClick={() => { setMode("signup"); setError(""); setInfo(""); }} className="text-sm text-copper hover:underline mt-4 block w-full text-center">
              Je agjent i ri? Regjistrohu këtu
            </button>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-ink mb-1">Regjistrim Agjenti</h1>
            <p className="text-stone-500 text-sm mb-6">Llogaria jote do aktivizohet pas miratimit nga administratori.</p>
            <form onSubmit={handleSignup} className="space-y-3">
              <Field label="Emri i plotë" value={fullName} onChange={setFullName} placeholder="p.sh. Erjon Hoxha" />
              <Field label="Telefoni" value={phone} onChange={setPhone} placeholder="+355 6X XXX XXXX" />
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="agjenti@email.com" />
              <Field label="Fjalëkalimi" type="password" value={password} onChange={setPassword} placeholder="Të paktën 6 shkronja" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button disabled={busy} type="submit" className="w-full py-3 rounded-lg bg-copper text-white font-medium hover:bg-copper/90 transition disabled:opacity-50">
                {busy ? "Duke u regjistruar..." : "Regjistrohu"}
              </button>
            </form>
            <button onClick={() => { setMode("login"); setError(""); setInfo(""); }} className="text-sm text-stone-500 hover:underline mt-4 block w-full text-center">
              Ke llogari? Hyr këtu
            </button>
          </>
        )}
      </div>
    </div>
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
        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 outline-none focus:border-copper bg-white"
      />
    </div>
  );
}
