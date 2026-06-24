import React from "react";
import { MODEL_COLORS } from "../../types";

interface ModelBadgeProps {
  model: string;
  className?: string;
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({ model, className = "" }) => {
  const color = MODEL_COLORS[model] || "#8b5cf6";
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border border-opacity-30 ${className}`}
      style={{
        color: color,
        borderColor: `${color}4D`,
        backgroundColor: `${color}0D`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {model}
    </div>
  );
};
