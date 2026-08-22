import { PLACES } from "@/data/places";
import { supabase } from "@/integrations/supabase/client";

export type SubPlace = {
  id: string;
  parent_slug: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  media_urls: string[];
  published: boolean;
  sort_order: number;
};

export type ParentRef = {
  slug: string;
  name: string;
  kind: "builtin" | "extra";
  hero: string | null;
};

/** Detect whether a media URL points to a video file. */
export function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov|ogg|m4v)(\?|#|$)/i.test(url);
}

/** Resolve a parent location (built-in destination or admin-added place). */
export async function resolveParent(parentSlug: string): Promise<ParentRef> {
  const builtin = PLACES[parentSlug as keyof typeof PLACES];
  if (builtin) return { slug: builtin.slug, name: builtin.name, kind: "builtin", hero: builtin.hero };
  const { data } = await supabase
    .from("additional_places")
    .select("slug, name, image_url")
    .eq("slug", parentSlug)
    .eq("published", true)
    .maybeSingle();
  if (data) return { slug: data.slug, name: data.name, kind: "extra", hero: data.image_url };
  return { slug: parentSlug, name: parentSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), kind: "extra", hero: null };
}

/** Router link target for a parent location. */
export function parentLink(parent: ParentRef): { to: string; params: Record<string, string> } {
  return parent.kind === "builtin"
    ? { to: "/places/$slug", params: { slug: parent.slug } }
    : { to: "/places/extra/$slug", params: { slug: parent.slug } };
}
