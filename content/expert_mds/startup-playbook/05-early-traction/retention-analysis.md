# Retention Analysis
**Phase:** 5 — Early Traction | **Module:** 3 of 4

---

## Purpose

Determines whether users are getting enough value to come back. Retention is the most honest signal of product-market fit. Acquisition without retention is a leaky bucket — no amount of marketing fixes it.

**Use when:**
- You have 2-4 weeks of user data after your MVP launch
- You're considering investing in acquisition and want to know if retention justifies it
- You're unsure whether you have product-market fit yet

---

## Frameworks & Tools

**Retention Curve Analysis**
Plot the % of users still active at Day 1, Day 7, Day 14, and Day 30 after signup. The shape of the curve tells you everything:
- *Curve hits zero:* No retention. Core value isn't landing. Don't acquire more users yet.
- *Curve flattens above zero:* A cohort of users is sticking. This is the signal. Focus on expanding that cohort.
- *Curve flattens higher over time:* Your product is improving. Keep going.

Tools: Mixpanel, Amplitude, PostHog. Or a manual spreadsheet if you have fewer than 100 users.

**Cohort Analysis**
Group users by their signup week or month. Track retention separately for each cohort. This separates improvement signal from noise — if newer cohorts retain better than older ones, your product is getting better. If retention is flat or declining across cohorts, the problem isn't your marketing or onboarding — it's the core product.

**Churn Interviews**
When users stop using the product, contact them directly. This is the most underused and highest-signal activity in early traction. Ask: *"When did you last use it? What changed? What would have made you stay?"* Don't defend the product — listen. The top 3 reasons for churn, heard across 10 conversations, will tell you more than any dashboard.

**Retention Benchmarks by Category**
- Consumer apps: Day 30 retention of 20%+ is a strong signal
- B2B SaaS: Day 30 retention of 40%+ is a strong signal
- Weekly-use tools: Week 8 retention of 30%+ is meaningful

These are directional, not gospel. What matters most is whether your curve flattens and whether it improves over time.

**The Engagement Depth Check**
Active doesn't always mean engaged. Look beyond "logged in" to: sessions per user per week, core feature usage rate, and breadth of features used. Power users who use the core feature heavily are more valuable than passive users who log in but don't act.
