import { lessonMetadata } from './lessons-data.js';

const lessonById = new Map(
  lessonMetadata.map((lesson) => [lesson.id, lesson])
);

const lessonsContainer = document.getElementById('lessons');
const template = document.getElementById('lesson-card-template');

function renderLessons() {
  if (!lessonsContainer || !template) return;

  lessonMetadata.forEach((lesson) => {
    const fragment = template.content.cloneNode(true);
    const tagContainer = fragment.querySelector('.lesson-tags');
    const titleEl = fragment.querySelector('.lesson-title');
    const descriptionEl = fragment.querySelector('.lesson-description');
    const authorsEl = fragment.querySelector('.lesson-authors');
    const syllabusEl = fragment.querySelector('.lesson-syllabus');
    const linkEl = fragment.querySelector('.lesson-link');
    const datasetsEl = fragment.querySelector('.lesson-datasets');
    const sequenceEl = fragment.querySelector('.lesson-sequence');
    const metaList = fragment.querySelector('.lesson-meta');

    if (titleEl) titleEl.textContent = lesson.title;
    if (descriptionEl) descriptionEl.textContent = lesson.description;
    if (authorsEl) authorsEl.textContent = formatAuthors(lesson.authors);
    if (syllabusEl) syllabusEl.textContent = lesson.syllabus;
    if (linkEl)
      linkEl.appendChild(createAnchor(lesson.link, 'View lesson', 'link-pill'));
    if (datasetsEl) datasetsEl.appendChild(renderDatasets(lesson.datasets));
    if (sequenceEl) sequenceEl.appendChild(renderSequence(lesson.navigation));

    if (metaList && typeof lesson.taughtCount === 'number') {
      appendMetaRow(metaList, 'Teaching History', formatTaughtCount(lesson.taughtCount));
    }

    if (metaList && Array.isArray(lesson.modifiedBy) && lesson.modifiedBy.length) {
      const modifications = createModificationContent(lesson.modifiedBy);
      appendMetaRow(metaList, 'Modified Variants', modifications);
    }

    if (metaList && lesson.adaptedFrom) {
      const adaptedContent = createAdaptedContent(lesson.adaptedFrom);
      appendMetaRow(metaList, 'Adaptation', adaptedContent);
    }

    appendTagBubbles(tagContainer, lesson);

    lessonsContainer.appendChild(fragment);
  });
}

function appendTagBubbles(container, lesson) {
  if (!container) return;

  const tags = [
    ...lesson.styles.map((label) => ({ label, type: 'style' })),
    ...lesson.audience.map((label) => ({ label, type: 'audience' })),
    { label: lesson.length, type: 'length' },
  ];

  tags.forEach((tag) => {
    const span = document.createElement('span');
    span.className = `tag ${tag.type}`;
    span.textContent = tag.label;
    container.appendChild(span);
  });
}

function formatAuthors(authors = []) {
  if (!authors.length) return 'Not specified';
  return authors
    .map((author) => `${author.name} · ${author.institution}`)
    .join(' | ');
}

function createAnchor(href, label, className = '') {
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.textContent = label;
  anchor.className = className;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function renderDatasets(datasets = []) {
  if (!datasets.length) return document.createTextNode('No datasets listed');

  const wrapper = document.createElement('div');
  wrapper.className = 'dataset-list';

  datasets.forEach((dataset) => {
    const tag = createAnchor(dataset.url, dataset.name);
    tag.classList.add('dataset-link');
    wrapper.appendChild(tag);
  });

  return wrapper;
}

function renderSequence(navigation) {
  const wrapper = document.createElement('div');
  wrapper.className = 'sequence-links';

  const { previous, next } = navigation || {};

  if (previous && lessonById.has(previous)) {
    const prevLesson = lessonById.get(previous);
    wrapper.appendChild(
      createAnchor(
        prevLesson.link,
        `← Previous: ${prevLesson.title}`,
        'link-pill'
      )
    );
  }

  if (next && lessonById.has(next)) {
    const nextLesson = lessonById.get(next);
    wrapper.appendChild(
      createAnchor(nextLesson.link, `Next: ${nextLesson.title} →`, 'link-pill')
    );
  }

  if (!wrapper.childNodes.length) {
    wrapper.appendChild(document.createTextNode('Standalone lesson'));
  }

  return wrapper;
}

function appendMetaRow(container, label, content) {
  if (!container || !content) return;

  const row = document.createElement('div');
  row.className = 'meta-row';

  const dt = document.createElement('dt');
  dt.textContent = label;

  const dd = document.createElement('dd');

  if (content instanceof Node) {
    dd.appendChild(content);
  } else if (typeof content === 'string') {
    dd.textContent = content;
  } else {
    return;
  }

  row.append(dt, dd);
  container.appendChild(row);
}

function formatTaughtCount(count) {
  const formatter = new Intl.NumberFormat();
  const label = count === 1 ? 'time' : 'times';
  return `This lesson has been taught ${formatter.format(count)} ${label}.`;
}

function createModificationContent(variants = []) {
  if (!variants.length) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'lesson-variants';

  const intro = document.createElement('p');
  intro.className = 'lesson-meta-lead';
  intro.textContent = 'This lesson has been modified by:';
  wrapper.appendChild(intro);

  const list = document.createElement('ul');
  list.className = 'lesson-variant-list';

  variants.forEach((variant) => {
    const item = document.createElement('li');
    const anchor = createAnchor(variant.link, variant.title, 'inline-link');
    item.appendChild(anchor);

    const details = [variant.curator, variant.institution].filter(Boolean);
    if (details.length) {
      const detailSpan = document.createElement('span');
      detailSpan.textContent = ` — ${details.join(', ')}`;
      item.appendChild(detailSpan);
    }

    list.appendChild(item);
  });

  wrapper.appendChild(list);
  return wrapper;
}

function createAdaptedContent(source = {}) {
  if (!source.link || !source.title) return null;

  const paragraph = document.createElement('p');
  paragraph.className = 'lesson-adapted-note';
  paragraph.appendChild(document.createTextNode('This lesson was adapted from '));

  const anchor = createAnchor(source.link, source.title, 'inline-link');
  paragraph.appendChild(anchor);

  if (source.author) {
    paragraph.appendChild(document.createTextNode(` by ${source.author}`));
  }

  return paragraph;
}

renderLessons();
