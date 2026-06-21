import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { VisitorCounter } from "@/components/VisitorCounter";
import { PostCard } from "@/components/PostCard";
import { Sparkles, PenLine, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "glitterweb ★ home feed" },
      { name: "description", content: "Latest art, poems, sketches and moods from the glitterweb community." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const nav = useNavigate();

  const { data: posts, refetch } = useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      try {
        const response = await apiFetch<any>("/posts?limit=30");
        return response.posts || response.data?.posts || response.data || response || [];
      } catch (err) {
        console.error(err);
        return [];
      }
    },
  });

  const { data: topArtists } = useQuery({
    queryKey: ["top-artists"],
    queryFn: async () => {
      try {
        const res = await apiFetch<any>("/profiles/top?limit=4");
        return Array.isArray(res) ? res : res.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  useEffect(() => { void refetch(); }, [user, refetch]);

  return (
    <div className="grid lg:grid-cols-[260px_1fr_240px] gap-4">
      {/* LEFT */}
      <aside className="space-y-4">
        <div className="y2k-panel">
          <div className="y2k-titlebar blue">★ welcome.txt</div>
          <div className="p-3 text-sm space-y-2">
            <p>hi cutie ♡ glitterweb is a tiny corner of the internet for indie artists.</p>
            <p>share poems, sketches, collages, moods. comment. follow. sign guestbooks.</p>
            {!user && (
              <button className="y2k-button hot w-full justify-center" onClick={() => nav({ to: "/auth" })}>
                <Sparkles size={14}/> create your page
              </button>
            )}
            {user && (
              <button className="y2k-button hot w-full justify-center" onClick={() => nav({ to: "/post/new" })}>
                <PenLine size={14}/> new post
              </button>
            )}
          </div>
        </div>

        <div className="y2k-panel">
          <div className="y2k-titlebar lime">✿ visitors ✿</div>
          <div className="p-3 flex justify-center"><VisitorCounter/></div>
        </div>

        <div className="y2k-panel">
          <div className="y2k-titlebar">★ stamps ★</div>
          <div className="p-3 flex flex-wrap gap-1">
            {["scene","emo","collage","poetry","webcore","glitter","diy","sad-girl","art-school"].map(t => (
              <span key={t} className="y2k-chip">#{t}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* MIDDLE FEED */}
      <section className="space-y-4 min-w-0">
        <div className="y2k-panel pattern-checker">
          <div className="y2k-titlebar">latest from the underground</div>
          <div className="p-4 bg-paper">
            <h1 className="text-4xl font-display y2k-rainbow">★彡 latest blog 彡★</h1>
            <p className="text-sm mt-1">a chronological feed. no algorithm. just kids posting art.</p>
          </div>
        </div>

        {posts === undefined ? (
          <div className="y2k-panel p-4">loading the zine…</div>
        ) : posts.length === 0 ? (
          <div className="y2k-panel p-6 text-center space-y-2">
            <ImageIcon className="mx-auto" />
            <p>the feed is empty. be the first artist to post ♡</p>
            {user ? (
              <Link to="/post/new" className="y2k-button hot inline-flex">make a post</Link>
            ) : (
              <Link to="/auth" className="y2k-button hot inline-flex">join glitterweb</Link>
            )}
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p as any} />)
        )}
      </section>

      {/* RIGHT */}
      <aside className="space-y-4">
        <div className="y2k-panel">
          <div className="y2k-titlebar">☆ top artists ☆</div>
          <div className="p-2 grid grid-cols-2 gap-2">
            {(topArtists ?? []).map((a) => (
              <Link key={a.id} to="/u/$username" params={{ username: a.username }} className="!no-underline">
                <div className="border-2 border-foreground bg-muted p-1 text-center">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt={a.username} className="w-full aspect-square object-cover border border-foreground"/>
                  ) : (
                    <div className="w-full aspect-square pattern-glitter border border-foreground flex items-center justify-center font-display text-xl">
                      {a.username.slice(0,2)}
                    </div>
                  )}
                  <div className="text-[11px] font-bold truncate">@{a.username}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="y2k-panel">
          <div className="y2k-titlebar lime">♬ now playing</div>
          <div className="p-3 text-sm">
            <div className="font-mono bg-black text-lime-300 px-2 py-1 overflow-hidden whitespace-nowrap">
              ► dj sammy — heaven (candlelight remix)
            </div>
            <p className="text-xs mt-2 text-muted-foreground">customize on your own profile ♡</p>
          </div>
        </div>

        <div className="y2k-panel pattern-hearts">
          <div className="y2k-titlebar">♡ guestbook</div>
          <div className="p-3 text-sm bg-paper/80">
            <Link to="/guestbook" className="y2k-link">→ write something nice</Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
