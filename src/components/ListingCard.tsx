import { motion } from "framer-motion";
import { Star, MapPin, Shield } from "lucide-react";
import type { Listing } from "@/data/listings";

export function ListingCard({ listing, onClick, index = 0 }: { listing: Listing; onClick: () => void; index?: number }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group block w-full overflow-hidden rounded-2xl glass text-left transition hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative h-52 overflow-hidden">
        <motion.img
          src={listing.image}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full glass px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide">{listing.category}</span>
          {listing.verified && (
            <span className="flex items-center gap-1 rounded-full bg-primary/30 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-primary">
              <Shield className="h-2.5 w-2.5" /> Verified
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-background/80 backdrop-blur px-3 py-1.5 text-sm font-semibold">
          ${listing.pricePerDay}<span className="text-xs font-normal text-muted-foreground">/day</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{listing.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {listing.rating || "New"}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {listing.city} · {listing.host}
        </p>
      </div>
    </motion.button>
  );
}
