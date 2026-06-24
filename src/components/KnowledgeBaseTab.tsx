import React, { useState } from 'react';
import { Database, Plus, Trash2, FileText, Clipboard, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { KnowledgeDoc } from '../types';

interface KnowledgeBaseTabProps {
  knowledge: KnowledgeDoc[];
  setKnowledge: (knowledge: KnowledgeDoc[]) => void;
}

export default function KnowledgeBaseTab({ knowledge, setKnowledge }: KnowledgeBaseTabProps) {
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteContent, setPasteContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPasteForm, setShowPasteForm] = useState(false);

  // Hardcoded premium sample files so the user doesn't have to start empty-handed!
  const addSampleDoc = (title: string, content: string, type: string, size: string) => {
    const doc: KnowledgeDoc = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      content,
      fileType: type,
      fileSize: size,
      uploadedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      tokenCount: Math.ceil(content.length / 4.2),
    };
    setKnowledge([doc, ...knowledge]);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteTitle.trim() || !pasteContent.trim()) return;

    const doc: KnowledgeDoc = {
      id: Math.random().toString(36).substring(2, 9),
      title: pasteTitle.trim(),
      content: pasteContent.trim(),
      fileType: 'txt',
      fileSize: `${Math.ceil(pasteContent.length / 1024)} KB`,
      uploadedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      tokenCount: Math.ceil(pasteContent.length / 4.2),
    };

    setKnowledge([doc, ...knowledge]);
    setPasteTitle('');
    setPasteContent('');
    setShowPasteForm(false);
  };

  const deleteDoc = (id: string) => {
    setKnowledge(knowledge.filter((d) => d.id !== id));
  };

  const simulateFileUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const titles = [
        'API_Gateway_v4_Endpoint_Specs.json',
        'Company_Code_Styles_Guidelines.md',
        'Project_Orion_Requirement_Baseline.txt',
        'Database_Schema_Inscriptions.sql'
      ];
      const contents = [
        '{"endpoints": [{"path": "/api/v4/user", "method": "GET", "authorized": true}], "rateLimits": {"standard": 500}}',
        '### ES Module Guidelines\n- Prefer modular imports\n- Document type definitions in src/types.ts\n- Limit component imports',
        'System Requirements for project Orion. Phase 1 targets unified AI search, dynamic weighting, and dual model verification.',
        'CREATE TABLE workspace_memories (id VARCHAR(255) PRIMARY KEY, entity_context TEXT, state_tag VARCHAR(50), updated_epoch BIGINT);'
      ];
      const index = Math.floor(Math.random() * titles.length);
      const chosenTitle = titles[index];
      const chosenContent = contents[index];
      const ext = chosenTitle.split('.').pop() || 'txt';
      const sizeBytes = chosenContent.length + 420; // Simulated padding
      const sizeStr = sizeBytes > 1024 ? `${(sizeBytes / 1024).toFixed(1)} KB` : `${sizeBytes} B`;

      addSampleDoc(chosenTitle, chosenContent, ext, sizeStr);
      setIsUploading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 p-4 overflow-y-auto max-h-[85vh] scrollbar-thin" id="knowledge-base-wrapper">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-850 pb-3" id="knowledge-title-block">
        <Database className="w-5 h-5 text-indigo-500 animate-pulse" />
        <h2 className="text-sm uppercase font-mono tracking-wider font-semibold text-gray-900 dark:text-neutral-100">
          Knowledge Base & Index
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2.5" id="knowledge-stats-row">
        <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-xl border border-gray-150 dark:border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-gray-400">Indexed Docs</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white font-sans">
            {knowledge.length}
          </span>
        </div>
        <div className="bg-white dark:bg-neutral-900/60 p-3 rounded-xl border border-gray-150 dark:border-neutral-800 flex flex-col gap-0.5">
          <span className="text-[10px] font-mono text-gray-400">Context Seeding</span>
          <span className="text-xl font-bold text-gray-800 dark:text-white font-sans">
            {knowledge.reduce((acc, d) => acc + d.tokenCount, 0).toLocaleString()} <span className="text-[11px] font-medium text-neutral-400">tokens</span>
          </span>
        </div>
      </div>

      {/* Action Zone / Uploader */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button
            onClick={simulateFileUpload}
            disabled={isUploading}
            className="flex-1 border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-900 py-6 px-4 rounded-xl flex flex-col items-center justify-center gap-2 bg-white dark:bg-neutral-900/10 cursor-pointer group hover:bg-indigo-50/10 transition-all disabled:opacity-50"
            id="drag-upload-sim-btn"
          >
            <UploadCloud className={`w-8 h-8 ${isUploading ? 'text-indigo-500 animate-bounce' : 'text-gray-400 group-hover:text-indigo-550 transition-all'}`} />
            <div className="flex flex-col items-center text-center">
              <span className="text-xs font-semibold text-gray-700 dark:text-neutral-300">
                {isUploading ? 'Integrating document...' : 'Upload reference doc'}
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5">
                Drag spec or click to run simulation
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setShowPasteForm(!showPasteForm)}
            className={`px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold cursor-pointer ${
              showPasteForm
                ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-350 text-neutral-800 dark:text-neutral-200'
                : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-300 hover:border-gray-300'
            }`}
            id="toggle-pastedoc-form-btn"
            title="Paste plaintext document"
          >
            <Clipboard className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
        </div>

        {/* Manual Paste Form */}
        {showPasteForm && (
          <form onSubmit={handleManualSubmit} className="p-3 bg-neutral-55 dark:bg-neutral-900/40 rounded-xl border border-gray-150 dark:border-neutral-800 flex flex-col gap-3" id="knowledge-paste-form">
            <span className="text-[10px] uppercase font-mono text-gray-400">
              Inscribe Text Block
            </span>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Documentation or Specs title (e.g. env_rules.txt)"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                className="text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-850 dark:text-neutral-100 font-sans shadow-sm"
                required
                aria-label="New Document Title"
                id="doc-title-input"
              />
              <textarea
                placeholder="Paste your API, context logs, schema syntax, or raw text documentation contents here..."
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                className="text-xs bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 p-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-850 dark:text-neutral-100 font-mono h-28 resize-none shadow-inner"
                required
                aria-label="New Document Content"
                id="doc-content-textarea"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowPasteForm(false)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-600 dark:text-neutral-300 rounded-lg cursor-pointer"
                id="cancel-pastedoc"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                id="publish-pastedoc"
              >
                <Plus className="w-3.5 h-3.5" />
                Index Reference
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Document Stack */}
      <div className="flex flex-col gap-2.5" id="knowledge-documents-stack">
        <label className="text-xs font-mono font-medium text-gray-500 dark:text-neutral-400">
          INDEXED ARTIFACTS IN CONTEXT
        </label>

        {knowledge.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-200 dark:border-neutral-850 rounded-xl" id="empty-knowledge-view">
            <AlertCircle className="w-5 h-5 text-gray-400 mx-auto mb-1 flex animate-pulse" />
            <span className="text-xs text-neutral-400 leading-normal block">
              No files indexed. Drag specifications or paste standard rules to begin.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1" id="knowledge-documents-list">
            {knowledge.map((doc) => (
              <div
                key={doc.id}
                className="group relative p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:border-indigo-200 dark:hover:border-indigo-950/60 shadow-sm hover:shadow transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 text-indigo-550">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-normal pr-5">
                    <h4 className="text-xs font-semibold text-gray-800 dark:text-neutral-200 break-all select-all">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 dark:text-neutral-550 mt-1">
                      <span>TYPE: {doc.fileType.toUpperCase()}</span>
                      <span>•</span>
                      <span>SIZE: {doc.fileSize}</span>
                      <span>•</span>
                      <span className="text-indigo-500 dark:text-indigo-400">{doc.tokenCount} TOKENS</span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="p-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex" title="Injected into Prompt Boundaries" id={`applied-doc-check-${doc.id}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 flex cursor-pointer"
                    title="Remove from Index"
                    aria-label="Delete document"
                    id={`delete-doc-btn-${doc.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
