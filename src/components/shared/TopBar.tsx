import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Menu, Settings, Download, FileText, Printer, ChevronDown } from "lucide-react";

interface TopBarProps {
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSettings }) => {
  const { state, dispatch, addToast } = useApp();
  const [exportOpen, setExportOpen] = useState(false);

  const activeConv = state.conversations.find((c) => c.id === state.activeConversationId) || null;

  const handleExportMarkdown = () => {
    if (!activeConv) {
      addToast("No active conversation to export.", "error");
      return;
    }
    const dateStr = activeConv.createdAt.toLocaleDateString();
    let md = `---
title: ${activeConv.title}
date: ${dateStr}
engine: Alpha AI Unified Router (Mode: ${state.mode})
---

# ${activeConv.title}
*Date Compiled: ${dateStr}*

`;

    activeConv.messages.forEach((msg) => {
      const roleName = msg.role === "user" ? "USER" : "ASSISTANT";
      const modelInfo = msg.modelUsed ? ` (Model: ${msg.modelUsed.join(", ")})` : "";
      md += `### 👤 ${roleName}${modelInfo}\n\n${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Clean download file name
    const cleanTitle = activeConv.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 30);
    link.download = `alpha-ai-${new Date().toISOString().slice(0, 10)}-${cleanTitle}.md`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportOpen(false);
    addToast("Markdown compilation downloaded successfully!", "success");
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    addToast("Preparing print compilation...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-4 select-none shrink-0 z-30">
      {/* Left section: Hamburger & Current title */}
      <div className="flex items-center gap-3 min-w-0">
        {!state.sidebarOpen && (
          <button
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary cursor-pointer"
            title="Expand Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-sm font-semibold text-text-primary truncate max-w-[200px] md:max-w-md font-sans">
          {activeConv ? activeConv.title : "Cognitive Core Studio"}
        </h2>
      </div>

      {/* Center: mode indicator badge */}
      <div className="hidden sm:flex items-center gap-1">
        <div className="px-3 py-1 bg-bg-base border border-border-subtle rounded-full flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary"></span>
          </span>
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-text-secondary">
            {state.mode === "auto" ? "⚡ Auto-router Core" : state.mode === "direct" ? `🎯 Direct Core (${state.activeModelId})` : "🔄 Comparisons Hub"}
          </span>
        </div>
      </div>

      {/* Right Section: Export & Settings */}
      <div className="flex items-center gap-1.5 relative">
        {/* Export Trigger */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            disabled={!activeConv}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium font-mono border transition-all cursor-pointer ${
              activeConv
                ? "bg-bg-surface hover:bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
                : "opacity-40 text-text-muted border-zinc-900 cursor-not-allowed"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
            <ChevronDown className="w-3 h-3 shrink-0" />
          </button>

          {/* Export Dropdown */}
          {exportOpen && (
            <div className="absolute right-0 mt-1.5 z-50 w-44 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1 flex flex-col">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium text-text-secondary hover:bg-zinc-900 hover:text-text-primary cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-accent-primary" />
                <span>Export as Markdown</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium text-text-secondary hover:bg-zinc-900 hover:text-text-primary cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-brand" />
                <span>Print or Save PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Settings gear */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary border border-border-subtle transition-colors cursor-pointer"
          title="Open Control Panel"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
