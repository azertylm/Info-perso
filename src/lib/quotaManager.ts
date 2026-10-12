/**
 * Quota & Anti-Abuse Manager for ALPHABETTE Suite
 * 
 * Rules:
 * - Days 1 to 7: 20 free requests / day on internal Alphabette key
 * - Day 8+ (no subscription): 5 requests / day limit on internal Alphabette key
 * - Subscribed User (15 €/yr single app or 40 €/yr bundle): Unlimited requests on BYOK key
 * - Daily automatic reset at midnight
 */

export interface QuotaStatus {
  dailyCount: number;
  dailyLimit: number;
  remaining: number;
  isTrial: boolean;
  daysElapsed: number;
  trialDaysLeft: number;
  isSubscribed: boolean;
  isQuotaExceeded: boolean;
  currentDate: string; // YYYY-MM-DD
  msUntilReset: number;
  formattedTimeUntilReset: string;
}

const STORAGE_KEY_QUOTA = "alphabette_user_quota_v1";
const STORAGE_KEY_REGISTRATION = "alphabette_user_registered_at";
const STORAGE_KEY_SUBSCRIPTION = "alphabette_user_plan";

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return Math.max(0, midnight.getTime() - now.getTime());
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function getRegistrationTimestamp(): number {
  let regStr = localStorage.getItem(STORAGE_KEY_REGISTRATION);
  if (!regStr) {
    const trialStarted = localStorage.getItem("alphabette_trial_started_at");
    if (trialStarted && !isNaN(Number(trialStarted))) {
      regStr = trialStarted;
    } else {
      regStr = Date.now().toString();
      localStorage.setItem(STORAGE_KEY_REGISTRATION, regStr);
      localStorage.setItem("alphabette_trial_started_at", regStr);
    }
  }
  const timestamp = Number(regStr);
  return isNaN(timestamp) ? Date.now() : timestamp;
}

export function isUserSubscribed(): boolean {
  const plan = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
  const code = localStorage.getItem("alphabette_access_code");
  return Boolean(
    (plan && plan !== "free" && plan !== "trial") ||
    (code && code.trim().length > 0)
  );
}

export function getQuotaStatus(): QuotaStatus {
  const today = getLocalDateString();
  const registeredAt = getRegistrationTimestamp();
  const daysElapsed = Math.floor((Date.now() - registeredAt) / (1000 * 60 * 60 * 24));
  const isTrial = daysElapsed < 7;
  const trialDaysLeft = Math.max(0, 7 - daysElapsed);
  const subscribed = isUserSubscribed();

  const dailyLimit = subscribed ? Infinity : (isTrial ? 20 : 5);

  let raw = localStorage.getItem(STORAGE_KEY_QUOTA);
  let state = { date: today, count: 0 };
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        state.count = Number(parsed.count) || 0;
      } else {
        // Daily reset
        state = { date: today, count: 0 };
        localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(state));
      }
    } catch {
      state = { date: today, count: 0 };
    }
  } else {
    localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(state));
  }

  const remaining = subscribed ? Infinity : Math.max(0, dailyLimit - state.count);
  const isQuotaExceeded = !subscribed && state.count >= dailyLimit;
  const msUntilReset = getMsUntilMidnight();

  return {
    dailyCount: state.count,
    dailyLimit,
    remaining,
    isTrial,
    daysElapsed,
    trialDaysLeft,
    isSubscribed: subscribed,
    isQuotaExceeded,
    currentDate: today,
    msUntilReset,
    formattedTimeUntilReset: formatDuration(msUntilReset),
  };
}

export function incrementQuotaUsage(): QuotaStatus {
  const today = getLocalDateString();
  let raw = localStorage.getItem(STORAGE_KEY_QUOTA);
  let state = { date: today, count: 0 };

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.date === today) {
        state.count = Number(parsed.count) || 0;
      }
    } catch {
      state = { date: today, count: 0 };
    }
  }

  state.count += 1;
  state.date = today;
  localStorage.setItem(STORAGE_KEY_QUOTA, JSON.stringify(state));

  // Dispatch custom event so all reactive UI components update instantly
  window.dispatchEvent(new CustomEvent("alphabette_quota_updated"));

  return getQuotaStatus();
}
