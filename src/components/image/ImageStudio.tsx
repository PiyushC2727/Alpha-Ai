import React, { useState } from "react";
import { api } from "../../lib/api";
import { StylePicker } from "./StylePicker";
import { AspectRatioPicker } from "./AspectRatioPicker";
import { 
  Sparkles, 
  Download, 
  Share2, 
  RefreshCw, 
  Maximize2, 
  Compass, 
  HelpCircle,
  Clock,
  Shuffle
} from "lucide-react";

export function ImageStudio() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [seed, setSeed] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [generatedData, setGeneratedData] = useState<{
    imageUrl: string;
    prompt: string;
    isSimulated: boolean;
    note?: string;
    durationMs?: number;
  } | null>(() => {
    // Elegant default pre-loaded sample
    return {
      imageUrl: "https://image.pollinations.ai/prompt/A%20neon%20cyberpunk%20cityscape%20with%20flying%20cars%20and%20tall%20skyscrapers,%20cyberpunk%20aesthetic,%20vibrant%20sci-fi,%20glowing%20neon%20lights,%20holographic%20accents,%20dark%20futuristic%20city%20background,%20highly%20detailed%203D%20render?width=1200&height=675&seed=840192&nologo=true&private=true",
      prompt: "A neon cyberpunk cityscape with flying cars and tall skyscrapers",
      isSimulated: true,
      note: "Synthesized via Alpha OS High-Fidelity Creative Synthesis engine.",
      durationMs: 1200
    };
  });

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setError(null);
    try {
      const data = await api.enhancePrompt(prompt, style);
      if (data.success) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.generateImage({
        prompt: prompt.trim(),
        aspectRatio,
        style,
        negativePrompt: negativePrompt.trim() || undefined,
        seed: seed.trim() || undefined
      });
      if (data.success) {
        setGeneratedData({
          imageUrl: data.imageUrl,
          prompt: data.prompt,
          isSimulated: data.isSimulated,
          note: data.note,
          durationMs: data.durationMs
        });
      }
    } catch (err: any) {
      setError(err?.message || "Generation pipeline failed");
    } finally {
      setIsLoading(false);
    }
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };

  const downloadImage = async () => {
    if (!generatedData) return;
    try {
      const response = await fetch(generatedData.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `alpha-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback open in new tab
      window.open(generatedData.imageUrl, "_blank");
    }
  };

  const shareImage = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData.imageUrl);
    alert("Synthesized asset URI copied to clipboard!");
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
      
      {/* LEFT SIDEBAR: Synthesis control deck */}
      <div className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-brand-border bg-[#07070a]/90 flex flex-col h-1/2 lg:h-full overflow-y-auto p-5 space-y-6 scrollbar-thin">
        
        {/* Module title header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-purple animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase text-slate-200 tracking-wider">
              Creative Synthesis Control Deck
            </h2>
          </div>
          <p className="text-[10px] font-mono text-slate-500">
            Configure generative neural pipelines
          </p>
        </div>

        {/* Form elements */}
        <div className="space-y-5">
          {/* Text prompt input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                Visual Prompt
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing || isLoading}
                className="text-[10px] font-mono font-bold text-brand-cyan hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 bg-cyan-950/20 px-2 py-1 rounded border border-cyan-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>ENHANCING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>AUTO-ENHANCE PROMPT</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to synthesize..."
              className="w-full min-h-[90px] max-h-[140px] text-xs font-mono bg-brand-surface border border-brand-border rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Style Picker */}
          <StylePicker selectedStyle={style} onChange={setStyle} />

          {/* Aspect Ratio Picker */}
          <AspectRatioPicker selectedRatio={aspectRatio} onChange={setAspectRatio} />

          {/* Advanced options collapse */}
          <div className="p-4 bg-brand-surface/40 border border-brand-border rounded-xl space-y-4">
            <span className="block text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">
              Advanced Pipeline Overrides
            </span>

            {/* Negative prompt */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500">
                Negative Prompt (Objects to exclude)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="ugly, blurry, low resolution, bad hands..."
                className="w-full text-xs font-mono bg-[#0c0c14] border border-brand-border rounded-lg px-3 py-2 text-slate-300 placeholder-slate-700 focus:outline-none"
              />
            </div>

            {/* Seed */}
            <div className="space-y-1.5">
              <label className="block text-[9px] font-mono text-slate-500 flex justify-between items-center">
                <span>Custom Seed (Fixed values yield stable images)</span>
                <button 
                  onClick={randomizeSeed}
                  className="text-[9px] text-brand-purple cursor-pointer hover:text-purple-400 flex items-center gap-0.5"
                  type="button"
                >
                  <Shuffle className="w-2.5 h-2.5" />
                  <span>Random</span>
                </button>
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="Leave blank for fully dynamic seed..."
                className="w-full text-xs font-mono bg-[#0c0c14] border border-brand-border rounded-lg px-3 py-2 text-slate-300 placeholder-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs font-mono text-rose-400 leading-normal">
              ⚠️ {error}
            </div>
          )}

          {/* Main Generate Button CTA */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className={`w-full py-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              !prompt.trim() || isLoading
                ? "bg-slate-900 border border-brand-border text-slate-600 cursor-not-allowed"
                : "bg-brand-purple hover:bg-purple-600 text-white hover:translate-y-[-1px] hover:shadow-purple-500/20"
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ENGAGING NEURAL GRID...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>ENGAGE NEURAL SYNTHESIS</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* RIGHT PREVIEW AREA: Canvas Output Render */}
      <div className="flex-1 bg-[#050508] p-6 flex flex-col justify-center items-center h-1/2 lg:h-full overflow-y-auto">
        
        {isLoading ? (
          /* Neural synthesis loading sequence */
          <div className="flex flex-col items-center justify-center text-center p-8 gap-4 animate-pulse-slow max-w-sm">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-brand-purple animate-spin" />
              <div className="w-12 h-12 bg-purple-950/40 rounded-full flex items-center justify-center border border-purple-500/30 absolute inset-0 m-auto">
                <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                Compiling visual textures...
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1.5 leading-relaxed">
                Running advanced high-resolution generative fallback models. This takes a few seconds.
              </p>
            </div>
          </div>
        ) : generatedData ? (
          /* Synthesis output completed */
          <div className="max-w-3xl w-full flex flex-col items-center gap-5 animate-slide-up">
            
            {/* Main canvas holder */}
            <div className="relative group border border-brand-border rounded-2xl overflow-hidden bg-brand-surface p-1.5 purple-glow">
              <img
                src={generatedData.imageUrl}
                alt={generatedData.prompt}
                referrerPolicy="no-referrer"
                className="rounded-xl object-contain max-h-[60vh] max-w-full block"
              />

              {/* simulated fallback / original tag overlay */}
              <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                {generatedData.isSimulated && (
                  <span className="px-2.5 py-1 rounded bg-amber-500/90 backdrop-blur border border-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-900 shadow">
                    FALLBACK COGNITION MODAL
                  </span>
                )}
                <span className="px-2.5 py-1 rounded bg-[#0a0a0f]/80 backdrop-blur border border-brand-border text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wide shadow">
                  Style: {style}
                </span>
              </div>
            </div>

            {/* Generated parameters & download CTA bar */}
            <div className="w-full flex flex-col gap-3.5 bg-brand-surface border border-brand-border p-4.5 rounded-2xl">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-brand-cyan font-bold uppercase tracking-wider block">
                  SYNERGY PROMPT USED
                </span>
                <p className="text-xs font-mono text-slate-300 leading-normal">
                  {generatedData.prompt}
                </p>
              </div>

              {generatedData.note && (
                <div className="text-[10px] font-mono text-slate-500 italic flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{generatedData.note}</span>
                </div>
              )}

              {generatedData.durationMs !== undefined && (
                <div className="text-[9px] font-mono text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Process compiled in {(generatedData.durationMs / 1000).toFixed(2)}s</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-3 border-t border-brand-border/40">
                <button
                  onClick={downloadImage}
                  className="flex-1 py-2 px-4 rounded-xl bg-slate-900 border border-brand-border hover:bg-slate-800 font-mono text-xs text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD IMAGE</span>
                </button>
                <button
                  onClick={shareImage}
                  className="py-2 px-4 rounded-xl bg-slate-900 border border-brand-border hover:bg-slate-800 font-mono text-xs text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  title="Copy image link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerate}
                  className="py-2 px-4 rounded-xl bg-brand-purple/20 border border-brand-purple/30 hover:border-brand-purple/60 text-purple-400 hover:bg-brand-purple/30 font-mono text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                  title="Regenerate seed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Empty preview state */
          <div className="text-center p-8 max-w-sm flex flex-col items-center gap-4 text-slate-500 font-mono">
            <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-900">
              <Compass className="w-6 h-6 text-slate-700 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Creative Canvas Empty
              </span>
              <p className="text-[10px] text-slate-600 mt-1 leading-normal">
                Input your text prompt in the control deck on the left and engage the neural synthesis pipeline.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export default ImageStudio;
