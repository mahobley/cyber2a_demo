import { lessonMetadata } from './lessons-data.js';

const targetSyllabus = 'Earth Systems Analytics Syllabus 2024';
const syllabusList = document.getElementById('syllabus-list');

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

function renderSyllabus() {
  if (!syllabusList) return;

  const lessonsForSyllabus = lessonMetadata.filter(
    (lesson) => lesson.syllabus === targetSyllabus
  );

  if (!lessonsForSyllabus.length) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent =
      'There are no lessons linked to this syllabus yet.';
    syllabusList.appendChild(emptyMessage);
    return;
  }

  const orderedLessons = orderLessonsBySequence(lessonsForSyllabus);

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
    description.textContent = lesson.description;

    const meta = document.createElement('div');
    meta.className = 'syllabus-meta';
    meta.append(
      createMetaPill('Styles', lesson.styles.join(' • ')),
      createMetaPill('Audience', lesson.audience.join(' • ')),
      createMetaPill(
        'Datasets',
        lesson.datasets.length
          ? `${lesson.datasets.length} available`
          : 'Not supplied'
      )
    );

    link.append(step, title, description, meta);
    item.appendChild(link);
    syllabusList.appendChild(item);
  });
}

renderSyllabus();
