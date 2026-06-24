import React, { useState } from "react";
import { CompareResponse, MODEL_COLORS } from "../../types";
import { ModelBadge } from "../shared/ModelBadge";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { ThumbsUp, Medal } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface CompareViewProps {
  responses: CompareResponse[];
}

export const CompareView: React.FC<CompareViewProps> = ({ responses }) => {
  const { addToast } = useApp();
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const handleVoteWinner = (modelId: string) => {
    setWinnerId(modelId);
    const chosen = responses.find((r) => r.modelId === modelId);
    addToast(`Recorded! ${chosen?.modelName || modelId} marked as the best response.`, "success");
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-xs font-mono text-text-secondary">
        <span className="text-accent-primary">🔄 Side-by-side Output Match</span>
        <span>{responses.length} Models running in parallel</span>
      </div>

      {/* Columns Container: Horizontally scrollable on mobile, grids on desk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto pb-2 w-full">
        {responses.map((resp) => {
          const color = MODEL_COLORS[resp.modelName] || "#8b5cf6";
          const isWinner = winnerId === resp.modelId;

          return (
            <div
              key={resp.modelId}
              className={`flex flex-col rounded-xl border bg-bg-base/40 overflow-hidden transition-all duration-300 min-w-[280px] max-w-full ${
                isWinner
                  ? "border-accent-primary/60 shadow-[0_0_15px_rgba(139,92,246,0.15)] bg-accent-primary/5 scale-[1.01]"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
              style={!isWinner ? { borderLeft: `3px solid ${color}` } : { borderLeft: `3px solid ${color}` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-bg-surface border-b border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <ModelBadge model={resp.modelName} />
                  {isWinner && (
                    <div className="flex items-center gap-0.5 text-[10px] text-accent-primary font-bold font-mono">
                      <Medal className="w-3.5 h-3.5" />
                      <span>Best</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  {resp.durationMs}ms
                </span>
              </div>

              {/* Content */}
              <div className="p-3.5 flex-1 text-xs max-h-[450px] overflow-y-auto">
                <MarkdownRenderer content={resp.content} />
              </div>

              {/* Footer vote */}
              <div className="px-3 py-2 bg-bg-surface/50 border-t border-zinc-900 flex items-center justify-end">
                <button
                  onClick={() => handleVoteWinner(resp.modelId)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium font-mono transition-all cursor-pointer ${
                    isWinner
                      ? "bg-accent-primary text-white"
                      : "bg-zinc-800/60 hover:bg-zinc-800 text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>{isWinner ? "Selected Best" : "Mark Best"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
