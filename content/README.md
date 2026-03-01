# FounderOS Content (MD files)

These Markdown files are **loaded by the backend API** and can be filled in by your collaborator. The app calls the backend to fetch their contents (e.g. for AI context or roadmap logic).

## Layout

| Path | Purpose |
|------|--------|
| `Roadmap_Developer.md` | Logic/spec for building a personalised roadmap. Inputs: founder profile, goal, progress, uploaded assets. Outputs: (1) roadmap (track IDs, start/end), (2) material-to-track mapping. |
| `expert_mds/{trackId}/{moduleId}.md` | One file per module. AI uses this as **expert guidance** in that module’s chat. |

## Track and module IDs (used in API and frontend)

- **foundation:** `onboarding`
- **validation:** `market-research`, `competitor-scan`
- **strategy:** `pricing`, `gtm`
- **build:** `mvp-plan`
- **fundraise:** `pitch-deck`

## How to fill expert MDs

See **dev_ref/MODULE_EXPERT_TEMPLATE.md** for the required sections:

1. Module purpose  
2. Key concepts / framework  
3. Step-by-step guidance or prompts  
4. Deliverables (used for progress bars; optional: tag with estimated time, e.g. &lt;15 min)

## Workspace summaries (optional)

Saved chat summaries can be stored under:

- `workspace/{trackId}/{moduleId}_summary.md`

The backend serves these via `GET /api/workspace/:trackId/:moduleId/summary`. Create them when the app saves a session summary.
