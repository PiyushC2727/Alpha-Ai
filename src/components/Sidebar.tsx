import React, { useState } from 'react';
import {
  MessageSquare,
  BrainCircuit,
  Database,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { ChatSession, Memory, KnowledgeDoc, RouterConfig } from '../types';
import MemoryTab from './MemoryTab';
import KnowledgeBaseTab from './KnowledgeBaseTab';
import RouterSettingsTab from './RouterSettingsTab';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createNewSession: (mode?: 'direct' | 'compare' | 'orchestrated', modelId?: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
  knowledge: KnowledgeDoc[];
  setKnowledge: (knowledge: KnowledgeDoc[]) => void;
  config: RouterConfig;
  setConfig: (config: RouterConfig) => void;
  activeTab: 'chats' | 'memory' | 'knowledge' | 'settings' | 'imaging';
  setActiveTab: (tab: 'chats' | 'memory' | 'knowledge' | 'settings' | 'imaging') => void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  sessions,
  activeSessionId,
  setActiveSessionId,
  createNewSession,
  deleteSession,
  renameSession,
  memories,
  setMemories,
  knowledge,
  setKnowledge,
  config,
  setConfig,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const startRenameInput = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleValue(session.title);
  };

  const handleRenameSubmit = (id: string) => {
    if (editTitleValue.trim()) {
      renameSession(id, editTitleValue.trim());
    }
    setEditingSessionId(null);
  };

  return (
    <aside
      className={`relative h-full flex flex-col bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#262626] transition-all duration-300 z-50 ${
        isOpen ? 'w-80' : 'w-[56px]'
      }`}
      id="alpha-sidebar"
    >
      {/* Upper header section */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-150 dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]" id="sidebar-header-section">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-xs tracking-wider uppercase text-gray-800 dark:text-white">
              System Navigator
            </span>
          </div>
        ) : (
          <div className="mx-auto text-indigo-550 flex items-center justify-center">
            <span className="font-mono text-base font-bold">α</span>
          </div>
        )}

        {/* Collapse Button inside side panel */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden sm:flex p-1.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#1A1A1A] text-gray-500 dark:text-[#A3A3A3] transition-all cursor-pointer"
          aria-label={isOpen ? "Collapse Panel" : "Expand Panel"}
          id="collapse-sidebar-btn"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Tabs navigation rail */}
      <div className={`p-2 flex gap-1 bg-[#F5F5F5] dark:bg-[#0A0A0A] border-b border-gray-200 dark:border-[#262626] ${isOpen ? 'justify-between' : 'flex-col items-center'}`} id="sidebar-tabs-rail">
        {[
          { id: 'chats' as const, name: 'Threads', icon: MessageSquare },
          { id: 'imaging' as const, name: 'AI Studio', icon: ImageIcon },
          { id: 'memory' as const, name: 'Memory', icon: BrainCircuit },
          { id: 'knowledge' as const, name: 'Knowledge', icon: Database },
          { id: 'settings' as const, name: 'Router', icon: Sliders },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (!isOpen) setIsOpen(true); // Auto expand on click
              }}
              className={`p-2 rounded flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] text-gray-900 dark:text-white font-semibold shadow-sm'
                  : 'text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-[#A3A3A3] hover:bg-white/40 dark:hover:bg-[#1A1A1A]/40 border border-transparent'
              } ${isOpen ? 'flex-1 text-xs' : 'w-9 h-9'}`}
              title={tab.name}
              id={`tab-button-${tab.id}`}
              aria-label={tab.name}
            >
              <IconComp className="w-4 h-4" />
              {isOpen && <span className="truncate">{tab.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Active content panel section */}
      <div className="flex-1 overflow-hidden" id="sidebar-tab-content-container">
        {isOpen && (
          <div className="h-full">
            {activeTab === 'chats' && (
              <div className="h-full flex flex-col p-3 gap-3.5 focus-within:outline-none" id="chats-tab-pane">
                {/* Create Chat Session CTA */}
                <button
                  onClick={() => createNewSession()}
                  className="w-full bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-[#E5E5E5] text-white dark:text-black font-sans text-xs font-semibold py-2 px-4 rounded border border-neutral-300 dark:border-[#262626] flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
                  id="primary-new-chat-btn"
                >
                  <Plus className="w-4 h-4" />
                  New System Thread
                </button>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1 scrollbar-thin" id="threads-scroller-container">
                  <span className="text-[10px] uppercase font-mono text-gray-400 dark:text-[#525252] tracking-wider font-bold">
                    History ({sessions.length})
                  </span>

                  {sessions.length === 0 ? (
                    <div className="text-center py-10 text-xs text-neutral-400 font-sans" id="empty-threads-view">
                      No sessions yet. Initialize a secure orchestration thread.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {sessions.map((session) => {
                        const isSelected = activeSessionId === session.id;
                        const isEditingName = editingSessionId === session.id;

                        return (
                          <div
                            key={session.id}
                            onClick={() => !isEditingName && setActiveSessionId(session.id)}
                            className={`group relative p-2.5 rounded border flex items-center justify-between gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-100 dark:bg-[#1A1A1A] border-gray-300 dark:border-[#262626] text-gray-950 dark:text-white font-medium'
                                : 'bg-transparent hover:bg-gray-100/50 dark:hover:bg-[#1A1A1A]/30 border-transparent text-gray-600 dark:text-[#A3A3A3] hover:text-gray-900 dark:hover:text-white'
                            }`}
                            id={`thread-item-${session.id}`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-indigo-500' : 'text-gray-400'}`} />
                              
                              {isEditingName ? (
                                <input
                                  type="text"
                                  value={editTitleValue}
                                  onChange={(e) => setEditTitleValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit(session.id);
                                    if (e.key === 'Escape') setEditingSessionId(null);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full bg-white dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 text-xs text-gray-800 dark:text-white rounded py-0.5 px-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  autoFocus
                                  aria-label="Rename Thread title"
                                  id={`rename-input-${session.id}`}
                                />
                              ) : (
                                <span className="text-xs truncate font-sans tracking-tight">
                                  {session.title}
                                </span>
                              )}
                            </div>

                            {/* Hover Operations */}
                            {!isEditingName && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity pl-2">
                                <button
                                  onClick={(e) => startRenameInput(session, e)}
                                  className="p-1 rounded hover:bg-neutral-200/50 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-650 flex cursor-pointer"
                                  title="Rename Thread"
                                  aria-label="Rename Thread button"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSession(session.id);
                                  }}
                                  className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-400 hover:text-rose-500 flex cursor-pointer"
                                  title="Delete Thread"
                                  aria-label="Delete Thread button"
                                  id={`delete-session-${session.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            {isEditingName && (
                              <div className="flex items-center gap-0.5 pl-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameSubmit(session.id);
                                  }}
                                  className="p-0.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/35 dark:text-emerald-400 flex"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSessionId(null);
                                  }}
                                  className="p-0.5 rounded bg-gray-150 text-gray-650 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 flex"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <MemoryTab memories={memories} setMemories={setMemories} />
            )}

            {activeTab === 'knowledge' && (
              <KnowledgeBaseTab knowledge={knowledge} setKnowledge={setKnowledge} />
            )}

            {activeTab === 'settings' && (
              <RouterSettingsTab config={config} setConfig={setConfig} />
            )}

            {activeTab === 'imaging' && (
              <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-[85vh] scrollbar-thin" id="imaging-sidebar-tab">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-850 pb-3">
                  <ImageIcon className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <h2 className="text-xs uppercase font-mono tracking-wider font-semibold text-gray-900 dark:text-neutral-100">
                    Creative Sandbox
                  </h2>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/20 text-[11px] leading-relaxed text-indigo-750 dark:text-indigo-400">
                  <span className="font-semibold block mb-1">💡 Pro Prompting Techniques</span>
                  To produce spectacular results, try structuring prompts with specific visual properties:
                  <ul className="list-disc pl-4 mt-1.5 space-y-1">
                    <li><strong>Subject</strong>: Clear focal element (e.g. 'A tiny golden hummingbird')</li>
                    <li><strong>Setting</strong>: Surrounding environment (e.g. 'inside a deep neon conservatory')</li>
                    <li><strong>Lighting</strong>: Atmospheric details (e.g. 'warm dramatic sunbeams')</li>
                    <li><strong>Composition</strong>: Camera angles (e.g. 'close-up shot, shallow depth of field')</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Closed/Collapsed Mini Rail View */}
        {!isOpen && (
          <div className="h-full flex flex-col items-center py-4 gap-4" id="collapsed-sidebar-icons-rail">
            <button
              onClick={() => createNewSession()}
              className="w-8 h-8 rounded-full bg-indigo-554 text-white hover:bg-indigo-600 flex items-center justify-center transition-all shadow cursor-pointer active:scale-95"
              title="Create New System Thread"
              id="collapsed-new-session-btn"
            >
              <Plus className="w-4 h-4" />
            </button>
            <div className="w-6 h-0.5 border-b border-gray-100 dark:border-neutral-850" />
            
            <div className="flex-1 flex flex-col gap-2.5">
              {sessions.map((session) => {
                const isSelected = activeSessionId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/20 border-indigo-550 text-indigo-550 dark:bg-indigo-950/20 dark:text-indigo-400'
                        : 'bg-white border-gray-200 text-gray-405 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-500 hover:border-gray-300'
                    }`}
                    title={session.title}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
