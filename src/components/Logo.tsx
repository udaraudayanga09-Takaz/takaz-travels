import logo from "@/assets/takaz-logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ size = 36, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        className="grid place-items-center rounded-xl bg-black shadow-[0_0_24px_-4px_oklch(0.78_0.2_160/0.55)] ring-1 ring-primary/30"
        style={{ width: size, height: size }}
      >
        <img src={logo} alt="Takaz" style={{ width: size - 8, height: size - 8 }} className="object-contain" />
      </span>
      {withWordmark && <span className="text-lg">Takaz</span>}
    </Link>
  );
}
