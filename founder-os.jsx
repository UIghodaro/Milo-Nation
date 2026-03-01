import { useState, useEffect, useRef, useCallback } from "react";
import { C, F, TRACKS, TASK_TAGS, SK } from "./src/constants.js";
import { sGet, sSet } from "./src/storage.js";
import { callAI, mockChat } from "./src/ai.js";
import { Logo, Toast, useToast, Styles, NavBar, Badge, Progress, Dots, Spinner, Modal, ProgressPie } from "./src/components/index.js";

// ═══════════════════════════════════════════════════════════
// PAGE 1: ONBOARDING — 11 individual questions
// ═══════════════════════════════════════════════════════════
function OnboardingPage({ onComplete }) {
  const TOTAL = 11;
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState({
    idea: "", whyUnsolved: "", solution: "",
    stage: "",
    targetCustomer: "", validated: [],
    built: "", team: "",
    fundraisingLegal: "",
    helpAreas: [], helpOther: "",
  });

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));
  const toggleArr = (k, v) => setData(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : [...prev[k], v] }));

  const canNext = () => {
    if (step === 0) return data.idea.trim().length > 10;
    if (step === 1) return !!data.whyUnsolved;
    if (step === 2) return data.solution.trim().length > 5;
    if (step === 3) return !!data.stage;
    if (step === 4) return data.targetCustomer.trim().length > 5;
    if (step === 5) return true; // validated is optional
    if (step === 6) return !!data.built;
    if (step === 7) return !!data.team;
    if (step === 8) return !!data.fundraisingLegal;
    if (step === 9) return data.helpAreas.length > 0;
    if (step === 10) return true; // helpOther is optional
    return false;
  };

  const generate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));

    const context = {
      idea: data.idea, whyUnsolved: data.whyUnsolved, solution: data.solution,
      stage: data.stage, targetCustomer: data.targetCustomer, validated: data.validated,
      built: data.built, team: data.team, fundraisingLegal: data.fundraisingLegal,
      helpAreas: data.helpAreas, helpOther: data.helpOther,
    };

    const contextMD = `# Startup Context\n\n## Core Idea\n${data.idea}\n\n## Why Unsolved\n${data.whyUnsolved}\n\n## Solution\n${data.solution}\n\n## Stage\n${data.stage}\n\n## Target Customer\n${data.targetCustomer}\n\n## Validated\n${data.validated.join(", ") || "Nothing yet"}\n\n## Built So Far\n${data.built}\n\n## Team\n${data.team}\n\n## Near-term Focus\n${data.fundraisingLegal}\n\n## Help Needed\n${data.helpAreas.join(", ")}${data.helpOther ? ", " + data.helpOther : ""}`;

    let trackOrder = TRACKS.map(t => t.id);
    if (data.stage === "Validation" || data.stage === "Early Traction") {
      trackOrder = ["validation", "mvp-build", "business-model", "early-traction", "gtm", "ideation"];
    } else if (data.stage === "Growth") {
      trackOrder = ["gtm", "early-traction", "business-model", "mvp-build", "validation", "ideation"];
    }

    onComplete({ context, contextMD, trackOrder });
  };

  const RadioOption = ({ value, selected, onClick }) => (
    <label onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${selected ? C.blue : C.border}`, background: selected ? C.blueBg : "transparent", cursor: "pointer", transition: "all .15s" }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selected ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {selected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue }} />}
      </div>
      <span style={{ fontSize: 14, color: C.text }}>{value}</span>
    </label>
  );

  const CheckOption = ({ value, selected, onClick, disabled }) => (
    <label onClick={disabled ? undefined : onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: `1px solid ${selected ? C.blue : C.border}`, background: selected ? C.blueBg : "transparent", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1, transition: "all .15s" }}>
      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: selected ? C.blue : "transparent" }}>
        {selected && <span style={{ color: C.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14, color: C.text }}>{value}</span>
    </label>
  );

  const steps = [
    // 0
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Tell us about your idea — what are you building and what problem does it solve?</label>
        <textarea className="input" value={data.idea} onChange={e => set("idea", e.target.value)} placeholder="Describe your startup idea and the problem it addresses..." style={{ minHeight: 120, lineHeight: 1.6 }} autoFocus />
      </div>
    ),
    // 1
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Why does this problem go unsolved today?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["No one's built it yet", "Existing tools are too expensive", "Incumbents ignore this customer", "Behaviour is hard to change"].map(opt => (
            <RadioOption key={opt} value={opt} selected={data.whyUnsolved === opt} onClick={() => set("whyUnsolved", opt)} />
          ))}
        </div>
      </div>
    ),
    // 2
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>What's your solution, and what makes it different from the obvious alternatives?</label>
        <textarea className="input" value={data.solution} onChange={e => set("solution", e.target.value)} placeholder="Describe your solution and what differentiates it..." style={{ minHeight: 100, lineHeight: 1.6 }} autoFocus />
      </div>
    ),
    // 3
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Which stage best describes where you are right now?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Pre-idea", "Idea", "Validation", "Early Traction", "Growth"].map(opt => (
            <RadioOption key={opt} value={opt} selected={data.stage === opt} onClick={() => set("stage", opt)} />
          ))}
        </div>
      </div>
    ),
    // 4
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Who specifically is your target customer?</label>
        <textarea className="input" value={data.targetCustomer} onChange={e => set("targetCustomer", e.target.value)} placeholder="Be as specific as possible — demographics, role, industry, behavior..." style={{ minHeight: 100, lineHeight: 1.6 }} autoFocus />
      </div>
    ),
    // 5
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>What have you validated so far — meaning, what do you know because someone outside your head confirmed it?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Talked to 10+ potential customers", "Ran a landing page test", "Got a letter of intent", "Made a first sale"].map(opt => (
            <CheckOption key={opt} value={opt} selected={data.validated.includes(opt)} onClick={() => toggleArr("validated", opt)} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>Select all that apply, or skip if none.</div>
      </div>
    ),
    // 6
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>What have you built so far?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Nothing yet", "Rough prototype", "Functional MVP", "Launched product"].map(opt => (
            <RadioOption key={opt} value={opt} selected={data.built === opt} onClick={() => set("built", opt)} />
          ))}
        </div>
      </div>
    ),
    // 7
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Who's working on this, and what are the key skills you have covered?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Solo technical founder", "Solo non-technical founder", "Two co-founders", "Small team"].map(opt => (
            <RadioOption key={opt} value={opt} selected={data.team === opt} onClick={() => set("team", opt)} />
          ))}
        </div>
      </div>
    ),
    // 8
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Are you thinking about raising funding or sorting legal/ops basics in the next 90 days?</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {["Raising funding", "Legal setup", "Both", "Neither for now"].map(opt => (
            <RadioOption key={opt} value={opt} selected={data.fundraisingLegal === opt} onClick={() => set("fundraisingLegal", opt)} />
          ))}
        </div>
      </div>
    ),
    // 9
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 4 }}>Where do you most want help right now? <span style={{ fontWeight: 400, color: C.textDim }}>(pick up to two)</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10 }}>
          {["Understanding my customer", "Building the product", "Finding early users", "Crafting my pitch", "Fundraising", "Hiring", "Pricing", "Legal/ops"].map(opt => (
            <CheckOption key={opt} value={opt} selected={data.helpAreas.includes(opt)}
              onClick={() => { if (data.helpAreas.includes(opt)) toggleArr("helpAreas", opt); else if (data.helpAreas.length < 2) toggleArr("helpAreas", opt); }}
              disabled={data.helpAreas.length >= 2 && !data.helpAreas.includes(opt)} />
          ))}
        </div>
      </div>
    ),
    // 10
    () => (
      <div className="fade-up">
        <label style={{ fontSize: 16, fontWeight: 500, color: C.text, display: "block", marginBottom: 12 }}>Anything else you'd like help with?</label>
        <input className="input" value={data.helpOther} onChange={e => set("helpOther", e.target.value)} placeholder="e.g. partnerships, brand strategy, hiring..." style={{ fontSize: 14 }} autoFocus />
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 8 }}>Optional — skip if nothing comes to mind.</div>
      </div>
    ),
  ];

  const isLast = step === TOTAL - 1;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 32px" }}><Logo size={44} /></div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 28px 60px" }}>
        <div style={{ maxWidth: 560, width: "100%" }}>
          {/* Progress line — above card; white + glow (not green) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 28 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: i <= step ? 10 : 7, height: i <= step ? 10 : 7, borderRadius: "50%",
                  background: i < step ? "#ffffff" : i === step ? "#ffffff" : "rgba(255,255,255,0.25)",
                  boxShadow: i <= step ? "0 0 10px rgba(255,255,255,0.6)" : "none",
                  transition: "all .3s", cursor: i < step ? "pointer" : "default",
                }} onClick={() => { if (i < step) setStep(i); }} />
                {i < TOTAL - 1 && <div style={{
                  width: 16, height: i < step ? 3 : 1.5,
                  background: i < step ? "#ffffff" : "rgba(255,255,255,0.25)",
                  boxShadow: i < step ? "0 0 6px rgba(255,255,255,0.5)" : "none",
                  margin: "0 2px", transition: "all .3s", borderRadius: 2,
                }} />}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="card" style={{ padding: "28px 32px" }}>
            {steps[step]()}

            {/* Nav buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, gap: 10 }}>
              {step > 0 ? (
                <button className="btn btn-outline" onClick={() => setStep(step - 1)}>← Back</button>
              ) : <div />}
              {!isLast ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>Continue →</button>
              ) : (
                <button className="btn btn-primary" onClick={generate} disabled={!canNext() || generating} style={{ padding: "11px 28px" }}>
                  {generating ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Spinner size={16} /> Generating...</span> : "Generate Roadmap →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGE 2: DASHBOARD / ROADMAP
// ═══════════════════════════════════════════════════════════
function DashboardPage({ context, contextMD, trackOrder, go, trackSetup, trackProgress, allNotes, setAllNotes, kanban, setKanban, saveKanban, saveNotes }) {
  const [newTask, setNewTask] = useState({ col: null, text: "", tag: "Research" });
  const [drag, setDrag] = useState(null);
  const [editTag, setEditTag] = useState(null);
  const [editText, setEditText] = useState(null);
  const [showToast, toastEl] = useToast();
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const orderedTracks = (trackOrder || TRACKS.map(t => t.id)).map(id => TRACKS.find(t => t.id === id)).filter(Boolean);

  const moveTask = async (taskId, fromCol, toCol) => {
    if (fromCol === toCol) return;
    const task = kanban.columns.find(c => c.id === fromCol)?.tasks.find(t => t.id === taskId);
    if (!task) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => {
      if (c.id === fromCol) return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
      if (c.id === toCol) return { ...c, tasks: [...c.tasks, task] };
      return c;
    })};
    saveKanban(updated);
  };

  const addKTask = (colId) => {
    if (!newTask.text.trim()) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text: newTask.text.trim(), tag: newTask.tag }] } : c) };
    saveKanban(updated);
    setNewTask({ col: null, text: "", tag: "Research" });
  };

  const deleteKTask = (taskId, colId) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.filter(t => t.id !== taskId) } : c) };
    saveKanban(updated);
  };

  const updateTag = (taskId, colId, newTag) => {
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, tag: newTag } : t) } : c) };
    saveKanban(updated);
    setEditTag(null);
  };

  const updateText = (taskId, colId, newText) => {
    if (!newText.trim()) return;
    const updated = { ...kanban, columns: kanban.columns.map(c => c.id === colId ? { ...c, tasks: c.tasks.map(t => t.id === taskId ? { ...t, text: newText.trim() } : t) } : c) };
    saveKanban(updated);
    setEditText(null);
  };

  const addNote = () => {
    if (!newNoteBody.trim() && !newNoteTitle.trim()) return;
    const note = { id: Date.now().toString(), title: newNoteTitle.trim(), body: newNoteBody.trim(), created: Date.now() };
    const updated = [...allNotes, note];
    setAllNotes(updated);
    saveNotes(updated);
    setNewNoteTitle(""); setNewNoteBody(""); setNewNoteOpen(false);
    showToast("Note added");
  };

  const deleteNote = (id) => {
    const updated = allNotes.filter(n => n.id !== id);
    setAllNotes(updated);
    saveNotes(updated);
  };

  const updateNote = (id, field, val) => {
    const updated = allNotes.map(n => n.id === id ? { ...n, [field]: val } : n);
    setAllNotes(updated);
    saveNotes(updated);
  };

  const getTrackStatus = (trackId) => {
    const p = trackProgress[trackId];
    if (!p) return "not-started";
    if (p.done === p.total && p.total > 0) return "done";
    if (p.done > 0) return "in-progress";
    return trackSetup[trackId] ? "in-progress" : "not-started";
  };

  const getTrackPct = (trackId) => {
    const p = trackProgress[trackId];
    if (!p || p.total === 0) return 0;
    return Math.round((p.done / p.total) * 100);
  };

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "24px 28px" }}>
      {toastEl}
      <div className="fade-up" style={{ marginBottom: 20 }}>
        <h1 className="serif" style={{ fontSize: 34, fontWeight: 400 }}>Your Roadmap</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginTop: 4 }}>From idea to traction · {TRACKS.length} tracks · {TRACKS.reduce((a, t) => a + t.modules.length, 0)} modules</p>
      </div>

      {/* Roadmap Visual */}
      <div className="card fade-up" style={{ padding: "28px 24px", marginBottom: 24, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: orderedTracks.length * 170 }}>
          {orderedTracks.map((track, i) => {
            const status = getTrackStatus(track.id);
            const pct = getTrackPct(track.id);
            const isDone = status === "done";
            const isInProgress = status === "in-progress";
            return (
              <div key={track.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                <div onClick={() => go("track-" + track.id)} className="card-lift"
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 10px", minWidth: 130, textAlign: "center", position: "relative", borderRadius: 12 }}>
                  <div style={{
                    width: 50, height: 50, borderRadius: "50%",
                    background: isDone ? C.successBg : isInProgress ? C.blueBg : C.accent + "44",
                    border: `2.5px solid ${isDone ? C.success : isInProgress ? C.blue : C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, color: isDone ? C.success : isInProgress ? C.blue : C.textMuted,
                    transition: "all .2s"
                  }}>
                    {isDone ? "✓" : track.icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans, lineHeight: 1.3 }}>{track.name}</div>
                  <div>
                    {isDone && <Badge text="Done" variant="done" small />}
                    {isInProgress && <Badge text={`${pct}%`} variant="in-progress" small />}
                    {status === "not-started" && <Badge text="Start" variant="not-started" small />}
                  </div>
                  {/* Module count */}
                  <div style={{ fontSize: 10.5, color: C.textMuted }}>{track.modules.length} modules</div>
                </div>
                {i < orderedTracks.length - 1 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 24, marginTop: -30 }}>
                    <div style={{ flex: 1, height: isDone ? 2.5 : 1.5, background: isDone ? C.success : C.border, transition: "all .3s" }} />
                    <div style={{ width: 0, height: 0, borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: `6px solid ${isDone ? C.success : C.border}` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Notes + Kanban */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {/* Sticky Notes */}
        <div className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 className="serif" style={{ fontSize: 17, fontWeight: 400 }}>Sticky Notes</h3>
            <button className="btn btn-outline" onClick={() => setNewNoteOpen(true)} style={{ fontSize: 12, padding: "5px 12px" }}>+ Add note</button>
          </div>

          {allNotes.length === 0 && !newNoteOpen && (
            <div className="card" style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 28, opacity: .2, marginBottom: 8 }}>📝</div>
              <div style={{ fontSize: 14, color: C.textDim }}>Use sticky notes for quick thoughts, reminders, and scratchpad ideas.</div>
              <button className="btn btn-outline" onClick={() => setNewNoteOpen(true)} style={{ marginTop: 12, fontSize: 12 }}>+ Create your first note</button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {newNoteOpen && (
              <div style={{ background: C.warnBg, border: `1px solid ${C.warn}33`, borderRadius: 10, padding: "12px 14px", transform: "rotate(-0.5deg)" }}>
                <input value={newNoteTitle} onChange={e => setNewNoteTitle(e.target.value)} placeholder="Title (optional)" style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans, marginBottom: 6, padding: 0 }} />
                <textarea value={newNoteBody} onChange={e => setNewNoteBody(e.target.value)} placeholder="Write your note..." autoFocus style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, color: C.text, fontFamily: F.sans, minHeight: 60, resize: "none", lineHeight: 1.5, padding: 0 }} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button className="btn btn-primary" onClick={addNote} style={{ fontSize: 11, padding: "4px 10px" }}>Save</button>
                  <button className="btn-ghost" onClick={() => { setNewNoteOpen(false); setNewNoteTitle(""); setNewNoteBody(""); }} style={{ fontSize: 11 }}>Cancel</button>
                </div>
              </div>
            )}
            {allNotes.map((note, i) => {
              const rotations = [-1.2, 0.8, -0.5, 1.5, -0.8, 0.3];
              const colors = [C.warnBg, C.blueBg, C.successBg, C.purpleBg, C.warnBg, C.blueBg];
              return (
                <div key={note.id} style={{ background: colors[i % colors.length], border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", transform: `rotate(${rotations[i % rotations.length]}deg)`, transition: "transform .15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg) scale(1.02)"}
                  onMouseLeave={e => e.currentTarget.style.transform = `rotate(${rotations[i % rotations.length]}deg)`}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    {editingNote === note.id ? (
                      <input value={note.title} onChange={e => updateNote(note.id, "title", e.target.value)} onBlur={() => setEditingNote(null)} autoFocus
                        style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans, flex: 1, padding: 0 }} />
                    ) : (
                      <div onClick={() => setEditingNote(note.id)} style={{ fontSize: 13, fontWeight: 600, color: C.text, cursor: "text", flex: 1 }}>{note.title || "Untitled"}</div>
                    )}
                    <button onClick={() => deleteNote(note.id)} style={{ all: "unset", cursor: "pointer", color: C.textMuted, fontSize: 12, padding: "0 2px", opacity: .5, lineHeight: 1 }}
                      onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = .5}>✕</button>
                  </div>
                  <div contentEditable suppressContentEditableWarning onBlur={e => updateNote(note.id, "body", e.currentTarget.textContent)}
                    style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.5, marginTop: 4, outline: "none", cursor: "text", minHeight: 30 }}>{note.body}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kanban */}
        <div className="fade-up" style={{ animationDelay: ".05s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 className="serif" style={{ fontSize: 17, fontWeight: 400 }}>Task Board</h3>
          </div>

          {/* Suggested tasks */}
          <div style={{ padding: "8px 12px", marginBottom: 10, background: C.card, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11.5, color: C.textMuted, fontWeight: 500 }}>💡</span>
              {[{ t: "Define ICP", tag: "Research" }, { t: "Run 5 interviews", tag: "Interviews" }, { t: "Draft one-pager", tag: "Docs" }, { t: "Size TAM/SAM", tag: "Analysis" }].map(s => (
                <button key={s.t} className="btn-outline" onClick={() => {
                  const updated = { ...kanban, columns: kanban.columns.map(c => c.id === "todo" ? { ...c, tasks: [...c.tasks, { id: Date.now().toString(), text: s.t, tag: s.tag }] } : c) };
                  saveKanban(updated); showToast(`Added "${s.t}"`);
                }} style={{ fontSize: 11, padding: "3px 9px" }}>+ {s.t}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {kanban.columns.map(col => (
              <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={() => { if (drag) { moveTask(drag.id, drag.col, col.id); setDrag(null); }}}
                style={{ background: C.card, borderRadius: 10, padding: 8, minHeight: 160, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${col.id === "done" ? C.success : col.id === "doing" ? C.blue : C.border}` }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{col.title}</span>
                  <span style={{ fontSize: 11, color: C.textMuted }}>{col.tasks.length}</span>
                </div>
                {col.tasks.map(task => (
                  <div key={task.id} draggable onDragStart={() => setDrag({ id: task.id, col: col.id })}
                    style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 9px", marginBottom: 5, cursor: "grab" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      {editText === task.id ? (
                        <input className="input" autoFocus defaultValue={task.text}
                          onKeyDown={e => { if (e.key === "Enter") updateText(task.id, col.id, e.target.value); if (e.key === "Escape") setEditText(null); }}
                          onBlur={e => updateText(task.id, col.id, e.target.value)}
                          style={{ fontSize: 12, padding: "3px 6px", flex: 1, marginRight: 4 }} />
                      ) : (
                        <span onDoubleClick={() => setEditText(task.id)} style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.4, cursor: "text", color: C.text }}>{task.text}</span>
                      )}
                      <button onClick={() => deleteKTask(task.id, col.id)} style={{ all: "unset", cursor: "pointer", color: C.textDim, fontSize: 11, opacity: 0.85, padding: "0 2px" }}
                        onMouseEnter={e => e.target.style.opacity=1} onMouseLeave={e => e.target.style.opacity=0.85}>✕</button>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      {editTag === task.id ? (
                        <select autoFocus value={task.tag || "Research"} onChange={e => updateTag(task.id, col.id, e.target.value)} onBlur={() => setEditTag(null)}
                          style={{ fontSize: 10, padding: "2px 4px", border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: F.sans, background: C.card, color: C.text }}>
                          {TASK_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <div onClick={() => setEditTag(task.id)} style={{ cursor: "pointer" }}><Badge text={task.tag || "Research"} variant={task.tag || "Research"} small /></div>
                      )}
                    </div>
                  </div>
                ))}
                {newTask.col === col.id ? (
                  <div style={{ marginTop: 4 }}>
                    <input className="input" autoFocus value={newTask.text} onChange={e => setNewTask({ ...newTask, text: e.target.value })} onKeyDown={e => { if (e.key === "Enter") addKTask(col.id); if (e.key === "Escape") setNewTask({ col: null, text: "", tag: "Research" }); }} placeholder="Task name..." style={{ fontSize: 12, padding: "6px 8px", marginBottom: 4 }} />
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <select value={newTask.tag} onChange={e => setNewTask({ ...newTask, tag: e.target.value })}
                        style={{ fontSize: 10, padding: "3px 4px", border: `1px solid ${C.border}`, borderRadius: 4, fontFamily: F.sans, background: C.card, color: C.text }}>
                        {TASK_TAGS.map(t => <option key={t}>{t}</option>)}
                      </select>
                      <button className="btn btn-primary" onClick={() => addKTask(col.id)} style={{ fontSize: 11, padding: "4px 10px" }}>Add</button>
                      <button className="btn-ghost" onClick={() => setNewTask({ col: null, text: "", tag: "Research" })} style={{ fontSize: 11 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setNewTask({ col: col.id, text: "", tag: "Research" })}
                    style={{ all: "unset", cursor: "pointer", width: "100%", boxSizing: "border-box", textAlign: "center", padding: 5, borderRadius: 6, border: `1px dashed ${C.border}`, fontSize: 12, color: C.textMuted, marginTop: 4 }}>+ Add</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TRACK SETUP: Overview + Module Checklist
// ═══════════════════════════════════════════════════════════
function TrackSetupPage({ track, context, onComplete }) {
  const [setupStep, setSetupStep] = useState(0); // 0 = overview, 1 = checklist
  const [addContext, setAddContext] = useState("");
  const [selectedModules, setSelectedModules] = useState(track.modules.map(m => m.id));

  const toggleMod = (id) => {
    setSelectedModules(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (setupStep === 0) {
    return (
      <div style={{ minHeight: "calc(100vh - 54px)", display: "flex", flexDirection: "column" }}>
        <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 28px" }}>
          <div style={{ maxWidth: 1340, margin: "0 auto", padding: "12px 0", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
            <button className="btn-ghost" onClick={() => onComplete(null)} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
            <span>›</span><span style={{ color: C.text, fontWeight: 500 }}>{track.name} Setup</span>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div className="fade-up" style={{ maxWidth: 560, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.blueBg, border: `2px solid ${C.blue}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{track.icon}</div>
              <div>
                <h2 className="serif" style={{ fontSize: 28, fontWeight: 400 }}>{track.name}</h2>
                <p style={{ fontSize: 14, color: C.textDim, marginTop: 2 }}>{track.desc}</p>
              </div>
            </div>

            <div className="card" style={{ padding: "18px 20px", marginBottom: 18 }}>
              <div className="label" style={{ marginBottom: 8 }}>BASED ON YOUR STARTUP CONTEXT</div>
              <p style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.6 }}>
                {context?.idea ? `You're building a solution for "${context.targetCustomer}" — this track will help you ${track.desc.toLowerCase()}` : `This track will help you ${track.desc.toLowerCase()}`}
              </p>
              {context?.stage && <div style={{ marginTop: 8 }}><Badge text={`Stage: ${context.stage}`} variant="active" small /></div>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: C.text, display: "block", marginBottom: 8 }}>Anything else to add for this track?</label>
              <textarea className="input" value={addContext} onChange={e => setAddContext(e.target.value)} placeholder="Additional context, research you've already done, specific questions..." style={{ minHeight: 70, lineHeight: 1.6 }} />
            </div>

            <div style={{ border: `1px dashed ${C.border}`, borderRadius: 10, padding: 18, textAlign: "center", marginBottom: 20, cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.borderLight} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 4px" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div style={{ fontSize: 13, color: C.textMuted }}>Upload files to track memory</div>
            </div>

            <button className="btn btn-primary" onClick={() => setSetupStep(1)} style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 10 }}>
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Module Checklist
  return (
    <div style={{ minHeight: "calc(100vh - 54px)", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 28px" }}>
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "12px 0", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted }}>
          <button className="btn-ghost" onClick={() => onComplete(null)} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
          <span>›</span><span style={{ color: C.text, fontWeight: 500 }}>{track.name} — Select Modules</span>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
        <div className="fade-up" style={{ maxWidth: 560, width: "100%" }}>
          <h2 className="serif" style={{ fontSize: 28, fontWeight: 400, marginBottom: 6 }}>Choose your modules</h2>
          <p style={{ fontSize: 14, color: C.textDim, marginBottom: 22 }}>Select which modules you want help with in the {track.name} track. You can enable more later.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {track.modules.map(mod => (
              <label key={mod.id} onClick={() => toggleMod(mod.id)}
                style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 10, border: `1px solid ${selectedModules.includes(mod.id) ? C.blue : C.border}`, background: selectedModules.includes(mod.id) ? C.blueBg : C.card, cursor: "pointer", transition: "all .15s" }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${selectedModules.includes(mod.id) ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: selectedModules.includes(mod.id) ? C.blue : "transparent", marginTop: 1 }}>
                  {selectedModules.includes(mod.id) && <span style={{ color: C.white, fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{mod.name}</div>
                  <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>{mod.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-outline" onClick={() => setSetupStep(0)}>← Back</button>
            <button className="btn btn-primary" onClick={() => onComplete({ selectedModules, addContext })} disabled={selectedModules.length === 0}
              style={{ flex: 1, justifyContent: "center", padding: 14, fontSize: 15, borderRadius: 10 }}>
              Create my Track Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple inline markdown renderer for the doc viewer modal
function renderMDContent(text) {
  const lines = (text || "").split("\n");
  const result = [];
  let key = 0;
  const inlineMD = (str) => {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) => i % 2 === 1 ? <strong key={i}>{p}</strong> : p);
  };
  for (const line of lines) {
    if (line.startsWith("# ")) {
      result.push(<h1 key={key++} style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: "0 0 10px", fontFamily: F.serif }}>{inlineMD(line.slice(2))}</h1>);
    } else if (line.startsWith("## ")) {
      result.push(<h2 key={key++} style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: "14px 0 6px", fontFamily: F.sans }}>{inlineMD(line.slice(3))}</h2>);
    } else if (line.startsWith("### ")) {
      result.push(<h3 key={key++} style={{ fontSize: 14, fontWeight: 600, color: C.textDim, margin: "10px 0 4px", fontFamily: F.sans }}>{inlineMD(line.slice(4))}</h3>);
    } else if (/^[-*] /.test(line)) {
      result.push(<div key={key++} style={{ display: "flex", gap: 8, margin: "3px 0" }}><span style={{ color: C.blue, flexShrink: 0 }}>•</span><span style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{inlineMD(line.slice(2))}</span></div>);
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)[1];
      result.push(<div key={key++} style={{ display: "flex", gap: 8, margin: "3px 0" }}><span style={{ color: C.blue, flexShrink: 0 }}>{num}.</span><span style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6 }}>{inlineMD(line.replace(/^\d+\.\s/, ""))}</span></div>);
    } else if (line.trim() === "") {
      result.push(<div key={key++} style={{ height: 8 }} />);
    } else {
      result.push(<p key={key++} style={{ fontSize: 13.5, color: C.text, lineHeight: 1.65, margin: "2px 0" }}>{inlineMD(line)}</p>);
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════
// TRACK DASHBOARD
// ═══════════════════════════════════════════════════════════
function TrackDashboardPage({ track, context, go, goModule, selectedModules, moduleProgress, trackDocs, setTrackDocs, saveTrackDocs, trackMemory, setTrackMemory, saveTrackMemory, contextMDs, trackContextMDs, setTrackContextMDs, saveTrackContextMDs, saveContextMD }) {
  const [editingMD, setEditingMD] = useState(null);
  const [editMDContent, setEditMDContent] = useState("");
  const [docModal, setDocModal] = useState(null);
  const docsUploadRef = useRef(null);
  const memoryUploadRef = useRef(null);
  const enabledModules = track.modules.filter(m => selectedModules.includes(m.id));

  const downloadDoc = (doc) => {
    const content = doc.content || doc.text || "";
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (doc.title || "document").replace(/\s+/g, "-") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };
  const openDoc = (doc) => setDocModal(doc);
  const handleDocsUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const doc = { id: Date.now().toString(), title: file.name, content: reader.result, type: "Uploaded", module: "-", created: Date.now() };
      const updated = [...trackDocs, doc];
      setTrackDocs(updated);
      saveTrackDocs(updated);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const handleMemoryUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const entry = { id: Date.now().toString(), name: file.name, content: reader.result };
      const updated = [...trackMemory, entry];
      setTrackMemory(updated);
      saveTrackMemory(updated);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  const totalMods = enabledModules.length;
  const doneMods = enabledModules.filter(m => (moduleProgress[m.id]?.status === "done")).length;
  const pct = totalMods > 0 ? Math.round((doneMods / totalMods) * 100) : 0;

  // Priority suggestions
  const notStarted = enabledModules.filter(m => !moduleProgress[m.id] || moduleProgress[m.id]?.status === "not-started");
  const inProgress = enabledModules.filter(m => moduleProgress[m.id]?.status === "in-progress");
  const suggestions = [...inProgress, ...notStarted].slice(0, 3);

  return (
    <>
      <Modal open={!!docModal} onClose={() => setDocModal(null)} title={docModal?.title} wide>
        <div style={{ fontFamily: F.sans }}>
          {docModal && renderMDContent(docModal.content || docModal.text || "")}
        </div>
      </Modal>
    <div style={{ display: "flex", height: "calc(100vh - 54px)" }}>
      {/* Module Sidebar — small column */}
      <div style={{ width: 220, borderRight: `1px solid ${C.border}`, background: C.card, overflowY: "auto", flexShrink: 0 }}>
        <div style={{ padding: "14px 12px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>{track.icon}</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F.sans }}>{track.name}</h3>
          </div>
          <div style={{ marginTop: 8 }}>
            <Progress value={doneMods} max={totalMods} h={5} />
            <div style={{ fontSize: 10.5, color: C.textMuted, marginTop: 4 }}>{doneMods}/{totalMods} modules done</div>
          </div>
        </div>
        <div style={{ padding: "4px 0" }}>
          {enabledModules.map(mod => {
            const status = moduleProgress[mod.id]?.status || "not-started";
            return (
              <div key={mod.id} onClick={() => goModule(mod.id)}
                style={{ padding: "9px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.cardHover} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 15, height: 15, borderRadius: "50%",
                  border: `2px solid ${status === "done" ? C.success : status === "in-progress" ? C.blue : C.border}`,
                  background: status === "done" ? C.success : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: C.white, flexShrink: 0
                }}>{status === "done" ? "✓" : status === "in-progress" ? <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.blue }} /> : null}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{mod.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content — fills remaining space */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textMuted, marginBottom: 14 }}>
          <button className="btn-ghost" onClick={() => go("dashboard")} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
          <span>›</span><span style={{ color: C.text, fontWeight: 500 }}>{track.name}</span>
        </div>

        {/* Priority suggestions */}
        {suggestions.length > 0 && (
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <div className="label" style={{ marginBottom: 8 }}>SUGGESTED NEXT ACTIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(suggestions.length, 3)}, 1fr)`, gap: 10 }}>
              {suggestions.map(mod => (
                <button key={mod.id} onClick={() => goModule(mod.id)} className="card card-lift" style={{ padding: "14px 16px", textAlign: "left", cursor: "pointer", border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{mod.name}</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 3 }}>{mod.desc}</div>
                  <div style={{ marginTop: 8 }}>
                    <Badge text={moduleProgress[mod.id]?.status === "in-progress" ? "Continue" : "Start"} variant={moduleProgress[mod.id]?.status === "in-progress" ? "in-progress" : "not-started"} small />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Docs library — full width */}
        <div className="card fade-up" style={{ padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="label">DOCUMENTATION LIBRARY</span>
            <input type="file" ref={docsUploadRef} accept=".md,.txt,text/*" style={{ display: "none" }} onChange={handleDocsUpload} />
            <button className="btn-outline" style={{ fontSize: 11, padding: "3px 8px" }} onClick={() => docsUploadRef.current?.click()}>+ Upload</button>
          </div>
          {trackDocs.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: C.textMuted, fontSize: 13 }}>No documents yet. Outputs from module chats will appear here.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {trackDocs.map(doc => (
                <div key={doc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📄</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{doc.title}</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{doc.module} · {doc.type}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {(doc.content != null || doc.text != null) && (
                      <>
                        <button className="btn-ghost" onClick={() => openDoc(doc)} style={{ fontSize: 11, color: C.blue }}>Open</button>
                        <button className="btn-ghost" onClick={() => downloadDoc(doc)} style={{ fontSize: 11, color: C.blue }}>Download</button>
                      </>
                    )}
                    <button className="btn-ghost" onClick={() => {
                      const updated = trackDocs.filter(d => d.id !== doc.id);
                      setTrackDocs(updated);
                      saveTrackDocs(updated);
                    }} style={{ fontSize: 11, color: C.danger }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context MD + Memory row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div className="card fade-up" style={{ padding: "16px 18px" }}>
            <div className="label" style={{ marginBottom: 8 }}>TRACK CONTEXT FILES</div>
            {contextMDs.length === 0 ? (
              <div style={{ padding: "16px 0", textAlign: "center", color: C.textMuted, fontSize: 13 }}>No context files yet.</div>
            ) : (
              contextMDs.map(md => (
                <div key={md.id} style={{ padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{md.title}</div>
                    <button className="btn-ghost" onClick={() => {
                      if (editingMD === md.id) { setEditingMD(null); }
                      else { setEditingMD(md.id); setEditMDContent(md.content || ""); }
                    }} style={{ fontSize: 11, color: C.blue }}>
                      {editingMD === md.id ? "Close" : "✏️ Edit"}
                    </button>
                  </div>
                  {editingMD === md.id ? (
                    <>
                      <textarea
                        value={editMDContent}
                        onChange={e => setEditMDContent(e.target.value)}
                        style={{ width: "100%", minHeight: 180, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", fontSize: 12, fontFamily: F.mono, color: C.text, lineHeight: 1.6, resize: "vertical", outline: "none" }}
                      />
                      <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => {
                          if (md.id === "main") {
                            saveContextMD && saveContextMD(editMDContent);
                          } else if (setTrackContextMDs) {
                            const updated = trackContextMDs.map(m => m.id === md.id ? { ...m, content: editMDContent } : m);
                            setTrackContextMDs(updated);
                            saveTrackContextMDs(updated);
                          }
                          setEditingMD(null);
                        }}>Save</button>
                        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditingMD(null)}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 2, lineHeight: 1.5, maxHeight: 80, overflow: "hidden" }}>{md.content?.substring(0, 120)}...</div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="card fade-up" style={{ padding: "16px 18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="label" style={{ marginBottom: 14, alignSelf: "flex-start" }}>MODULE PROGRESS</div>
            {(() => {
              const n = enabledModules.length;
              if (n === 0) return <div style={{ padding: "16px 0", textAlign: "center", color: C.textMuted, fontSize: 13 }}>No modules selected.</div>;
              const size = 150;
              const cx = size / 2, cy = size / 2;
              const outerR = size / 2 - 10;
              const innerR = outerR - 22;
              const midR = (outerR + innerR) / 2;
              const strokeW = outerR - innerR;
              const p2c = (angle, r) => ({
                x: cx + r * Math.cos(angle - Math.PI / 2),
                y: cy + r * Math.sin(angle - Math.PI / 2),
              });
              const f = v => parseFloat(v.toFixed(4));
              // 340° ring with a 20° gap at the bottom; start just right of 6-o'clock
              const startA = (190 * Math.PI) / 180;
              const totalSweep = (340 * Math.PI) / 180;
              const endA = startA + totalSweep;
              const progressA = startA + (pct / 100) * totalSweep;
              const mkArc = (a1, a2) => {
                const s = p2c(a1, midR), e = p2c(a2, midR);
                const large = a2 - a1 > Math.PI ? 1 : 0;
                return `M ${f(s.x)} ${f(s.y)} A ${midR} ${midR} 0 ${large} 1 ${f(e.x)} ${f(e.y)}`;
              };
              return (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
                  <div style={{ position: "relative", width: size, height: size }}>
                    <svg width={size} height={size}>
                      <path d={mkArc(startA, endA)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeW} strokeLinecap="butt" />
                      {pct > 0 && <path d={mkArc(startA, progressA)} fill="none" stroke="#ffffff" strokeWidth={strokeW} strokeLinecap="butt" />}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: F.sans, color: C.text }}>{pct}%</div>
                      <div style={{ fontSize: 11, color: C.textMuted }}>{doneMods}/{totalMods}</div>
                    </div>
                  </div>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 5 }}>
                    {enabledModules.map(mod => {
                      const status = moduleProgress[mod.id]?.status || "not-started";
                      const dotColor = status === "done" ? C.success : status === "in-progress" ? C.blue : C.border;
                      return (
                        <div key={mod.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                          <div style={{ fontSize: 11.5, color: status === "done" ? C.textDim : C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mod.name}</div>
                          {status === "done" && <span style={{ fontSize: 10, color: C.success }}>✓</span>}
                          {status === "in-progress" && <span style={{ fontSize: 10, color: C.blue }}>···</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// MODULE CHAT PAGE (Split view)
// ═══════════════════════════════════════════════════════════
function ModuleChatPage({ track, module: mod, context, go, goBack, moduleProgress, setModuleProgress, saveModuleProgress, trackDocs, setTrackDocs, saveTrackDocs, trackContextMDs, setTrackContextMDs, saveTrackContextMDs }) {
  const [phase, setPhase] = useState("plan");
  const [chat, setChat] = useState([]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const [outputs, setOutputs] = useState({ plan: [], build: [] });
  const [generatingMD, setGeneratingMD] = useState(false);
  const [expertMD, setExpertMD] = useState("");
  const [showToast, toastEl] = useToast();
  const chatEnd = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat, chatLoad]);

  // Fetch expert MD content from backend for this module
  useEffect(() => {
    fetch(`/api/expert/${track.id}/${mod.id}`)
      .then(r => r.ok ? r.text() : "")
      .then(text => { if (text) setExpertMD(text); })
      .catch(() => {});
  }, [track.id, mod.id]);

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const userMsg = { role: "user", content: chatIn.trim() };
    setChat(prev => [...prev, userMsg]);
    setChatIn("");
    setChatLoad(true);

    if (!moduleProgress[mod.id] || moduleProgress[mod.id]?.status === "not-started") {
      const updated = { ...moduleProgress, [mod.id]: { status: "in-progress", pct: 10 } };
      setModuleProgress(updated);
      saveModuleProgress(updated);
    }

    try {
      const ideaStr = context?.idea || "General startup";
      const buildInstruction = phase === "build"
        ? " When in Build phase, always produce a structured deliverable document in your response. Format it with clear headings and sections that can be saved as documentation."
        : "";

      // Build enriched context block from track context files and expert guidance
      const ctxSections = [];
      if (trackContextMDs?.length) {
        ctxSections.push("=== Founder's Track Context ===\n" + trackContextMDs.map(c => `**${c.title}**\n${c.content}`).join("\n\n"));
      }
      if (expertMD) {
        ctxSections.push("=== Expert Guidance for this Module ===\n" + expertMD);
      }
      const ctxBlock = ctxSections.length ? "\n\n" + ctxSections.join("\n\n") : "";

      let res = await callAI(
        [{ role: "user", content: chatIn.trim() }],
        `You are an expert helping a founder with ${mod.name} in the ${track.name} track. Startup: ${ideaStr}. Customer: ${context?.targetCustomer || "TBD"}. Stage: ${context?.stage || "Idea"}. Phase: ${phase}.${buildInstruction}${ctxBlock}\n\nBe specific, actionable, concise. Write in plain prose — no markdown syntax (no asterisks for bold, no # for headers, no leading dashes for bullets). Use line breaks to separate thoughts. Respond as JSON: { "message": "your response", "suggestions": ["suggestion1", "suggestion2"] }`
      );
      if (!res?.message) res = mockChat(phase, mod.name);
      setChat(prev => [...prev, { role: "assistant", content: res.message }]);
      if (res.suggestions) setChat(prev => [...prev, { role: "system", type: "suggestions", data: res.suggestions }]);

      // Auto-add build phase responses as documentation outputs
      if (phase === "build" && res?.message) {
        const output = { id: Date.now().toString(), text: res.message, type: "build", created: Date.now(), title: `${mod.name} — Build output` };
        setOutputs(prev => ({ ...prev, build: [...prev.build, output] }));
      }
    } catch {
      const res = mockChat(phase, mod.name);
      setChat(prev => [...prev, { role: "assistant", content: res.message }]);
      if (res.suggestions) setChat(prev => [...prev, { role: "system", type: "suggestions", data: res.suggestions }]);
    }
    setChatLoad(false);
  };

  const addOutput = (text) => {
    const output = { id: Date.now().toString(), text, type: phase, created: Date.now(), title: `${mod.name} — ${phase === "plan" ? "Plan" : "Build"} output` };
    setOutputs(prev => ({ ...prev, [phase]: [...prev[phase], output] }));
    showToast("Output added");
  };

  const generateContextMD = async () => {
    setGeneratingMD(true);
    try {
      const chatSummary = chat.filter(m => m.role === "user" || m.role === "assistant").map(m => `${m.role}: ${m.content}`).join("\n\n");
      const res = await callAI(
        [{ role: "user", content: `Summarize this conversation into a structured context MD file for the ${mod.name} module. Include: key decisions, insights, next steps, and any deliverables discussed.\n\nConversation:\n${chatSummary}` }],
        `You are creating a concise markdown context file. Output clean markdown with sections for Decisions, Insights, Next Steps, and Deliverables. Respond as JSON: { "message": "the markdown content" }`
      );
      const mdContent = res?.message || `# ${mod.name} Context\n\nNo summary generated.`;
      const doc = { id: Date.now().toString(), title: `${mod.name} — Context Summary`, content: mdContent };
      const updated = [...(trackContextMDs || []), doc];
      if (setTrackContextMDs) setTrackContextMDs(updated);
      if (saveTrackContextMDs) saveTrackContextMDs(updated);
      showToast("Context MD file generated & saved to Track context files");
    } catch {
      showToast("Failed to generate context file", "error");
    }
    setGeneratingMD(false);
  };

  const saveOutputToTrack = (output) => {
    const doc = { id: output.id, title: output.title, content: output.text, type: output.type === "plan" ? "Plan" : "Build", module: mod.name, created: output.created };
    const updated = [...trackDocs, doc];
    setTrackDocs(updated);
    saveTrackDocs(updated);
    showToast("Saved to documentation library");
  };

  const deleteOutput = (outputId) => {
    setOutputs(prev => ({ ...prev, [phase]: prev[phase].filter(o => o.id !== outputId) }));
    const updated = trackDocs.filter(d => d.id !== outputId);
    setTrackDocs(updated);
    saveTrackDocs(updated);
  };

  const markDone = () => {
    const updated = { ...moduleProgress, [mod.id]: { status: "done", pct: 100 } };
    setModuleProgress(updated);
    saveModuleProgress(updated);
    showToast(`${mod.name} marked as done`);
  };

  const markNotDone = () => {
    const updated = { ...moduleProgress, [mod.id]: { status: "in-progress", pct: 50 } };
    setModuleProgress(updated);
    saveModuleProgress(updated);
  };

  const isDone = moduleProgress[mod.id]?.status === "done";
  const currentOutputs = outputs[phase] || [];

  return (
    <div style={{ height: "calc(100vh - 54px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {toastEl}
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "0 28px", flexShrink: 0 }}>
        <div style={{ maxWidth: "100%", margin: "0 auto" }}>
          <div style={{ padding: "8px 0 4px", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted }}>
            <button className="btn-ghost" onClick={() => go("dashboard")} style={{ fontSize: 12, padding: "2px 4px" }}>Roadmap</button>
            <span>›</span>
            <button className="btn-ghost" onClick={goBack} style={{ fontSize: 12, padding: "2px 4px" }}>{track.name}</button>
            <span>›</span>
            <span style={{ color: C.text, fontWeight: 500 }}>{mod.name}</span>
          </div>
          <div style={{ paddingBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 className="serif" style={{ fontSize: 24, fontWeight: 400 }}>{mod.name}</h2>
              <Badge text={isDone ? "Done" : "In progress"} variant={isDone ? "done" : "in-progress"} small />
            </div>
            <button className={isDone ? "btn btn-danger" : "btn btn-success"} onClick={isDone ? markNotDone : markDone} style={{ fontSize: 13, padding: "8px 18px" }}>
              {isDone ? "↩ Reopen" : "✓ Mark done"}
            </button>
          </div>
        </div>
      </div>

      {/* Split view */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden", minHeight: 0 }}>
        {/* LEFT: Chat */}
        <div style={{ display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}`, overflow: "hidden", minHeight: 0 }}>
          {/* Phase tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, background: C.card, padding: "0 20px", flexShrink: 0 }}>
            {[{ id: "plan", label: "🗺️ Plan" }, { id: "build", label: "🔨 Build" }].map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                style={{ all: "unset", cursor: "pointer", padding: "11px 18px", fontSize: 13.5, fontWeight: phase === p.id ? 600 : 400, color: phase === p.id ? C.text : C.textMuted, fontFamily: F.sans, borderBottom: phase === p.id ? `2px solid ${C.text}` : "2px solid transparent", transition: "all .15s", marginBottom: -1 }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Chat messages — scrollable */}
          <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", minHeight: 0 }}>
            {chat.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted }}>
                <div style={{ fontSize: 28, opacity: .2, marginBottom: 8 }}>{phase === "plan" ? "🗺️" : "🔨"}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.textDim }}>Start a {phase === "plan" ? "planning" : "building"} conversation</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>Use the prompt suggestions below or type your own</div>
              </div>
            )}
            {chat.map((m, i) => {
              if (m.role === "system" && m.type === "suggestions") return (
                <div key={i} style={{ display: "flex", gap: 5, flexWrap: "wrap", margin: "2px 0 14px 2px" }}>
                  {m.data.map((s, j) => <button key={j} className="btn-outline" onClick={() => setChatIn(s)} style={{ fontSize: 12, padding: "4px 11px" }}>{s}</button>)}
                </div>
              );
              return (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
                  <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: 11, fontSize: 13.5, lineHeight: 1.65, fontFamily: F.sans, whiteSpace: "pre-wrap",
                    ...(m.role === "user" ? { background: C.text, color: C.bg, borderBottomRightRadius: 3 } : { background: C.card, color: C.text, borderBottomLeftRadius: 3, border: `1px solid ${C.border}` }) }}>
                    {m.content}
                  </div>
                </div>
              );
            })}
            {chatLoad && <Dots />}
            <div ref={chatEnd} />
          </div>

          {/* Prompt suggestions above input */}
          {chat.length === 0 && (
            <div style={{ padding: "6px 20px", borderTop: `1px solid ${C.border}`, background: C.card, display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, lineHeight: "28px" }}>Try:</span>
              {(phase === "plan"
                ? [`Help me plan ${mod.name.toLowerCase()}`, "What should I focus on first?", "Create a 2-week plan"]
                : [`Generate a ${mod.name.toLowerCase()} template`, "Help me structure my findings", "Create a decision framework"]
              ).map(s => (
                <button key={s} className="btn-outline" onClick={() => setChatIn(s)} style={{ fontSize: 11, padding: "4px 10px" }}>{s}</button>
              ))}
            </div>
          )}

          {/* Chat input + Generate MD button */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", flexDirection: "column", gap: 6, background: C.card, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              <button className="btn-ghost" style={{ padding: 5 }} title="Attach file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.49"/></svg>
              </button>
              <input className="input" value={chatIn} onChange={e => setChatIn(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Ask a question..." disabled={chatLoad}
                style={{ border: "none", boxShadow: "none !important", padding: "7px 0", background: "transparent" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <Badge text={phase === "plan" ? "Plan" : "Build"} variant={phase === "plan" ? "in-progress" : "Analysis"} small />
                <button className="btn btn-primary" onClick={sendChat} disabled={!chatIn.trim() || chatLoad} style={{ padding: "7px 12px", borderRadius: 99 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
            <button
              className="btn btn-outline"
              onClick={generateContextMD}
              disabled={chat.length < 2 || generatingMD}
              style={{ width: "100%", justifyContent: "center", fontSize: 12, padding: "6px 12px", opacity: chat.length < 2 ? 0.4 : 1 }}>
              {generatingMD
                ? <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Spinner size={12} /> Generating context file...</span>
                : "📝 Generate MD Context File"}
            </button>
          </div>
        </div>

        {/* RIGHT: Outputs */}
        <div style={{ display: "flex", flexDirection: "column", background: C.card, overflow: "hidden", minHeight: 0 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, padding: "0 18px", flexShrink: 0 }}>
            {[{ id: "plan", label: "Plan Outputs" }, { id: "build", label: "Build Outputs" }].map(p => (
              <button key={p.id} onClick={() => setPhase(p.id)}
                style={{ all: "unset", cursor: "pointer", padding: "11px 16px", fontSize: 13, fontWeight: phase === p.id ? 600 : 400, color: phase === p.id ? C.text : C.textMuted, fontFamily: F.sans, borderBottom: phase === p.id ? `2px solid ${C.text}` : "2px solid transparent", marginBottom: -1 }}>
                {p.label} ({(outputs[p.id] || []).length})
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 18, minHeight: 0 }}>
            {currentOutputs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: C.textMuted }}>
                <div style={{ fontSize: 28, opacity: .2, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 13, color: C.textDim }}>No {phase} outputs yet</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>{phase === "build" ? "Build phase responses are automatically added here" : "Chat with the AI to generate outputs, then save them here"}</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentOutputs.map(output => (
                  <div key={output.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{output.title}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-ghost" onClick={() => saveOutputToTrack(output)} style={{ fontSize: 11, color: C.success }}>💾 Save</button>
                        <button className="btn-ghost" onClick={() => deleteOutput(output.id)} style={{ fontSize: 11, color: C.danger }}>🗑 Delete</button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: C.textDim, lineHeight: 1.6, fontFamily: F.mono, whiteSpace: "pre-wrap", maxHeight: 150, overflow: "auto" }}>{output.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick add output */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 18px", flexShrink: 0 }}>
            <button className="btn btn-outline" onClick={() => {
              const lastAssistant = [...chat].reverse().find(m => m.role === "assistant");
              if (lastAssistant) {
                const output = { id: Date.now().toString(), text: lastAssistant.content, type: phase, created: Date.now(), title: `${mod.name} — ${phase === "plan" ? "Plan" : "Build"} output` };
                saveOutputToTrack(output);
              } else showToast("No AI response to save", "warn");
            }} style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              📥 Save last response as output
            </button>
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
    { name: "Priya Sharma", title: "Founder at GreenRoute", desc: "Sustainable logistics optimization", tags: ["CleanTech", "Pre-seed"], loc: "London, UK", initials: "PS", color: "#4a7060" },
  ];
  const investors = [
    { name: "James Liu", title: "Partner at Horizon Ventures", desc: "Pre-seed to Seed · B2B SaaS focus", tags: ["$100K–$500K", "SaaS"], loc: "London, UK", initials: "JL", color: "#4a6680", portfolio: 24, checkSize: "$100K–$500K", sectors: ["B2B SaaS", "Dev Tools"], thesis: "Backs technical founders with strong domain expertise" },
    { name: "Amara Okafor", title: "Angel Investor", desc: "Solo checks in fintech and dev tools", tags: ["$25K–$100K", "Fintech"], loc: "Lagos, NG", initials: "AO", color: "#5a7c5a", portfolio: 12, checkSize: "$25K–$100K", sectors: ["Fintech", "Payments"], thesis: "Looking for fintech solutions in emerging markets" },
    { name: "Rachel Park", title: "GP at First Mile Fund", desc: "Seed stage · Consumer and marketplace", tags: ["$250K–$1M", "Consumer"], loc: "San Francisco, CA", initials: "RP", color: "#8a7340", portfolio: 38, checkSize: "$250K–$1M", sectors: ["Consumer", "Marketplace"], thesis: "Marketplace businesses with network effects" },
    { name: "Thomas Weber", title: "Partner at Deep Tech Capital", desc: "Series A · Deep tech and AI infra", tags: ["$500K–$2M", "Deep Tech"], loc: "Berlin, DE", initials: "TW", color: "#6b5b8a", portfolio: 19, checkSize: "$500K–$2M", sectors: ["AI/ML", "Infrastructure"], thesis: "Deep tech with defensible IP and large markets" },
  ];
  const data = tab === "founders" ? founders : investors;

  return (
    <div style={{ maxWidth: 1340, margin: "0 auto", padding: "28px" }}>
      <div className="fade-up">
        <h1 className="serif" style={{ fontSize: 34, fontWeight: 400 }}>Network</h1>
        <p style={{ color: C.textDim, fontSize: 14, marginTop: 4 }}>
          {tab === "founders" ? "Connect with founders building the future" : "Find investors aligned with your stage and sector"}
        </p>
      </div>

      <div style={{ display: "flex", gap: 3, marginTop: 18, marginBottom: 22 }}>
        {["founders", "investors"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "7px 18px", borderRadius: 7, border: `1px solid ${tab === t ? C.text : C.border}`, background: tab === t ? C.text : "transparent", color: tab === t ? C.bg : C.textMuted, fontSize: 13.5, fontWeight: 600, fontFamily: F.sans, cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start" }}>
        <div>
          <div className="card" style={{ padding: 12, marginBottom: 14, display: "flex", gap: 8 }}>
            <input className="input" placeholder={`Search ${tab}...`} style={{ fontSize: 13.5 }} />
            {tab === "founders" ? (
              <>
                <select className="input" style={{ width: "auto", fontSize: 13 }}><option>All Industries</option><option>Fintech</option><option>SaaS</option><option>HealthTech</option><option>EdTech</option><option>CleanTech</option></select>
                <select className="input" style={{ width: "auto", fontSize: 13 }}><option>All Stages</option><option>Pre-seed</option><option>Seed</option><option>Series A</option></select>
              </>
            ) : (
              <>
                <select className="input" style={{ width: "auto", fontSize: 13 }}><option>All Check Sizes</option><option>{"$25K–$100K"}</option><option>{"$100K–$500K"}</option><option>{"$250K–$1M"}</option><option>{"$500K–$2M"}</option></select>
                <select className="input" style={{ width: "auto", fontSize: 13 }}><option>All Sectors</option><option>SaaS</option><option>Fintech</option><option>Consumer</option><option>Deep Tech</option><option>AI/ML</option></select>
                <select className="input" style={{ width: "auto", fontSize: 13 }}><option>All Locations</option><option>US</option><option>UK</option><option>EU</option><option>Africa</option></select>
              </>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.map((p, i) => (
              <div key={i} className="card card-lift fade-up" style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animationDelay: `${i * .05}s` }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: p.color, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, fontFamily: F.sans, flexShrink: 0 }}>{p.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: C.textDim }}>{p.title}</div>
                    <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 2 }}>{p.desc}</div>
                    {tab === "investors" && p.thesis && (
                      <div style={{ fontSize: 12, color: C.textDim, marginTop: 4, fontStyle: "italic" }}>"{p.thesis}"</div>
                    )}
                    <div style={{ display: "flex", gap: 5, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                      {p.tags.map(t => <Badge key={t} text={t} variant="not-started" small />)}
                      <span style={{ fontSize: 11, color: C.textMuted }}>📍 {p.loc}</span>
                      {p.portfolio && <span style={{ fontSize: 11, color: C.textMuted }}>· {p.portfolio} investments</span>}
                    </div>
                    {tab === "investors" && p.sectors && (
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        {p.sectors.map(s => <span key={s} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 99, background: C.blueBg, color: C.blue }}>{s}</span>)}
                      </div>
                    )}
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
            {(tab === "founders"
              ? [{n:"1",t:"Click \"Connect\" on any profile"},{n:"2",t:"Write a brief note about why you'd like to connect"},{n:"3",t:"We'll facilitate when both parties accept"}]
              : [{n:"1",t:"Complete your Validation track first"},{n:"2",t:"Investors prefer founders who've validated"},{n:"3",t:"Include traction + one-liner in your intro"}]
            ).map(s => (
              <div key={s.n} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.text, color: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{s.n}</div>
                <span style={{ fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>{s.t}</span>
              </div>
            ))}
          </div>
          <div className="card fade-up" style={{ padding: 20, background: C.text, border: "none" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: C.bg, marginBottom: 5 }}>
              {tab === "investors" ? "Investor ready?" : "Get discovered"}
            </h3>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>
              {tab === "investors" ? "Complete your roadmap tracks to unlock warm introductions." : "Complete your profile to appear in search results."}
            </p>
            <button style={{ width: "100%", padding: "9px", borderRadius: 7, background: C.bg, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.text, fontFamily: F.sans }}>
              {tab === "investors" ? "📊 Check readiness" : "🖥️ Post your startup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════════
function ProfilePage({ go }) {
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem("fos-api-key") || ""; } catch { return ""; }
  });
  const [keySaved, setKeySaved] = useState(false);

  const saveKey = () => {
    try { localStorage.setItem("fos-api-key", apiKey.trim()); } catch {}
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const clearKey = () => {
    try { localStorage.removeItem("fos-api-key"); } catch {}
    setApiKey("");
    setKeySaved(false);
  };

  const hasKey = apiKey.trim().length > 0;
  const keyStored = (() => { try { return !!localStorage.getItem("fos-api-key"); } catch { return false; } })();

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px" }}>
      <h1 className="serif" style={{ fontSize: 34, fontWeight: 400 }}>Profile & Settings</h1>
      <p style={{ color: C.textDim, fontSize: 14, marginTop: 4 }}>Your founder profile and API configuration.</p>

      {/* Profile card */}
      <div className="card fade-up" style={{ marginTop: 24, padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.card, border: `2px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>Founder</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>Complete your profile to appear in Network search.</div>
          </div>
        </div>
      </div>

      {/* API Key card */}
      <div className="card fade-up" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>Anthropic API Key</div>
          {keyStored && <Badge text="Saved" variant="done" small />}
        </div>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, marginBottom: 18 }}>
          Enter your key to enable Claude-powered chat across all modules. Get a key from{" "}
          <span style={{ color: C.blue }}>console.anthropic.com</span>.
          Your key is stored locally in your browser and never sent to our servers.
        </p>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="input"
            type="password"
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setKeySaved(false); }}
            onKeyDown={e => e.key === "Enter" && saveKey()}
            placeholder="sk-ant-..."
            style={{ flex: 1, fontFamily: F.mono, fontSize: 13, letterSpacing: apiKey ? "0.05em" : "normal" }}
          />
          <button
            className="btn btn-primary"
            onClick={saveKey}
            disabled={!hasKey}
            style={{ flexShrink: 0, padding: "9px 18px" }}
          >
            {keySaved ? "✓ Saved" : "Save key"}
          </button>
          {keyStored && (
            <button className="btn btn-outline" onClick={clearKey} style={{ flexShrink: 0, padding: "9px 14px", color: C.danger, borderColor: C.danger }}>
              Clear
            </button>
          )}
        </div>

        {keySaved && (
          <div style={{ marginTop: 12, fontSize: 13, color: C.success }}>
            ✓ Key saved — chat is ready to use.
          </div>
        )}
        {!keyStored && (
          <div style={{ marginTop: 12, fontSize: 12, color: C.textMuted }}>
            Without a key, the app uses mock responses so you can still explore the UI.
          </div>
        )}
      </div>

      <button className="btn btn-outline" onClick={() => go("dashboard")}>← Back to Roadmap</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("loading");
  const [context, setContext] = useState(null);
  const [contextMD, setContextMD] = useState("");
  const [trackOrder, setTrackOrder] = useState(null);
  const [trackSetup, setTrackSetup] = useState({});
  const [trackModulesSelected, setTrackModulesSelected] = useState({});
  const [moduleProgress, setModuleProgress] = useState({});
  const [trackDocsData, setTrackDocsData] = useState({});
  const [trackContextMDsData, setTrackContextMDsData] = useState({});
  const [trackMemoryData, setTrackMemoryData] = useState({});
  const [allNotes, setAllNotes] = useState([]);
  const [kanban, setKanban] = useState({ columns: [
    { id: "todo", title: "To Do", tasks: [] },
    { id: "doing", title: "Doing", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]});

  // Current track/module navigation
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);

  useEffect(() => {
    (async () => {
      const done = await sGet(SK.onboarded);
      if (done) {
        const ctx = await sGet(SK.context); if (ctx) setContext(ctx);
        const md = await sGet(SK.contextMD); if (md) setContextMD(md);
        const to = await sGet(SK.trackOrder); if (to) setTrackOrder(to);
        const ts = await sGet(SK.trackSetup); if (ts) setTrackSetup(ts);
        const tm = await sGet(SK.trackModules); if (tm) setTrackModulesSelected(tm);
        const mp = await sGet(SK.trackProgress); if (mp) setModuleProgress(mp);
        const td = await sGet(SK.trackDocs); if (td) setTrackDocsData(td);
        const tcm = await sGet(SK.trackContextMDs); if (tcm) setTrackContextMDsData(tcm);
        const tmem = await sGet(SK.trackMemory); if (tmem) setTrackMemoryData(tmem);
        const n = await sGet(SK.notes); if (n) setAllNotes(n);
        const k = await sGet(SK.kanban); if (k) setKanban(k);
        setPage("dashboard");
      } else {
        setPage("onboarding");
      }
    })();
  }, []);

  const saveKanban = async (k) => { setKanban(k); await sSet(SK.kanban, k); };
  const saveNotes = async (n) => { await sSet(SK.notes, n); };
  const saveModuleProgress = async (mp) => { await sSet(SK.trackProgress, mp); };
  const saveTrackDocs = async (trackId, docs) => {
    const updated = { ...trackDocsData, [trackId]: docs };
    setTrackDocsData(updated);
    await sSet(SK.trackDocs, updated);
  };
  const saveTrackContextMDs = async (trackId, mds) => {
    const updated = { ...trackContextMDsData, [trackId]: mds };
    setTrackContextMDsData(updated);
    await sSet(SK.trackContextMDs, updated);
  };
  const saveTrackMemory = async (trackId, files) => {
    const updated = { ...trackMemoryData, [trackId]: files };
    setTrackMemoryData(updated);
    await sSet(SK.trackMemory, updated);
  };

  const completeOnboard = async ({ context: ctx, contextMD: md, trackOrder: to }) => {
    setContext(ctx); setContextMD(md); setTrackOrder(to);
    await sSet(SK.context, ctx);
    await sSet(SK.contextMD, md);
    await sSet(SK.trackOrder, to);
    await sSet(SK.onboarded, true);
    setPage("dashboard");
  };

  const go = (pageId) => {
    if (pageId === "dashboard" || pageId === "network" || pageId === "profile") {
      setCurrentTrack(null);
      setCurrentModule(null);
      setPage(pageId);
    } else if (pageId.startsWith("track-")) {
      const trackId = pageId.replace("track-", "");
      const track = TRACKS.find(t => t.id === trackId);
      if (!track) return;
      setCurrentTrack(track);
      setCurrentModule(null);
      if (trackSetup[trackId]) {
        setPage("track-dashboard");
      } else {
        setPage("track-setup");
      }
    }
  };

  const goModule = (moduleId) => {
    if (!currentTrack) return;
    const mod = currentTrack.modules.find(m => m.id === moduleId);
    if (!mod) return;
    setCurrentModule(mod);
    setPage("module-chat");
  };

  const completeTrackSetup = async (result) => {
    if (!result) { setPage("dashboard"); setCurrentTrack(null); return; }
    const trackId = currentTrack.id;
    const updatedSetup = { ...trackSetup, [trackId]: true };
    const updatedMods = { ...trackModulesSelected, [trackId]: result.selectedModules };
    setTrackSetup(updatedSetup);
    setTrackModulesSelected(updatedMods);
    await sSet(SK.trackSetup, updatedSetup);
    await sSet(SK.trackModules, updatedMods);

    // Save track setup context as a context MD file for this track
    if (result.addContext?.trim()) {
      const ctxEntry = { id: "setup-context", title: "Track Setup Context", content: result.addContext.trim() };
      const existing = trackContextMDsData[trackId] || [];
      // Replace any previous setup-context entry rather than duplicating
      const filtered = existing.filter(e => e.id !== "setup-context");
      const updatedMDs = { ...trackContextMDsData, [trackId]: [...filtered, ctxEntry] };
      setTrackContextMDsData(updatedMDs);
      await sSet(SK.trackContextMDs, updatedMDs);
    }

    setPage("track-dashboard");
  };

  // Compute track progress for dashboard
  const trackProgress = {};
  TRACKS.forEach(track => {
    const selMods = trackModulesSelected[track.id] || [];
    const total = selMods.length;
    const done = selMods.filter(mId => moduleProgress[mId]?.status === "done").length;
    trackProgress[track.id] = { done, total };
  });

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
      {page !== "onboarding" && <NavBar page={page === "dashboard" || page === "track-setup" || page === "track-dashboard" || page === "module-chat" ? "dashboard" : page} go={go} />}

      {page === "onboarding" && <OnboardingPage onComplete={completeOnboard} />}

      {page === "dashboard" && (
        <DashboardPage
          context={context} contextMD={contextMD} trackOrder={trackOrder} go={go}
          trackSetup={trackSetup} trackProgress={trackProgress}
          allNotes={allNotes} setAllNotes={setAllNotes}
          kanban={kanban} setKanban={setKanban}
          saveKanban={saveKanban} saveNotes={saveNotes}
        />
      )}

      {page === "track-setup" && currentTrack && (
        <TrackSetupPage track={currentTrack} context={context} onComplete={completeTrackSetup} />
      )}

      {page === "track-dashboard" && currentTrack && (
        <TrackDashboardPage
          track={currentTrack} context={context} go={go} goModule={goModule}
          selectedModules={trackModulesSelected[currentTrack.id] || []}
          moduleProgress={moduleProgress}
          trackDocs={trackDocsData[currentTrack.id] || []}
          setTrackDocs={(docs) => { setTrackDocsData(prev => ({ ...prev, [currentTrack.id]: docs })); }}
          saveTrackDocs={(docs) => saveTrackDocs(currentTrack.id, docs)}
          trackMemory={trackMemoryData[currentTrack.id] || []}
          setTrackMemory={(files) => { setTrackMemoryData(prev => ({ ...prev, [currentTrack.id]: files })); }}
          saveTrackMemory={(files) => saveTrackMemory(currentTrack.id, files)}
          contextMDs={[
            ...(contextMD ? [{ id: "main", title: "Startup Context", content: contextMD }] : []),
            ...(trackContextMDsData[currentTrack.id] || []),
          ]}
          trackContextMDs={trackContextMDsData[currentTrack.id] || []}
          setTrackContextMDs={(mds) => { setTrackContextMDsData(prev => ({ ...prev, [currentTrack.id]: mds })); }}
          saveTrackContextMDs={(mds) => saveTrackContextMDs(currentTrack.id, mds)}
          saveContextMD={async (content) => { setContextMD(content); await sSet(SK.contextMD, content); }}
        />
      )}

      {page === "module-chat" && currentTrack && currentModule && (
        <ModuleChatPage
          track={currentTrack} module={currentModule} context={context}
          go={go} goBack={() => { setCurrentModule(null); setPage("track-dashboard"); }}
          moduleProgress={moduleProgress} setModuleProgress={setModuleProgress} saveModuleProgress={saveModuleProgress}
          trackDocs={trackDocsData[currentTrack.id] || []}
          setTrackDocs={(docs) => { setTrackDocsData(prev => ({ ...prev, [currentTrack.id]: docs })); }}
          saveTrackDocs={(docs) => saveTrackDocs(currentTrack.id, docs)}
          trackContextMDs={trackContextMDsData[currentTrack.id] || []}
          setTrackContextMDs={(mds) => { setTrackContextMDsData(prev => ({ ...prev, [currentTrack.id]: mds })); }}
          saveTrackContextMDs={(mds) => saveTrackContextMDs(currentTrack.id, mds)}
        />
      )}

      {page === "network" && <NetworkPage />}

      {page === "profile" && <ProfilePage go={go} />}
    </div>
  );
}
