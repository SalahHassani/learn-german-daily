# Content Import & Publishing System (M9)

## 1. Content Package Specification & JSON Format

Packages use a versioned JSON envelope (`formatVersion: "1.0.0"`) supporting the full curriculum hierarchy and educational content entities:

`CEFR Level → Course → Week → Lesson → Lesson Sections → Content Blocks`

### Top-Level Structure

* `formatVersion`: `"1.0.0"`
* `packageId`: Stable package identifier string
* `metadata`: Package title, description, source, tags, and creation metadata
* `publishing`: Optional directive (`mode`: `"import_only" | "publish_explicit"`, `allowPublishedUpdate?: boolean`, `reviewedBy?: string`)
* `levels`: CEFR level entries (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`) with `code`, `title`, `order`, and `status` (`"draft" | "coming_soon" | "published"`)
* `courses`: Course hierarchy containing `weeks → lessons → sections → blocks` with stable `id` and `slug` fields and per-entity `status`
* `entities`: Optional collections for `vocabulary`, `verbs`, `grammar`, `readings`, and `exercises` (with `questions` and answer keys/accepted answers)

### Synthetic Package Example

```json
{
  "formatVersion": "1.0.0",
  "packageId": "pkg-synthetic-a1-sample",
  "metadata": {
    "title": "Synthetic Curriculum Fixture",
    "source": "internal-fixture"
  },
  "publishing": {
    "mode": "import_only",
    "allowPublishedUpdate": false
  },
  "levels": [
    { "code": "A1", "title": "Level A1", "order": 1, "status": "published" },
    { "code": "A2", "title": "Level A2", "order": 2, "status": "coming_soon" }
  ],
  "entities": {
    "vocabulary": [
      {
        "id": "vocab-sample-1",
        "slug": "vocab-sample-1",
        "language": "de",
        "term": "FixtureTerm",
        "translation": "Fixture Translation",
        "status": "draft"
      }
    ]
  },
  "courses": [
    {
      "id": "course-sample-1",
      "slug": "course-sample-1",
      "title": "Sample Course",
      "levelCode": "A1",
      "order": 1,
      "status": "published",
      "weeks": []
    }
  ]
}

