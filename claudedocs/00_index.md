# LedgerLens • Claude Design Audit Context Suite

```text
directory_root: claudedocs/
total_files: 13
purpose: Persistent briefing context files for Claude UI/UX and product design audits
last_updated: 2026-08-31
```

---

## Quick Start: How to Run a Claude Audit Session

1. **Step 1 — Paste Role Prompt**:
   - Send [`01_frontier_role_prompt.md`](./01_frontier_role_prompt.md) to initialize Claude's persona as Senior Product Designer & UI/UX Design System Lead.
2. **Step 2 — Provide Supporting Context**:
   - Send [`04_design_md.md`](./04_design_md.md) (Full UI/UX Specification).
   - Send [`05_data_contracts.md`](./05_data_contracts.md) (Schemas, Field Math, 8 Exceptions).
   - Send [`06_component_inventory.md`](./06_component_inventory.md) (Frontend Structure & Routes).
   - Send [`08_product_vision_brief.md`](./08_product_vision_brief.md) (One-Page Vision & Journey).
   - Send [`11_user_stories.md`](./11_user_stories.md) & [`12_example_cases.md`](./12_example_cases.md) (Personas & Real Scenarios).
   - Send [`13_anti_patterns_gallery.md`](./13_anti_patterns_gallery.md) (Visual Rejections).
3. **Step 3 — Trigger Audit**:
   - Send [`02_final_audit_prompt.md`](./02_final_audit_prompt.md) to generate the structured Go/No-Go evaluation scorecard.

---

## Complete File Directory

| File Name | Description |
| :--- | :--- |
| [`01_frontier_role_prompt.md`](./01_frontier_role_prompt.md) | Claude role prompt, constraints, and product narrative. |
| [`02_final_audit_prompt.md`](./02_final_audit_prompt.md) | Go/No-Go audit task and scorecard template. |
| [`03_readme.md`](./03_readme.md) | Repo README with product architecture & trust boundary. |
| [`04_design_md.md`](./04_design_md.md) | Authoritative design tokens, component specs, and WCAG rules. |
| [`05_data_contracts.md`](./05_data_contracts.md) | Pydantic/TS schemas, mathematical formulas, and 8 exception scenarios. |
| [`06_component_inventory.md`](./06_component_inventory.md) | Mapping of all layouts, pages, components, and routes. |
| [`07_api_endpoint_map.md`](./07_api_endpoint_map.md) | Key HTTP endpoints with authentic request/response JSON payloads. |
| [`08_product_vision_brief.md`](./08_product_vision_brief.md) | One-page summary of the problem, solution, and 6-step journey. |
| [`09_references_taste_filters.md`](./09_references_taste_filters.md) | Curated list of design system, motion, and visual references. |
| [`10_claude_audit_history.md`](./10_claude_audit_history.md) | Historical log of all Claude audit sessions and decisions. |
| [`11_user_stories.md`](./11_user_stories.md) | Operator personas (Finance Ops Analyst & Compliance Auditor). |
| [`12_example_cases.md`](./12_example_cases.md) | Real multi-source transaction data patterns and root causes. |
| [`13_anti_patterns_gallery.md`](./13_anti_patterns_gallery.md) | Explicit visual and architectural anti-patterns rejected in LedgerLens. |
