import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="y2k-panel">
        <div className="y2k-titlebar">error.exe — page not found</div>
        <div className="p-4 space-y-3">
          <h1 className="text-3xl font-display">404 ♡ this page is gone</h1>
          <p>maybe it ran away to a tumblr blog. try again from home.</p>
          <a href="/" className="y2k-button hot inline-block">★ take me home ★</a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="y2k-panel">
        <div className="y2k-titlebar">system error ☠</div>
        <div className="p-4 space-y-3">
          <p className="font-mono text-sm">{error.message}</p>
          <button className="y2k-button" onClick={() => { router.invalidate(); reset(); }}>try again</button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "glitterweb ★ underground art zine" },
      { name: "description", content: "A nostalgic Y2K-style social blog for independent artists. Post poems, sketches, collages, moodboards." },
      { property: "og:title", content: "glitterweb ★ underground art zine" },
      { property: "og:description", content: "A nostalgic Y2K-style social blog for independent artists. Post poems, sketches, collages, moodboards." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "glitterweb ★ underground art zine" },
      { name: "twitter:description", content: "A nostalgic Y2K-style social blog for independent artists. Post poems, sketches, collages, moodboards." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/kOzB5Fqsm7bXKZnkpRDo6A9ub7D2/social-images/social-1779827395763-LAVIDAESEXTRAÑA_-_copia.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/kOzB5Fqsm7bXKZnkpRDo6A9ub7D2/social-images/social-1779827395763-LAVIDAESEXTRAÑA_-_copia.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <main className="flex-1 max-w-6xl w-full mx-auto px-3 py-6">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
