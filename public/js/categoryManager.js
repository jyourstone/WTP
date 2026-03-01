import * as api from './api.js';
import * as state from './state.js';
import * as modal from './modal.js';
import { showToast } from './app.js';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#ec4899', '#f43f5e', '#78716c',
];

export function openCategoryManager() {
  modal.open('Kategorier', (container) => {
    renderCategoryList(container);
  });
}

function renderCategoryList(container) {
  container.innerHTML = '';
  const categories = state.get('categories');

  const list = document.createElement('div');
  list.className = 'category-list';

  for (const cat of categories) {
    const item = document.createElement('div');
    item.className = 'category-list__item';
    item.innerHTML = `
      <span class="category-list__color" style="background:${cat.color}"></span>
      <span class="category-list__name">${escapeHtml(cat.name)}</span>
      <div class="category-list__actions">
        <button class="category-list__btn" data-action="edit" aria-label="Redigera">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="category-list__btn category-list__btn--danger" data-action="delete" aria-label="Ta bort">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `;

    item.querySelector('[data-action="edit"]').addEventListener('click', () => {
      openCategoryForm(cat, container);
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (confirm(`Vill du ta bort kategorin "${cat.name}"?`)) {
        try {
          await api.deleteCategory(cat.id);
          const updated = state.get('categories').filter(c => c.id !== cat.id);
          state.set('categories', updated);
          renderCategoryList(container);
          showToast('Kategorin borttagen.');
        } catch (err) {
          showToast(err.message);
        }
      }
    });

    list.appendChild(item);
  }

  container.appendChild(list);

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'category-list__add';
  addBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Lägg till kategori
  `;
  addBtn.addEventListener('click', () => {
    openCategoryForm(null, container);
  });
  container.appendChild(addBtn);
}

function openCategoryForm(existing, listContainer) {
  const isEdit = !!existing;
  modal.open(isEdit ? 'Redigera kategori' : 'Ny kategori', (container) => {
    let selectedColor = existing?.color || PRESET_COLORS[0];

    const form = document.createElement('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = form.querySelector('#cat-name').value.trim();
      if (!name) {
        showToast('Ange ett namn.');
        return;
      }
      try {
        if (isEdit) {
          const result = await api.updateCategory(existing.id, { name, color: selectedColor });
          const cats = state.get('categories').map(c => c.id === existing.id ? result.category : c);
          state.set('categories', cats);
        } else {
          const result = await api.createCategory({ name, color: selectedColor });
          state.set('categories', [...state.get('categories'), result.category]);
        }
        // Re-open category list
        openCategoryManager();
      } catch (err) {
        showToast(err.message);
      }
    });

    form.innerHTML = `
      <div class="form-group">
        <label class="form-label" for="cat-name">Namn</label>
        <input type="text" id="cat-name" placeholder="Kategorinamn" value="${escapeHtml(existing?.name || '')}" autocomplete="off">
      </div>
      <div class="form-group">
        <label class="form-label">Färg</label>
        <div class="color-grid" id="color-grid"></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn--secondary" id="cat-cancel">Avbryt</button>
        <button type="submit" class="btn btn--primary">${isEdit ? 'Uppdatera' : 'Skapa'}</button>
      </div>
    `;

    // Render color grid
    const grid = form.querySelector('#color-grid');
    for (const color of PRESET_COLORS) {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'color-swatch';
      if (color === selectedColor) swatch.classList.add('color-swatch--selected');
      swatch.style.backgroundColor = color;
      swatch.addEventListener('click', () => {
        selectedColor = color;
        grid.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('color-swatch--selected'));
        swatch.classList.add('color-swatch--selected');
      });
      grid.appendChild(swatch);
    }

    form.querySelector('#cat-cancel').addEventListener('click', () => {
      openCategoryManager();
    });

    container.appendChild(form);
    setTimeout(() => form.querySelector('#cat-name').focus(), 100);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
