// Local persistence of the same settings string used in the shareable URL hash.
// URL hash always wins (share links); localStorage is the fallback. Nothing leaves the device.
const KEY = 'tongshu.settings.v1';
export function loadSaved() { try { return (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || ''; } catch (e) { return ''; } }
export function saveLocal(s) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, s); } catch (e) {} }

// Saved / favourite dates (Phase 3 WS-4) — local only, versioned, nothing transmitted.
// Stored as a JSON array of integer JDNs.
const SAVED_KEY = 'tongshu.saved.v1';
export function loadSavedDates() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const arr = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(arr) ? arr.filter(n => Number.isInteger(n)) : [];
  } catch (e) { return []; }
}
export function saveSavedDates(jdns) {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem(SAVED_KEY, JSON.stringify(jdns)); } catch (e) {}
}
