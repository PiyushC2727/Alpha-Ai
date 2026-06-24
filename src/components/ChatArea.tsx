import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Cpu,
  CheckCircle2,
  Hourglass,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Search,
  Code2,
  FileText,
  Workflow,
  Sparkle,
  Copy,
  Check,
  X,
  ArrowRightLeft
} from 'lucide-react';
import { Message, Subtask, RouterConfig, Memory, ChatSession } from '../types';

interface ChatAreaProps {
  activeSession: ChatSession | null;
  isGenerating: boolean;
  onSendMessage: (content: string, attachments: Array<{ name: string; size: string; type: string; content?: string }>) => void;
  onUpdateSessionSettings: (id: string, settings: Partial<ChatSession>) => void;
  config: RouterConfig;
  memories: Memory[];
  setMemories: (memories: Memory[]) => void;
}

export default function ChatArea({
  activeSession,
  isGenerating,
  onSendMessage,
  onUpdateSessionSettings,
  config,
  memories,
  setMemories,
}: ChatAreaProps) {
  const activeSessionMessages = activeSession ? activeSession.messages : [];
  
  // Extract and default sticky mode preferences
  const sessionMode = activeSession?.sessionMode || 'direct';
  const activeModelId = activeSession?.activeModelId || 'GPT-4o';
  const compareModels = activeSession?.compareModels || ['GPT-4o', 'Claude 3.5', 'Gemini 2.5'];
  const [inputText, setInputText] = useState('');
  const [isMicListening, setIsMicListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [expandedOrchestrationId, setExpandedOrchestrationId] = useState<string | null>(null);
  const [expandedSubtaskOutputId, setExpandedSubtaskOutputId] = useState<string | null>(null);
  
  // Custom Memory Inscription UI State
  const [memoryInscribeMsgId, setMemoryInscribeMsgId] = useState<string | null>(null);
  const [memoryInscribeText, setMemoryInscribeText] = useState('');
  const [memoryInscribeCategory, setMemoryInscribeCategory] = useState<'preference' | 'identity' | 'project' | 'technical' | 'other'>('preference');
  const [justSavedMessageId, setJustSavedMessageId] = useState<string | null>(null);
  const [justSavedReason, setJustSavedReason] = useState('');

  const handleInscribeClick = (messageId: string, content: string) => {
    setMemoryInscribeMsgId(messageId);
    // Strip markdown annotations clean for memory storage if possible, else just trim
    const cleanContent = content
      .replace(/#+\s+/g, '') // remove headings markers
      .replace(/\*{1,3}/g, '') // remove bold/italic markers
      .replace(/`{1,3}/g, '') // remove backticks
      .trim();
    
    // Truncate to a reasonable sentence length so it's a neat fact
    const splitSentences = cleanContent.split(/[.!?]\s+/);
    const suggestedFact = splitSentences[0] || cleanContent;
    setMemoryInscribeText(suggestedFact);
    setMemoryInscribeCategory('preference');
  };

  const handleSaveInscribedMemory = (messageId: string) => {
    if (!memoryInscribeText.trim()) return;
    const newMemory: Memory = {
      id: "mem_" + Math.random().toString(36).substring(2, 9),
      content: memoryInscribeText.trim(),
      category: memoryInscribeCategory,
      createdAt: new Date().toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: '2-digit'
      })
    };
    setMemories([newMemory, ...memories]);
    
    // Clear and show confirmation
    setMemoryInscribeMsgId(null);
    setJustSavedMessageId(messageId);
    setJustSavedReason(`Inscribed explicitly under category "${memoryInscribeCategory}"`);
    setTimeout(() => {
      setJustSavedMessageId(null);
      setJustSavedReason('');
    }, 4000);
  };
  
  // File upload state
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string; type: string; content?: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionMessages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    onSendMessage(inputText, attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const executeMicSimulation = () => {
    if (isMicListening) {
      setIsMicListening(false);
      return;
    }

    setIsMicListening(true);
    
    // Simulate speech-to-text typing out
    const phrases = [
      "Analyze the current market landscape of artificial intelligence orchestrators and draft a summary",
      "Explain the key architectural advantages of using a multi-agent router",
      "Write an optimized typescript function to merge and filter large arrays of logs",
    ];
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    let currentText = '';
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < randomPhrase.length) {
        currentText += randomPhrase[index];
        setInputText(currentText);
        index++;
      } else {
        clearInterval(interval);
        setIsMicListening(false);
      }
    }, 45);
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = [...attachments];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.ceil(file.size / 1024)} KB`;
      
      newAttachments.push({
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop() || 'txt',
        content: `Attached file contents of reference ${file.name}`
      });
    }

    setAttachments(newAttachments);
  };

  const handleCopyText = (text: string, id: string) => {
    try {
      if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(text).catch((err) => {
          console.warn("Navigator clipboard failed, using input fallback:", err);
          fallbackCopyText(text);
        });
      } else {
        fallbackCopyText(text);
      }
    } catch (e) {
      console.warn("Clipboard copy failed:", e);
    }
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      // Hide element offscreen
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Manual fallback copy occurred an error:", err);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getAgentIcon = (agent: string) => {
    switch (agent) {
      case 'Claude 3.5':
        return <Code2 className="w-4 h-4 text-amber-500" />;
      case 'Perplexity':
        return <Search className="w-4 h-4 text-teal-500" />;
      case 'GPT-4o':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'Gemini 2.5':
      case 'Gemini 3.1':
        return <Cpu className="w-4 h-4 text-indigo-500" />;
      case 'DeepSeek R1':
        return <Cpu className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'Grok 2':
        return <Sparkle className="w-4 h-4 text-violet-500" />;
      default:
        return <Sparkle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden relative" id="chat-stage">
      
      {/* Control Navigation Header */}
      {activeSession && (
        <div className="px-6 py-3 border-b border-gray-200 dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] flex flex-col lg:flex-row lg:items-center justify-between gap-3 z-30" id="control-navigation-header">
          {/* Streamlined OS Orchestration Core Indicator */}
          <div className="flex items-center gap-2.5" id="alpha-os-routing-header">
            <Cpu className="w-4 h-4 text-indigo-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-800 dark:text-neutral-100 flex items-center gap-1.5">
                Alpha AI Operating System Active
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </span>
              <span className="text-[10px] text-neutral-400">Intelligent Task Routing Engine is automatically allocating queries</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-sans font-semibold bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/10 dark:border-indigo-900/35 px-2.5 py-1 rounded-lg" id="orchestrator-mode-settings">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span>Cooperative Synthesis Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable messages panel */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 space-y-6 scrollbar-thin" id="chats-scroller">
        {activeSessionMessages.length === 0 ? (
          /* Empty/Welcome Screen */
          <div className="max-w-2xl mx-auto text-center py-12 md:py-20 flex flex-col items-center gap-5" id="welcome-chat-screen">
            <div className="relative">
              <div className="w-12 h-12 rounded bg-black dark:bg-white flex items-center justify-center text-white dark:text-black border border-neutral-300 dark:border-[#262626] shadow-sm">
                <Workflow className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#FAFAFA] dark:border-[#0A0A0A]" />
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="font-sans font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                Alpha AI OS
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#737373] max-w-sm mx-auto leading-relaxed">
                A unified multi-agent operating interface coordinating GPT-4o, Claude 3.5, Gemini 3.1, and Perplexity in parallel.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full self-stretch text-left mt-4" id="prompts-grid">
              {[
                {
                  title: 'Optimize TypeScript Code',
                  prompt: 'Write an optimized typescript helper function to parse, clean, and deduplicate an array of logs.',
                  agent: 'Claude 3.5'
                },
                {
                  title: 'Aesthetic Web Research',
                  prompt: 'Analyze current 2026 digital tech trends and detail reference citations for unified operating layers.',
                  agent: 'Perplexity'
                },
                {
                  title: 'Formulate Business Brief',
                  prompt: 'Draft an executive briefing detailing why dual-path routing decreases LLM latencies and APIs spending by 60%.',
                  agent: 'GPT-4o'
                },
                {
                  title: 'General Synthesis Review',
                  prompt: 'Check potential contradictions in routing strategies and outline how to maintain maximum memory contextual integrity.',
                  agent: 'Gemini 3.1'
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(item.prompt)}
                  className="p-3.5 rounded border border-gray-200 dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-gray-400 dark:hover:border-[#737373] text-left transition-all flex flex-col gap-1 cursor-pointer"
                  id={`preset-prompt-${idx}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                      {item.title}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 dark:text-[#A3A3A3] border border-gray-200 dark:border-[#262626] px-1.5 py-0.2 rounded">
                      Node: {item.agent}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-[#525252] line-clamp-2 mt-1">
                    "{item.prompt}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Render Active Messages Stream */
          <div className="max-w-3xl mx-auto space-y-6" id="messages-list">
            {activeSessionMessages.map((message) => {
              const isUser = message.role === 'user';
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  id={`message-row-${message.id}`}
                >
                  <div className={`max-w-[85%] relative flex flex-col gap-1.5`}>
                    
                    {/* Role Title and Metadata */}
                    <div className={`flex items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />}
                      <span>
                        {isUser 
                          ? 'Local Terminal User' 
                          : message.isComparison 
                            ? 'Alpha Parallel Compare Engine' 
                            : message.activeModelId 
                              ? `Response from ${message.activeModelId}` 
                              : 'Alpha Orchestrated System'
                        }
                      </span>
                      <span>•</span>
                      <span>{message.timestamp}</span>
                    </div>

                    {/* Chat Bubble card container */}
                    {!isUser && message.isComparison ? (
                      /* Render Comparison Bento Grid Panel */
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-1.5 w-[90vw] max-w-5xl" id={`comparison-grid-${message.id}`}>
                        {message.responses && message.responses.map((resp: any, rIdx: number) => {
                          const isDeepSeekR1 = resp.modelId === 'DeepSeek R1';
                          let displayContent = resp.content || "";
                          let thinkContent = "";
                          if (isDeepSeekR1 && resp.content && resp.content.includes('<think>')) {
                            const match = resp.content.match(/<think>([\s\S]*?)<\/think>/);
                            if (match) {
                              thinkContent = match[1].trim();
                              displayContent = resp.content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
                            }
                          }

                          return (
                            <div
                              key={resp.modelId}
                              className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#262626] rounded overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                              id={`compare-card-${message.id}-${resp.modelId}`}
                            >
                              {/* Model Branding header */}
                              <div className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border-b border-gray-150 dark:border-[#262626] flex items-center justify-between">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="p-1 rounded bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#262626]">
                                    {getAgentIcon(resp.modelId)}
                                  </div>
                                  <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 truncate">
                                    {resp.modelName || resp.modelId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-mono text-neutral-400">
                                    {resp.durationMs ? `${(resp.durationMs / 1000).toFixed(1)}s` : 'Simulated'}
                                  </span>
                                  <button
                                    onClick={() => handleCopyText(resp.content, `compare-${message.id}-${rIdx}`)}
                                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                                    title="Copy response text"
                                  >
                                    {copiedIndex === `compare-${message.id}-${rIdx}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Content output with markdown styling */}
                              <div className="p-4 flex-1 flex flex-col gap-3 min-w-0">
                                {thinkContent && (
                                  <div className="text-[10.5px] font-mono text-neutral-500 bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded border border-dashed border-neutral-200 dark:border-neutral-850">
                                    <div className="text-[9px] uppercase font-bold text-indigo-505 mb-1 flex items-center gap-1">
                                      <Cpu className="w-3 h-3 animate-pulse" />
                                      Reasoning Trace:
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                                      {thinkContent}
                                    </div>
                                  </div>
                                )}

                                <div className="prose dark:prose-invert prose-xs text-xs font-sans leading-relaxed max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                  <ReactMarkdown>{displayContent}</ReactMarkdown>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className={`rounded px-4 py-3.5 shadow-sm leading-relaxed border ${
                          isUser
                            ? 'bg-[#F3F3F3] border-[#E2E2E2] text-black dark:bg-[#1A1A1A] dark:border-[#262626] dark:text-white rounded-tr-none'
                            : 'bg-[#FAFAFA] border-gray-250 text-gray-850 dark:bg-[#111111] dark:border-[#262626] dark:text-[#E5E5E5] rounded-tl-none'
                        }`}
                        id={`bubble-${message.id}`}
                      >
                        {/* Attached files preview inside bubble */}
                        {message.attachedFiles && message.attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3.5 pb-2.5 border-b border-gray-150 dark:border-neutral-800" id={`attachments-bubble-${message.id}`}>
                            {message.attachedFiles.map((f, i) => (
                              <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded text-[10px] font-mono text-gray-500">
                                <FileText className="w-3.5 h-3.5 text-indigo-505" />
                                <span className="truncate max-w-[120px]">{f.name}</span>
                                <span className="text-gray-400">({f.size})</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Content rendering block */}
                        <div className="prose dark:prose-invert prose-xs max-w-none text-xs md:text-sm font-sans" id={`content-markdown-${message.id}`}>
                          <ReactMarkdown
                            components={{
                              // Custom code syntax styling
                              code({ node, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                const currentCodeText = String(children).replace(/\n$/, '');
                                const isBlock = !!match;
                                
                                return isBlock ? (
                                  <div className="my-3 rounded border border-neutral-200 dark:border-[#262626] overflow-hidden bg-neutral-950" id={`code-block-${message.id}`}>
                                    <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900 border-b border-neutral-200 dark:border-[#262626] text-[10px] font-mono text-neutral-400">
                                      <span>{match ? match[1].toUpperCase() : 'CODE BLOCK'}</span>
                                      <button
                                        onClick={() => handleCopyText(currentCodeText, `${message.id}-${children}`)}
                                        className="flex items-center gap-1 hover:text-white transition-all cursor-pointer font-sans"
                                        aria-label="Copy code blocks cursor"
                                      >
                                        {copiedIndex === `${message.id}-${children}` ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-emerald-500">Copied</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <pre className="p-3.5 overflow-x-auto text-neutral-200 font-mono text-[11px] leading-relaxed">
                                      <code>{children}</code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-neutral-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded text-black dark:text-white font-mono text-[11px] border border-gray-150 dark:border-neutral-800">
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Memory Inscription Panel / Explicit Save Button */}
                        {memoryInscribeMsgId === message.id ? (
                          <div className="mt-3 p-3 rounded bg-white dark:bg-[#151515] border border-gray-200 dark:border-[#262626] flex flex-col gap-2.5 animate-fade-in text-xs text-black dark:text-white" id={`inscribe-form-${message.id}`}>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#202020] pb-1.5 font-sans">
                              <span className="font-mono text-[9.5px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                                <Sparkle className="w-3.5 h-3.5 text-indigo-505" /> Code & Fact Neural Inscription
                              </span>
                              <button onClick={() => setMemoryInscribeMsgId(null)} className="hover:text-red-505 text-gray-400 dark:hover:text-white hover:text-black transition-colors bg-transparent border-0 cursor-pointer" title="Cancel">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            
                            <label className="text-[10px] text-gray-500 font-medium font-sans">Refine Snippet containing Key Facts / Preferences:</label>
                            <textarea
                              value={memoryInscribeText}
                              onChange={(e) => setMemoryInscribeText(e.target.value)}
                              className="w-full p-2 text-xs bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#262626] rounded resize-y focus:outline-none focus:border-indigo-505 font-sans text-black dark:text-white"
                              rows={2}
                              placeholder="Type facts or preferred workflows to remember"
                            />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500 font-medium font-sans">Category:</span>
                                <select
                                  value={memoryInscribeCategory}
                                  onChange={(e) => setMemoryInscribeCategory(e.target.value as any)}
                                  className="text-[10px] font-mono bg-[#FAFAFA] dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#262626] rounded p-1 text-black dark:text-white focus:outline-none focus:border-indigo-550 cursor-pointer"
                                >
                                  <option value="preference">Preference</option>
                                  <option value="identity">Identity</option>
                                  <option value="project">Project Specs</option>
                                  <option value="technical">Technical Specs</option>
                                  <option value="other">Other Info</option>
                                </select>
                              </div>
                              
                              <button
                                onClick={() => handleSaveInscribedMemory(message.id)}
                                className="w-full sm:w-auto px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded text-[11px] font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
                              >
                                <Check className="w-3.5 h-3.5" /> Inscribe Fact
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-150/30 dark:border-[#262626]/30">
                            <span className="text-[9px] font-mono">
                              {justSavedMessageId === message.id ? (
                                <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Fact Saved!
                                </span>
                              ) : null}
                            </span>
                            <button
                              onClick={() => handleInscribeClick(message.id, message.content)}
                              className="p-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-neutral-400 hover:text-indigo-650 dark:hover:text-white flex items-center gap-1.5 transition-all text-[9.5px] font-mono cursor-pointer bg-transparent border-0"
                              title="Inscribe key facts from this message to the AI Memory Bank"
                            >
                              <Sparkle className="w-3.5 h-3.5 text-indigo-505" />
                              <span>🧠 Save to Memory</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Auto Inferred Preferences Section */}
                    {!isUser && message.inferredMemories && message.inferredMemories.length > 0 && (
                    <div className="flex flex-col mt-2 p-3.5 rounded border border-emerald-100/50 dark:border-[#262626] bg-emerald-50/5 dark:bg-emerald-950/5 text-xs animate-fade-in gap-2" id={`auto-inferred-section-${message.id}`}>
                      <div className="flex items-center gap-1.5 font-sans font-bold text-emerald-800 dark:text-emerald-400">
                        <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <span>Dynamic OS Memory Inferred</span>
                      </div>
                      <p className="text-[10px] text-emerald-600/90 dark:text-emerald-400/70 leading-relaxed font-sans">
                        Alpha OS analyzed this turn and registered recurring themes directly into your Neural Memory Core:
                      </p>
                      <div className="flex flex-col gap-2 mt-1">
                        {message.inferredMemories.map((inf, idx) => (
                          <div key={idx} className="p-2.5 rounded bg-white/40 dark:bg-[#0c0c0c]/40 border border-emerald-200/30 dark:border-emerald-900/10 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 dark:text-white text-xs">
                                "{inf.content}"
                              </span>
                              <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded border bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/40 dark:border-emerald-900/30 font-bold dark:text-emerald-400 text-emerald-800">
                                {inf.category}
                              </span>
                            </div>
                            <span className="text-[9.5px] text-gray-500 font-mono">
                              Reason: {inf.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                    {/* Expandable Multi-Agent Collaboration Panel */}
                    {!isUser && message.orchestration && (
                      <div className="flex flex-col mt-1" id={`orchestration-block-${message.id}`}>
                        <button
                          onClick={() => setExpandedOrchestrationId(
                            expandedOrchestrationId === message.id ? null : message.id
                          )}
                          className="flex items-center gap-1.5 text-[9.5px] font-mono font-semibold tracking-wider uppercase bg-transparent text-gray-500 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white border border-gray-205 dark:border-[#262626] w-fit px-2.5 py-1 rounded cursor-pointer transition-all self-start"
                          id={`toggle-orchestration-btn-${message.id}`}
                        >
                          <Workflow className="w-3 h-3 text-indigo-500 animate-spin" />
                          <span>M-Agent Orchestration Logs</span>
                          {expandedOrchestrationId === message.id ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Collapsible drawer content */}
                        {expandedOrchestrationId === message.id && (
                          <div className="mt-2.5 bg-[#FAF9F6] dark:bg-[#0A0A0A] rounded p-3.5 border border-gray-200 dark:border-[#262626] flex flex-col gap-3 max-w-full shadow-inner animate-fade-in" id={`orchestration-details-${message.id}`}>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-[#262626] pb-2.5 gap-2 text-xs">
                              <span className="font-sans font-semibold text-gray-800 dark:text-neutral-200 flex items-center gap-1.5">
                                <Cpu className="w-3.5 h-3.5 text-indigo-505" />
                                Model Execution Blueprint
                              </span>
                              <div className="flex flex-wrap items-center gap-3.5 font-mono text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  Routing Synthesis: {message.orchestration.thinkingTimeMs}ms
                                </span>
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  Nodes: {message.orchestration.usedModels.join(', ')}
                                </span>
                              </div>
                            </div>

                            {/* Subtask execution queue cards */}
                            <div className="flex flex-col gap-2">
                              {message.orchestration.subtasks.map((sub: Subtask, idx: number) => {
                                const isSubtaskOutputExpanded = expandedSubtaskOutputId === `${message.id}-${sub.id}`;
                                return (
                                  <div
                                    key={sub.id}
                                    className="p-3 bg-white dark:bg-neutral-950 rounded-lg border border-gray-200 dark:border-neutral-850 flex flex-col gap-2"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <div className="flex items-start gap-2">
                                        <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800">
                                          {getAgentIcon(sub.agent)}
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 truncate">
                                              Subtask #{idx + 1}: {sub.title}
                                            </span>
                                          </div>
                                          <span className="text-[10px] font-mono text-gray-400">
                                            Delegated: <span className="font-bold text-indigo-505 dark:text-indigo-400">{sub.agent}</span>
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <span className="text-[9.5px] font-mono uppercase bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          {sub.status}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Subtask choice rationale */}
                                    <p className="text-[10px] text-gray-450 dark:text-neutral-500 leading-normal pl-9">
                                      Rationale: {sub.explanation}
                                    </p>

                                    {/* Individual Model Output Inspection */}
                                    {sub.output && (
                                      <div className="pl-9 flex flex-col gap-1.5">
                                        <button
                                          onClick={() => setExpandedSubtaskOutputId(
                                            isSubtaskOutputExpanded ? null : `${message.id}-${sub.id}`
                                          )}
                                          className="text-[9px] font-mono uppercase text-gray-450 hover:text-indigo-500 dark:text-neutral-400 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer self-start border border-dashed border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded"
                                          id={`toggle-subtask-output-${sub.id}`}
                                        >
                                          <span>{isSubtaskOutputExpanded ? 'Hide Raw Agent Output' : 'Inspect Raw Agent Output'}</span>
                                        </button>
                                        
                                        {isSubtaskOutputExpanded && (
                                          <div className="p-2.5 bg-neutral-50 dark:bg-neutral-900/60 border border-gray-150 dark:border-neutral-800 rounded-md text-[10.5px] leading-relaxed font-mono text-gray-650 dark:text-neutral-405 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {sub.output}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Generate Loader with Mode-specific layout */}
        {isGenerating && (
          <div className="max-w-3xl mx-auto flex flex-col gap-3.5 self-start w-full" id="active-generating-stage">
            {sessionMode === 'direct' ? (
              <div className="p-4 bg-white border border-gray-200 text-gray-850 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-3 max-w-full" id="direct-loader">
                <div className="flex items-center gap-2.5 text-xs font-sans font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  {getAgentIcon(activeModelId)}
                  <span>Querying {activeModelId} Core Node...</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
                  <Hourglass className="w-3.5 h-3.5 animate-spin text-gray-400" />
                  <span>Streaming text generation from endpoint...</span>
                </div>
              </div>
            ) : sessionMode === 'compare' ? (
              <div className="p-4 bg-white border border-gray-200 text-gray-850 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-3 max-w-full" id="compare-loader">
                <div className="flex items-center gap-2.5 text-xs font-sans font-bold text-indigo-650 dark:text-indigo-400 animate-pulse">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span>Initiating parallel dispatch for: {compareModels.join(', ')}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {compareModels.map((m) => (
                    <div key={m} className="p-2 bg-neutral-50 dark:bg-neutral-950 border border-gray-150 dark:border-neutral-850 rounded flex items-center gap-2">
                      {getAgentIcon(m)}
                      <span className="text-[10px] font-mono text-gray-500 truncate">{m}</span>
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white border border-gray-200 text-gray-850 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-4 max-w-full" id="orchestration-loader">
                {/* Central Core Status display */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-neutral-850 pb-3 gap-2">
                  <span className="text-xs font-sans font-bold text-indigo-650 dark:text-indigo-400 flex items-center gap-1.5 animate-pulse">
                    <Workflow className="w-4 h-4 animate-spin text-indigo-500" />
                    ALPHA ROUTER CLUSTER ENGAGED
                  </span>
                  <span className="text-[10px] font-mono text-neutral-450 dark:text-neutral-500 flex items-center gap-1">
                    <Hourglass className="w-3.5 h-3.5 animate-spin" />
                    Synthesizing logical layers...
                  </span>
                </div>

                {/* Staggered progress cards checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { agent: 'Claude 3.5', label: 'Compiling technical/code subtasks', timer: 'active' },
                    { agent: 'GPT-4o', label: 'Formulating text copywriting structures', timer: 'active' },
                    { agent: 'Gemini 3.1', label: 'Engaged high reasoning bounds check', timer: 'active' },
                    { agent: 'Perplexity', label: 'Auditing contemporary research citations', timer: 'active' }
                  ].map((loader, idx) => {
                    const isEnabled = config.selectedModels.includes(loader.agent);
                    if (!isEnabled) return null;

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-gray-150 dark:border-neutral-850 flex items-start gap-2.5 hover:shadow-xs transition-shadow"
                      >
                        <div className="mt-0.5 p-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100/30">
                          {getAgentIcon(loader.agent)}
                        </div>
                        <div className="flex flex-col gap-0.4 min-w-0 leading-tight">
                          <span className="text-[11px] font-bold text-gray-800 dark:text-neutral-300">
                            {loader.agent} Node
                          </span>
                          <span className="text-[10px] text-gray-450 dark:text-neutral-500 line-clamp-1">
                            {loader.label}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-400 mt-1 flex items-center gap-1 animate-pulse">
                            ● PROCESSING
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Pulsing Mic listening overlay element */}
      {isMicListening && (
        <div className="absolute inset-x-0 bottom-24 max-w-sm mx-auto p-4 bg-neutral-900 border border-neutral-800 text-white rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-40 animate-bounce leading-none" id="voice-overlay-wave">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <div className="flex flex-col gap-0.5 font-sans">
              <span className="text-xs font-bold">Dynamic Speech Capturer Engaged</span>
              <span className="text-[10px] text-neutral-400">Capturing audio... Speak naturally.</span>
            </div>
          </div>
          <button
            onClick={() => setIsMicListening(false)}
            className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            aria-label="Cancel Mic listening"
          >
            <MicOff className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      )}

      {/* Input area footer */}
      <div className="p-4 bg-white border-t border-gray-200 dark:bg-[#0A0A0A] dark:border-[#262626]" id="prompt-footer-controls">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-2">
          
          {/* File Attachments Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2 bg-neutral-50 dark:bg-[#111111] rounded border border-gray-150 dark:border-[#262626]" id="current-uploading-previews">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] p-1.5 rounded text-xs font-mono group"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-505" />
                  <span className="max-w-[120px] truncate text-gray-700 dark:text-neutral-300">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-400">({file.size})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="p-0.5 rounded bg-gray-100 dark:bg-[#262626] text-gray-450 hover:text-rose-500 group-hover:opacity-100 cursor-pointer"
                    aria-label="Remove attachment"
                    id={`remove-attachment-${idx}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Prompt Entry Box - Clean Minimalism Rounded Block */}
          <div className="relative border border-gray-250 dark:border-[#262626] focus-within:border-black dark:focus-within:border-[#A3A3A3] rounded bg-white dark:bg-[#111111] transition-all flex flex-col" id="prompt-entry-box">
            
            <textarea
              placeholder="Query the router (e.g. 'Synthesize a TypeScript code block checking active routing latency presets...')"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full text-xs md:text-sm bg-transparent border-0 focus:ring-0 focus:outline-none p-3.5 text-gray-800 dark:text-neutral-100 resize-none h-20 placeholder:text-neutral-500 font-sans"
              aria-label="Prompt Input text area"
              id="prompt-input-text"
            />

            {/* In-box Actions bar */}
            <div className="flex items-center justify-between px-3.5 py-2 border-t border-gray-100 dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] rounded-b" id="input-controls-row">
              <div className="flex items-center gap-2">
                {/* File Attachment Hidden input */}
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="attachment-file-input"
                  aria-label="File Attachment input"
                />
                
                <button
                  type="button"
                  onClick={handleFileUploadClick}
                  className="p-1.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#1A1A1A] text-gray-500 dark:text-[#A3A3A3] transition-all cursor-pointer flex"
                  title="Attach logs, code or documents"
                  id="attach-file-btn"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={executeMicSimulation}
                  className={`p-1.5 rounded transition-all cursor-pointer flex ${isMicListening ? 'text-red-500 bg-red-50 dark:bg-red-950/25' : 'text-gray-500 dark:text-[#A3A3A3] hover:bg-gray-205 dark:hover:bg-[#1A1A1A]'}`}
                  title="Speak custom query"
                  id="microphone-sim-btn"
                >
                  <Mic className="w-4 h-4 animate-pulse" />
                </button>
              </div>

              <div className="flex items-center gap-2.5 text-[10px] text-gray-400 font-mono">
                <span className="hidden sm:inline">Press Enter to dispatch</span>
                
                <button
                  type="submit"
                  disabled={isGenerating || (!inputText.trim() && attachments.length === 0)}
                  className="p-1.5 bg-black hover:bg-neutral-850 disabled:bg-gray-200 dark:bg-white dark:hover:bg-neutral-200 dark:disabled:bg-[#1E1E1E] text-white dark:text-black disabled:text-gray-400 rounded transition-all shadow-xs cursor-pointer active:scale-95 flex"
                  id="send-prompt-btn"
                  aria-label="Send prompt button"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
