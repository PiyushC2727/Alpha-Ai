import React, { useState } from "react";
import { useModels } from "../../hooks/useModels";
import { ModelCard } from "./ModelCard";
import { RoutingMap } from "./RoutingMap";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { Play, RefreshCw, BarChart3, AlertCircle, Sparkles, Zap, ShieldCheck } from "lucide-react";

export function PerformanceDashboard() {
  const { modelsList, mappings, isLoading, isEvaluating, error, runBenchmark, updateMapping, refresh } = useModels();
  const [benchmarkResult, setBenchmarkResult] = useState<{ durationMs: number } | null>(null);

  const handleRunBenchmark = async () => {
    const duration = await runBenchmark();
    if (duration) {
      setBenchmarkResult({ durationMs: duration });
      setTimeout(() => setBenchmarkResult(null), 5000);
    }
  };

  // Format data for recharts bar chart
  const latencyChartData = modelsList.map(model => ({
    name: model.name,
    latency: model.metrics.latencyMs,
    color: model.color
  })).sort((a, b) => a.latency - b.latency);

  const successChartData = modelsList.map(model => ({
    name: model.name,
    success: parseFloat((model.metrics.successRate * 100).toFixed(1)),
    color: model.color
  })).sort((a, b) => b.success - a.success);

  const modelKeys = modelsList.map(m => m.id);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
      
      {/* Title / stats overview banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-cyan animate-pulse" />
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Kernel Node Telemetry & Router
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Active real-time benchmark metrics for OpenRouter endpoints and local simulated inference nodes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refresh}
            disabled={isLoading || isEvaluating}
            className="p-2.5 rounded-xl bg-slate-900 border border-brand-border text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoading && !isEvaluating) ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleRunBenchmark}
            disabled={isEvaluating || isLoading}
            className={`font-mono text-xs font-semibold py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isEvaluating
                ? "bg-[#141420] border-brand-border text-slate-500 cursor-not-allowed"
                : "bg-brand-purple hover:bg-purple-600 border-purple-500/20 text-white hover:translate-y-[-1px]"
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
                <span>BENCHMARK RUNNING...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white animate-pulse" />
                <span>EXECUTE PERFORMANCE PROBE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Benchmarking successful toast alert banner */}
      {benchmarkResult && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-400 animate-slide-up flex items-center gap-2.5 shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>Active performance evaluation completed successfully in {benchmarkResult.durationMs}ms! Neural latencies & success nodes re-calibrated.</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>System execution warning: {error}</span>
        </div>
      )}

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="telemetry-summary-cards">
        <div className="bg-brand-surface border border-brand-border p-4.5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-950/20 flex items-center justify-center border border-purple-500/30 text-brand-purple">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Lowest Latency Cluster</span>
            <span className="text-sm font-bold text-slate-200">Gemini Nano (220ms)</span>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-4.5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/20 flex items-center justify-center border border-brand-cyan/30 text-brand-cyan">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Peak Analytical Intelligence</span>
            <span className="text-sm font-bold text-slate-200">Claude 3.5 & DeepSeek R1</span>
          </div>
        </div>

        <div className="bg-brand-surface border border-brand-border p-4.5 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/20 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Average System Ingress SLA</span>
            <span className="text-sm font-bold text-slate-200">98.15% Uptime</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="telemetry-charts-container">
        
        {/* Latency comparison bar chart */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
            Latency Response Spectrum (Lower is better)
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2f" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} className="font-mono" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" tickLine={false} unit="ms" />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#12121a", borderColor: "#1e1e2f", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#f1f5f9" }}
                  itemStyle={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
                />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {latencyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Success rate comparison bar chart */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
            Node Routing Reliability Index (Success Rate %)
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={successChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2f" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} className="font-mono" tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} className="font-mono" tickLine={false} unit="%" domain={[90, 100]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "#12121a", borderColor: "#1e1e2f", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#f1f5f9" }}
                  itemStyle={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}
                />
                <Bar dataKey="success" radius={[4, 4, 0, 0]}>
                  {successChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ROUTING TABLE */}
      <RoutingMap 
        mappings={mappings} 
        models={modelKeys} 
        onUpdateMapping={updateMapping} 
      />

      {/* CLUSTER CARDS GRID */}
      <div className="space-y-3">
        <span className="block text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
          Active Cluster Nodes Status ({modelsList.length})
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id="cluster-nodes-grid">
          {modelsList.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>

    </div>
  );
}
export default PerformanceDashboard;
