// dashboard.js - Complete rewrite with proper imports and Firestore integration

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

// ---- Initialize dashboard on page load ----
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

    // Wire up PLAY button
    const playBtn = document.getElementById("play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        const modal = document.getElementById("levelSelectModal");
        if (modal) modal.style.display = "flex";
      });
    }

    // Wire up level buttons
    window.loadGame = function(level) {
      console.log("Loading level:", level);
      const modal = document.getElementById("levelSelectModal");
      if (modal) modal.style.display = "none";

      const gameUI = document.getElementById("gameUI");
      if (gameUI) {
        gameUI.style.display = "block";
        const selectedLevelEl = document.getElementById("selectedLevel");
        if (selectedLevelEl) selectedLevelEl.textContent = level;

        // Save selected level
        saveProgress(level, 0).catch(err => console.error("Failed to save progress:", err));
      }
    };

    // Wire up go back button
    window.goBackToDashboard = function() {
      const gameUI = document.getElementById("gameUI");
      if (gameUI) gameUI.style.display = "none";
    };

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

    console.log("Dashboard initialized successfully");
  } catch (err) {
    console.error("Dashboard initialization error:", err);
    window.location.href = "index.html";
  }
});