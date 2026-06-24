import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Conversation, Message, ChatMode, ModelId, Toast } from "../types";

export interface AppState {
  conversations: Conversation[];
  activeConversationId: string | null;
  mode: ChatMode;
  activeModelId: ModelId;
  compareModels: ModelId[];
  memories: string[];
  systemPrompt: string;
  openRouterKey: string;
  toasts: Toast[];
  sidebarOpen: boolean;
}

export type AppAction =
  | { type: "NEW_CONVERSATION"; id?: string }
  | { type: "LOAD_CONVERSATION"; id: string }
  | { type: "DELETE_CONVERSATION"; id: string }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "UPDATE_STREAMING_MESSAGE"; id: string; content: string }
  | { type: "FINALIZE_MESSAGE"; id: string; content?: string; modelUsed?: string[]; subtasks?: any[]; thinkingTimeMs?: number; isStreaming?: boolean; isError?: boolean }
  | { type: "EDIT_MESSAGE"; id: string; content: string }
  | { type: "SET_CONVERSATION_TITLE"; title: string }
  | { type: "SET_MODE"; mode: ChatMode }
  | { type: "SET_ACTIVE_MODEL"; modelId: ModelId }
  | { type: "SET_COMPARE_MODELS"; models: ModelId[] }
  | { type: "ADD_MEMORY"; memory: string }
  | { type: "REMOVE_MEMORY"; memory: string }
  | { type: "CLEAR_ALL_MEMORIES" }
  | { type: "SET_SYSTEM_PROMPT"; prompt: string }
  | { type: "SET_OPENROUTER_KEY"; key: string }
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "REMOVE_TOAST"; id: string }
  | { type: "TOGGLE_SIDEBAR" };

const LOCAL_STORAGE_KEY = "alpha_ai_state";

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState: AppState = {
  conversations: [],
  activeConversationId: null,
  mode: "auto",
  activeModelId: "GPT-4o",
  compareModels: ["GPT-4o", "Claude 3.5", "Gemini 2.5"],
  memories: [],
  systemPrompt: "You are a helpful, extremely precise AI Assistant and operating system interface.",
  openRouterKey: "",
  toasts: [],
  sidebarOpen: true,
};

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure date objects are re-parsed properly
      if (parsed.conversations) {
        parsed.conversations = parsed.conversations.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      }
      return { ...initialState, ...parsed, toasts: [] };
    }
  } catch (e) {
    console.warn("Failed to parse app state from local storage:", e);
  }
  return initialState;
}

function appReducer(state: AppState, action: AppAction): AppState {
  let updatedConversations = [...state.conversations];
  const activeIndex = state.conversations.findIndex(
    (c) => c.id === state.activeConversationId
  );

  switch (action.type) {
    case "NEW_CONVERSATION": {
      const newId = action.id || generateId();
      const newConv: Conversation = {
        id: newId,
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        systemPrompt: state.systemPrompt,
      };
      return {
        ...state,
        conversations: [newConv, ...state.conversations],
        activeConversationId: newId,
      };
    }

    case "LOAD_CONVERSATION": {
      return {
        ...state,
        activeConversationId: action.id,
      };
    }

    case "DELETE_CONVERSATION": {
      const filtered = state.conversations.filter((c) => c.id !== action.id);
      let nextActiveId = state.activeConversationId;
      if (state.activeConversationId === action.id) {
        nextActiveId = filtered.length > 0 ? filtered[0].id : null;
      }
      return {
        ...state,
        conversations: filtered,
        activeConversationId: nextActiveId,
      };
    }

    case "ADD_MESSAGE": {
      if (activeIndex === -1) {
        // Create conversation on demand if none active
        const newId = generateId();
        const newConv: Conversation = {
          id: newId,
          title: action.message.content.slice(0, 30) || "New Chat",
          messages: [action.message],
          createdAt: new Date(),
          systemPrompt: state.systemPrompt,
        };
        return {
          ...state,
          conversations: [newConv, ...state.conversations],
          activeConversationId: newId,
        };
      }
      const activeConv = { ...state.conversations[activeIndex] };
      activeConv.messages = [...activeConv.messages, action.message];
      updatedConversations[activeIndex] = activeConv;
      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case "UPDATE_STREAMING_MESSAGE": {
      if (activeIndex === -1) return state;
      const activeConv = { ...state.conversations[activeIndex] };
      activeConv.messages = activeConv.messages.map((msg) => {
        if (msg.id === action.id) {
          return {
            ...msg,
            streamingContent: action.content,
            isStreaming: true,
          };
        }
        return msg;
      });
      updatedConversations[activeIndex] = activeConv;
      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case "FINALIZE_MESSAGE": {
      if (activeIndex === -1) return state;
      const activeConv = { ...state.conversations[activeIndex] };
      activeConv.messages = activeConv.messages.map((msg) => {
        if (msg.id === action.id) {
          return {
            ...msg,
            content: action.content !== undefined ? action.content : (msg.streamingContent || msg.content),
            streamingContent: undefined,
            isStreaming: action.isStreaming ?? false,
            modelUsed: action.modelUsed || msg.modelUsed,
            subtasks: action.subtasks || msg.subtasks,
            thinkingTimeMs: action.thinkingTimeMs || msg.thinkingTimeMs,
            isError: action.isError ?? msg.isError,
          };
        }
        return msg;
      });
      updatedConversations[activeIndex] = activeConv;
      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case "EDIT_MESSAGE": {
      if (activeIndex === -1) return state;
      const activeConv = { ...state.conversations[activeIndex] };
      const msgIndex = activeConv.messages.findIndex((m) => m.id === action.id);
      if (msgIndex === -1) return state;

      // Slice messages up to edited message, update edited content, and clear rest of conversation
      const slicedMessages = activeConv.messages.slice(0, msgIndex);
      const editedMsg: Message = {
        ...activeConv.messages[msgIndex],
        content: action.content,
        timestamp: new Date(),
      };
      
      activeConv.messages = [...slicedMessages, editedMsg];
      updatedConversations[activeIndex] = activeConv;
      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case "SET_CONVERSATION_TITLE": {
      if (activeIndex === -1) return state;
      const activeConv = { ...state.conversations[activeIndex], title: action.title };
      updatedConversations[activeIndex] = activeConv;
      return {
        ...state,
        conversations: updatedConversations,
      };
    }

    case "SET_MODE": {
      return { ...state, mode: action.mode };
    }

    case "SET_ACTIVE_MODEL": {
      return { ...state, activeModelId: action.modelId };
    }

    case "SET_COMPARE_MODELS": {
      return { ...state, compareModels: action.models };
    }

    case "ADD_MEMORY": {
      if (state.memories.includes(action.memory)) return state;
      return { ...state, memories: [...state.memories, action.memory] };
    }

    case "REMOVE_MEMORY": {
      return { ...state, memories: state.memories.filter((m) => m !== action.memory) };
    }

    case "CLEAR_ALL_MEMORIES": {
      return { ...state, memories: [] };
    }

    case "SET_SYSTEM_PROMPT": {
      return { ...state, systemPrompt: action.prompt };
    }

    case "SET_OPENROUTER_KEY": {
      return { ...state, openRouterKey: action.key };
    }

    case "ADD_TOAST": {
      return { ...state, toasts: [...state.toasts, action.toast] };
    }

    case "REMOVE_TOAST": {
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    }

    case "TOGGLE_SIDEBAR": {
      return { ...state, sidebarOpen: !state.sidebarOpen };
    }

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
} | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Sync state with LocalStorage on every update
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = generateId();
    dispatch({ type: "ADD_TOAST", toast: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", id });
    }, 4000);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
