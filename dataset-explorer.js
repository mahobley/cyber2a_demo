import { buildDatasetIndex, slugify } from './data-utils.js';

const datasetGrid = document.getElementById('filtered-dataset-grid');
const resultsCountEl = document.getElementById('results-count');
const resetButton = document.getElementById('reset-filters');
const filterPanels = document.querySelectorAll('.filter-options');

const FILTER_GROUPS = ['size', 'datatype', 'topic'];

const filterState = {
  size: new Set(),
  datatype: new Set(),
  topic: new Set(),
};

const datasets = buildDatasetIndex();
const filterOptions = buildFilterOptions(datasets);

renderFilterOptions(filterOptions);
bindFilterEvents();
renderResults(datasets);

function buildFilterOptions(datasetList) {
  const options = {
    size: new Set(),
    datatype: new Set(),
    topic: new Set(),
  };

  datasetList.forEach((dataset) => {
    if (dataset.sizeCategory) options.size.add(dataset.sizeCategory);
    (dataset.dataTypes || []).forEach((type) => options.datatype.add(type));
    (dataset.topics || []).forEach((topic) => options.topic.add(topic));
  });

  return {
    size: sortAlpha(options.size),
    datatype: sortAlpha(options.datatype),
    topic: sortAlpha(options.topic),
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
      renderResults(datasets);
    });
  }
}

function applyFilters() {
  return datasets.filter((dataset) => matchesFilters(dataset));
}

function matchesFilters(dataset) {
  if (filterState.size.size) {
    if (!dataset.sizeCategory) return false;
    if (!filterState.size.has(dataset.sizeCategory)) return false;
  }

  if (filterState.datatype.size) {
    const types = new Set(dataset.dataTypes || []);
    if (!hasIntersection(filterState.datatype, types)) return false;
  }

  if (filterState.topic.size) {
    const topics = new Set(dataset.topics || []);
    if (!hasIntersection(filterState.topic, topics)) return false;
  }

  return true;
}

function hasIntersection(filterSet, valuesSet) {
  for (const value of filterSet) {
    if (valuesSet.has(value)) return true;
  }
  return false;
}

function renderResults(datasetList) {
  if (!datasetGrid || !resultsCountEl) return;

  datasetGrid.innerHTML = '';
  resultsCountEl.textContent = `${datasetList.length} dataset${
    datasetList.length === 1 ? '' : 's'
  }`;

  if (!datasetList.length) {
    const empty = document.createElement('p');
    empty.textContent =
      'No datasets match the selected filters. Adjust your selections and try again.';
    datasetGrid.appendChild(empty);
    return;
  }

  datasetList.forEach((dataset) => {
    datasetGrid.appendChild(renderDatasetCard(dataset));
  });
}

function renderDatasetCard(dataset) {
  const card = document.createElement('article');
  card.className = 'dataset-card';

  const header = document.createElement('header');
  header.className = 'dataset-card__header';

  const title = document.createElement('h3');
  title.textContent = dataset.name;

  const visitLink = document.createElement('a');
  visitLink.href = dataset.url;
  visitLink.target = '_blank';
  visitLink.rel = 'noopener noreferrer';
  visitLink.className = 'link-pill';
  visitLink.textContent = 'Open Dataset';

  header.append(title, visitLink);

  const domain = createMetaRow('Domain Focus', dataset.domain);
  const size = createMetaRow(
    'Size',
    `${dataset.size ?? 'Not specified'} · ${dataset.sizeCategory ?? 'Unknown'}`
  );
  const types = createMetaRow(
    'Data Types',
    (dataset.dataTypes || []).join(' • ') || 'Not specified'
  );
  const topics = createMetaRow(
    'Topics',
    (dataset.topics || dataset.methods || []).join(' • ') || 'Not specified'
  );
  const citation = createMetaRow(
    'How to Cite',
    dataset.citation ?? 'Not specified'
  );

  const lessonList = renderLessonList(dataset.lessons);

  card.append(header, domain, size, types, topics, citation, lessonList);
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
  heading.textContent = 'Used In';

  wrapper.appendChild(heading);

  if (!lessons.length) {
    const empty = document.createElement('span');
    empty.className = 'dataset-card__value';
    empty.textContent = 'No linked lessons yet';
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
    link.textContent = lesson.title;
    item.appendChild(link);
    list.appendChild(item);
  });

  wrapper.appendChild(list);
  return wrapper;
}
