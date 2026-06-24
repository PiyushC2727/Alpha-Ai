import React from "react";
import { Square, Monitor, Smartphone, Layout, BookOpen } from "lucide-react";

interface AspectRatioOption {
  id: string;
  name: string;
  ratio: string;
  icon: React.ReactNode;
}

interface AspectRatioPickerProps {
  selectedRatio: string;
  onChange: (id: string) => void;
}

const RATIOS: AspectRatioOption[] = [
  { id: "1:1", name: "Square", ratio: "1:1", icon: <Square className="w-4 h-4" /> },
  { id: "16:9", name: "Cinema", ratio: "16:9", icon: <Monitor className="w-4 h-4" /> },
  { id: "9:16", name: "Mobile", ratio: "9:16", icon: <Smartphone className="w-4 h-4" /> },
  { id: "4:3", name: "Desktop", ratio: "4:3", icon: <Layout className="w-4 h-4" /> },
  { id: "3:4", name: "Portrait", ratio: "3:4", icon: <BookOpen className="w-4 h-4" /> }
];

export function AspectRatioPicker({ selectedRatio, onChange }: AspectRatioPickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
        Canvas Aspect Ratio
      </label>
      <div className="grid grid-cols-5 gap-1.5" id="aspect-ratio-picker-grid">
        {RATIOS.map((ratio) => {
          const isSelected = selectedRatio === ratio.id;
          return (
            <button
              key={ratio.id}
              type="button"
              onClick={() => onChange(ratio.id)}
              className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                isSelected
                  ? "bg-brand-purple/20 border-brand-purple text-purple-400 font-bold"
                  : "bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200"
              }`}
              title={`${ratio.name} (${ratio.ratio})`}
            >
              {ratio.icon}
              <span className="text-[10px] font-mono leading-none">{ratio.ratio}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default AspectRatioPicker;
