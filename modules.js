// ==========================================================================
// CONFIG
// ==========================================================================
import { requireAuth, watchAuthState } from './auth.js';
import { getUserData, updateUserData } from './dashboard.js';

const TIER_THRESHOLDS = { bronze: 40, silver: 60, gold: 80, platinum: 100 };
const TIER_ICONS = { bronze: '🍜', silver: '☁️', gold: '⛩️', platinum: '🗡️' };
const DOT_COUNT = 10;
const MODULE_TOTALS = { numbers: 30, hiragana: 46, katakana: 46 };
const LIVES = 3;

let moduleData = {};
let currentCardIndex = 0;
let currentPracticeModule = null;

// MCQ-specific state
let currentLives = LIVES;
let currentScore = 0;
let questionsAnswered = 0;
let allModuleItems = [];
let currentSessionHistory = [];

// ==========================================================================
// PROGRESS STORAGE
// ==========================================================================
let progressCache = {};
let progressLoaded = false;

async function loadAllProgress() {
  try {
    const data = await getUserData();
    progressCache = data || {};
  } catch (err) {
    console.warn('Could not load progress from Firebase:', err);
    progressCache = {};
  }
  progressLoaded = true;

  renderModuleCard('numbers');
  renderModuleCard('hiragana');
  renderModuleCard('katakana');
  updateBadgeTracker();
}

function getProgress(moduleId) {
  const raw = progressCache['progress_' + moduleId];
  if (raw) return raw;
  return { correct: 0, attempted: 0, total: MODULE_TOTALS[moduleId] || 20 };
}

function saveProgress(moduleId, progress) {
  progressCache['progress_' + moduleId] = progress;

  try {
    updateUserData({ ['progress_' + moduleId]: progress }).catch(err => {
      console.warn('Failed to save progress for ' + moduleId + ':', err);
    });
  } catch (err) {
    console.warn('Could not save to Firebase:', err);
  }
}

function recordQuizResult(moduleId, wasCorrect) {
  const p = getProgress(moduleId);
  p.attempted += 1;
  if (wasCorrect) p.correct += 1;
  saveProgress(moduleId, p);
  renderModuleCard(moduleId);
  updateBadgeTracker();
}

// ==========================================================================
// RENDER MODULE CARD
// ==========================================================================
function renderDots(containerId, pct, className) {
  const container = document.getElementById(containerId);
  const filledCount = Math.round((pct / 100) * DOT_COUNT);
  container.innerHTML = '';
  for (let i = 0; i < DOT_COUNT; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot' + (i < filledCount ? ` filled ${className}` : '');
    container.appendChild(dot);
  }
}

function renderModuleCard(moduleId) {
  const p = getProgress(moduleId);
  const accuracyEl = document.getElementById('accuracy-' + moduleId);
  const completedEl = document.getElementById('completed-' + moduleId);
  const attemptedEl = document.getElementById('attempted-' + moduleId);
  const correctEl = document.getElementById('correct-' + moduleId);
  const tierBadgeEl = document.getElementById('tier-badge-' + moduleId);

  const accuracyPct = p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0;
  const completedPct = Math.round((p.attempted / p.total) * 100);

  accuracyEl.textContent = p.attempted > 0 ? accuracyPct + '%' : '—';
  completedEl.textContent = `${p.attempted}/∞`;
  attemptedEl.textContent = p.attempted;
  correctEl.textContent = p.correct;

  renderDots('accuracy-dots-' + moduleId, accuracyPct, 'accuracy');
  renderDots('completed-dots-' + moduleId, completedPct, 'completed');

  let earnedTier = null;
  if (p.attempted > 0) {
    if (accuracyPct >= TIER_THRESHOLDS.platinum) earnedTier = 'platinum';
    else if (accuracyPct >= TIER_THRESHOLDS.gold) earnedTier = 'gold';
    else if (accuracyPct >= TIER_THRESHOLDS.silver) earnedTier = 'silver';
    else if (accuracyPct >= TIER_THRESHOLDS.bronze) earnedTier = 'bronze';
  }

  if (earnedTier) {
    tierBadgeEl.textContent = TIER_ICONS[earnedTier];
    tierBadgeEl.classList.add('show');
  } else {
    tierBadgeEl.classList.remove('show');
  }
}

