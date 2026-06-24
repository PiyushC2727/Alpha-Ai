import React, { useState } from "react";
import { ChevronDown, Check, Shuffle, RefreshCw } from "lucide-react";

interface RoutingMapProps {
  mappings: Record<string, string>;
  models: string[];
  onUpdateMapping: (category: string, model: string) => Promise<boolean>;
}

export function RoutingMap({ mappings, models, onUpdateMapping }: RoutingMapProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleReassign = async (category: string, model: string) => {
    setActiveDropdown(null);
    setIsUpdating(category);
    try {
      await onUpdateMapping(category, model);
    } finally {
      setIsUpdating(null);
    }
  };

  const categories = Object.keys(mappings || {
    "Coding": "Claude 3.5",
    "Research": "Perplexity",
    "Reasoning": "DeepSeek R1",
    "Mathematics": "Claude 3.5",
    "Image Generation": "Gemini Nano",
    "Image Analysis": "Gemini 2.5",
    "Document Analysis": "Gemini 2.5",
    "Writing": "GPT-4o",
    "Translation": "GPT-4o",
    "Data Analysis": "Claude 3.5"
  });

  return (
    <div className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden shadow-xl">
      
      {/* Table Header Section */}
      <div className="p-5 border-b border-brand-border bg-[#151522]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Autonomous Intent Routing Map
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              Defines which specialized AI model cluster resolves specific prompt category intents.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded uppercase font-semibold">
            MUTABLE KERNEL ROUTING
          </span>
        </div>
      </div>

      {/* Grid List representation */}
      <div className="divide-y divide-brand-border" id="routing-map-table">
        {categories.map((category) => {
          const assignedModel = mappings[category] || "GPT-4o";
          const dropdownOpen = activeDropdown === category;
          const updating = isUpdating === category;

          return (
            <div key={category} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#12121c]/40 hover:bg-[#121222]/80 transition-colors gap-3">
              {/* Intent domain info */}
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-200">
                  {category} Domain
                </span>
                <p className="text-[10px] text-slate-500 font-mono">
                  Incoming prompts classified as {category.toLowerCase()} are routed to:
                </p>
              </div>

              {/* Selector / dropdown widget */}
              <div className="relative self-start sm:self-center">
                {updating ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border bg-[#0d0d15] text-xs font-mono text-slate-500">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                    <span>REROUTING NODE...</span>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setActiveDropdown(dropdownOpen ? null : category)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-[#0d0d15] hover:border-brand-purple hover:bg-[#12121e] transition-all cursor-pointer font-mono text-xs text-slate-300"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>{assignedModel}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>

                    {/* Selector overlay menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-48 bg-[#0d0d15] border border-brand-border rounded-lg shadow-2xl z-40 py-1 font-mono text-xs">
                        <div className="px-2.5 py-1 text-[8px] text-slate-500 uppercase font-bold border-b border-brand-border mb-1">
                          SELECT MAPPED NODE
                        </div>
                        {models.map((modelId) => {
                          const isAssigned = assignedModel === modelId;
                          return (
                            <button
                              key={modelId}
                              onClick={() => handleReassign(category, modelId)}
                              className="w-full text-left px-3 py-2 hover:bg-[#161628] hover:text-white flex items-center justify-between transition-colors cursor-pointer text-slate-400"
                            >
                              <span>{modelId}</span>
                              {isAssigned && <Check className="w-3.5 h-3.5 text-brand-purple" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
export default RoutingMap;
