import React from "react";
import { motion } from "motion/react";

export const StreamingCursor: React.FC = () => {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="inline-block text-accent-primary font-bold ml-0.5 animate-cursor-pulse select-none"
    >
      ▋
    </motion.span>
  );
};
