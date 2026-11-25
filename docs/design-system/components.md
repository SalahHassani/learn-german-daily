# Reusable UI Components

All primitives live in `src/components/ui/` and read centralized tokens from `src/app/globals.css`. None hardcode CEFR levels, courses, weeks, or lessons.

- **Button (`src/components/ui/button.tsx`):** `primary`, `secondary`, `outline`, `text`, and `disabled` states with `focus-visible` outlines.
- **Card (`src/components/ui/card.tsx`):** `standard`, `secondary`, and `elevated` surfaces with optional `interactive` hover state.
- **Form Fields (`src/components/ui/form-field.tsx`):** `FieldLabel`, `FieldHelper`, `FieldError`, `Input`, `Textarea`, and `Select` supporting normal, hover, focus, error, and disabled states.
- **Badge, StatusIndicator & Divider (`badge.tsx`, `divider.tsx`):** Pair labels with color tokens so status is never communicated by color alone.