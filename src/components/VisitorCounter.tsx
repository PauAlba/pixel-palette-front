import { useEffect, useState } from "react";

const KEY = "glitterweb-visits";

export function VisitorCounter() {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    const prev = parseInt(localStorage.getItem(KEY) || "0", 10);
    const next = prev + 1;
    localStorage.setItem(KEY, String(next));
    // start at a "vintage" base so it feels lived-in
    setCount(13371 + next);
  }, []);
  return (
    <div className="y2k-panel inline-block">
      <div className="bg-black text-lime-300 font-mono px-3 py-1 text-lg tracking-widest">
        ▌{String(count).padStart(7, "0")}▐
      </div>
      <div className="text-[10px] text-center text-muted-foreground py-1 px-2">visitors since '04</div>
    </div>
  );
}
