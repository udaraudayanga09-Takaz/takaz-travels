import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SRI_LANKA_CITIES } from "@/data/cities";
import { MapPin } from "lucide-react";

export function CitySelect({
  value,
  onChange,
  placeholder = "All cities",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`glass rounded-full border-border/60 text-xs h-10 px-4 ${className ?? ""}`}>
        <MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[320px]">
        <SelectItem value="all">{placeholder}</SelectItem>
        {SRI_LANKA_CITIES.map(c => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
