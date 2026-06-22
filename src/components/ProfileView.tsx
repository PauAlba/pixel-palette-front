import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { PostCard, type FeedPost } from "./PostCard";
import { Heart, UserPlus, UserMinus } from "lucide-react";

type Profile = {
  id: string; username: string; display_name: string | null; bio: string;
  mood: string | null; avatar_url: string | null; favorite_artists: string[] | null;
  created_at: string;
};
type Theme = {
  background_color: string; text_color: string; accent_color: string; link_color: string;
  font_family: string; background_pattern: string; cursor_style: string; custom_css: string; music_url: string | null;
};

const PATTERNS = ["none","hearts","stars","glitter","leopard","checker","stripes","grid"];

export function ProfileView({ profile, theme, editable, onUpdated }: {
  profile: Profile; theme: Theme; editable: boolean; onUpdated?: () => void;
}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [iFollow, setIFollow] = useState(false);
  const [guest, setGuest] = useState<any[]>([]);
  const [gbBody, setGbBody] = useState("");

  // edit state
  const [editing, setEditing] = useState(false);
  const [p, setP] = useState(profile);
  const [t, setT] = useState(theme);
  const [favs, setFavs] = useState((profile.favorite_artists ?? []).join(", "));

  useEffect(() => {
    setT(theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      try {
        const [postsRes, gbRes, followersRes] = await Promise.all([
          apiFetch<any>(`/profiles/${profile.username}/posts`).catch(()=>([])),
          apiFetch<any[]>(`/guestbook/${profile.username}`).catch(()=>([])),
          apiFetch<any>(`/profiles/${profile.username}/followers?limit=100`).catch(()=>({ data: [] })),
        ]);
        setPosts((postsRes.posts || postsRes.data?.posts || postsRes.data || postsRes || []) as any);
        setGuest(Array.isArray(gbRes) ? gbRes : gbRes?.data || []);
        
        // Initialize counts from profile
        setFollowers((profile as any).followers_count || 0); 
        setFollowing((profile as any).following_count || 0);
        
        if (user && user.id !== profile.id) {
          const followersList = followersRes.data || followersRes.followers || Array.isArray(followersRes) ? followersRes : [];
          // Check if current user is in the followers list
          const isFollowing = followersList.some((f: any) => 
            f.follower_id === user.id || f.id === user.id || f.follower_username === user.user_metadata?.username
          );
          setIFollow(isFollowing);
        } else {
          setIFollow(false);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [profile.id, profile.username, user]);

  async function toggleFollow() {
    if (!user) return toast.error("You must be logged in to follow users.");
    try {
      if (iFollow) {
        await apiFetch(`/followers/${profile.username}`, { method: "DELETE" });
        setIFollow(false);
        setFollowers((prev) => Math.max(0, prev - 1));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        await apiFetch(`/followers/${profile.username}`, { method: "POST" });
        setIFollow(true);
        setFollowers((prev) => prev + 1);
        toast.success(`Followed @${profile.username}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle follow status");
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const favArr = favs.split(",").map(s=>s.trim()).filter(Boolean);
    try {
      localStorage.setItem(`theme_${p.username}`, JSON.stringify(t));
      const profilePayload: any = {};
      if (p.display_name) profilePayload.display_name = p.display_name;
      if (p.bio) profilePayload.bio = p.bio;
      if (p.mood) profilePayload.mood = p.mood;
      if (p.avatar_url && p.avatar_url.startsWith('http')) profilePayload.avatar_url = p.avatar_url;
      if (favArr.length > 0) profilePayload.favorite_artists = favArr;

      await apiFetch(`/profiles/me`, {
        method: "PATCH",
        body: JSON.stringify(profilePayload)
      });

      const themePayload: any = {};
      if (t.custom_css) themePayload.customCss = t.custom_css;
      if (t.background_pattern) themePayload.backgroundPattern = t.background_pattern;
      if (t.music_url && t.music_url.startsWith('http')) themePayload.musicUrl = t.music_url;

      await apiFetch(`/themes/me`, {
        method: "PUT",
        body: JSON.stringify(themePayload)
      });
    } catch (err: any) {
      return toast.error(err.message);
    }
    toast.success("profile saved ♡");
    setEditing(false);
    onUpdated?.();
  }

  async function signGuestbook(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!gbBody.trim()) return;
    try {
      const response = await apiFetch<any>(`/guestbook/${profile.username}`, {
        method: "POST",
        body: JSON.stringify({ message: gbBody }),
      });
      const newEntry = response.guestbook || response.data || response;
      setGuest((g)=>[newEntry, ...g]); setGbBody("");
    } catch (err: any) {
      return toast.error(err.message);
    }
  }

  const patternClass = `pattern-${t.background_pattern || "hearts"}`;
  const wrapStyle: React.CSSProperties = {
    backgroundColor: t.background_color,
    color: t.text_color,
    fontFamily: t.font_family,
  };

  return (
    <div className="border-4 border-foreground" style={wrapStyle}>
      <div className={`${patternClass} p-4`}>
        <style>{`a { color: ${t.link_color}; } .pf-accent { background:${t.accent_color}; color:#1b063b; } ${t.custom_css || ""}`}</style>

        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          {/* LEFT COLUMN: about + customization */}
          <aside className="space-y-3">
            <div className="y2k-panel">
              <div className="y2k-titlebar">@{profile.username}</div>
              <div className="p-3 text-center bg-paper space-y-2">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="mx-auto w-40 h-40 object-cover border-2 border-foreground"/>
                ) : (
                  <div className="mx-auto w-40 h-40 pattern-glitter border-2 border-foreground flex items-center justify-center font-display text-4xl">
                    {profile.username.slice(0,2)}
                  </div>
                )}
                <div className="font-display text-xl">{profile.display_name || profile.username}</div>
                <div className="text-xs italic">mood: {profile.mood}</div>
                <div className="text-[11px] text-muted-foreground">member since {new Date(profile.created_at).toLocaleDateString()}</div>
                <div className="flex justify-center gap-2 text-xs">
                  <span><b>{followers}</b> followers</span>
                  <span><b>{following}</b> following</span>
                </div>
                {user && user.id !== profile.id && (
                  <button className={`y2k-button ${iFollow ? "" : "hot"} w-full justify-center`} onClick={toggleFollow}>
                    {iFollow ? <><UserMinus size={14}/> unfollow</> : <><UserPlus size={14}/> add friend</>}
                  </button>
                )}
                {editable && (
                  <button className="y2k-button cyan w-full justify-center" onClick={()=>setEditing((s)=>!s)}>
                    {editing ? "close editor" : "✎ edit my page"}
                  </button>
                )}
              </div>
            </div>

            <div className="y2k-panel">
              <div className="y2k-titlebar blue">about me</div>
              <div className="p-3 text-sm bg-paper whitespace-pre-wrap">{profile.bio || "(no bio yet)"}</div>
            </div>

            <div className="y2k-panel">
              <div className="y2k-titlebar lime">favorite artists</div>
              <div className="p-3 bg-paper flex flex-wrap gap-1">
                {(profile.favorite_artists ?? []).map((a) => <span key={a} className="y2k-chip">★ {a}</span>)}
                {(!profile.favorite_artists || profile.favorite_artists.length === 0) && <span className="text-xs text-muted-foreground">none listed</span>}
              </div>
            </div>

            {t.music_url && (
              <div className="y2k-panel">
                <div className="y2k-titlebar">♬ now playing</div>
                <div className="p-2 bg-paper text-xs break-all"><a className="y2k-link" href={t.music_url} target="_blank" rel="noreferrer">{t.music_url}</a></div>
              </div>
            )}
          </aside>

          {/* RIGHT COLUMN: posts + guestbook */}
          <section className="space-y-4 min-w-0">
            {editing && (
              <form onSubmit={saveEdit} className="y2k-panel">
                <div className="y2k-titlebar">customize.exe</div>
                <div className="p-4 bg-paper grid md:grid-cols-2 gap-3 text-sm">
                  <label><span className="font-bold">display name</span><input className="y2k-input" value={p.display_name ?? ""} onChange={(e)=>setP({...p, display_name: e.target.value})}/></label>
                  <label><span className="font-bold">mood</span><input className="y2k-input" value={p.mood ?? ""} onChange={(e)=>setP({...p, mood: e.target.value})}/></label>
                  <label className="md:col-span-2"><span className="font-bold">avatar url</span><input className="y2k-input" value={p.avatar_url ?? ""} onChange={(e)=>setP({...p, avatar_url: e.target.value})}/></label>
                  <label className="md:col-span-2"><span className="font-bold">bio</span><textarea className="y2k-input min-h-24" value={p.bio} onChange={(e)=>setP({...p, bio: e.target.value})}/></label>
                  <label className="md:col-span-2"><span className="font-bold">favorite artists (comma separated)</span><input className="y2k-input" value={favs} onChange={(e)=>setFavs(e.target.value)}/></label>
                  <label><span className="font-bold">background color</span><input type="color" className="y2k-input h-10" value={t.background_color} onChange={(e)=>setT({...t, background_color: e.target.value})}/></label>
                  <label><span className="font-bold">text color</span><input type="color" className="y2k-input h-10" value={t.text_color} onChange={(e)=>setT({...t, text_color: e.target.value})}/></label>
                  <label><span className="font-bold">accent color</span><input type="color" className="y2k-input h-10" value={t.accent_color} onChange={(e)=>setT({...t, accent_color: e.target.value})}/></label>
                  <label><span className="font-bold">link color</span><input type="color" className="y2k-input h-10" value={t.link_color} onChange={(e)=>setT({...t, link_color: e.target.value})}/></label>
                  <label><span className="font-bold">font</span>
                    <select className="y2k-input" value={t.font_family} onChange={(e)=>setT({...t, font_family: e.target.value})}>
                      <option value='Verdana, Tahoma, sans-serif'>Verdana</option>
                      <option value='Tahoma, sans-serif'>Tahoma</option>
                      <option value='"Courier New", monospace'>Courier New</option>
                      <option value='"Comic Sans MS", cursive'>Comic Sans</option>
                      <option value='Georgia, serif'>Georgia</option>
                    </select>
                  </label>
                  <label><span className="font-bold">background pattern</span>
                    <select className="y2k-input" value={t.background_pattern} onChange={(e)=>setT({...t, background_pattern: e.target.value})}>
                      {PATTERNS.map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </label>
                  <label className="md:col-span-2"><span className="font-bold">music link (optional)</span><input className="y2k-input" value={t.music_url ?? ""} onChange={(e)=>setT({...t, music_url: e.target.value})}/></label>
                  <label className="md:col-span-2"><span className="font-bold">custom css (advanced)</span><textarea className="y2k-input font-mono min-h-24" value={t.custom_css} onChange={(e)=>setT({...t, custom_css: e.target.value})}/></label>
                  <button className="y2k-button hot md:col-span-2 justify-center" type="submit">★ save changes ★</button>
                </div>
              </form>
            )}

            <div className="y2k-panel">
              <div className="y2k-titlebar pf-accent">★ latest blog ★</div>
              <div className="p-2 bg-paper">
                {posts.length === 0 ? (
                  <p className="p-3 text-sm">no posts yet.</p>
                ) : (
                  <div className="space-y-3">{posts.map(po => <PostCard key={po.id} post={{...po, author_username: profile.username, author_display_name: profile.display_name, author_avatar_url: profile.avatar_url} as FeedPost}/>)}</div>
                )}
              </div>
            </div>

            <div className="y2k-panel">
              <div className="y2k-titlebar lime">♡ guestbook</div>
              <div className="p-3 bg-paper space-y-2">
                {user ? (
                  <form onSubmit={signGuestbook} className="flex gap-2">
                    <input className="y2k-input" placeholder="leave a message…" value={gbBody} onChange={(e)=>setGbBody(e.target.value)} />
                    <button className="y2k-button hot" type="submit"><Heart size={14}/> sign</button>
                  </form>
                ) : (
                  <Link to="/auth" className="y2k-link text-xs">log in to sign the guestbook</Link>
                )}
                <ul className="text-sm space-y-1">
                  {guest.map((g) => (
                    <li key={g.id} className="border-b border-dashed border-foreground/30 pb-1">
                      <Link to="/u/$username" params={{ username: g.author_username ?? "" }} className="y2k-link font-bold">@{g.author_username}</Link>
                      : {g.message}
                      <span className="text-[10px] text-muted-foreground"> — {new Date(g.created_at).toLocaleDateString()}</span>
                    </li>
                  ))}
                  {guest.length === 0 && <li className="text-xs text-muted-foreground">no signatures yet</li>}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
