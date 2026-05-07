import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { StoreProvider } from "@/lib/store";
import { TopBar, MobileTabBar } from "@/components/Nav";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "LuxeLanka — Sri Lanka's premium travel ecosystem" },
      { name: "description", content: "Rent vehicles and book stays across Sri Lanka with one cinematic, synced experience." },
      { property: "og:title", content: "LuxeLanka" },
      { property: "og:description", content: "Sri Lanka travel, reimagined." },
      { property: "og:type", content: "website" },
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
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <div className="min-h-screen pb-24 md:pb-0">
          <TopBar />
          <Outlet />
          <MobileTabBar />
        </div>
      </StoreProvider>
    </QueryClientProvider>
  );
}
