import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VisitButton } from "@/components/VisitButton";
import { visitKey } from "@/lib/visitBasket";

export type SpotInfo = {
  name: string;
  parentSlug: string;
  parentName: string;
  image?: string | null;
  description?: string | null;
  extra?: string | null;
  pageSlug?: string | null; // sub_places slug for full page
};

export function SpotDialog({ spot, onClose }: { spot: SpotInfo | null; onClose: () => void }) {
  return (
    <Dialog open={!!spot} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {spot && (
          <>
            {spot.image && <img src={spot.image} alt={spot.name} className="aspect-[16/10] w-full object-cover" />}
            <div className="p-6 space-y-4">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl">{spot.name}</DialogTitle>
                <DialogDescription className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-accent" /> Near {spot.parentName}
                </DialogDescription>
              </DialogHeader>
              {spot.description && <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{spot.description}</p>}
              {spot.extra && <p className="text-sm leading-relaxed whitespace-pre-wrap">{spot.extra}</p>}
              <div className="flex flex-wrap gap-2 pt-2">
                <VisitButton
                  item={{
                    key: visitKey(spot.parentSlug, spot.name),
                    name: spot.name,
                    parentSlug: spot.parentSlug,
                    parentName: spot.parentName,
                    image: spot.image,
                    description: spot.extra || spot.description,
                  }}
                />
                {spot.pageSlug && (
                  <Link to="/places/spot/$sub" params={{ sub: spot.pageSlug }} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium">
                    Full page <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link to="/plan" search={{ regions: undefined }} className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-xs font-medium">
                  Open trip planner
                </Link>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
