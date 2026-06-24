import React from "react";

interface ModelBadgeProps {
  modelName: string;
}

export function ModelBadge({ modelName }: ModelBadgeProps) {
  // Claude=orange, GPT=green, Gemini=blue, DeepSeek=red, Grok=yellow, Perplexity=cyan, Gemini Nano=purple
  const getBadgeStyles = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes("claude")) {
      return {
        bg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
        label: "Claude 3.5"
      };
    }
    if (norm.includes("gpt")) {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        label: "GPT-4o"
      };
    }
    if (norm.includes("gemini 2") || norm.includes("gemini pro") || norm.includes("gemini 3")) {
      return {
        bg: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        label: "Gemini 2.5"
      };
    }
    if (norm.includes("nano")) {
      return {
        bg: "bg-purple-500/10 border-purple-500/20 text-purple-400",
        label: "Gemini Nano"
      };
    }
    if (norm.includes("deepseek") || norm.includes("r1")) {
      return {
        bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
        label: "DeepSeek R1"
      };
    }
    if (norm.includes("grok")) {
      return {
        bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
        label: "Grok 2"
      };
    }
    if (norm.includes("perplexity") || norm.includes("sonar")) {
      return {
        bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        label: "Perplexity"
      };
    }
    return {
      bg: "bg-slate-500/10 border-slate-500/20 text-slate-400",
      label: name
    };
  };

  const styles = getBadgeStyles(modelName);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono border ${styles.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {styles.label}
    </span>
  );
}
