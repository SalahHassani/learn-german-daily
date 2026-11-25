# Navigation & Learning Hierarchy

## Hierarchy
`CEFR Level -> Course -> Week -> Lesson` (with `Lesson Sections -> Content Blocks` in the content model)

Dynamic routes read from `contentService` (`src/services/content/contentService.ts`) rather than hardcoding counts or creating separate folders per week or day.

## Global Chrome & Navigation
- **Header (`src/components/layout/site-header.tsx`):** Typographic wordmark, `Home` and `Levels` navigation links, active route styling, and a mobile drawer toggle supporting `Escape` dismissal and focus return.
- **Footer (`src/components/layout/site-footer.tsx`):** Wordmark, tagline, `Home` and `Levels` links, and copyright notice.
- **Breadcrumbs (`src/components/navigation/breadcrumb.tsx`):** Accessible `<nav aria-label="Breadcrumb">` trail with `<ol>` items, links on ancestor segments, and `aria-current="page"` on the current item.

## Data Boundary
`src/services/content/contentProvider.ts` and `src/services/content/contentService.ts` back all hierarchy and lesson queries from `localContentData.ts` in Milestone 3, replacing the temporary `m2StructuralData.ts` file and allowing a future API or database provider to plug in cleanly.

