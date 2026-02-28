import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   FOUNDER ROADMAP OS — Refined Editorial Workshop
   
   Design direction: Light editorial theme with navy structural accents.
   Serif headlines, clean sans body, generous whitespace, paper warmth.
   ═══════════════════════════════════════════════════════════════ */

// ─── Design Tokens ───────────────────────────────────────────────
const T = {
  navy:     "#153243",
  blue:     "#284b63",
  sage:     "#b4b8ab",
  cream:    "#f4f9e9",
  shell:    "#eef0eb",
  white:    "#ffffff",
  // Functional
  accent:   "#3b7c93",
  success:  "#4a7c5f",
  successBg:"#e8f2ec",
  warn:     "#9e7c2e",
  warnBg:   "#faf3e0",
  danger:   "#8c4444",
  dangerBg: "#fae8e8",
  // Surfaces
  bg:       "#f6f8f3",
  surface:  "#ffffff",
  surfaceAlt:"#f0f3ec",
  border:   "#d8dbd3",
  borderLight:"#e8ebe4",
  // Text
  text:     "#153243",
  textSec:  "#4a5e6d",
  textMuted:"#8a9498",
  textInv:  "#f4f9e9",
};

const FONT = {
  serif: "'Newsreader', 'Georgia', serif",
  sans: "'Outfit', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
};

// ─── Module Definitions ──────────────────────────────────────────
const MODULES = [
  { id: "onboarding", name: "Onboarding", icon: "◎", desc: "Define your startup idea, customer, and key assumptions", cat: "foundation" },
  { id: "market-research", name: "Market Research", icon: "◉", desc: "Validate demand, understand your ICP, and find your channels", cat: "validation", active: true },
  { id: "competitor-scan", name: "Competitor Scan", icon: "◎", desc: "Map the competitive landscape and find your positioning", cat: "validation" },
  { id: "pricing", name: "Pricing & Packaging", icon: "◎", desc: "Design your pricing strategy and package tiers", cat: "strategy" },
  { id: "gtm", name: "Go-To-Market", icon: "◎", desc: "Build your launch strategy and acquisition playbook", cat: "strategy" },
  { id: "mvp-plan", name: "MVP Build Plan", icon: "◎", desc: "Scope your MVP and create a development roadmap", cat: "build" },
  { id: "pitch-deck", name: "Pitch Deck", icon: "◎", desc: "Create an investor-ready pitch deck with your insights", cat: "fundraise" },
];

const TASK_CATEGORIES = {
  ICP: { color: "#3b7c93", bg: "#e6f0f5" },
  Demand: { color: "#6b5b8a", bg: "#f0ecf5" },
  Competitors: { color: "#8c6b3a", bg: "#f5f0e6" },
  Channels: { color: "#3b8c6b", bg: "#e6f5f0" },
  Metrics: { color: "#8c3b5b", bg: "#f5e6ec" },
  Strategy: { color: "#4a6b8c", bg: "#e8eef5" },
};

// ─── Storage ─────────────────────────────────────────────────────
const SK = {
  idea: "fos2-idea",
  onboarded: "fos2-onboarded",
  blocks: "fos2-blocks",
  kanban: "fos2-kanban",
  mrTasks: "fos2-mr-tasks",
  templates: "fos2-templates",
};

async function sGet(k) {
  try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function sSet(k, v) {
  try { await window.storage.set(k, JSON.stringify(v)); } catch {}
}

// ─── AI Helpers ──────────────────────────────────────────────────
const TEMPLATES = {
  onboarding: `You are an experienced startup advisor running a structured onboarding session. Ask targeted questions to build a founder profile. Cover: problem, solution, target customer, stage, goals, strengths, gaps. Be warm but probing — challenge vague answers.

Previous conversation:
{history}

Respond as JSON: { "message": "your response", "ready": false }
When you have enough (4-6 exchanges), respond: { "message": "summary message", "ready": true, "summary": { "name": "startup name", "oneLiner": "one line", "customer": "target customer", "problem": "problem", "solution": "solution", "whyNow": "why now", "stage": "stage", "assumptions": ["a1","a2","a3","a4"], "strengths": ["s1","s2"], "gaps": ["g1","g2"] } }`,

  taskGen: `Based on this startup, generate a focused market research task list with categories.
Startup: {idea}
Additional context: {context}
Respond as JSON: { "tasks": [{ "title": "title", "description": "desc", "category": "ICP|Demand|Competitors|Channels|Metrics", "priority": "high|medium|low", "subtasks": ["subtask1","subtask2","subtask3"] }] }`,

  planning: `You are a market research advisor. Startup: {idea}. Task: {task}. Phase: Planning.
Help plan their approach. Suggest specific, actionable steps. Be concise.
Respond as JSON: { "message": "response", "suggestions": ["s1","s2","s3"] }`,

  building: `You are a market research advisor producing outputs. Startup: {idea}. Task: {task}. Phase: Building.
Help create structured research documents. When generating, use rich markdown.
Respond as JSON: { "message": "response", "markdown": "optional md content" }`,

  guidance: `You are a market research advisor reviewing work. Startup: {idea}. Task: {task}. Phase: Guidance.
Review their docs and suggest specific improvements. Use ✅ for strengths and ⚠️ for improvements.
Respond as JSON: { "message": "response", "improvements": ["i1","i2"] }`,
};

async function callAI(messages, system) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    try { return JSON.parse(txt.replace(/```json\n?|```\n?/g, "").trim()); }
    catch { return { message: txt }; }
  } catch { return null; }
}

// Mock responses
function mockOnboard(msgs) {
  const n = msgs.filter(m => m.role === "user").length;
  if (n === 1) return { message: "That's a compelling space to be in. Help me understand the pain point more deeply — who specifically feels this pain, and what are they doing about it today? What does their current workaround look like?", ready: false };
  if (n === 2) return { message: "Interesting. So there's a clear gap between what exists and what's needed. What stage are you at with this? And what's your background — what makes you the right person to solve this?", ready: false };
  if (n === 3) return { message: "Good. Last thing — what's your primary goal in the next 3 months? Are you trying to validate, build an MVP, raise funding, or something else? And where do you feel you need the most help?", ready: false };
  return {
    message: "I have a solid picture now. Here's your startup profile — review it and let's get you onto your roadmap.",
    ready: true,
    summary: {
      name: "Your Startup",
      oneLiner: msgs[1]?.content?.substring(0, 100) || "An innovative startup solving a real problem",
      customer: "Target customer segment identified through onboarding",
      problem: "The core pain point articulated by the founder",
      solution: "The proposed solution approach",
      whyNow: "Market timing and enabling trends",
      stage: "Early stage",
      assumptions: ["Target customers actively seek solutions", "Willingness to pay for the solution", "Current alternatives are inadequate", "Market is large enough to sustain a business"],
      strengths: ["Domain expertise", "Technical capability"],
      gaps: ["Marketing and distribution", "Fundraising experience"],
    }
  };
}

