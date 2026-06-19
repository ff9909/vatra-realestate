"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, BedDouble, Bath, Maximize, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatPrice } from "@/components/PropertyCard";
import SecretLogo from "@/components/SecretLogo";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images(image_url, sort_order), agents(full_name, phone, email)")
        .eq("id", id)
        .single();

      if (!error && data) {
        data.property_images = (data.property_images || []).sort(
          (a, b) => a.sort_order - b.sort_order
        );
        setProperty(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-stone-400">Duke ngarkuar...</div>;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3">
        <p className="text-stone-500">Prona nuk u gjet.</p>
        <button onClick={() => router.push("/")} className="text-copper font-medium hover:underline">
          Kthehu te faqja kryesore
        </button>
      </div>
    );
  }

  const images = property.property_images.length > 0
    ? property.property_images
    : [{ image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80" }];

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <SecretLogo />
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-ink">
            <ArrowLeft size={15} /> Të gjitha listimet
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        <div className="rounded-2xl overflow-hidden mb-3 bg-stone-100 h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[activeImg].image_url} alt={property.title} className="w-full h-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 ${i === activeImg ? "border-copper" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <span className="text-xs uppercase tracking-wider text-copper font-semibold">
          {property.property_type} · {property.listing_type}
        </span>
        <h1 className="font-serif text-3xl mt-1 mb-2 text-ink">{property.title}</h1>
        <div className="flex items-center gap-1 text-stone-500 mb-6">
          <MapPin size={15} /> {property.city}, Shqipëri
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-y border-stone-200 mb-6">
          <div className="flex gap-6 text-stone-700">
            {property.beds > 0 && (
              <div className="flex items-center gap-2">
                <BedDouble size={18} className="text-copper" />
                <span>{property.beds} Dhoma</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Bath size={18} className="text-copper" />
              <span>{property.baths} Banjo</span>
            </div>
            <div className="flex items-center gap-2">
              <Maximize size={18} className="text-copper" />
              <span>{property.area} m²</span>
            </div>
          </div>
          <div className="text-2xl font-serif font-semibold text-ink">
            {formatPrice(property.price, property.listing_type)}
          </div>
        </div>

        {property.description && (
          <p className="text-stone-600 leading-relaxed mb-8 whitespace-pre-line">{property.description}</p>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="font-serif text-lg text-ink mb-1">Agjenti</h3>
          <p className="text-stone-700 font-medium">{property.agents?.full_name || "Vatra.al"}</p>
          {property.agents?.phone && (
            <a href={`tel:${property.agents.phone}`} className="block mt-3 w-full text-center py-3 rounded-xl bg-ink text-white font-medium hover:bg-ink/90 transition">
              Telefono {property.agents.phone}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
