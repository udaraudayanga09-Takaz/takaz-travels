import { Check, Plus } from "lucide-react";
import { toggleVisit, useVisitBasket, type VisitItem } from "@/lib/visitBasket";
import { toast } from "sonner";

export function VisitButton({ item, className = "" }: { item: VisitItem; className?: string }) {
  const items = useVisitBasket();
  const on = items.some((i) => i.key === item.key);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation();
        toggleVisit(item);
        toast.success(on ? `Removed ${item.name} from your trip` : `Added ${item.name} to your trip planner`);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition hover:scale-[1.02] ${on ? "bg-primary/20 text-primary" : "bg-primary text-primary-foreground"} ${className}`}
    >
      {on ? <><Check className="h-3.5 w-3.5" /> In your trip</> : <><Plus className="h-3.5 w-3.5" /> Add to trip</>}
    </button>
  );
}
