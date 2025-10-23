import { buildLabIndex, slugify } from './data-utils.js';

const labGrid = document.getElementById('lab-grid');
const resultsCountEl = document.getElementById('lab-results-count');
const resetButton = document.getElementById('reset-lab-filters');
const filterPanels = document.querySelectorAll(
  '.filter-options[data-filter-group]'
);

const FILTER_GROUPS = ['audience', 'style', 'length', 'syllabus'];

const filterState = {
  audience: new Set(),
  style: new Set(),
  length: new Set(),
  syllabus: new Set(),
};

const labs = buildLabIndex();
const filterOptions = buildFilterOptions(labs);

renderFilterOptions(filterOptions);
bindFilterEvents();
renderResults(labs);

function buildFilterOptions(list) {
  const options = {
    audience: new Set(),
    style: new Set(),
    length: new Set(),
    syllabus: new Set(),
  };

  list.forEach((lesson) => {
    (lesson.audience || []).forEach((aud) => options.audience.add(aud));
    (lesson.styles || []).forEach((style) => options.style.add(style));
    if (lesson.length) options.length.add(lesson.length);
    if (lesson.syllabus) options.syllabus.add(lesson.syllabus);
  });

  return {
    audience: sortAlpha(options.audience),
    style: sortAlpha(options.style),
    length: sortAlpha(options.length),
    syllabus: sortAlpha(options.syllabus),
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
      renderResults(labs);
    });
  }
}

function applyFilters() {
  return labs.filter((lesson) => matchesFilters(lesson));
}

function matchesFilters(lesson) {
  if (
    filterState.audience.size &&
    !hasIntersection(filterState.audience, new Set(lesson.audience || []))
  ) {
    return false;
  }

  if (
    filterState.style.size &&
    !hasIntersection(filterState.style, new Set(lesson.styles || []))
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

  return true;
}

function hasIntersection(filterSet, valueSet) {
  for (const value of filterSet) {
    if (valueSet.has(value)) return true;
  }
  return false;
}

function renderResults(list) {
  if (!labGrid || !resultsCountEl) return;

  labGrid.innerHTML = '';
  resultsCountEl.textContent = `${list.length} lab${list.length === 1 ? '' : 's'}`;

  if (!list.length) {
    const empty = document.createElement('p');
    empty.textContent =
      'No labs match the selected filters. Adjust your selections and try again.';
    labGrid.appendChild(empty);
    return;
  }

  list.forEach((lesson) => {
    labGrid.appendChild(renderLabCard(lesson));
  });
}

function renderLabCard(lesson) {
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

  const audiences = createMetaRow(
    'Audience',
    (lesson.audience || []).join(' • ') || 'Not specified'
  );
  const styles = createMetaRow(
    'Styles',
    (lesson.styles || []).join(' • ') || 'Not specified'
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
  const dataTypes = createMetaRow(
    'Data Types',
    lesson.dataTypeSummary.length
      ? lesson.dataTypeSummary.join(' • ')
      : 'Not specified'
  );
  const topics = createMetaRow(
    'Topics',
    lesson.topicsSummary.length
      ? lesson.topicsSummary.join(' • ')
      : 'Not specified'
  );

  card.append(
    header,
    description,
    audiences,
    styles,
    length,
    syllabus,
    datasets,
    dataTypes,
    topics
  );

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

