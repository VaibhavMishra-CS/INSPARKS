// main.js - Complete rewrite for page initialization

const landing = document.getElementById("landing");
const levelSelect = document.getElementById("levelSelect");
const gameUI = document.getElementById("gameUI");

// ---- Load game for selected level ----
function loadGame(level) {
  console.log("Loading level:", level);

  if (levelSelect) levelSelect.style.display = "none";
  if (gameUI) {
    gameUI.style.display = "block";
    const selectedLevelEl = document.getElementById("selectedLevel");
    if (selectedLevelEl) selectedLevelEl.textContent = level;
  }

  // TODO: Fetch kanji/vocab data for this level
  // fetch(`/data/kanji/${level}.json`)
  //   .then(res => res.json())
  //   .then(data => renderCards(data))
  //   .catch(err => console.error("Failed to load level data:", err));
}

// ---- Go back to dashboard ----
function goBackToDashboard() {
  if (gameUI) gameUI.style.display = "none";
  if (levelSelect) levelSelect.style.display = "block";
}

// Make functions globally available
window.loadGame = loadGame;
window.goBackToDashboard = goBackToDashboard;

// ---- FAQ Accordion ----
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

// ---- Scroll reveal animations ----
function initRevealAnimations() {
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// ---- Initialize on DOM ready ----
document.addEventListener("DOMContentLoaded", () => {
  console.log("Main.js initialized");
  initFAQ();
  initRevealAnimations();
});