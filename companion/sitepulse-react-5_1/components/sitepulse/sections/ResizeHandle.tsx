"use client";

import { useState } from "react";

export function ResizeHandle({ aiWorkspaceHeight, onHeightChange }: { aiWorkspaceHeight: number; onHeightChange: (value: number) => void; }) {
  const [isDragging, setIsDragging] = useState(false);
  const handleCycle = () => {
    const nextValue = aiWorkspaceHeight >= 620 ? 420 : aiWorkspaceHeight + 80;
    onHeightChange(nextValue);
    setIsDragging(false);
  };

  return <div className="flex items-center justify-center py-1"><button type="button" onClick={handleCycle} onMouseDown={() => setIsDragging(true)} onMouseUp={() => setIsDragging(false)} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#738095] shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]"><span className="uppercase tracking-[0.10em]">AI Workspace</span><span className="h-1 w-8 rounded-full bg-white/10" /><span>{isDragging ? "Release to resize" : "Drag to resize"}</span></button></div>;
}
