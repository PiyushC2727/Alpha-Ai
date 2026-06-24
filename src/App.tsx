import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ImageGeneratorTab from './components/ImageGeneratorTab';
import { ChatSession, Memory, KnowledgeDoc, RouterConfig } from './types';
import { Sun, Moon, Cpu, BrainCircuit, Sparkles } from 'lucide-react';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'memory' | 'knowledge' | 'settings' | 'imaging'>('chats');

  // 1. Core Router Configuration (Load from localStorage if available)
  const [routerConfig, setRouterConfig] = useState<RouterConfig>(() => {
    try {
      const saved = localStorage.getItem('routerConfig');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse routerConfig from localStorage", e);
    }
    return {
      mode: 'auto',
      selectedModels: ['Claude 3.5', 'GPT-4o', 'Gemini 2.5', 'DeepSeek R1', 'Grok 2', 'Perplexity', 'Gemini Nano'],
      weights: {
        'Claude 3.5': 15,
        'GPT-4o': 15,
        'Gemini 2.5': 20,
        'DeepSeek R1': 20,
        'Grok 2': 10,
        'Perplexity': 10,
        'Gemini Nano': 10
      }
    };
  });

  // 2. Initial Sample Memories (with localStorage load)
  const [memories, setMemories] = useState<Memory[]>(() => {
    try {
      const saved = localStorage.getItem('memories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse memories from localStorage", e);
    }
    return [
      {
        id: "mem_1",
        content: "User prefers production-ready, highly typed ES Modules TypeScript code over CommonJS format.",
        createdAt: "06/21/26",
        category: "technical"
      },
      {
        id: "mem_2",
        content: "Development servers are strictly configured to bind to host '0.0.0.0' and listen exclusively on Port 3000.",
        createdAt: "06/22/26",
        category: "project"
      },
      {
        id: "mem_3",
        content: "The end product is named 'Alpha AI' - an advanced Personal AI Operating System.",
        createdAt: "06/23/26",
        category: "identity"
      }
    ];
  });

  // 3. Initial Sample Knowledge Documents (with localStorage load)
  const [knowledge, setKnowledge] = useState<KnowledgeDoc[]>(() => {
    try {
      const saved = localStorage.getItem('knowledge');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse knowledge from localStorage", e);
    }
    return [
      {
        id: "doc_1",
        title: "Core_Operating_System_Standard_Specs.md",
        content: "Technical standards of the Alpha OS Orchestrator Engine. Dynamic model weights allocation maps direct traffic loads. Latency is balanced synchronously by routing simple queries to Flash sub-pipelines.",
        fileType: "md",
        fileSize: "1.4 KB",
        uploadedAt: "Jun 23",
        tokenCount: 165
      }
    ];
  });

  // 4. Preloaded Chat Sessions (with localStorage load)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse sessions from localStorage", e);
    }
    return [
    {
      id: "session_welcome",
      title: "α Core Welcome Orientation",
      createdAt: "2026-06-23T08:20:00Z",
      messages: [
        {
          id: "msg_w1",
          role: "assistant",
          content: `### Welcome to Alpha AI (Personal AI Operating System) 🌍

I am your unified **Orchestration Router Core**. Through me, you tap into ChatGPT, Claude, Gemini, and Perplexity simultaneously as a coordinated cluster of specialized intelligence.

#### ⚙️ How Your AI Operating System Works:
1. **Dynamic Task Deconstruction**: Any prompt you submit is analyzed and split into subtasks.
2. **Specialized Routing**: Subtasks are routed to the model with the highest technical suitability (e.g., *Claude 3.5* for code compilers, *Perplexity* for current web fact sheets, *GPT-4o* for narrative formatting).
3. **Synchronous Synthesis**: The separate replies are combined into this single, high-fidelity comprehensive output, resolving factual conflicts automatically.

#### 🛠️ Explore Your Workspaces:
- **Neural Memory**: Add custom preference blocks in the sidebar. I will automatically consult them to customize recommendations.
- **Knowledge Base**: Index reference specifications or schematics. We will reference them securely in prompt context.
- **Router Settings**: Change weight ratios or toggle models completely. Recharts will visualize your computational balance.

Go ahead and type an inquiry below! Ask me to write code, synthesize a thesis, or find live news, and watch parallel AI orchestration in action.`,
          timestamp: "08:20 AM"
        }
      ]
    },
    {
      id: "session_demo",
      title: "High Performance Deduplication",
      createdAt: "2026-06-22T14:30:00Z",
      messages: [
        {
          id: "msg_u2",
          role: "user",
          content: "Draft a dynamic typescript helper to deduplicate array structures.",
          timestamp: "02:30 PM"
        },
        {
          id: "msg_a2",
          role: "assistant",
          content: `Here is your robust TypeScript array deduplication helper. Our backend orchestrated **Claude 3.5** to compile the types, and **GPT-4o** to refine the annotations.

### 💻 Production-Ready Helper

\`\`\`typescript
/**
 * Generic deduplication utility for primitive structures.
 * Optimizes complexity profiles from O(N^2) to O(N).
 */
export function removeDuplicates<T>(payload: T[]): T[] {
  if (!payload || payload.length === 0) return [];
  return [...new Set(payload)];
}
\`\`\`

- **Linear Time Complexity**: Utilizing \`Set\` ensures linear performance, running in $\\mathcal{O}(N)$ rather than standard nested loop configurations.
- **Type Safety**: Fully typed with Generics \`<T>\`, preserving elements layouts during collection indexing.`,
          timestamp: "02:31 PM",
          isOrchestrated: true,
          orchestration: {
            subtasks: [
              {
                id: "sub_demo_1",
                title: "Deduplication Code Compilation",
                agent: "Claude 3.5",
                status: "done",
                explanation: "Claude 3.5 was delegated code structure due to higher type-erasure review competencies.",
                output: "Compiled typescript deduplicator helper with clean O(N) Set implementation."
              },
              {
                id: "sub_demo_2",
                title: "Documentation Formatting & UX Refinement",
                agent: "GPT-4o",
                status: "done",
                explanation: "GPT-4o reviewed comment templates to maintain clean markup documentation.",
                output: "Formatted final markdown reply detailing time complexity benchmarks."
              }
            ],
            synthesizedResponse: "",
            usedModels: ["Claude 3.5", "GPT-4o"],
            thinkingTimeMs: 820
          }
        }
      ]
    }
  ];
});

  const [activeSessionId, setActiveSessionId] = useState<string | null>("session_welcome");

  // Toggle Dark class on page root element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Persist configurations and state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('routerConfig', JSON.stringify(routerConfig));
    } catch (e) {
      console.error("Failed to save routerConfig to localStorage", e);
    }
  }, [routerConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('memories', JSON.stringify(memories));
    } catch (e) {
      console.error("Failed to save memories to localStorage", e);
    }
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('knowledge', JSON.stringify(knowledge));
    } catch (e) {
      console.error("Failed to save knowledge to localStorage", e);
    }
  }, [knowledge]);

  useEffect(() => {
    try {
      localStorage.setItem('sessions', JSON.stringify(sessions));
    } catch (e) {
      console.error("Failed to save sessions to localStorage", e);
    }
  }, [sessions]);

  // Retrieve current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const activeSessionMessages = activeSession ? activeSession.messages : [];

  // Create a new blank thread container
  const createNewSession = (mode?: 'direct' | 'compare' | 'orchestrated', modelId?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const order = sessions.length + 1;
    const newSession: ChatSession = {
      id,
      title: mode === 'direct' ? `Chat with ${modelId || 'GPT-4o'}` : `Orchestration Thread #${order}`,
      createdAt: new Date().toISOString(),
      messages: [],
      sessionMode: mode || 'orchestrated',
      activeModelId: modelId || 'GPT-4o',
      compareModels: ['GPT-4o', 'Claude 3.5', 'Gemini 2.5']
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(id);
  };

  // Delete chat session
  const deleteSession = (id: string) => {
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename individual chat session title in drawer
  const renameSession = (id: string, newTitle: string) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleUpdateSessionSettings = (id: string, settings: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...settings } : s));
  };

  // Handle Dispatching inputs to Express Backend API Gateway
  const handleSendMessage = async (
    text: string,
    attachments: Array<{ name: string; size: string; type: string; content?: string }>
  ) => {
    let currentSessionId = activeSessionId;
    let currentSessions = sessions;

    if (!currentSessionId) {
      const id = Math.random().toString(36).substring(2, 9);
      const order = sessions.length + 1;
      const newSession: ChatSession = {
        id,
        title: `Orchestration Thread #${order}`,
        createdAt: new Date().toISOString(),
        messages: [],
        sessionMode: 'orchestrated',
        activeModelId: 'GPT-4o',
        compareModels: ['GPT-4o', 'Claude 3.5', 'Gemini 2.5']
      };
      currentSessions = [newSession, ...sessions];
      setSessions(currentSessions);
      setActiveSessionId(id);
      currentSessionId = id;
    }

    const userMessageTime = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });

    const userMsg = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user' as const,
      content: text,
      timestamp: userMessageTime,
      attachedFiles: attachments
    };

    // 1. Immediately append user input message
    const updatedSessions = currentSessions.map((s) => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    setIsGenerating(true);

    try {
      const activeSessionData = updatedSessions.find((s) => s.id === currentSessionId);
      const historyContext = activeSessionData ? activeSessionData.messages.slice(0, -1) : [];
      const sessionMode = activeSessionData?.sessionMode || 'direct';
      const activeModelId = activeSessionData?.activeModelId || 'GPT-4o';
      const compareModels = activeSessionData?.compareModels || ['GPT-4o', 'Claude 3.5', 'Gemini 2.5'];

      // 2. Dispatch payload package to port 3000 proxy gateway
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: historyContext,
          config: routerConfig,
          mode: sessionMode,
          activeModelId,
          compareModels,
          memories: memories.map(m => m.content),
          knowledge: knowledge.map(d => ({ title: d.title, content: d.content }))
        })
      });

      if (!response.ok) {
        throw new Error("API server responded with error status");
      }

      const replyData = await response.json();

      const assistantMessageTime = new Date().toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });

      // 3. Append detailed orchestrated response to conversation tree and register any inferred memories
      const inferredList = replyData.inferredMemories || [];
      const newInferredMemoriesMapped = inferredList.map((m: any) => ({
        id: "inf_" + Math.random().toString(36).substring(2, 9),
        content: m.content,
        category: m.category as Memory['category'],
        createdAt: new Date().toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', year: '2-digit'
        }),
        isAutoInferred: true,
        inferredReason: m.reason
      }));

      if (newInferredMemoriesMapped.length > 0) {
        setMemories((prev) => [...newInferredMemoriesMapped, ...prev]);
      }

      const finalReplyMsg = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant' as const,
        content: replyData.synthesizedResponse || "",
        timestamp: assistantMessageTime,
        isOrchestrated: sessionMode === 'orchestrated' && replyData.subtasks && replyData.subtasks.length > 0,
        orchestration: sessionMode === 'orchestrated' ? {
          subtasks: replyData.subtasks || [],
          synthesizedResponse: replyData.synthesizedResponse,
          usedModels: replyData.usedModels || [],
          thinkingTimeMs: replyData.thinkingTimeMs || 0
        } : undefined,
        activeModelId: sessionMode === 'direct' ? activeModelId : undefined,
        isComparison: sessionMode === 'compare',
        responses: replyData.responses || [],
        inferredMemories: newInferredMemoriesMapped
      };

      setLatency(replyData.thinkingTimeMs || 0);

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id === currentSessionId) {
            // Check if thread title is the generic placeholder, rename dynamically based on prompt words!
            const isPlaceholder = s.title.startsWith("Orchestration Thread");
            const newTitle = isPlaceholder 
              ? text.split(" ").slice(0, 4).join(" ") + "..." 
              : s.title;

            return {
              ...s,
              title: newTitle,
              messages: [...s.messages, finalReplyMsg]
            };
          }
          return s;
        })
      );

    } catch (err) {
      console.error("Transmission error inside OS dispatch handler:", err);
      
      // Fallback response inside client if server drops connection
      setTimeout(() => {
        const fallbackMsg = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant' as const,
          content: "### System Transmission Error\nOur central Gateway API on port 3000 appeared busy or was unavailable. Please ensure your Express environment is running normally, or try refreshing the dev container server. Your conversation text is preserved locally.",
          timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
        };
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessionId) {
              return { ...s, messages: [...s.messages, fallbackMsg] };
            }
            return s;
          })
        );
      }, 800);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-100 text-gray-900 font-sans leading-relaxed transition-colors duration-300 dark:bg-neutral-950 dark:text-gray-150" id="alpha-os-root">
      
      {/* Dynamic Top bar Dashboard */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        config={routerConfig}
        isGenerating={isGenerating}
        activeModels={routerConfig.selectedModels}
        latency={latency}
      />

      <div className="flex-1 flex overflow-hidden relative" id="workspace-layout">
        
        {/* Navigation Sidebar Panel */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          sessions={sessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          createNewSession={createNewSession}
          deleteSession={deleteSession}
          renameSession={renameSession}
          memories={memories}
          setMemories={setMemories}
          knowledge={knowledge}
          setKnowledge={setKnowledge}
          config={routerConfig}
          setConfig={setRouterConfig}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Central Terminal Stage */}
        {activeTab === 'imaging' ? (
          <ImageGeneratorTab />
        ) : (
          <ChatArea
            activeSession={activeSession}
            isGenerating={isGenerating}
            onSendMessage={handleSendMessage}
            onUpdateSessionSettings={handleUpdateSessionSettings}
            config={routerConfig}
            memories={memories}
            setMemories={setMemories}
          />
        )}

        {/* Floating Controls: Theme & System Status */}
        <div className="absolute top-2.5 right-4 z-50 flex items-center gap-1.5" id="floating-actions-bar">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-650 dark:text-neutral-400 cursor-pointer shadow-sm active:scale-95 transition-all text-xs flex items-center gap-1.5 font-mono"
            aria-label="Toggle Theme Mode"
            id="theme-toggler"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                <span className="hidden md:inline">Solar mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-505" />
                <span className="hidden md:inline">Luna mode</span>
              </>
            )
            }
          </button>
        </div>

      </div>
    </div>
  );
}
