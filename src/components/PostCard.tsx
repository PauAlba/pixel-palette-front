import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, MessageCircle, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type FeedPost = {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  post_type: string;
  tags: string[] | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    mood: string | null;
  } | null;
};

export function PostCard({ post }: { post: FeedPost }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [body, setBody] = useState("");
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    // Likes and Comments are partially implemented in backend.
    // For now we will assume 0 likes unless fetched with the post.
    // Real implementation would require a GET /posts/:id/likes endpoint.
    setLikes(0);
    setLiked(false);
  }, [post.id, user]);

  async function toggleLike() {
    if (!user) return nav({ to: "/auth" });
    try {
      await apiFetch(`/posts/${post.id}/like`, { method: liked ? "DELETE" : "POST" });
      if (liked) {
        setLikes((n) => n - 1); setLiked(false);
      } else {
        setLikes((n) => n + 1); setLiked(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function loadComments() {
    setShowComments((s) => !s);
    if (comments.length) return;
    try {
      const response = await apiFetch<any>(`/posts/${post.id}/comments`);
      setComments(response.comments || response.data || response || []);
    } catch (err) {
      setComments([]);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return nav({ to: "/auth" });
    if (!body.trim()) return;
    try {
      const response = await apiFetch<any>(`/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: body }), // API uses 'content' not 'body'
      });
      const newComment = response.comment || response.data || response;
      setComments((c) => [...c, newComment]);
      setBody("");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <article className="y2k-panel">
      <div className="y2k-titlebar">
        <span>
          {post.author_username ? (
            <Link to="/u/$username" params={{ username: post.author_username }} className="!text-white">
              @{post.author_display_name || post.author_username}
            </Link>
          ) : "@unknown"} • {new Date(post.created_at).toLocaleString()}
        </span>
        <span className="text-[10px]">{post.post_type}</span>
      </div>

      <div className="p-4 space-y-3">
        {post.title && <h2 className="text-2xl font-display">{post.title}</h2>}
        {post.image_url && (
          <div className="border-2 border-foreground inline-block bg-muted p-1">
            <img src={post.image_url} alt={post.title || "post"} className="max-h-[480px] object-contain"/>
          </div>
        )}
        {post.content && (
          <p className="whitespace-pre-wrap font-body leading-relaxed">{post.content}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <Tag size={12} className="mt-1"/>
            {post.tags.map((t) => <span key={t} className="y2k-chip">#{t}</span>)}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-dashed border-foreground/40">
          <button className={`y2k-button ${liked ? "hot" : ""}`} onClick={toggleLike}>
            <Heart size={14} fill={liked ? "currentColor" : "none"}/> {likes}
          </button>
          <button className="y2k-button" onClick={loadComments}>
            <MessageCircle size={14}/> comments
          </button>
        </div>

        {showComments && (
          <div className="space-y-2 bg-muted p-3 border-2 border-foreground">
            {comments.length === 0 && <p className="text-xs text-muted-foreground">no comments yet — break the silence ♡</p>}
            {comments.map((c) => (
              <div key={c.id} className="text-sm border-b border-dashed border-foreground/30 pb-1">
                <Link to="/u/$username" params={{ username: c.author_username ?? "" }} className="y2k-link font-bold">@{c.author_username}</Link>
                : {c.content || c.body}
              </div>
            ))}
            {user ? (
              <form onSubmit={addComment} className="flex gap-2">
                <input className="y2k-input" placeholder="leave a comment…" value={body} onChange={(e)=>setBody(e.target.value)} />
                <button className="y2k-button hot" type="submit">post</button>
              </form>
            ) : (
              <Link to="/auth" className="y2k-link text-xs">log in to comment</Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
