import React, { useState, useEffect } from "react";
import { api } from "../lib/api";
import { MODEL_COLORS, ModelMetrics, MODEL_DESCRIPTIONS } from "../types";
import { useApp } from "../context/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart2, Star, DollarSign, ArrowUpRight, Zap, Play, CheckCircle2, RefreshCw, Loader2, Award } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { addToast } = useApp();
  const [metrics, setMetrics] = useState<Record<string, ModelMetrics>>({});
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [lastBenchmarkedSec, setLastBenchmarkedSec] = useState<number | null>(null);

  const fetchPerformanceData = async () => {
    try {
      const data = await api.getPerformance();
      setMetrics(data.metrics);
      setMappings(data.mappings);
    } catch (err: any) {
      addToast("Failed to compile performance index.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  // Benchmark timer relative state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lastBenchmarkedSec !== null) {
      timer = setInterval(() => {
        setLastBenchmarkedSec((prev) => (prev !== null ? prev + 1 : null));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lastBenchmarkedSec]);

  const handleRunBenchmark = async () => {
    setBenchmarking(true);
    addToast("Triggering full-cluster hardware benchmarks...", "info");
    try {
      const start = Date.now();
      const response = await api.evaluatePerformance();
      setMetrics(response.metrics);
      setMappings(response.mappings);
      setLastBenchmarkedSec(0);
      addToast(`Benchmark cluster run completed in ${response.benchmarkDurationMs}ms!`, "success");
    } catch (err) {
      addToast("Benchmarking operations returned a busy cluster.", "error");
    } finally {
      setBenchmarking(false);
    }
  };

  const handleUpdateMapping = async (category: string, newModel: string) => {
    try {
      await api.updateRoutingMap(category, newModel);
      setMappings((prev) => ({ ...prev, [category]: newModel }));
      addToast(`Router updated: [${category}] category bound to ${newModel}`, "success");
    } catch (err) {
      addToast("Routing reassignment rejected by server.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base text-xs font-mono text-text-secondary gap-3">
        <Loader2 className="w-5 h-5 animate-spin-fast text-accent-primary" />
        <span>Compiling performance parameters...</span>
      </div>
    );
  }

  // Format data for Recharts BarChart
  const chartData = Object.entries(metrics).map(([model, meta]) => ({
    name: model,
    requests: meta.totalRequests || 0,
    color: MODEL_COLORS[model] || "#8b5cf6",
  }));

  const categories = Object.keys(mappings);
  const modelsList = Object.keys(MODEL_COLORS);

  return (
    <div className="flex-1 overflow-y-auto bg-bg-base p-6 md:p-8 flex flex-col gap-8 select-none">
      {/* Header and trigger bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary font-sans">
            Cognitive Diagnostics Core
          </h2>
          <p className="text-xs text-text-muted font-mono uppercase tracking-wider">
            Diagnostics Hub & Active Orchestrator
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastBenchmarkedSec !== null && (
            <span className="text-[10px] font-mono text-text-muted">
              Last benchmark: {lastBenchmarkedSec}s ago
            </span>
          )}
          <button
            onClick={handleRunBenchmark}
            disabled={benchmarking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-primary to-cyan-brand hover:from-accent-hover hover:to-cyan-brand font-semibold text-xs text-white shadow-md shadow-accent-primary/10 hover:scale-[1.01] active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          >
            {benchmarking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin-fast" />
                <span>Calibrating...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid containing Model metrics cards */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-text-muted">
          Operational Diagnostics Index
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([model, meta]) => {
            const color = MODEL_COLORS[model] || "#8b5cf6";
            return (
              <div
                key={model}
                className="bg-bg-surface border border-border-subtle rounded-xl p-4.5 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-zinc-750 transition-all shadow-sm"
              >
                {/* Border accent indicator */}
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />

                {/* Top Info line */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary font-mono">{model}</span>
                    <span className="text-[10px] text-text-muted truncate max-w-[150px]">
                      {MODEL_DESCRIPTIONS[model] || "Active cognitive node"}
                    </span>
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                  />
                </div>

                {/* Latency Meter Bar */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-text-muted">Core Response Latency</span>
                    <span className="text-text-secondary font-semibold">{meta.latencyMs}ms</span>
                  </div>
                  <div className="w-full h-1.5 bg-bg-base border border-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((meta.latencyMs / 1200) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${color}, #a78bfa)`,
                      }}
                    />
                  </div>
                </div>

                {/* Circular Success Rate & Intelligence/Cost grids */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-900/50">
                  <div className="flex flex-col gap-0.5 text-[10px]">
                    <span className="text-text-muted font-mono">Accuracy index</span>
                    <div className="flex items-center gap-1">
                      <span className="text-green-brand font-bold font-mono">{meta.successRate * 100}%</span>
                      <CheckCircle2 className="w-3 h-3 text-green-brand/80" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[10px]">
                    <span className="text-text-muted font-mono">System Requests</span>
                    <span className="text-text-primary font-bold font-mono">{meta.totalRequests}</span>
                  </div>
                </div>

                {/* Stars and cost scoring grids */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="flex flex-col gap-0.5 text-[10px]">
                    <span className="text-text-muted font-mono">Intelligence score</span>
                    <div className="flex items-center gap-0.5">
                      <span className="font-bold text-text-primary">{meta.intelligenceScore}/10</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 text-[10px]">
                    <span className="text-text-muted font-mono">Cost index</span>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: meta.costScore }).map((_, i) => (
                        <DollarSign key={i} className="w-2.5 h-2.5 -mr-0.5 shrink-0" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid containing Task routing and usage charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Task routing maps */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-text-muted">
            Cognitive Routing Assignments
          </span>
          <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-bg-base/80 border-b border-border-subtle font-mono text-[10px] text-text-muted uppercase">
                    <th className="p-3.5">Category Task Domain</th>
                    <th className="p-3.5">Mapped Processing Node</th>
                    <th className="p-3.5">Reassign Core Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {categories.map((cat) => {
                    const mappedModel = mappings[cat];
                    const color = MODEL_COLORS[mappedModel] || "#8b5cf6";
                    return (
                      <tr key={cat} className="hover:bg-bg-base/20 transition-colors">
                        <td className="p-3.5 font-medium text-text-secondary">{cat}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="font-mono text-text-primary">{mappedModel}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={mappedModel}
                            onChange={(e) => handleUpdateMapping(cat, e.target.value)}
                            className="bg-bg-base border border-border-subtle rounded px-2 py-1 text-xs text-text-secondary focus:outline-none focus:border-accent-primary font-mono cursor-pointer"
                          >
                            {modelsList.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Usage Recharts Chart */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-text-muted">
            Neural Traffic Allocation
          </span>
          <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 shadow-sm">
            <div className="w-full h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.02)" }}
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px" }}
                    labelStyle={{ color: "#fafafa", fontFamily: "monospace", fontSize: "11px" }}
                  />
                  <Bar dataKey="requests" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
