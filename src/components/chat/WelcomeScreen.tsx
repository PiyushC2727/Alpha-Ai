import React from "react";
import { Zap, Image, FileText, Shuffle, Mic, Brain } from "lucide-react";

interface WelcomeScreenProps {
  onSelectSuggestion: (text: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectSuggestion }) => {
  const suggestions = [
    "Write a Python web scraper",
    "Explain quantum entanglement",
    "Compare investment strategies",
    "Design a logo concept",
  ];

  const capabilities = [
    { icon: <Zap className="w-3.5 h-3.5 text-accent-primary" />, label: "Auto-routing" },
    { icon: <Image className="w-3.5 h-3.5 text-cyan-brand" />, label: "Image Gen" },
    { icon: <FileText className="w-3.5 h-3.5 text-green-brand" />, label: "File Analysis" },
    { icon: <Shuffle className="w-3.5 h-3.5 text-purple-400" />, label: "Compare Models" },
    { icon: <Mic className="w-3.5 h-3.5 text-amber-400" />, label: "Voice Input" },
    { icon: <Brain className="w-3.5 h-3.5 text-red-brand" />, label: "Memory" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto text-center flex-1 h-full animate-fade-slide-up">
      {/* Visual Launcher Logo */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-tr from-accent-primary to-cyan-brand rounded-3xl blur-2xl opacity-20 animate-pulse-slow" />
        <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center bg-gradient-to-tr from-accent-primary/25 to-cyan-brand/10 shadow-2xl">
          <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-accent-primary to-cyan-brand bg-clip-text text-transparent">
            Α
          </span>
        </div>
      </div>

      {/* Hero Headings */}
      <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2 font-sans">
        Alpha AI
      </h1>
      <p className="text-sm text-text-secondary font-medium tracking-wide mb-8">
        One interface. Every AI model.
      </p>

      {/* Suggestion Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-10">
        {suggestions.map((text, idx) => (
          <button
            key={idx}
            onClick={() => onSelectSuggestion(text)}
            className="flex items-center justify-between text-left px-4 py-3 rounded-xl border border-zinc-800 bg-bg-surface/30 hover:bg-bg-surface text-xs font-medium text-text-secondary hover:text-text-primary hover:border-zinc-700 transition-all cursor-pointer shadow-sm hover:translate-y-[-1px] active:translate-y-0"
          >
            <span>{text}</span>
            <span className="text-[10px] text-accent-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              Send →
            </span>
          </button>
        ))}
      </div>

      {/* Capabilities Footer */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
          Operational Core Capabilities
        </span>
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {capabilities.map((cap, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/40 text-[11px] font-mono text-text-secondary"
            >
              {cap.icon}
              <span>{cap.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
