/**
 * HabitTwin API Client
 * Communicates with the FastAPI backend on /api/* (proxied via Vite).
 * Automatically caches logs in localStorage and falls back gracefully
 * if the backend server is offline so the UI always remains usable.
 */

// Support configurable backend URL for production cloud deployments (Vercel/Render)
const PROD_DEFAULT_BACKEND = 'https://habittwin.onrender.com';
const ENV_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : (import.meta.env.PROD ? PROD_DEFAULT_BACKEND : '');
const API_BASE = ENV_API ? `${ENV_API}/api` : '/api';
const LOCAL_CACHE_KEY = 'habittwin_local_logs_v1';
const AUTH_TOKEN_KEY = 'habittwin_auth_token';
const LOCAL_USERS_KEY = 'habittwin_local_users_v1';
const LOCAL_CURRENT_USER_KEY = 'habittwin_current_user_v1';

async function request(path, options = {}) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
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
  try {
    const data = await request('/habits', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return data;
  } catch (err) {
    console.warn('Backend save failed, updating local offline cache:', err);
    const cached = JSON.parse(localStorage.getItem(LOCAL_CACHE_KEY) || '[]');
    const newEntry = {
      id: Date.now(),
      ...entry,
      total_spending: Number(entry.total_spending) || (Number(entry.spending_food || 0) + Number(entry.spending_entertainment || 0) + Number(entry.spending_misc || 0)),
    };
    const filtered = cached.filter((c) => c.date !== entry.date);
    const updated = [newEntry, ...filtered];
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(updated));
    return newEntry;
  }
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
  horizon = '6_months',
  tone = 'motivational',
  userName = 'Friend',
  userFocus = 'balanced',
  currentHabits = null,
  targetHabits = null,
  streakDays = 0,
  latestNotes = '',
}) {
  return request('/future-letter', {
    method: 'POST',
    body: JSON.stringify({
      scenario,
      horizon,
      tone,
      user_name: userName,
      user_focus: userFocus,
      current_habits: currentHabits,
      target_habits: targetHabits,
      streak_days: streakDays,
      latest_notes: latestNotes,
    }),
  });
}

// ==========================================
// User Authentication Client APIs
// ==========================================

