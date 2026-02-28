# FounderOS — Module Expert Template

> Structure for expert MD files and progress logic. All module experts should follow this so the AI and progress bars behave consistently.

---

## Role of the Expert MD

- Each **module** has one **expert MD file**.
- The AI pulls this file when the founder is in that module’s chat.
- The expert MD provides **structured, opinionated guidance** for that module (frameworks, steps, prompts).
- It also defines **deliverables** — the checklist used to compute the module’s progress bar.

---

## Required Sections (Suggested)

Every expert MD file should include:

1. **Module purpose** — What this module is for and when a founder should do it.
2. **Key concepts / framework** — Core ideas or methodology (e.g. JTBD, ICP, discovery interviews).
3. **Step-by-step guidance or prompts** — What the founder should do; optional prompt templates for the AI to use in the chat.
4. **Deliverables** — Explicit list of outputs the founder should produce. Each item is used to mark progress (e.g. “ICP one-pager”, “JTBD statement”). The progress bar is the fraction of deliverables marked “done”. Optionally tag deliverables with **estimated time** (e.g. &lt;15 min) where relevant so the app can surface quick wins.

Optional: **Common pitfalls**, **Examples**, **Templates** (e.g. one-liner formula).

---

## Progress Rules

- **Module progress** = (number of deliverables marked done) / (total deliverables). Defined by the expert MD’s deliverable list.
- **Track progress** = aggregate of its modules’ progress (e.g. average of module progress, or weighted if some modules are required first).
- Progress state is stored locally (e.g. which deliverable IDs are “done” per module). The UI reads this to render progress bars.

---

## Chat Summary → MD (Session Memory)

- After a session in a module chat, the founder can **save or update a chat summary** as a local MD file.
- **Path convention:** e.g. `workspace/{track_id}/{module_id}_summary.md` (or equivalent in your storage model).
- **Next session:** When the founder reopens that module’s chat, the AI **loads this summary MD** so it has context on what was already discussed and decided (session memory).
- The summary is editable by the founder (e.g. via the track’s documentation section / MD editor).

---

## Example Deliverables (for reference)

**Customer Intelligence (Track 1):**

- ICP one-pager (who is the ideal customer, attributes, behaviours)
- JTBD statement (job-to-be-done in one sentence)
- Pain point map (top 3–5 pains with severity and frequency)

**Discovery Interview Guide (Track 2):**

- Interview script (opening, core questions, closing)
- Question bank (10–15 questions by theme)
- Synthesis framework (how you’ll code and summarise answers)

**MVP Scoping (Track 3):**

- Build / don’t build list (features in vs. out for v0)
- Success criteria (what “done” looks like for MVP)
- Scope lock (signed-off MVP scope in one doc)

When adding a new module, create its expert MD with the same four sections and a clear **Deliverables** list so progress tracking works without extra logic. Optionally tag deliverables with **estimated time** (e.g. &lt;15 min) where relevant so the app can surface **quick wins** for founders.
