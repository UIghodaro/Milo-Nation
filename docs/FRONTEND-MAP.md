# FounderOS frontend map

## Modular layout (after split)

- **src/constants.js** — C, F, TRACKS, TASK_TAGS, SK  
- **src/storage.js** — sGet, sSet  
- **src/ai.js** — callAI, mockChat  
- **src/components/** — Logo, Toast, useToast, Styles, NavBar, Badge, Progress, Dots, Spinner, Modal, ProgressPie  
- **src/main.jsx** — entry; polyfills window.storage, mounts App  
- **founder-os.jsx** — OnboardingPage, DashboardPage, TrackSetupPage, TrackDashboardPage, ModuleChatPage, NetworkPage, ProfilePage, App (state, routing, load/save)

## founder-os.jsx (pages + App only)

- **OnboardingPage**: first block after imports  
- **DashboardPage**, **TrackSetupPage**, **TrackDashboardPage**, **ModuleChatPage**, **NetworkPage**, **ProfilePage**, **App**: sequential  

## Storage keys → state

| Key | App state | Notes |
|-----|------------|--------|
| SK.onboarded | — | gates onboarding |
| SK.context | context | startup context object |
| SK.contextMD | contextMD | startup context markdown |
| SK.trackOrder | trackOrder | ordered track ids |
| SK.trackSetup | trackSetup | { trackId: true } |
| SK.trackModules | trackModulesSelected | { trackId: moduleIds[] } |
| SK.trackProgress | moduleProgress | { moduleId: { status, pct } } |
| SK.trackDocs | trackDocsData | { trackId: doc[] } |
| SK.trackContextMDs | trackContextMDsData | { trackId: md[] } |
| SK.trackMemory | trackMemoryData | { trackId: file[] } |
| SK.notes | allNotes | notes[] |
| SK.kanban | kanban | { columns } |
