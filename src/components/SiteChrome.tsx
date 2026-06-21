import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Heart, User, LogOut, Home, Compass, BookHeart } from "lucide-react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b-4 border-foreground bg-primary text-primary-foreground">
      <div className="pattern-stars">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <Link to="/" className="!no-underline flex items-center gap-2">
            <span className="text-3xl font-display drop-shadow-[2px_2px_0_#2a0a3a]">
              ★ glitter<span className="text-accent">web</span> ★
            </span>
          </Link>
          <nav className="flex items-center gap-1 flex-wrap text-sm">
            <Link to="/" className="y2k-button"><Home size={14}/>home</Link>
            <Link to="/explore" className="y2k-button cyan"><Compass size={14}/>explore</Link>
            <Link to="/guestbook" className="y2k-button"><BookHeart size={14}/>guestbook</Link>
            {user ? (
              <>
                <Link to="/profile" className="y2k-button hot"><User size={14}/>my page</Link>
                <button className="y2k-button" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
                  <LogOut size={14}/> logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="y2k-button hot"><Sparkles size={14}/>join us</Link>
            )}
          </nav>
        </div>
      </div>
      <div className="y2k-marquee text-xs py-1">
        <span>
          ♡ welcome to glitterweb ♡ a tiny underground for independent artists ♡ post your poems, sketches, collages, moods ♡ sign the guestbook ♡ no algorithms, only vibes ♡ <Heart className="inline" size={12}/> est. 2026, made for 2007 ♡ &nbsp;&nbsp;
        </span>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t-4 border-foreground bg-secondary text-secondary-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="font-display text-xl">★ glitterweb</div>
          <p>a diy art zine running on the new internet, dressed like the old one. ♡</p>
        </div>
        <div>
          <div className="font-bold uppercase">webrings</div>
          <p>
            <a className="y2k-link" href="#">« prev site</a> | <a className="y2k-link" href="#">random</a> | <a className="y2k-link" href="#">next »</a>
          </p>
          <span className="y2k-stamp mt-2">100% handmade html vibes</span>
        </div>
        <div>
          <div className="font-bold uppercase">stamps</div>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="y2k-chip">scene</span>
            <span className="y2k-chip">emo</span>
            <span className="y2k-chip">collage</span>
            <span className="y2k-chip">poetry</span>
            <span className="y2k-chip">webcore</span>
          </div>
          <p className="mt-2 y2k-blink">★ best viewed in IE6 ★</p>
        </div>
      </div>
    </footer>
  );
}
