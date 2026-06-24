import React, { useState } from "react";
import { ChevronDown, ChevronUp, Brain } from "lucide-react";

interface ThinkingBlockProps {
  content: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border-l-2 border-red-brand bg-red-brand/5 rounded-r-lg px-4 py-3 my-2 text-xs">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between font-mono font-medium text-red-brand select-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-red-brand animate-pulse-slow" />
          <span>Reasoning Process</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] hover:text-red-brand/80 transition-colors">
          <span>{isExpanded ? "Collapse" : "Show reasoning"}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      <div
        className={`mt-2 font-mono text-text-secondary leading-relaxed transition-all duration-300 ${
          isExpanded ? "max-h-[500px] overflow-y-auto" : "max-h-10 overflow-hidden line-clamp-2"
        }`}
      >
        {content}
      </div>
    </div>
  );
};
