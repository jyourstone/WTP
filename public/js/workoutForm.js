import * as state from './state.js';
import * as api from './api.js';
import * as modal from './modal.js';
import { setWorkout } from './state.js';
import { showToast } from './app.js';

export function openCreateForm(dateStr, onDone) {
  modal.open('Nytt träningspass', (container) => {
    renderForm(container, { date: dateStr }, async (data) => {
      try {
        const result = await api.createWorkout(data);
        setWorkout(result.workout);
        modal.close();
        if (onDone) onDone();
      } catch (err) {
        showToast(err.message);
      }
    });
  });
}

export function openEditForm(workout, onDone) {
  modal.open('Redigera träningspass', (container) => {
    renderForm(container, workout, async (data) => {
      try {
        const result = await api.updateWorkout(workout.id, data);
        setWorkout(result.workout);
        modal.close();
        if (onDone) onDone();
      } catch (err) {
        showToast(err.message);
      }
    });
  });
}

function renderForm(container, existing, onSubmit) {
  const categories = state.get('categories');
  let selectedCategoryId = existing.category_id || (categories.length > 0 ? categories[0].id : null);

  const form = document.createElement('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = form.querySelector('#workout-title').value.trim();
    if (!title) {
      showToast('Ange en titel.');
      return;
    }
    if (!selectedCategoryId) {
      showToast('Välj en kategori.');
      return;
    }
    onSubmit({
      date: existing.date,
      title,
      category_id: selectedCategoryId,
      notes: form.querySelector('#workout-notes').value.trim(),
    });
  });

  // Title field
  form.innerHTML = `
    <div class="form-group">
      <label class="form-label" for="workout-title">Aktivitet</label>
      <input type="text" id="workout-title" placeholder="Vad ska du göra?" value="${escapeHtml(existing.title || '')}" autocomplete="off">
    </div>
    <div class="form-group">
      <label class="form-label">Kategori</label>
      <div class="category-picker" id="category-picker"></div>
    </div>
    <div class="form-group">
      <label class="form-label" for="workout-notes">Anteckningar</label>
      <textarea id="workout-notes" placeholder="Skriv anteckningar här...">${escapeHtml(existing.notes || '')}</textarea>
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn--secondary" id="form-cancel">Avbryt</button>
      <button type="submit" class="btn btn--primary">Spara</button>
    </div>
  `;

  // Render category chips
  const picker = form.querySelector('#category-picker');
  for (const cat of categories) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'category-chip';
    chip.style.setProperty('--chip-color', cat.color);
    if (cat.id === selectedCategoryId) {
      chip.classList.add('category-chip--selected');
    }
    chip.innerHTML = `<span class="category-chip__dot" style="background:${cat.color}"></span>${escapeHtml(cat.name)}`;
    chip.addEventListener('click', () => {
      selectedCategoryId = cat.id;
      picker.querySelectorAll('.category-chip').forEach(c => c.classList.remove('category-chip--selected'));
      chip.classList.add('category-chip--selected');
    });
    picker.appendChild(chip);
  }

  form.querySelector('#form-cancel').addEventListener('click', () => modal.close());

  container.appendChild(form);

  // Focus title input
  setTimeout(() => form.querySelector('#workout-title').focus(), 100);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
