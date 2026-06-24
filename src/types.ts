export interface Subtask {
  id: string;
  title: string;
  agent: 'GPT-4o' | 'Claude 3.5' | 'Gemini 2.5' | 'Gemini 3.1' | 'DeepSeek R1' | 'Grok 2' | 'Perplexity' | string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  output?: string;
  explanation: string;
}

export interface OrchestrationDetail {
  subtasks: Subtask[];
  synthesizedResponse: string;
  usedModels: string[];
  thinkingTimeMs: number;
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  content: string;
  status: 'pending' | 'done' | 'failed';
  durationMs?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isOrchestrated?: boolean;
  orchestration?: OrchestrationDetail;
  activeModelId?: string; // For direct model responses
  isComparison?: boolean; // True if message contains multi-model parallel answers
  responses?: ModelResponse[]; // Grid of comparisons
  attachedFiles?: Array<{
    name: string;
    size: string;
    type: string;
    content?: string;
  }>;
  inferredMemories?: Array<{
    content: string;
    category: 'preference' | 'identity' | 'project' | 'technical' | 'other';
    reason: string;
  }>;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
  sessionMode?: 'direct' | 'compare' | 'orchestrated';
  activeModelId?: string; // sticky active single model
  compareModels?: string[]; // sticky models chosen for comparison
}

export interface Memory {
  id: string;
  content: string;
  createdAt: string;
  category: 'preference' | 'identity' | 'project' | 'technical' | 'other';
  isAutoInferred?: boolean;
  inferredReason?: string;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  content: string;
  fileType: string;
  fileSize: string;
  uploadedAt: string;
  tokenCount: number;
}

export interface RouterConfig {
  mode: 'auto' | 'intelligence' | 'speed' | 'custom';
  openRouterKey?: string;
  selectedModels: string[];
  weights: {
    'GPT-4o': number;
    'Claude 3.5': number;
    'Gemini 2.5': number;
    'DeepSeek R1': number;
    'Grok 2': number;
    'Perplexity': number;
    'Gemini Nano'?: number;
  };
}

export interface RoutingMetric {
  date: string;
  'GPT-4o': number;
  'Claude 3.5': number;
  'Gemini 2.5': number;
  'DeepSeek R1': number;
  'Grok 2': number;
  'Perplexity': number;
  'Gemini Nano'?: number;
}
