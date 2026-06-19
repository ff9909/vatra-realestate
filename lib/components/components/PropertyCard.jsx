import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize } from "lucide-react";

export function formatPrice(n, listingType) {
  const s = Number(n).toLocaleString("de-DE");
  return listingType === "Qera" ? `€${s}/muaj` : `€${s}`;
}

export default function PropertyCard({ p }) {
  const img =
    p.property_images && p.property_images.length > 0
      ? p.property_images[0].image_url
      : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80";

  return (
    <Link
      href={`/prona/${p.id}`}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-56 overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={p.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-ink/85 text-cream backdrop-blur-sm">
            {p.listing_type === "Shitje" ? "Në Shitje" : "Me Qera"}
          </span>
          {p.featured && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-copper text-white">
              I Veçuar
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm font-semibold text-ink text-sm shadow-sm">
          {formatPrice(p.price, p.listing_type)}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-serif text-lg text-ink leading-snug">{p.title}</h3>
        <div className="flex items-center gap-1 text-stone-500 text-sm">
          <MapPin size={14} />
          <span>{p.city}</span>
        </div>
        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-4 text-stone-600 text-sm">
          {p.beds > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble size={15} /> {p.beds}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Bath size={15} /> {p.baths}
          </span>
          <span className="flex items-center gap-1">
            <Maximize size={15} /> {p.area} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
