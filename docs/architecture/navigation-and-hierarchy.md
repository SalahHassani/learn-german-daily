# Navigation & Learning Hierarchy

## Hierarchy
`CEFR Level -> Course -> Week -> Lesson`

The structural routing layer renders dynamic lists from lookup helpers rather than hardcoding fixed week or lesson counts per route.

## Global Chrome & Navigation
- **Header (`src/components/layout/site-header.tsx`):** Typographic wordmark, `Home` and `Levels` navigation links, active route styling, and a mobile drawer toggle supporting `Escape` dismissal and focus return.
- **Footer (`src/components/layout/site-footer.tsx`):** Wordmark, tagline, `Home` and `Levels` links, and copyright notice.
- **Breadcrumbs (`src/components/navigation/breadcrumb.tsx`):** Accessible `<nav aria-label="Breadcrumb">` trail with `<ol>` items, links on ancestor segments, and `aria-current="page"` on the current item.

## Data Boundary
`src/services/content/m2StructuralData.ts` supplies temporary structural navigation data for Milestone 2 only and will be superseded by the Milestone 3 content system.

