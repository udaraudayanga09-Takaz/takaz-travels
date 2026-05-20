import { useCallback, useMemo, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow } from "@react-google-maps/api";
import { Car, Home as HomeIcon, MapPin } from "lucide-react";
import type { Listing } from "@/data/listings";

const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
const CONTAINER = { width: "100%", height: "100%" } as const;

// Premium dark map style — hides generic POIs to keep focus on our listings.
const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f1b1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1b1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7a8c8a" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1c2b29" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#56706c" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a3a3f" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a7d80" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#234240" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#13241f" }] },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  styles: MAP_STYLE,
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: "greedy",
  backgroundColor: "#0f1b1a",
};

export function GoogleMapView({
  listings,
  onSelect,
  selectedId,
}: {
  listings: Listing[];
  onSelect: (l: Listing) => void;
  selectedId?: string;
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "luxelanka-gmap",
    googleMapsApiKey: apiKey || "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const onLoad = useCallback((m: google.maps.Map) => {
    mapRef.current = m;
  }, []);

  const handlePick = (l: Listing) => {
    mapRef.current?.panTo({ lat: l.geoLat, lng: l.geoLng });
    onSelect(l);
  };

  const hovered = useMemo(() => listings.find(l => l.id === hoverId) ?? null, [listings, hoverId]);

  if (!apiKey) {
    return (
      <div className="relative h-[560px] w-full overflow-hidden rounded-3xl glass grid place-items-center text-center p-8">
        <div className="max-w-sm">
          <MapPin className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 text-lg font-semibold">Google Maps key required</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add <code className="rounded bg-secondary/60 px-1.5 py-0.5 text-xs">VITE_GOOGLE_MAPS_API_KEY</code> to your environment
            to enable the live partner map.
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="grid h-[560px] w-full place-items-center rounded-3xl glass text-sm text-destructive">
        Failed to load Google Maps. Check your API key & enabled services.
      </div>
    );
  }

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-3xl glass">
      <style>{`
        @keyframes luxe-bounce-in {
          0% { transform: translate(-50%, -100%) scale(0.4); opacity: 0; }
          60% { transform: translate(-50%, -100%) scale(1.12); opacity: 1; }
          100% { transform: translate(-50%, -100%) scale(1); opacity: 1; }
        }
        .luxe-pin { animation: luxe-bounce-in 0.55s cubic-bezier(.34,1.56,.64,1) backwards; }
      `}</style>

      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={CONTAINER}
          center={SRI_LANKA_CENTER}
          zoom={8}
          options={MAP_OPTIONS}
          onLoad={onLoad}
        >
          {listings.map((l, i) => (
            <OverlayView
              key={l.id}
              position={{ lat: l.geoLat, lng: l.geoLng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <button
                onMouseEnter={() => setHoverId(l.id)}
                onMouseLeave={() => setHoverId(prev => (prev === l.id ? null : prev))}
                onClick={() => handlePick(l)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={`luxe-pin group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg transition will-change-transform hover:scale-110 ${
                  selectedId === l.id
                    ? "bg-accent text-accent-foreground scale-110 ring-2 ring-accent/40"
                    : "bg-background text-foreground hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {l.type === "vehicle" ? <Car className="h-3 w-3" /> : <HomeIcon className="h-3 w-3" />}
                ${l.pricePerDay}
                <span className="text-[10px] opacity-70">/night</span>
              </button>
            </OverlayView>
          ))}

          {hovered && (
            <InfoWindow
              position={{ lat: hovered.geoLat, lng: hovered.geoLng }}
              options={{ pixelOffset: new google.maps.Size(0, -34), disableAutoPan: true }}
              onCloseClick={() => setHoverId(null)}
            >
              <div style={{ width: 220 }} className="font-sans">
                <img src={hovered.image} alt={hovered.title} style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8 }} />
                <div style={{ marginTop: 8, fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{hovered.title}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{hovered.city} · ${hovered.pricePerDay}/night</div>
                <button
                  onClick={() => handlePick(hovered)}
                  style={{ marginTop: 8, width: "100%", padding: "8px 12px", borderRadius: 999, background: "#0f766e", color: "white", fontSize: 12, fontWeight: 600, border: 0, cursor: "pointer" }}
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">Loading map…</div>
      )}

      <div className="pointer-events-none absolute bottom-4 left-4 rounded-full glass px-3 py-1.5 text-xs text-muted-foreground">
        {listings.length} live partners · Sri Lanka
      </div>
    </div>
  );
}
