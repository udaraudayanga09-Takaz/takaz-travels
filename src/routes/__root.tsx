import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { TopBar, MobileTabBar, SiteFooter } from "@/components/Nav";
import { supabase } from "@/integrations/supabase/client";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Takaz — Sri Lanka's premium travel ecosystem" },
      { name: "description", content: "Self-drive tuk-tuks, chauffeured SUVs, and boutique villas across Sri Lanka. 24/7 on-ground support, transparent pricing, local expertise." },
      { property: "og:title", content: "Takaz — Sri Lanka's premium travel ecosystem" },
      { property: "og:description", content: "Self-drive tuk-tuks, chauffeured SUVs, and boutique villas across Sri Lanka. 24/7 on-ground support, transparent pricing, local expertise." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Takaz — Sri Lanka's premium travel ecosystem" },
      { name: "twitter:description", content: "Self-drive tuk-tuks, chauffeured SUVs, and boutique villas across Sri Lanka. 24/7 on-ground support, transparent pricing, local expertise." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87cbb7f7-e536-4983-b118-12b2513ec6ac/id-preview-cc341b6f--62c3d249-0360-447b-8533-a282c8e62ffb.lovable.app-1779304913462.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/87cbb7f7-e536-4983-b118-12b2513ec6ac/id-preview-cc341b6f--62c3d249-0360-447b-8533-a282c8e62ffb.lovable.app-1779304913462.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-3 text-muted-foreground">This trail doesn't exist.</p>
        <a href="/" className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Back to explore</a>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    console.error(error);
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <button onClick={() => { router.invalidate(); reset(); }} className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground">Try again</button>
        </div>
      </div>
    );
  },
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, queryClient]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <StoreProvider>
            <div className="min-h-screen pb-24 md:pb-0">
  <TopBar />
  <Outlet />
  <SiteFooter />
  <MobileTabBar />
  {/* WhatsApp floating button — liquid glass */}
  <a
    href="https://wa.me/94712724435"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-28 right-5 md:bottom-8 md:right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full border border-white/20 bg-[#25D366]/15 backdrop-blur-xl shadow-[0_8px_32px_-8px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-110 hover:bg-[#25D366]/25 hover:shadow-[0_12px_40px_-6px_rgba(37,211,102,0.6)] group"
    aria-label="Chat with us on WhatsApp"
  >
    {/* glossy liquid highlight */}
    <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-white/5 to-transparent" />
    {/* bottom refraction sheen */}
    <span className="pointer-events-none absolute -bottom-1 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-[#25D366]/20 blur-md" />
    <svg viewBox="0 0 32 32" className="relative z-10 w-7 h-7 fill-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.75.72 5.37 2.07 7.67L.5 31.5l8.07-2.04A15.45 15.45 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.3a13.2 13.2 0 01-6.73-1.84l-.48-.29-4.79 1.21 1.25-4.66-.31-.5A13.24 13.24 0 1116 28.8zm7.27-9.88c-.4-.2-2.35-1.16-2.72-1.29-.36-.13-.63-.2-.89.2s-1.02 1.29-1.25 1.56c-.23.26-.46.3-.86.1-.4-.2-1.68-.62-3.2-1.98-1.18-1.05-1.98-2.35-2.21-2.75-.23-.4-.02-.61.17-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.26.06-.5-.03-.69-.1-.2-.9-2.16-1.23-2.96-.32-.78-.65-.67-.89-.68h-.76c-.26 0-.69.1-1.05.5-.36.4-1.38 1.35-1.38 3.29s1.41 3.82 1.61 4.08c.2.27 2.78 4.25 6.74 5.96.94.4 1.68.65 2.25.83.95.3 1.81.26 2.49.16.76-.11 2.35-.96 2.68-1.89.33-.93.33-1.72.23-1.89-.1-.17-.36-.26-.76-.46z"/>
    </svg>
  </a>
</div>
          </StoreProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
