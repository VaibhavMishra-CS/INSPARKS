// dashboard.js - SPA Pattern with Firestore Integration

import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, requireAuth, renderAuthUI, signOutUser } from "./auth.js";
import { initTracker } from "./tracker.js";

const db = getFirestore();

// ---- Get current user or throw error ----
function requireUser() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No user is signed in.");
  }
  return user;
}

// ---- Firestore: Set user item ----
export async function setUserItem(key, value) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, { [key]: value }, { merge: true });
}

// ---- Firestore: Get user item ----
export async function getUserItem(key) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data()[key] ?? null;
}

// ---- Firestore: Get all user data ----
export async function getUserData() {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : {};
}

// ---- Firestore: Update multiple fields ----
export async function updateUserData(fields) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, fields, { merge: true });
}

// ---- Save game progress ----
export async function saveProgress(level, score) {
  await updateUserData({
    lastLevel: level,
    lastScore: score,
    updatedAt: Date.now()
  });
}

// ---- Load dashboard data ----
export async function loadDashboard() {
  const data = await getUserData();
  return {
    level: data.lastLevel ?? "N5",
    score: data.lastScore ?? 0,
    streak: data.streak ?? 0,
    settings: data.settings ?? {}
  };
}

// ---- Update daily goal progress ----
export async function updateDailyGoal(cardsReviewed) {
  await updateUserData({
    dailyGoalProgress: cardsReviewed,
    lastReviewDate: new Date().toISOString().split("T")[0]
  });
}

// ===== SPA ROUTING =====
// currentDashboardData is cached once at load so re-rendering "home"
// (e.g. after visiting another page and clicking Home again) doesn't
// need a fresh Firestore read just to redraw the daily-goal ring.
let currentDashboardData = { level: "N5", score: 0, streak: 0, settings: {} };
let activePage = "home";
let readingModule = null; // cached dynamic import of reading-main.jsx

// Pages that render inline HTML into #main-content.
// "reading" is handled separately below since it mounts a React root
// instead of setting innerHTML.
const pages = {
  home: { title: "Home", load: () => renderHome() },
  books: { title: "Books", load: () => renderBooks() },
  grammar: { title: "Grammar", load: () => renderGrammar() },
  vocab: { title: "Vocab", load: () => renderVocab() },
  kanji: { title: "Kanji", load: () => renderKanji() },
  mocks: { title: "Mocks", load: () => renderMocks() },
  review: { title: "Review", load: () => renderReview() },
  stats: { title: "Stats", load: () => renderStats() },
  tracker: { title: "Tracker", load: () => renderTracker() }
};

// ===== PAGE RENDERERS =====

function renderHome() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div class="top-row">
      <div class="stat-card">
        <div class="stat-card-head"><h3>Daily Goal</h3><span class="stat-card-icon">🏆</span></div>
        <div class="stat-card-body">
          <div class="progress-ring">
            <svg viewBox="0 0 100 100">
              <circle class="ring-bg" cx="50" cy="50" r="42"></circle>
              <circle class="ring-fg" id="daily-goal-ring" cx="50" cy="50" r="42"></circle>
            </svg>
            <div class="ring-label">
              <span class="ring-num" id="daily-goal-num">0</span>
              <span class="ring-total">/15</span>
            </div>
          </div>
          <div class="stat-card-desc">Cards reviewed today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card-head"><h3>Mistakes</h3></div>
        <div class="stat-card-body row">
          <span class="mistake-icon">🗑️</span>
          <div class="mistake-num">0<span>/10</span></div>
        </div>
      </div>
    </div>

    <section class="game-launcher">
      <div class="shoji-bg" aria-hidden="true"></div>
      <div class="launcher-content">
        <button class="launcher-node" id="previous-games-btn">
          <span class="node-icon">↺</span>
          <span class="node-kanji">続き</span>
          <span class="node-label">Previous Games</span>
        </button>

        <button class="launcher-hub" id="play-btn">
          <span class="hub-ring ring-1"></span>
          <span class="hub-ring ring-2"></span>
          <span class="hub-label">PLAY</span>
        </button>

        <button class="launcher-node" id="achievements-btn">
          <span class="node-icon">🎖️</span>
          <span class="node-kanji">実績</span>
          <span class="node-label">Achievements</span>
        </button>
      </div>
    </section>
  `;

  wireHomeWidgets();
}

// Re-wires the widgets inside the home template above. Needs to be
// called every time renderHome() runs (not just once on load), since
// navigating to another page and back destroys and recreates these
// elements.
function wireHomeWidgets() {
  const dailyGoalNum = document.getElementById("daily-goal-num");
  const dailyGoalRing = document.getElementById("daily-goal-ring");
  if (dailyGoalNum && dailyGoalRing) {
    const progress = currentDashboardData.score || 0;
    dailyGoalNum.textContent = Math.min(progress, 15);
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (Math.min(progress, 15) / 15) * circumference;
    dailyGoalRing.style.strokeDashoffset = offset;
  }

  const playBtn = document.getElementById("play-btn");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      const modal = document.getElementById("levelSelectModal");
      if (modal) modal.style.display = "flex";
    });
  }

  const previousGamesBtn = document.getElementById("previous-games-btn");
  if (previousGamesBtn) {
    previousGamesBtn.addEventListener("click", () => {
      alert("Previous games feature coming soon!");
    });
  }

  const achievementsBtn = document.getElementById("achievements-btn");
  if (achievementsBtn) {
    achievementsBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }
}

function renderBooks() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">📚 Books</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="margin-bottom: 8px;">Book 1: Hiragana</h4>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Learn the basics</p>
        </div>
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="margin-bottom: 8px;">Book 2: Katakana</h4>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Learn foreign words</p>
        </div>
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px;">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="margin-bottom: 8px;">Book 3: Kanji</h4>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Master the characters</p>
        </div>
      </div>
    </div>
  `;
}