function updateBadgeTracker() {
  const counts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  document.querySelectorAll('.module-card').forEach(card => {
    const moduleId = card.dataset.module;
    const p = getProgress(moduleId);
    if (p.attempted === 0) return;
    const accuracyPct = Math.round((p.correct / p.attempted) * 100);
    if (accuracyPct >= TIER_THRESHOLDS.platinum) counts.platinum++;
    else if (accuracyPct >= TIER_THRESHOLDS.gold) counts.gold++;
    else if (accuracyPct >= TIER_THRESHOLDS.silver) counts.silver++;
    else if (accuracyPct >= TIER_THRESHOLDS.bronze) counts.bronze++;
  });
  document.getElementById('count-platinum').textContent = counts.platinum;
  document.getElementById('count-gold').textContent = counts.gold;
  document.getElementById('count-silver').textContent = counts.silver;
  document.getElementById('count-bronze').textContent = counts.bronze;
}

// ==========================================================================
// SPECIFICS CHEVRON
// ==========================================================================
function toggleSpecifics(moduleId) {
  const panel = document.getElementById('specifics-' + moduleId);
  const chevron = document.getElementById('chevron-' + moduleId);
  const isOpen = panel.style.display === 'block';
  panel.style.display = isOpen ? 'none' : 'block';
  chevron.classList.toggle('open', !isOpen);
}

