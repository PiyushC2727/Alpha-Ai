import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { ModelMetrics } from "../types";

export interface ModelPerformanceData {
  id: string;
  name: string;
  provider: string;
  color: string;
  description: string;
  category: string;
  metrics: ModelMetrics;
}

const STATIC_MODEL_METADATA: Record<string, { provider: string; color: string; description: string; category: string }> = {
  "GPT-4o": {
    provider: "OpenAI",
    color: "#10b981", // green
    description: "Industry-standard power model. Excels in complex reasoning, design orchestration, and structure.",
    category: "Coding & Reasoning"
  },
  "Claude 3.5": {
    provider: "Anthropic",
    color: "#f97316", // orange
    description: "State-of-the-art software synthesis and high-precision documentation generator.",
    category: "Expert Synthesis"
  },
  "Gemini 2.5": {
    provider: "Google",
    color: "#3b82f6", // blue
    description: "Ultra-long context multimodal engine, specialized in cross-disciplinary analysis.",
    category: "Multimodal Analysis"
  },
  "DeepSeek R1": {
    provider: "DeepSeek",
    color: "#ef4444", // red
    description: "Reasoning-first open model, featuring chain-of-thought `<think>` tags and absolute mathematical deduction.",
    category: "Pure Mathematics"
  },
  "Grok 2": {
    provider: "xAI",
    color: "#eab308", // yellow
    description: "Highly conversational, real-time knowledge integration with a direct, witty disposition.",
    category: "Real-time Exploration"
  },
  "Perplexity": {
    provider: "Perplexity",
    color: "#06b6d4", // cyan
    description: "Search-grounded answer engine, generating precise citations and up-to-the-minute details.",
    category: "Grounding & Web Scan"
  },
  "Gemini Nano": {
    provider: "Google Local",
    color: "#a855f7", // purple
    description: "Ultra-fast, zero-cost on-device model, perfect for micro-tasks and low-power summaries.",
    category: "Local Inference"
  }
};

export function useModels() {
  const [metrics, setMetrics] = useState<Record<string, ModelMetrics>>({});
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPerformance();
      setMetrics(data.metrics);
      setMappings(data.mappings);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch model metrics");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMapping = async (category: string, model: string) => {
    setError(null);
    try {
      const data = await api.updateRoutingMap(category, model);
      if (data.success) {
        setMappings(data.mappings);
        return true;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update routing mapping");
    }
    return false;
  };

  const runBenchmark = async () => {
    setIsEvaluating(true);
    setError(null);
    try {
      const data = await api.evaluatePerformance();
      if (data.success) {
        setMetrics(data.metrics);
        setMappings(data.mappings);
        return data.benchmarkDurationMs;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to execute performance benchmark");
    } finally {
      setIsEvaluating(false);
    }
    return null;
  };

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const modelsList: ModelPerformanceData[] = Object.keys(STATIC_MODEL_METADATA).map(key => {
    const meta = STATIC_MODEL_METADATA[key];
    const modelMetrics = metrics[key] || {
      latencyMs: 1500,
      successRate: 0.98,
      costScore: 8,
      intelligenceScore: 9,
      evalRating: 4.8,
      totalRequests: 0
    };
    return {
      id: key,
      name: key,
      ...meta,
      metrics: modelMetrics
    };
  });

  return {
    metrics,
    mappings,
    modelsList,
    isLoading,
    isEvaluating,
    error,
    refresh: fetchPerformance,
    updateMapping,
    runBenchmark
  };
}
