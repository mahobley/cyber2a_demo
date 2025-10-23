import { buildLessonIndex, slugify } from './data-utils.js';

const lessonGrid = document.getElementById('lesson-grid');
const resultsCountEl = document.getElementById('lesson-results-count');
const resetButton = document.getElementById('reset-lesson-filters');
const filterPanels = document.querySelectorAll(
  '.filter-options[data-filter-group]'
);

const FILTER_GROUPS = ['style', 'audience', 'length', 'syllabus', 'dataset'];

const filterState = {
  style: new Set(),
  audience: new Set(),
  length: new Set(),
  syllabus: new Set(),
  dataset: new Set(),
};

const lessons = buildLessonIndex();
const filterOptions = buildFilterOptions(lessons);

renderFilterOptions(filterOptions);
bindFilterEvents();
renderResults(lessons);

function buildFilterOptions(list) {
  const options = {
    style: new Set(),
    audience: new Set(),
    length: new Set(),
    syllabus: new Set(),
    dataset: new Set(),
  };

  list.forEach((lesson) => {
    (lesson.styles || []).forEach((style) => options.style.add(style));
    (lesson.audience || []).forEach((aud) => options.audience.add(aud));
    if (lesson.length) options.length.add(lesson.length);
    if (lesson.syllabus) options.syllabus.add(lesson.syllabus);
    options.dataset.add(
      lesson.datasetCount > 0 ? 'Has datasets' : 'No datasets'
    );
  });

  return {
    style: sortAlpha(options.style),
    audience: sortAlpha(options.audience),
    length: sortAlpha(options.length),
    syllabus: sortAlpha(options.syllabus),
    dataset: sortAlpha(options.dataset),
  };
}

function sortAlpha(values) {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function renderFilterOptions(options) {
  FILTER_GROUPS.forEach((group) => {
    const container = document.querySelector(
      `.filter-options[data-filter-group="${group}"]`
    );
    if (!container) return;

    options[group].forEach((value) => {
      const id = `${group}-${slugify(value)}`;
      const wrapper = document.createElement('label');
      wrapper.className = 'filter-option';
      wrapper.setAttribute('for', id);

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = id;
      input.value = value;
      input.dataset.filterGroup = group;

      const text = document.createElement('span');
      text.textContent = value;

      wrapper.append(input, text);
      container.appendChild(wrapper);
    });
  });
}

function bindFilterEvents() {
  filterPanels.forEach((panel) => {
    panel.addEventListener('change', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      const group = target.dataset.filterGroup;
      if (!group || !FILTER_GROUPS.includes(group)) return;

      if (target.checked) {
        filterState[group].add(target.value);
      } else {
        filterState[group].delete(target.value);
      }

      renderResults(applyFilters());
    });
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      FILTER_GROUPS.forEach((group) => filterState[group].clear());
      document
        .querySelectorAll('.filter-option input[type="checkbox"]')
        .forEach((input) => {
          input.checked = false;
        });
      renderResults(lessons);
    });
  }
}

function applyFilters() {
  return lessons.filter((lesson) => matchesFilters(lesson));
}

function matchesFilters(lesson) {
  if (
    filterState.style.size &&
    !hasIntersection(filterState.style, new Set(lesson.styles || []))
  ) {
    return false;
  }

  if (
    filterState.audience.size &&
    !hasIntersection(filterState.audience, new Set(lesson.audience || []))
  ) {
    return false;
  }

  if (
    filterState.length.size &&
    (!lesson.length || !filterState.length.has(lesson.length))
  ) {
    return false;
  }

  if (
    filterState.syllabus.size &&
    (!lesson.syllabus || !filterState.syllabus.has(lesson.syllabus))
  ) {
    return false;
  }

  if (filterState.dataset.size) {
    const availability =
      lesson.datasetCount > 0 ? 'Has datasets' : 'No datasets';
    if (!filterState.dataset.has(availability)) return false;
  }

  return true;
}

function hasIntersection(filterSet, valueSet) {
  for (const value of filterSet) {
    if (valueSet.has(value)) return true;
  }
  return false;
}

function renderResults(list) {
  if (!lessonGrid || !resultsCountEl) return;

  lessonGrid.innerHTML = '';
  resultsCountEl.textContent = `${list.length} lesson${
    list.length === 1 ? '' : 's'
  }`;

  if (!list.length) {
    const empty = document.createElement('p');
    empty.textContent =
      'No lessons match the selected filters. Adjust your selections and try again.';
    lessonGrid.appendChild(empty);
    return;
  }

  list.forEach((lesson) => {
    lessonGrid.appendChild(renderLessonCard(lesson));
  });
}

function renderLessonCard(lesson) {
  const card = document.createElement('article');
  card.className = 'dataset-card';

  const header = document.createElement('header');
  header.className = 'dataset-card__header';

  const title = document.createElement('h3');
  title.textContent = lesson.title;

  const visitLink = document.createElement('a');
  visitLink.href = lesson.link;
  visitLink.target = '_blank';
  visitLink.rel = 'noopener noreferrer';
  visitLink.className = 'link-pill';
  visitLink.textContent = 'View Lesson';

  header.append(title, visitLink);

  const description = document.createElement('p');
  description.textContent = lesson.description;

  const styles = createMetaRow(
    'Styles',
    (lesson.styles || []).join(' • ') || 'Not specified'
  );
  const audience = createMetaRow(
    'Audience',
    (lesson.audience || []).join(' • ') || 'Not specified'
  );
  const length = createMetaRow('Length', lesson.length ?? 'Not specified');
  const syllabus = createMetaRow(
    'Syllabus',
    lesson.syllabus ?? 'Not linked'
  );
  const datasets = createMetaRow(
    'Datasets',
    lesson.datasetCount
      ? `${lesson.datasetCount} available`
      : 'No datasets listed'
  );

  const datasetList = renderDatasetList(lesson.datasets);

  card.append(header, description, styles, audience, length, syllabus, datasets);

  if (datasetList) {
    card.appendChild(datasetList);
  }

  return card;
}

function createMetaRow(label, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dataset-card__row';

  const dt = document.createElement('span');
  dt.className = 'dataset-card__label';
  dt.textContent = label;

  const dd = document.createElement('span');
  dd.className = 'dataset-card__value';
  dd.textContent = value;

  wrapper.append(dt, dd);
  return wrapper;
}

function renderDatasetList(datasets = []) {
  if (!datasets.length) return null;

  const wrapper = document.createElement('div');
  wrapper.className = 'dataset-card__lessons';

  const heading = document.createElement('span');
  heading.className = 'dataset-card__label';
  heading.textContent = 'Datasets';

  wrapper.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'dataset-list';

  datasets.forEach((dataset) => {
    const anchor = document.createElement('a');
    anchor.href = dataset.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = dataset.name;
    list.appendChild(anchor);
  });

  wrapper.appendChild(list);
  return wrapper;
}

