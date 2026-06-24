import React from 'react';
import { Menu, Activity, Cpu, Network, ShieldCheck, Zap } from 'lucide-react';
import { RouterConfig } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  config: RouterConfig;
  isGenerating: boolean;
  activeModels: string[];
  latency: number | null;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  config,
  isGenerating,
  activeModels,
  latency,
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-[#1F1F1F] bg-[#FAFAFA]/95 dark:bg-[#0A0A0A]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40" id="alpha-header">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 -ml-1 rounded hover:bg-gray-200/50 dark:hover:bg-[#1A1A1A] text-gray-500 dark:text-[#A3A3A3] transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
          id="toggle-sidebar-btn"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="absolute w-3.5 h-3.5 bg-emerald-500/20 rounded-full animate-ping pointer-events-none"></span>
          </div>
          <span className="font-sans font-semibold text-sm tracking-tight text-gray-900 dark:text-white">
            Alpha OS
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest px-1 py-0.2 bg-gray-200/50 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#737373] rounded">
            v1.2.0
          </span>
        </div>
      </div>

      {/* Center status: Dynamic Router status indicators in clean blocks */}
      <div className="hidden md:flex items-center gap-6 text-xs h-full" id="router-status-indicator">
        <div className="flex items-center gap-1 text-gray-400 dark:text-[#737373] font-mono text-[10.5px]">
          <Activity className="w-3 h-3 text-gray-400 dark:text-[#737373]" />
          <span>Active Nodes:</span>
        </div>
        <div className="flex items-center gap-4">
          {[
            { name: 'Claude 3.5', text: 'Claude 3.5', char: 'C', bg: 'bg-[#D97706]' },
            { name: 'GPT-4o', text: 'GPT-4o', char: 'G', bg: 'bg-[#10B981]' },
            { name: 'Gemini 2.5', text: 'Gemini 2.5', char: 'G', bg: 'bg-[#8B5CF6]' },
            { name: 'DeepSeek R1', text: 'DeepSeek R1', char: 'D', bg: 'bg-[#3b82f6]' },
            { name: 'Grok 2', text: 'Grok 2', char: 'G', bg: 'bg-[#8b5cf6]' },
            { name: 'Perplexity', text: 'Perplexity', char: 'P', bg: 'bg-[#14B8A6]' },
          ].map((node) => {
            const isSelected = config.selectedModels.includes(node.name);
            const isActiveGenerating = isGenerating && activeModels.includes(node.name);

            return (
              <div
                key={node.name}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  isSelected ? 'opacity-100' : 'opacity-40 line-through'
                }`}
                id={`model-badge-${node.name.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`w-4 h-4 rounded-sm ${node.bg} flex items-center justify-center text-[9px] font-bold text-white shadow-sm ${isActiveGenerating ? 'animate-pulse scale-110' : ''}`}>
                  {node.char}
                </div>
                <span className={`text-[11px] font-sans ${isSelected ? 'text-gray-800 dark:text-white font-medium' : 'text-gray-400 dark:text-[#737373]'}`}>
                  {node.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Active configuration mode and latency status */}
      <div className="flex items-center gap-3">
        {config.openRouterKey && config.openRouterKey.trim() !== "" && (
          <div className="flex items-center gap-1 text-[10px] font-mono text-amber-500 bg-amber-550/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-md px-2 py-0.5 select-none" id="openrouter-badge">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="hidden sm:inline font-semibold tracking-wider text-[9px]">OPENROUTER LIVE</span>
          </div>
        )}

        <div className="hidden lg:flex flex-col items-end text-right font-mono text-[10px]">
          <div className="flex items-center gap-1 text-gray-400 dark:text-[#A3A3A3]">
            <Cpu className="w-3 h-3 text-indigo-500" />
            <span>Mode: </span>
            <span className="font-semibold text-gray-850 dark:text-white uppercase tracking-wider">
              {config.mode}
            </span>
          </div>
          <div className="text-[9px] text-[#737373]">
            {latency ? `${latency}ms` : 'Ready to route'}
          </div>
        </div>

        <div className="px-2.5 py-1 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded text-xs text-gray-600 dark:text-[#A3A3A3] font-mono hover:text-gray-900 dark:hover:text-white transition-colors">
          Share
        </div>
      </div>
    </header>
  );
}
