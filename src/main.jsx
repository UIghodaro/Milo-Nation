import React from "react";
import ReactDOM from "react-dom/client";
import App from "../founder-os.jsx";

// Polyfill window.storage for localhost (async get/set) using localStorage
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (k) => {
      try {
        const v = localStorage.getItem(k);
        return v != null ? { value: v } : null;
      } catch {
        return null;
      }
    },
    set: async (k, v) => {
      try {
        if (v != null) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        else localStorage.removeItem(k);
      } catch {}
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
