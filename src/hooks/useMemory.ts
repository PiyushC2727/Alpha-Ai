import { useState, useEffect } from "react";

export interface MemoryItem {
  content: string;
  category: string;
  reason: string;
  timestamp: string;
}

export function useMemory() {
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const stored = localStorage.getItem("alpha_memories_detailed");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse memories", e);
    }
    return [
      {
        content: "Prefers TypeScript for complex logic",
        category: "preference",
        reason: "User specified preference for type-safety",
        timestamp: new Date().toLocaleDateString()
      },
      {
        content: "Vite dev server is on port 3000",
        category: "technical",
        reason: "System configured for container ingress routing",
        timestamp: new Date().toLocaleDateString()
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem("alpha_memories_detailed", JSON.stringify(memories));
    } catch (e) {
      console.error("Failed to persist memories", e);
    }
  }, [memories]);

  const addMemory = (content: string, category = "preference", reason = "Inferred from conversation") => {
    // Avoid exact duplicate content
    if (memories.some(m => m.content.toLowerCase() === content.toLowerCase())) return;

    const newMemory: MemoryItem = {
      content,
      category,
      reason,
      timestamp: new Date().toLocaleDateString()
    };
    setMemories(prev => [newMemory, ...prev]);
  };

  const removeMemory = (index: number) => {
    setMemories(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearMemories = () => {
    setMemories([]);
  };

  return {
    memories,
    memoryStrings: memories.map(m => m.content),
    addMemory,
    removeMemory,
    clearMemories
  };
}