function mockTasks() {
  return { tasks: [
    { title: "Define Ideal Customer Profile (ICP)", description: "Create a detailed profile of your ideal customer to guide all marketing and product decisions", category: "ICP", priority: "high", subtasks: ["Research demographic characteristics", "Identify pain points and frustrations", "Map buying behaviors and decision criteria", "Define jobs-to-be-done framework"] },
    { title: "Validate problem-solution fit", description: "Confirm that your solution addresses a real, urgent problem for your target customer", category: "Demand", priority: "high", subtasks: ["Design interview script", "Conduct 5-10 customer interviews", "Synthesize findings into insights", "Create problem validation report"] },
    { title: "Research market size (TAM/SAM/SOM)", description: "Quantify the market opportunity using top-down and bottom-up approaches", category: "Demand", priority: "high", subtasks: ["Identify data sources", "Calculate TAM", "Estimate SAM and SOM", "Document methodology and assumptions"] },
    { title: "Analyze top 5 competitors", description: "Map the competitive landscape to find gaps and positioning opportunities", category: "Competitors", priority: "medium", subtasks: ["List direct competitors", "List indirect alternatives", "Compare features and pricing", "Identify competitive gaps"] },
    { title: "Identify acquisition channels", description: "Research and prioritize the most effective channels to reach your target customers", category: "Channels", priority: "medium", subtasks: ["List potential channels", "Estimate cost per acquisition", "Rank by efficiency", "Design channel experiments"] },
    { title: "Map customer journey", description: "Understand the full customer decision journey from awareness to purchase", category: "ICP", priority: "medium", subtasks: ["Define awareness triggers", "Map consideration factors", "Identify conversion barriers", "Document post-purchase behavior"] },
    { title: "Interview 5 potential customers", description: "Conduct structured interviews to validate assumptions and uncover insights", category: "Demand", priority: "high", subtasks: ["Recruit participants", "Prepare discussion guide", "Conduct interviews", "Analyze and synthesize findings"] },
    { title: "Define key success metrics", description: "Establish the KPIs that will measure your market research effectiveness", category: "Metrics", priority: "low", subtasks: ["Identify leading indicators", "Set baseline measurements", "Define success thresholds", "Create tracking dashboard"] },
  ]};
}

function mockChat(phase) {
  if (phase === "planning") return { message: "Based on your startup context, I'd recommend a three-step approach:\n\n**1. Define your research questions** — What specifically do you need to learn? Frame 3-5 core hypotheses.\n\n**2. Choose your methods** — For early-stage validation, customer interviews + secondary research gives you the best signal-to-noise ratio.\n\n**3. Set a timeline** — Time-box this to 2 weeks. Faster learning cycles beat comprehensive research.", suggestions: ["Help me frame research questions", "Design an interview script", "Find secondary data sources"] };
  if (phase === "building") return { message: "I can generate structured research documents for you. Here are your options:\n\n📋 **Research brief** — Template with sections and prompts\n📊 **Findings document** — Structured to capture and organize insights\n🔬 **Analysis framework** — For synthesizing raw data into conclusions\n\nWhich would you like to start with, or describe what you need?", markdown: "" };
  return { message: "I've reviewed your current progress. Here's my assessment:\n\n✅ **Strong points:**\n- Clear demographic definition\n- Good pain point articulation\n\n⚠️ **Improvements needed:**\n- Add more specific buying triggers\n- Include anti-persona characteristics\n- Define the decision-making unit\n\nWant me to help with any of these?", improvements: ["Add specific buying triggers", "Include anti-persona characteristics", "Define the decision-making unit"] };
}

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

