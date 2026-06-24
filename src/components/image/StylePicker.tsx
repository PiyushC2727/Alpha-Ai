import React from "react";
import { Sparkles, Camera, PenTool, Swords, Terminal, Gamepad2, Stars, Cpu } from "lucide-react";

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface StylePickerProps {
  selectedStyle: string;
  onChange: (id: string) => void;
}

const STYLES: StyleOption[] = [
  {
    id: "photorealistic",
    name: "Photorealistic",
    description: "Cinematic photography, detailed lenses, ambient volumetric lighting",
    icon: <Camera className="w-4 h-4 text-emerald-400" />
  },
  {
    id: "anime",
    name: "Anime & Manga",
    description: "Vibrant high-contrast illustration, crisp outlines, digital styling",
    icon: <PenTool className="w-4 h-4 text-orange-400" />
  },
  {
    id: "3drender",
    name: "3D Octane Render",
    description: "High-end 3D software feel, smooth clay modeling, studio lights",
    icon: <Cpu className="w-4 h-4 text-purple-400" />
  },
  {
    id: "cyberpunk",
    name: "Neon Cyberpunk",
    description: "Deep dark futuristic grids, high-intensity neon glow, holographic accents",
    icon: <Terminal className="w-4 h-4 text-cyan-400" />
  },
  {
    id: "fantasy",
    name: "Ethereal Fantasy",
    description: "Mythical environments, rich classic oil painting textures, epic scales",
    icon: <Swords className="w-4 h-4 text-rose-400" />
  },
  {
    id: "pixelart",
    name: "16-Bit Pixel Art",
    description: "Charming retro video game aesthetic, crisp pixel details, restricted colors",
    icon: <Gamepad2 className="w-4 h-4 text-amber-400" />
  },
  {
    id: "scifi",
    name: "Cosmic Sci-Fi",
    description: "Detailed spacecraft, galactic nebula sweeps, futuristic tech concepts",
    icon: <Stars className="w-4 h-4 text-blue-400" />
  },
  {
    id: "vaporwave",
    name: "Vaporwave Glitch",
    description: "Pastel sunsets, classic greek statues, dynamic 90s retro vapor style",
    icon: <Sparkles className="w-4 h-4 text-fuchsia-400" />
  }
];

export function StylePicker({ selectedStyle, onChange }: StylePickerProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
        Creative Image Style
      </label>
      <div className="grid grid-cols-2 gap-2" id="style-picker-grid">
        {STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-brand-purple/20 border-brand-purple text-purple-400"
                  : "bg-brand-surface border-brand-border text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {style.icon}
                <span className="text-xs font-mono font-bold">{style.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                {style.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default StylePicker;
