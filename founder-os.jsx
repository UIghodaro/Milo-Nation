import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   FOUNDER OS — Hackathon MVP (Final Build)
   Palette: #474448 #2d232e #e0ddcf #534b52 #f1f0ea
   Font: Instrument Serif + DM Sans
   ═══════════════════════════════════════════════════════════════════ */

const C = {
  ink: "#2d232e",
  inkSoft: "#474448",
  mid: "#534b52",
  tan: "#e0ddcf",
  bg: "#f1f0ea",
  white: "#ffffff",
  accent: "#6b5b4e",
  link: "#5a6e5a",
  success: "#5a7c5a",
  successBg: "#e8f0e8",
  warn: "#8a7340",
  warnBg: "#f5f0e0",
  danger: "#7c4444",
  dangerBg: "#f5e8e8",
  blue: "#4a6680",
  blueBg: "#e8eef5",
};

const F = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'DM Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

const MODULES_TEMPLATE = [
  { id: "market-research", name: "Market Research", desc: "Validate demand, define your ICP, map channels", icon: "🔍", active: true },
  { id: "competitor-analysis", name: "Competitor Analysis", desc: "Map competitors, find positioning gaps", icon: "⚔️" },
  { id: "customer-personas", name: "Customer Personas", desc: "Build detailed profiles of your ideal users", icon: "👥" },
  { id: "value-proposition", name: "Value Proposition", desc: "Articulate your unique value clearly", icon: "💎" },
  { id: "pricing-strategy", name: "Pricing & Packaging", desc: "Design pricing that captures value", icon: "💰" },
  { id: "go-to-market", name: "Go-To-Market", desc: "Plan your launch and acquisition strategy", icon: "🚀" },
  { id: "mvp-plan", name: "MVP Build Plan", desc: "Scope and plan your minimum viable product", icon: "🛠️" },
  { id: "pitch-deck", name: "Pitch Deck", desc: "Create an investor-ready narrative", icon: "🎯" },
];

const TASK_TAGS = ["Research", "Validation", "Strategy", "Analysis", "Interviews", "Docs", "Planning", "Design", "Outreach"];

// ─── Storage ─────────────────────────────────────────────
const SK = { idea: "fos3-idea", onboarded: "fos3-onboarded", blocks: "fos3-blocks", kanban: "fos3-kanban", mrTasks: "fos3-mr-tasks", mrGenerated: "fos3-mr-generated", modules: "fos3-modules", chatHistories: "fos3-chats" };
async function sGet(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } }
async function sSet(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} }

// ─── AI Helpers ──────────────────────────────────────────
async function callAI(messages, system) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system, messages: messages.map(m => ({ role: m.role, content: m.content })) }),
    });
    const data = await res.json();
    const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    try { return JSON.parse(txt.replace(/```json\n?|```\n?/g, "").trim()); } catch { return { message: txt }; }
  } catch { return null; }
}

function mockOnboard(msgs) {
  const n = msgs.filter(m => m.role === "user").length;
  if (n <= 1) return { message: "Great start. Tell me more — who specifically feels this pain? What does their current workaround look like, and why isn't it good enough?", ready: false };
  if (n === 2) return { message: "Interesting. What stage are you at — just an idea, building an MVP, or do you have early users? And what's your primary goal in the next 3 months?", ready: false };
  if (n === 3) return { message: "Last question — what are you strongest at (technical, sales, domain expertise), and where do you feel you need the most help?", ready: false };
  return { message: "I have a solid picture of your startup. Click 'Generate Roadmap' below to create your personalised founder roadmap.", ready: true, summary: { name: "Your Startup", oneLiner: msgs[1]?.content?.substring(0, 100) || "An innovative startup", customer: "Target customers identified during onboarding", problem: "Core pain point from founder's description", solution: "Proposed solution approach", whyNow: "Current market timing and trends", stage: "Early stage", assumptions: ["Customers actively seek alternatives", "Willingness to pay exists", "Market large enough"], gaps: ["Distribution strategy", "Fundraising experience"] } };
}

function mockTasks() {
  return { planSummary: "Based on your startup context, I recommend focusing on customer discovery first, then market sizing, then competitive positioning.", tasks: [
    { title: "Define Ideal Customer Profile", description: "Create a detailed ICP to guide all research", tag: "Research", priority: "high", subtasks: ["Research demographic characteristics", "Identify key pain points", "Map buying behaviors", "Define jobs-to-be-done"] },
    { title: "Validate problem-solution fit", description: "Confirm your solution addresses a real need", tag: "Validation", priority: "high", subtasks: ["Design interview script", "Conduct 5-10 interviews", "Synthesize findings", "Create validation report"] },
    { title: "Research market size (TAM/SAM/SOM)", description: "Quantify the opportunity", tag: "Analysis", priority: "high", subtasks: ["Identify data sources", "Calculate TAM", "Estimate SAM and SOM", "Document methodology"] },
    { title: "Analyze top 5 competitors", description: "Map competitive landscape", tag: "Analysis", priority: "medium", subtasks: ["List direct competitors", "List indirect alternatives", "Compare features and pricing", "Identify gaps"] },
    { title: "Identify acquisition channels", description: "Find the best ways to reach customers", tag: "Strategy", priority: "medium", subtasks: ["List potential channels", "Estimate CAC per channel", "Rank by efficiency", "Design experiments"] },
    { title: "Map customer decision journey", description: "Understand how customers buy", tag: "Research", priority: "medium", subtasks: ["Define awareness triggers", "Map consideration factors", "Identify conversion barriers"] },
    { title: "Conduct 5 customer interviews", description: "Validate assumptions with real users", tag: "Interviews", priority: "high", subtasks: ["Recruit participants", "Prepare discussion guide", "Conduct interviews", "Analyze transcripts"] },
    { title: "Define success metrics", description: "Establish KPIs for research effectiveness", tag: "Planning", priority: "low", subtasks: ["Identify leading indicators", "Set baselines", "Define thresholds"] },
  ]};
}

function mockChat(phase) {
  if (phase === "planning") return { message: "Based on your startup context, here's what I recommend:\n\n**1. Frame your hypotheses** — Write down 3-5 specific assumptions to test.\n\n**2. Choose your method** — Customer interviews give the best signal at this stage.\n\n**3. Set a deadline** — Time-box to 2 weeks maximum.\n\nWant me to help with any of these?", suggestions: ["Help me frame hypotheses", "Design an interview script", "Find secondary research sources"] };
  if (phase === "building") return { message: "I can help you produce structured documents. Options:\n\n📋 **Research brief** — Template with sections\n📊 **Findings doc** — Capture and organize insights\n🔬 **Analysis framework** — Synthesize raw data\n\nWhich would you like?", markdown: "" };
  return { message: "Looking at your progress:\n\n✅ **Strong points:**\n- Clear demographic definition\n- Good pain point articulation\n\n⚠️ **Areas to improve:**\n- Add quantitative data\n- Include anti-persona characteristics\n- Define the decision-making unit", improvements: ["Add quantitative market data", "Include anti-personas", "Define decision-making unit"] };
}

// ─── Logo SVG ────────────────────────────────────────────
function Logo({ size = 32, showText = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "default" }}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" stroke={C.ink} strokeWidth="5" fill="none"/>
        <path d="M50 72 C50 72 50 45 50 38 C50 28 42 22 32 26 C28 28 25 33 25 38 C25 48 35 52 42 48" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M50 55 C50 55 50 42 55 35 C60 28 70 28 73 33 C76 38 73 46 66 48 C59 50 54 46 54 42" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
      {showText && <span style={{ fontFamily: F.serif, fontSize: size * 0.6, fontWeight: 400, color: C.ink, letterSpacing: "-0.02em" }}>Founder OS</span>}
    </div>
  );
}

