import { Message, ChatMode } from "../types";

export function useStream() {
  const streamMessage = async (
    prompt: string,
    history: Message[],
    mode: ChatMode,
    activeModelId: string,
    openRouterKey: string,
    onToken: (token: string) => void,
    onDone: (meta: { usedModels: string[]; thinkingTimeMs: number; subtasks: any[]; inferredMemories?: any[] }) => void,
    onError: (err: string) => void
  ) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: history.map(m => ({ role: m.role, content: m.content })),
          mode,
          activeModelId,
          config: { openRouterKey }
        })
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(errorText || `Server returned status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body stream found.");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.done) {
              onDone({
                usedModels: data.usedModels || [],
                thinkingTimeMs: data.thinkingTimeMs || 0,
                subtasks: data.subtasks || [],
                inferredMemories: data.inferredMemories || []
              });
            } else if (data.token) {
              onToken(data.token);
            }
          } catch (e) {
            // JSON parse issue on broken/partial chunk, can ignore or log
          }
        }
      }
      
      // Process remaining buffer
      if (buffer && buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          if (data.done) {
            onDone({
              usedModels: data.usedModels || [],
              thinkingTimeMs: data.thinkingTimeMs || 0,
              subtasks: data.subtasks || [],
              inferredMemories: data.inferredMemories || []
            });
          } else if (data.token) {
            onToken(data.token);
          }
        } catch {}
      }
    } catch (err: any) {
      onError(err.message || String(err));
    }
  };

  return { streamMessage };
}
