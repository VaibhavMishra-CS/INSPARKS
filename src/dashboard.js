// dashboard.js - SPA Pattern with Firestore Integration

import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, requireAuth, renderAuthUI, signOutUser } from "/src/auth.js";

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
// Pages that can be loaded into the side panel
const pages = {
  home: {
    title: "Home",
    load: () => renderHome()
  },
  books: {
    title: "Books",
    load: () => renderBooks()
  },
  grammar: {
    title: "Grammar",
    load: () => renderGrammar()
  },
  vocab: {
    title: "Vocab",
    load: () => renderVocab()
  },
  kanji: {
    title: "Kanji",
    load: () => renderKanji()
  },
  reading: {
    title: "Reading",
    load: () => renderReading()
  },
  mocks: {
    title: "Mocks",
    load: () => renderMocks()
  },
  review: {
    title: "Review",
    load: () => renderReview()
  },
  stats: {
    title: "Stats",
    load: () => renderStats()
  },
  tracker: {
    title: "Tracker",
    load: () => renderTracker()
  }
};

// ===== PAGE RENDERERS =====
// These functions only update the main content area, NOT the dashboard

function renderHome() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="text-align: center; padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 16px;">Welcome to INSPARKS</h2>
      <p style="color: #6B6359; margin-bottom: 24px;">Select a section from the sidebar to get started with your Japanese learning journey.</p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px;">
          <h4 style="color: #1A1410; margin-bottom: 8px;">📚 Books</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Learn from structured books and modules</p>
        </div>
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px;">
          <h4 style="color: #1A1410; margin-bottom: 8px;">📝 Practice</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Test your knowledge with mocks and drills</p>
        </div>
      </div>
    </div>
  `;
}

function renderBooks() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">📚 Books</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#EBE7E0'" onmouseout="this.style.background='#F8F6F3'">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="color: #1A1410; margin-bottom: 8px;">Book 1: Hiragana</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Learn the basics</p>
        </div>
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#EBE7E0'" onmouseout="this.style.background='#F8F6F3'">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="color: #1A1410; margin-bottom: 8px;">Book 2: Katakana</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Learn foreign words</p>
        </div>
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#EBE7E0'" onmouseout="this.style.background='#F8F6F3'">
          <div style="font-size: 32px; margin-bottom: 12px;">📖</div>
          <h4 style="color: #1A1410; margin-bottom: 8px;">Book 3: Kanji</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Master the characters</p>
        </div>
      </div>
    </div>
  `;
}

function renderGrammar() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">文 Grammar</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Grammar lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Grammar module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderVocab() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">言 Vocabulary</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Vocabulary lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Vocab module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderKanji() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">字 Kanji</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Kanji lessons coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Kanji module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderReading() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">📖 Reading</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Reading exercises coming soon...</p>
        <button class="btn btn-primary" onclick="alert('Reading module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderMocks() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">📝 Mock Tests</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; cursor: pointer;" onclick="alert('Mock test N5 coming soon!')">
          <h4 style="color: #1A1410; margin-bottom: 8px;">N5 Mock Test</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Beginner level</p>
        </div>
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; cursor: pointer;" onclick="alert('Mock test N4 coming soon!')">
          <h4 style="color: #1A1410; margin-bottom: 8px;">N4 Mock Test</h4>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Elementary level</p>
        </div>
      </div>
    </div>
  `;
}

function renderReview() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">🔁 Review</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Review your progress and revisit weak areas...</p>
        <button class="btn btn-primary" onclick="alert('Review module coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

function renderStats() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">📊 Statistics</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; color: #1FA89F; font-weight: bold; margin-bottom: 8px;">0</div>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Total Cards Learned</p>
        </div>
        <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; color: #1FA89F; font-weight: bold; margin-bottom: 8px;">0%</div>
          <p style="color: #6B6359; font-size: 14px; margin: 0;">Accuracy Rate</p>
        </div>
      </div>
    </div>
  `;
}

function renderTracker() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <div style="padding: 40px; background: #FFFFFF; border: 1px solid #D4CEC4; border-radius: 12px;">
      <h2 style="color: #1A1410; margin-bottom: 24px;">📈 Progress Tracker</h2>
      <div style="background: #F8F6F3; border: 1px solid #D4CEC4; border-radius: 12px; padding: 24px;">
        <p style="color: #6B6359; margin-bottom: 16px;">Track your learning progress over time...</p>
        <button class="btn btn-primary" onclick="alert('Tracker coming soon!')">Coming Soon</button>
      </div>
    </div>
  `;
}

// ===== NAVIGATION HANDLER =====
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const page = item.dataset.page;
      
      // Update active state
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      
      // Load page content
      if (pages[page]) {
        pages[page].load();
      }
    });
  });
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
  
  // Reset to home view
  const homeItem = document.querySelector('[data-page="home"]');
  if (homeItem) homeItem.click();
};

// ===== INITIALIZE DASHBOARD =====
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Verify user is logged in
    const user = await requireAuth("index.html");
    console.log("User authenticated:", user.email);

    // Render user card with name/email
    renderAuthUI();

    // Load user data
    const dashboardData = await loadDashboard();
    console.log("Dashboard data loaded:", dashboardData);

    // Update daily goal ring
    const dailyGoalNum = document.getElementById("daily-goal-num");
    const dailyGoalRing = document.getElementById("daily-goal-ring");
    if (dailyGoalNum && dailyGoalRing) {
      const progress = dashboardData.score || 0;
      dailyGoalNum.textContent = Math.min(progress, 15);
      const circumference = 2 * Math.PI * 42;
      const offset = circumference - (Math.min(progress, 15) / 15) * circumference;
      dailyGoalRing.style.strokeDashoffset = offset;
    }

    // Setup navigation (SPA routing)
    setupNavigation();

    // Wire up PLAY button
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const modal = document.getElementById("levelSelectModal");
        if (modal) modal.style.display = "flex";
      });
    }

    // Wire up other buttons
    const previousGamesBtn = document.getElementById("previous-games-btn");
    if (previousGamesBtn) {
      previousGamesBtn.addEventListener("click", () => {
        alert("Previous games feature coming soon!");
      });
    }

    const achievementsBtn = document.getElementById("achievements-btn");
    if (achievementsBtn) {
      achievementsBtn.addEventListener("click", () => {
        alert("Achievements feature coming soon!");
      });
    }

    const quickPracticeBtn = document.getElementById("quick-practice-btn");
    if (quickPracticeBtn) {
      quickPracticeBtn.addEventListener("click", () => {
        const modal = document.getElementById("levelSelectModal");
        if (modal) modal.style.display = "flex";
      });
    }

    console.log("Dashboard initialized successfully with SPA routing");
  } catch (err) {
    console.error("Dashboard initialization error:", err);
    window.location.href = "index.html";
  }
});