function GlobalStyles() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 16px; -webkit-font-smoothing: antialiased; }
    body { font-family: ${FONT.sans}; background: ${T.bg}; color: ${T.text}; }
    
    ::selection { background: ${T.blue}22; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${T.sage}88; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: ${T.sage}; }
    
    input:focus, textarea:focus, select:focus { outline: none; border-color: ${T.blue} !important; box-shadow: 0 0 0 3px ${T.blue}12 !important; }
    
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    
    .fade-up { animation: fadeUp 0.4s ease both; }
    .fade-in { animation: fadeIn 0.3s ease both; }
    .slide-right { animation: slideInRight 0.35s ease both; }
    
    .hover-lift { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${T.navy}0d; }
    
    .surface-card {
      background: ${T.surface};
      border: 1px solid ${T.borderLight};
      border-radius: 10px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .surface-card:hover { border-color: ${T.border}; }
    
    .btn-primary {
      background: ${T.navy}; color: ${T.textInv}; border: none; padding: 10px 22px;
      border-radius: 8px; font-family: ${FONT.sans}; font-weight: 600; font-size: 13.5px;
      cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-primary:hover { background: ${T.blue}; transform: translateY(-1px); box-shadow: 0 4px 12px ${T.navy}22; }
    .btn-primary:disabled { opacity: 0.5; cursor: default; transform: none; box-shadow: none; }
    
    .btn-secondary {
      background: ${T.surface}; color: ${T.text}; border: 1px solid ${T.border}; padding: 8px 18px;
      border-radius: 8px; font-family: ${FONT.sans}; font-weight: 500; font-size: 13px;
      cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-secondary:hover { background: ${T.shell}; border-color: ${T.sage}; }
    
    .btn-ghost {
      background: transparent; color: ${T.textSec}; border: none; padding: 6px 12px;
      border-radius: 6px; font-family: ${FONT.sans}; font-weight: 500; font-size: 13px;
      cursor: pointer; transition: all 0.15s;
    }
    .btn-ghost:hover { background: ${T.shell}; color: ${T.text}; }
    
    .input-field {
      width: 100%; padding: 10px 14px; border: 1px solid ${T.borderLight};
      border-radius: 8px; font-family: ${FONT.sans}; font-size: 14px; color: ${T.text};
      background: ${T.surface}; transition: border-color 0.2s, box-shadow 0.2s;
    }
    .input-field::placeholder { color: ${T.textMuted}; }
    
    .label-caps {
      font-family: ${FONT.sans}; font-size: 10.5px; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; color: ${T.textMuted};
    }
    
    .heading-serif { font-family: ${FONT.serif}; font-weight: 500; color: ${T.navy}; letter-spacing: -0.01em; }
  `}</style>;
}

function Nav({ page, go }) {
  const links = [
    { id: "onboarding", label: "Onboard" },
    { id: "dashboard", label: "Roadmap" },
    { id: "network", label: "Network" },
  ];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: T.surface, borderBottom: `1px solid ${T.borderLight}`, backdropFilter: "blur(12px)" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button onClick={() => go("dashboard")} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", color: T.cream, fontFamily: FONT.serif, fontSize: 15, fontWeight: 600 }}>F</div>
            <span style={{ fontFamily: FONT.serif, fontSize: 17, fontWeight: 500, color: T.navy, letterSpacing: "-0.02em" }}>Founder Roadmap OS</span>
          </button>
          <nav style={{ display: "flex", gap: 2 }}>
            {links.map(l => (
              <button key={l.id} onClick={() => go(l.id)}
                style={{ all: "unset", cursor: "pointer", padding: "6px 16px", borderRadius: 7, fontSize: 13.5, fontWeight: page === l.id ? 600 : 450, fontFamily: FONT.sans, color: page === l.id ? T.navy : T.textMuted, background: page === l.id ? T.shell : "transparent", transition: "all 0.15s" }}>
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn-secondary" style={{ fontSize: 12.5, padding: "6px 14px" }} onClick={() => go("onboarding")}>Start demo</button>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.shell, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
          </div>
        </div>
      </div>
    </header>
  );
}

function Badge({ text, variant, small }) {
  const styles = {
    high: { bg: T.dangerBg, color: T.danger },
    medium: { bg: T.warnBg, color: T.warn },
    low: { bg: T.successBg, color: T.success },
    ICP: TASK_CATEGORIES.ICP, Demand: TASK_CATEGORIES.Demand,
    Competitors: TASK_CATEGORIES.Competitors, Channels: TASK_CATEGORIES.Channels,
    Metrics: TASK_CATEGORIES.Metrics, Strategy: TASK_CATEGORIES.Strategy,
    done: { bg: T.successBg, color: T.success },
    "in-progress": { bg: "#e6f0f5", color: T.accent },
    "not-started": { bg: T.shell, color: T.textMuted },
    complete: { bg: T.successBg, color: T.success },
    soon: { bg: T.shell, color: T.textMuted },
    default: { bg: T.shell, color: T.textSec },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: small ? "2px 8px" : "3px 11px", borderRadius: 99, background: s.bg, color: s.color, fontSize: small ? 10 : 11.5, fontWeight: 600, fontFamily: FONT.sans, whiteSpace: "nowrap", lineHeight: 1.4 }}>
      {variant === "done" || variant === "complete" ? "✓ " : ""}{text}
    </span>
  );
}

function Progress({ value, max, label, size }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const h = size === "sm" ? 4 : size === "lg" ? 10 : 6;
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: T.textSec, fontFamily: FONT.sans }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontFamily: FONT.sans }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: h, background: T.shell, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? T.success : T.accent, borderRadius: 99, transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} className="fade-in" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: `${T.navy}44`, backdropFilter: "blur(6px)" }}>
      <div onClick={e => e.stopPropagation()} className="fade-up" style={{ background: T.surface, borderRadius: 14, width: wide ? "min(900px, 92vw)" : "min(520px, 92vw)", maxHeight: "85vh", overflow: "hidden", boxShadow: `0 24px 64px ${T.navy}22`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="heading-serif" style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 18, padding: 4, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE: ONBOARDING
// ═══════════════════════════════════════════════════════════════

function OnboardingPage({ onComplete, existingIdea, go }) {
  const [msgs, setMsgs] = useState([
    { role: "assistant", content: "Welcome to Founder Roadmap OS. I'm your startup co-pilot.\n\nLet's turn your idea into a structured roadmap. First, tell me: what problem are you solving, and for whom?" }
  ]);
  const [quickReplies] = useState([
    ["B2C consumers", "B2B businesses", "Marketplace", "Not sure yet"],
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(existingIdea);
  const [showQuick, setShowQuick] = useState(true);
  const chatEnd = useRef(null);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    const userMsg = { role: "user", content };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setShowQuick(false);
    setLoading(true);

    const history = newMsgs.map(m => `${m.role}: ${m.content}`).join("\n");
    const sys = TEMPLATES.onboarding.replace("{history}", history);
    let res = await callAI([userMsg], sys);
    if (!res) res = mockOnboard(newMsgs);

    setMsgs(prev => [...prev, { role: "assistant", content: res.message }]);
    if (res.ready && res.summary) setProfile(res.summary);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 28px", minHeight: "calc(100vh - 54px)" }}>
      {/* Page header */}
      <div style={{ textAlign: "center", marginBottom: 28 }} className="fade-up">
        <h1 className="heading-serif" style={{ fontSize: 30, marginBottom: 6 }}>Start Your Founder Journey</h1>
        <p style={{ color: T.textMuted, fontSize: 14.5, fontFamily: FONT.sans }}>Answer a few questions and I'll create a personalized roadmap for your startup</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 320px", gap: 20, alignItems: "start" }}>
        {/* Left: Journey sidebar */}
        <div className="surface-card fade-up" style={{ padding: 20, animationDelay: "0.05s", position: "sticky", top: 78 }}>
          <div className="label-caps" style={{ marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.borderLight}` }}>Your Journey</div>
          {MODULES.map((m, i) => (
            <div key={m.id} style={{ padding: "9px 12px", borderRadius: 7, marginBottom: 2, display: "flex", alignItems: "center", gap: 10, background: m.id === "onboarding" ? T.navy : "transparent", color: m.id === "onboarding" ? T.cream : T.textMuted, fontSize: 13, fontWeight: m.id === "onboarding" ? 600 : 400, fontFamily: FONT.sans, opacity: m.id === "onboarding" ? 1 : 0.55, cursor: m.active ? "pointer" : "default", transition: "all 0.2s" }}
              onClick={() => m.active && go("market-research")}>
              <span style={{ fontSize: 8 }}>{m.id === "onboarding" ? "●" : "○"}</span>
              {m.name}
            </div>
          ))}
        </div>

        {/* Center: Chat */}
        <div className="surface-card fade-up" style={{ animationDelay: "0.1s", display: "flex", flexDirection: "column", minHeight: 560 }}>
          <div style={{ padding: "16px 22px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={T.accent}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: FONT.sans }}>Let's shape your startup idea</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Answer a few questions to build your roadmap</div>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }} className={i > 0 ? "fade-up" : ""}>
                <div style={{
                  maxWidth: "78%", padding: "12px 16px", borderRadius: 12,
                  ...(m.role === "user"
                    ? { background: T.navy, color: T.cream, borderBottomRightRadius: 4 }
                    : { background: T.surfaceAlt, color: T.text, borderBottomLeftRadius: 4, border: `1px solid ${T.borderLight}` }),
                  fontSize: 14, lineHeight: 1.65, fontFamily: FONT.sans, whiteSpace: "pre-wrap"
                }}>{m.content}</div>
              </div>
            ))}
            {showQuick && msgs.length === 1 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12, marginLeft: 4 }}>
                {quickReplies[0].map(q => (
                  <button key={q} className="btn-secondary" onClick={() => send(q)} style={{ fontSize: 12.5, padding: "6px 14px" }}>{q}</button>
                ))}
              </div>
            )}
            {loading && (
              <div style={{ display: "flex", gap: 6, marginLeft: 4, padding: "8px 0" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.sage, animation: `pulse 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }} />)}
              </div>
            )}
            <div ref={chatEnd} />
          </div>

          <div style={{ padding: "14px 22px", borderTop: `1px solid ${T.borderLight}`, display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn-ghost" style={{ padding: 8, color: T.textMuted }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>
            </button>
            <input className="input-field" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Tell me about your startup idea..." disabled={loading} style={{ border: "none", boxShadow: "none", padding: "8px 0" }} />
            <button className="btn-primary" onClick={() => send()} disabled={!input.trim() || loading} style={{ padding: "8px 14px", borderRadius: "50%" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <div style={{ padding: "0 22px 10px", fontSize: 12, color: T.textMuted }}>Add a doc to give me more context.</div>
        </div>

        {/* Right: Live profile */}
        <div className="surface-card fade-up slide-right" style={{ padding: 22, animationDelay: "0.15s", position: "sticky", top: 78 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: FONT.sans }}>Startup Profile Draft</span>
          </div>
          <div style={{ fontSize: 11.5, color: T.textMuted, marginBottom: 16, fontStyle: "italic" }}>Auto-updating as you chat</div>

          {profile ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "NAME", value: profile.name },
                { label: "ONE-LINER", value: profile.oneLiner },
                { label: "CUSTOMER (WHO)", value: profile.customer },
                { label: "PROBLEM (WHAT)", value: profile.problem },
                { label: "WHY NOW", value: profile.whyNow },
                { label: "CURRENT STAGE", value: profile.stage, badge: true },
              ].map(f => (
                <div key={f.label}>
                  <div className="label-caps" style={{ marginBottom: 5 }}>{f.label}</div>
                  {f.badge ? <Badge text={f.value} variant="default" /> : <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.55, fontFamily: FONT.sans }}>{f.value}</div>}
                </div>
              ))}
              {profile.assumptions?.length > 0 && (
                <div>
                  <div className="label-caps" style={{ marginBottom: 8 }}>💡 Key Assumptions</div>
                  {profile.assumptions.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, fontFamily: FONT.sans, paddingLeft: 14, position: "relative", marginBottom: 4 }}>
                      <span style={{ position: "absolute", left: 0, color: T.accent }}>•</span>{a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📋</div>
              Your profile will appear here as we chat
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      {profile && (
        <div className="fade-up" style={{ textAlign: "center", marginTop: 28, paddingBottom: 20 }}>
          <button className="btn-primary" onClick={() => onComplete(profile)} style={{ padding: "14px 36px", fontSize: 15, borderRadius: 10, background: T.navy }}>
            Save & go to roadmap <span style={{ marginLeft: 4 }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE: DASHBOARD / ROADMAP
// ═══════════════════════════════════════════════════════════════

function DashboardPage({ idea, go, mrTasks, blocks, setBlocks }) {
  const [kanban, setKanban] = useState({ columns: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "doing", title: "Doing", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]});
  const [newTask, setNewTask] = useState({ col: null, text: "" });
  const [editModal, setEditModal] = useState(null);
  const [editText, setEditText] = useState("");
  const [dragInfo, setDragInfo] = useState(null);
  const [suggestedTasks] = useState(["Research TAM/SAM/SOM", "Map customer journey", "Identify key metrics"]);

  useEffect(() => { (async () => { const k = await sGet(SK.kanban); if (k) setKanban(k); })(); }, []);
  const saveKanban = async (k) => { setKanban(k); await sSet(SK.kanban, k); };

  const addKTask = (colId) => {
    if (!newTask.text.trim()) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text: newTask.text.trim(), tag: "Research" }] } : c) };
    saveKanban(updated);
    setNewTask({ col: null, text: "" });
  };

  const moveTask = (taskId, from, to) => {
    const task = kanban.columns.find(c => c.id === from)?.tasks.find(t => t.id === taskId);
    if (!task || from === to) return;
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

  const addSuggested = (text) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === "todo" ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text, tag: "Research" }] } : c) };
    saveKanban(updated);
  };

  const saveBlock = (key) => {
    const updated = { ...blocks, [key]: editText };
    setBlocks(updated);
    sSet(SK.blocks, updated);
    setEditModal(null);
  };

  const doneCount = mrTasks?.filter(t => t.status === "done").length || 0;
  const totalTasks = mrTasks?.length || 0;
  const mrPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const overallDone = (idea ? 1 : 0) + (mrPct === 100 ? 1 : 0);

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "24px 28px" }}>
      {/* Header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="heading-serif" style={{ fontSize: 28, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🗺️</span> Your Roadmap
          </h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4, fontFamily: FONT.sans }}>From idea to pitch-ready in {MODULES.length} steps</p>
        </div>
        <button className="btn-secondary" onClick={() => go("market-research")}>
          Continue where you left off <span style={{ marginLeft: 4 }}>→</span>
        </button>
      </div>

      {/* Overall progress */}
      <div className="surface-card fade-up" style={{ padding: "16px 22px", marginBottom: 24, animationDelay: "0.05s" }}>
        <Progress value={overallDone + (mrPct > 0 && mrPct < 100 ? 0.3 : 0)} max={MODULES.length} label={`Overall Journey Progress — ${overallDone} of ${MODULES.length} modules complete${totalTasks > 0 ? ` · Next: Market Research` : ""}`} size="sm" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24, alignItems: "start" }}>
        {/* Left: Roadmap modules */}
        <div className="fade-up" style={{ animationDelay: "0.08s" }}>
          <div className="label-caps" style={{ marginBottom: 14 }}>Roadmap Modules</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MODULES.map((mod, i) => {
              const isOnboard = mod.id === "onboarding";
              const isMR = mod.id === "market-research";
              const isDone = isOnboard && idea;
              const isActive = isMR;
              const clickable = isOnboard || isMR;
              return (
                <div key={mod.id}
                  onClick={() => clickable && go(isOnboard ? "onboarding" : "market-research")}
                  className={`surface-card ${clickable ? "hover-lift" : ""}`}
                  style={{ padding: "16px 18px", cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 0.55, borderLeft: isDone ? `3px solid ${T.success}` : isActive ? `3px solid ${T.accent}` : `3px solid transparent` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: isDone ? T.successBg : isActive ? `${T.accent}12` : T.shell, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isDone ? 16 : 14, color: isDone ? T.success : isActive ? T.accent : T.textMuted }}>
                        {isDone ? "✓" : mod.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: FONT.sans }}>{mod.name}</div>
                        <div style={{ fontSize: 12, color: T.textMuted, fontFamily: FONT.sans, marginTop: 1 }}>{mod.desc}</div>
                      </div>
                    </div>
                    <div>
                      {isDone && <Badge text="Complete" variant="complete" small />}
                      {isActive && mrPct > 0 && <Badge text={`${mrPct}%`} variant="in-progress" small />}
                      {isActive && mrPct === 0 && <Badge text="In Progress" variant="in-progress" small />}
                      {!clickable && <Badge text="Coming Soon" variant="soon" small />}
                    </div>
                  </div>
                  {isActive && mrPct > 0 && (
                    <div style={{ marginTop: 10, marginLeft: 48 }}>
                      <Progress value={doneCount} max={totalTasks} size="sm" />
                    </div>
                  )}
                  {clickable && (
                    <div style={{ marginTop: 10, marginLeft: 48 }}>
                      <button className="btn-secondary" style={{ fontSize: 11.5, padding: "4px 12px" }}>
                        {isDone ? "Review" : "Continue"} <span>→</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Dashboard */}
        <div className="fade-up" style={{ animationDelay: "0.12s" }}>
          <div className="label-caps" style={{ marginBottom: 14 }}>Dashboard</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Startup Idea card */}
            <div className="surface-card" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="heading-serif" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📋</span> Startup Idea
                </h3>
                <button className="btn-ghost" onClick={() => { setEditModal("summary"); setEditText(blocks.summary || (idea ? `${idea.name}\n${idea.oneLiner}\n\nCustomer: ${idea.customer}\nProblem: ${idea.problem}\nStage: ${idea.stage}` : "")); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <span>Edit</span>
                </button>
              </div>
              {idea ? (
                <div style={{ fontSize: 13.5, fontFamily: FONT.sans, lineHeight: 1.6, color: T.textSec }}>
                  <div style={{ fontWeight: 600, color: T.text, fontSize: 15, marginBottom: 6 }}>{idea.oneLiner || idea.name}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div><span style={{ color: T.accent }}>•</span> <strong>Customer:</strong> {idea.customer}</div>
                    <div><span style={{ color: T.accent }}>•</span> <strong>Problem:</strong> {idea.problem}</div>
                    <div><span style={{ color: T.accent }}>•</span> <strong>Stage:</strong> {idea.stage}</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: T.textMuted, fontSize: 13, fontStyle: "italic" }}>Complete onboarding to fill this in</div>
              )}
            </div>

            {/* Assumptions */}
            <div className="surface-card" style={{ padding: "18px 22px" }}>
              <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>💡</span> Assumptions & Questions
              </h3>
              {(idea?.assumptions || []).map((a, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "6px 0", fontSize: 13.5, color: T.textSec, fontFamily: FONT.sans, cursor: "pointer" }}>
                  <input type="checkbox" style={{ marginTop: 3, accentColor: T.accent }} />
                  <span>{a}</span>
                </label>
              ))}
              <button className="btn-ghost" style={{ marginTop: 6, fontSize: 12.5, color: T.textMuted }}>+ Add item</button>
            </div>

            {/* Notes */}
            <div className="surface-card" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 className="heading-serif" style={{ fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>📝</span> Notes
                </h3>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { sSet(SK.blocks, { ...blocks, notes: blocks.notes || "" }); }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/></svg>
                  Saved
                </button>
              </div>
              <textarea className="input-field" value={blocks.notes || ""} onChange={e => { const updated = { ...blocks, notes: e.target.value }; setBlocks(updated); sSet(SK.blocks, updated); }}
                placeholder="Capture quick thoughts, interview notes, next steps..."
                style={{ minHeight: 120, resize: "vertical", fontSize: 13.5, lineHeight: 1.6, border: `1px solid ${T.borderLight}`, background: T.surfaceAlt }} />
            </div>

            {/* Kanban */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 className="heading-serif" style={{ fontSize: 16 }}>Task Board</h3>
              </div>
              
              {/* Suggested tasks */}
              <div className="surface-card" style={{ padding: "12px 16px", marginBottom: 12, background: T.surfaceAlt }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500, fontFamily: FONT.sans }}>💡 Suggested tasks from your roadmap</span>
                  {suggestedTasks.map(t => (
                    <button key={t} className="btn-secondary" onClick={() => addSuggested(t)} style={{ fontSize: 11.5, padding: "3px 10px" }}>+ {t}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {kanban.columns.map(col => (
                  <div key={col.id}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { if (dragInfo) { moveTask(dragInfo.id, dragInfo.col, col.id); setDragInfo(null); }}}
                    style={{ background: T.surfaceAlt, borderRadius: 10, padding: 12, minHeight: 200 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingBottom: 8, borderBottom: `2px solid ${col.id === "done" ? T.success : col.id === "doing" ? T.accent : T.border}` }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: FONT.sans }}>{col.title}</span>
                      <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 500 }}>{col.tasks.length}</span>
                    </div>
                    {col.tasks.map(task => (
                      <div key={task.id} draggable onDragStart={() => setDragInfo({ id: task.id, col: col.id })}
                        className="surface-card" style={{ padding: "10px 12px", marginBottom: 6, cursor: "grab", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 13, color: T.text, fontFamily: FONT.sans, fontWeight: 500 }}>{task.text}</div>
                          {task.tag && <Badge text={task.tag} variant="default" small />}
                        </div>
                        <button onClick={() => deleteKTask(task.id, col.id)} style={{ all: "unset", cursor: "pointer", color: T.textMuted, fontSize: 12, padding: 2, opacity: 0.5, transition: "opacity 0.15s" }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.5}>✕</button>
                      </div>
                    ))}
                    {newTask.col === col.id ? (
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <input className="input-field" autoFocus value={newTask.text} onChange={e => setNewTask({ ...newTask, text: e.target.value })} onKeyDown={e => e.key === "Enter" && addKTask(col.id)} placeholder="Task name..." style={{ fontSize: 12.5, padding: "7px 10px" }} />
                        <button className="btn-primary" onClick={() => addKTask(col.id)} style={{ padding: "7px 12px", fontSize: 12 }}>Add</button>
                      </div>
                    ) : (
                      <button onClick={() => setNewTask({ col: col.id, text: "" })}
                        style={{ all: "unset", cursor: "pointer", width: "100%", textAlign: "center", padding: "8px", borderRadius: 8, border: `1px dashed ${T.border}`, fontSize: 12.5, color: T.textMuted, fontFamily: FONT.sans, marginTop: 4, transition: "all 0.15s" }}
                        onMouseEnter={e => e.target.style.borderColor = T.sage} onMouseLeave={e => e.target.style.borderColor = T.border}>
                        + Add task
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={editModal === "summary" ? "Edit Startup Idea" : "Edit Block"}>
        <textarea className="input-field" value={editText} onChange={e => setEditText(e.target.value)}
          style={{ minHeight: 180, resize: "vertical", fontFamily: FONT.sans, fontSize: 14, lineHeight: 1.6 }} />
        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" onClick={() => saveBlock(editModal)}>Save to Dashboard</button>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE: MARKET RESEARCH MODULE
// ═══════════════════════════════════════════════════════════════

function MarketResearchPage({ idea, go }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [addContext, setAddContext] = useState("");
  const [selTask, setSelTask] = useState(null);
  const [phase, setPhase] = useState("planning");
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [taskDoc, setTaskDoc] = useState("");
  const [showAdv, setShowAdv] = useState(false);
  const [templates, setTemplates] = useState(TEMPLATES);
  const [editTpl, setEditTpl] = useState("planning");
  const [searchQ, setSearchQ] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    (async () => {
      const t = await sGet(SK.mrTasks);
      if (t?.length) setTasks(t);
      const tpl = await sGet(SK.templates);
      if (tpl) setTemplates(p => ({ ...p, ...tpl }));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMsgs]);

  const saveTasks = async (t) => { setTasks(t); await sSet(SK.mrTasks, t); };

  const genTasks = async () => {
    setGenerating(true);
    const ideaStr = idea ? `${idea.name}: ${idea.oneLiner}. Customer: ${idea.customer}. Problem: ${idea.problem}. Solution: ${idea.solution}. Stage: ${idea.stage}` : "General startup";
    const sys = templates.taskGen.replace("{idea}", ideaStr).replace("{context}", addContext);
    let res = await callAI([{ role: "user", content: "Generate tasks." }], sys);
    if (!res?.tasks) res = mockTasks();
    const newTasks = res.tasks.map((t, i) => ({ id: `t-${Date.now()}-${i}`, ...t, status: "not-started", doc: "", subtasks: t.subtasks || [], completedSubs: [] }));
    await saveTasks(newTasks);
    setGenerating(false);
  };

  const updateStatus = async (id, status) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    await saveTasks(updated);
    if (selTask?.id === id) setSelTask(prev => ({ ...prev, status }));
  };

  const toggleSub = async (taskId, sub) => {
    const updated = tasks.map(t => {
      if (t.id !== taskId) return t;
      const done = t.completedSubs || [];
      const newDone = done.includes(sub) ? done.filter(s => s !== sub) : [...done, sub];
      return { ...t, completedSubs: newDone };
    });
    await saveTasks(updated);
    if (selTask?.id === taskId) {
      const task = updated.find(t => t.id === taskId);
      setSelTask(task);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput.trim() };
    const newMsgs = [...chatMsgs, userMsg];
    setChatMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);

    const ideaStr = idea ? JSON.stringify(idea) : "General startup";
    const sys = (templates[phase] || templates.planning).replace("{idea}", ideaStr).replace("{task}", selTask?.title || "");
    let res = await callAI(newMsgs.slice(-8), sys);
    if (!res) res = mockChat(phase);

    setChatMsgs(prev => [...prev, { role: "assistant", content: res.message }]);
    if (res.suggestions) setChatMsgs(prev => [...prev, { role: "system", type: "suggestions", data: res.suggestions }]);
    if (res.improvements) setChatMsgs(prev => [...prev, { role: "system", type: "improvements", data: res.improvements }]);
    if (res.markdown?.trim()) setTaskDoc(prev => prev + "\n\n" + res.markdown);
    setChatLoading(false);
  };

  const genDoc = async () => {
    setChatLoading(true);
    const prompt = `Generate a structured markdown research document for "${selTask?.title}". Startup: ${JSON.stringify(idea || {})}. Respond as JSON: { "message": "Done", "markdown": "# full md" }`;
    let res = await callAI([{ role: "user", content: "Generate document." }], prompt);
    if (!res?.markdown) res = { message: "Generated!", markdown: `# ${selTask?.title}\n\n## Overview\nResearch document for ${idea?.name || "your startup"}.\n\n## Key Questions\n- What is the size of the addressable market?\n- Who are the primary and secondary customer segments?\n- What are the key trends affecting this space?\n\n## Methodology\n- Secondary desk research\n- Customer discovery interviews (5-10)\n- Competitive analysis\n\n## Findings\n*[Add your findings here]*\n\n## Insights & Recommendations\n*[Add your conclusions here]*` };
    setTaskDoc(res.markdown);
    setChatMsgs(prev => [...prev, { role: "assistant", content: "📄 Document generated — check the Output panel on the right." }]);
    setChatLoading(false);
  };

  const saveDoc = async () => {
    if (!selTask) return;
    const updated = tasks.map(t => t.id === selTask.id ? { ...t, doc: taskDoc } : t);
    await saveTasks(updated);
  };

  const saveTemplates = async () => {
    await sSet(SK.templates, templates);
    setShowAdv(false);
  };

  const doneCount = tasks.filter(t => t.status === "done").length;
  const filteredTasks = searchQ ? tasks.filter(t => t.title.toLowerCase().includes(searchQ.toLowerCase())) : tasks;

  // ── TASK DETAIL VIEW ──
  if (selTask) {
    const task = tasks.find(t => t.id === selTask.id) || selTask;
    return (
      <div style={{ height: "calc(100vh - 54px)", display: "flex", flexDirection: "column" }}>
        {/* Breadcrumb + task header */}
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.borderLight}`, padding: "0 28px" }}>
          <div style={{ maxWidth: 1320, margin: "0 auto" }}>
            <div style={{ padding: "10px 0 6px", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.textMuted, fontFamily: FONT.sans }}>
              <button className="btn-ghost" onClick={() => go("dashboard")} style={{ padding: "2px 6px", fontSize: 12 }}>Roadmap</button>
              <span>›</span>
              <button className="btn-ghost" onClick={() => { setSelTask(null); setChatMsgs([]); }} style={{ padding: "2px 6px", fontSize: 12 }}>Market Research</button>
              <span>›</span>
              <span style={{ color: T.text, fontWeight: 500 }}>{task.title}</span>
            </div>
            <div style={{ paddingBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Badge text={task.category} variant={task.category} />
                <h2 className="heading-serif" style={{ fontSize: 22 }}>{task.title}</h2>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={() => updateStatus(task.id, task.status === "done" ? "not-started" : "done")}>
                  {task.status === "done" ? "↩ Reopen" : "✓ Mark as done"}
                </button>
                <button className="btn-primary" onClick={genDoc} disabled={chatLoading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Generate MD output
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Three-panel layout */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "230px 1fr 300px", overflow: "hidden" }}>
          {/* Left: Task sidebar */}
          <div style={{ borderRight: `1px solid ${T.borderLight}`, overflowY: "auto", background: T.surface }}>
            <div style={{ padding: 14 }}>
              <input className="input-field" placeholder="Search tasks..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ fontSize: 12.5, padding: "8px 12px 8px 32px", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238a9498' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "10px center" }} />
            </div>
            {filteredTasks.map(t => (
              <div key={t.id} onClick={() => { setSelTask(t); setChatMsgs([]); setTaskDoc(t.doc || ""); setPhase("planning"); }}
                style={{ padding: "10px 14px", cursor: "pointer", background: t.id === task.id ? T.surfaceAlt : "transparent", borderLeft: t.id === task.id ? `2px solid ${T.accent}` : "2px solid transparent", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${t.status === "done" ? T.success : T.border}`, background: t.status === "done" ? T.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.white, flexShrink: 0 }}>
                    {t.status === "done" ? "✓" : t.status === "in-progress" ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} /> : null}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: t.id === task.id ? 600 : 450, color: t.status === "done" ? T.textMuted : T.text, fontFamily: FONT.sans, textDecoration: t.status === "done" ? "line-through" : "none" }}>{t.title}</span>
                </div>
                <div style={{ marginLeft: 24 }}><Badge text={t.category} variant={t.category} small /></div>
              </div>
            ))}
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.borderLight}`, fontSize: 12, color: T.textMuted, fontFamily: FONT.sans }}>
              {doneCount} of {tasks.length} complete · {tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%
            </div>
          </div>

          {/* Center: Workspace */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Task meta + subtasks */}
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.borderLight}`, background: T.surface }}>
              <p style={{ fontSize: 13.5, color: T.textSec, fontFamily: FONT.sans, marginBottom: 12, lineHeight: 1.5 }}>{task.description}</p>
              {task.subtasks?.length > 0 && (
                <div>
                  <div className="label-caps" style={{ marginBottom: 8 }}>Subtasks</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {task.subtasks.map(s => {
                      const done = (task.completedSubs || []).includes(s);
                      return (
                        <button key={s} onClick={() => toggleSub(task.id, s)}
                          style={{ padding: "5px 12px", borderRadius: 99, border: `1px solid ${done ? T.success : T.border}`, background: done ? T.successBg : T.surface, color: done ? T.success : T.textSec, fontSize: 12, fontFamily: FONT.sans, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
                          {done && <span>✓</span>}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Phase tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.borderLight}`, background: T.surface, padding: "0 24px" }}>
              {[
                { id: "planning", label: "Planning", desc: "Strategy & next steps" },
                { id: "building", label: "Building", desc: "Produce output docs" },
                { id: "guidance", label: "Guidance", desc: "Review & improve" },
              ].map(p => (
                <button key={p.id} onClick={() => setPhase(p.id)}
                  style={{ all: "unset", cursor: "pointer", padding: "12px 20px", fontSize: 13.5, fontWeight: phase === p.id ? 600 : 400, color: phase === p.id ? T.navy : T.textMuted, fontFamily: FONT.sans, borderBottom: phase === p.id ? `2px solid ${T.navy}` : "2px solid transparent", transition: "all 0.15s", marginBottom: -1 }}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Phase description */}
            <div style={{ padding: "10px 24px", fontSize: 12.5, color: T.textMuted, fontFamily: FONT.sans, fontStyle: "italic", background: T.surfaceAlt, borderBottom: `1px solid ${T.borderLight}` }}>
              {phase === "planning" ? "I'll help you plan your research approach and suggest next steps." : phase === "building" ? "Let's produce clean output docs you can reuse." : "I'll review your docs and suggest improvements."}
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {chatMsgs.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0", color: T.textMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>{phase === "planning" ? "🗺️" : phase === "building" ? "🔨" : "📋"}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.textSec, fontFamily: FONT.sans }}>Start a conversation about {phase}</div>
                  <div style={{ fontSize: 13, marginTop: 4, fontFamily: FONT.sans }}>Ask me anything about this task</div>
                </div>
              )}
              {chatMsgs.map((m, i) => {
                if (m.role === "system" && m.type === "suggestions") {
                  return (
                    <div key={i} style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0 16px 4px" }}>
                      {m.data.map((s, j) => (
                        <button key={j} className="btn-secondary" onClick={() => setChatInput(s)} style={{ fontSize: 12, padding: "5px 12px" }}>{s}</button>
                      ))}
                    </div>
                  );
                }
                if (m.role === "system" && m.type === "improvements") {
                  return (
                    <div key={i} style={{ margin: "4px 0 16px 4px", padding: "12px 16px", background: T.warnBg, borderRadius: 10, border: `1px solid ${T.warn}22` }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.warn, marginBottom: 6, fontFamily: FONT.sans }}>Suggested improvements</div>
                      {m.data.map((imp, j) => <div key={j} style={{ fontSize: 13, color: T.textSec, marginBottom: 3, fontFamily: FONT.sans }}>• {imp}</div>)}
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
                    <div style={{
                      maxWidth: "80%", padding: "11px 15px", borderRadius: 12, fontSize: 13.5, lineHeight: 1.65, fontFamily: FONT.sans, whiteSpace: "pre-wrap",
                      ...(m.role === "user" ? { background: T.navy, color: T.cream, borderBottomRightRadius: 4 } : { background: T.surfaceAlt, color: T.text, borderBottomLeftRadius: 4, border: `1px solid ${T.borderLight}` })
                    }}>{m.content}</div>
                  </div>
                );
              })}
              {chatLoading && (
                <div style={{ display: "flex", gap: 5, padding: "8px 0" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.sage, animation: `pulse 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }} />)}
                </div>
              )}
              <div ref={chatEnd} />
            </div>

            {/* Chat input */}
            <div style={{ borderTop: `1px solid ${T.borderLight}`, padding: "12px 24px", display: "flex", gap: 8, alignItems: "center", background: T.surface }}>
              <button className="btn-ghost" style={{ padding: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>
              </button>
              <input className="input-field" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Ask a question or share your thoughts..." disabled={chatLoading}
                style={{ border: "none", boxShadow: "none", padding: "8px 0" }} />
              <button className="btn-primary" onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ padding: "8px 12px", borderRadius: "50%" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>

          {/* Right: Output panel */}
          <div style={{ borderLeft: `1px solid ${T.borderLight}`, display: "flex", flexDirection: "column", background: T.surface }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, fontFamily: FONT.sans }}>Task Output (Markdown)</span>
              </div>
              <div style={{ fontSize: 11.5, color: T.textMuted, fontFamily: FONT.mono }}>market-research-{task.category?.toLowerCase()}.md</div>
            </div>
            <textarea value={taskDoc} onChange={e => setTaskDoc(e.target.value)}
              placeholder="Your task output will appear here..."
              style={{ flex: 1, padding: 16, border: "none", resize: "none", fontSize: 12.5, fontFamily: FONT.mono, lineHeight: 1.7, outline: "none", background: T.surfaceAlt, color: T.text }} />
            <div style={{ padding: "10px 18px", borderTop: `1px solid ${T.borderLight}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button className="btn-ghost" style={{ fontSize: 11.5 }} onClick={() => navigator.clipboard?.writeText(taskDoc)}>📋 Copy</button>
              <button className="btn-ghost" style={{ fontSize: 11.5 }}>⬇ Download</button>
              <button className="btn-primary" style={{ fontSize: 11.5, padding: "5px 12px" }} onClick={saveDoc}>💾 Save</button>
            </div>

            {/* Upload area */}
            <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: FONT.sans, marginBottom: 8 }}>Upload Files</div>
              <div style={{ border: `1px dashed ${T.border}`, borderRadius: 8, padding: "18px 14px", textAlign: "center" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 6px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{ fontSize: 12, color: T.textMuted, fontFamily: FONT.sans }}>Drop files here</div>
              </div>
            </div>

            {/* Advanced settings */}
            <div style={{ borderTop: `1px solid ${T.borderLight}` }}>
              <button onClick={() => setShowAdv(!showAdv)}
                style={{ all: "unset", cursor: "pointer", width: "100%", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: FONT.sans, display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                  Advanced Settings
                </span>
                <span style={{ fontSize: 14, color: T.textMuted, transition: "transform 0.2s", transform: showAdv ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
              </button>
              {showAdv && (
                <div className="fade-in" style={{ padding: "0 18px 16px" }}>
                  <div className="label-caps" style={{ marginBottom: 8 }}>Prompt template</div>
                  <textarea className="input-field" value={templates[editTpl] || ""} onChange={e => setTemplates(p => ({ ...p, [editTpl]: e.target.value }))}
                    style={{ fontSize: 12, fontFamily: FONT.mono, minHeight: 100, resize: "vertical", lineHeight: 1.5 }} />
                  <div style={{ marginTop: 10 }}>
                    <div className="label-caps" style={{ marginBottom: 6 }}>Context included</div>
                    {[{ id: "idea", label: "Startup Idea MD", checked: true }, { id: "docs", label: "Uploaded docs", checked: true }, { id: "notes", label: "Task notes", checked: false }].map(c => (
                      <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 13, color: T.textSec, fontFamily: FONT.sans, cursor: "pointer" }}>
                        <input type="checkbox" defaultChecked={c.checked} style={{ accentColor: T.accent }} />{c.label}
                      </label>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={saveTemplates} style={{ marginTop: 10, width: "100%", justifyContent: "center", fontSize: 12.5 }}>Save settings</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ENTRY / TASK LIST VIEW ──
  return (
    <div style={{ height: "calc(100vh - 54px)", display: "flex", flexDirection: "column" }}>
      {/* Header bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.borderLight}`, padding: "0 28px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "12px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: T.textMuted, fontFamily: FONT.sans }}>
              <button className="btn-ghost" onClick={() => go("dashboard")} style={{ padding: "2px 6px", fontSize: 12 }}>Roadmap</button>
              <span>›</span>
              <span style={{ color: T.text, fontWeight: 500 }}>Market Research</span>
            </div>
            {tasks.length > 0 && <Badge text={`${Math.round((doneCount / tasks.length) * 100)}%`} variant="in-progress" small />}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {tasks.length > 0 && <button className="btn-secondary" onClick={genTasks} disabled={generating}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> Regenerate task plan</button>}
            <button className="btn-ghost" onClick={() => go("dashboard")}>← Back to roadmap</button>
          </div>
        </div>
        <div style={{ maxWidth: 1320, margin: "0 auto", paddingBottom: 12 }}>
          <h1 className="heading-serif" style={{ fontSize: 26 }}>Market Research</h1>
          {tasks.length > 0 && <div style={{ marginTop: 8 }}><Progress value={doneCount} max={tasks.length} label={`${doneCount} of ${tasks.length} tasks complete`} size="sm" /></div>}
        </div>
      </div>

      {loaded && tasks.length === 0 ? (
        /* Entry state - generate tasks */
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "230px 1fr 300px", overflow: "hidden" }}>
          <div style={{ borderRight: `1px solid ${T.borderLight}`, background: T.surface, padding: 14 }}>
            <div className="label-caps" style={{ padding: "8px 12px" }}>Tasks</div>
            <div style={{ padding: "40px 14px", textAlign: "center", color: T.textMuted, fontSize: 13 }}>Generate your task plan to see tasks here</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ maxWidth: 580, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={T.accent}><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <div>
                  <h2 className="heading-serif" style={{ fontSize: 22 }}>Based on your startup idea, here's my suggested market research plan.</h2>
                </div>
              </div>
              
              <div style={{ marginBottom: 20, fontSize: 14, color: T.textSec, fontFamily: FONT.sans, lineHeight: 1.6 }}>
                Focus areas I'll help you explore:
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Define your Ideal Customer Profile (ICP)", "Validate demand through customer interviews", "Research market size and trends", "Analyze competitor positioning", "Identify go-to-market channels", "Map the customer decision journey"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.accent, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div className="label-caps" style={{ marginBottom: 6 }}>Anything else you want to add?</div>
                <textarea className="input-field" value={addContext} onChange={e => setAddContext(e.target.value)}
                  placeholder="e.g., I've already done some competitor analysis..."
                  style={{ minHeight: 80, resize: "vertical", fontSize: 14, lineHeight: 1.6 }} />
              </div>

              <div style={{ border: `1px dashed ${T.border}`, borderRadius: 10, padding: "24px", textAlign: "center", marginBottom: 20 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 8px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{ fontSize: 13.5, color: T.textSec, fontFamily: FONT.sans }}>Drag & drop documents here</div>
                <div style={{ fontSize: 12, color: T.textMuted, fontFamily: FONT.sans, marginTop: 2 }}>PDFs, docs, spreadsheets</div>
              </div>

              <button className="btn-primary" onClick={genTasks} disabled={generating} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15, borderRadius: 10 }}>
                {generating ? "Generating..." : "Generate my market research task list"} <span style={{ marginLeft: 4 }}>→</span>
              </button>
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${T.borderLight}`, background: T.surface, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: FONT.sans, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              Task Output (Markdown)
            </div>
            <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted, fontSize: 12.5, fontStyle: "italic" }}>
              Generate tasks to start producing outputs
            </div>
          </div>
        </div>
      ) : tasks.length > 0 ? (
        /* Tasks generated - show list with sidebar */
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "230px 1fr 300px", overflow: "hidden" }}>
          <div style={{ borderRight: `1px solid ${T.borderLight}`, background: T.surface, overflowY: "auto" }}>
            <div style={{ padding: 14 }}>
              <input className="input-field" placeholder="Search tasks..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ fontSize: 12.5, padding: "8px 12px" }} />
            </div>
            {filteredTasks.map(t => (
              <div key={t.id} onClick={() => { setSelTask(t); setChatMsgs([]); setTaskDoc(t.doc || ""); }}
                className="hover-lift" style={{ padding: "10px 14px", cursor: "pointer", transition: "all 0.15s", borderLeft: "2px solid transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceAlt} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${t.status === "done" ? T.success : T.border}`, background: t.status === "done" ? T.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: T.white, flexShrink: 0 }}>
                    {t.status === "done" ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text, fontFamily: FONT.sans }}>{t.title}</span>
                </div>
                <div style={{ marginLeft: 24 }}><Badge text={t.category} variant={t.category} small /></div>
              </div>
            ))}
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.borderLight}`, fontSize: 12, color: T.textMuted, fontFamily: FONT.sans }}>
              {doneCount} of {tasks.length} complete · {Math.round((doneCount / tasks.length) * 100)}%
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
            <div style={{ textAlign: "center", color: T.textMuted }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.2 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: T.textSec, fontFamily: FONT.sans }}>Select a task to begin</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Click any task on the left to start working</div>
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${T.borderLight}`, background: T.surface, padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: FONT.sans, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              Task Output (Markdown)
            </div>
            <div style={{ padding: "40px 0", textAlign: "center", color: T.textMuted, fontSize: 12.5, fontStyle: "italic" }}>
              Select a task to view its output
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE: NETWORK
// ═══════════════════════════════════════════════════════════════

