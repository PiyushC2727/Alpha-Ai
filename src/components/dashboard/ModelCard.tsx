import React from "react";
import { ModelPerformanceData } from "../../hooks/useModels";
import { Clock, Zap, Target, BookOpen, Layers, Award } from "lucide-react";

interface ModelCardProps {
  model: ModelPerformanceData;
}

export function ModelCard({ model }: ModelCardProps) {
  const formatSuccess = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  const getScoreStars = (score: number) => {
    return "★".repeat(Math.round(score / 2)) + "☆".repeat(5 - Math.round(score / 2));
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl p-5 hover:border-brand-purple/30 hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative accent background blob matching model color */}
      <div 
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full filter blur-2xl opacity-5 pointer-events-none"
        style={{ backgroundColor: model.color }}
      />

      {/* Card Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: model.color }} />
            <div>
              <h3 className="text-xs font-mono font-bold text-slate-100">{model.name}</h3>
              <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">{model.provider}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-brand-cyan bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-semibold">
            {model.category}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-3">
          {model.description}
        </p>
      </div>

      {/* Metrics Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-brand-border/40 text-[10px] font-mono">
        
        {/* Latency bar */}
        <div className="space-y-1 col-span-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Average Latency</span>
            <span className="text-slate-300 font-bold">{model.metrics.latencyMs}ms</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[#0a0a0f] rounded-full overflow-hidden border border-brand-border/40">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: model.color,
                width: `${Math.min(100, Math.max(10, (1 - (model.metrics.latencyMs / 4000)) * 100))}%`
              }}
            />
          </div>
        </div>

        {/* Success rate */}
        <div className="p-2.5 bg-[#0a0a0f] rounded-lg border border-brand-border/40 flex flex-col justify-between">
          <span className="text-slate-500 flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-400" /> Success</span>
          <span className="text-xs font-bold text-slate-200 mt-1">{formatSuccess(model.metrics.successRate)}</span>
        </div>

        {/* Total requests */}
        <div className="p-2.5 bg-[#0a0a0f] rounded-lg border border-brand-border/40 flex flex-col justify-between">
          <span className="text-slate-500 flex items-center gap-1"><Layers className="w-3 h-3 text-brand-purple" /> Requests</span>
          <span className="text-xs font-bold text-slate-200 mt-1">{model.metrics.totalRequests}</span>
        </div>

        {/* Intelligence score */}
        <div className="p-2.5 bg-[#0a0a0f] rounded-lg border border-brand-border/40 flex items-center justify-between col-span-2 text-slate-400">
          <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" /> Intelligence Index</span>
          <span className="text-amber-400 font-bold font-sans tracking-widest">{getScoreStars(model.metrics.intelligenceScore)}</span>
        </div>

        {/* Cost & Rating footer */}
        <div className="flex items-center justify-between col-span-2 mt-1 text-[9px] text-slate-500 font-bold">
          <span>Cost Efficiency: {model.metrics.costScore}/10</span>
          <span className="text-slate-400">Node Score: {model.metrics.evalRating}/5.0</span>
        </div>

      </div>

    </div>
  );
}
export default ModelCard;
