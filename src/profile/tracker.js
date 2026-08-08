import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  increment,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth } from "./auth.js";

const db = getFirestore();

function userRef() {
  const user = auth.currentUser;
  if (!user) return null;
  return doc(db, "users", user.uid);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ---- Questions answered ----
// Call this once per question, right when it's graded.
// Example (inside a quiz's submit handler):
//   book.questions.forEach((q) => {
//     const wasCorrect = answers[q.id] === q.correct;
//     recordQuestionAnswered(wasCorrect);
//   });
export async function recordQuestionAnswered(isCorrect) {
  const ref = userRef();
  if (!ref) return;
  try {
    await setDoc(
      ref,
      {
        questionsAnswered: increment(1),
        questionsCorrect: increment(isCorrect ? 1 : 0),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("tracker: recordQuestionAnswered failed:", err);
  }
}

// ---- Daily streak ----
// Call once per page load. No-ops if today was already counted.
export async function recordDailyVisit() {
  const ref = userRef();
  if (!ref) return;
  try {
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};
    const today = todayStr();
    const last = data.lastVisitDate;

    if (last === today) return; // already counted today

    let newStreak = 1;
    if (last) {
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / 86400000);
      if (diffDays === 1) {
        newStreak = (data.streak || 0) + 1;
      }
      // diffDays > 1 -> a day was missed, streak resets to 1 (default above)
    }

    await setDoc(ref, { streak: newStreak, lastVisitDate: today }, { merge: true });
  } catch (err) {
    console.error("tracker: recordDailyVisit failed:", err);
  }
}

// ---- Study time ----
// Accumulates locally while the tab is visible, flushes to
// Firestore every 30s and on visibility/unload changes.
let sessionStartMs = null;
let flushIntervalId = null;

async function flushStudyTime() {
  if (sessionStartMs === null) return;
  const now = Date.now();
  const elapsedSeconds = Math.round((now - sessionStartMs) / 1000);
  sessionStartMs = now; // reset window after flush, whether or not it succeeds
  if (elapsedSeconds <= 0) return;

  const ref = userRef();
  if (!ref) return;
  try {
    await setDoc(ref, { studyTimeSeconds: increment(elapsedSeconds) }, { merge: true });
  } catch (err) {
    console.error("tracker: flushStudyTime failed:", err);
  }
}

export function startStudyTimer() {
  if (sessionStartMs !== null) return; // already running on this page
  sessionStartMs = Date.now();

  flushIntervalId = setInterval(flushStudyTime, 30000);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      flushStudyTime();
    } else {
      sessionStartMs = Date.now();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushStudyTime();
  });
}

export function stopStudyTimer() {
  if (flushIntervalId) clearInterval(flushIntervalId);
  flushStudyTime();
  sessionStartMs = null;
}

// ---- Convenience: call once per page load ----
export function initTracker() {
  recordDailyVisit();
  startStudyTimer();
}

// ---- Read all four stats back out, for the profile page ----
export async function getStats() {
  const ref = userRef();
  const empty = { questionsAnswered: 0, questionsCorrect: 0, accuracy: 0, streak: 0, studyTimeSeconds: 0 };
  if (!ref) return empty;

  try {
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const questionsAnswered = data.questionsAnswered || 0;
    const questionsCorrect = data.questionsCorrect || 0;
    const accuracy = questionsAnswered > 0 ? Math.round((questionsCorrect / questionsAnswered) * 100) : 0;

    return {
      questionsAnswered,
      questionsCorrect,
      accuracy,
      streak: data.streak || 0,
      studyTimeSeconds: data.studyTimeSeconds || 0,
    };
  } catch (err) {
    console.error("tracker: getStats failed:", err);
    return empty;
  }
}

// ---- Display helper ----
export function formatStudyTime(totalSeconds) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}