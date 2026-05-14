import { createStart, createMiddleware } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Attach the user's Supabase bearer token to every server-fn call so
// requireSupabaseAuth can identify them.
const attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  if (typeof window === "undefined") return next();
  try {
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL as string,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
      { auth: { storage: localStorage, persistSession: true, autoRefreshToken: true } }
    );
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) return next({ headers: { Authorization: `Bearer ${token}` } });
  } catch {}
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
