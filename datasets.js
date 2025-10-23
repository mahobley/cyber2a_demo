import { buildDatasetIndex } from './data-utils.js';

const datasetGrid = document.getElementById('dataset-grid');

function renderDatasets(datasets) {
  if (!datasetGrid) return;

  if (!datasets.length) {
    const empty = document.createElement('p');
    empty.textContent =
      'No datasets are associated with this catalog yet. Check back soon!';
    datasetGrid.appendChild(empty);
    return;
  }

  datasets.forEach((dataset) => {
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
    const methods = createMetaRow(
      'ML Topics',
      (dataset.methods || []).join(' • ') || 'Not specified'
    );
    const size = createMetaRow('Size', dataset.size ?? 'Not specified');
    const citation = createMetaRow('How to Cite', dataset.citation ?? 'N/A');

    const lessonList = renderLessonList(dataset.lessons);

    card.append(header, domain, methods, size, citation, lessonList);
    datasetGrid.appendChild(card);
  });
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

renderDatasets(buildDatasetIndex());
