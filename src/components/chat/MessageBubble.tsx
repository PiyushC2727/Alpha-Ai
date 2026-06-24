import React, { useState } from "react";
import { Message } from "../../types";
import { ModelBadge } from "../shared/ModelBadge";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";
import { StreamingCursor } from "./StreamingCursor";
import { SubtaskPanel } from "./SubtaskPanel";
import { CompareView } from "./CompareView";
import { Edit3, Check, X, Copy, RotateCw, ThumbsUp, ThumbsDown, Share2, FileText, Calendar } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface MessageBubbleProps {
  message: Message;
  onEditSave: (messageId: string, newContent: string) => void;
  onRegenerate: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onEditSave,
  onRegenerate
}) => {
  const { addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(message.content);
  const [vote, setVote] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === "user";
  const tokenEstimate = message.content ? Math.ceil(message.content.length / 4) : 0;

  const handleEditSubmit = () => {
    if (!editVal.trim()) return;
    onEditSave(message.id, editVal);
    setIsEditing(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    addToast("Copied to clipboard!", "success");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`[Alpha AI dialogue]\nUser: ${message.content}`);
    addToast("Share dialog simulated. Dialogue copy compiled!", "success");
  };

  return (
    <div
      className={`group relative flex flex-col gap-1 w-full animate-fade-slide-up ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      {/* User Message Rendering */}
      {isUser ? (
        <div className="max-w-[75%] flex flex-col items-end gap-1.5">
          {/* Attachments rendering */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-col gap-1">
              {message.attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-bg-surface border border-zinc-800 rounded-lg p-2 max-w-xs overflow-hidden"
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.preview || `data:${file.type};base64,${file.base64}`}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded border border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-2 rounded bg-zinc-800 text-cyan-brand">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-medium text-text-primary truncate max-w-[150px]">{file.name}</span>
                    <span className="text-[10px] text-text-muted uppercase font-mono">{file.type.split("/")[1] || "File"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div className="relative">
            {isEditing ? (
              <div className="flex flex-col gap-2 p-3 bg-zinc-800 rounded-xl border border-zinc-700 min-w-[280px]">
                <textarea
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-sans resize-y"
                  rows={3}
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded hover:bg-zinc-700 text-text-secondary cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleEditSubmit}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent-primary text-white text-[11px] font-medium hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save & Send</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <div className="px-4 py-2.5 bg-accent-primary/15 text-text-primary border border-accent-primary/20 rounded-2xl rounded-br-sm text-[13.5px] shadow-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
                
                {/* Pencil edit trigger */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute left-[-28px] top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all text-text-secondary hover:text-text-primary cursor-pointer hover:scale-105"
                  title="Edit Message"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Assistant Message Rendering */
        <div className="max-w-[85%] flex flex-col items-start gap-1">
          {/* Header row with ModelBadges & Thinking Metrics */}
          <div className="flex items-center gap-2 mb-0.5 text-[10px] font-mono text-text-muted">
            {message.modelUsed && message.modelUsed.map((m, idx) => (
              <ModelBadge key={idx} model={m} />
            ))}
            {message.thinkingTimeMs !== undefined && message.thinkingTimeMs > 0 && (
              <span>• Coordinated in {message.thinkingTimeMs}ms</span>
            )}
          </div>

          {/* Response Container */}
          <div className="flex flex-col gap-2 w-full px-4 py-3 bg-bg-surface border border-border-subtle rounded-2xl rounded-tl-sm text-[13.5px] shadow-sm leading-relaxed text-left">
            {/* If the message is a parallel multi-model comparison */}
            {message.isComparison && message.compareResponses ? (
              <CompareView responses={message.compareResponses} />
            ) : (
              <>
                <MarkdownRenderer content={message.content} />
                {message.isStreaming && <StreamingCursor />}
              </>
            )}

            {/* Orchestration subtasks if present */}
            {message.subtasks && message.subtasks.length > 0 && (
              <div className="mt-3">
                <SubtaskPanel subtasks={message.subtasks} />
              </div>
            )}
          </div>

          {/* Action Footer row (visible on hover) */}
          <div className="flex items-center justify-between w-full px-2 text-[10px] font-mono text-text-muted min-h-6">
            <div>
              {tokenEstimate > 0 && (
                <span>~{tokenEstimate} tokens</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopyText}
                className="p-1 rounded hover:bg-zinc-800 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Copy Response"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onRegenerate(message.id)}
                className="p-1 rounded hover:bg-zinc-800 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Regenerate"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setVote("up")}
                className={`p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                  vote === "up" ? "text-green-brand" : "text-text-muted hover:text-text-primary"
                }`}
                title="Thumbs Up"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setVote("down")}
                className={`p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer ${
                  vote === "down" ? "text-red-brand" : "text-text-muted hover:text-text-primary"
                }`}
                title="Thumbs Down"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleShare}
                className="p-1 rounded hover:bg-zinc-800 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                title="Share Dialogue"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
