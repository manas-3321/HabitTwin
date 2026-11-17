/**
 * HabitTwin API Client
 * Communicates with the FastAPI backend on /api/* (proxied via Vite).
 * Automatically caches logs in localStorage and falls back gracefully
 * if the backend server is offline so the UI always remains usable.
 */

// Support configurable backend URL for production cloud deployments (Vercel/Render)
const ENV_API = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
const API_BASE = ENV_API ? `${ENV_API}/api` : '/api';
const LOCAL_CACHE_KEY = 'habittwin_local_logs_v1';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let detail = 'Something went wrong talking to your digital twin.';
    try {
      const errData = await response.json();
      detail = errData.detail || detail;
    } catch {
      // Ignore JSON parse error on non-JSON error responses
    }
    throw new Error(detail);
  }
  return response.json();
}

export async function fetchHabits() {
  try {
    const logs = await request('/habits?limit=365');
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(logs));
    return { logs, offline: false };
  } catch {
    const cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '[]');
    return { logs: cached, offline: true };
  }
}

export async function saveHabitLog(entry) {
  const data = await request('/habits', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
  return data;
}

export async function updateHabitLog(id, updates) {
  return request(`/habits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteHabitLog(id) {
  return request(`/habits/${id}`, {
    method: 'DELETE',
  });
}

export async function seedSampleHabits() {
  return request('/habits/seed', { method: 'POST' });
}

export async function clearAllHabits() {
  localStorage.removeItem(LOCAL_CACHE_KEY);
  return request('/habits/clear', { method: 'DELETE' });
}

export async function fetchBehavioralAnalysis() {
  return request('/analysis');
}

export async function runPrediction({ horizon = '6_months', whatIf = null, monthlyIncome = 15000 }) {
  return request('/predict', {
    method: 'POST',
    body: JSON.stringify({
      horizon,
      what_if: whatIf,
      monthly_income: monthlyIncome,
    }),
  });
}

export async function generateFutureLetter({
  scenario = 'improved',
  horizon = '5_years',
  tone = 'motivational',
  userName = 'Friend',
}) {
  return request('/future-letter', {
    method: 'POST',
    body: JSON.stringify({
      scenario,
      horizon,
      tone,
      user_name: userName,
    }),
  });
}
