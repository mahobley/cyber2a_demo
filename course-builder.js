const form = document.getElementById('course-builder-form');
const coordinatorFieldset = document.getElementById('coordinator-fieldset');
const addCoordinatorButton = document.getElementById('add-coordinator');
const outputArea = document.getElementById('json-output');
const copyButton = document.getElementById('copy-json');
const statusEl = document.getElementById('builder-status');

const SUMMARY_DEFAULT =
  'Curated to guide learners through climate resilience, hydrologic modeling, and landscape analytics.';
const INSTITUTION_DEFAULT = 'Institution TBD';
const ROLE_DEFAULT = 'Contributor';

let coordinatorCount = coordinatorFieldset
  ? coordinatorFieldset.querySelectorAll('[data-coordinator-row]').length
  : 0;

function createCoordinatorRow() {
  coordinatorCount += 1;

  const wrapper = document.createElement('div');
  wrapper.className = 'coordinator-row';
  wrapper.dataset.coordinatorRow = '';

  const nameId = `coordinator-name-${coordinatorCount}`;
  const institutionId = `coordinator-institution-${coordinatorCount}`;
  const roleId = `coordinator-role-${coordinatorCount}`;

  wrapper.innerHTML = `
    <div>
      <label for="${nameId}">Name<span class="required-indicator">*</span></label>
      <input id="${nameId}" name="coordinator-name" type="text" placeholder="Coordinator Name" required />
    </div>
    <div>
      <label for="${institutionId}">Institution</label>
      <input id="${institutionId}" name="coordinator-institution" type="text" placeholder="Institution or affiliation" />
    </div>
    <div>
      <label for="${roleId}">Role</label>
      <input id="${roleId}" name="coordinator-role" type="text" value="${ROLE_DEFAULT}" />
    </div>
    <button type="button" class="inline-remove" data-remove-row aria-label="Remove coordinator">×</button>
  `;

  return wrapper;
}

function updateRemoveButtons() {
  const rows = coordinatorFieldset.querySelectorAll('[data-coordinator-row]');
  rows.forEach((row, index) => {
    const removeButton = row.querySelector('[data-remove-row]');
    if (removeButton) {
      removeButton.hidden = rows.length === 1 || index === 0;
    }
  });
}

function gatherCoordinators() {
  const rows = coordinatorFieldset.querySelectorAll('[data-coordinator-row]');
  const coordinators = [];

  rows.forEach((row) => {
    const name = row.querySelector('input[name="coordinator-name"]').value.trim();
    const institution = row
      .querySelector('input[name="coordinator-institution"]')
      .value.trim();
    const role = row.querySelector('input[name="coordinator-role"]').value.trim();

    if (!name) {
      return;
    }

    coordinators.push({
      name,
      institution: institution || INSTITUTION_DEFAULT,
      role: role || ROLE_DEFAULT,
    });
  });

  return coordinators;
}

function gatherLessonIds(rawValue) {
  if (!rawValue) return [];
  return rawValue
    .split(/\r?\n|,/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function setStatus(message, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.variant = type;
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    setStatus('Please complete the required fields before generating JSON.', 'error');
    return;
  }

  const idValue = form.elements.id.value.trim();
  const titleValue = form.elements.title.value.trim();
  const summaryValue = form.elements.summary.value.trim();
  const lessonsRaw = form.elements.lessonIds.value;

  const coordinators = gatherCoordinators();

  if (!coordinators.length) {
    setStatus('Add at least one coordinator with a name.', 'error');
    return;
  }

  const courseData = {
    id: idValue,
    title: titleValue,
    summary: summaryValue || SUMMARY_DEFAULT,
    coordinators,
    lessonIds: gatherLessonIds(lessonsRaw),
  };

  const jsonString = JSON.stringify(courseData, null, 2);
  outputArea.value = jsonString;
  copyButton.disabled = false;
  setStatus('JSON generated. Review and copy to create a new metadata file.', 'success');
}

function handleAddCoordinator() {
  const newRow = createCoordinatorRow();
  addCoordinatorButton.before(newRow);
  updateRemoveButtons();
  const firstInput = newRow.querySelector('input[name="coordinator-name"]');
  if (firstInput) firstInput.focus();
}

function handleFieldsetClick(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.hasAttribute('data-remove-row')) return;

  const row = target.closest('[data-coordinator-row]');
  if (!row) return;

  row.remove();
  updateRemoveButtons();
}

function handleCopy() {
  if (!outputArea.value.trim()) return;
  navigator.clipboard
    .writeText(outputArea.value)
    .then(() => {
      setStatus('Copied JSON to clipboard.', 'success');
    })
    .catch(() => {
      setStatus('Copy failed. You can still select and copy manually.', 'error');
    });
}

if (form) {
  form.addEventListener('submit', handleFormSubmit);
}

if (addCoordinatorButton) {
  addCoordinatorButton.addEventListener('click', handleAddCoordinator);
}

if (coordinatorFieldset) {
  coordinatorFieldset.addEventListener('click', handleFieldsetClick);
  updateRemoveButtons();
}

if (copyButton) {
  copyButton.addEventListener('click', handleCopy);
}
