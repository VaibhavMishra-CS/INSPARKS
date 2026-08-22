// modules.js — Books section: Hiragana, Katakana, Numbers
// Data structure (confirmed from your files):
//   hiragana.json / katakana.json -> [{ kana, romaji, row, col }, ...]
//   numbers.json                 -> [{ kanji, romaji, hiragana, meaning }, ...]

import { requireAuth } from './auth.js';
import { getUserData, updateUserData } from './dashboard.jsx';
import { mountSidebar } from './icons.js';

const MODULES = [
  { id: 'hiragana', label: 'Hiragana', file: 'data/kanji/hiragana.json', total: 46, type: 'kana' },
  { id: 'katakana', label: 'Katakana', file: 'data/kanji/katakana.json', total: 46, type: 'kana' },
  { id: 'numbers',  label: 'Numbers',  file: 'data/kanji/numbers.json',  total: 30, type: 'kanji' }
];
const DOT_COUNT = 10;
const LIVES = 3;

let moduleData = {};
let progressCache = {};

let currentPracticeModule = null;
let currentLives = LIVES;
let currentScore = 0;
let questionsAnswered = 0;
let currentCardIndex = 0;
let allModuleItems = [];

// ==========================================================================
// PROGRESS (Firestore)
// ==========================================================================
async function loadAllProgress() {
  try {
    progressCache = (await getUserData()) || {};
  } catch (err) {
    console.warn('Could not load progress:', err);
    progressCache = {};
  }
  MODULES.forEach(m => renderModuleCard(m.id));
}

function getProgress(moduleId) {
  const raw = progressCache['progress_' + moduleId];
  const mod = MODULES.find(m => m.id === moduleId);
  if (raw) return raw;
  return { correct: 0, attempted: 0, total: mod ? mod.total : 20 };
}

function saveProgress(moduleId, progress) {
  progressCache['progress_' + moduleId] = progress;
  updateUserData({ ['progress_' + moduleId]: progress }).catch(err =>
    console.warn('Failed to save progress for ' + moduleId + ':', err)
  );
}

function recordQuizResult(moduleId, wasCorrect) {
  const p = getProgress(moduleId);
  p.attempted += 1;
  if (wasCorrect) p.correct += 1;
  saveProgress(moduleId, p);
  renderModuleCard(moduleId);
}

// ==========================================================================
// RENDER MODULE GRID
// ==========================================================================
function renderModuleGrid() {
  const grid = document.getElementById('module-grid');
  grid.innerHTML = MODULES.map(m => `
    <div class="module-card" data-module="${m.id}">
      <div class="module-card-head">
        <h3>${m.label}</h3>
        <div class="module-meta">${m.total} items</div>
      </div>
      <div class="module-stats">
        <div class="module-stat">
          <div class="module-stat-label">Accuracy</div>
          <div class="module-stat-value accuracy" id="accuracy-${m.id}">—</div>
          <div class="dot-track" id="accuracy-dots-${m.id}"></div>
        </div>
        <div class="module-stat">
          <div class="module-stat-label">Completed</div>
          <div class="module-stat-value completed" id="completed-${m.id}">0/${m.total}</div>
          <div class="dot-track" id="completed-dots-${m.id}"></div>
        </div>
      </div>
      <div class="module-actions">
        <button class="btn btn-ghost" onclick="openReadModal('${m.id}')">Read</button>
        <button class="btn btn-navy" onclick="openPracticeModal('${m.id}')">Practice</button>
      </div>
    </div>
  `).join('');
}

function renderDots(containerId, pct, className) {
  const container = document.getElementById(containerId);
  if (!container) return;
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
  const mod = MODULES.find(m => m.id === moduleId);
  const accuracyEl = document.getElementById('accuracy-' + moduleId);
  const completedEl = document.getElementById('completed-' + moduleId);
  if (!accuracyEl || !completedEl) return;

  const accuracyPct = p.attempted > 0 ? Math.round((p.correct / p.attempted) * 100) : 0;
  const completedPct = Math.round((p.attempted / (mod ? mod.total : 20)) * 100);

  accuracyEl.textContent = p.attempted > 0 ? accuracyPct + '%' : '—';
  completedEl.textContent = `${p.attempted}/${mod ? mod.total : '∞'}`;

  renderDots('accuracy-dots-' + moduleId, accuracyPct, 'accuracy');
  renderDots('completed-dots-' + moduleId, completedPct, 'completed');
}

// ==========================================================================
// DATA LOADING
// ==========================================================================
async function loadModuleData(moduleId) {
  if (moduleData[moduleId]) return moduleData[moduleId];
  const mod = MODULES.find(m => m.id === moduleId);
  const res = await fetch(mod.file);
  if (!res.ok) throw new Error(`Failed to load ${mod.file}: ${res.status}`);
  const data = await res.json();
  moduleData[moduleId] = data;
  return data;
}

// ==========================================================================
// READ MODAL
// ==========================================================================
function renderKanaTable(data) {
  let maxRow = 0;
  data.forEach(e => { if (e.row > maxRow) maxRow = e.row; });
  const lookup = {};
  data.forEach(e => { lookup[`${e.row}-${e.col}`] = e; });

  let html = '<div class="kana-table">';
  for (let r = 0; r <= maxRow; r++) {
    for (let c = 0; c < 5; c++) {
      const entry = lookup[`${r}-${c}`];
      html += entry
        ? `<div class="kana-cell"><span class="kana-char">${entry.kana}</span><span class="kana-romaji">${entry.romaji}</span></div>`
        : `<div class="kana-cell kana-cell-empty"></div>`;
    }
  }
  html += '</div>';
  return html;
}

