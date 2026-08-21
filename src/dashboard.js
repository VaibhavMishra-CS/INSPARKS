// dashboard.js — Firestore integration & HayaiLearn video catalog logic

import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, requireAuth, renderAuthUI, signOutUser } from "/src/auth.js";
import { mountSidebar } from "/src/icons.js";

const db = getFirestore();

// ---- Video Catalog Database (HayaiLearn-styled items) ----
const videoLibrary = [
  {
    id: "1",
    title: "Let's go hiking in Japan! ⛰️ | N4 Japanese Listening",
    channel: "けんさんおかえりJapanese",
    level: "LVL 3",
    duration: "42:16",
    comprehension: "15%",
    category: "vlog",
    youtubeId: "jfKfPfyJRdk",
    thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg"
  },
  {
    id: "2",
    title: "[N5 - N4] 15-minute Japanese listening | Conversation practice",
    channel: "Learn Easy Japanese with Kan...",
    level: "LVL 3",
    duration: "17:07",
    comprehension: "15%",
    category: "education",
    youtubeId: "5qap5aO4i9A",
    thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg"
  },
  {
    id: "3",
    title: "今宵はめろんTUNE #42 | Japanese Music & Chat",
    channel: "黒金メロイック Official",
    level: "LVL 4",
    duration: "31:20",
    comprehension: "39%",
    category: "music",
    youtubeId: "dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  },
  {
    id: "4",
    title: "Japanese Mythology: Izanagi & Izanami — The Creation Story",
    channel: "Get to Know Japan",
    level: "LVL 4",
    duration: "21:01",
    comprehension: "48%",
    category: "anime",
    youtubeId: "3JZ_D3ELwOQ",
    thumbnail: "https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg"
  },
  {
    id: "5",
    title: "ATARASHII GAKKO! - Oi AG! (Official Music Video)",
    channel: "88rising",
    level: "LVL 4",
    duration: "04:10",
    comprehension: "32%",
    category: "music",
    youtubeId: "L-_N9_8x2Is",
    thumbnail: "https://img.youtube.com/vi/L-_N9_8x2Is/hqdefault.jpg"
  },
  {
    id: "6",
    title: "Street Interview in Tokyo: How much is your outfit?",
    channel: "Tokyo Street Clips",
    level: "LVL 5",
    duration: "20:01",
    comprehension: "28%",
    category: "street",
    youtubeId: "L1vXy3C9vB0",
    thumbnail: "https://img.youtube.com/vi/L1vXy3C9vB0/hqdefault.jpg"
  }
];

// ---- Get current user or throw error ----
function requireUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is signed in.");
  return user;
}

// ---- Firestore Helpers ----
export async function setUserItem(key, value) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, { [key]: value }, { merge: true });
}

export async function getUserItem(key) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return snap.data()[key] ?? null;
}

export async function getUserData() {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : {};
}

export async function updateUserData(fields) {
  const user = requireUser();
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, fields, { merge: true });
}

export async function loadDashboard() {
  const data = await getUserData();
  return {
    level: data.lastLevel ?? "N5",
    score: data.lastScore ?? 0,
    streak: data.streak ?? 0,
    cardsReviewed: data.dailyGoalProgress ?? 0
  };
}

// ---- Render Video Grid ----
function renderVideos(filterCategory = "all") {
  const grid = document.getElementById("videoGrid");
  if (!grid) return;

  const filtered = filterCategory === "all" 
    ? videoLibrary 
    : videoLibrary.filter(v => v.category === filterCategory);

  grid.innerHTML = filtered.map(video => `
    <div class="video-card" onclick="openVideoPlayer('${video.youtubeId}')">
      <div class="thumbnail-container">
        <span class="level-badge">${video.level}</span>
        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
        <span class="duration-badge">${video.duration}</span>
      </div>
      <div class="video-info">
        <h3 class="video-title">${video.title}</h3>
        <p class="video-channel">${video.channel}</p>
        <div class="comprehension-bar">
          <span>💬 Comprehension: ${video.comprehension}</span>
        </div>
      </div>
    </div>
  `).join("");
}

// ---- Navigation Event ----
window.openVideoPlayer = function(youtubeId) {
  window.location.href = `reading.html?v=${youtubeId}`;
};

// ---- Initialize Dashboard ----
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Mount sidebar (CSS automatically hides bottom profile/theme from it)
  mountSidebar('home');

  try {
    const user = await requireAuth("index.html");
    renderAuthUI();

    // 2. Populate User Profile Data in Top Bar
    const displayNameEl = document.getElementById("user-display-name");
    const displayEmailEl = document.getElementById("user-display-email");
    const avatarEl = document.getElementById("profile-avatar-initial");

    const email = user.email || "user@example.com";
    const name = user.displayName || email.split("@")[0];

    if (displayNameEl) displayNameEl.textContent = name;
    if (displayEmailEl) displayEmailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();

    // 3. Load Firestore Stats into Header
    const stats = await loadDashboard();
    const streakEl = document.getElementById("user-streak");
    const cardCountEl = document.getElementById("daily-card-count");

    if (streakEl) streakEl.textContent = `${stats.streak} days`;
    if (cardCountEl) cardCountEl.textContent = `${stats.cardsReviewed} / 15`;

    // 4. Category Filter Buttons Wiring
    const categoryContainer = document.getElementById("categoryContainer");
    if (categoryContainer) {
      categoryContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("category-pill")) {
          document.querySelectorAll(".category-pill").forEach(btn => btn.classList.remove("active"));
          e.target.classList.add("active");
          const selectedCat = e.target.getAttribute("data-category");
          renderVideos(selectedCat);
        }
      });
    }

    // 5. Top Theme Toggle Logic
    const themeBtn = document.getElementById("top-theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", newTheme);
        themeBtn.querySelector(".theme-text").textContent = newTheme === "dark" ? "Dark" : "Light";
        themeBtn.querySelector(".theme-icon").textContent = newTheme === "dark" ? "🌙" : "☀️";
      });
    }

    // 6. Initial Render of Videos
    renderVideos("all");

  } catch (err) {
    console.error("Dashboard initialization error:", err);
    window.location.href = "index.html";
  }
});