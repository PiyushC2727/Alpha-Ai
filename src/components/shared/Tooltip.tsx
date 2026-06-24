import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}>
          <div className="bg-[#12121a] text-slate-200 text-[10px] font-mono px-2 py-1 rounded border border-[#1e1e2f] whitespace-nowrap shadow-xl purple-glow">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
