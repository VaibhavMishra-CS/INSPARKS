// icons.js — Shared SVG icon library for dashboard sidebar + theme toggle
// Used ONLY in dashboard-style sidebars (dashboard.html, vocab.html, reading.html, modules.html, mocks.html, etc.)

export const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,

  // Books -> Modules icon (Crackd.it style open book)
  modules: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,

  // Grammar -> Study Planner icon (PolyPrep style open notebook/planner)
  grammar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z"/><path d="M22 6a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z"/></svg>`,

  // Vocab -> PolyPrep "Aa" translate/vocab icon
  vocab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 15 4 15 7"/><line x1="9.5" y1="4" x2="9.5" y2="20"/><line x1="7" y1="20" x2="12" y2="20"/><path d="M15 20l3.5-9 3.5 9"/><path d="M16 17h5"/></svg>`,

  // Kanji -> a kanji character used as its own icon
  kanji: `<span class="nav-icon-kanji">字</span>`,

  reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,

  // Mocks -> PolyPrep "Full-length Tests" document icon
  mocks: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,

  review: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>`,

  // Stats -> Crackd.it bar chart icon
  stats: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,

  // Tracker -> Crackd.it trend line icon
  tracker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,

  // Theme toggle icons
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,

  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,

  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,

  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,

  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

// ============================================================
// THEME TOGGLE (Light / Dark like PolyPrep)
// ============================================================
export function initTheme() {
  const saved = localStorage.getItem('insparks_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('insparks_theme', next);
  updateThemeToggleUI(next);
}

export function updateThemeToggleUI(mode) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;
  const icon = mode === 'light' ? ICONS.sun : ICONS.moon;
  const label = mode === 'light' ? 'Light' : 'Dark';
  btn.innerHTML = `<span class="nav-icon">${icon}</span> ${label} <span class="theme-chevron">${ICONS.chevronDown}</span>`;
}

// ============================================================
// BUILD SIDEBAR — shared across every dashboard-style page
// activePage: 'home' | 'books' | 'grammar' | 'vocab' | 'kanji' | 'reading' | 'mocks' | 'review' | 'stats' | 'tracker'
// ============================================================
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

    <div class="sidebar-footer">
      <button class="theme-toggle-btn" id="theme-toggle-btn"></button>

      <div class="user-card" id="user-card-btn">
        <div class="avatar" id="user-avatar"></div>
        <div class="user-card-text">
          <div class="user-name" id="user-name">[USERNAME]</div>
          <div class="user-plan" id="user-email">Free</div>
        </div>
        <span class="user-card-chevron">${ICONS.chevronDown}</span>
      </div>
      <div id="user-menu" class="user-menu">
        <button class="user-menu-item" id="user-menu-profile"><span class="nav-icon">${ICONS.user}</span> Profile</button>
        <button class="user-menu-item" id="user-menu-signout"><span class="nav-icon">${ICONS.logout}</span> Sign out</button>
      </div>
    </div>
  `;
}

// Inject sidebar into .sidebar element, wire up theme toggle + user menu
export function mountSidebar(activePage) {
  const sidebarEl = document.querySelector('.sidebar');
  if (sidebarEl) sidebarEl.innerHTML = renderSidebar(activePage);

  initTheme();
  updateThemeToggleUI(document.documentElement.getAttribute('data-theme') || 'light');

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const userCardBtn = document.getElementById('user-card-btn');
  const userMenu = document.getElementById('user-menu');
  if (userCardBtn && userMenu) {
    userCardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('open');
    });
    document.addEventListener('click', () => userMenu.classList.remove('open'));
  }

  const signOutBtn = document.getElementById('user-menu-signout');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        const { signOutUser } = await import('/src/auth.js');
        await signOutUser();
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Sign out failed:', err);
      }
    });
  }
}