# Typography Direction Comparison

A comprehensive single-family typography study rendered in the browser against the Onyx & Frost Blue (`#111111`) palette. 

The previous multi-font approach (Manrope + Inter + Geist Mono) has been rejected. The goal is a unified, precise, calm, and readable type system suitable for long operations work without looking like a generic SaaS clone.

## 1. DM Sans
**Impression:** Clean, geometric, and modern. Has a slightly wider stance which feels premium but can take up horizontal space in dense tables.
- **Heading Appearance:** Very elegant and modern.
- **Body & Numerals:** Rounded geometry makes numerals highly legible.
- **Table Density:** Slightly wide, might compress columns on 13" screens.

**Queue Page:**
![DM Sans Queue](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f1_queue.png)
**Case Page:**
![DM Sans Case](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f1_case.png)

---

## 2. Plus Jakarta Sans
**Impression:** Sharp, crisp, and incredibly clear at small sizes. Feels very distinct and operational.
- **Heading Appearance:** Strong, authoritative, but not overly heavy.
- **Body & Numerals:** Excellent x-height. Numerals are precise and easy to scan.
- **Table Density:** Highly readable even at `text-xs`.

**Queue Page:**
![Jakarta Queue](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f2_queue.png)
**Case Page:**
![Jakarta Case](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f2_case.png)

---

## 3. IBM Plex Sans
**Impression:** Highly technical, almost engineering-focused. Gives the platform a very serious, strict financial terminal feel.
- **Heading Appearance:** Utilitarian, less "premium marketing" and more "serious tool."
- **Body & Numerals:** Incredible tabular numerals. Very sharp punctuation.
- **Table Density:** Built specifically for complex UIs, excels here.

**Queue Page:**
![IBM Plex Queue](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f3_queue.png)
**Case Page:**
![IBM Plex Case](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f3_case.png)

---

## 4. Source Sans 3
**Impression:** A classic, highly readable UI font. Slightly more conservative.
- **Heading Appearance:** Restrained, perhaps a bit too generic compared to the others.
- **Body & Numerals:** Very legible, but lacks the "distinctive character" requested.
- **Table Density:** Good compactness.

**Queue Page:**
![Source Sans Queue](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f4_queue.png)
**Case Page:**
![Source Sans Case](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f4_case.png)

---

## 5. Public Sans
**Impression:** A strong, neutral interface font designed for complex data and government forms.
- **Heading Appearance:** Neutral and strong.
- **Body & Numerals:** Excellent legibility and neutral character structure.
- **Table Density:** Very balanced.

**Queue Page:**
![Public Sans Queue](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f5_queue.png)
**Case Page:**
![Public Sans Case](/Users/k.sathvik/.gemini/antigravity/brain/97c78bf4-5ca5-48c6-81cd-e75821d671fc/scratch/fonts/f5_case.png)

---

## Proposed System Structure

If **Plus Jakarta Sans** or **IBM Plex Sans** is selected, we can utilize `tabular-nums` natively and use a single type family for everything:

```css
:root {
  --font-family-primary: 'Plus Jakarta Sans', sans-serif;
  --font-family-identifier: 'Plus Jakarta Sans', sans-serif; /* with font-variant-numeric: tabular-nums */
  
  --font-size-display: 2.25rem;
  --font-size-page-title: 1.5rem;
  --font-size-section-title: 1.125rem;
  --font-size-body: 0.875rem; /* 14px */
  --font-size-label: 0.75rem; /* 12px */
  --font-size-caption: 0.625rem; /* 10px */
  --font-size-metric: 1.875rem;
  
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-display: 1.1;
  --line-height-heading: 1.25;
  --line-height-body: 1.5;
  
  --letter-spacing-display: -0.02em;
  --letter-spacing-heading: -0.01em;
}
```

No changes have been globally committed yet.
