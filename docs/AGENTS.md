# FounderOS — Agent context

High-level structure for multi-agent development.

## Pages & routes

| Page ID | Component | When shown |
|--------|-----------|------------|
| `loading` | — | Initial load, reading storage |
| `onboarding` | OnboardingPage | User not onboarded |
| `dashboard` | DashboardPage | Main roadmap view (6 tracks, kanban, notes) |
| `track-setup` | TrackSetupPage | First time entering a track |
| `track-dashboard` | TrackDashboardPage | Per-track view (docs library, context files, memory) |
| `module-chat` | ModuleChatPage | Chat + outputs for one module |
| `network` | NetworkPage | Founders / investors list |
| `profile` | ProfilePage | User profile (avatar link) |

Navigation: `go("dashboard")`, `go("network")`, `go("profile")`, `go("track-<trackId>")`. Module: `goModule(moduleId)` from track dashboard.

## Data flow

- **Storage keys** (see `SK` in constants): `onboarded`, `context`, `contextMD`, `trackOrder`, `trackSetup`, `trackModules`, `trackDocs`, `trackContextMDs`, `trackMemory`, `trackProgress`, `kanban`, `notes`.
- **Docs library** (`trackDocs`): plan/build outputs and uploaded docs; keyed by `trackId` in `trackDocsData`.
- **Track context files** (`trackContextMDs`): generated .md context (e.g. "Generate MD Context File"); keyed by `trackId` in `trackContextMDsData`. Shown in "Track context files" section; global startup context is merged in for display.
- **Track memory**: uploaded files per track; keyed by `trackId` in `trackMemoryData`.

## Bug/feature locations (monolithic file)

- **Landing checkpoint**: OnboardingPage — progress dots + line; move above form card; style white + glow (not green).
- **Docs vs context**: generateContextMD in ModuleChatPage → save to track context MDs; saveOutputToTrack → docs library only. App: load/save `trackContextMDsData`, pass to TrackDashboardPage and ModuleChatPage.
- **Download/Open docs**: TrackDashboardPage, docs library row — add Download (blob) and Open (new tab).
- **Upload**: TrackDashboardPage — Docs library "+ Upload" and Track Memory "+ Upload"; file input, append to trackDocs / trackMemory, persist. App: trackMemoryData state + load/save.
- **Profile**: New ProfilePage; `go("profile")`; nav (avatar or link) to profile.

## Module taxonomy

6 tracks (see README): Ideation, Validation, MVP/Build, Business Model, Early Traction, GTM. Each track has modules; `TRACKS` and `trackOrder` define order.
