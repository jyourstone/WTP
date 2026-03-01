const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Något gick fel.');
  }
  return data;
}

// Categories
export function getCategories() {
  return request('/categories');
}

export function createCategory(data) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCategory(id, data) {
  return request(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// Workouts
export function getWorkouts(from, to) {
  return request(`/workouts?from=${from}&to=${to}`);
}

export function createWorkout(data) {
  return request('/workouts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateWorkout(id, data) {
  return request(`/workouts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function toggleComplete(id, completed) {
  return request(`/workouts/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}

export function deleteWorkout(id) {
  return request(`/workouts/${id}`, {
    method: 'DELETE',
  });
}

// Summary
export function getSummary(from, to) {
  return request(`/workouts/summary?from=${from}&to=${to}`);
}
