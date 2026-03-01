# FounderOS — Product Overview

> Single-page context for "what and why." For full nuance, see [founder-os-product-brief_2.md](founder-os-product-brief_2.md).

---

## The Problem

First-time and early-stage founders don't know what they don't know. They skip critical steps — like deeply understanding their target customer — not out of laziness, but because no one told them it mattered yet.

Generic AI tools (e.g. ChatGPT, Claude) cannot:

- Tell you *what question to ask* at your current stage
- Remember your startup from one conversation to the next
- Prescribe the right framework at the right moment
- Hold you accountable to decisions you said you'd make

Result: founders build before validating, pitch before understanding their customer, and burn months on the wrong priorities.

---

## The Solution

**FounderOS** is a stage-aware operating system for early founders that replaces guesswork with structured direction.

**Three layers:**

1. **Conversational Onboarding** — Chat-based intake that builds a structured founder profile (identity, problem, solution, goal, progress, strengths, gaps) and collects materials. Roadmap Developer evaluates inputs and generates a personalised roadmap; uploaded materials are sorted into tracks.
2. **Dashboard** — Home base: roadmap visual (clickable tracks), kanban board, sticky notes. An in-app **priority agent** suggests highest-priority tasks (due to dependencies) and quick wins (&lt;15 min) for momentum.
3. **Track Workspaces** — Per-track landing (modules + sorted materials) and workspace: module chats with expert AI, documentation + MD editor, deliverable-based progress bars. Chat summaries save to MD for session memory. **Founders can work on any module in any order** — no locking; the priority agent only recommends what to do next.

---

## User Flow

1. Founder arrives → AI chat starts onboarding.
2. AI collects: identity, problem, solution, goal, progress, strengths, gaps (materials uploaded here).
3. Roadmap Developer evaluates inputs → personalised roadmap; materials sorted into tracks.
4. Founder lands on Dashboard (roadmap visual · kanban · sticky notes).
5. Founder clicks a track in the roadmap.
6. Track Landing Page: view modules, review sorted materials, upload more if needed.
7. Track Workspace: module chats with expert guidance; save chat summaries to MD; AI loads them next session.
8. Documentation section: review outputs, edit MDs; monitor module + track progress bars.

---

## Product Architecture

| Layer              | Interface              | Function                                                                 |
| ------------------ | ---------------------- | ------------------------------------------------------------------------ |
| Onboarding         | Chat                   | Builds founder profile, generates roadmap, sorts materials into tracks   |
| Dashboard          | Visual workspace       | Roadmap navigation · Kanban board · Sticky notes                         |
| Track Landing Page | Minimalist module view | Module overview · Material review · Upload context                       |
| Track Workspace    | Chat + Docs            | Module chats with expert AI · MD editor · Progress tracking              |

---

## MVP — In Scope

- Conversational onboarding with structured intake questions
- Material upload and track-sorting during onboarding
- Roadmap Developer MD → personalised roadmap generation
- Dashboard with roadmap visual, kanban board, sticky notes
- **Priority agent:** highlights dependency-priority tasks and quick tasks (&lt;15 min); no module locking
- Track landing pages (module overview + material review)
- Track workspaces with per-module AI chats
- Chat summary save-to-MD (local storage for session memory)
- MD file editor within track documentation section
- Module and track progress bars (deliverable-based)

---

## MVP — Out of Scope (Post-MVP)

- Additional skill modules beyond the MVP module set
- Accountability nudges and progress notifications
- Team collaboration features
- Investor readiness simulation
- Integration with external tools (Notion, Linear, etc.)
- Real-time dashboard sync across devices

---

## One-Line Pitch

*"The operating system every founder wishes existed on day one — it knows where you are, tells you what to do next, and turns your thinking into something you can actually show an investor."*
