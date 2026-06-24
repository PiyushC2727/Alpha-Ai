import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Search, Trash2, MessageSquare, Image, BarChart2, Brain, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { Conversation } from "../../types";

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const { state, dispatch, addToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const activePath = location.pathname;

  // Filter conversations by search term
  const filteredConversations = state.conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group conversations by date relative to now
  const groupConversations = (convs: Conversation[]) => {
    const groups: Record<string, Conversation[]> = {
      Today: [],
      Yesterday: [],
      "Last 7 Days": [],
      Older: [],
    };

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfSevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    convs.forEach((conv) => {
      const date = new Date(conv.createdAt);
      if (date >= startOfToday) {
        groups["Today"].push(conv);
      } else if (date >= startOfYesterday) {
        groups["Yesterday"].push(conv);
      } else if (date >= startOfSevenDaysAgo) {
        groups["Last 7 Days"].push(conv);
      } else {
        groups["Older"].push(conv);
      }
    });

    return groups;
  };

  const grouped = groupConversations(filteredConversations);

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substring(2, 11);
    dispatch({ type: "NEW_CONVERSATION", id: newId });
    navigate("/");
    addToast("Started a new cognitive session", "info");
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "DELETE_CONVERSATION", id });
    addToast("Deleted conversation from memory", "success");
  };

  const handleSelectConversation = (id: string) => {
    dispatch({ type: "LOAD_CONVERSATION", id });
    navigate("/");
  };

  if (!state.sidebarOpen) {
    return (
      <div className="w-12 h-full bg-bg-surface border-r border-border-subtle flex flex-col items-center py-4 justify-between transition-all">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-hover cursor-pointer"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className={`p-2 rounded-lg cursor-pointer ${activePath === "/" ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:text-text-secondary"}`}
            title="Chat Page"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/image")}
            className={`p-2 rounded-lg cursor-pointer ${activePath === "/image" ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:text-text-secondary"}`}
            title="Image Studio"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className={`p-2 rounded-lg cursor-pointer ${activePath === "/dashboard" ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:text-text-secondary"}`}
            title="Performance Dashboard"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
          <div className="w-6 h-px bg-zinc-800" />
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-text-muted hover:text-text-secondary cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[260px] h-full bg-bg-surface border-r border-border-subtle flex flex-col justify-between transition-all select-none">
      {/* Top Brand Header & Collapse button */}
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-primary to-cyan-brand flex items-center justify-center font-bold text-sm text-white">
              Α
            </div>
            <span className="font-bold tracking-tight text-sm text-text-primary">Alpha AI OS</span>
          </div>
          <button
            onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
            className="p-1 rounded-md hover:bg-bg-elevated text-text-secondary cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat full width */}
        <button
          onClick={handleNewChat}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-accent-primary/15 hover:translate-y-[-1px] active:translate-y-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search threads..."
            className="w-full bg-bg-base border border-border-subtle rounded-lg py-1.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-colors font-sans"
          />
        </div>
      </div>

      {/* Scrollable Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-4">
        {Object.entries(grouped).map(([groupName, convs]) => {
          if (convs.length === 0) return null;
          return (
            <div key={groupName} className="flex flex-col gap-1">
              <span className="px-3 text-[9px] font-bold font-mono text-text-muted uppercase tracking-wider">
                {groupName}
              </span>
              <div className="flex flex-col">
                {convs.map((conv) => {
                  const isActive = conv.id === state.activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`group/item flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-accent-primary/10 text-accent-primary font-semibold"
                          : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        <span className="truncate max-w-[160px]">{conv.title}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(conv.id, e)}
                        className="p-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-zinc-800 text-text-muted hover:text-red-brand transition-all cursor-pointer"
                        title="Delete Thread"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Nav Section */}
      <div className="flex flex-col p-2 bg-bg-surface/50 border-t border-zinc-900 gap-1.5">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activePath === "/" ? "bg-accent-primary/10 text-accent-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Chat Assistant</span>
          </button>
          <button
            onClick={() => navigate("/image")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activePath === "/image" ? "bg-accent-primary/10 text-accent-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            <Image className="w-4 h-4 shrink-0" />
            <span>Image Studio</span>
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              activePath === "/dashboard" ? "bg-accent-primary/10 text-accent-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            }`}
          >
            <BarChart2 className="w-4 h-4 shrink-0" />
            <span>Performance Lab</span>
          </button>
        </div>

        <div className="h-px bg-zinc-900 my-1" />

        {/* Memory status and settings */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-text-secondary">
            <Brain className="w-3.5 h-3.5 text-red-brand" />
            <span>{state.memories.length} preferences learned</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Settings Dashboard"
          >
            <Settings className="w-4 h-4 animate-spin-hover" />
          </button>
        </div>
      </div>
    </div>
  );
};
