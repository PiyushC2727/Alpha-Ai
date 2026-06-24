import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, ArrowUp, X, Loader2, RefreshCw } from "lucide-react";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { ChatMode, ModelId } from "../../types";
import { useApp } from "../../context/AppContext";

interface InputBarProps {
  onSendMessage: (text: string, file: File | null) => void;
  isStreaming: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isStreaming }) => {
  const { state, dispatch, addToast } = useApp();
  const [inputText, setInputText] = useState("");
  const [fileAttachment, setFileAttachment] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [compareDropdownOpen, setCompareDropdownOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableModels: ModelId[] = [
    "GPT-4o",
    "Claude 3.5",
    "Gemini 2.5",
    "DeepSeek R1",
    "Grok 2",
    "Perplexity",
    "Gemini Nano"
  ];

  // Adjust textarea height automatically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 180); // cap around 8 rows
    textarea.style.height = `${newHeight}px`;
  }, [inputText]);

  // Voice inputs hook
  const { isListening, startListening, stopListening, isSupported: isVoiceSupported } = useVoiceInput(
    (transcript) => {
      setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  );

  // File Picker change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast("File size must be under 10MB.", "error");
        return;
      }
      setFileAttachment(file);
      if (file.type.startsWith("image/")) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const removeAttachment = () => {
    setFileAttachment(null);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Clipboard paste image
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/") || item.type === "application/pdf") {
        const file = item.getAsFile();
        if (file) {
          setFileAttachment(file);
          if (file.type.startsWith("image/")) {
            setFilePreviewUrl(URL.createObjectURL(file));
          }
          addToast("File attachment pasted from clipboard!", "success");
        }
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) return;
    if (!inputText.trim() && !fileAttachment) return;

    onSendMessage(inputText, fileAttachment);
    setInputText("");
    removeAttachment();
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Mode cycle helper
  const handleCycleMode = () => {
    if (state.mode === "auto") {
      dispatch({ type: "SET_MODE", mode: "direct" });
      addToast("Switched to Direct Core chat", "info");
    } else if (state.mode === "direct") {
      dispatch({ type: "SET_MODE", mode: "compare" });
      addToast("Switched to Multi-Model Comparison Match", "info");
    } else {
      dispatch({ type: "SET_MODE", mode: "auto" });
      addToast("Switched to Auto-routed cognitive orchestrator", "info");
    }
  };

  const toggleCompareModelSelection = (model: ModelId) => {
    const current = state.compareModels;
    if (current.includes(model)) {
      if (current.length <= 1) {
        addToast("Must select at least 1 model for comparison.", "error");
        return;
      }
      dispatch({ type: "SET_COMPARE_MODELS", models: current.filter((m) => m !== model) });
    } else {
      dispatch({ type: "SET_COMPARE_MODELS", models: [...current, model] });
    }
  };

  // Determine placeholder by mode
  let placeholder = "Ask anything — Alpha AI picks the best model...";
  if (state.mode === "direct") {
    placeholder = `Chatting directly with ${state.activeModelId}...`;
  } else if (state.mode === "compare") {
    placeholder = `Compare outputs across: ${state.compareModels.join(", ")}...`;
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 w-full max-w-4xl mx-auto px-4 pb-6">
      {/* File attachment preview row */}
      {fileAttachment && (
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg self-start text-xs text-text-secondary">
          {filePreviewUrl ? (
            <img src={filePreviewUrl} alt="Thumbnail preview" className="w-8 h-8 object-cover rounded border border-zinc-800" referrerPolicy="no-referrer" />
          ) : (
            <Paperclip className="w-4 h-4 text-cyan-brand" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-text-primary max-w-[150px] truncate">{fileAttachment.name}</span>
            <span className="text-[10px] text-text-muted font-mono uppercase">{fileAttachment.type.split("/")[1] || "Document"}</span>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="p-1 rounded-full bg-zinc-800 hover:bg-zinc-700 hover:text-red-brand transition-colors cursor-pointer ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main input assembly */}
      <div className="relative flex items-end gap-2 bg-bg-surface border border-border-subtle hover:border-zinc-700 focus-within:border-accent-primary focus-within:shadow-[0_0_12px_rgba(139,92,246,0.1)] rounded-2xl p-2 transition-all">
        {/* left trigger: [AttachFile] */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Attach document/image"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,application/pdf"
          className="hidden"
        />

        {/* grows auto text area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-0 text-text-primary placeholder:text-text-muted text-[13.5px] py-2.5 px-1 focus:outline-none focus:ring-0 resize-none max-h-40 min-h-[36px]"
          rows={1}
          maxLength={4000}
        />

        {/* Char count when > 500 characters */}
        {inputText.length > 500 && (
          <span className="text-[9px] font-mono text-text-muted absolute bottom-14 right-4 bg-bg-base/80 px-1.5 py-0.5 rounded border border-zinc-900">
            {inputText.length} / 4000
          </span>
        )}

        {/* Voice dictation button */}
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
            isListening
              ? "bg-red-brand/10 text-red-brand hover:bg-red-brand/20 animate-pulse-slow"
              : "hover:bg-bg-elevated text-text-secondary hover:text-text-primary"
          }`}
          title={isVoiceSupported ? (isListening ? "Stop listening" : "Dictate query") : "Voice inputs unsupported"}
          disabled={!isVoiceSupported}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Mode switcher trigger and panel inline */}
        <div className="relative">
          <button
            type="button"
            onClick={handleCycleMode}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              state.mode === "auto"
                ? "bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                : state.mode === "direct"
                ? "bg-cyan-brand/10 text-cyan-brand hover:bg-cyan-brand/20"
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
            }`}
          >
            {state.mode}
          </button>

          {/* Model selector context link (visible when mode is direct or compare) */}
          {state.mode === "direct" && (
            <button
              type="button"
              onClick={() => {
                setModelDropdownOpen(!modelDropdownOpen);
                setCompareDropdownOpen(false);
              }}
              className="absolute bottom-11 right-0 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-text-secondary hover:text-text-primary hover:border-zinc-700 whitespace-nowrap cursor-pointer"
            >
              Core: {state.activeModelId}
            </button>
          )}

          {state.mode === "compare" && (
            <button
              type="button"
              onClick={() => {
                setCompareDropdownOpen(!compareDropdownOpen);
                setModelDropdownOpen(false);
              }}
              className="absolute bottom-11 right-0 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-text-secondary hover:text-text-primary hover:border-zinc-700 whitespace-nowrap cursor-pointer"
            >
              Comparing {state.compareModels.length} cores
            </button>
          )}

          {/* Direct Mode Dropdown */}
          {state.mode === "direct" && modelDropdownOpen && (
            <div className="absolute bottom-11 right-0 z-50 w-44 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1 flex flex-col">
              <span className="text-[9px] font-bold font-mono text-text-muted px-2 py-1.5 uppercase tracking-wider">Select Model Node</span>
              {availableModels.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => {
                    dispatch({ type: "SET_ACTIVE_MODEL", modelId: model });
                    setModelDropdownOpen(false);
                    addToast(`Routed directly to ${model}`, "success");
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-mono text-[11px] cursor-pointer transition-colors ${
                    state.activeModelId === model
                      ? "bg-cyan-brand/10 text-cyan-brand font-semibold"
                      : "text-text-secondary hover:bg-zinc-900"
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}

          {/* Compare Mode Checkboxes Dropdown */}
          {state.mode === "compare" && compareDropdownOpen && (
            <div className="absolute bottom-11 right-0 z-50 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl overflow-hidden p-1 flex flex-col">
              <span className="text-[9px] font-bold font-mono text-text-muted px-2 py-1.5 uppercase tracking-wider">Configure Match</span>
              {availableModels.map((model) => {
                const isChecked = state.compareModels.includes(model);
                return (
                  <label
                    key={model}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 font-mono text-[11px] text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCompareModelSelection(model)}
                      className="accent-accent-primary w-3.5 h-3.5 rounded border-zinc-800 bg-bg-base"
                    />
                    <span>{model}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* send triggers */}
        <button
          type="submit"
          disabled={isStreaming || (!inputText.trim() && !fileAttachment)}
          className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
            isStreaming
              ? "bg-bg-elevated text-text-muted"
              : "bg-accent-primary hover:bg-accent-hover text-white shadow-md shadow-accent-primary/20 hover:scale-105 active:scale-95"
          }`}
          title="Send query"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin-fast" /> : <ArrowUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Voice indicator prompt block */}
      {isListening && (
        <div className="text-center text-[11px] font-mono text-red-brand animate-pulse-slow">
          🎙️ Dictation active. Speak clearly to compile into input buffer...
        </div>
      )}
    </form>
  );
};