// ─── Toast ───────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? C.successBg : type === "error" ? C.dangerBg : C.warnBg;
  const color = type === "success" ? C.success : type === "error" ? C.danger : C.warn;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "⚠";
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 99999, background: bg, border: `1px solid ${color}33`, color, padding: "10px 18px", borderRadius: 10, fontSize: 13.5, fontWeight: 600, fontFamily: F.sans, display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 24px ${C.ink}12`, animation: "fadeUp .3s ease" }}>
      <span>{icon}</span> {message}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success") => setToast({ message, type, key: Date.now() }), []);
  const el = toast ? <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null;
  return [show, el];
}

// ─── Shared Components ───────────────────────────────────
function Styles() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { -webkit-font-smoothing: antialiased; }
    body { font-family: ${F.sans}; background: ${C.bg}; color: ${C.ink}; }
    ::selection { background: ${C.tan}; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.tan}; border-radius: 99px; }
    input:focus, textarea:focus, select:focus { outline: none; border-color: ${C.mid} !important; box-shadow: 0 0 0 3px ${C.tan}66 !important; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes pulse { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .fade-up { animation: fadeUp .4s ease both; }
    .card { background: ${C.white}; border: 1px solid ${C.tan}; border-radius: 10px; transition: border-color .2s, box-shadow .2s; }
    .card:hover { border-color: ${C.mid}44; }
    .card-lift { transition: transform .2s, box-shadow .2s; cursor: pointer; }
    .card-lift:hover { transform: translateY(-2px); box-shadow: 0 6px 20px ${C.ink}0a; }
    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: 8px; font-family: ${F.sans}; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: all .15s; border: none; }
    .btn-dark { background: ${C.ink}; color: ${C.bg}; }
    .btn-dark:hover { background: ${C.inkSoft}; }
    .btn-dark:disabled { opacity: .45; cursor: default; }
    .btn-outline { background: ${C.white}; color: ${C.ink}; border: 1px solid ${C.tan}; }
    .btn-outline:hover { background: ${C.bg}; border-color: ${C.mid}88; }
    .btn-success { background: ${C.success}; color: ${C.white}; border: none; }
    .btn-success:hover { background: #4d6d4d; }
    .btn-danger { background: ${C.dangerBg}; color: ${C.danger}; border: 1px solid ${C.danger}33; }
    .btn-danger:hover { background: #f0dada; }
    .btn-ghost { background: none; border: none; color: ${C.mid}; padding: 5px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; font-family: ${F.sans}; display: inline-flex; align-items: center; gap: 5px; }
    .btn-ghost:hover { background: ${C.tan}44; color: ${C.ink}; }
    .input { width: 100%; padding: 9px 13px; border: 1px solid ${C.tan}; border-radius: 8px; font-family: ${F.sans}; font-size: 14px; color: ${C.ink}; background: ${C.white}; transition: all .2s; }
    .input::placeholder { color: ${C.mid}99; }
    .label { font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: ${C.mid}; font-family: ${F.sans}; }
    .serif { font-family: ${F.serif}; color: ${C.ink}; letter-spacing: -.01em; }
  `}</style>;
}

function NavBar({ page, go }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: C.white, borderBottom: `1px solid ${C.tan}` }}>
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 28px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ cursor: "pointer" }} onClick={() => go("dashboard")}><Logo size={28} /></div>
          <nav style={{ display: "flex", gap: 2 }}>
            {[{ id: "dashboard", label: "Roadmap" }, { id: "network", label: "Network" }].map(t => (
              <button key={t.id} onClick={() => go(t.id)}
                style={{ all: "unset", cursor: "pointer", padding: "6px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: page === t.id || (page === "market-research" && t.id === "dashboard") ? 600 : 400, fontFamily: F.sans, color: page === t.id || (page === "market-research" && t.id === "dashboard") ? C.ink : C.mid, background: page === t.id || (page === "market-research" && t.id === "dashboard") ? C.bg : "transparent", transition: "all .15s" }}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.bg, border: `1px solid ${C.tan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.mid} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
        </div>
      </div>
    </header>
  );
}

function Badge({ text, variant, small }) {
  const s = {
    high: { bg: C.dangerBg, c: C.danger }, medium: { bg: C.warnBg, c: C.warn }, low: { bg: C.successBg, c: C.success },
    Research: { bg: C.blueBg, c: C.blue }, Validation: { bg: "#f0ecf5", c: "#6b5b8a" }, Strategy: { bg: C.warnBg, c: C.warn },
    Analysis: { bg: "#f5f0e6", c: "#8c6b3a" }, Interviews: { bg: C.successBg, c: C.success }, Docs: { bg: C.bg, c: C.mid },
    Planning: { bg: "#e8eef5", c: "#4a6680" }, Design: { bg: "#f5eef0", c: "#8a5070" }, Outreach: { bg: "#eef5f0", c: "#4a7060" },
    done: { bg: C.successBg, c: C.success }, "in-progress": { bg: C.blueBg, c: C.blue },
    "not-started": { bg: C.bg, c: C.mid }, complete: { bg: C.successBg, c: C.success }, soon: { bg: C.bg, c: C.mid },
  }[variant] || { bg: C.bg, c: C.mid };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "2px 8px" : "3px 10px", borderRadius: 99, background: s.bg, color: s.c, fontSize: small ? 10 : 11.5, fontWeight: 600, fontFamily: F.sans, whiteSpace: "nowrap" }}>{variant === "done" || variant === "complete" ? "✓ " : ""}{text}</span>;
}

function Progress({ value, max, label, h = 6 }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 12.5, fontWeight: 500, color: C.mid }}>{label}</span><span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>{pct}%</span></div>}
      <div style={{ height: h, background: C.tan + "88", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? C.success : C.inkSoft, borderRadius: 99, transition: "width .5s ease" }} />
      </div>
    </div>
  );
}

function Dots() {
  return <div style={{ display: "flex", gap: 5, padding: "6px 0" }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.tan, animation: `pulse 1.2s ease infinite`, animationDelay: `${i*.2}s` }}/>)}</div>;
}

function Spinner({ size = 16 }) {
  return <div style={{ width: size, height: size, border: `2px solid ${C.tan}`, borderTop: `2px solid ${C.ink}`, borderRadius: "50%", animation: "spin .6s linear infinite" }} />;
}

