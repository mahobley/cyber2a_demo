# Metadata authoring guide

All lesson, dataset, and course content is sourced from the JSON files in this
folder. Each entity lives in its own file so that adding a new lesson only
requires dropping a single metadata file in the appropriate subdirectory.

```
metadata/
├── courses/    # Course / syllabus metadata, keyed by `id`
├── datasets/   # Datasets referenced by lessons
└── lessons/    # Lesson records that reference dataset + course ids
```

After editing or adding metadata, regenerate the compiled data that the UI
consumes:

```bash
node scripts/build-metadata.mjs
```

The builder assembles:

- `lessons-data.js` – the aggregated module imported by the front-end
- `metadata/manifest.json` – a lightweight manifest for tooling/tests

Both files are derived artifacts; do not edit them by hand.
