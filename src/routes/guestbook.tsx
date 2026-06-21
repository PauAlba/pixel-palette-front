import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/guestbook")({
  head: () => ({ meta: [{ title: "global guestbook ★ glitterweb" }] }),
  component: GlobalGuestbook,
});

function GlobalGuestbook() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await apiFetch<any>(`/guestbook/${user?.username || 'pixel_user'}`);
        setEntries(Array.isArray(response) ? response : response.data || response.guestbook || []);
      } catch (err) {
        setEntries([]);
      }
    })();
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await apiFetch<any>(`/guestbook/${user?.username || 'pixel_user'}`, {
        method: "POST",
        body: JSON.stringify({ message: body }),
      });
      const entry = res.guestbook || res.data || res;
      setEntries((e) => [entry, ...e]); 
      setBody("");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="y2k-panel pattern-hearts">
        <div className="y2k-titlebar">global guestbook ♡</div>
        <div className="p-4 bg-paper space-y-3">
          <h1 className="text-3xl font-display">★ leave a trace ★</h1>
          <p className="text-sm">sign the wall. (this posts to your own page — visit someone else's profile to write on theirs.)</p>
          {user ? (
            <form onSubmit={submit} className="flex gap-2">
              <input className="y2k-input" placeholder="say hi to the internet…" value={body} onChange={(e)=>setBody(e.target.value)} />
              <button className="y2k-button hot" type="submit"><Heart size={14}/> sign</button>
            </form>
          ) : (
            <Link to="/auth" className="y2k-link">log in to sign</Link>
          )}
          <ul className="text-sm space-y-1 mt-2">
            {entries.map((e) => (
              <li key={e.id} className="border-b border-dashed border-foreground/30 pb-1">
                <Link to="/u/$username" params={{ username: e.author_username ?? "" }} className="y2k-link font-bold">@{e.author_username}</Link>
                {" → "}
                <Link to="/u/$username" params={{ username: user?.username ?? "pixel_user" }} className="y2k-link">@{user?.username ?? "pixel_user"}</Link>
                : {e.message}
              </li>
            ))}
            {entries.length === 0 && <li className="text-xs">no messages yet — be first ♡</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
