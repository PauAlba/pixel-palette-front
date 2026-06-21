import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { ProfileView } from "@/components/ProfileView";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "my page ★ glitterweb" }] }),
  component: MyProfile,
});

function MyProfile() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [theme, setTheme] = useState<any>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [pRes, tRes] = await Promise.all([
        apiFetch<any>(`/profiles/${user.username}`),
        apiFetch<any>(`/themes/${user.username}`).catch(() => null),
      ]);
      setProfile(pRes);
      setTheme(tRes || { custom_css: "", background_pattern: "none" });
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);
  useEffect(() => { void load(); }, [load]);

  if (!profile || !theme) return <div className="y2k-panel p-4">loading your page…</div>;
  return <ProfileView profile={profile} theme={theme} editable onUpdated={load} />;
}
