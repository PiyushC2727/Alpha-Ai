import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/shared/Sidebar";
import { TopBar } from "./components/shared/TopBar";
import { SettingsPanel } from "./components/shared/SettingsPanel";
import { ChatPage } from "./pages/ChatPage";
import { ImagePage } from "./pages/ImagePage";
import { DashboardPage } from "./pages/DashboardPage";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-bg-base text-text-primary overflow-hidden font-sans select-none">
      {/* Left Sidebar navigation rails */}
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

      {/* Main panel viewport content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <TopBar onOpenSettings={() => setSettingsOpen(true)} />
        <div className="flex-1 min-h-0 min-w-0 relative">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/image" element={<ImagePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Slide-over Control Panel drawer */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Ambient toast Notification stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {state.toasts.map((toast) => {
          let icon = <Info className="w-4 h-4 text-accent-primary shrink-0" />;
          let bgBorder = "bg-zinc-900/95 border-accent-primary/20 text-text-secondary";

          if (toast.type === "success") {
            icon = <CheckCircle2 className="w-4 h-4 text-green-brand shrink-0" />;
            bgBorder = "bg-green-brand/10 border-green-brand/20 text-text-primary";
          } else if (toast.type === "error") {
            icon = <AlertTriangle className="w-4 h-4 text-red-brand shrink-0" />;
            bgBorder = "bg-red-brand/10 border-red-brand/20 text-text-primary";
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl pointer-events-auto animate-fade-slide-up ${bgBorder}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <p className="text-xs font-medium font-sans leading-relaxed truncate">{toast.message}</p>
              </div>
              <button
                onClick={() => dispatch({ type: "REMOVE_TOAST", id: toast.id })}
                className="p-1 rounded-md hover:bg-zinc-800 text-text-muted hover:text-text-primary cursor-pointer transition-colors shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
