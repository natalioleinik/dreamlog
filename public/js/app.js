const API = '/api';

// --- Utility ---
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

// --- API helpers ---
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// --- Usage status ---
async function loadUsageStatus() {
  try {
    const data = await apiFetch(`${API}/images/status`);
    const bar = document.getElementById('usage-status');
    const text = document.getElementById('usage-text');
    text.textContent = `Image generations today: ${data.used} / ${data.limit} used`;
    bar.classList.remove('hidden');
  } catch (_) {
    // non-critical, hide silently
  }
}

// --- Dream feed ---
async function loadDreams() {
  const feed = document.getElementById('dreams-feed');
  try {
    const dreams = await apiFetch(`${API}/dreams`);
    if (dreams.length === 0) {
      feed.innerHTML = '<p class="empty-state">No dreams recorded yet. Write your first one above.</p>';
      return;
    }
    feed.innerHTML = dreams.map(renderDreamCard).join('');
    attachCardListeners();
  } catch (err) {
    feed.innerHTML = `<p class="empty-state" style="color:var(--color-error)">Failed to load dreams: ${escapeHtml(err.message)}</p>`;
  }
}

function renderDreamCard(dream) {
  const hasImage = dream.imageUrl;
  const imageSection = hasImage
    ? `<div class="dream-image-container">
         <img class="dream-image" src="${escapeHtml(dream.imageUrl)}" alt="Generated image for dream: ${escapeHtml(dream.title)}" loading="lazy" />
       </div>`
    : `<p class="image-placeholder">No image generated.</p>`;

  return `
    <article class="dream-card" data-id="${dream._id}">
      <div class="dream-card-header">
        <h3 class="dream-title">${escapeHtml(dream.title)}</h3>
        <div class="dream-card-actions">
          <button class="btn-edit btn" data-id="${dream._id}" aria-label="Edit dream">Edit</button>
          <button class="btn-delete btn" data-id="${dream._id}" aria-label="Delete dream">Delete</button>
        </div>
      </div>
      <p class="dream-description">${escapeHtml(dream.description)}</p>
      ${imageSection}
      <div class="dream-footer">
        <span class="dream-date">${formatDate(dream.createdAt)}</span>
        <button class="btn-generate btn" data-id="${dream._id}" ${hasImage ? 'title="Regenerate image"' : ''}>
          ${hasImage ? 'Regenerate Image' : 'Generate Image'}
        </button>
      </div>
      <p class="card-error hidden" data-id="${dream._id}"></p>
    </article>
  `;
}

function attachCardListeners() {
  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', () => handleDelete(btn.dataset.id));
  });
  document.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
  document.querySelectorAll('.btn-generate').forEach((btn) => {
    btn.addEventListener('click', () => handleGenerateImage(btn.dataset.id, btn));
  });
}

// --- Create dream ---
const dreamForm = document.getElementById('dream-form');
const formError = document.getElementById('form-error');
const saveBtn = document.getElementById('save-btn');

dreamForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError(formError);

  const title = document.getElementById('dream-title').value.trim();
  const description = document.getElementById('dream-description').value.trim();

  if (!title || !description) {
    showError(formError, 'Please fill in both the title and description.');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    await apiFetch(`${API}/dreams`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
    dreamForm.reset();
    await loadDreams();
    await loadUsageStatus();
  } catch (err) {
    showError(formError, err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Dream';
  }
});

// --- Delete dream ---
async function handleDelete(id) {
  if (!confirm('Delete this dream? This cannot be undone.')) return;
  try {
    await apiFetch(`${API}/dreams/${id}`, { method: 'DELETE' });
    await loadDreams();
  } catch (err) {
    alert(`Failed to delete: ${err.message}`);
  }
}

// --- Edit modal ---
let editingId = null;
const editModal = document.getElementById('edit-modal');
const overlay = document.getElementById('modal-overlay');
const editTitleInput = document.getElementById('edit-title');
const editDescInput = document.getElementById('edit-description');
const editError = document.getElementById('edit-error');
const editSaveBtn = document.getElementById('edit-save-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

async function openEditModal(id) {
  try {
    const dream = await apiFetch(`${API}/dreams/${id}`);
    editingId = id;
    editTitleInput.value = dream.title;
    editDescInput.value = dream.description;
    clearError(editError);
    editModal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    editTitleInput.focus();
  } catch (err) {
    alert(`Failed to load dream: ${err.message}`);
  }
}

function closeEditModal() {
  editModal.classList.add('hidden');
  overlay.classList.add('hidden');
  editingId = null;
}

editCancelBtn.addEventListener('click', closeEditModal);
overlay.addEventListener('click', closeEditModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) closeEditModal();
});

editSaveBtn.addEventListener('click', async () => {
  clearError(editError);
  const title = editTitleInput.value.trim();
  const description = editDescInput.value.trim();

  if (!title || !description) {
    showError(editError, 'Please fill in both fields.');
    return;
  }

  editSaveBtn.disabled = true;
  editSaveBtn.textContent = 'Saving...';

  try {
    await apiFetch(`${API}/dreams/${editingId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
    closeEditModal();
    await loadDreams();
  } catch (err) {
    showError(editError, err.message);
  } finally {
    editSaveBtn.disabled = false;
    editSaveBtn.textContent = 'Save Changes';
  }
});

// --- Image generation ---
async function handleGenerateImage(id, btn) {
  const card = document.querySelector(`.dream-card[data-id="${id}"]`);
  const cardError = card.querySelector('.card-error');
  clearError(cardError);

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Generating...';

  // Show loading placeholder
  let imgContainer = card.querySelector('.dream-image-container');
  let placeholder = card.querySelector('.image-placeholder');
  if (!imgContainer) {
    if (placeholder) placeholder.innerHTML = '<span class="image-loading">Generating image, please wait...</span>';
  }

  try {
    const data = await apiFetch(`${API}/images/generate`, {
      method: 'POST',
      body: JSON.stringify({ dreamId: id }),
    });

    // Update usage status
    await loadUsageStatus();

    // Re-render just this card by reloading all (keeps things simple)
    await loadDreams();
  } catch (err) {
    if (placeholder) placeholder.innerHTML = 'No image generated.';
    showError(cardError, err.message);
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// --- Init ---
(async function init() {
  await loadDreams();
  await loadUsageStatus();
})();