export async function registerUser({ name, email, password }) {
  try {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    if (data?.user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('already exists')) {
      throw err;
    }
    console.warn('Backend register failed, saving to local fallback storage:', err);
    const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim() || 'Student';
    if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }
    const newId = Date.now();
    const newUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      password: password,
      current_streak: 0,
      best_streak: 0,
      streak_freezes_available: 2,
      streak_freezes_used: [],
      cert_6m_sent: false,
      cert_6m_sent_at: null,
      cert_sent_to_email: null,
      claimed_rewards: [],
      created_at: new Date().toISOString(),
    };
    localUsers.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
    const token = `local_token_${newId}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(newUser));
    return { token, user: newUser };
  }
}

export async function loginUser({ email, password }) {
  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    }
    if (data?.user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(data.user));
    }
    return data;
  } catch (err) {
    console.warn('Backend login attempt failed, checking local credentials:', err);
    const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const cleanEmail = String(email).trim().toLowerCase();
    const matched = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.password === password) {
        const token = `local_token_${matched.id}`;
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(matched));
        return { token, user: matched };
      } else {
        throw new Error('Invalid email or password.');
      }
    }
    throw err;
  }
}

export async function fetchCurrentUser() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) return null;
  if (token.startsWith('local_token_')) {
    const stored = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }
  try {
    const user = await request('/auth/me');
    if (user) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    const stored = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    return null;
  }
}

export async function updateUserName(name) {
  try {
    const data = await request('/auth/update-name', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (data) {
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(data));
    }
    return data;
  } catch (err) {
    const stored = localStorage.getItem(LOCAL_CURRENT_USER_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.name = name;
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(parsed));
      return parsed;
    }
    throw err;
  }
}

export function logoutUser() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LOCAL_CURRENT_USER_KEY);
}

// ==========================================
// Automated Certificate & Email Client APIs
// ==========================================

export async function fetchCertificateStatus() {
  try {
    return await request('/certificate/status');
  } catch {
    return {
      cert_6m_sent: false,
      cert_6m_sent_at: null,
      cert_sent_to_email: null,
      current_streak: 0,
      best_streak: 0,
      eligible: false,
    };
  }
}

export async function sendCertificateEmail({ email = null, name = null, forceTest = false } = {}) {
  return request('/certificate/send-email', {
    method: 'POST',
    body: JSON.stringify({ email, name, force_test: forceTest }),
  });
}

export function getCertificateDownloadUrl(name = '') {
  const query = name ? `?name=${encodeURIComponent(name)}` : '';
  return `${API_BASE}/certificate/download${query}`;
}

// ==========================================
// Streak Freeze & Streak Restore Client APIs
// ==========================================

export const STREAK_FREEZES_KEY = 'habittwin_streak_freezes';
export const STREAK_FROZEN_DATES_KEY = 'habittwin_frozen_dates';

export function getLocalStreakFreezes() {
  try {
    const saved = localStorage.getItem(STREAK_FREEZES_KEY);
    return saved !== null ? parseInt(saved, 10) : 2;
  } catch {
    return 2;
  }
}

export function setLocalStreakFreezes(count) {
  try {
    localStorage.setItem(STREAK_FREEZES_KEY, String(count));
  } catch {}
}

export function getLocalFrozenDates() {
  try {
    const saved = localStorage.getItem(STREAK_FROZEN_DATES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function setLocalFrozenDates(dates) {
  try {
    localStorage.setItem(STREAK_FROZEN_DATES_KEY, JSON.stringify(dates));
  } catch {}
}

export async function fetchStreakStatus() {
  try {
    const data = await request('/streak/status');
    if (data) {
      setLocalStreakFreezes(data.freezes_available);
      setLocalFrozenDates(data.freezes_used);
      return data;
    }
  } catch {
    // Fallback to local storage
  }
  return {
    current_streak: 0,
    best_streak: 0,
    freezes_available: getLocalStreakFreezes(),
    freezes_used: getLocalFrozenDates(),
    is_streak_broken: false,
    broken_date: null,
    is_protected_today: false,
    can_restore: false,
    message: 'Local streak freeze status',
  };
}

export async function applyStreakFreeze(date = null) {
  try {
    const data = await request('/streak/freeze', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    if (data) {
      setLocalStreakFreezes(data.freezes_available);
      setLocalFrozenDates(data.freezes_used);
      return data;
    }
  } catch {
    // Fallback
  }
  const curFreezes = getLocalStreakFreezes();
  const frozen = getLocalFrozenDates();
  const targetDate = date || new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (!frozen.includes(targetDate) && curFreezes > 0) {
    const nextFreezes = Math.max(0, curFreezes - 1);
    const nextFrozen = [...frozen, targetDate];
    setLocalStreakFreezes(nextFreezes);
    setLocalFrozenDates(nextFrozen);
    return {
      success: true,
      freezes_available: nextFreezes,
      freezes_used: nextFrozen,
      message: `🧊 Streak freeze applied for ${targetDate}!`,
      is_protected_today: true,
      is_streak_broken: false,
    };
  }
  return {
    success: false,
    freezes_available: curFreezes,
    freezes_used: frozen,
    message: 'No freezes left or date already frozen.',
  };
}

export async function restoreStreak(date = null) {
  try {
    const data = await request('/streak/restore', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
    if (data) {
      setLocalStreakFreezes(data.freezes_available);
      setLocalFrozenDates(data.freezes_used);
      return data;
    }
  } catch {
    // Fallback
  }
  return applyStreakFreeze(date);
}

export async function replenishStreakFreeze(amount = 1, reason = 'reward') {
  try {
    const data = await request('/streak/replenish', {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
    if (data) {
      setLocalStreakFreezes(data.freezes_available);
      setLocalFrozenDates(data.freezes_used);
      return data;
    }
  } catch {
    // Fallback
  }
  const cur = getLocalStreakFreezes();
  const next = Math.min(3, cur + amount);
  setLocalStreakFreezes(next);
  return {
    success: true,
    freezes_available: next,
    freezes_used: getLocalFrozenDates(),
    message: `⚡ +${amount} Freeze added!`,
  };
}
