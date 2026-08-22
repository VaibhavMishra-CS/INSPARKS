// icons.js — Shared SVG icon library (styled, no emojis, no theme toggle)

export const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  modules: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  grammar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z"/><path d="M22 6a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z"/></svg>`,
  vocab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 15 4 15 7"/><line x1="9.5" y1="4" x2="9.5" y2="20"/><line x1="7" y1="20" x2="12" y2="20"/><path d="M15 20l3.5-9 3.5 9"/><path d="M16 17h5"/></svg>`,
  kanji: `<span class="nav-icon-kanji">字</span>`,
  reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  mocks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`,
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  tracker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  infoCircle: `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
  filterIcon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>`,
  closeX: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,

  // ---- TOP STAT BAR ----
  statLeaf: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#2F7DE1" d="M20.5 3.5c-6.5 0-13 3-16 10.5C2.5 20 6 21 9.5 20 17 18 20.5 11 20.5 3.5z"/><path fill="none" stroke="#ffffff" stroke-width="1.1" stroke-linecap="round" d="M18.5 5.5C13 9 9 13 5.5 18.5"/></svg>`,
  statBook: `<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="4" width="16" height="16" rx="3" fill="#E85B4A"/><rect x="8" y="9" width="8" height="1.6" rx="0.8" fill="#ffffff"/><rect x="8" y="13" width="8" height="1.6" rx="0.8" fill="#ffffff"/></svg>`,
  statFlame: `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#F0663A" d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-1-2.5-1-2.5 2 1 4 4 4 7.5a9 9 0 1 1-18 0c0-5 3-8 5-9 0 0-1 2 1 3 1-2-1-4 3-6z"/></svg>`,
  statFlameOutline: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9B9389" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1.5-1-2.5-1-2.5 2 1 4 4 4 7.5a9 9 0 1 1-18 0c0-5 3-8 5-9 0 0-1 2 1 3 1-2-1-4 3-6z"/></svg>`,
  youtubeImport: `<svg viewBox="0 0 24 24" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="4" fill="#FF3B30"/><path fill="#ffffff" d="M10 8.5l6 3.5-6 3.5z"/></svg>`,

  // Streak popover mascot — flame-headed character holding a flame
  streakMascot: `<svg viewBox="0 0 100 130" width="90" height="110">
    <path fill="#E2685E" d="M50 10c14 0 24 11 24 25 0 8-4 13-4 13h-40s-4-5-4-13c0-14 10-25 24-25z"/>
    <circle cx="38" cy="34" r="3" fill="#3A1210"/>
    <circle cx="62" cy="34" r="3" fill="#3A1210"/>
    <path fill="none" stroke="#3A1210" stroke-width="2.2" stroke-linecap="round" d="M40 44c3 3 7 4 10 4s7-1 10-4"/>
    <path fill="#3A2E12" d="M28 8c4-6 10-8 10-8s-2 6-1 9c-4-2-7-1-9-1z"/>
    <path fill="#3A2E12" d="M72 8c-4-6-10-8-10-8s2 6 1 9c4-2 7-1 9-1z"/>
    <rect x="30" y="52" width="40" height="46" rx="14" fill="#E2685E"/>
    <circle cx="18" cy="70" r="11" fill="#E2685E"/>
    <circle cx="82" cy="70" r="11" fill="#E2685E"/>
    <path fill="#F0663A" d="M50 62c2 5-3 6-3 10a6 6 0 0 0 12 0c0-2-1.5-3.5-1.5-3.5 3 1.5 6 5.5 6 10.5a10.5 10.5 0 1 1-21 0c0-6 3.5-10 6-11.5 0 0-1 2.5 1.5 4 1-3-1-5 4-9.5z"/>
    <rect x="34" y="102" width="12" height="16" rx="4" fill="#2B2B2B"/>
    <rect x="54" y="102" width="12" height="16" rx="4" fill="#2B2B2B"/>
  </svg>`,

  // ---- COMPREHENSION FACES ----
  faceHappy: `<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="#F5B942"/><circle cx="8.5" cy="10" r="1.2" fill="#3A2E12"/><circle cx="15.5" cy="10" r="1.2" fill="#3A2E12"/><path fill="none" stroke="#3A2E12" stroke-width="1.4" stroke-linecap="round" d="M8 14.5c1.2 1.4 2.6 2 4 2s2.8-.6 4-2"/></svg>`,
  faceSad: `<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="10" fill="#E2685E"/><circle cx="8.5" cy="10" r="1.2" fill="#4A1410"/><circle cx="15.5" cy="10" r="1.2" fill="#4A1410"/><path fill="none" stroke="#4A1410" stroke-width="1.4" stroke-linecap="round" d="M8 16c1.2-1.4 2.6-2 4-2s2.8.6 4 2"/></svg>`,
  helpCircle: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1.3 1-1.3 1.9"/><line x1="12" y1="17" x2="12" y2="17"/></svg>`,

  // ---- VIDEO CARD 3-DOT MENU ----
  dotsVertical: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>`,
  addAlbum: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v3h3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/></svg>`,
  markWatched: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>`,
  completedCheck: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#1E9E63" stroke="none"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>`,
  hideVideo: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><line x1="3" y1="21" x2="21" y2="3"/></svg>`,
  hideChannel: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 4.5 2"/><line x1="16" y1="16" x2="22" y2="22"/><line x1="22" y1="16" x2="16" y2="22"/></svg>`,
};

export function getComprehensionFace(pctString) {
  const pct = parseInt(pctString, 10) || 0;
  return pct >= 70
    ? { icon: ICONS.faceHappy, color: "#F5B942" }
    : { icon: ICONS.faceSad, color: "#E2685E" };
}

export function renderSidebar(activePage) {
  const nav = (page, href, icon, label, id) => `
    <a class="nav-item${activePage === page ? ' active' : ''}" href="${href}"${id ? ` id="${id}"` : ''}>
      <span class="nav-icon">${icon}</span> ${label}
    </a>`;

  return `
    <div class="sidebar-logo"><span class="mark">語</span> <span class="placeholder">INSPARKS</span></div>
    <nav class="sidebar-nav">
      ${nav('home', 'dashboard.html', ICONS.home, 'Home')}
      <div class="nav-group">
        <div class="nav-group-label">Learn</div>
        ${nav('books', 'modules.html', ICONS.modules, 'Books')}
        ${nav('grammar', 'grammar.html', ICONS.grammar, 'Grammar')}
        ${nav('vocab', 'vocab.html?mode=vocab', ICONS.vocab, 'Vocab', 'nav-vocab')}
        ${nav('kanji', 'vocab.html?mode=kanji', ICONS.kanji, 'Kanji', 'nav-kanji')}
        ${nav('reading', 'reading.html', ICONS.reading, 'Reading')}
      </div>
      <div class="nav-group">
        <div class="nav-group-label">Practice</div>
        ${nav('mocks', 'mocks.html', ICONS.mocks, 'Mocks')}
        ${nav('review', 'review.html', ICONS.review, 'Review')}
      </div>
      <div class="nav-group">
        <div class="nav-group-label">Progress</div>
        ${nav('stats', 'stats.html', ICONS.stats, 'Stats')}
        ${nav('tracker', 'tracker.html', ICONS.tracker, 'Tracker')}
      </div>
    </nav>
  `;
}

export function mountSidebar(activePage) {
  const sidebarEl = document.querySelector('.sidebar');
  if (sidebarEl) sidebarEl.innerHTML = renderSidebar(activePage);
}