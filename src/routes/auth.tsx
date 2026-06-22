import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "join glitterweb ♡" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) nav({ to: "/profile" }); }, [user, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, username);
    setBusy(false);
    if (error) return toast.error(error);
    toast.success(mode === "signin" ? "welcome back ♡" : "account created — log in to begin");
    if (mode === "signin") nav({ to: "/profile" });
    else setMode("signin");
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="y2k-panel pattern-glitter">
        <div className="y2k-titlebar">{mode === "signin" ? "login.exe" : "signup.exe"}</div>
        <form onSubmit={submit} className="p-4 space-y-3 bg-paper">
          <h1 className="text-3xl font-display text-center y2k-rainbow">
            ★ {mode === "signin" ? "log in" : "join the scene"} ★
          </h1>
          {mode === "signup" && (
            <label className="block text-sm">
              <span className="font-bold">username</span>
              <input 
                className="y2k-input" 
                required 
                pattern="^[a-z0-9_]{3,20}$" 
                title="3-20 characters. Lowercase letters, numbers, underscores only." 
                value={username} 
                onChange={(e)=>setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                placeholder="cyber_kitty_2007"
              />
              <div className="text-[10px] text-muted-foreground mt-1">3-20 lowercase chars, numbers, underscores only.</div>
            </label>
          )}
          <label className="block text-sm">
            <span className="font-bold">email</span>
            <input type="email" required className="y2k-input" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="font-bold">password</span>
            <input 
              type="password" 
              required 
              minLength={mode === "signup" ? 8 : 1} 
              pattern={mode === "signup" ? "^(?=.*[A-Z])(?=.*[0-9]).{8,}$" : undefined}
              title={mode === "signup" ? "Password must be at least 8 characters, contain 1 uppercase letter and 1 number." : undefined}
              className="y2k-input" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
            />
            {mode === "signup" && <div className="text-[10px] text-muted-foreground mt-1">Min 8 chars, 1 uppercase, 1 number.</div>}
          </label>
          <button disabled={busy} className="y2k-button hot w-full justify-center" type="submit">
            {busy ? "loading…" : mode === "signin" ? "★ log in ★" : "★ create my page ★"}
          </button>
          <p className="text-center text-xs">
            {mode === "signin" ? "no account?" : "already a member?"}{" "}
            <button type="button" className="y2k-link" onClick={()=>setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "sign up here" : "log in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
