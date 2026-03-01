import { useState, useEffect, useCallback } from "react";
import { C, F } from "../constants.js";

export function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? C.successBg : type === "error" ? C.dangerBg : C.warnBg;
  const color = type === "success" ? C.success : type === "error" ? C.danger : C.warn;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "⚠";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, background: bg, border: `1px solid ${color}44`, color, padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, fontFamily: F.sans, display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 24px #00000044`, animation: "fadeUp .3s ease" }}>
      <span>{icon}</span> {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => setToast({ message, type, key: Date.now() }), []);
  const el = toast ? <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return [show, el];
}
