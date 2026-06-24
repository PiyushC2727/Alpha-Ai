import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { X, Key, Terminal, Brain, HelpCircle, Save, Trash, Github, ShieldAlert, Check, Loader2 } from "lucide-react";
import { ChatMode, ModelId } from "../../types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { state, dispatch, addToast } = useApp();
  const [keyInput, setKeyInput] = useState(state.openRouterKey);
  const [testingKey, setTestingKey] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(() => {
    const saved = localStorage.getItem("alpha_ai_memory_enabled");
    return saved !== "false"; // default true
  });

  if (!isOpen) return null;

  const handleSaveKey = () => {
    dispatch({ type: "SET_OPENROUTER_KEY", key: keyInput });
    addToast("OpenRouter API Credentials saved!", "success");
  };

  const handleTestConnection = async () => {
    if (!keyInput.trim()) {
      addToast("Please enter an API Key first.", "error");
      return;
    }
    setTestingKey(true);
    addToast("Testing connection with OpenRouter servers...", "info");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${keyInput.trim()}`,
        }
      });
      if (response.ok) {
        addToast("OpenRouter API Connection verified! Core online.", "success");
      } else {
        addToast("API key returned unauthorized. Please check key validity.", "error");
      }
    } catch (err) {
      addToast("Failed to establish server connection.", "error");
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveSystemPrompt = (prompt: string) => {
    dispatch({ type: "SET_SYSTEM_PROMPT", prompt });
  };

  const handleToggleMemory = () => {
    const nextState = !memoryEnabled;
    setMemoryEnabled(nextState);
    localStorage.setItem("alpha_ai_memory_enabled", String(nextState));
    addToast(nextState ? "Memory learning engine enabled." : "Memory learning paused.", "info");
  };

  const handleRemoveMemory = (memory: string) => {
    dispatch({ type: "REMOVE_MEMORY", memory });
    addToast("Removed preference from AI memories.", "success");
  };

  const handleClearAllMemories = () => {
    if (confirm("Are you sure you want to purge all active AI memories? This action is irreversible.")) {
      dispatch({ type: "CLEAR_ALL_MEMORIES" });
      addToast("AI memories completely wiped clean.", "success");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Slide over */}
      <div className="relative w-full max-w-md h-full bg-bg-surface border-l border-border-subtle shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent-primary" />
            <span className="font-bold text-sm text-text-primary">OS Control Panel</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-elevated text-text-secondary hover:text-text-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto">
          {/* Section 1: API Config */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-accent-primary" />
              <span>API Integrations</span>
            </div>
            
            <div className="bg-bg-base/40 border border-zinc-850 rounded-xl p-3.5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-text-secondary uppercase">OpenRouter Access Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="flex-1 bg-bg-base border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleTestConnection}
                  disabled={testingKey}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border-subtle bg-bg-base hover:bg-bg-elevated text-[11px] text-text-secondary hover:text-text-primary transition-all font-mono cursor-pointer"
                >
                  {testingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin-fast" /> : <Terminal className="w-3.5 h-3.5 text-accent-primary" />}
                  <span>Test Connection</span>
                </button>
                
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-green-brand bg-green-brand/5 border border-green-brand/10 px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-brand animate-pulse-slow" />
                  <span>Gemini: Cloud Connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cognitive System Instructions */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-cyan-brand" />
              <span>Behavior & Instructions</span>
            </div>

            <div className="bg-bg-base/40 border border-zinc-850 rounded-xl p-3.5 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono text-text-secondary uppercase">System Prompts Override</label>
                  <span className="text-[9px] text-text-muted font-mono">Applies globally</span>
                </div>
                <textarea
                  value={state.systemPrompt}
                  onChange={(e) => handleSaveSystemPrompt(e.target.value)}
                  placeholder="Insert custom global cognitive instructions..."
                  rows={4}
                  className="w-full bg-bg-base border border-border-subtle rounded-lg p-2.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-sans leading-relaxed resize-none"
                />
              </div>

              {/* Default setup settings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-text-muted uppercase">Default Mode</label>
                  <select
                    value={state.mode}
                    onChange={(e) => dispatch({ type: "SET_MODE", mode: e.target.value as ChatMode })}
                    className="bg-bg-base border border-border-subtle text-text-secondary rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
                  >
                    <option value="auto">AUTO</option>
                    <option value="direct">DIRECT</option>
                    <option value="compare">COMPARE</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-text-muted uppercase">Default Model</label>
                  <select
                    value={state.activeModelId}
                    onChange={(e) => dispatch({ type: "SET_ACTIVE_MODEL", modelId: e.target.value as ModelId })}
                    className="bg-bg-base border border-border-subtle text-text-secondary rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
                  >
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Claude 3.5">Claude 3.5</option>
                    <option value="Gemini 2.5">Gemini 2.5</option>
                    <option value="DeepSeek R1">DeepSeek R1</option>
                    <option value="Grok 2">Grok 2</option>
                    <option value="Perplexity">Perplexity</option>
                    <option value="Gemini Nano">Gemini Nano</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Learned preference memory */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-red-brand" />
              <span>Preference Memory Engine</span>
            </div>

            <div className="bg-bg-base/40 border border-zinc-850 rounded-xl p-3.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-text-primary">Enable Memory Learning</span>
                  <span className="text-[9px] text-text-muted leading-tight">Extract preferences from text</span>
                </div>
                {/* Toggle Switche */}
                <button
                  onClick={handleToggleMemory}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${memoryEnabled ? "bg-accent-primary" : "bg-zinc-800"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${memoryEnabled ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>

              {/* Memories List */}
              {state.memories.length > 0 ? (
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {state.memories.map((mem, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-bg-base border border-zinc-900 text-[10.5px] font-mono text-text-secondary">
                      <span className="truncate flex-1">🧠 {mem}</span>
                      <button
                        onClick={() => handleRemoveMemory(mem)}
                        className="p-1 rounded text-text-muted hover:text-red-brand hover:bg-zinc-800 cursor-pointer transition-all"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-zinc-900 rounded-lg text-[10px] font-mono text-text-muted">
                  No memories recorded yet. Ask Alpha AI to remember specific preferences!
                </div>
              )}

              {state.memories.length > 0 && (
                <button
                  onClick={handleClearAllMemories}
                  className="w-full py-1.5 rounded-lg border border-red-brand/20 bg-red-brand/5 hover:bg-red-brand/10 text-red-brand text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Purge Memory Database
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-bg-surface border-t border-zinc-900 text-[10px] font-mono text-text-muted flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span>Alpha OS Unified Engine</span>
            <span>Version 2.5.0-Release</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 hover:text-text-primary cursor-pointer">
              <Github className="w-3.5 h-3.5" />
              <a href="https://github.com/PiyushC2727/Alpha-Ai" target="_blank" rel="noopener noreferrer">Source Repository</a>
            </div>
            <span>DeepMind Hub API</span>
          </div>
        </div>
      </div>
    </div>
  );
};
