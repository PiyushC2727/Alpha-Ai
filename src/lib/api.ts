import { Message, Subtask, CompareResponse, ModelMetrics } from "../types";

export interface ChatResponse {
  synthesizedResponse: string;
  activeModelId?: string;
  usedModels?: string[];
  thinkingTimeMs?: number;
  inferredMemories?: Array<{
    content: string;
    category: "preference" | "identity" | "project" | "technical" | "other";
    reason: string;
  }>;
  subtasks?: Subtask[];
  isComparison?: boolean;
  responses?: CompareResponse[];
}

export interface ImageResponse {
  success: boolean;
  imageUrl: string;
  prompt: string;
  isSimulated: boolean;
  note?: string;
  durationMs?: number;
}

export interface EnhancePromptResponse {
  success: boolean;
  enhancedPrompt: string;
}

export interface PerformanceResponse {
  metrics: Record<string, ModelMetrics>;
  mappings: Record<string, string>;
}

export interface EvaluateResponse {
  success: boolean;
  metrics: Record<string, ModelMetrics>;
  mappings: Record<string, string>;
  benchmarkDurationMs: number;
}

export interface RouteMapResponse {
  success: boolean;
  mappings: Record<string, string>;
}

export const api = {
  async chat(params: {
    prompt: string;
    history: any[];
    mode: "auto" | "direct" | "compare";
    activeModelId?: string;
    compareModels?: string[];
    memories: string[];
    openRouterKey?: string;
  }): Promise<ChatResponse> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: params.prompt,
        history: params.history,
        mode: params.mode,
        activeModelId: params.activeModelId,
        compareModels: params.compareModels,
        memories: params.memories,
        config: {
          openRouterKey: params.openRouterKey || ""
        }
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async generateImage(params: {
    prompt: string;
    aspectRatio: string;
    style: string;
    negativePrompt?: string;
    seed?: string;
    cfgScale?: number;
  }): Promise<ImageResponse> {
    const res = await fetch("/api/image/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async enhancePrompt(prompt: string, style?: string): Promise<EnhancePromptResponse> {
    const res = await fetch("/api/image/enhance-prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async getPerformance(): Promise<PerformanceResponse> {
    const res = await fetch("/api/performance");
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
  },

  async evaluatePerformance(): Promise<EvaluateResponse> {
    const res = await fetch("/api/performance/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
  },

  async updateRoutingMap(category: string, model: string): Promise<RouteMapResponse> {
    const res = await fetch("/api/performance/map", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, model })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  },

  async getHealth(): Promise<{ status: string }> {
    const res = await fetch("/api/health");
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    return res.json();
  },

  async analyzeFile(file: File, prompt: string): Promise<{ analysis: string; mimeType: string; fileName: string }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    const res = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }
    return res.json();
  }
};
