export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streamingContent?: string;      // live streaming buffer
  isStreaming?: boolean;           // true while tokens arriving
  modelUsed?: string[];
  subtasks?: Subtask[];
  isComparison?: boolean;
  compareResponses?: CompareResponse[];
  thinkingTimeMs?: number;
  timestamp: Date;
  attachments?: Attachment[];
  tokenCount?: number;
  isError?: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  agent: string;
  status: 'done' | 'failed' | 'running';
  explanation: string;
  output: string;
}

export interface CompareResponse {
  modelId: string;
  modelName: string;
  content: string;
  status: 'done' | 'failed' | 'streaming';
  durationMs: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  systemPrompt?: string;
}

export interface Attachment {
  name: string;
  type: string;
  base64: string;
  preview?: string;
}

export interface ModelMetrics {
  latencyMs: number;
  successRate: number;
  costScore: number;
  intelligenceScore: number;
  evalRating: number;
  totalRequests: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ChatMode = 'auto' | 'direct' | 'compare';

export type ModelId = 
  | 'GPT-4o' 
  | 'Claude 3.5' 
  | 'Gemini 2.5' 
  | 'DeepSeek R1' 
  | 'Grok 2' 
  | 'Perplexity' 
  | 'Gemini Nano';

export const MODEL_COLORS: Record<string, string> = {
  'GPT-4o':      '#10a37f',   // green
  'Claude 3.5':  '#d97706',   // orange  
  'Gemini 2.5':  '#3b82f6',   // blue
  'DeepSeek R1': '#ef4444',   // red
  'Grok 2':      '#eab308',   // yellow
  'Perplexity':  '#8b5cf6',   // purple
  'Gemini Nano': '#06b6d4',   // cyan
};

export const MODEL_DESCRIPTIONS: Record<string, string> = {
  'GPT-4o':      'Best for writing, creativity, general tasks',
  'Claude 3.5':  'Best for coding, reasoning, long documents',
  'Gemini 2.5':  'Best for research, multimodal, large context',
  'DeepSeek R1': 'Best for math, logic, deep reasoning',
  'Grok 2':      'Best for real-time info, casual tasks',
  'Perplexity':  'Best for web search, citations, research',
  'Gemini Nano': 'Fastest, best for simple quick tasks',
};
