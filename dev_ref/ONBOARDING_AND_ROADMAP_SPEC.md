# FounderOS — Onboarding & Roadmap Spec

> Exact intake flow and how it feeds roadmap generation and material sorting. Ensures onboarding and Roadmap Developer stay in sync.

---

## Intake Questions (Onboarding)

The conversational onboarding must collect the following. Order and phrasing can be adapted; the **structured founder profile** must include:

| Question / area | Purpose | Stored as |
|-----------------|---------|-----------|
| **Who are you?** | Background, role, experience | e.g. `identity` / `background` |
| **What problem are you solving?** | Core pain point and market context | e.g. `problem` |
| **What's your solution?** | Current idea or product direction | e.g. `solution` |
| **What's your goal?** | e.g. ship MVP, secure pre-seed, find co-founder | e.g. `goal` |
| **What progress have you made?** | Materials, decks, prototypes, prior research — **collected via upload here** | e.g. `progress` + uploaded assets |
| **What are you good at?** | Skills and strengths the founder brings | e.g. `strengths` |
| **Where do you need help?** | Specific gaps (marketing, coding, fundraising, legal, etc.) | e.g. `gaps` |

After collection, the system has:

- A **founder profile** (all answers above as a structured object).
- A **list of uploaded assets** (files and/or text) provided when answering “What progress have you made?” (and optionally elsewhere).

---

## Uploads

- **When:** During onboarding, especially for “What progress have you made?” — materials, decks, prototypes, prior research.
- **What:** Files (e.g. PDF, DOC, MD, images) and/or pasted text.
- **How passed to Roadmap Developer:** For each asset: identifier (e.g. filename or ID), optional short summary or extracted text. The Roadmap Developer uses these to (1) infer progress and (2) assign each asset to one or more tracks (and optionally modules). See [ROADMAP_AND_TRACKS.md](ROADMAP_AND_TRACKS.md) and [founder-os-modules.html](../archive/founder-os-modules.html) for track/module taxonomy.
- **Storage:** Upload refs (e.g. base64, blob URL, or path) stored with the founder profile or in a dedicated “uploads” store; material-to-track mapping stored as part of roadmap output.

---

## Roadmap Developer Contract

**Role:** Evaluate the founder’s situation and produce a personalised roadmap and material-to-track mapping.

### Inputs

- **Founder profile:** All intake answers (identity, problem, solution, goal, progress, strengths, gaps).
- **List of uploaded assets:** Each with identifier and optional summary/text.

### Outputs

1. **Personalised roadmap**
   - **Which tracks** the founder should focus on (subset of the fixed 7, in order), or the full 7 with emphasis.
   - **Start index / position** — where the founder should start (based on progress).
   - **End index / position** — where the roadmap ends (based on goal).
   - **Tracks are customised to contain only the necessary modules** for that founder (see [founder-os-modules.html](../archive/founder-os-modules.html) for full module set). The Roadmap Developer can omit modules that are not relevant to the founder’s goal or progress.
   - Dependencies: the AI should analyse the full roadmap and **highlight processes that are dependencies** and **prioritise them** (e.g. recommend starting at an earlier track if foundational work is missing).

2. **Material-to-track mapping**
   - For each uploaded asset: which **track ID(s)** it belongs to (and optionally **module ID(s)**).
   - **One asset can map to multiple tracks** (e.g. a pitch deck might belong in “Funding & Storytelling” and “Product Definition”). Show the same asset in each relevant track’s landing page; do not split or duplicate the file. Used to surface “sorted materials” on Track Landing Pages.

### Implementation note

Prefer a **hybrid** approach:

- **Deterministic** for start/end position: derive from goal + progress (e.g. goal “ship MVP” → end at Product Definition or MVP Build; progress “have problem statement” → start after Problem Definition).
- **LLM** for material sorting (which asset → which track(s)) and for dependency hints when generating the initial roadmap.

The Roadmap Developer can be implemented as a prompt + LLM call that takes the founder profile + asset list and returns structured JSON (roadmap + mapping), with start/end optionally overridden or computed by rules.

Schema for the output should be agreed in code (e.g. `roadmap: { trackIds: string[], startIndex: number, endIndex: number }`, `materialToTrack: { assetId: string, trackIds: string[] }[]` — note `trackIds` is an array so one asset can appear in multiple tracks).

---

## Dashboard State After Onboarding

- **Roadmap visual:** Reflects the personalised roadmap (which tracks, start/end). Only the necessary modules per track need to be shown (customised per founder).
- **Track landing pages:** When the founder opens a track, show:
  - The key modules for that track (as determined by the roadmap).
  - **Materials already sorted into this track** (from the material-to-track mapping). The same asset may appear in more than one track if it was mapped to multiple track IDs.
  - Option to upload additional files or text for that track.

This keeps onboarding, Roadmap Developer, and the dashboard/track UIs aligned on the same data structures and behaviour.
