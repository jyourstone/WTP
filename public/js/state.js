const listeners = {};
const state = {
  categories: [],
  workouts: {},       // keyed by date string: { '2026-03-01': [...] }
  currentDate: new Date(),
  viewMode: 'month',  // 'month' | 'week'
};

export function get(key) {
  return state[key];
}

export function set(key, value) {
  state[key] = value;
  notify(key);
}

export function subscribe(key, callback) {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
}

function notify(key) {
  if (listeners[key]) {
    for (const cb of listeners[key]) {
      cb(state[key]);
    }
  }
}

// Helper to set a workout in the workouts map
export function setWorkout(workout) {
  const workouts = { ...state.workouts };
  const dateKey = workout.date;
  if (!workouts[dateKey]) workouts[dateKey] = [];
  const idx = workouts[dateKey].findIndex(w => w.id === workout.id);
  if (idx >= 0) {
    workouts[dateKey][idx] = workout;
  } else {
    workouts[dateKey].push(workout);
  }
  set('workouts', workouts);
}

// Helper to remove a workout
export function removeWorkout(id, date) {
  const workouts = { ...state.workouts };
  if (workouts[date]) {
    workouts[date] = workouts[date].filter(w => w.id !== id);
    if (workouts[date].length === 0) delete workouts[date];
  }
  set('workouts', workouts);
}

// Helper to load workouts from array into map
export function loadWorkouts(workoutArray) {
  const workouts = {};
  for (const w of workoutArray) {
    if (!workouts[w.date]) workouts[w.date] = [];
    workouts[w.date].push(w);
  }
  set('workouts', workouts);
}
