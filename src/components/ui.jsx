import { C, F } from "../constants.js";

export function Badge({ text, variant, small }) {
  const styles = {
    high: { bg: C.dangerBg, c: C.danger }, medium: { bg: C.warnBg, c: C.warn }, low: { bg: C.successBg, c: C.success },
    Research: { bg: C.blueBg, c: C.blue }, Validation: { bg: C.purpleBg, c: C.purple }, Strategy: { bg: C.warnBg, c: C.warn },
    Analysis: { bg: "#2d3525", c: "#8eb06b" }, Interviews: { bg: C.successBg, c: C.success }, Docs: { bg: C.accent + "44", c: C.textDim },
    Planning: { bg: C.blueBg, c: C.blue }, Design: { bg: "#3d2535", c: "#b06b8e" }, Outreach: { bg: "#253d35", c: "#6bb08e" },
    Build: { bg: C.warnBg, c: C.warn }, Growth: { bg: C.successBg, c: C.success }, Legal: { bg: C.purpleBg, c: C.purple },
    done: { bg: C.successBg, c: C.success }, "in-progress": { bg: C.blueBg, c: C.blue },
    "not-started": { bg: C.accent + "44", c: C.textMuted }, active: { bg: C.blueBg, c: C.blue },
  };
  const s = styles[variant] || { bg: C.accent + "44", c: C.textMuted };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "2px 8px" : "3px 10px", borderRadius: 99, background: s.bg, color: s.c, fontSize: small ? 10 : 11.5, fontWeight: 600, fontFamily: F.sans, whiteSpace: "nowrap" }}>{variant === "done" ? "✓ " : ""}{text}</span>;
}

export function Progress({ value, max, label, h = 6 }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12.5, fontWeight: 500, color: C.textDim }}>{label}</span><span style={{ fontSize: 12, fontWeight: 600, color: C.textDim }}>{pct}%</span></div>}
      <div style={{ height: h, background: C.accent + "66", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.success : C.blue, borderRadius: 99, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

export function Dots() {
  return <div style={{ display: "flex", gap: 5, padding: "6px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.textMuted, animation: `pulse 1.2s ease infinite`, animationDelay: `${i*.2}s` }}/>)}</div>;
}

export function Spinner({ size = 16 }) {
  return <div style={{ width: size, height: size, border: `2px solid ${C.border}`, borderTop: `2px solid ${C.text}`, borderRadius: "50%", animation: "spin .6s linear infinite" }} />;
}

export function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "#00000066", backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} className="card fade-up" style={{ width: wide ? "min(880px,92vw)" : "min(520px,92vw)", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 20px 50px #00000055` }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="serif" style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 18, padding: 2 }}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

export function ProgressPie({ pct, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.accent + "66"} strokeWidth="6"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct === 100 ? C.success : C.blue} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset .5s ease" }}/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, fontFamily: F.sans, color: C.text }}>{pct}%</div>
    </div>
  );
}
