import React from "react";
import { useApp } from "../../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { state, dispatch } = useApp();

  return (
    <div id="toast-container" className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {state.toasts.map((toast) => {
          let icon = <Info className="w-4 h-4 text-cyan-brand" />;
          let borderClass = "border-zinc-700";
          let bgClass = "bg-bg-surface text-text-primary";

          if (toast.type === "success") {
            icon = <CheckCircle className="w-4 h-4 text-green-brand" />;
            borderClass = "border-green-brand/30";
          } else if (toast.type === "error") {
            icon = <AlertCircle className="w-4 h-4 text-red-brand" />;
            borderClass = "border-red-brand/30";
          } else if (toast.type === "info") {
            icon = <Info className="w-4 h-4 text-accent-primary" />;
            borderClass = "border-accent-primary/30";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md ${bgClass} ${borderClass}`}
            >
              <div className="flex items-center gap-2.5">
                {icon}
                <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
              </div>
              <button
                onClick={() => dispatch({ type: "REMOVE_TOAST", id: toast.id })}
                className="text-text-muted hover:text-text-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
