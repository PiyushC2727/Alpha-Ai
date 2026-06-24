import React from "react";
import { Cpu } from "lucide-react";

interface LoadingDotsProps {
  message?: string;
}

export function LoadingDots({ message = "Alpha OS routing your request..." }: LoadingDotsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 gap-4 animate-pulse-slow">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="w-12 h-12 rounded-full border border-purple-500/30 animate-spin absolute" />
        <div className="w-10 h-10 rounded-full bg-purple-950/20 flex items-center justify-center border border-purple-500/20">
          <Cpu className="w-5 h-5 text-brand-purple animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5 text-center">
        <span className="text-xs font-mono font-medium tracking-wider text-slate-300">
          {message}
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 bg-purple-450 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