// ==========================================================================
// DATA LOADING
// ==========================================================================
async function loadModuleData(moduleId) {
  if (moduleData[moduleId]) return moduleData[moduleId];
  try {
    const res = await fetch(`data/kanji/${moduleId}.json`);
    if (!res.ok) {
      throw new Error(`Failed to load ${moduleId}.json: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error(`Data for ${moduleId} is not an array`);
    }
    moduleData[moduleId] = data;
    return data;
  } catch (err) {
    console.error('Error loading module data:', err);
    throw err;
  }
}

// ==========================================================================
// READ MODAL
// ==========================================================================
function renderKanaTable(data) {
  const cols = 5;
  let maxRow = 0;
  data.forEach(e => { if (e.row > maxRow) maxRow = e.row; });

  const lookup = {};
  data.forEach(e => { lookup[`${e.row}-${e.col}`] = e; });

  let html = '<div class="kana-table">';
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c < cols; c++) {
      const entry = lookup[`${r}-${c}`];
      if (entry) {
        html += `<div class="kana-cell"><span class="kana-char">${entry.kana}</span><span class="kana-romaji">${entry.romaji}</span></div>`;
      } else {
        html += `<div class="kana-cell kana-cell-empty"></div>`;
      }
    }
  }
  html += '</div>';
  return html;
}

async function openReadModal(moduleId) {
  try {
    const modal = document.getElementById('readModal');
    const titleEl = document.getElementById('readModalTitle');
    const body = document.getElementById('readModalBody');
    
    if (!modal || !titleEl || !body) {
      console.error('Modal elements not found in HTML');
      return;
    }
    
    titleEl.textContent = 'Read: ' + capitalize(moduleId);
    body.innerHTML = '<p style="color:#999;">Loading…</p>';
    modal.classList.add('open');

    const data = await loadModuleData(moduleId);

    if (moduleId === 'hiragana' || moduleId === 'katakana') {
      body.innerHTML = renderKanaTable(data);
    } else {
      body.innerHTML = data.map(entry => `
        <div class="read-entry">
          <div>
            <div class="kanji">${entry.kanji}</div>
            <div style="font-size:13px;color:#999;">${entry.hiragana} — ${entry.meaning}</div>
          </div>
          <div class="romaji">${entry.romaji}</div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error opening read modal:', err);
    const body = document.getElementById('readModalBody');
    if (body) {
      body.innerHTML = '<p style="color:#f44336;">Error: ' + err.message + '</p>';
    }
  }
}

// ==========================================================================
// PRACTICE MODAL (MCQ with lives system)
// ==========================================================================
async function openPracticeModal(moduleId) {
  try {
    currentPracticeModule = moduleId;
    currentLives = LIVES;
    currentScore = 0;
    questionsAnswered = 0;
    currentCardIndex = 0;

    const modal = document.getElementById('practiceModal');
    const container = document.getElementById('mcqContainer');
    
    if (!modal || !container) {
      console.error('Practice modal elements not found in HTML');
      return;
    }

    document.getElementById('practiceModalTitle').textContent = 'Practice: ' + capitalize(moduleId);
    modal.classList.add('open');

    allModuleItems = await loadModuleData(moduleId);
    
    if (!allModuleItems || allModuleItems.length === 0) {
      container.innerHTML = '<p style="color:#f44336;">No data loaded.</p>';
      return;
    }

    allModuleItems = shuffleArray([...allModuleItems]);
    currentSessionHistory = [];
    renderMCQQuestion();
  } catch (err) {
    console.error('Error opening practice modal:', err);
    const container = document.getElementById('mcqContainer');
    if (container) {
      container.innerHTML = '<p style="color:#f44336;">Error: ' + err.message + '</p>';
    }
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomOptions(correctItem, allItems, count = 4) {
  const shuffled = allItems
    .filter(item => item !== correctItem)
    .sort(() => Math.random() - 0.5);
  
  const options = shuffled.slice(0, count - 1);
  options.push(correctItem);
  return options.sort(() => Math.random() - 0.5);
}

function renderMCQQuestion() {
  if (questionsAnswered >= allModuleItems.length) {
    renderPracticeComplete();
    return;
  }

  const container = document.getElementById('mcqContainer');
  if (!container) {
    console.error('MCQ container not found in HTML');
    return;
  }

  const correctItem = allModuleItems[currentCardIndex];
  const options = getRandomOptions(correctItem, allModuleItems);

  let questionDisplay = '';
  if (currentPracticeModule === 'numbers') {
    questionDisplay = `<div class="mcq-question">${correctItem.kanji}</div>
                       <div class="mcq-question-label">What is the romaji?</div>`;
  } else if (currentPracticeModule === 'hiragana' || currentPracticeModule === 'katakana') {
    questionDisplay = `<div class="mcq-question">${correctItem.kana}</div>
                       <div class="mcq-question-label">What is the romaji?</div>`;
  }

  let optionsHtml = '';
  options.forEach((option, idx) => {
    const displayText = currentPracticeModule === 'numbers' 
      ? option.romaji 
      : option.romaji;
    optionsHtml += `
      <button class="mcq-option" onclick="handleMCQAnswer('${option === correctItem}', '${currentPracticeModule}')">
        ${displayText}
      </button>
    `;
  });

  const livesDisplay = '❤️'.repeat(currentLives) + '🖤'.repeat(LIVES - currentLives);

  container.innerHTML = `
    <div class="mcq-header">
      <div class="mcq-progress">Question ${questionsAnswered + 1} / ${allModuleItems.length}</div>
      <div class="mcq-lives">${livesDisplay}</div>
    </div>
    ${questionDisplay}
    <div class="mcq-options">
      ${optionsHtml}
    </div>
  `;
}

function handleMCQAnswer(isCorrect, moduleId) {
  const isCorrectBool = isCorrect === 'true';
  const correctItem = allModuleItems[currentCardIndex];
  
  currentSessionHistory.push({
    question: correctItem.kanji || correctItem.kana,
    answer: correctItem.romaji,
    meaning: correctItem.meaning || '',
    isCorrect: isCorrectBool
  });
  
  if (isCorrectBool) {
    currentScore++;
    recordQuizResult(currentPracticeModule, true);
    showFeedback('✓ Correct!', 'success');
  } else {
    currentLives--;
    recordQuizResult(currentPracticeModule, false);
    showFeedback('✗ Incorrect', 'error');
    
    if (currentLives <= 0) {
      setTimeout(() => {
        renderPracticeGameOver();
      }, 1500);
      return;
    }
  }

  questionsAnswered++;
  currentCardIndex++;

  setTimeout(() => {
    renderMCQQuestion();
  }, 1500);
}

function showFeedback(message, type) {
  const container = document.getElementById('mcqContainer');
  const feedbackEl = document.createElement('div');
  feedbackEl.className = `mcq-feedback mcq-feedback-${type}`;
  feedbackEl.textContent = message;
  container.appendChild(feedbackEl);
}

function renderPracticeComplete() {
  const accuracy = Math.round((currentScore / questionsAnswered) * 100);
  const container = document.getElementById('mcqContainer');
  
  container.innerHTML = `
    <div class="practice-complete">
      <h2>Practice Complete! 🎉</h2>
      <div class="complete-stats">
        <div class="stat">
          <div class="stat-label">Score</div>
          <div class="stat-value">${currentScore} / ${questionsAnswered}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Accuracy</div>
          <div class="stat-value">${accuracy}%</div>
        </div>
      </div>
      <button class="btn btn-primary" onclick="closePracticeModal()">Done</button>
    </div>
  `;
}

function renderPracticeGameOver() {
  const container = document.getElementById('mcqContainer');
  
  container.innerHTML = `
    <div class="practice-gameover">
      <h2>Game Over 💔</h2>
      <div class="gameover-stats">
        <div class="stat">
          <div class="stat-label">Questions Answered</div>
          <div class="stat-value">${questionsAnswered}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Score</div>
          <div class="stat-value">${currentScore}</div>
        </div>
      </div>
      <p style="color:#666;margin:20px 0;">You have run out of lives! The practice has been reset.</p>
      <button class="btn btn-primary" onclick="closePracticeModal()">Return to Books</button>
    </div>
  `;
}

function closePracticeModal() {
  closeModal('practiceModal');
}

// ==========================================================================
// MODAL HELPERS
// ==========================================================================
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
  }
}

function toggleBadgeInfo() {
  const tooltip = document.getElementById('badgeTooltip');
  if (tooltip) {
    tooltip.style.display = tooltip.style.display === 'block' ? 'none' : 'block';
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await requireAuth('index.html');
  } catch (err) {
    console.warn('Auth check failed, continuing anyway:', err);
  }

  renderModuleCard('numbers');
  renderModuleCard('hiragana');
  renderModuleCard('katakana');
  updateBadgeTracker();

  await loadAllProgress();

  const overlay = document.getElementById('auth-loading-overlay');
  if (overlay) overlay.style.display = 'none';

  try {
    watchAuthState((user) => {
      if (!user) {
        window.location.href = 'index.html';
      }
    });
  } catch (err) {
    console.warn('Watch state failed:', err);
  }
});

// ==========================================================================
// EXPOSE TO GLOBAL SCOPE
// ==========================================================================
window.openReadModal = function(moduleId) {
  const modal = document.getElementById('readModal');
  if (modal) {
    modal.classList.add('open');
  }
  openReadModal(moduleId);
};

window.openPracticeModal = function(moduleId) {
  const modal = document.getElementById('practiceModal');
  if (modal) {
    modal.classList.add('open');
  }
  openPracticeModal(moduleId);
};

window.toggleSpecifics = toggleSpecifics;
window.closeModal = closeModal;
window.closePracticeModal = closePracticeModal;
window.handleMCQAnswer = handleMCQAnswer;
window.toggleBadgeInfo = toggleBadgeInfo;

// ==========================================================================
// MODAL OPENING WRAPPERS - Extra safety layer for modal display
// ==========================================================================

// Store original function references
const origReadModalFn = window.openReadModal;
const origPracticeModalFn = window.openPracticeModal;

// Override with wrappers that ensure modal.open class is added
window.openReadModal = function(moduleId) {
  const modal = document.getElementById('readModal');
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
  origReadModalFn(moduleId);
};

window.openPracticeModal = function(moduleId) {
  const modal = document.getElementById('practiceModal');
  if (modal) {
    modal.classList.add('open');
    modal.style.display = 'flex';
  }
  origPracticeModalFn(moduleId);
};