import React, { useRef, useEffect } from "react";
import { Conversation } from "../../types";
import { WelcomeScreen } from "./WelcomeScreen";
import { MessageBubble } from "./MessageBubble";
import { InputBar } from "./InputBar";

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (text: string, file: File | null) => void;
  onEditSave: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
  isStreaming: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  onSendMessage,
  onEditSave,
  onRegenerate,
  isStreaming,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages?.length, isStreaming]);

  // Handle active streaming updates or last token ticks
  useEffect(() => {
    // If we are actively streaming, keep sticking scroll towards bottom
    if (isStreaming) {
      const interval = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current;
          // Only force scroll down if user is near bottom anyway (prevent fights)
          if (scrollHeight - scrollTop - clientHeight < 200) {
            scrollContainerRef.current.scrollTop = scrollHeight;
          }
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isStreaming]);

  const hasMessages = conversation && conversation.messages.length > 0;

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-bg-base relative">
      {/* Message scroll list */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 flex flex-col gap-6"
      >
        {hasMessages ? (
          <div className="max-w-4xl w-full mx-auto flex flex-col gap-6 pb-24">
            {conversation.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onEditSave={onEditSave}
                onRegenerate={onRegenerate}
              />
            ))}
          </div>
        ) : (
          <WelcomeScreen onSelectSuggestion={(text) => onSendMessage(text, null)} />
        )}
      </div>

      {/* Input bar bottom dock */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent pt-6 pointer-events-none">
        <div className="pointer-events-auto">
          <InputBar onSendMessage={onSendMessage} isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  );
};
