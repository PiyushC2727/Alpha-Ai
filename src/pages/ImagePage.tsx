import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Wand2, Sparkles, Image as ImageIcon, Download, RotateCw, Send, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface ImageHistoryItem {
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  isSimulated: boolean;
  timestamp: Date;
}

export const ImagePage: React.FC = () => {
  const { dispatch, addToast } = useApp();
  const navigate = useNavigate();

  // Control Form State
  const [promptText, setPromptText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seed, setSeed] = useState("");
  
  // Collapse toggles
  const [negOpen, setNegOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);

  // Loading & Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [activeImage, setActiveImage] = useState<ImageHistoryItem | null>(null);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);

  // Style list with emojis
  const styles = [
    { name: "Photorealistic", emoji: "🌄" },
    { name: "Watercolor", emoji: "🎨" },
    { name: "Cyberpunk", emoji: "🌆" },
    { name: "Pixel Art", emoji: "👾" },
    { name: "Line Art", emoji: "✏️" },
    { name: "3D Render", emoji: "🎮" },
    { name: "Oil Painting", emoji: "🖌️" },
    { name: "Anime", emoji: "🎌" },
  ];

  const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  // Countdown clock effect during generation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isGenerating, countdown]);

  const handleEnhance = async () => {
    if (!promptText.trim()) {
      addToast("Please enter a basic prompt to enhance.", "error");
      return;
    }
    setEnhancing(true);
    addToast("Polishing your creative prompt with Gemini cognitive models...", "info");
    try {
      const response = await api.enhancePrompt(promptText, selectedStyle);
      setPromptText(response.enhancedPrompt);
      addToast("Prompt enriched with premium styling details!", "success");
    } catch (err: any) {
      addToast(`Prompt enhancement failed. Using fallback styling.`, "error");
    } finally {
      setEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!promptText.trim()) {
      addToast("A prompt is required to generate visuals.", "error");
      return;
    }
    setIsGenerating(true);
    setCountdown(12); // reset countdown estimation
    addToast("Synthesizing neural assets...", "info");

    try {
      const response = await api.generateImage({
        prompt: promptText,
        aspectRatio,
        style: selectedStyle,
        negativePrompt: negativePrompt || undefined,
        seed: seed || undefined,
      });

      const newItem: ImageHistoryItem = {
        url: response.imageUrl,
        prompt: response.prompt,
        style: selectedStyle,
        aspectRatio,
        isSimulated: response.isSimulated,
        timestamp: new Date(),
      };

      setActiveImage(newItem);
      setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
      addToast("Neural asset generated and verified!", "success");
    } catch (err: any) {
      addToast(`Image generation failed: ${err.message || err}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!activeImage) return;
    const a = document.createElement("a");
    a.href = activeImage.url;
    a.download = `alpha-ai-generation-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast("Downloading file...", "success");
  };

  const handleSendToChat = () => {
    if (!activeImage) return;
    addToast("Compiling visual assets for chat interface routing...", "info");

    // Convert imageUrl (which might be a blob URL or base64) to an attachment
    // Since we want to attach it to a new chat, we can do it by creating a new conversation
    // with this image as an attachment!
    const attachment: any = {
      name: `generation-${activeImage.style.toLowerCase()}.png`,
      type: "image/png",
      base64: activeImage.url.includes("base64") ? activeImage.url.split(",")[1] : "",
      preview: activeImage.url,
    };

    const newConvId = Math.random().toString(36).substring(2, 11);
    dispatch({ type: "NEW_CONVERSATION", id: newConvId });
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: Math.random().toString(36).substring(2, 11),
        role: "user",
        content: `Here is my generated ${activeImage.style} image for "${activeImage.prompt}". Please analyze it!`,
        timestamp: new Date(),
        attachments: [attachment],
      },
    });

    navigate("/");
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-w-0 bg-bg-base select-none overflow-hidden">
      {/* LEFT CONTROL PANEL (380px wide) */}
      <div className="w-full md:w-[380px] h-full bg-bg-surface border-r border-border-subtle p-5 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="flex flex-col gap-5">
          {/* Section Heading */}
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight font-sans">
              Neural Graphics Studio
            </h3>
            <p className="text-[11px] text-text-muted font-medium font-mono uppercase tracking-wider">
              Alpha OS Graphic Synthesizer
            </p>
          </div>

          {/* Text Prompt Area */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-text-secondary">Text Prompt</label>
              <button
                type="button"
                onClick={handleEnhance}
                disabled={enhancing || isGenerating}
                className="flex items-center gap-1 text-[10px] font-bold font-mono uppercase text-accent-primary hover:text-accent-hover transition-colors cursor-pointer"
              >
                {enhancing ? <Loader2 className="w-3 h-3 animate-spin-fast" /> : <Sparkles className="w-3 h-3" />}
                <span>✨ Enhance</span>
              </button>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe what you want to visualize in beautiful, rich detail..."
              rows={4}
              disabled={isGenerating}
              className="w-full bg-bg-base border border-border-subtle rounded-xl p-3 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary leading-relaxed font-sans resize-none"
            />
          </div>

          {/* Style selector grid */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">Creative Styling Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => {
                const isSelected = selectedStyle === style.name;
                return (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => setSelectedStyle(style.name)}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary font-bold shadow-[0_0_10px_rgba(139,92,246,0.1)]"
                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <span className="text-sm shrink-0">{style.emoji}</span>
                    <span className="truncate">{style.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio pill-selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary">Canvas Aspect Ratio</label>
            <div className="flex flex-wrap gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
              {aspectRatios.map((ratio) => {
                const isSelected = aspectRatio === ratio;
                return (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    disabled={isGenerating}
                    className={`flex-1 py-1 px-2.5 text-center text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-accent-primary text-white"
                        : "text-text-muted hover:text-text-secondary hover:bg-zinc-900"
                    }`}
                  >
                    {ratio}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Negative Prompt */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
            <div
              onClick={() => setNegOpen(!negOpen)}
              className="flex items-center justify-between px-3 py-2 bg-zinc-950/60 text-text-secondary select-none cursor-pointer hover:bg-zinc-950 transition-colors"
            >
              <span className="font-medium font-mono text-[11px] uppercase">Negative Prompt</span>
              {negOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
            </div>
            {negOpen && (
              <div className="p-3 bg-zinc-950/20 border-t border-zinc-900">
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="Elements to avoid (e.g. blurry, low quality, noise)"
                  disabled={isGenerating}
                  className="w-full bg-bg-base border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-sans"
                />
              </div>
            )}
          </div>

          {/* Collapsible Seed inputs */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
            <div
              onClick={() => setAdvOpen(!advOpen)}
              className="flex items-center justify-between px-3 py-2 bg-zinc-950/60 text-text-secondary select-none cursor-pointer hover:bg-zinc-950 transition-colors"
            >
              <span className="font-medium font-mono text-[11px] uppercase">Advanced Parameters</span>
              {advOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
            </div>
            {advOpen && (
              <div className="p-3 bg-zinc-950/20 border-t border-zinc-900 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-text-muted uppercase">Randomizer Seed (Numeric)</label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    placeholder="Enter seed code (e.g. 42385495)"
                    disabled={isGenerating}
                    className="w-full bg-bg-base border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generate triggers button */}
        <div className="pt-4 border-t border-zinc-900">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !promptText.trim()}
            className="w-full py-3 px-4 rounded-xl text-white font-semibold text-xs tracking-wide bg-gradient-to-r from-accent-primary to-cyan-brand hover:from-accent-hover hover:to-cyan-brand shadow-lg shadow-accent-primary/20 hover:scale-[1.01] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin-fast" />
                <span>Compiling Canvas... {countdown}s</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Visuals</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PREVIEW CANVAS */}
      <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto max-w-full">
        {/* Dynamic graphics viewports */}
        <div className="flex-1 flex items-center justify-center max-h-[80%] my-auto">
          {isGenerating ? (
            /* Shimmer loading card */
            <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border border-zinc-800 flex flex-col items-center justify-center gap-3">
              <div className="absolute inset-0 animate-shimmer" />
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-accent-primary animate-spin-fast" />
                <span className="text-xs font-mono font-semibold text-text-primary">Generating your image...</span>
                <span className="text-[10px] font-mono text-text-muted">Estimated finish: {countdown} seconds</span>
              </div>
            </div>
          ) : activeImage ? (
            /* Image display view */
            <div className="relative flex flex-col gap-4 w-full max-w-lg">
              <div className="relative border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl bg-black">
                <img
                  src={activeImage.url}
                  alt={activeImage.prompt}
                  className="w-full object-contain max-h-[550px]"
                  referrerPolicy="no-referrer"
                />

                {/* SimulatedFallback badge */}
                {activeImage.isSimulated && (
                  <div className="absolute top-3 left-3 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-md px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                    Via fallback engine
                  </div>
                )}
              </div>

              {/* Operations row below image */}
              <div className="flex items-center justify-between bg-bg-surface/50 border border-zinc-900 rounded-xl px-4 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-zinc-800 text-text-secondary hover:text-text-primary transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-zinc-800 text-text-secondary hover:text-text-primary transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <button
                  onClick={handleSendToChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-hover font-semibold cursor-pointer text-[11px] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Chat</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty state viewport */
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl w-full max-w-lg aspect-square flex flex-col items-center justify-center p-6 text-center text-text-muted">
              <ImageIcon className="w-12 h-12 text-zinc-800 mb-4 stroke-[1.2]" />
              <h4 className="text-xs font-mono font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Visual Viewport Offline
              </h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Describe a creative landscape or illustration on the control panel to synthesize visual neural outputs.
              </p>
            </div>
          )}
        </div>

        {/* Neural history list */}
        {history.length > 0 && (
          <div className="border-t border-zinc-900 pt-5 mt-auto flex flex-col gap-2.5">
            <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-text-muted">
              Visual Syntheses logs ({history.length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-1.5">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(item)}
                  className={`relative w-20 h-20 rounded-xl border overflow-hidden cursor-pointer shrink-0 transition-all ${
                    activeImage?.url === item.url
                      ? "border-accent-primary ring-2 ring-accent-primary/20 scale-[1.03]"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/35 hover:bg-transparent transition-colors flex items-end p-1">
                    <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider truncate max-w-full bg-black/55 px-1 py-0.5 rounded">
                      {item.style}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
