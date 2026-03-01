export const C = {
  bg: "#474448",
  text: "#f1f0ea",
  surface: "#e0ddcf",
  muted: "#534b52",
  accent: "#3a3638",
  card: "#3d393f",
  cardHover: "#524e53",
  border: "#5e5a60",
  borderLight: "#6e6a70",
  success: "#6b9e6b",
  successBg: "#2a3d2a",
  warn: "#c4a24e",
  warnBg: "#3d3520",
  danger: "#c45858",
  dangerBg: "#3d2020",
  blue: "#6b8eb0",
  blueBg: "#1e2d3d",
  purple: "#8b7bb0",
  purpleBg: "#2d253d",
  white: "#ffffff",
  textDim: "#a09a9e",
  textMuted: "#7a7280",
};

export const F = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'DM Sans', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const TRACKS = [
  { id: "ideation", name: "Ideation", icon: "💡", order: 1, desc: "Crystallize your idea into a validated hypothesis worth building on.", modules: [{ id: "problem-identification", name: "Problem Identification", desc: "Define and deeply understand the core problem you're solving" }, { id: "market-sizing", name: "Market Sizing", desc: "Quantify your TAM, SAM, and SOM to understand the opportunity" }, { id: "competitive-analysis", name: "Competitive Analysis", desc: "Map the landscape and find your positioning gap" }, { id: "hypothesis-formation", name: "Hypothesis Formation", desc: "Turn assumptions into testable, falsifiable hypotheses" }] },
  { id: "validation", name: "Validation", icon: "✓", order: 2, desc: "Test your hypotheses with real humans before writing a line of code.", modules: [{ id: "customer-discovery", name: "Customer Discovery", desc: "Find and talk to real potential customers" }, { id: "problem-validation", name: "Problem Validation", desc: "Confirm the problem is real, frequent, and painful enough" }, { id: "willingness-to-pay", name: "Willingness to Pay", desc: "Test whether customers will actually pay for a solution" }, { id: "assumption-testing", name: "Assumption Testing", desc: "Systematically validate or invalidate your key assumptions" }] },
  { id: "mvp-build", name: "MVP / Build", icon: "⚙", order: 3, desc: "Scope, build, and ship the smallest thing that proves your thesis.", modules: [{ id: "scope-definition", name: "Scope Definition", desc: "Define exactly what's in (and out) of your MVP" }, { id: "build-decision", name: "Build Decision", desc: "Choose build vs. buy vs. no-code based on your constraints" }, { id: "success-metrics", name: "Success Metrics", desc: "Define measurable outcomes that prove your MVP works" }] },
  { id: "business-model", name: "Business Model", icon: "◈", order: 4, desc: "Design a business model that captures the value you create.", modules: [{ id: "monetisation-model", name: "Monetisation Model", desc: "Choose how you'll make money and why it fits your market" }, { id: "unit-economics", name: "Unit Economics", desc: "Model your per-customer economics: LTV, CAC, margins" }, { id: "pricing", name: "Pricing", desc: "Set a price that reflects value and drives conversion" }] },
  { id: "early-traction", name: "Early Traction", icon: "↗", order: 5, desc: "Get your first users and learn what makes them stick.", modules: [{ id: "user-acquisition", name: "User Acquisition", desc: "Find and attract your first 10–100 users" }, { id: "manual-onboarding", name: "Manual Onboarding", desc: "Onboard users by hand to learn what they actually need" }, { id: "retention-analysis", name: "Retention Analysis", desc: "Measure whether users come back and why (or why not)" }, { id: "activation", name: "Activation", desc: "Identify and optimize the moment users first get value" }] },
  { id: "gtm", name: "Go-to-Market", icon: "🚀", order: 6, desc: "Position, message, and launch your product to the right audience.", modules: [{ id: "icp-definition", name: "ICP Definition", desc: "Nail your ideal customer profile with surgical precision" }, { id: "positioning-messaging", name: "Positioning & Messaging", desc: "Craft a narrative that makes your product impossible to ignore" }, { id: "channel-strategy", name: "Channel Strategy", desc: "Decide where and how to reach your ICP cost-effectively" }, { id: "launch", name: "Launch", desc: "Plan and execute a launch that generates signal, not noise" }] },
];

export const TASK_TAGS = ["Research", "Validation", "Strategy", "Analysis", "Interviews", "Docs", "Planning", "Design", "Outreach", "Build", "Growth", "Legal"];

export const SK = {
  onboarded: "fos4-onboarded",
  context: "fos4-context",
  contextMD: "fos4-contextmd",
  trackOrder: "fos4-trackorder",
  trackSetup: "fos4-tracksetup",
  trackModules: "fos4-trackmods",
  trackDocs: "fos4-trackdocs",
  trackContextMDs: "fos4-trackcmds",
  trackMemory: "fos4-trackmem",
  trackProgress: "fos4-trackprog",
  kanban: "fos4-kanban",
  notes: "fos4-notes",
  chatHistories: "fos4-chats",
  moduleOutputs: "fos4-modouts",
};
