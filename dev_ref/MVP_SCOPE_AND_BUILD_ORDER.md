# FounderOS — MVP Scope & Build Order

> Keeps scope tight and gives a suggested implementation order for the hackathon. Sufficient to build a **working demo that drives home the utility of the product**.

---

## In Scope (MVP)

- Conversational onboarding with structured intake questions
- Material upload and track-sorting during onboarding
- Roadmap Developer MD (or equivalent logic) → personalised roadmap generation
- Dashboard with roadmap visual, kanban board, sticky notes
- **Priority agent:** reads current progress and highlights (1) **highest-priority tasks due to dependencies** (other tasks down the line require their completion), (2) **quick tasks (&lt;15 min)** so founders can grab small wins and build momentum. No module locking — founders can work on any module in any order.
- Track landing pages (module overview + material review)
- Track workspaces with per-module AI chats
- Chat summary save-to-MD (local storage for session memory)
- MD file editor within track documentation section
- Module and track progress bars (deliverable-based)

---

## Out of Scope (Post-MVP)

- Additional skill modules beyond the MVP module set
- Accountability nudges and progress notifications
- Team collaboration features
- Investor readiness simulation
- Integration with external tools (Notion, Linear, etc.)
- Real-time dashboard sync across devices

---

## Hackathon Priorities

1. **Ship one E2E path first** — e.g. onboarding → roadmap generation → dashboard → one track with 1–2 modules (e.g. Foundation & Problem: Founder–Market Fit + Problem Definition). Cut scope elsewhere rather than diluting this path.
2. **Demo clarity** — A judge or user should experience: “I answer questions and upload something → I get a clear roadmap → I click a track → I have a focused chat with expert guidance and can save progress.” That loop should feel complete.
3. **Quality over breadth** — One track with 2 modules working end-to-end (including progress bars and saved summaries) beats three tracks with broken or shallow flows.

---

## Suggested Build Order

1. **Data model + local storage**
   - Founder profile (identity, problem, solution, goal, progress, strengths, gaps).
   - Personalised roadmap (track IDs, start/end, optional per-track module list).
   - Material-to-track mapping (asset ID → track IDs).
   - Kanban items (title, status, optional track/module).
   - Sticky notes (content).
   - Progress state (deliverable ID → done per module).
   - Refs to uploaded files and paths for saved chat summary MDs.
   - Decide: localStorage, IndexedDB, or file-based (e.g. for desktop).

2. **Onboarding UI + Roadmap Developer**
   - Chat or form that collects all intake questions; support file upload (and optionally paste) for “What progress have you made?”.
   - Roadmap Developer: input = founder profile + asset list; output = roadmap + material-to-track mapping. Implement as prompt+LLM or script; persist outputs into data model.
   - After “submit”: redirect to dashboard with roadmap and data populated.

3. **Dashboard**
   - Roadmap visual: horizontal list or timeline of tracks from personalised roadmap; each track clickable → navigates to Track Landing.
   - **Priority agent:** surface dependency-priority tasks and quick wins (&lt;15 min); can live on dashboard and/or in track views.
   - Kanban board: list or columns (e.g. To Do / In Progress / Done); CRUD for tasks; optionally tag by track.
   - Sticky notes: simple text area or cards; persist to local storage.

4. **Track Landing Page**
   - For selected track: show module list (from roadmap for that track).
   - Show materials sorted into this track (from material-to-track mapping).
   - Optional: “Upload more” for this track (append to uploads and re-run or manually assign to this track).
   - CTA: “Enter workspace” or click a module → go to Track Workspace.

5. **Track Workspace**
   - One module chat: load expert MD for that module; optional load saved summary MD for context; AI responds with guidance; “Save summary” writes/updates summary MD and persists.
   - Documentation section: list of MDs (e.g. summary, reports); open in MD editor (view + edit).
   - Progress: module progress bar (from deliverables in expert MD + stored “done” state); track progress bar (aggregate of modules in this track).
   - Repeat for other modules in the same track (tabs or sidebar).

6. **Expand**
   - Add more MVP-priority modules (see [ROADMAP_AND_TRACKS.md](ROADMAP_AND_TRACKS.md)) and/or tracks as time allows.
   - Polish: copy, empty states, loading states, error handling.

---

## Open Questions (Decide During Build)

From the product brief; resolve as needed for the demo:

- **Product name** — What do we call this product?
- **Aesthetic / UX** — Which direction for the prototype (e.g. minimal, dashboard-heavy, chat-first)?
- **Roadmap visual** — Timeline, cards, or swim lanes?
- **AI persona** — Coach, co-founder, or advisor tone?
- **Completion criteria** — What counts as “done” for a deliverable (e.g. founder marks checkbox, or AI infers from summary)?

These can stay flexible; the build order above does not depend on them being fixed upfront.
