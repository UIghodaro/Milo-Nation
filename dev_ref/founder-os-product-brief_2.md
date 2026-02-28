# Founder OS — Product Brief

> Hackathon Build · February 2026

---

## The Problem

First-time and early-stage founders don't know what they don't know. They skip critical steps — like deeply understanding their target customer — not out of laziness, but because no one told them it mattered yet. Even if they realise what they need, they lack the expertise or the team if they are working solo.

Generic AI tools like ChatGPT or Claude can answer any question, but they can't:

- Tell you *what question to ask* at your current stage
- Remember your startup from one conversation to the next
- Prescribe the right framework at the right moment
- Hold you accountable to decisions you said you'd make

The result: founders build before validating, pitch before they understand their customer, and burn months on the wrong priorities.

---

## The Solution

**Founder OS** is a stage-aware operating system for early founders that replaces guesswork with structured direction.

It combines three layers into a single, coherent product:

### Layer 1 — Conversational Onboarding

A chat-based intake that takes in a dump of information from the founder, sorts it into buckets on the roadmap and builds a structured founder profile by asking targeted questions to fill in gaps:

- **Who are you?** — Background, role, experience
- **What problem are you solving?** — The core pain point and market context
- **What's your solution?** — Current idea or product direction
- **What's your goal?** — e.g. ship an MVP, secure pre-seed funding, find a co-founder
- **What progress have you made?** — Materials, decks, prototypes, and prior research are collected and uploaded here
- **What are you good at?** — Skills and strengths the founder brings
- **Where do you need help?** — Specific gaps (e.g. marketing, coding, fundraising, legal)

After collecting this data, the system pulls a **Roadmap Developer.md** to evaluate the founder's specific situation and generate a personalised roadmap. The roadmap structure is fixed — the only variables are **where it starts** (based on progress) and **where it ends** (based on goal). Any uploaded materials or project context are simultaneously sorted into their relevant tracks within the roadmap.

### Layer 2 — The Dashboard

After completing onboarding, the founder lands on a persistent dashboard — their home base in Founder OS. It contains three elements:

- **Roadmap Visual** — A horizontal timeline across the top of the screen showing all roadmap tracks. Each track is clickable and expands into its dedicated workspace.
- **Kanban Board** — Below the roadmap, a lightweight task board for managing to-dos across any track or area of the business.
- **Sticky Notes** — A freeform space for quick thoughts, reminders, and scratchpad notes.

### Layer 3 — Skill Module Library & Track Workspaces

Upon clicking a track in the roadmap for the first time, the founder is taken to a **Track Landing Page** — a minimalist view showing:

- The key modules within the track
- Any materials already sorted into this track during onboarding
- An option to upload additional files or text before proceeding

The founder can enrich the context or proceed directly into the track.

The next screen is the **Track Workspace**, which contains:

**Module Chats**
Each module within the track has a dedicated AI chat. The AI pulls the relevant expert MD file for that module to provide structured, opinionated guidance. After each session, the founder can click a button to **save or update a chat summary as a local MD file** — this file is pulled automatically in the next session so the AI remembers progress.

**Documentation Section**
Alongside the chats, a documentation area stores high-level outputs: reports, data summaries, and synthesised findings. The founder also has access to a **Markdown editor** to directly view and edit any MD files in the track.

**Progress Tracking**

- Each track has a **total progress bar** reflecting overall completion
- Each module has its own **individual progress bar**
- Progress is evaluated based on the deliverables defined in the module's expert MD file

---

## How It Works (User Flow)

```
1. Founder arrives on site — AI chat initiates onboarding
         ↓
2. AI collects: identity, problem, solution, goal, progress, strengths, gaps
   (Materials and project context uploaded here)
         ↓
3. Roadmap Developer MD evaluates inputs → generates personalised roadmap
   Uploaded materials are sorted into relevant tracks
         ↓
4. Founder lands on Dashboard
   (Roadmap visual · Kanban board · Sticky notes)
         ↓
5. Founder clicks a track in the roadmap
         ↓
6. Track Landing Page: view modules, review sorted materials, upload more if needed
         ↓
7. Track Workspace: work through module chats with AI expert guidance
   Save chat summaries to MD → AI pulls progress next session
         ↓
8. Documentation Section: review outputs, edit MDs directly
   Monitor module + track progress bars
```

