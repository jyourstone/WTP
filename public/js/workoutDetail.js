import * as api from './api.js';
import * as modal from './modal.js';
import * as state from './state.js';
import { openCreateForm, openEditForm } from './workoutForm.js';
import { triggerCompleteAnimation } from './dateCell.js';
import { setWorkout, removeWorkout } from './state.js';
import { formatSwedishDate, parseDate } from './utils.js';
import { showToast } from './app.js';

export function openDayDetail(dateStr, onRefresh) {
  const dateObj = parseDate(dateStr);
  const title = formatSwedishDate(dateObj);

  modal.open(title, (container) => {
    renderDayContent(container, dateStr, onRefresh);
  });
}

function renderDayContent(container, dateStr, onRefresh) {
  container.innerHTML = '';
  const workouts = state.get('workouts')[dateStr] || [];

  const wrapper = document.createElement('div');

  if (workouts.length > 0) {
    const list = document.createElement('div');
    list.className = 'day-detail__list';

    for (const w of workouts) {
      const item = document.createElement('div');
      item.className = 'day-detail__item';
      item.innerHTML = `
        <span class="day-detail__item-dot ${w.completed ? 'day-detail__item-dot--completed' : ''}" style="background:${w.category_color}"></span>
        <span class="day-detail__item-title ${w.completed ? 'day-detail__item-title--completed' : ''}">${escapeHtml(w.title)}</span>
        ${w.completed ? '<svg class="day-detail__item-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      `;
      item.addEventListener('click', () => {
        openWorkoutDetail(w, dateStr, onRefresh);
      });
      list.appendChild(item);
    }

    wrapper.appendChild(list);
  }

  // Add button
  const addBtn = document.createElement('button');
  addBtn.className = 'day-detail__add-btn';
  addBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Lägg till pass
  `;
  addBtn.addEventListener('click', () => {
    openCreateForm(dateStr, () => {
      // Re-open day detail after creating
      openDayDetail(dateStr, onRefresh);
      if (onRefresh) onRefresh();
    });
  });
  wrapper.appendChild(addBtn);

  container.appendChild(wrapper);
}

function openWorkoutDetail(workout, dateStr, onRefresh) {
  const categories = state.get('categories');
  const category = categories.find(c => c.id === workout.category_id);

  modal.open(workout.title, (container) => {
    const detail = document.createElement('div');
    detail.className = 'workout-detail';

    // Category badge
    if (category) {
      const badge = document.createElement('span');
      badge.className = 'workout-detail__category';
      badge.style.backgroundColor = category.color + '25';
      badge.style.color = category.color;
      badge.innerHTML = `<span class="category-chip__dot" style="background:${category.color}"></span>${escapeHtml(category.name)}`;
      detail.appendChild(badge);
    }

    // Date
    const dateEl = document.createElement('div');
    dateEl.className = 'workout-detail__notes';
    dateEl.textContent = formatSwedishDate(parseDate(workout.date));
    detail.appendChild(dateEl);

    // Notes
    if (workout.notes) {
      const notes = document.createElement('div');
      notes.className = 'workout-detail__notes';
      notes.textContent = workout.notes;
      detail.appendChild(notes);
    }

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = `workout-detail__complete-btn ${workout.completed ? 'workout-detail__complete-btn--completed' : 'workout-detail__complete-btn--pending'}`;
    completeBtn.innerHTML = workout.completed
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-4 4l9-9"/><path d="M20 6L9 17l-5-5"/></svg> Markera som ej klar`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Markera som klar`;

    completeBtn.addEventListener('click', async () => {
      try {
        const wasCompleted = workout.completed;
        const result = await api.toggleComplete(workout.id, !wasCompleted);
        setWorkout(result.workout);

        if (result.workout.completed) {
          const categoryColor = category?.color || '#22c55e';

          // Close modal first so the calendar circle is visible
          modal.close();
          if (onRefresh) onRefresh();

          // Small delay for the modal to clear, then the circle explodes
          await new Promise(r => setTimeout(r, 150));
          triggerCompleteAnimation(dateStr, categoryColor);
        } else {
          // Just uncompleting — no celebration needed
          modal.close();
          if (onRefresh) onRefresh();
        }
      } catch (err) {
        showToast(err.message);
      }
    });
    detail.appendChild(completeBtn);

    // Action row
    const actions = document.createElement('div');
    actions.className = 'workout-detail__actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--secondary';
    editBtn.textContent = 'Redigera';
    editBtn.addEventListener('click', () => {
      openEditForm(workout, () => {
        openDayDetail(dateStr, onRefresh);
        if (onRefresh) onRefresh();
      });
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--danger';
    deleteBtn.textContent = 'Ta bort';
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Vill du ta bort detta träningspass?')) {
        try {
          await api.deleteWorkout(workout.id);
          removeWorkout(workout.id, workout.date);
          modal.close();
          if (onRefresh) onRefresh();
        } catch (err) {
          showToast(err.message);
        }
      }
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    detail.appendChild(actions);

    container.appendChild(detail);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
