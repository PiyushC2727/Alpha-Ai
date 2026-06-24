import React, { useState } from "react";
import { Subtask } from "../../types";
import { ModelBadge } from "../shared/ModelBadge";
import { ChevronDown, ChevronUp, Check, X, Loader2 } from "lucide-react";

interface SubtaskPanelProps {
  subtasks: Subtask[];
}

export const SubtaskPanel: React.FC<SubtaskPanelProps> = ({ subtasks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-bg-base/80 overflow-hidden text-xs">
      {/* Panel Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2.5 bg-bg-surface/50 font-medium font-mono text-text-secondary select-none cursor-pointer hover:bg-bg-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-accent-primary">⚡</span>
          <span>Alpha OS Orchestrated {subtasks.length} specialized model nodes</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <span>{isOpen ? "Hide logs" : "View orchestration"}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Collapsible List */}
      {isOpen && (
        <div className="divide-y divide-zinc-900 bg-bg-surface/10 p-1">
          {subtasks.map((task, idx) => {
            const isRowExpanded = !!expandedRows[task.id];
            
            // Status Icon selector
            let statusIcon = <Check className="w-3.5 h-3.5 text-green-brand" />;
            if (task.status === "failed") {
              statusIcon = <X className="w-3.5 h-3.5 text-red-brand" />;
            } else if (task.status === "running") {
              statusIcon = <Loader2 className="w-3.5 h-3.5 text-accent-primary animate-spin-fast" />;
            }

            return (
              <div
                key={task.id}
                style={{ animationDelay: `${idx * 50}ms` }}
                className="flex flex-col animate-fade-slide-up"
              >
                {/* Row Header */}
                <div
                  onClick={() => toggleRow(task.id)}
                  className="flex items-center justify-between px-3 py-2 hover:bg-bg-elevated/40 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon}
                    <ModelBadge model={task.agent} />
                    <span className="font-medium text-text-secondary truncate">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <span className="text-[10px] font-mono italic">{task.status}</span>
                    {isRowExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Row Content */}
                {isRowExpanded && (
                  <div className="px-9 pb-3 pt-1 flex flex-col gap-1.5 bg-black/20 rounded-md my-1 mx-2">
                    <p className="text-[10px] text-text-muted font-mono">
                      <span className="font-semibold text-accent-primary">Orchestration Action:</span> {task.explanation}
                    </p>
                    <div className="p-2 border border-zinc-900 bg-bg-base rounded-md overflow-x-auto max-h-36 overflow-y-auto">
                      <pre className="text-[11px] text-text-secondary font-mono leading-relaxed whitespace-pre-wrap">
                        {task.output}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