function renderNumbersList(data) {
  return data.map(entry => `
    <div class="read-entry">
      <div>
        <div class="kanji-char">${entry.kanji}</div>
        <div class="read-sub">${entry.hiragana} — ${entry.meaning}</div>
      </div>
      <div class="read-romaji">${entry.romaji}</div>
    </div>
  `).join('');
}

async function openReadModalImpl(moduleId) {
  const modal = document.getElementById('readModal');
  const titleEl = document.getElementById('readModalTitle');
  const body = document.getElementById('readModalBody');
  const mod = MODULES.find(m => m.id === moduleId);

  titleEl.textContent = 'Read: ' + mod.label;
  body.innerHTML = '<p style="color:var(--text-tertiary);">Loading…</p>';
  modal.classList.add('open');

  try {
    const data = await loadModuleData(moduleId);
    body.innerHTML = mod.type === 'kana' ? renderKanaTable(data) : renderNumbersList(data);
  } catch (err) {
    body.innerHTML = `<p style="color:var(--accent-red);">Error: ${err.message}</p>`;
  }
}

// ==========================================================================
// PRACTICE MODAL (MCQ)
// ==========================================================================
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomOptions(correctItem, allItems, count = 4) {
  const shuffled = allItems.filter(item => item !== correctItem).sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, count - 1);
  options.push(correctItem);
  return options.sort(() => Math.random() - 0.5);
}

async function openPracticeModalImpl(moduleId) {
  currentPracticeModule = moduleId;
  currentLives = LIVES;
  currentScore = 0;
  questionsAnswered = 0;
  currentCardIndex = 0;

  const modal = document.getElementById('practiceModal');
  const container = document.getElementById('mcqContainer');
  const mod = MODULES.find(m => m.id === moduleId);

  document.getElementById('practiceModalTitle').textContent = 'Practice: ' + mod.label;
  modal.classList.add('open');

  try {
    allModuleItems = shuffleArray(await loadModuleData(moduleId));
    renderMCQQuestion();
  } catch (err) {
    container.innerHTML = `<p style="color:var(--accent-red);">Error: ${err.message}</p>`;
  }
}

function renderMCQQuestion() {
  if (questionsAnswered >= allModuleItems.length) return renderPracticeComplete();

  const container = document.getElementById('mcqContainer');
  const correctItem = allModuleItems[currentCardIndex];
  const options = getRandomOptions(correctItem, allModuleItems);
  const mod = MODULES.find(m => m.id === currentPracticeModule);

  const questionDisplay = mod.type === 'kana'
    ? `<div class="mcq-question">${correctItem.kana}</div><div class="mcq-question-label">What is the romaji?</div>`
    : `<div class="mcq-question">${correctItem.kanji}</div><div class="mcq-question-label">What is the romaji?</div>`;

  const optionsHtml = options.map(option => `
    <button class="mcq-option" onclick="handleMCQAnswer(${option === correctItem}, '${currentPracticeModule}')">
      ${option.romaji}
    </button>
  `).join('');

  const livesDisplay = '❤️'.repeat(currentLives) + '🖤'.repeat(LIVES - currentLives);

  container.innerHTML = `
    <div class="mcq-header">
      <div>Question ${questionsAnswered + 1} / ${allModuleItems.length}</div>
      <div>${livesDisplay}</div>
    </div>
    ${questionDisplay}
    <div class="mcq-options">${optionsHtml}</div>
  `;
}

window.handleMCQAnswer = function (isCorrect, moduleId) {
  if (isCorrect) {
    currentScore++;
    recordQuizResult(moduleId, true);
  } else {
    currentLives--;
    recordQuizResult(moduleId, false);
    if (currentLives <= 0) {
      setTimeout(renderPracticeGameOver, 400);
      return;
    }
  }
  questionsAnswered++;
  currentCardIndex++;
  setTimeout(renderMCQQuestion, 400);
};

function renderPracticeComplete() {
  const accuracy = questionsAnswered > 0 ? Math.round((currentScore / questionsAnswered) * 100) : 0;
  document.getElementById('mcqContainer').innerHTML = `
    <div class="practice-complete">
      <h2>Practice Complete! 🎉</h2>
      <div class="complete-stats">
        <div><div class="module-stat-label">Score</div><div class="module-stat-value">${currentScore} / ${questionsAnswered}</div></div>
        <div><div class="module-stat-label">Accuracy</div><div class="module-stat-value">${accuracy}%</div></div>
      </div>
      <button class="btn btn-primary" onclick="closePracticeModal()">Done</button>
    </div>`;
}

function renderPracticeGameOver() {
  document.getElementById('mcqContainer').innerHTML = `
    <div class="practice-gameover">
      <h2>Out of Lives 💔</h2>
      <div class="gameover-stats">
        <div><div class="module-stat-label">Answered</div><div class="module-stat-value">${questionsAnswered}</div></div>
        <div><div class="module-stat-label">Score</div><div class="module-stat-value">${currentScore}</div></div>
      </div>
      <button class="btn btn-primary" onclick="closePracticeModal()">Return to Books</button>
    </div>`;
}

window.closePracticeModal = function () { closeModal('practiceModal'); };
window.closeModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
};

window.openReadModal = function (moduleId) { openReadModalImpl(moduleId); };
window.openPracticeModal = function (moduleId) { openPracticeModalImpl(moduleId); };

// ==========================================================================
// INIT
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  mountSidebar('books');
  renderModuleGrid();

  try {
    await requireAuth('index.html');
  } catch (err) {
    console.warn('Auth check failed:', err);
  }

  await loadAllProgress();
});