---

## Product Architecture


| Layer              | Interface              | Function                                                               |
| ------------------ | ---------------------- | ---------------------------------------------------------------------- |
| Onboarding         | Chat                   | Builds founder profile, generates roadmap, sorts materials into tracks |
| Dashboard          | Visual workspace       | Roadmap navigation · Kanban board · Sticky notes                       |
| Track Landing Page | Minimalist module view | Module overview · Material review · Upload context                     |
| Track Workspace    | Chat + Docs            | Module chats with expert AI · MD editor · Progress tracking            |


**Key principle:** Chat is the *thinking space*. Documentation is the *output space*. The roadmap is the *navigation layer*. All three are persistent, locally stored, and independently editable.

---

## How This Is Different From Just Using Claude


| Capability                     | Claude / ChatGPT                 | Founder OS                                                 |
| ------------------------------ | -------------------------------- | ---------------------------------------------------------- |
| Knows your startup             | ✗ Starts from zero every session | ✓ Persistent company memory via saved .md context files    |
| Tells you what to do next      | ✗ Only answers what you ask      | ✓ Stage-aware roadmap built from your inputs               |
| Prescribes the right framework | ✗ Generic responses              | ✓ Expert MD files matched to each module                   |
| Produces structured outputs    | ✗ Prose only                     | ✓ Living documentation and progress-tracked deliverables   |
| Holds you accountable          | ✗ No continuity                  | ✓ Progress bars tied to module deliverables                |
| Organises your materials       | ✗ No context management          | ✓ Uploaded files sorted into relevant tracks automatically |
| Built for founders             | ✗ General purpose                | ✓ Founder-specific roadmap, modules, and knowledge base    |


**The core wedge:** Founders don't need more information. They need the right information, in the right order, at the right moment — with a system that knows where they are, what they've already done, and what they need to do next.

---

## Target Customers

**Primary:** First-time founders at idea or pre-validation stage
**Secondary:** Solo founders lacking a co-founder's challenge and perspective
**Tertiary:** Accelerator and incubator cohort members on tight timelines

**Why first-time founders specifically:**

- No playbook, no network, no pattern recognition
- Most likely to skip foundational steps (like customer research)
- Most likely to build before validating
- Highest willingness to follow structured guidance

---

## MVP Scope

### In scope

- Conversational onboarding with structured intake questions
- Material upload and track-sorting during onboarding
- Roadmap Developer MD → personalised roadmap generation
- Dashboard with roadmap visual, kanban board, and sticky notes
- Track landing pages (module overview + material review)
- Track workspaces with per-module AI chats
- Chat summary save-to-MD (local storage for session memory)
- MD file editor within track documentation section
- Module and track progress bars (deliverable-based)

### Out of scope (post-MVP)

- Additional skill modules beyond the MVP module set
- Accountability nudges and progress notifications
- Team collaboration features
- Investor readiness simulation
- Integration with external tools (Notion, Linear, etc.)
- Real-time dashboard sync across devices

---

## Market Context

- 58% of founders cite fundraising as their #1 challenge — but the root cause is often pre-fundraising gaps (no validated customer, no clear narrative)
- 35% of startups are solo-founded, but only 17% receive VC — the structural gap is tooling and perspective, not capability
- 68% of founders find prospects easily; only 30% can convert them — customer clarity is the missing link
- Most founder tools are either too generic (AI chat) or too narrow (pitch deck builders) — nothing addresses the full early-stage journey with structured, memory-persistent intelligence

---

## The Pitch in One Line

> *"The operating system every founder wishes existed on day one — it knows where you are, tells you what to do next, and turns your thinking into something you can actually show an investor."*

---

## Open Questions

- What do we call this product?
- Which aesthetic / UX direction for the prototype?
- How does the roadmap visual render — timeline, cards, or swim lanes?
- What is the AI persona / voice — coach, co-founder, advisor?
- How are roadmap tracks defined — fixed taxonomy or dynamically generated?
- What constitutes "completion" for a module, and who defines the deliverables?

---

*Document updated from live brainstorm session · Founder OS Hackathon Build · Feb 2026*