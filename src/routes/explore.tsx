import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "explore artists ★ glitterweb" }] }),
  component: Explore,
});

function Explore() {
  const [q, setQ] = useState("");
  const { data: artists } = useQuery({
    queryKey: ["explore-artists", q],
    queryFn: async () => {
      try {
        const response = await apiFetch<any>("/profiles?limit=50");
        let allArtists = response.data?.rows || response.data || response || [];
        if (!Array.isArray(allArtists)) allArtists = [];
        if (!q) return allArtists;
        return allArtists.filter((a: any) => 
          a.username?.toLowerCase().includes(q.toLowerCase()) || 
          a.display_name?.toLowerCase().includes(q.toLowerCase())
        );
      } catch (err) {
        return [];
      }
    },
  });

  const { data: trendingTags } = useQuery({
    queryKey: ["trending-tags"],
    queryFn: async () => {
      try {
        const res = await apiFetch<{ data: { posts: any[] } }>("/posts?limit=50");
        const posts = res.data?.posts ?? [];
        const counts = new Map<string, number>();
        posts.forEach((p) => (p.tags ?? []).forEach((t: string) => counts.set(t, (counts.get(t) ?? 0) + 1)));
        return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 12);
      } catch (err) {
        return [];
      }
    },
  });

  return (
    <div className="grid lg:grid-cols-[1fr_260px] gap-4">
      <section className="space-y-4">
        <div className="y2k-panel">
          <div className="y2k-titlebar">explore.exe</div>
          <div className="p-4 bg-paper space-y-3">
            <h1 className="text-3xl font-display">★ find your people ★</h1>
            <input className="y2k-input" placeholder="search usernames…" value={q} onChange={(e)=>setQ(e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(artists ?? []).map((a) => (
            <Link key={a.id} to="/u/$username" params={{ username: a.username }} className="!no-underline">
              <div className="y2k-panel pattern-stars">
                <div className="y2k-titlebar">@{a.username}</div>
                <div className="p-3 bg-paper space-y-2">
                  <div className="flex items-center gap-2">
                    {a.avatar_url ? (
                      <img src={a.avatar_url} alt="" className="w-14 h-14 object-cover border-2 border-foreground"/>
                    ) : (
                      <div className="w-14 h-14 pattern-checker border-2 border-foreground flex items-center justify-center font-display text-lg">
                        {a.username.slice(0,2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold truncate">{a.display_name || a.username}</div>
                      <div className="text-xs italic">mood: {a.mood}</div>
                    </div>
                  </div>
                  {a.bio && <p className="text-xs line-clamp-3">{a.bio}</p>}
                </div>
              </div>
            </Link>
          ))}
          {artists && artists.length === 0 && (
            <div className="y2k-panel p-4 col-span-full">no artists found.</div>
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="y2k-panel">
          <div className="y2k-titlebar lime">★ trending tags ★</div>
          <div className="p-3 flex flex-wrap gap-1">
            {(trendingTags ?? []).map(([t, n]) => (
              <span key={t} className="y2k-chip">#{t} ({n})</span>
            ))}
            {trendingTags && trendingTags.length === 0 && <p className="text-xs">no tags yet</p>}
          </div>
        </div>
      </aside>
    </div>
  );
}
