# LedgerLens — Anti-Patterns Gallery & Prohibited Implementations

```text
purpose: Visual and architectural guide on what is strictly prohibited in LedgerLens
last_updated: 2026-08-31
```

---

## 1. Prohibited: Payment Gateway Dashboard Clones
- **Visual Tropes**: Colorful circular payment-method donuts, rounded cards with heavy shadows, merchant onboarding wizard steps, and consumer billing promotion banners.
- **Why It Fails**: LedgerLens is not a payment gateway or billing tool. It is an **industrial reconciliation control room** built for operators investigating financial discrepancies.

---

## 2. Prohibited: Generic "AI Copilot" Chat Interfaces
- **Visual Tropes**: Floating chatbot floating-action buttons, chat message bubbles with user/AI avatars, conversational prompt inputs ("Ask me anything about your finances"), and autonomous "Auto-Approve with AI" buttons.
- **Why It Fails**: Conversational AI is non-deterministic, non-reproducible, and incompatible with financial audit standards. AI in LedgerLens is strictly a **read-only policy assistant** that cites contractual markdown clauses with pgvector similarity scores. AI never touches the approval button.

---

## 3. Prohibited: Decorative SaaS Dashboard Tropes
- **Visual Tropes**: Glowing neon gradients, glassmorphism blur backgrounds, floating card hover physics, and oversized KPI walls that occupy 70% of the viewport.
- **Why It Fails**: Decorative elements degrade contrast, distract operators under prolonged shift work, and push the actionable Exception Queue below the fold.

---

## 4. Prohibited: Multi-Level Evidence Tab Navigation
- **Visual Tropes**: Hiding Payment, Settlement, and Bank Credit details inside separate tabbed sub-views (e.g. `[Tab 1: Payment]` | `[Tab 2: Settlement]` | `[Tab 3: Bank]`).
- **Why It Fails**: Triaging financial anomalies requires simultaneous side-by-side comparison across all 4 sources. Operators cannot cross-reference numbers if they must click tabs back and forth.