function renderGrammar() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">文 Grammar</h2>
      <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 16px;">Grammar lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Grammar module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderVocab() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">言 Vocabulary</h2>
      <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 16px;">Vocabulary lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Vocab module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderKanji() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">字 Kanji</h2>
      <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 16px;">Kanji lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Kanji module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderMocks() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">📝 Mock Tests</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; cursor: pointer;" onclick="alert('Mock test N5 coming soon!')">
          <h4 style="margin-bottom: 8px;">N5 Mock Test</h4>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Beginner level</p>
        </div>
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; cursor: pointer;" onclick="alert('Mock test N4 coming soon!')">
          <h4 style="margin-bottom: 8px;">N4 Mock Test</h4>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Elementary level</p>
        </div>
      </div>
    </div>
  `;
}

function renderReview() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">🔁 Review</h2>
      <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 16px;">Review your progress and revisit weak areas...</p>
        <button class="btn btn-primary" onclick="alert('Review module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderStats() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">📊 Statistics</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; color: #1FA89F; font-weight: bold; margin-bottom: 8px;">0</div>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Total Cards Learned</p>
        </div>
        <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; color: #1FA89F; font-weight: bold; margin-bottom: 8px;">0%</div>
          <p style="color: var(--text-muted); font-size: 14px; margin: 0;">Accuracy Rate</p>
        </div>
      </div>
    </div>
  `;
}

function renderTracker() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 12px;">
      <h2 style="margin-bottom: 24px;">📈 Progress Tracker</h2>
      <div style="background: var(--surface-subtle); border: 1px solid var(--panel-border); border-radius: 12px; padding: 24px;">
        <p style="color: var(--text-muted); margin-bottom: 16px;">Track your learning progress over time...</p>
        <button class="btn btn-primary" onclick="alert('Tracker coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

// ===== PAGE LOADING (handles both inline-HTML pages and the
//       React-mounted Reading page) =====
async function loadPage(page) {
  // Unmount the React reading root if we're navigating away from it.
  if (activePage === "reading" && page !== "reading" && readingModule) {
    readingModule.unmountReading();
  }

  const mainContent = document.getElementById("main-content");

  if (page === "reading") {
    mainContent.innerHTML = "";
    if (!readingModule) {
      readingModule = await import("./reading-main.jsx");
    }
    readingModule.mountReading(mainContent);
  } else if (pages[page]) {
    pages[page].load();
  } else {
    // Unknown page key (e.g. stale hash) -> fall back to home
    pages.home.load();
    page = "home";
  }

  activePage = page;
}

// ===== NAVIGATION HANDLER =====
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');

  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page === activePage) return;

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      history.replaceState(null, '', page === 'home' ? 'dashboard.html' : `dashboard.html#${page}`);

      await loadPage(page);
    });
  });
}

function highlightActiveNavItem(page) {
  document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
}

// ===== GAME FUNCTIONS =====
window.loadGame = function(level) {
  console.log("Loading level:", level);
  const modal = document.getElementById("levelSelectModal");
  if (modal) modal.style.display = "none";

  const gameUI = document.getElementById("gameUI");
  if (gameUI) {
    gameUI.style.display = "block";
    const selectedLevelEl = document.getElementById("selectedLevel");
    if (selectedLevelEl) selectedLevelEl.textContent = level;

    saveProgress(level, 0).catch(err => console.error("Failed to save progress:", err));
  }
};

window.goBackToDashboard = function() {
  const gameUI = document.getElementById("gameUI");
  if (gameUI) gameUI.style.display = "none";

  document.querySelector('[data-page="home"]')?.click();
};

// ===== INITIALIZE DASHBOARD =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Verify user is logged in
    const user = await requireAuth("index.html");
    console.log("User authenticated:", user.email);

    // Render user card with name/email + the View Profile / Light mode / Log out menu
    renderAuthUI();

    // Start site-wide tracking (daily streak + study time) for this session
    initTracker();

    // Load user data once and cache it for re-renders of the home view
    currentDashboardData = await loadDashboard();
    console.log("Dashboard data loaded:", currentDashboardData);

    // Setup SPA navigation
    setupNavigation();

    // Wire up quick-practice button (lives in the right rail, stable
    // across page swaps, so it only needs wiring once)
    const quickPracticeBtn = document.getElementById("quick-practice-btn");
    if (quickPracticeBtn) {
      quickPracticeBtn.addEventListener("click", () => {
        const modal = document.getElementById("levelSelectModal");
        if (modal) modal.style.display = "flex";
      });
    }

    // Resolve initial page from the URL hash (supports deep links like
    // dashboard.html#reading), defaulting to home
    const initialPage = (location.hash || "#home").replace("#", "");
    const resolvedInitialPage = (pages[initialPage] || initialPage === "reading") ? initialPage : "home";
    highlightActiveNavItem(resolvedInitialPage);
    await loadPage(resolvedInitialPage);

    console.log("Dashboard initialized successfully with SPA routing");
  } catch (err) {
    console.error("Dashboard initialization error:", err);
    window.location.href = "index.html";
  }
});