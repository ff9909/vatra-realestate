"use client";
import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import PropertyCard from "@/components/PropertyCard";
import SecretLogo from "@/components/SecretLogo";

const CITIES = ["Tiranë", "Durrës", "Vlorë", "Korçë", "Pogradec", "Sarandë", "Shkodër"];

export default function HomePage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("Të gjitha");
  const [listingType, setListingType] = useState("Të gjitha");

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images(image_url, sort_order)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const sorted = data.map((p) => ({
          ...p,
          property_images: (p.property_images || []).sort(
            (a, b) => a.sort_order - b.sort_order
          ),
        }));
        setProperties(sorted);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase());
      const matchCity = city === "Të gjitha" || p.city === city;
      const matchListing = listingType === "Të gjitha" || p.listing_type === listingType;
      return matchSearch && matchCity && matchListing;
    });
  }, [properties, search, city, listingType]);

  const featured = properties.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <SecretLogo />
          <nav className="text-sm text-stone-500">Pasuri të Paluajtshme në Shqipëri</nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1600&q=80"
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cream via-ink/50 to-ink/20" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-16 text-center">
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-white/80 mb-3">
            Pasuri të Paluajtshme në Shqipëri
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-3">
            Gjej shtëpinë që
            <br />
            tregon historinë tënde
          </h1>
          <p className="text-white/85 max-w-md mx-auto mb-8">
            Apartamente, vila dhe toka të verifikuara — nga bregdeti deri te qendra e Tiranës.
          </p>

          <div className="bg-white rounded-2xl p-3 max-w-2xl mx-auto shadow-xl flex flex-col md:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 px-3">
              <Search size={18} className="text-stone-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kërko sipas qytetit ose emrit..."
                className="w-full py-2.5 outline-none text-ink placeholder:text-stone-400"
              />
            </div>
            <select
              value={listingType}
              onChange={(e) => setListingType(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-ink outline-none"
            >
              <option>Të gjitha</option>
              <option>Shitje</option>
              <option>Qera</option>
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-ink outline-none"
            >
              <option>Të gjitha</option>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-24 text-stone-400">Duke ngarkuar pronat...</div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="max-w-6xl mx-auto px-5 pt-14">
              <div className="flex items-baseline justify-between mb-5">
                <h2 className="font-serif text-2xl text-ink">Prona të Veçuara</h2>
                <span className="text-sm text-stone-500">{featured.length} prona</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          )}

          <section className="max-w-6xl mx-auto px-5 py-14">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="font-serif text-2xl text-ink">Të Gjitha Listimet</h2>
              <span className="text-sm text-stone-500">{filtered.length} rezultate</span>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <Search size={32} className="mx-auto mb-3" />
                <p>Asnjë pronë nuk u gjet. Provo një kërkim tjetër.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <footer className="border-t border-stone-200 py-8 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Vatra.al — Të gjitha të drejtat e rezervuara
      </footer>
    </div>
  );
}
