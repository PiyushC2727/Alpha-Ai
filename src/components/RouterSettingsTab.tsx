import React, { useState, useEffect } from 'react';
import { 
  ToggleLeft, 
  ToggleRight, 
  Sliders, 
  Settings2, 
  Sparkles, 
  Key, 
  Zap, 
  BrainCircuit, 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  Code2, 
  Search, 
  Brain, 
  Percent, 
  FolderSearch, 
  PenTool, 
  Languages, 
  LineChart, 
  Flame, 
  BadgeDollarSign 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RouterConfig } from '../types';

interface RouterSettingsTabProps {
  config: RouterConfig;
  setConfig: (config: RouterConfig) => void;
}

const MODEL_THEMES = {
  'Claude 3.5': '#f59e0b', // Amber/Orange
  'GPT-4o': '#10b981',   // Emerald
  'Gemini 2.5': '#6366f1', // Indigo
  'DeepSeek R1': '#3b82f6', // Blue
  'Grok 2': '#8b5cf6',     // Violet
  'Perplexity': '#14b8a6', // Teal
  'Gemini Nano': '#ec4899', // Pink
};

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  'Coding': Code2,
  'Research': Search,
  'Reasoning': Brain,
  'Mathematics': Sliders,
  'Image Generation': Sparkles,
  'Image Analysis': RefreshCw,
  'Document Analysis': FolderSearch,
  'Writing': PenTool,
  'Translation': Languages,
  'Data Analysis': LineChart
};

