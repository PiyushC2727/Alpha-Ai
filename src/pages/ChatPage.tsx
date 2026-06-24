import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useStream } from "../hooks/useStream";
import { ChatWindow } from "../components/chat/ChatWindow";
import { api } from "../lib/api";
import { Attachment, Message } from "../types";

export const ChatPage: React.FC = () => {
  const { state, dispatch, addToast } = useApp();
  const { streamMessage } = useStream();
  const [isStreaming, setIsStreaming] = useState(false);

  const activeConv = state.conversations.find((c) => c.id === state.activeConversationId) || null;

  // Helper to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSendMessage = async (prompt: string, file: File | null) => {
    if (isStreaming) return;
    setIsStreaming(true);

    let finalPrompt = prompt;
    let attachmentData: Attachment | undefined = undefined;

    // 1. If attachment: upload & analyze first
    if (file) {
      addToast(`Extracting documents context via vision node...`, "info");
      try {
        const base64 = await fileToBase64(file);
        attachmentData = {
          name: file.name,
          type: file.type,
          base64: base64,
          preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
        };

        const result = await api.analyzeFile(file, prompt);
        finalPrompt = `[COGNITIVE MULTIMODAL CONTEXT ATTACHED]\nFilename: ${result.fileName}\nMimetype: ${result.mimeType}\nExtract: ${result.analysis}\n\n[USER QUESTION]: ${prompt}`;
      } catch (err: any) {
        addToast(`Multimodal processing failed: ${err.message || err}`, "error");
        setIsStreaming(false);
        return;
      }
    }

    // 2. Add user message to state
    const userMsgId = Math.random().toString(36).substring(2, 11);
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: prompt,
      timestamp: new Date(),
      attachments: attachmentData ? [attachmentData] : undefined,
    };
    dispatch({ type: "ADD_MESSAGE", message: userMsg });

    // Ensure we have a valid conversation active now (incase ADD_MESSAGE auto-created one)
    let convId = state.activeConversationId;
    if (!convId) {
      // Small sleep to let the reducer update
      await new Promise((r) => setTimeout(r, 50));
    }

    // 3. Add blank assistant bubble
    const assistantMsgId = Math.random().toString(36).substring(2, 11);
    const blankAssistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date(),
    };
    dispatch({ type: "ADD_MESSAGE", message: blankAssistantMsg });

    // 4. Load current history for streaming payload context
    // We fetch the messages from local state matching what we just created
    const refreshedActiveConv = state.conversations.find((c) => c.id === state.activeConversationId) || { messages: [] };
    const historyPayload = [...refreshedActiveConv.messages, userMsg];

    // 5. Start streaming
    let currentResponseBuffer = "";

    await streamMessage(
      finalPrompt,
      historyPayload,
      state.mode,
      state.activeModelId,
      state.openRouterKey,
      
      // Token tick handler
      (token: string) => {
        currentResponseBuffer += token;
        dispatch({
          type: "UPDATE_STREAMING_MESSAGE",
          id: assistantMsgId,
          content: currentResponseBuffer,
        });
      },

      // Done handler
      (meta) => {
        dispatch({
          type: "FINALIZE_MESSAGE",
          id: assistantMsgId,
          content: currentResponseBuffer,
          modelUsed: meta.usedModels || [state.activeModelId],
          subtasks: meta.subtasks || [],
          thinkingTimeMs: meta.thinkingTimeMs || 0,
          isStreaming: false,
        });

        // Add learned memories
        if (meta.inferredMemories && meta.inferredMemories.length > 0) {
          meta.inferredMemories.forEach((mem: any) => {
            dispatch({ type: "ADD_MEMORY", memory: mem.content });
            addToast(`Learned Preference: ${mem.content}`, "info");
          });
        }

        // Auto titles if first exchange
        const updatedConv = state.conversations.find((c) => c.id === state.activeConversationId);
        if (updatedConv && updatedConv.messages.length <= 2) {
          const sliceTitle = prompt.length > 35 ? prompt.slice(0, 35) + "..." : prompt;
          dispatch({ type: "SET_CONVERSATION_TITLE", title: sliceTitle });
        }

        setIsStreaming(false);
      },

      // Error handler
      (err: string) => {
        dispatch({
          type: "FINALIZE_MESSAGE",
          id: assistantMsgId,
          content: `Connection failed. Error details: ${err}. Please check your OpenRouter API Keys in the Control Panel if attempting direct routes.`,
          isError: true,
          isStreaming: false,
        });
        addToast("Response stream failed. Verify routing config.", "error");
        setIsStreaming(false);
      }
    );
  };

  const handleEditSave = async (messageId: string, newContent: string) => {
    if (!activeConv || isStreaming) return;

    // Find message index to understand truncation boundaries
    const msgIndex = activeConv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // Dispatch the edit action which truncates conversation messages after edited index
    dispatch({ type: "EDIT_MESSAGE", id: messageId, content: newContent });
    addToast("Rewriting dialogue timeline...", "info");

    // Resend from that point
    handleSendMessage(newContent, null);
  };

  const handleRegenerate = async (messageId: string) => {
    if (!activeConv || isStreaming) return;

    // Find the user prompt right before this assistant response
    const msgIndex = activeConv.messages.findIndex((m) => m.id === messageId);
    if (msgIndex <= 0) return;

    const precedingUserMessage = activeConv.messages[msgIndex - 1];
    if (precedingUserMessage.role !== "user") {
      addToast("Failed to align dialogue threads.", "error");
      return;
    }

    // Edit message at preceding index to clear current and subsequent ones
    dispatch({
      type: "EDIT_MESSAGE",
      id: precedingUserMessage.id,
      content: precedingUserMessage.content,
    });
    addToast("Regenerating response...", "info");

    // Re-send user prompt
    handleSendMessage(precedingUserMessage.content, null);
  };

  return (
    <ChatWindow
      conversation={activeConv}
      onSendMessage={handleSendMessage}
      onEditSave={handleEditSave}
      onRegenerate={handleRegenerate}
      isStreaming={isStreaming}
    />
  );
};
