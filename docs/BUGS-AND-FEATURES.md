# Bugs and features checklist

## Done / to verify

- [ ] **Landing checkpoint**: Progress line is above the text and textbox; dots and line are white with glow (not green).
- [ ] **Docs vs context**: Output documentation appears under Docs library; .md from "Generate MD Context File" appears under Track context files.
- [ ] **Docs library**: Each document has Download and Open (open in new tab).
- [ ] **Upload**: "+ Upload" in Docs library and "+ Upload" in Track Memory open file picker and add file to the correct list; data persists.
- [ ] **Profile**: Profile page exists; avatar (or nav) links to it.
- [ ] **Roadmap**: Dashboard shows all 6 tracks (Ideation → GTM) and matches README.
- [ ] **Localhost**: `npm install && npm run dev` runs the app; storage persists (localStorage polyfill).

## Acceptance

- Checkpoint: Visual only — line above card, white glow.
- Docs library: Download saves .md file; Open opens content in new tab.
- Track context: Generate MD adds to "Track context files", not Docs library.
- Upload: Click triggers file input; after select, item appears in list and survives refresh.
- Profile: Clicking avatar goes to profile page; page renders without error.
