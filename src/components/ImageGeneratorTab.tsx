import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Paintbrush, 
  Info,
  Maximize2,
  Wand2,
  Sliders,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Bookmark,
  Share2,
  Palette
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  enhancedPrompt?: string;
  style: string;
  aspectRatio: string;
  negativePrompt?: string;
  seed?: string;
  cfgScale?: number;
  timestamp: string;
  isSimulated: boolean;
}

export default function ImageGeneratorTab() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [cfgScale, setCfgScale] = useState(7.5);
  const [seed, setSeed] = useState('');
  const [isRandomSeed, setIsRandomSeed] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'presets' | 'advanced'>('presets');
  const [loadingStep, setLoadingStep] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('alpha_generated_images');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load generated images', e);
    }
    return [
      {
        id: 'img_sample_1',
        url: 'https://image.pollinations.ai/prompt/A%20neon%20cyberpunk%20cityscape%20with%20flying%20cars%20and%20tall%20skyscrapers,%20cyberpunk%20aesthetic,%20vibrant%20sci-fi,%20glowing%20neon%20lights,%20holographic%20accents,%20dark%20futuristic%20city%20background,%20highly%20detailed%203D%20render?width=1200&height=675&seed=840192&nologo=true&private=true',
        prompt: 'A neon cyberpunk cityscape with flying cars and tall skyscrapers',
        style: 'cyberpunk',
        aspectRatio: '16:9',
        negativePrompt: 'blurry, low contrast',
        seed: '840192',
        cfgScale: 7.5,
        timestamp: '06/23/26 11:15 AM',
        isSimulated: true
      },
      {
        id: 'img_sample_2',
        url: 'https://image.pollinations.ai/prompt/A%20small%20adorable%20companion%20robot%20exploring%20a%20glowing%20alien%20forest,%20professional%203D%20octane%20render,%20smooth%20volumetric%20clay%20shading,%20colorful%20modern%20design,%20bright%20studio%20lighting,%20cute%20isometric%20view?width=800&height=800&seed=194720&nologo=true&private=true',
        prompt: 'A small adorable companion robot exploring a glowing alien forest',
        style: '3drender',
        aspectRatio: '1:1',
        negativePrompt: 'dark, scary, realistic',
        seed: '194720',
        cfgScale: 9.0,
        timestamp: '06/24/26 01:05 AM',
        isSimulated: true
      }
    ];
  });
  
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(() => {
    const saved = localStorage.getItem('alpha_generated_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0];
      } catch (e) {}
    }
    return {
      id: 'img_sample_1',
      url: 'https://image.pollinations.ai/prompt/A%20neon%20cyberpunk%20cityscape%20with%20flying%20cars%20and%20tall%20skyscrapers,%20cyberpunk%20aesthetic,%20vibrant%20sci-fi,%20glowing%20neon%20lights,%20holographic%20accents,%20dark%20futuristic%20city%20background,%20highly%20detailed%203D%20render?width=1200&height=675&seed=840192&nologo=true&private=true',
      prompt: 'A neon cyberpunk cityscape with flying cars and tall skyscrapers',
      style: 'cyberpunk',
      aspectRatio: '16:9',
      negativePrompt: 'blurry, low contrast',
      seed: '840192',
      cfgScale: 7.5,
      timestamp: '06/23/26 11:15 AM',
      isSimulated: true
    };
  });

  const loadingSteps = [
    'Initializing Alpha Creative Engine...',
    'Allocating cognitive neural grids...',
    'Synthesizing chromatic lighting layers...',
    'Injecting high-density prompt weights...',
    'Applying volumetric shadow calculations...',
    'Polishing fine architectural details...',
    'Rendering high-fidelity output buffer...'
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Persist images to local storage
  useEffect(() => {
    try {
      localStorage.setItem('alpha_generated_images', JSON.stringify(savedImages));
    } catch (e) {
      console.error('Failed to persist images', e);
    }
  }, [savedImages]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const response = await fetch('/api/image/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style: selectedStyle
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.enhancedPrompt) {
          setPrompt(data.enhancedPrompt);
        }
      }
    } catch (e) {
      console.error('Failed to enhance prompt', e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const targetSeed = isRandomSeed ? Math.floor(Math.random() * 999999).toString() : (seed || '42');

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style: selectedStyle,
          negativePrompt,
          seed: targetSeed,
          cfgScale
        })
      });

      if (!response.ok) {
        throw new Error('Image generation endpoint failed');
      }

      const data = await response.json();
      if (data.success) {
        const newImage: GeneratedImage = {
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          url: data.imageUrl,
          prompt: prompt.trim(),
          style: selectedStyle,
          aspectRatio,
          negativePrompt: negativePrompt.trim() || undefined,
          seed: targetSeed,
          cfgScale,
          timestamp: new Date().toLocaleDateString(undefined, {
            month: '2-digit', day: '2-digit', year: '2-digit'
          }) + ' ' + new Date().toLocaleTimeString(undefined, {
            hour: '2-digit', minute: '2-digit'
          }),
          isSimulated: !!data.isSimulated
        };

        setSavedImages([newImage, ...savedImages]);
        setActiveImage(newImage);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedImages.filter(img => img.id !== id);
    setSavedImages(updated);
    if (activeImage?.id === id) {
      setActiveImage(updated.length > 0 ? updated[0] : null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reuseSettings = (img: GeneratedImage) => {
    setPrompt(img.prompt);
    setAspectRatio(img.aspectRatio);
    setSelectedStyle(img.style);
    if (img.negativePrompt) setNegativePrompt(img.negativePrompt);
    if (img.seed) {
      setSeed(img.seed);
      setIsRandomSeed(false);
    }
    if (img.cfgScale) setCfgScale(img.cfgScale);
  };

  const handleDownload = async (imageUrl: string, promptText: string) => {
    try {
      // Create download trigger
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `alpha_creative_${promptText.slice(0, 20).replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to trigger file download:', err);
    }
  };

  const styles = [
    { id: 'photorealistic', name: 'Photorealistic', desc: 'True-to-life photography' },
    { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Vibrant neon sci-fi scenery' },
    { id: 'watercolor', name: 'Watercolor', desc: 'Soft pastel ink illustration' },
    { id: 'pixelart', name: '16-Bit Pixel Art', desc: 'Retro pixel grid game art' },
    { id: 'anime', name: 'Anime Studio', desc: 'Vivid hand-drawn manga art' },
    { id: '3drender', name: 'Octane 3D', desc: 'Smooth volumetric clay shapes' },
    { id: 'lineart', name: 'Line Art', desc: 'Minimalist continuous vector curves' },
    { id: 'oilpainting', name: 'Impasto Oil', desc: 'Rich canvas paint textures' },
    { id: 'none', name: 'None / Raw', desc: 'Allow natural model interpretations' },
  ];

  const aspectRatios = [
    { id: '1:1', label: 'Square (1:1)', wClass: 'w-6 h-6' },
    { id: '16:9', label: 'Landscape (16:9)', wClass: 'w-8 h-4.5' },
    { id: '9:16', label: 'Portrait (9:16)', wClass: 'w-4.5 h-8' },
    { id: '4:3', label: 'Standard (4:3)', wClass: 'w-7.5 h-5.5' },
    { id: '3:4', label: 'Classic (3:4)', wClass: 'w-5.5 h-7.5' },
  ];

  const presetIdeas = [
    {
      category: 'Fantasy',
      title: 'Redwood Library',
      prompt: 'An ancient library carved into a redwood tree, glowing lanterns, spiral staircases, dusty sunbeams',
      style: 'watercolor',
    },
    {
      category: 'Sci-Fi',
      title: 'Cyber Banana',
      prompt: 'A golden bio-luminescent cybernetic banana on a premium dark velvet pedestal, sleek carbon-fiber textures',
      style: 'cyberpunk',
    },
    {
      category: 'Cinematic',
      title: 'Cosmic Astronaut',
      prompt: 'An astronaut standing on a pristine white sand beach of an alien ocean looking up at a dual moonrise',
      style: 'photorealistic',
    },
    {
      category: '3D Cute',
      title: 'Bonsai Temple',
      prompt: 'A floating micro-island showing a highly detailed cute bonsai temple with waterfalls spilling into clouds',
      style: '3drender',
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-[#FAFAFA] dark:bg-[#070707]" id="image-studio-workspace">
      
      {/* Left side: Controls Panel */}
      <div className="w-full lg:w-[410px] border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-neutral-850 p-4 lg:p-5 overflow-y-auto flex flex-col gap-5 shrink-0" id="controls-section">
        
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-neutral-850 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
            <div>
              <h2 className="text-xs uppercase font-mono tracking-wider font-semibold text-gray-900 dark:text-neutral-100">
                Creative Studio
              </h2>
              <p className="text-[10px] text-gray-400 font-sans mt-0.5">
                Advanced Image Generation System
              </p>
            </div>
          </div>
          <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
            Imagen 3 Engine
          </span>
        </div>

        {/* Dynamic Prompt Creator Form */}
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          
          {/* Prompt input with Gemini AI Enhancer */}
          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <label className="text-[10.5px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1" htmlFor="prompt-input">
                <span>Text Description</span>
                <span title="What visual content should the AI generate?"><HelpCircle className="w-3 h-3 text-gray-300 cursor-help" /></span>
              </label>
              
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={!prompt.trim() || isEnhancing || isGenerating}
                className={`flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.8 rounded border shadow-2xs cursor-pointer transition-all ${
                  isEnhancing
                    ? 'bg-neutral-100 dark:bg-neutral-850 text-gray-400 border-neutral-250 animate-pulse'
                    : !prompt.trim()
                    ? 'bg-neutral-50 dark:bg-neutral-900 text-gray-400 border-gray-200 dark:border-neutral-800 opacity-60 cursor-not-allowed'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
                }`}
                title="AI Magic wand: Expand and enrich prompt details using Gemini AI"
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Writing magic...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3 h-3 text-indigo-500 animate-pulse" />
                    <span>AI Enhance Prompt</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your creative vision... (e.g. 'A tiny golden hummingbird inside a deep neon conservatory')"
              className="w-full text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-neutral-100 h-28 resize-none shadow-xs transition-all leading-relaxed"
            />
          </div>

          {/* Aspect Ratio Select Grid */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10.5px] font-mono uppercase tracking-wider text-gray-400">
              Aspect Canvas Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2" id="aspect-ratio-selector">
              {aspectRatios.map((ratio) => (
                <button
                  type="button"
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg text-left border cursor-pointer transition-all ${
                    aspectRatio === ratio.id
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'bg-white dark:bg-neutral-900 border-gray-150 dark:border-neutral-800 text-gray-500 hover:text-gray-700 dark:hover:text-neutral-200'
                  }`}
                >
                  <div className={`border border-current rounded flex items-center justify-center opacity-70 ${ratio.wClass}`} />
                  <span className="text-[11px] truncate">{ratio.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration sub-tabs: Presets vs Advanced */}
          <div className="flex border-b border-gray-150 dark:border-neutral-850 mt-1">
            <button
              type="button"
              onClick={() => setActiveSettingsTab('presets')}
              className={`flex-1 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                activeSettingsTab === 'presets'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200'
              }`}
            >
              Creative Presets
            </button>
            <button
              type="button"
              onClick={() => setActiveSettingsTab('advanced')}
              className={`flex-1 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
                activeSettingsTab === 'advanced'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-neutral-200'
              }`}
            >
              Advanced Engine Parameters
            </button>
          </div>

          {/* Tab 1: Style Presets */}
          {activeSettingsTab === 'presets' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                Visual Aesthetic Style
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto scrollbar-thin p-1 border border-gray-150 dark:border-neutral-850 rounded-xl bg-white/40 dark:bg-neutral-900/30" id="style-presets-pane">
                {styles.map((style) => (
                  <button
                    type="button"
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col px-2.5 py-1.5 rounded-lg text-left transition-all border cursor-pointer ${
                      selectedStyle === style.id
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/15 border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm'
                        : 'border-transparent text-gray-500 dark:text-neutral-450 hover:bg-gray-100/50 dark:hover:bg-[#151515] hover:text-gray-700 dark:hover:text-neutral-250'
                    }`}
                  >
                    <span className="text-[11px] font-semibold">{style.name}</span>
                    <span className="text-[9px] text-gray-400 truncate">{style.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Advanced Controls */}
          {activeSettingsTab === 'advanced' && (
            <div className="flex flex-col gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-gray-150 dark:border-neutral-800 animate-fade-in text-xs">
              
              {/* Negative Prompt */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono uppercase text-gray-400 flex justify-between">
                  <span>Negative Prompt</span>
                  <span className="lowercase">what to exclude</span>
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="low quality, blurry, deformed, bad anatomy, bad lighting"
                  className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-2 rounded-lg text-gray-800 dark:text-neutral-100"
                />
              </div>

              {/* Guidance / CFG Scale slider */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-gray-400">
                  <span>Guidance Weight (CFG)</span>
                  <span className="font-bold text-indigo-550 dark:text-indigo-400">{cfgScale.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={cfgScale}
                  onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                  className="w-full accent-indigo-550"
                />
                <div className="flex justify-between text-[9px] text-gray-400 font-mono mt-0.5">
                  <span>Creative (1.0)</span>
                  <span>Strict adherence (15.0)</span>
                </div>
              </div>

              {/* Seed Control */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-gray-400">Engine Seed</label>
                  <label className="flex items-center gap-1 text-[10px] text-gray-500 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRandomSeed}
                      onChange={(e) => setIsRandomSeed(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Random Seed</span>
                  </label>
                </div>
                {!isRandomSeed && (
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter manual numeric seed (e.g., 482103)"
                    className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-2 rounded-lg text-gray-800 dark:text-neutral-100 mt-1"
                  />
                )}
              </div>

            </div>
          )}

          {/* Action Trigger synthesis cta */}
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className={`w-full font-mono text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
              isGenerating
                ? 'bg-neutral-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                : !prompt.trim()
                ? 'bg-neutral-100 dark:bg-neutral-900 text-gray-400 border border-gray-200 dark:border-neutral-800 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-550 dark:hover:bg-indigo-600'
            }`}
            id="generate-image-cta"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Image Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Synthesize Visual Matrix</span>
              </>
            )}
          </button>
        </form>

        {/* Ideas / Quick prompt trigger bank */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Creative Prompts Inspiration Hub</span>
          </span>
          <div className="grid grid-cols-2 gap-2" id="inspiration-prompts-grid">
            {presetIdeas.map((idea, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(idea.prompt);
                  setSelectedStyle(idea.style);
                }}
                className="p-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-850 hover:border-indigo-400 dark:hover:border-indigo-900 rounded-lg text-left transition-all cursor-pointer flex flex-col gap-0.5 group"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[8px] font-mono uppercase text-indigo-500 font-bold">{idea.category}</span>
                  <span className="text-[8px] font-mono text-gray-400">{idea.style}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-800 dark:text-neutral-250 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {idea.title}
                </span>
                <p className="text-[8.5px] text-gray-400 line-clamp-1 truncate">{idea.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Brief Alert info block */}
        <div className="mt-auto p-3.5 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/5 border border-indigo-100/30 dark:border-indigo-950/20 text-[10.5px] leading-relaxed text-gray-500 dark:text-neutral-400 flex gap-2" id="info-studio-block">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p>
            Render spectacular shapes with <strong>gemini-2.5-flash-image</strong>. Realizes high guidance controls and seed persistence.
          </p>
        </div>
      </div>

      {/* Right side: Viewport Stage */}
      <div className="flex-1 flex flex-col overflow-hidden" id="viewport-stage-section">
        
        {/* Active render view */}
        <div className="flex-1 p-4 lg:p-6 flex items-center justify-center relative bg-neutral-100 dark:bg-[#0a0a0a] overflow-hidden" id="rendering-sandbox-stage">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 text-center max-w-sm" id="generating-visuals">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Paintbrush className="w-6 h-6 text-indigo-500 absolute animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800 dark:text-neutral-200 animate-pulse">
                  Synthesizing Visual Grid
                </span>
                <span className="text-[11px] text-gray-400 font-mono italic">
                  {loadingSteps[loadingStep]}
                </span>
              </div>
            </div>
          ) : activeImage ? (
            <div className="flex flex-col items-center max-w-full max-h-full gap-4 relative group" id="active-image-frame">
              
              {/* Outer image framing */}
              <div className="relative border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 rounded-2xl shadow-xl max-h-[66vh] flex items-center justify-center overflow-hidden">
                <img
                  src={activeImage.url}
                  alt={activeImage.prompt}
                  referrerPolicy="no-referrer"
                  className="rounded-xl object-contain max-w-full max-h-[58vh] transition-transform duration-300 group-hover:scale-[1.01]"
                  id="rendered-viewport-img"
                />

                {/* Floating image controls overlays */}
                <div className="absolute inset-x-4 bottom-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/10" id="rendered-img-overlays">
                  <span className="text-[10px] text-white/90 font-mono truncate max-w-[200px] sm:max-w-xs px-2">
                    {activeImage.prompt}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => reuseSettings(activeImage)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Reuse Settings: copy prompt, aspect ratio, style back to parameters"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reuse Settings</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(activeImage.url, activeImage.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 transition-all cursor-pointer"
                      title="Copy Image URL"
                    >
                      {copiedId === activeImage.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDownload(activeImage.url, activeImage.prompt)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 transition-all cursor-pointer"
                      title="Download Image File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={activeImage.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-white/10 rounded-lg text-white/90 transition-all flex items-center justify-center"
                      title="Open full size in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Information underneath active image */}
              <div className="w-full max-w-2xl px-2 text-center" id="image-attributes-footer">
                <p className="text-xs text-gray-700 dark:text-neutral-300 font-medium">
                  "{activeImage.prompt}"
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 font-mono text-[9px] text-gray-400 uppercase">
                  <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded">{activeImage.aspectRatio}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 bg-gray-200 dark:bg-neutral-800 rounded">{activeImage.style}</span>
                  <span>•</span>
                  <span>Seed: {activeImage.seed || 'none'}</span>
                  <span>•</span>
                  <span>CFG: {activeImage.cfgScale || '7.5'}</span>
                  <span>•</span>
                  <span>{activeImage.timestamp}</span>
                  {activeImage.isSimulated && (
                    <>
                      <span>•</span>
                      <span className="text-amber-500 font-bold">Simulator Fallback</span>
                    </>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-gray-400" id="empty-state-viewport">
              <ImageIcon className="w-12 h-12 stroke-1 text-gray-300 dark:text-neutral-850 animate-bounce" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-650 dark:text-neutral-450">Creative Sandbox Ready</span>
                <span className="text-[10px] text-gray-455 dark:text-neutral-500">Provide prompt coordinates on the left to synthesize visual outputs</span>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Drawer */}
        <div className="h-44 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#0c0c0c] p-4 flex flex-col gap-3" id="gallery-drawer">
          <div className="flex items-center justify-between" id="gallery-header">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-gray-500 dark:text-neutral-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Alpha Creative Gallery ({savedImages.length})</span>
            </span>
            {savedImages.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your entire generated image gallery? This cannot be undone.')) {
                    setSavedImages([]);
                    setActiveImage(null);
                  }
                }}
                className="text-[10px] font-mono text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer hover:underline flex items-center gap-1"
                id="clear-gallery-btn"
              >
                <Trash2 className="w-3 h-3" />
                Clear All Gallery
              </button>
            )}
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin flex gap-4 pb-2 focus:outline-none" id="gallery-scroller" tabIndex={0}>
            {savedImages.length === 0 ? (
              <div className="w-full flex items-center justify-center text-center text-xs text-gray-400 font-mono italic" id="empty-gallery-msg">
                no generated assets in local cache
              </div>
            ) : (
              savedImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setActiveImage(img)}
                  className={`relative group shrink-0 w-24 h-24 rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    activeImage?.id === img.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-gray-200 dark:border-neutral-800 hover:border-gray-450 dark:hover:border-neutral-700'
                  }`}
                  id={`gallery-item-${img.id}`}
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => deleteImage(img.id, e)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-black/80 hover:text-rose-350"
                    title="Delete item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
