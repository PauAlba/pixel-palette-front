import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/u/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} ★ glitterweb` },
      { name: "description", content: `Artist page of @${params.username} on glitterweb.` },
    ],
  }),
  component: UserPage,
});

function UserPage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await apiFetch<any>(`/profiles/${username}`);
      if (!p) { setMissing(true); return; }
      
      const t = await apiFetch<any>(`/themes/${username}`).catch(() => ({ custom_css: "", background_pattern: "none" }));
      let finalTheme = t || { custom_css: "", background_pattern: "none" };
      try {
        const local = localStorage.getItem(`theme_${username}`);
        if (local) finalTheme = { ...finalTheme, ...JSON.parse(local) };
      } catch (e) {}
      
      setProfile(p); 
      setTheme(finalTheme);
    } catch (e) {
      setMissing(true);
    }
  }, [username]);

  useEffect(() => { void load(); }, [load]);

  if (missing) throw notFound();
  if (!profile || !theme) return <div className="y2k-panel p-4">loading…</div>;
  return <ProfileView profile={profile} theme={theme} editable={!!user && user.id === profile.id} onUpdated={load} />;
}
