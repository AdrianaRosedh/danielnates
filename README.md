# Daniel Nates — Journal

This repository contains the source code for **danielnates.com** —  
an authored, editorial journal presenting the work, thinking, and projects of chef **Daniel Nates**.

The site is designed as a **scroll-based narrative** rather than a traditional website.  
It prioritizes reading, pacing, and authorship over UI conventions.

---

## Concept

The journal presents Daniel’s work in first person, structured as a continuous document:

- A central authored statement
- Project chapters (Olivea, Fritanguita, Maizal)
- Field Notes as a living archive
- Expanded chapter pages for SEO and deeper context

The design draws inspiration from contemporary editorial and studio sites, emphasizing:
- restraint
- typographic authority
- subtle motion
- content-first composition

---

## Stack

### Web
- **Astro** (static-first, minimal client JS)
- Custom CSS for editorial layout and motion
- Scroll-based narrative structure
- Deployed on **Vercel**

### CMS
- **Sanity Studio**
- Custom schemas for:
  - Daniel (singleton)
  - Projects
  - Chapter blocks
  - Field Notes
- First-person content authored directly in Studio

---

## Project Structure

```text
/
├─ web/        # Astro frontend
│  ├─ src/
│  ├─ public/
│  └─ package.json
│
├─ studio/     # Sanity Studio
│  ├─ schemas/
│  ├─ sanity.config.ts
│  └─ package.json
│
└─ README.md