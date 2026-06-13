// Original SVG icon system (Phase 3 WS-2). Geometric / woodblock-almanac aesthetic to match the seal.
// Every icon inherits `currentColor` (stroke or fill) so all four themes — incl. 红运 — recolour it.
// 24px viewBox, rendered at any size; each carries a <title> for accessibility. No external assets.
import React from 'react';

// name -> inner SVG markup (stroke-based, currentColor)
const PATHS = {
  // tabs / nav
  home: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />,
  find: <g><circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" /></g>,
  calendar: <g><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></g>,
  learn: <path d="M12 6c-2-1.4-5-1.4-7 0v11c2-1.4 5-1.4 7 0 2-1.4 5-1.4 7 0V6c-2-1.4-5-1.4-7 0z" />,
  academy: <g><path d="M3 8 12 4l9 4-9 4z" /><path d="M7 10.5V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.5" /></g>,
  tools: <path d="M14.5 6a3.5 3.5 0 0 0-4.6 4.3L4 16.2 6.8 19l5.9-5.9A3.5 3.5 0 0 0 17 8.5l-2 2-1.5-1.5 2-2A3.5 3.5 0 0 0 14.5 6z" />,
  settings: <g><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></g>,
  // actions
  save: <path d="m12 4 2.4 5 5.6.6-4.1 3.7 1.2 5.5L12 21l-5.1 2.8 1.2-5.5L4 9.6 9.6 9z" />,
  share: <g><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="m8.1 10.9 6.8-3.8M8.1 13.1l6.8 3.8" /></g>,
  export: <g><path d="M12 4v10M8.5 10.5 12 14l3.5-3.5" /><path d="M5 17v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2" /></g>,
  whatsapp: <g><path d="M5 19l1-3.4A7 7 0 1 1 9.4 18z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.4 1-1l-1.6-.8-1 .9c-1.2-.5-2.1-1.4-2.6-2.6l.9-1L10.5 9c0-.6-.4-1-1-1-.3 0-.5.5-.5 1.5z" /></g>,
  email: <g><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></g>,
  back: <path d="M15 5 8 12l7 7" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  video: <g><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.3v5.4l4.6-2.7z" /></g>,
  article: <g><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></g>,
  info: <g><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.6v.01" /></g>,
  // verdict glyphs (filled / stroke)
  vGood: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  vBad: <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />,
  vWarn: <path d="M4 13c2-3 4-3 6 0s4 3 6-0 4-3 6 0" transform="translate(-1 0)" />,
  vNeutral: <path d="M6 12h12" />,
  // activity categories (健康/婚嫁/居家/事业/出行/祭祀/农事/杂事/凶事)
  catHealth: <path d="M12 20S5 15 5 9.8A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.8C19 15 12 20 12 20z" />,
  catMarriage: <g><circle cx="9" cy="13" r="4" /><circle cx="15" cy="13" r="4" /><path d="M9 6l1.5 2M15 6l-1.5 2" /></g>,
  catHome: <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />,
  catBusiness: <g><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></g>,
  catTravel: <g><circle cx="12" cy="12" r="8" /><path d="m12 5 2.2 4.8L19 12l-4.8 2.2L12 19l-2.2-4.8L5 12l4.8-2.2z" /></g>,
  catRitual: <g><path d="M12 3v5" /><path d="M9 8h6l-1 4h-4z" /><path d="M7 16h10v3a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" /></g>,
  catAgriculture: <g><path d="M12 21v-9" /><path d="M12 12c-3 0-5-2-5-5 3 0 5 2 5 5zM12 13c3 0 5-2 5-5-3 0-5 2-5 5z" /></g>,
  catMisc: <g><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /></g>,
  catInauspicious: <g><path d="M9 8h6l-1 11a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z" /><path d="M8 8c0-2 1.8-3 4-3s4 1 4 3" /></g>,
};

export function Icon({ name, size = 24, title, className, style, strokeWidth = 1.8 }) {
  const inner = PATHS[name];
  if (!inner) return null;
  const filled = name === 'save' || name === 'home' || name === 'catHome';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style}
      fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      <title>{title || name}</title>
      {inner}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(PATHS);