export default function RouterSettingsTab({ config, setConfig }: RouterSettingsTabProps) {
  const [metrics, setMetrics] = useState<Record<string, { latencyMs: number; successRate: number; costScore: number; intelligenceScore: number; evalRating: number; totalRequests: number }>>({});
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [selfOptimizer, setSelfOptimizer] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  // Load performance metrics and mappings from backend
  const loadPerformanceData = async () => {
    try {
      const res = await fetch('/api/performance');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {});
        setMappings(data.mappings || {});
      }
    } catch (err) {
      console.warn("Failed to fetch performance data from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  // Update a task category mapping on the backend
  const handleMapChange = async (category: string, model: string) => {
    const updatedMappings = { ...mappings, [category]: model };
    setMappings(updatedMappings);

    try {
      const res = await fetch('/api/performance/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, model })
      });
      if (res.ok) {
        const data = await res.json();
        setMappings(data.mappings);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (err) {
      console.error("Failed to update mapping:", err);
    }
  };

  // Trigger evaluation benchmark run
  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch('/api/performance/evaluate', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setMappings(data.mappings);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2000);
      }
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setEvaluating(false);
    }
  };

  // Process latency chart data
  const chartData = Object.entries(metrics).map(([name, data]) => ({
    name,
    latency: data.latencyMs,
    color: MODEL_THEMES[name as keyof typeof MODEL_THEMES] || '#6366f1'
  }));

  const allModels = Object.keys(MODEL_THEMES);

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto max-h-[85vh] scrollbar-thin" id="router-settings-wrapper">
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-gray-150 dark:border-neutral-800 pb-3" id="router-settings-title-block">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
          <div>
            <h2 className="text-sm uppercase font-mono tracking-wider font-semibold text-gray-900 dark:text-neutral-100">
              Alpha OS Router Engine
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-sans">
              Intelligent Model Mapping & Performance Metrics
            </p>
          </div>
        </div>

        {showNotification && (
          <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/55 px-2 py-0.5 rounded flex items-center gap-1 animate-fade-in animate-pulse">
            <CheckCircle className="w-3 h-3" /> Sync Completed
          </span>
        )}
      </div>

      {/* Self Optimizer Toggle */}
      <div className="flex items-center justify-between p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/20 rounded-xl" id="optimizer-status-card">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            AI Self-Optimizer Engine
          </span>
          <span className="text-[10px] text-gray-400 dark:text-neutral-500 max-w-[210px]">
            Dynamically fine-tunes latency thresholds & success weightings behind the scenes.
          </span>
        </div>
        <button
          onClick={() => setSelfOptimizer(!selfOptimizer)}
          className="text-indigo-500 transition-transform active:scale-95 cursor-pointer"
          id="optimizer-toggle-btn"
        >
          {selfOptimizer ? (
            <ToggleRight className="w-8 h-8 text-indigo-500" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-neutral-300 dark:text-neutral-700" />
          )}
        </button>
      </div>

      {/* Task Routing Mappings */}
      <div className="flex flex-col gap-3" id="task-routing-mappings-panel">
        <label className="text-xs font-mono font-medium text-gray-400 dark:text-neutral-400 flex items-center gap-1.5 uppercase">
          <Settings2 className="w-3.5 h-3.5" /> Task Category Model Mappings
        </label>
        <p className="text-[10px] text-neutral-400 leading-normal mb-1">
          Customize which model handles specific task categories. Changes apply instantly without interrupting your unified chat experience.
        </p>

        <div className="flex flex-col gap-2 bg-white dark:bg-neutral-900/40 p-2.5 rounded-xl border border-gray-150 dark:border-neutral-800/80">
          {Object.entries(mappings).map(([category, mappedModel]) => {
            const IconComp = CATEGORY_ICONS[category] || Sliders;
            return (
              <div 
                key={category}
                className="flex items-center justify-between p-1.5 rounded-lg border border-transparent hover:border-gray-100 dark:hover:border-neutral-800/50 hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800/60 text-gray-500 dark:text-neutral-400">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-gray-800 dark:text-neutral-200">
                    {category}
                  </span>
                </div>

                <select
                  value={mappedModel}
                  onChange={(e) => handleMapChange(category, e.target.value)}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-neutral-300 py-1 px-2 rounded-lg text-xs font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  id={`select-category-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {allModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Performance Matrix */}
      <div className="flex flex-col gap-3" id="model-performance-matrix">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono font-medium text-gray-400 dark:text-neutral-400 flex items-center gap-1.5 uppercase">
            <Activity className="w-3.5 h-3.5" /> LLM Node Performance Matrix
          </label>
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
              evaluating 
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-750 text-neutral-400'
                : 'bg-indigo-500/5 hover:bg-indigo-500/10 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/30'
            }`}
            id="evaluate-benchmark-btn"
          >
            <RefreshCw className={`w-3 h-3 ${evaluating ? 'animate-spin' : ''}`} />
            {evaluating ? 'Evaluating...' : 'Benchmark Probes'}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {Object.entries(metrics).map(([modelName, data]) => {
            const color = MODEL_THEMES[modelName as keyof typeof MODEL_THEMES] || '#6366f1';
            return (
              <div 
                key={modelName}
                className="bg-neutral-50/50 dark:bg-neutral-900/30 p-2.5 rounded-xl border border-gray-150 dark:border-neutral-850"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-semibold text-gray-800 dark:text-neutral-200">{modelName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-neutral-500">
                    <span className="font-mono flex items-center gap-0.5">
                      <Percent className="w-2.5 h-2.5" /> {(data.successRate * 100).toFixed(1)}%
                    </span>
                    <span className="font-sans font-semibold text-gray-505 dark:text-neutral-400 flex items-center gap-0.5">
                      ⭐ {data.evalRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Latency meter progress bar */}
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 bg-gray-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        backgroundColor: color, 
                        width: `${Math.min(100, (data.latencyMs / 2500) * 100)}%` 
                      }} 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 w-14 text-right">
                    {data.latencyMs} ms
                  </span>
                </div>

                {/* Requests routed */}
                <div className="flex items-center justify-between mt-1 text-[9px] text-neutral-400">
                  <span>Intelligence: {data.intelligenceScore}/10</span>
                  <span>Routed: {data.totalRequests} reqs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Latency Visualization Chart */}
      <div className="flex flex-col gap-2.5 bg-neutral-50/30 dark:bg-neutral-900/10 p-3 rounded-xl border border-gray-150 dark:border-neutral-850/60">
        <label className="text-[10px] font-mono tracking-widest text-gray-400 uppercase">
          Routing Latency Metrics (Visualization)
        </label>
        <div className="h-28 w-full" id="latency-recharts-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#888' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#171717',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '10px',
                  color: '#fff',
                  fontFamily: 'monospace'
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar dataKey="latency" radius={[4, 4, 0, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secure API key section (Optional override) */}
      <div className="flex flex-col gap-2 p-3 bg-neutral-900 dark:bg-neutral-950 text-white rounded-xl border border-neutral-850 shadow-md transform hover:scale-[1.01] transition-all" id="api-keys-box">
        <div className="flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-mono tracking-wider font-semibold text-gray-300">
            SECURE ROUTING KEYS
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-normal">
          Injected automatically from your profile space, but you can override the routing endpoint with your custom OpenRouter credentials if desired.
        </p>
        <div className="relative">
          <input
            type="password"
            placeholder="sk-or-v1-xxxxxxxxxxxxxxxxx"
            value={config.openRouterKey || ''}
            onChange={(e) => setConfig({ ...config, openRouterKey: e.target.value })}
            className="w-full bg-neutral-900 border border-neutral-850 text-neutral-200 rounded-lg py-1.5 px-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-neutral-600"
            aria-label="OpenRouter API Key Override"
            id="open-router-key-override"
          />
        </div>
      </div>
    </div>
  );
}
