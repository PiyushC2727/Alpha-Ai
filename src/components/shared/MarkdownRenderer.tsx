import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Play, Maximize2, X } from "lucide-react";
import { ThinkingBlock } from "../chat/ThinkingBlock";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Extract <think>...</think> tags for DeepSeek R1 reasoning processing
  const thinkRegex = /<think>([\s\S]*?)<\/think>/i;
  const match = content.match(thinkRegex);
  const thinkText = match ? match[1].trim() : "";
  const cleanedContent = content.replace(thinkRegex, "").trim();

  const handleCopy = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(blockId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRunCode = (code: string, language: string) => {
    // Generate CodeSandbox API payload
    const files = {
      "index.js": {
        content: code
      }
    };
    
    const parameters = btoa(JSON.stringify({ files }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
      
    window.open(`https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* DeepSeek R1 Reasoning Section */}
      {thinkText && <ThinkingBlock content={thinkText} />}

      {/* Main Markdown Body */}
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "");
              const lang = match ? match[1] : "";
              const codeString = String(children).replace(/\n$/, "");
              const uniqueId = React.useMemo(() => Math.random().toString(36).substring(2, 9), [codeString]);

              if (!inline && match) {
                const canRun = ["python", "javascript", "typescript", "js", "ts", "py"].includes(lang.toLowerCase());
                return (
                  <div className="my-4 border border-zinc-800 rounded-lg overflow-hidden bg-[#0d0d0d] group">
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono text-text-secondary">
                      <span className="uppercase text-[10px] tracking-wider text-accent-primary font-semibold">{lang}</span>
                      <div className="flex items-center gap-2">
                        {canRun && (
                          <button
                            onClick={() => handleRunCode(codeString, lang)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary transition-colors cursor-pointer"
                            title="Run in CodeSandbox"
                          >
                            <Play className="w-3 h-3" />
                            <span>Run</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(codeString, uniqueId)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {copiedCodeId === uniqueId ? (
                            <>
                              <Check className="w-3 h-3 text-green-brand" />
                              <span className="text-green-brand">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-mono">
                      <SyntaxHighlighter
                        style={oneDark as any}
                        language={lang}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: "1rem",
                          background: "#0d0d0d",
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                );
              }

              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            img({ node, src, alt, ...props }: any) {
              return (
                <div className="relative inline-block my-2 group overflow-hidden rounded-md cursor-zoom-in" onClick={() => setLightboxImage(src)}>
                  <img src={src} alt={alt} className="transition-transform duration-300 group-hover:scale-[1.02]" referrerPolicy="no-referrer" {...props} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <Maximize2 className="w-5 h-5 text-white" />
                  </div>
                </div>
              );
            },
            table({ node, ...props }: any) {
              return (
                <div className="overflow-x-auto my-4 rounded-lg border border-zinc-800">
                  <table {...props} />
                </div>
              );
            },
          }}
        >
          {cleanedContent}
        </ReactMarkdown>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 text-white hover:text-zinc-300 transition-colors cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImage} alt="Fullscreen lightboxed render" className="max-w-full max-h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
        </div>
      )}
    </div>
  );
};
