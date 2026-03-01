# FounderOS — Roadmap & Tracks

> Canonical roadmap structure. Roadmap Developer and dashboard/track UIs must use this as the single source of truth for track and module IDs/names.

---

## Rule

- **Track order is fixed** (see below). The roadmap structure does not change.
- **No module locking** — the founder is free to work on **any module in any order**. The next module is never gated on completing the current one.
- Only variables: **where the roadmap starts** (based on progress) and **where it ends** (based on goal). Tracks can be customised to contain only the **necessary modules** for that founder (see [founder-os-modules.html](../archive/founder-os-modules.html) for full module set).

### Priority agent (in-app guidance)

A separate **priority agent** (not the Roadmap Developer) reads the founder’s **current progress** and surfaces recommendations. This is the only “what to do next” guidance; it does not lock the founder into a sequence.

- **Dependency priority** — Highlight tasks that are **highest priority due to dependencies**: other tasks or modules down the line require their completion. The agent analyzes the roadmap and progress to suggest “do this first because X depends on it.”
- **Quick wins** — Highlight tasks that take **&lt;15 minutes** to complete. Small wins help the founder build momentum; the app should surface these so they can be picked when the founder has a short block of time.

Expert MDs can support this by optionally tagging deliverables with an estimated time (e.g. “&lt;15 min”) where relevant; see [MODULE_EXPERT_TEMPLATE.md](MODULE_EXPERT_TEMPLATE.md).

---

## Tracks (Fixed Order)

### Track 1 — Foundation & Problem  
**Stage:** Pre-idea → Idea  
**Modules (6):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| Founder–Market Fit | Why you, why this, why now — self-assessment | ✓ |
| Problem Definition | Crisp problem statement + who has it + how acutely | ✓ |
| Customer Intelligence | ICP, JTBD, pain point map, customer profile | ✓ |
| Market Sizing | TAM / SAM / SOM with sourced assumptions | |
| Competitive Landscape | Positioning map, differentiation thesis, moat hypothesis | |
| Assumption Mapping | Riskiest assumptions ranked by impact + invalidation plan | |

---

### Track 2 — Customer Validation  
**Stage:** Idea → Validation  
**Modules (5):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| Discovery Interview Guide | Script, question bank, synthesis framework | ✓ |
| Interview Synthesis | Pattern extraction, signal vs. noise filter, insight summary | |
| Willingness to Pay Test | Pricing conversation scripts, signal thresholds | |
| Demand Signal Design | Landing page test, waitlist, pre-order, LOI playbook | |
| Pivot or Persevere Decision | Structured framework for reading validation signals | |

---

### Track 3 — Product Definition  
**Stage:** Validation → Build  
**Modules (6):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| MVP Scoping | Build / don't build decisions, success criteria, scope lock | ✓ |
| Value Proposition | One-liner, positioning statement, tagline variants | |
| User Story Mapping | Core user journeys, feature-to-outcome mapping | |
| Product Roadmap (0→1) | Phase 0 (MVP) → Phase 1 milestones, prioritisation logic | |
| Success Metrics Definition | North Star metric, leading indicators, measurement plan | |
| Build vs. Buy vs. Partner | Tech/tooling decision framework for early teams | |

---

### Track 4 — MVP Build Process  
**Stage:** Build → Launch  
**Modules (6):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| Tech Stack Selection | Stack decision guide based on team skills + speed requirements | |
| No-Code / Low-Code MVP | Tool selection, workflow design, when to use vs. build | |
| Sprint Planning (0→1) | 2-week sprint structure, task breakdown, definition of done | |
| Design & Prototype | Wireframing, user testing loop, design handoff checklist | |
| Beta User Recruitment | Finding, qualifying, and onboarding your first 10–50 users | |
| Launch Readiness Checklist | Pre-launch gate: product, legal, GTM, support minimums | |

---

### Track 5 — GTM & Revenue  
**Stage:** Early Traction → Growth  
**Modules (7):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| GTM Strategy | Channel selection, sequencing logic, first 100 customers plan | |
| Pricing Model | Model selection (usage / seat / flat), anchoring, packaging | |
| Early Sales Playbook | Outreach scripts, demo structure, objection handling | |
| Content & Community Strategy | Organic channel plan, distribution channels, ICP-matched content | |
| Referral & Partnership | Partner ICP, co-marketing playbook, referral incentive design | |
| Customer Onboarding & Retention | First-30-days experience, activation milestones, churn signals | |
| Growth Loops Mapping | Identify viral, paid, content, and product loops available to you | |

---

### Track 6 — Funding & Storytelling  
**Stage:** Any stage  
**Modules (6):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| Funding Strategy | Bootstrap vs. raise decision, round sizing, dilution model | |
| Pitch Narrative Builder | Story arc, slide structure, narrative flow | |
| Pitch Deck | Investor-ready deck with critique + iteration loop | |
| Investor Targeting | Tiered investor list, thesis matching, warm intro map | |
| Due Diligence Prep | Data room checklist, Q&A prep, red flag audit | |
| Term Sheet Literacy | Key terms decoded: valuation, pro-rata, board, liquidation | |

---

### Track 7 — Team, Legal & Ops  
**Stage:** Parallel track  
**Modules (6):**

| Module | Output / description | MVP-priority |
|--------|----------------------|--------------|
| Co-founder Agreement | Equity split, roles, vesting schedule, decision rights | |
| Company Formation | Entity type, jurisdiction, cap table setup, IP assignment | |
| First Hire Playbook | When to hire, role scoping, offer structure, equity for employees | |
| Financial Model | 18-month projection, unit economics, burn & runway calc | |
| OKR & Goal Setting | 90-day focus areas, weekly cadence, accountability loop | |
| Investor Reporting | Monthly update template, metrics dashboard, narrative framing | |

---

## MVP-Priority Modules (for hackathon)

Ship with these first; expand to more modules as time allows:

- **Track 1:** Founder–Market Fit, Problem Definition, Customer Intelligence  
- **Track 2:** Discovery Interview Guide  
- **Track 3:** MVP Scoping  

---

## IDs and naming

- Use consistent **track IDs** (e.g. `foundation`, `validation`, `product_definition`, `mvp_build`, `gtm`, `funding`, `team_legal_ops`) or numeric (1–7) in code and Roadmap Developer output.
- Use consistent **module IDs** (e.g. slug of module name) so expert MDs and progress state can be keyed correctly.
