import React, { useState } from 'react';
import { Trash2, Plus, BrainCircuit, ShieldAlert, Sparkles, User, Tag } from 'lucide-react';
import { Memory } from '../types';

interface MemoryTabProps {
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
}

export default function MemoryTab({ memories, setMemories }: MemoryTabProps) {
  const [newContent, setNewContent] = useState('');
  const [category, setCategory] = useState<Memory['category']>('preference');

  const addMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const memory: Memory = {
      id: Math.random().toString(36).substring(2, 9),
      content: newContent.trim(),
      category,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: '2-digit',
      }),
    };

    setMemories([memory, ...memories]);
    setNewContent('');
  };

  const removeMemory = (id: string) => {
    setMemories(memories.filter((m) => m.id !== id));
  };

  const getCategoryTheme = (cat: Memory['category']) => {
    switch (cat) {
      case 'preference':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
      case 'identity':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
      case 'project':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/30';
      case 'technical':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30';
      default:
        return 'bg-gray-100 text-gray-850 dark:bg-neutral-800 dark:text-neutral-400 border-gray-200 dark:border-neutral-800';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto max-h-[85vh] scrollbar-thin" id="memory-tab-wrapper">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-850 pb-3" id="memory-title-block">
        <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
        <h2 className="text-sm uppercase font-mono tracking-wider font-semibold text-gray-900 dark:text-neutral-100">
          Alpha OS Neural Memory Bank
        </h2>
      </div>

      {/* Mini Alert */}
      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/20 text-[11.5px] leading-relaxed text-indigo-700 dark:text-indigo-400" id="memory-brief-note">
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Long-Term System Context Injection</span>
        </div>
        Memories captured here are automatically injected into core orchestration boundaries. This ensures your customized developer preferences, project scopes, or system variables persist naturally across separate threads.
      </div>

      {/* Add Memory Form */}
      <form onSubmit={addMemory} className="flex flex-col gap-3 p-3 bg-neutral-55 dark:bg-neutral-900/40 rounded-xl border border-gray-150 dark:border-neutral-800" id="add-memory-form">
        <span className="text-[10px] uppercase font-mono text-gray-400">
          Capture New Fact
        </span>
        <textarea
          placeholder="e.g., 'Primary stack is React 19, TypeScript, and TailwindCSS' or 'Prefer concise explanations without boilerplate'"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          className="w-full text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-neutral-100 h-18 resize-none shadow-inner"
          aria-label="New Memory Content"
          id="memory-textarea-input"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Memory['category'])}
              className="text-xs font-mono bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded py-1 px-1.5 text-gray-600 dark:text-neutral-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label="Memory Category selection"
              id="memory-category-select"
            >
              <option value="preference">Preference</option>
              <option value="identity">Identity</option>
              <option value="project">Project Specs</option>
              <option value="technical">Technical Specs</option>
              <option value="other">Other Info</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            id="save-memory-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            Inscribe
          </button>
        </div>
      </form>

      {/* Memory List */}
      <div className="flex flex-col gap-2.5" id="memories-container">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono font-medium text-gray-500 dark:text-neutral-400">
            ACTIVE SYSTEM INSCRIPTIONS ({memories.length})
          </label>
        </div>

        {memories.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400" id="empty-memory-view">
            No active memories. Inscribe one above to begin seeding permanent context.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1" id="memory-list">
            {memories.map((m) => (
              <div
                key={m.id}
                className="group relative p-3 rounded-xl border border-gray-150 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-indigo-200 dark:hover:border-indigo-950/60 shadow-sm hover:shadow transition-all"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex flex-col gap-1.5 leading-relaxed text-xs text-gray-800 dark:text-neutral-300">
                    <p className="font-sans pr-4">{m.content}</p>
                    {m.isAutoInferred && m.inferredReason && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono italic">
                        Inference: {m.inferredReason}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getCategoryTheme(m.category)}`}>
                        {m.category}
                      </span>
                      {m.isAutoInferred && (
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30 font-bold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" /> Auto-Inferred
                        </span>
                      )}
                      <span className="text-[9px] text-neutral-400 font-mono">
                        {m.createdAt}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMemory(m.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all absolute right-2 top-2 cursor-pointer"
                    title="Delete Memory"
                    aria-label="Delete Memory item"
                    id={`delete-memory-${m.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
