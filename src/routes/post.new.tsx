import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/post/new")({
  head: () => ({ meta: [{ title: "new post ♡ glitterweb" }] }),
  component: NewPost,
});

function NewPost() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [type, setType] = useState("text");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          title: title || undefined,
          content,
          image_url: imageUrl || undefined,
          post_type: type,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      toast.success("posted to the zine ♡");
      nav({ to: "/" });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="y2k-panel">
        <div className="y2k-titlebar">compose.exe — new post</div>
        <form onSubmit={submit} className="p-4 bg-paper space-y-3">
          <h1 className="text-3xl font-display">★ make a post ★</h1>
          <label className="block text-sm">
            <span className="font-bold">type</span>
            <select className="y2k-input" value={type} onChange={(e)=>setType(e.target.value)}>
              <option value="text">text / thought / poem</option>
              <option value="pixel_art">pixel art</option>
              <option value="image">image / sketch / painting / collage</option>
              <option value="animation">animation / video</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-bold">title (optional)</span>
            <input className="y2k-input" value={title} onChange={(e)=>setTitle(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="font-bold">image url (optional)</span>
            <input className="y2k-input" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://…"/>
          </label>
          <label className="block text-sm">
            <span className="font-bold">your words</span>
            <textarea className="y2k-input min-h-40" value={content} onChange={(e)=>setContent(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="font-bold">tags (comma separated)</span>
            <input className="y2k-input" value={tags} onChange={(e)=>setTags(e.target.value)} placeholder="poetry, sad, midnight"/>
          </label>
          <button disabled={busy} className="y2k-button hot w-full justify-center">{busy ? "posting…" : "★ publish ★"}</button>
        </form>
      </div>
    </div>
  );
}
