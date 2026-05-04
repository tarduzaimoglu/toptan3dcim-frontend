"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type ToastContextValue = {
  show: (msg: string) => void;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);

  const value = useMemo<ToastContextValue>(() => {
    return {
      show: (m: string) => {
        setMsg(m);
        window.setTimeout(() => setMsg(null), 1600);
      },
    };
  }, []);

  return (
    <ToastCtx.Provider value={value}>
      {children}

      {msg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-lg">
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
