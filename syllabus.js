const syllabusList = document.getElementById('syllabus-list');
const titleEl = document.getElementById('syllabus-title');
const summaryEl = document.getElementById('syllabus-summary');

const queryParams = new URLSearchParams(window.location.search);
const courseParam = queryParams.get('course');
const requestedCourseId =
  courseParam || document.body?.dataset.courseId || null;
const DEFAULT_SUMMARY =
  'Follow the sequence below to explore the available lessons.';

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path} (${response.status})`);
  }
  return response.json();
}

async function loadManifest() {
  try {
    return await fetchJson('metadata/manifest.json');
  } catch (error) {
    console.warn('[syllabus] Unable to load manifest:', error);
    return null;
  }
}

async function loadCourse(courseId) {
  if (!courseId) return null;
  try {
    return await fetchJson(`metadata/courses/${courseId}.json`);
  } catch (error) {
    console.error(`[syllabus] Failed to load course ${courseId}:`, error);
    return null;
  }
}

async function loadLessons(lessonIds = []) {
  const uniqueIds = Array.from(new Set(lessonIds));
  const lessons = await Promise.all(
    uniqueIds.map(async (lessonId) => {
      try {
        const lesson = await fetchJson(`metadata/lessons/${lessonId}.json`);
        return {
          ...lesson,
          datasetIds: Array.isArray(lesson.datasetIds)
            ? lesson.datasetIds
            : [],
        };
      } catch (error) {
        console.error(`[syllabus] Failed to load lesson ${lessonId}:`, error);
        return null;
      }
    })
  );

  return lessons.filter(Boolean);
}

function renderError(message) {
  if (!syllabusList) return;
  syllabusList.innerHTML = '';
  const note = document.createElement('p');
  note.textContent = message;
  syllabusList.appendChild(note);
}

function applyCourseHeader(course) {
  if (titleEl && course?.title) {
    titleEl.textContent = course.title;
    document.title = course.title;
  }

  if (summaryEl) {
    if (course?.summary) {
      summaryEl.innerHTML = course.summary;
    } else {
      summaryEl.textContent = DEFAULT_SUMMARY;
    }
  }
}

function orderLessonsBySequence(lessons) {
  if (!lessons.length) return lessons;

  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const ordered = [];
  const visited = new Set();

  let current =
    lessons.find(
      (lesson) =>
        !lesson.navigation?.previous ||
        !byId.has(lesson.navigation.previous)
    ) ?? lessons[0];

  while (current && !visited.has(current.id)) {
    ordered.push(current);
    visited.add(current.id);
    const nextId = current.navigation?.next;
    current = nextId ? byId.get(nextId) : null;
  }

  lessons
    .filter((lesson) => !visited.has(lesson.id))
    .sort((a, b) => a.title.localeCompare(b.title))
    .forEach((lesson) => ordered.push(lesson));

  return ordered;
}

function createMetaPill(label, value) {
  const pill = document.createElement('span');
  pill.className = 'syllabus-pill';

  const strong = document.createElement('strong');
  strong.textContent = `${label}:`;

  pill.append(strong, document.createTextNode(` ${value}`));
  return pill;
}

function renderLessons(lessons) {
  if (!syllabusList) return;

  syllabusList.innerHTML = '';

  if (!lessons.length) {
    renderError('There are no lessons linked to this course metadata yet.');
    return;
  }

  const orderedLessons = orderLessonsBySequence(lessons);

  orderedLessons.forEach((lesson, index) => {
    const item = document.createElement('li');
    item.className = 'syllabus-item';

    const link = document.createElement('a');
    link.className = 'syllabus-link';
    link.href = lesson.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    const step = document.createElement('span');
    step.className = 'syllabus-step';
    step.textContent = `${lesson.length ?? 'Module'} ${index + 1}`;

    const title = document.createElement('h3');
    title.textContent = lesson.title;

    const description = document.createElement('p');
    description.textContent = lesson.description ?? 'No description supplied yet.';

    const styles = Array.isArray(lesson.styles) ? lesson.styles : [];
    const audiences = Array.isArray(lesson.audience) ? lesson.audience : [];
    const datasetIds = Array.isArray(lesson.datasetIds) ? lesson.datasetIds : [];

    const meta = document.createElement('div');
    meta.className = 'syllabus-meta';
    meta.append(
      createMetaPill('Styles', styles.join(' • ') || 'Not specified'),
      createMetaPill('Audience', audiences.join(' • ') || 'Not specified'),
      createMetaPill(
        'Datasets',
        datasetIds.length ? `${datasetIds.length} available` : 'Not supplied'
      )
    );

    link.append(step, title, description, meta);
    item.appendChild(link);
    syllabusList.appendChild(item);
  });
}

async function init() {
  if (!syllabusList) return;

  const manifest = await loadManifest();
  const fallbackCourseId = manifest?.courses?.[0] ?? null;
  const courseId = requestedCourseId || fallbackCourseId;

  if (!courseId) {
    renderError('No course metadata available yet. Add a course JSON file to get started.');
    return;
  }

  const course = await loadCourse(courseId);

  if (!course) {
    renderError('Unable to load the requested course metadata.');
    return;
  }

  applyCourseHeader(course);

  const lessonIds = Array.isArray(course.lessonIds) ? course.lessonIds : [];
  const lessons = await loadLessons(lessonIds);
  renderLessons(lessons);
}

init();