function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: `${C.ink}44`, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} className="card fade-up" style={{ width: wide ? "min(880px,92vw)" : "min(500px,92vw)", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 20px 50px ${C.ink}1a` }}>
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.tan}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="serif" style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 18, padding: 2 }}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ONBOARDING PAGE
// ═══════════════════════════════════════════════════════════
function OnboardingPage({ onComplete }) {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Hi! I'm your startup co-pilot. Let's turn your idea into a structured roadmap.\n\nFirst, tell me: what problem are you solving, and for whom?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [canGenerate, setCanGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setError(null);
    const userMsg = { role: "user", content };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const history = newMsgs.map(m => `${m.role}: ${m.content}`).join("\n");
      let res = await callAI([userMsg], `You are a startup advisor running onboarding. Collect: problem, target user, solution, stage, goals, strengths, gaps. History:\n${history}\nRespond as JSON: { "message": "text", "ready": false } or { "message":"text", "ready": true, "summary": { "name":"", "oneLiner":"", "customer":"", "problem":"", "solution":"", "whyNow":"", "stage":"", "assumptions":[], "gaps":[] } }`);
      if (!res) res = mockOnboard(newMsgs);
      setMsgs(prev => [...prev, { role: "assistant", content: res.message }]);
      if (res.ready) { setCanGenerate(true); if (res.summary) setProfile(res.summary); }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await new Promise(r => setTimeout(r, 1200));
      if (profile) onComplete(profile);
      else {
        const fallback = { name: "Your Startup", oneLiner: msgs.find(m=>m.role==="user")?.content?.substring(0,100) || "", customer: "TBD", problem: "TBD", solution: "TBD", whyNow: "Now", stage: "Idea", assumptions: ["Key assumption 1"], gaps: ["Key gap 1"] };
        onComplete(fallback);
      }
    } catch {
      setError("Failed to generate roadmap. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Logo only — no nav */}
      <div style={{ padding: "18px 32px" }}><Logo size={30} /></div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 28px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }} className="fade-up">
          <h1 className="serif" style={{ fontSize: 32, fontWeight: 400 }}>Start Your Founder Journey</h1>
          <p style={{ color: C.mid, fontSize: 14.5, marginTop: 6, fontFamily: F.sans }}>Answer a few questions and I'll create a personalised roadmap for your startup</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start" }}>
          {/* Chat */}
          <div className="card fade-up" style={{ display: "flex", flexDirection: "column", minHeight: 520 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.tan}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" stroke={C.ink} strokeWidth="6"/><path d="M50 72C50 72 50 45 50 38C50 28 42 22 32 26C28 28 25 33 25 38C25 48 35 52 42 48" stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none"/><path d="M50 55C50 55 50 42 55 35C60 28 70 28 73 33C76 38 73 46 66 48C59 50 54 46 54 42" stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none"/></svg>
              </div>
              <div><div style={{ fontSize: 14, fontWeight: 600 }}>Let's shape your startup idea</div><div style={{ fontSize: 12, color: C.mid }}>Answer a few questions to build your roadmap</div></div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
              {msgs.map((m, i) => (
                <div key={i} style={{ marginBottom: 14, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp .3s ease both" }}>
                  <div style={{ maxWidth: "80%", padding: "11px 15px", borderRadius: 12, fontSize: 14, lineHeight: 1.65, fontFamily: F.sans, whiteSpace: "pre-wrap",
                    ...(m.role === "user" ? { background: C.ink, color: C.bg, borderBottomRightRadius: 3 } : { background: C.bg, color: C.ink, borderBottomLeftRadius: 3 }) }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <Dots />}
              <div ref={chatEnd} />
            </div>

            {error && (
              <div style={{ margin: "0 20px 8px", padding: "8px 12px", background: C.dangerBg, border: `1px solid ${C.danger}22`, borderRadius: 8, fontSize: 12.5, color: C.danger, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <div style={{ borderTop: `1px solid ${C.tan}`, padding: "12px 20px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn-ghost" style={{ padding: 6, color: C.mid }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>
                </button>
                <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Tell me about your startup idea..." disabled={loading} style={{ border: "none", background: "transparent", boxShadow: "none", padding: "6px 0" }} />
                <button className="btn btn-dark" onClick={() => send()} disabled={!input.trim() || loading} style={{ padding: "8px 14px", borderRadius: 99 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
              <div style={{ fontSize: 12, color: C.mid, marginTop: 6, opacity: .7 }}>Add a doc to give me more context</div>
            </div>
          </div>

          {/* Profile panel */}
          <div className="card fade-up" style={{ padding: 20, position: "sticky", top: 80 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.inkSoft} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Startup Profile Draft</span>
            </div>
            <div style={{ fontSize: 12, color: C.mid, fontStyle: "italic", marginBottom: 14 }}>Auto-updating as you chat</div>

            {profile ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { l: "NAME", v: profile.name },
                  { l: "ONE-LINER", v: profile.oneLiner },
                  { l: "CUSTOMER", v: profile.customer },
                  { l: "PROBLEM", v: profile.problem },
                  { l: "WHY NOW", v: profile.whyNow },
                  { l: "STAGE", v: profile.stage, badge: true },
                ].map(f => (
                  <div key={f.l}>
                    <div className="label" style={{ marginBottom: 4 }}>{f.l}</div>
                    {f.badge ? <Badge text={f.v} variant="soon" /> : <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{f.v}</div>}
                  </div>
                ))}
                {profile.assumptions?.length > 0 && (
                  <div>
                    <div className="label" style={{ marginBottom: 6 }}>KEY ASSUMPTIONS</div>
                    {profile.assumptions.map((a,i) => <div key={i} style={{ fontSize: 13, color: C.inkSoft, marginBottom: 3, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.accent }}>•</span>{a}</div>)}
                  </div>
                )}
                {profile.gaps?.length > 0 && (
                  <div>
                    <div className="label" style={{ marginBottom: 6 }}>GAPS TO ADDRESS</div>
                    {profile.gaps.map((g,i) => <div key={i} style={{ fontSize: 13, color: C.inkSoft, marginBottom: 3, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: C.warn }}>•</span>{g}</div>)}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "36px 0", color: C.mid, fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 6, opacity: .3 }}>📋</div>
                Profile appears as you chat
              </div>
            )}
          </div>
        </div>

        {/* Generate CTA */}
        {canGenerate && (
          <div className="fade-up" style={{ textAlign: "center", marginTop: 28 }}>
            <button className="btn btn-dark" onClick={generate} disabled={generating} style={{ padding: "14px 40px", fontSize: 16, borderRadius: 10 }}>
              {generating ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}><Spinner size={18} /> Generating your roadmap...</span>
              ) : (
                <>Generate Roadmap <span style={{ marginLeft: 4 }}>→</span></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD / ROADMAP
// ═══════════════════════════════════════════════════════════
function DashboardPage({ idea, go, mrTasks }) {
  const [kanban, setKanban] = useState({ columns: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "doing", title: "Doing", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]});
  const [notes, setNotes] = useState("");
  const [newTask, setNewTask] = useState({ col: null, text: "", tag: "Research" });
  const [drag, setDrag] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [editText, setEditText] = useState(null);
  const [comingSoon, setComingSoon] = useState(null);
  const [modules, setModules] = useState(MODULES_TEMPLATE);
  const [showToast, toastEl] = useToast();

  useEffect(() => {
    (async () => {
      const k = await sGet(SK.kanban); if (k) setKanban(k);
      const b = await sGet(SK.blocks); if (b?.notes) setNotes(b.notes);
      const m = await sGet(SK.modules); if (m) setModules(m);
    })();
  }, []);

  const saveKanban = async (k) => { setKanban(k); await sSet(SK.kanban, k); };
  const saveNotes = async (n) => { setNotes(n); await sSet(SK.blocks, { notes: n }); };

  const addKTask = (colId) => {
    if (!newTask.text.trim()) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text: newTask.text.trim(), tag: newTask.tag }] } : c) };
    saveKanban(updated);
    setNewTask({ col: null, text: "", tag: "Research" });
  };

  const moveTask = (taskId, from, to) => {
    if (from === to) return;
    const task = kanban.columns.find(c => c.id === from)?.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => {
      if (c.id === from) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
      if (c.id === to) return { ...c, tasks: [...c.tasks, task] };
      return c;
    })};
    saveKanban(updated);
  };

  const deleteKTask = (taskId, colId) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c) };
    saveKanban(updated);
  };

  const updateTag = (taskId, colId, tag) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, tag } : t) } : c) };
    saveKanban(updated);
    setEditTag(null);
  };

  const updateText = (taskId, colId, text) => {
    if (!text.trim()) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, text: text.trim() } : t) } : c) };
    saveKanban(updated);
    setEditText(null);
  };

  const addSuggested = (text, tag) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === "todo" ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text, tag: tag || "Research" }] } : c) };
    saveKanban(updated);
    showToast(`Added "${text}" to To Do`);
  };

  const seedDemo = async () => {
    const demo = { columns: [
      { id: "todo", title: "To Do", tasks: [
        { id: "d1", text: "Research TAM/SAM/SOM for target market", tag: "Analysis" },
        { id: "d2", text: "Design interview script for ICP validation", tag: "Research" },
        { id: "d3", text: "Create competitive feature matrix", tag: "Analysis" },
      ]},
      { id: "doing", title: "Doing", tasks: [
        { id: "d4", text: "Map customer decision journey", tag: "Research" },
        { id: "d5", text: "Draft one-page pitch narrative", tag: "Docs" },
      ]},
      { id: "done", title: "Done", tasks: [
        { id: "d6", text: "Define ideal customer profile", tag: "Validation" },
      ]},
    ]};
    setKanban(demo);
    await sSet(SK.kanban, demo);
    setNotes("Key insights from initial research:\n• Target users spend 3+ hours/week on manual workarounds\n• Main competitors are generic tools not built for this use case\n• Price sensitivity is low if value prop is clear\n\nNext steps: schedule 5 customer interviews this week");
    await sSet(SK.blocks, { notes: "Key insights from initial research:\n• Target users spend 3+ hours/week on manual workarounds\n• Main competitors are generic tools not built for this use case\n• Price sensitivity is low if value prop is clear\n\nNext steps: schedule 5 customer interviews this week" });
    showToast("Demo data loaded");
  };

  const doneCount = mrTasks?.filter(t => t.status === "done").length || 0;
  const totalTasks = mrTasks?.length || 0;
  const mrPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const getModuleStatus = (mod) => {
    if (mod.id === "market-research") { if (mrPct === 100) return "done"; if (totalTasks > 0) return "in-progress"; return "not-started"; }
    return "not-started";
  };

  const hasKanbanData = kanban.columns.some(c => c.tasks.length > 0);

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "24px 28px" }}>
      {toastEl}
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="serif" style={{ fontSize: 28, fontWeight: 400 }}>Your Roadmap</h1>
          <p style={{ color: C.mid, fontSize: 14, marginTop: 4 }}>From idea to pitch-ready · {MODULES_TEMPLATE.length} modules</p>
        </div>
        {!hasKanbanData && (
          <button className="btn btn-outline" onClick={seedDemo} style={{ fontSize: 12 }}>
            ▶ Start demo
          </button>
        )}
      </div>

      {/* Roadmap visual — nodes + connections */}
      <div className="card fade-up" style={{ padding: "28px 32px", marginBottom: 24, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: modules.length * 150 }}>
          {modules.map((mod, i) => {
            const status = getModuleStatus(mod);
            const isActive = mod.active;
            const isDone = status === "done";
            const isInProgress = status === "in-progress";
            return (
              <div key={mod.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div onClick={() => isActive ? go("market-research") : setComingSoon(mod)}
                  className="card-lift" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", minWidth: 110, textAlign: "center", position: "relative" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: isDone ? C.success : isInProgress ? C.inkSoft : C.bg,
                    border: `2.5px solid ${isDone ? C.success : isInProgress ? C.inkSoft : C.tan}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: isDone ? 18 : 20, color: isDone || isInProgress ? C.bg : C.mid,
                    transition: "all .2s"
                  }}>
                    {isDone ? "✓" : mod.icon}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: C.ink, fontFamily: F.sans, lineHeight: 1.3 }}>{mod.name}</div>
                  <div style={{ marginTop: -2 }}>
                    {isDone && <Badge text="Done" variant="done" small />}
                    {isInProgress && <Badge text={`${mrPct}%`} variant="in-progress" small />}
                    {!isActive && !isDone && <Badge text="Coming soon" variant="soon" small />}
                    {isActive && !isDone && !isInProgress && <Badge text="Start" variant="in-progress" small />}
                  </div>
                </div>
                {i < modules.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: isDone ? C.success : C.tan, minWidth: 20, marginTop: -20 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes + Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Notes */}
        <div className="card fade-up" style={{ padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h3 className="serif" style={{ fontSize: 17, fontWeight: 400, display: "flex", alignItems: "center", gap: 7 }}>📝 Notes</h3>
            <span style={{ fontSize: 11, color: C.mid }}>Auto-saved</span>
          </div>
          <textarea className="input" value={notes} onChange={e => { setNotes(e.target.value); saveNotes(e.target.value); }}
            placeholder="Quick thoughts, interview notes, next steps..."
            style={{ minHeight: 200, resize: "vertical", fontSize: 13.5, lineHeight: 1.65, background: C.bg, border: `1px solid ${C.tan}` }} />
        </div>

        {/* Kanban */}
        <div className="fade-up" style={{ animationDelay: ".05s" }}>
          <h3 className="serif" style={{ fontSize: 17, fontWeight: 400, marginBottom: 12 }}>Task Board</h3>

          {/* Suggested tasks */}
          <div className="card" style={{ padding: "10px 14px", marginBottom: 12, background: C.bg, border: `1px solid ${C.tan}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.mid, fontWeight: 500 }}>💡 Suggested:</span>
              {[{ t: "Research TAM/SAM/SOM", tag: "Analysis" }, { t: "Map customer journey", tag: "Research" }, { t: "Identify key metrics", tag: "Planning" }, { t: "Draft pitch outline", tag: "Docs" }].map(s => (
                <button key={s.t} className="btn-outline" onClick={() => addSuggested(s.t, s.tag)} style={{ fontSize: 11, padding: "3px 10px" }}>+ {s.t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {kanban.columns.map(col => (
              <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag) { moveTask(drag.id, drag.col, col.id); setDrag(null); }}}
                style={{ background: C.bg, borderRadius: 10, padding: 10, minHeight: 180 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${col.id === "done" ? C.success : col.id === "doing" ? C.inkSoft : C.tan}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{col.title}</span>
                  <span style={{ fontSize: 11, color: C.mid }}>{col.tasks.length}</span>
                </div>
                {col.tasks.map(task => (
                  <div key={task.id} draggable onDragStart={() => setDrag({ id: task.id, col: col.id })}
                    className="card" style={{ padding: "8px 10px", marginBottom: 5, cursor: "grab" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      {editText === task.id ? (
                        <input className="input" autoFocus defaultValue={task.text}
                          onKeyDown={e => { if (e.key === "Enter") updateText(task.id, col.id, e.target.value); if (e.key === "Escape") setEditText(null); }}
                          onBlur={e => updateText(task.id, col.id, e.target.value)}
                          style={{ fontSize: 12, padding: "3px 6px", flex: 1, marginRight: 4 }} />
                      ) : (
                        <span onDoubleClick={() => setEditText(task.id)} style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, cursor: "text" }}>{task.text}</span>
                      )}
                      <button onClick={() => deleteKTask(task.id, col.id)} style={{ all: "unset", cursor: "pointer", color: C.mid, fontSize: 11, opacity: .4, padding: "0 2px", lineHeight: 1, flexShrink: 0 }} onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=.4}>✕</button>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {editTag === task.id ? (
                        <select autoFocus value={task.tag || "Research"} onChange={e => updateTag(task.id, col.id, e.target.value)} onBlur={() => setEditTag(null)}
                          style={{ fontSize: 10, padding: "2px 4px", border: `1px solid ${C.tan}`, borderRadius: 4, fontFamily: F.sans, background: C.white }}>
                          {TASK_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <div onClick={() => setEditTag(task.id)} style={{ cursor: "pointer" }} title="Click to change tag"><Badge text={task.tag || "Research"} variant={task.tag || "Research"} small /></div>
                      )}
                    </div>
                  </div>
                ))}
                {col.tasks.length === 0 && !newTask.col && (
                  <div style={{ padding: "20px 10px", textAlign: "center", color: C.mid, fontSize: 12, opacity: .6 }}>
                    {col.id === "todo" ? "Drop tasks here" : col.id === "doing" ? "Drag tasks to start" : "Completed tasks"}
                  </div>
                )}
                {newTask.col === col.id ? (
                  <div style={{ marginTop: 4 }}>
                    <input className="input" autoFocus value={newTask.text} onChange={e => setNewTask({ ...newTask, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter") addKTask(col.id); if (e.key === "Escape") setNewTask({ col: null, text: "", tag: "Research" }); }} placeholder="Task name..." style={{ fontSize: 12, padding: "6px 8px", marginBottom: 4 }} />
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <select value={newTask.tag} onChange={e => setNewTask({ ...newTask, tag: e.target.value })}
                        style={{ fontSize: 10, padding: "3px 4px", border: `1px solid ${C.tan}`, borderRadius: 4, fontFamily: F.sans }}>
                        {TASK_TAGS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <button className="btn btn-dark" onClick={() => addKTask(col.id)} style={{ fontSize: 11, padding: "4px 10px" }}>Add</button>
                      <button className="btn-ghost" onClick={() => setNewTask({ col: null, text: "", tag: "Research" })} style={{ fontSize: 11, padding: "4px 6px" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewTask({ col: col.id, text: "", tag: "Research" })}
                    style={{ all: "unset", cursor: "pointer", width: "100%", textAlign: "center", padding: 6, borderRadius: 6, border: `1px dashed ${C.tan}`, fontSize: 12, color: C.mid, marginTop: 4 }}>+ Add task</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coming soon modal */}
      <Modal open={!!comingSoon} onClose={() => setComingSoon(null)} title={comingSoon?.name || "Module"}>
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{comingSoon?.icon}</div>
          <h2 className="serif" style={{ fontSize: 24, fontWeight: 400, marginBottom: 8 }}>{comingSoon?.name}</h2>
          <p style={{ color: C.mid, fontSize: 14, marginBottom: 6 }}>{comingSoon?.desc}</p>
          <Badge text="Coming Soon" variant="soon" />
          <p style={{ color: C.mid, fontSize: 13, marginTop: 20, maxWidth: 360, margin: "20px auto 0", lineHeight: 1.6 }}>
            This module is part of your full founder roadmap. It will be available after the hackathon MVP stage.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MARKET RESEARCH MODULE
// ═══════════════════════════════════════════════════════════
function MarketResearchPage({ idea, go }) {
  const [tasks, setTasks] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [addCtx, setAddCtx] = useState("");
  const [sel, setSel] = useState(null);
  const [phase, setPhase] = useState("planning");
  const [chat, setChat] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [doc, setDoc] = useState("");
  const [showAdv, setShowAdv] = useState(false);
  const [tplText, setTplText] = useState("You are a market research expert helping a founder define their ICP. Be specific, actionable, and structured.");
  const [ctxToggles, setCtxToggles] = useState({ idea: true, docs: true, notes: false });
  const [tone, setTone] = useState("Coach");
  const [search, setSearch] = useState("");
  const [showToast, toastEl] = useToast();
  const chatEnd = useRef(null);

  useEffect(() => {
    (async () => {
      const t = await sGet(SK.mrTasks); if (t?.length) { setTasks(t); setGenerated(true); }
      const g = await sGet(SK.mrGenerated); if (g) setGenerated(true);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const saveTasks = async (t) => { setTasks(t); await sSet(SK.mrTasks, t); };

  const genTasks = async () => {
    setGenerating(true);
    const ideaStr = idea ? `${idea.name}: ${idea.oneLiner}. Customer: ${idea.customer}. Problem: ${idea.problem}.` : "General startup";
    let res = await callAI([{ role: "user", content: "Generate market research tasks." }], `Based on this startup, generate market research tasks. Startup: ${ideaStr}. Extra: ${addCtx}. Respond as JSON: { "tasks": [{ "title":"", "description":"", "tag":"Research|Validation|Strategy|Analysis|Interviews|Planning", "priority":"high|medium|low", "subtasks":["s1","s2","s3"] }] }`);
    if (!res?.tasks) res = mockTasks();
    const newTasks = res.tasks.map((t, i) => ({ id: `t-${Date.now()}-${i}`, ...t, status: "not-started", doc: "", completedSubs: [] }));
    await saveTasks(newTasks);
    await sSet(SK.mrGenerated, true);
    setGenerated(true);
    setGenerating(false);
  };

  const updateStatus = async (id, status) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    await saveTasks(updated);
    if (sel?.id === id) setSel(prev => ({ ...prev, status }));
    showToast(status === "done" ? "Task marked as done!" : "Task reopened");
  };

  const toggleSub = async (taskId, sub) => {
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      const done = t.completedSubs || [];
      return { ...t, completedSubs: done.includes(sub) ? done.filter(s => s !== sub) : [...done, sub] };
    });
    await saveTasks(updated);
    if (sel?.id === taskId) setSel(updated.find(t => t.id === taskId));
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const userMsg = { role: "user", content: chatIn.trim() };
    const newMsgs = [...chat, userMsg];
    setChat(newMsgs);
    setChatIn("");
    setChatLoad(true);
    const ideaStr = idea ? JSON.stringify(idea) : "General";
    const toneInst = tone === "Coach" ? "Be encouraging but direct." : tone === "Co-founder" ? "Be candid and challenge assumptions." : "Be professional and analytical.";
    const sys = `${tplText}\nStartup: ${ideaStr}\nTask: ${sel?.title}\nPhase: ${phase}\nTone: ${toneInst}`;
    let res = await callAI(newMsgs.slice(-8), sys);
    if (!res) res = mockChat(phase);
    setChat(prev => [...prev, { role: "assistant", content: res.message }]);
    if (res.suggestions) setChat(prev => [...prev, { role: "system", type: "suggestions", data: res.suggestions }]);
    if (res.improvements) setChat(prev => [...prev, { role: "system", type: "improvements", data: res.improvements }]);
    if (res.markdown?.trim()) setDoc(prev => prev + "\n\n" + res.markdown);
    setChatLoad(false);
  };

  const genDoc = async () => {
    setChatLoad(true);
    let res = await callAI([{ role: "user", content: "Generate document." }], `Generate structured markdown for "${sel?.title}". Startup: ${JSON.stringify(idea || {})}. Respond as JSON: { "message":"Done", "markdown":"# full md" }`);
    if (!res?.markdown) res = { message: "Generated!", markdown: `# ${sel?.title}\n\n## Overview\nResearch document for ${idea?.name || "your startup"}.\n\n## Key Questions\n- Market size?\n- Who are primary segments?\n- Key trends?\n\n## Methodology\n- Desk research\n- Customer interviews (5-10)\n- Competitive analysis\n\n## Findings\n*[Add findings]*\n\n## Recommendations\n*[Add conclusions]*` };
    setDoc(res.markdown);
    setChat(prev => [...prev, { role: "assistant", content: "📄 Document generated — see the output panel on the right." }]);
    setChatLoad(false);
    showToast("Document generated");
  };

  const saveDoc = async () => {
    if (!sel) return;
    const updated = tasks.map(t => t.id === sel.id ? { ...t, doc } : t);
    await saveTasks(updated);
    showToast("Document saved");
  };

  const downloadDoc = () => {
    if (!doc) return;
    const blob = new Blob([doc], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-research-${sel?.tag?.toLowerCase() || "output"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded");
  };

  const copyDoc = () => {
    navigator.clipboard?.writeText(doc);
    showToast("Copied to clipboard");
  };

  const doneCount = tasks.filter(t => t.status === "done").length;
  const filtered = search ? tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase())) : tasks;

  // ── TASK DETAIL ──
  if (sel) {
    const task = tasks.find(t => t.id === sel.id) || sel;
    const isDone = task.status === "done";
    return (
      <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
        {toastEl}
        {/* Breadcrumb + task header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.tan}`, padding: "0 28px" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto" }}>
            <div style={{ padding: "8px 0 4px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.mid }}>
              <button className="btn-ghost" onClick={() => go("dashboard")} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
              <span>›</span>
              <button className="btn-ghost" onClick={() => { setSel(null); setChat([]); }} style={{ fontSize: 12, padding: "2px 4px" }}>Market Research</button>
              <span>›</span>
              <span style={{ color: C.ink, fontWeight: 500 }}>{task.title}</span>
            </div>
            <div style={{ paddingBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Badge text={task.tag} variant={task.tag} />
                <h2 className="serif" style={{ fontSize: 21, fontWeight: 400 }}>{task.title}</h2>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className={isDone ? "btn btn-danger" : "btn btn-success"}
                  onClick={() => updateStatus(task.id, isDone ? "not-started" : "done")}
                  style={{ fontSize: 14, padding: "10px 24px", fontWeight: 700 }}>
                  {isDone ? "↩ Reopen task" : "✓ Mark as done"}
                </button>
                <button className="btn btn-dark" onClick={genDoc} disabled={chatLoad}>
                  📄 Generate MD output
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Three panels */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "220px 1fr 290px", overflow: "hidden" }}>
          {/* Left: task list */}
          <div style={{ borderRight: `1px solid ${C.tan}`, overflowY: "auto", background: C.white }}>
            <div style={{ padding: 12 }}>
              <input className="input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 12, padding: "7px 10px" }} />
            </div>
            {filtered.map(t => (
              <div key={t.id} onClick={() => { setSel(t); setChat([]); setDoc(t.doc || ""); setPhase("planning"); }}
                style={{ padding: "9px 12px", cursor: "pointer", background: t.id === task.id ? C.bg : "transparent", borderLeft: t.id === task.id ? `2px solid ${C.inkSoft}` : "2px solid transparent", transition: "all .1s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${t.status === "done" ? C.success : C.tan}`, background: t.status === "done" ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: C.white, flexShrink: 0 }}>
                    {t.status === "done" ? "✓" : t.status === "in-progress" ? <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.inkSoft }} /> : null}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: t.id === task.id ? 600 : 400, color: t.status === "done" ? C.mid : C.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                </div>
                <div style={{ marginLeft: 22, marginTop: 3 }}><Badge text={t.tag} variant={t.tag} small /></div>
              </div>
            ))}
            <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.tan}`, fontSize: 11.5, color: C.mid }}>
              {doneCount} of {tasks.length} complete · {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
            </div>
          </div>

          {/* Center: workspace */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Description + subtasks */}
            <div style={{ padding: "14px 22px", borderBottom: `1px solid ${C.tan}`, background: C.white }}>
              <p style={{ fontSize: 13.5, color: C.inkSoft, marginBottom: 10, lineHeight: 1.5 }}>{task.description}</p>
              {task.subtasks?.length > 0 && (
                <div>
                  <div className="label" style={{ marginBottom: 7 }}>SUBTASKS</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {task.subtasks.map(s => {
                      const done = (task.completedSubs || []).includes(s);
                      return (
                        <button key={s} onClick={() => toggleSub(task.id, s)}
                          style={{ padding: "4px 12px", borderRadius: 99, border: `1px solid ${done ? C.success : C.tan}`, background: done ? C.successBg : C.white, color: done ? C.success : C.inkSoft, fontSize: 12, fontFamily: F.sans, fontWeight: 500, cursor: "pointer", transition: "all .15s", display: "flex", alignItems: "center", gap: 4 }}>
                          {done && <span>✓</span>}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Phase tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${C.tan}`, background: C.white, padding: "0 22px" }}>
              {["planning", "building", "guidance"].map(p => (
                <button key={p} onClick={() => setPhase(p)}
                  style={{ all: "unset", cursor: "pointer", padding: "11px 18px", fontSize: 13.5, fontWeight: phase === p ? 600 : 400, color: phase === p ? C.ink : C.mid, fontFamily: F.sans, borderBottom: phase === p ? `2px solid ${C.ink}` : "2px solid transparent", transition: "all .15s", marginBottom: -1, textTransform: "capitalize" }}>
                  {p === "planning" ? "🗺️ Planning" : p === "building" ? "🔨 Building" : "📋 Guidance"}
                </button>
              ))}
            </div>

            {/* Phase hint */}
            <div style={{ padding: "8px 22px", fontSize: 12, color: C.mid, fontStyle: "italic", background: C.bg, borderBottom: `1px solid ${C.tan}` }}>
              {phase === "planning" ? "Suggest the fastest research path tailored to your startup." : phase === "building" ? "Let's produce clean output docs you can reuse." : "I'll review your docs and suggest improvements."}
            </div>

            {/* Chat */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px" }}>
              {chat.length === 0 && (
                <div style={{ textAlign: "center", padding: "50px 0", color: C.mid }}>
                  <div style={{ fontSize: 28, opacity: .2, marginBottom: 8 }}>{phase === "planning" ? "🗺️" : phase === "building" ? "🔨" : "📋"}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.inkSoft }}>Start a conversation about {phase}</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>Use the prompt chips below or type your own question</div>
                </div>
              )}
              {chat.map((m, i) => {
                if (m.role === "system" && m.type === "suggestions") return (
                  <div key={i} style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "2px 0 14px 2px" }}>
                    {m.data.map((s, j) => <button key={j} className="btn-outline" onClick={() => setChatIn(s)} style={{ fontSize: 12, padding: "4px 11px" }}>{s}</button>)}
                  </div>
                );
                if (m.role === "system" && m.type === "improvements") return (
                  <div key={i} style={{ margin: "2px 0 14px 2px", padding: "10px 14px", background: C.warnBg, borderRadius: 8, border: `1px solid ${C.warn}22` }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.warn, marginBottom: 5 }}>Suggested improvements</div>
                    {m.data.map((imp, j) => <div key={j} style={{ fontSize: 13, color: C.inkSoft, marginBottom: 2 }}>• {imp}</div>)}
                  </div>
                );
                return (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                    <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: 11, fontSize: 13.5, lineHeight: 1.65, fontFamily: F.sans, whiteSpace: "pre-wrap",
                      ...(m.role === "user" ? { background: C.ink, color: C.bg, borderBottomRightRadius: 3 } : { background: C.bg, color: C.ink, borderBottomLeftRadius: 3 }) }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {chatLoad && <Dots />}
              <div ref={chatEnd} />
            </div>

            {/* Subtask suggestion chips */}
            {task.subtasks?.length > 0 && (
              <div style={{ padding: "6px 22px", borderTop: `1px solid ${C.tan}`, background: C.white, display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: C.mid, fontWeight: 500 }}>Quick prompts:</span>
                {task.subtasks.filter(s => !(task.completedSubs || []).includes(s)).slice(0, 3).map(s => (
                  <button key={s} className="btn-outline" onClick={() => setChatIn(`Help me with: ${s}`)} style={{ fontSize: 11, padding: "3px 9px" }}>{s}</button>
                ))}
                {phase === "building" && <button className="btn-outline" onClick={() => setChatIn("Generate a research brief template")} style={{ fontSize: 11, padding: "3px 9px" }}>📝 Generate brief</button>}
                {phase === "guidance" && <button className="btn-outline" onClick={() => setChatIn("Review my progress and suggest improvements")} style={{ fontSize: 11, padding: "3px 9px" }}>📋 Review progress</button>}
              </div>
            )}

            {/* Chat input */}
            <div style={{ borderTop: `1px solid ${C.tan}`, padding: "10px 22px", display: "flex", gap: 7, alignItems: "center", background: C.white }}>
              <button className="btn-ghost" style={{ padding: 5 }} title="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.mid} strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>
              </button>
              <input className="input" value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Ask a question or share your thoughts..." disabled={chatLoad} style={{ border: "none", boxShadow: "none", padding: "7px 0", background: "transparent" }} />
              <button className="btn btn-dark" onClick={sendChat} disabled={!chatIn.trim() || chatLoad} style={{ padding: "7px 12px", borderRadius: 99 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>

          {/* Right: Output + settings */}
          <div style={{ borderLeft: `1px solid ${C.tan}`, display: "flex", flexDirection: "column", background: C.white, overflowY: "auto" }}>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.tan}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.inkSoft} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Task Output (Markdown)</span>
              </div>
              <div style={{ fontSize: 11, color: C.mid, fontFamily: F.mono }}>market-research-{task.tag?.toLowerCase()}.md</div>
            </div>
            <textarea value={doc} onChange={e => setDoc(e.target.value)} placeholder="Output will appear here after generating or chatting in Building mode..."
              style={{ flex: 1, minHeight: 200, padding: 14, border: "none", resize: "none", fontSize: 12.5, fontFamily: F.mono, lineHeight: 1.7, outline: "none", background: C.bg, color: C.ink }} />
            <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.tan}`, display: "flex", gap: 5 }}>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={copyDoc}>📋 Copy</button>
              <button className="btn-ghost" style={{ fontSize: 11 }} onClick={downloadDoc}>⬇ Download</button>
              <button className="btn btn-dark" onClick={saveDoc} style={{ fontSize: 11, padding: "4px 10px", marginLeft: "auto" }}>💾 Save</button>
            </div>

            {/* Upload */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.tan}` }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Upload Files</div>
              <div style={{ border: `1px dashed ${C.tan}`, borderRadius: 8, padding: "16px 12px", textAlign: "center", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.mid} onMouseLeave={e => e.currentTarget.style.borderColor = C.tan}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.mid} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 4px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{ fontSize: 12, color: C.mid }}>Drop files here</div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div style={{ borderTop: `1px solid ${C.tan}` }}>
              <button onClick={() => setShowAdv(!showAdv)}
                style={{ all: "unset", cursor: "pointer", width: "100%", padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                  ⚙️ Advanced Settings
                </span>
                <span style={{ fontSize: 13, color: C.mid, transition: "transform .2s", transform: showAdv ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
              </button>
              {showAdv && (
                <div style={{ padding: "0 16px 14px" }}>
                  <div className="label" style={{ marginBottom: 5 }}>Prompt template</div>
                  <textarea className="input" value={tplText} onChange={e => setTplText(e.target.value)}
                    style={{ fontSize: 12, fontFamily: F.mono, minHeight: 80, resize: "vertical", lineHeight: 1.5 }} />

                  <div className="label" style={{ marginTop: 12, marginBottom: 5 }}>Context included</div>
                  {[{ k: "idea", l: "Startup Idea MD" }, { k: "docs", l: "Uploaded docs" }, { k: "notes", l: "Task notes" }].map(c => (
                    <label key={c.k} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0", fontSize: 13, color: C.inkSoft, cursor: "pointer" }}>
                      <input type="checkbox" checked={ctxToggles[c.k]} onChange={e => setCtxToggles(p => ({ ...p, [c.k]: e.target.checked }))} style={{ accentColor: C.inkSoft }} />
                      {c.l}
                    </label>
                  ))}

                  <div className="label" style={{ marginTop: 12, marginBottom: 5 }}>Tone</div>
                  <select className="input" value={tone} onChange={e => setTone(e.target.value)} style={{ fontSize: 13 }}>
                    <option>Coach</option>
                    <option>Co-founder</option>
                    <option>Advisor</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ENTRY / TASK LIST ──
  if (!loaded) return (
    <div style={{ height: "calc(100vh - 52px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Spinner size={24} />
        <span style={{ fontSize: 13, color: C.mid }}>Loading market research...</span>
      </div>
    </div>
  );

  if (!generated) {
    return (
      <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
        {toastEl}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.tan}`, padding: "0 28px" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mid }}>
              <button className="btn-ghost" onClick={() => go("dashboard")} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
              <span>›</span><span style={{ color: C.ink, fontWeight: 500 }}>Market Research</span>
            </div>
            <button className="btn-ghost" onClick={() => go("dashboard")}>← Back to roadmap</button>
          </div>
          <div style={{ maxWidth: 1340, margin: "0 auto", paddingBottom: 10 }}>
            <h1 className="serif" style={{ fontSize: 25, fontWeight: 400 }}>Market Research</h1>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ maxWidth: 560, width: "100%" }} className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.bg, border: `1px solid ${C.tan}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="46" stroke={C.ink} strokeWidth="6"/><path d="M50 72C50 72 50 45 50 38C50 28 42 22 32 26" stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none"/><path d="M50 55C50 55 50 42 55 35C60 28 70 28 73 33" stroke={C.ink} strokeWidth="5" strokeLinecap="round" fill="none"/></svg>
              </div>
              <h2 className="serif" style={{ fontSize: 22, fontWeight: 400 }}>Based on your startup idea, here's my suggested market research plan.</h2>
            </div>

            <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.65, marginBottom: 20 }}>
              Focus areas I'll help you explore:
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
                {["Define your Ideal Customer Profile (ICP)", "Validate demand through customer interviews", "Research market size and trends", "Analyze competitor positioning", "Identify go-to-market channels", "Map the customer decision journey"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 21, height: 21, borderRadius: "50%", background: C.ink, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div className="label" style={{ marginBottom: 5 }}>Anything else you want to add?</div>
              <textarea className="input" value={addCtx} onChange={e => setAddCtx(e.target.value)} placeholder="e.g., I've already done some competitor analysis..." style={{ minHeight: 70, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            <div style={{ border: `1px dashed ${C.tan}`, borderRadius: 10, padding: 20, textAlign: "center", marginBottom: 18, cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.mid} onMouseLeave={e => e.currentTarget.style.borderColor = C.tan}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.mid} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 6px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style={{ fontSize: 13.5, color: C.inkSoft }}>Drag & drop documents here</div>
              <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>PDFs, docs, spreadsheets</div>
            </div>

            <button className="btn btn-dark" onClick={genTasks} disabled={generating} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 10 }}>
              {generating ? (
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}><Spinner size={18} /> Generating task list...</span>
              ) : (
                <>Generate my market research task list <span style={{ marginLeft: 4 }}>→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Generated: show task list with select prompt
  return (
    <div style={{ height: "calc(100vh - 52px)", display: "flex", flexDirection: "column" }}>
      {toastEl}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.tan}`, padding: "0 28px" }}>
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mid }}>
            <button className="btn-ghost" onClick={() => go("dashboard")} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
            <span>›</span><span style={{ color: C.ink, fontWeight: 500 }}>Market Research</span>
            <Badge text={`${tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%`} variant="in-progress" small />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-outline" onClick={genTasks} disabled={generating}>
              {generating ? <><Spinner size={14} /> Regenerating...</> : "⟳ Regenerate task plan"}
            </button>
            <button className="btn-ghost" onClick={() => go("dashboard")}>← Back to roadmap</button>
          </div>
        </div>
        <div style={{ maxWidth: 1340, margin: "0 auto", paddingBottom: 10 }}>
          <h1 className="serif" style={{ fontSize: 25, fontWeight: 400 }}>Market Research</h1>
          <div style={{ marginTop: 6 }}><Progress value={doneCount} max={tasks.length} label={`${doneCount} of ${tasks.length} tasks complete`} /></div>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "230px 1fr", overflow: "hidden" }}>
        {/* Task sidebar */}
        <div style={{ borderRight: `1px solid ${C.tan}`, overflowY: "auto", background: C.white }}>
          <div style={{ padding: 12 }}>
            <input className="input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: 12, padding: "7px 10px" }} />
          </div>
          {filtered.map(t => (
            <div key={t.id} onClick={() => { setSel(t); setChat([]); setDoc(t.doc || ""); setPhase("planning"); }}
              style={{ padding: "9px 12px", cursor: "pointer", transition: "all .1s", borderLeft: "2px solid transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 15, height: 15, borderRadius: "50%", border: `2px solid ${t.status === "done" ? C.success : C.tan}`, background: t.status === "done" ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: C.white, flexShrink: 0 }}>
                  {t.status === "done" ? "✓" : ""}
                </div>
                <span style={{ fontSize: 12.5, fontWeight: 450, color: t.status === "done" ? C.mid : C.ink, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
              </div>
              <div style={{ marginLeft: 22, marginTop: 3 }}><Badge text={t.tag} variant={t.tag} small /></div>
            </div>
          ))}
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.tan}`, fontSize: 11.5, color: C.mid }}>
            {doneCount} of {tasks.length} complete · {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
          </div>
        </div>

        {/* Center: select prompt */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", color: C.mid }}>
            <div style={{ fontSize: 32, opacity: .15, marginBottom: 10 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.inkSoft }}>Select a task to begin</div>
            <div style={{ fontSize: 13, marginTop: 3 }}>Click any task on the left to start working</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NETWORK PAGE
// ═══════════════════════════════════════════════════════════
function NetworkPage() {
  const [tab, setTab] = useState("founders");
  const founders = [
    { name: "Sarah Chen", title: "Founder & CEO at PayFlow", desc: "Automated invoicing for freelancers", tags: ["Fintech", "Seed"], loc: "San Francisco, CA", initials: "SC", color: "#5a7c5a" },
    { name: "Marcus Johnson", title: "Co-founder at DataSync", desc: "Real-time data integration for SMBs", tags: ["SaaS", "Pre-seed"], loc: "Austin, TX", initials: "MJ", color: "#4a6680" },
    { name: "Elena Rodriguez", title: "Founder at HealthTrack", desc: "Patient engagement platform for clinics", tags: ["HealthTech", "Series A"], loc: "Miami, FL", initials: "ER", color: "#8a7340" },
    { name: "David Kim", title: "CEO at LearnPath", desc: "AI career coaching for professionals", tags: ["EdTech", "Seed"], loc: "New York, NY", initials: "DK", color: "#7c4444" },
    { name: "Priya Sharma", title: "Founder at GreenRoute", desc: "Sustainable logistics optimization platform", tags: ["CleanTech", "Pre-seed"], loc: "London, UK", initials: "PS", color: "#4a7060" },
  ];
  const investors = [
    { name: "James Liu", title: "Partner at Horizon Ventures", desc: "Pre-seed to Seed · B2B SaaS focus", tags: ["$100K–$500K", "SaaS"], loc: "London, UK", initials: "JL", color: "#4a6680", portfolio: 24, checkSize: "$100K–$500K", sectors: ["B2B SaaS", "Dev Tools"] },
    { name: "Amara Okafor", title: "Angel Investor", desc: "Solo checks in fintech and dev tools", tags: ["$25K–$100K", "Fintech"], loc: "Lagos, NG", initials: "AO", color: "#5a7c5a", portfolio: 12, checkSize: "$25K–$100K", sectors: ["Fintech", "Payments"] },
    { name: "Rachel Park", title: "GP at First Mile Fund", desc: "Seed stage · Consumer and marketplace", tags: ["$250K–$1M", "Consumer"], loc: "San Francisco, CA", initials: "RP", color: "#8a7340", portfolio: 38, checkSize: "$250K–$1M", sectors: ["Consumer", "Marketplace"] },
    { name: "Thomas Weber", title: "Partner at Deep Tech Capital", desc: "Series A · Deep tech and AI infrastructure", tags: ["$500K–$2M", "Deep Tech"], loc: "Berlin, DE", initials: "TW", color: "#6b5b8a", portfolio: 19, checkSize: "$500K–$2M", sectors: ["AI/ML", "Infrastructure"] },
  ];
  const data = tab === "founders" ? founders : investors;

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "28px" }}>
      <div className="fade-up">
        <h1 className="serif" style={{ fontSize: 28, fontWeight: 400 }}>Network</h1>
        <p style={{ color: C.mid, fontSize: 14, marginTop: 4 }}>
          {tab === "founders" ? "Connect with founders building the future" : "Find investors aligned with your stage and sector"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 3, marginTop: 18, marginBottom: 22 }}>
        {["founders", "investors"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: tab === t ? C.ink : C.bg, color: tab === t ? C.bg : C.mid, fontSize: 13.5, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 22, alignItems: "start" }}>
        <div>
          <div className="card" style={{ padding: 14, marginBottom: 14, display: "flex", gap: 8 }}>
            <input className="input" placeholder={`Search ${tab}...`} style={{ fontSize: 13.5 }} />
            {tab === "founders" ? (
              <>
                <select className="input" style={{ width: "auto", fontSize: 13, color: C.mid }}>
                  <option>All Industries</option>
                  <option>Fintech</option><option>SaaS</option><option>HealthTech</option><option>EdTech</option><option>CleanTech</option>
                </select>
                <select className="input" style={{ width: "auto", fontSize: 13, color: C.mid }}>
                  <option>All Stages</option>
                  <option>Pre-seed</option><option>Seed</option><option>Series A</option>
                </select>
                <select className="input" style={{ width: "auto", fontSize: 13, color: C.mid }}>
                  <option>All Locations</option>
                  <option>US</option><option>UK</option><option>EU</option>
                </select>
              </>
            ) : (
              <>
                <select className="input" style={{ width: "auto", fontSize: 13, color: C.mid }}>
                  <option>All Check Sizes</option>
                  <option>$25K–$100K</option><option>$100K–$500K</option><option>$250K–$1M</option><option>$500K–$2M</option>
                </select>
                <select className="input" style={{ width: "auto", fontSize: 13, color: C.mid }}>
                  <option>All Sectors</option>
                  <option>SaaS</option><option>Fintech</option><option>Consumer</option><option>Deep Tech</option><option>AI/ML</option>
                </select>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map((p, i) => (
              <div key={i} className="card card-lift fade-up" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", animationDelay: `${i * .05}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: p.color, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, fontFamily: F.sans, flexShrink: 0 }}>{p.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: C.inkSoft }}>{p.title}</div>
                    <div style={{ fontSize: 12.5, color: C.mid, marginTop: 2 }}>{p.desc}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                      {p.tags.map(t => <Badge key={t} text={t} variant="soon" small />)}
                      <span style={{ fontSize: 11, color: C.mid, display: "flex", alignItems: "center", gap: 3 }}>
                        📍 {p.loc}
                      </span>
                      {p.portfolio && <span style={{ fontSize: 11, color: C.mid }}>· {p.portfolio} investments</span>}
                    </div>
                  </div>
                </div>
                <button className="btn btn-outline" style={{ flexShrink: 0, fontSize: 13 }}>
                  {tab === "investors" ? "📩 Request intro" : "✉ Connect"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "sticky", top: 76, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card fade-up" style={{ padding: 20 }}>
            <h3 className="serif" style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>
              {tab === "investors" ? "💡 Investor tips" : "ℹ️ How intros work"}
            </h3>
            {tab === "founders" ? (
              [{n:"1",t:"Click \"Connect\" on any profile"},{n:"2",t:"Write a brief note about why you'd like to connect"},{n:"3",t:"We'll facilitate when both parties accept"}].map(s => (
                <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.ink, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                  <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{s.t}</span>
                </div>
              ))
            ) : (
              [{n:"1",t:"Complete your Market Research module first"},{n:"2",t:"Investors prefer founders who've validated their market"},{n:"3",t:"Include your one-liner and traction in your intro note"}].map(s => (
                <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.ink, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                  <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{s.t}</span>
                </div>
              ))
            )}
          </div>

          <div className="card fade-up" style={{ padding: 20, background: C.ink, border: "none" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.bg, marginBottom: 5 }}>
              {tab === "investors" ? "Investor ready?" : "Get discovered"}
            </h3>
            <p style={{ fontSize: 13, color: C.tan, lineHeight: 1.55, marginBottom: 12 }}>
              {tab === "investors"
                ? "Complete your roadmap modules to unlock warm introductions to aligned investors."
                : "Complete your profile to appear in search results and receive intro requests."
              }
            </p>
            <button style={{ width: "100%", padding: "9px", borderRadius: 7, background: C.white, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: F.sans }}>
              {tab === "investors" ? "📊 Check readiness" : "🖥️ Post your startup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("loading");
  const [idea, setIdea] = useState(null);
  const [mrTasks, setMrTasks] = useState([]);

  useEffect(() => {
    (async () => {
      const i = await sGet(SK.idea); if (i) setIdea(i);
      const done = await sGet(SK.onboarded);
      const t = await sGet(SK.mrTasks); if (t) setMrTasks(t);
      setPage(done ? "dashboard" : "onboarding");
    })();
  }, []);

  useEffect(() => {
    if (page === "dashboard") { (async () => { const t = await sGet(SK.mrTasks); if (t) setMrTasks(t); })(); }
  }, [page]);

  const completeOnboard = async (summary) => {
    setIdea(summary);
    await sSet(SK.idea, summary);
    await sSet(SK.onboarded, true);
    setPage("dashboard");
  };

  if (page === "loading") return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, gap: 16 }}>
      <Styles />
      <Logo size={36} />
      <Spinner size={20} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <Styles />
      {page !== "onboarding" && <NavBar page={page} go={setPage} />}
      {page === "onboarding" && <OnboardingPage onComplete={completeOnboard} />}
      {page === "dashboard" && <DashboardPage idea={idea} go={setPage} mrTasks={mrTasks} />}
      {page === "market-research" && <MarketResearchPage idea={idea} go={setPage} />}
      {page === "network" && <NetworkPage />}
    </div>
  );
}