function NetworkPage() {
  const [filter, setFilter] = useState("Founders");
  const founders = [
    { name: "Sarah Chen", title: "Founder & CEO at PayFlow", desc: "Automated invoicing for freelancers", tags: ["Fintech", "Seed"], loc: "San Francisco, CA", avatar: "SC", color: "#3b7c93" },
    { name: "Marcus Johnson", title: "Co-founder at DataSync", desc: "Real-time data integration for SMBs", tags: ["SaaS", "Pre-seed"], loc: "Austin, TX", avatar: "MJ", color: "#4a7c5f" },
    { name: "Elena Rodriguez", title: "Founder at HealthTrack", desc: "Patient engagement platform for clinics", tags: ["HealthTech", "Series A"], loc: "Miami, FL", avatar: "ER", color: "#9e7c2e" },
    { name: "David Kim", title: "CEO at LearnPath", desc: "AI-powered career coaching for professionals", tags: ["EdTech", "Seed"], loc: "New York, NY", avatar: "DK", color: "#8c4444" },
  ];

  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", padding: "32px 28px" }}>
      <div className="fade-up">
        <h1 className="heading-serif" style={{ fontSize: 28 }}>Network</h1>
        <p style={{ color: T.textMuted, fontSize: 14.5, fontFamily: FONT.sans, marginTop: 4 }}>Connect with founders and investors building the future</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginTop: 20, marginBottom: 24 }} className="fade-up" >
        {["Founders", "Investors"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 18px", borderRadius: 8, border: "none", background: filter === f ? T.navy : T.shell, color: filter === f ? T.cream : T.textMuted, fontSize: 13, fontWeight: 600, fontFamily: FONT.sans, cursor: "pointer", transition: "all 0.15s" }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        {/* Directory */}
        <div>
          <div className="surface-card" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 10 }}>
            <input className="input-field" placeholder="Search by name, company, or industry..." style={{ fontSize: 13.5 }} />
            <select className="input-field" style={{ width: "auto", fontSize: 13, color: T.textMuted }}>
              <option>All Industries</option>
            </select>
            <select className="input-field" style={{ width: "auto", fontSize: 13, color: T.textMuted }}>
              <option>All Stages</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {founders.map((f, i) => (
              <div key={i} className="surface-card hover-lift fade-up" style={{ padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", animationDelay: `${i * 0.06}s` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: f.color, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, fontFamily: FONT.sans, flexShrink: 0 }}>{f.avatar}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.text, fontFamily: FONT.sans }}>{f.name}</div>
                    <div style={{ fontSize: 13, color: T.textSec, fontFamily: FONT.sans }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, color: T.textMuted, fontFamily: FONT.sans, marginTop: 2 }}>{f.desc}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                      {f.tags.map(t => <Badge key={t} text={t} variant="default" small />)}
                      <span style={{ fontSize: 11.5, color: T.textMuted, fontFamily: FONT.sans, display: "flex", alignItems: "center", gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {f.loc}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="btn-secondary" style={{ flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9z"/></svg>
                  Request intro
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ position: "sticky", top: 78, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="surface-card fade-up" style={{ padding: 22, animationDelay: "0.1s" }}>
            <h3 className="heading-serif" style={{ fontSize: 16, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>ℹ️</span> How intros work
            </h3>
            {[
              { num: "1", text: 'Click "Request intro" on any profile' },
              { num: "2", text: "Write a brief note about why you'd like to connect" },
              { num: "3", text: "We'll facilitate when both parties accept" },
            ].map(s => (
              <div key={s.num} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: T.accent, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.num}</div>
                <span style={{ fontSize: 13.5, color: T.textSec, fontFamily: FONT.sans, lineHeight: 1.5 }}>{s.text}</span>
              </div>
            ))}
          </div>

          <div className="surface-card fade-up" style={{ padding: 22, background: T.navy, border: "none", animationDelay: "0.15s" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: T.cream, fontFamily: FONT.sans, marginBottom: 6 }}>Get discovered</h3>
            <p style={{ fontSize: 13, color: T.sage, fontFamily: FONT.sans, lineHeight: 1.5, marginBottom: 14 }}>Complete your profile to show up in search results and receive intro requests.</p>
            <button style={{ width: "100%", padding: "10px", borderRadius: 8, background: T.surface, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.navy, fontFamily: FONT.sans, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.navy} strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Post your startup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [page, setPage] = useState("onboarding");
  const [idea, setIdea] = useState(null);
  const [blocks, setBlocks] = useState({});
  const [mrTasks, setMrTasks] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const i = await sGet(SK.idea);
      const done = await sGet(SK.onboarded);
      const b = await sGet(SK.blocks);
      const t = await sGet(SK.mrTasks);
      if (i) setIdea(i);
      if (b) setBlocks(b);
      if (t) setMrTasks(t);
      if (done) setPage("dashboard");
      setReady(true);
    })();
  }, []);

  // Refresh tasks when switching to dashboard
  useEffect(() => {
    if (page === "dashboard") {
      (async () => { const t = await sGet(SK.mrTasks); if (t) setMrTasks(t); })();
    }
  }, [page]);

  const completeOnboard = async (summary) => {
    setIdea(summary);
    await sSet(SK.idea, summary);
    await sSet(SK.onboarded, true);
    setPage("dashboard");
  };

  const updateBlocks = (b) => { setBlocks(b); sSet(SK.blocks, b); };

  if (!ready) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", color: T.cream, fontFamily: FONT.serif, fontSize: 20, fontWeight: 600, margin: "0 auto 16px" }}>F</div>
        <div style={{ fontFamily: FONT.serif, fontSize: 18, color: T.navy }}>Loading Founder OS...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <GlobalStyles />
      <Nav page={page} go={setPage} />
      {page === "onboarding" && <OnboardingPage onComplete={completeOnboard} existingIdea={idea} go={setPage} />}
      {page === "dashboard" && <DashboardPage idea={idea} go={setPage} mrTasks={mrTasks} blocks={blocks} setBlocks={updateBlocks} />}
      {page === "market-research" && <MarketResearchPage idea={idea} go={setPage} />}
      {page === "network" && <NetworkPage />}
    </div>
  );
}
