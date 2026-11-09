const svg = (paths, { fill = 'none', width = 2 } = {}) =>
  `<svg viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;

const HEART = '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>';

export const icons = {
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  snow: svg('<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2"/>'),
  flame: svg('<path d="M12 21c3.9 0 6.5-2.6 6.5-6.3 0-3.4-2.4-5.7-4-7.5-.4 1.9-1.4 3-2.5 3 .1-2.6-1-5.3-2.4-7.2C8.8 6.3 5.5 9 5.5 14.7 5.5 18.4 8.1 21 12 21Z"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>', { width: 2.4 }),
  minus: svg('<path d="M5 12h14"/>', { width: 2.4 }),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>', { width: 2.2 }),
  check: svg('<path d="M5 12.5 10 17 19 7"/>', { width: 2.6 }),
  heart: svg(HEART),
  heartFilled: svg(HEART, { fill: 'currentColor' }),
  book: svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>'),
  menu: svg('<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M8 2v4M16 2v4M4 10h16"/>'),
  cart: svg('<path d="M3 4h2.2l2.3 11h10.3l2.2-8H7"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>'),
  pen: svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="m13.5 6.5 4 4"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
  copy: svg('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  refresh: svg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  pot: svg('<path d="M10 3.5c-.8 1 .8 2 0 3M14 3.5c-.8 1 .8 2 0 3M3 10h18M5 10v3.5A5.5 5.5 0 0 0 10.5 19h3a5.5 5.5 0 0 0 5.5-5.5V10"/>'),
};
