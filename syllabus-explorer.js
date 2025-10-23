import { buildSyllabusIndex, slugify } from './data-utils.js';

const syllabusGrid = document.getElementById('syllabus-grid');
const resultsCountEl = document.getElementById('syllabus-results-count');
const resetButton = document.getElementById('reset-syllabus-filters');
const filterPanels = document.querySelectorAll(
  '.filter-options[data-filter-group]'
);

const FILTER_GROUPS = ['instructor', 'institution', 'audience', 'style'];

const filterState = {
  instructor: new Set(),
  institution: new Set(),
  audience: new Set(),
  style: new Set(),
};

const syllabi = buildSyllabusIndex();
const filterOptions = buildFilterOptions(syllabi);

renderFilterOptions(filterOptions);
bindFilterEvents();
renderResults(syllabi);

function buildFilterOptions(list) {
  const options = {
    instructor: new Set(),
    institution: new Set(),
    audience: new Set(),
    style: new Set(),
  };

  list.forEach((syllabus) => {
    syllabus.authors.forEach((name) => options.instructor.add(name));
    syllabus.institutions.forEach((inst) => options.institution.add(inst));
    syllabus.audiences.forEach((aud) => options.audience.add(aud));
    syllabus.styles.forEach((style) => options.style.add(style));
  });

  return {
    instructor: sortAlpha(options.instructor),
    institution: sortAlpha(options.institution),
    audience: sortAlpha(options.audience),
    style: sortAlpha(options.style),
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
      renderResults(syllabi);
    });
  }
}

function applyFilters() {
  return syllabi.filter((syllabus) => matchesFilters(syllabus));
}

function matchesFilters(syllabus) {
  if (
    filterState.instructor.size &&
    !hasIntersection(filterState.instructor, new Set(syllabus.authors))
  ) {
    return false;
  }

  if (
    filterState.institution.size &&
    !hasIntersection(filterState.institution, new Set(syllabus.institutions))
  ) {
    return false;
  }

  if (
    filterState.audience.size &&
    !hasIntersection(filterState.audience, new Set(syllabus.audiences))
  ) {
    return false;
  }

  if (
    filterState.style.size &&
    !hasIntersection(filterState.style, new Set(syllabus.styles))
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
  if (!syllabusGrid || !resultsCountEl) return;

  syllabusGrid.innerHTML = '';
  resultsCountEl.textContent = `${list.length} ${
    list.length === 1 ? 'syllabus' : 'syllabi'
  }`;

  if (!list.length) {
    const empty = document.createElement('p');
    empty.textContent =
      'No syllabi match the selected filters. Adjust your selections and try again.';
    syllabusGrid.appendChild(empty);
    return;
  }

  list.forEach((syllabus) => {
    syllabusGrid.appendChild(renderSyllabusCard(syllabus));
  });
}

function renderSyllabusCard(syllabus) {
  const card = document.createElement('article');
  card.className = 'dataset-card';

  const header = document.createElement('header');
  header.className = 'dataset-card__header';

  const title = document.createElement('h3');
  title.textContent = syllabus.title;

  const totals = document.createElement('span');
  totals.className = 'dataset-card__value';
  totals.textContent = `${syllabus.lessonCount} lesson${
    syllabus.lessonCount === 1 ? '' : 's'
  } • ${syllabus.datasetCount} dataset${
    syllabus.datasetCount === 1 ? '' : 's'
  }`;

  header.append(title, totals);

  const authors = createMetaRow(
    'Curators',
    syllabus.authors.length ? syllabus.authors.join(' • ') : 'Not specified'
  );
  const institutions = createMetaRow(
    'Institutions',
    syllabus.institutions.length
      ? syllabus.institutions.join(' • ')
      : 'Not specified'
  );
  const audiences = createMetaRow(
    'Audiences',
    syllabus.audiences.length
      ? syllabus.audiences.join(' • ')
      : 'Not specified'
  );
  const styles = createMetaRow(
    'Styles',
    syllabus.styles.length ? syllabus.styles.join(' • ') : 'Not specified'
  );
  const lengths = createMetaRow(
    'Lengths',
    syllabus.lengths.length ? syllabus.lengths.join(' • ') : 'Not specified'
  );

  const datasets = createMetaRow(
    'Datasets',
    syllabus.datasetNames.length
      ? syllabus.datasetNames.join(' • ')
      : 'No datasets linked'
  );
  const lessonList = renderLessonList(syllabus.lessons);

  card.append(
    header,
    authors,
    institutions,
    audiences,
    styles,
    lengths,
    datasets
  );
  card.appendChild(lessonList);
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

function renderLessonList(lessons = []) {
  const wrapper = document.createElement('div');
  wrapper.className = 'dataset-card__lessons';

  const heading = document.createElement('span');
  heading.className = 'dataset-card__label';
  heading.textContent = 'Included Lessons';

  wrapper.appendChild(heading);

  if (!lessons.length) {
    const empty = document.createElement('span');
    empty.className = 'dataset-card__value';
    empty.textContent = 'No lessons catalogued yet';
    wrapper.appendChild(empty);
    return wrapper;
  }

  const list = document.createElement('ul');
  list.className = 'dataset-card__lesson-list';

  lessons.forEach((lesson) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = lesson.link;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${lesson.title} (${lesson.length ?? 'Lesson'})`;
    item.appendChild(link);
    list.appendChild(item);
  });

  wrapper.appendChild(list);
  return wrapper;
}
