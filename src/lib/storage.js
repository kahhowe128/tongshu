// Local persistence of the same settings string used in the shareable URL hash.
// URL hash always wins (share links); localStorage is the fallback. Nothing leaves the device.
const KEY = 'tongshu.settings.v1';
export function loadSaved() { try { return (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || ''; } catch (e) { return ''; } }
export function saveLocal(s) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, s); } catch (e) {} }
