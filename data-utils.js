import { lessonMetadata } from './lessons-data.js';

export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildDatasetIndex() {
  const datasetMap = new Map();

  lessonMetadata.forEach((lesson) => {
    (lesson.datasets || []).forEach((dataset) => {
      const key = dataset.id ?? dataset.name;
      if (!datasetMap.has(key)) {
        datasetMap.set(key, {
          ...dataset,
          lessons: [],
        });
      }

      datasetMap.get(key).lessons.push({
        id: lesson.id,
        title: lesson.title,
        link: lesson.link,
        syllabus: lesson.syllabus,
        length: lesson.length,
        audience: lesson.audience,
      });
    });
  });

  return Array.from(datasetMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function buildSyllabusIndex() {
  const syllabusMap = new Map();

  lessonMetadata.forEach((lesson) => {
    const key = lesson.syllabus ?? 'Unassigned Syllabus';

    if (!syllabusMap.has(key)) {
      syllabusMap.set(key, {
        id: slugify(key),
        title: key,
        lessons: [],
        authors: new Set(),
        institutions: new Set(),
        audiences: new Set(),
        styles: new Set(),
        lengths: new Set(),
        datasetNames: new Set(),
      });
    }

    const entry = syllabusMap.get(key);

    entry.lessons.push({
      id: lesson.id,
      title: lesson.title,
      link: lesson.link,
      length: lesson.length,
      styles: lesson.styles,
    });

    (lesson.authors || []).forEach((author) => {
      entry.authors.add(author.name);
      if (author.institution) entry.institutions.add(author.institution);
    });

    (lesson.audience || []).forEach((aud) => entry.audiences.add(aud));
    (lesson.styles || []).forEach((style) => entry.styles.add(style));
    if (lesson.length) entry.lengths.add(lesson.length);
    (lesson.datasets || []).forEach((dataset) =>
      entry.datasetNames.add(dataset.name)
    );
  });

  return Array.from(syllabusMap.values())
    .map((entry) => ({
      ...entry,
      authors: Array.from(entry.authors).sort((a, b) => a.localeCompare(b)),
      institutions: Array.from(entry.institutions).sort((a, b) =>
        a.localeCompare(b)
      ),
      audiences: Array.from(entry.audiences).sort((a, b) =>
        a.localeCompare(b)
      ),
      styles: Array.from(entry.styles).sort((a, b) => a.localeCompare(b)),
      lengths: Array.from(entry.lengths).sort((a, b) => a.localeCompare(b)),
      datasetNames: Array.from(entry.datasetNames).sort((a, b) =>
        a.localeCompare(b)
      ),
      lessonCount: entry.lessons.length,
      datasetCount: entry.datasetNames.size,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function buildLabIndex() {
  return lessonMetadata
    .filter((lesson) => (lesson.styles || []).includes('Lab'))
    .map((lesson) => ({
      ...lesson,
      datasetCount: (lesson.datasets || []).length,
      dataTypeSummary: dedupeArray(
        (lesson.datasets || []).flatMap((dataset) => dataset.dataTypes || [])
      ),
      topicsSummary: dedupeArray(
        (lesson.datasets || []).flatMap((dataset) => dataset.topics || [])
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function buildLessonIndex() {
  return lessonMetadata
    .map((lesson) => ({
      ...lesson,
      datasetCount: (lesson.datasets || []).length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

function dedupeArray(values = []) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

