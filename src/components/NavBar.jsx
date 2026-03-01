import { C, F } from "../constants.js";
import Logo from "./Logo.jsx";

export default function NavBar({ page, go }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: C.bg, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ cursor: "pointer" }} onClick={() => go("dashboard")}><Logo size={26} /></div>
          <nav style={{ display: "flex", gap: 2 }}>
            {[{ id: "dashboard", label: "Roadmap" }, { id: "network", label: "Network" }, { id: "profile", label: "Profile" }].map(t => {
              const active = t.id === "dashboard" ? ["dashboard", "track-setup", "track-dashboard", "module-chat"].includes(page) : page === t.id;
              return (
                <button key={t.id} onClick={() => go(t.id)}
                  style={{ all: "unset", cursor: "pointer", padding: "6px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: active ? 600 : 400, fontFamily: F.sans, color: active ? C.text : C.textMuted, background: active ? C.card : "transparent", transition: "all .15s" }}>
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <button onClick={() => go("profile")} style={{ width: 32, height: 32, borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
        </button>
      </div>
    </header>
  );
}
