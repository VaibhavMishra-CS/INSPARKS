// auth.js - Complete rewrite with proper error handling and mobile support
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-analytics.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { bindThemeToggle } from "./theme.js";

// Firebase config from vite.config.js __FIREBASE_CONFIG__
const firebaseConfig = __FIREBASE_CONFIG__;

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth for both desktop and mobile
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ---- Sign in with Google ----
export async function signInWithGoogle() {
  try {
    console.log("Attempting Google sign-in...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Google sign-in error:", err.code, err.message);

    if (err.code === "auth/popup-blocked") {
      throw new Error("Pop-ups are blocked. Please allow pop-ups for this site.");
    } else if (err.code === "auth/cancelled-popup-request") {
      throw new Error("Sign-in was cancelled.");
    } else if (err.code === "auth/unauthorized-domain") {
      throw new Error("This domain is not authorized. Contact support.");
    }
    throw err;
  }
}

// ---- Sign up with email/password ----
export async function signUpWithEmail(email, password) {
  try {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Sign-up successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Sign-up error:", err.code, err.message);

    if (err.code === "auth/email-already-in-use") {
      throw new Error("Email already in use. Please sign in instead.");
    } else if (err.code === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    } else if (err.code === "auth/weak-password") {
      throw new Error("Password is too weak. Use at least 6 characters.");
    }
    throw err;
  }
}

// ---- Sign in with email/password ----
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("Sign-in successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Sign-in error:", err.code, err.message);

    if (err.code === "auth/user-not-found") {
      throw new Error("No account found with this email.");
    } else if (err.code === "auth/wrong-password") {
      throw new Error("Incorrect password.");
    } else if (err.code === "auth/invalid-email") {
      throw new Error("Invalid email address.");
    }
    throw err;
  }
}

// ---- Sign out ----
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("Sign-out successful");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Sign-out error:", err.code, err.message);
    throw err;
  }
}

// ---- Watch auth state changes ----
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user.email);
    } else {
      console.log("User logged out");
    }
    callback(user);
  });
}

// ---- Render user card and menu ----
// Menu structure matches crackd.it's user-card dropdown:
// View Profile / Light mode toggle / Switch account / Log out.
export function renderAuthUI() {
  const cardBtn = document.getElementById("user-card-btn");
  const nameEl = document.getElementById("user-name");
  const emailEl = document.getElementById("user-email");
  const avatarEl = document.getElementById("user-avatar");
  const menuEl = document.getElementById("user-menu");

  if (!cardBtn || !nameEl || !emailEl || !menuEl) {
    console.warn("Auth UI elements not found in DOM");
    return;
  }

  watchAuthState((user) => {
    if (!user) return;

    nameEl.textContent = user.displayName || "Account";
    emailEl.textContent = user.email || "";

    if (avatarEl && user.photoURL) {
      avatarEl.style.backgroundImage = `url(${user.photoURL})`;
      avatarEl.style.backgroundSize = "cover";
    }

    menuEl.innerHTML = `
      <a href="profile.html" class="user-menu-item" id="view-profile-btn">View Profile</a>
      <div class="user-menu-item user-menu-toggle-row">
        <span>Light mode</span>
        <label class="theme-switch">
          <input type="checkbox" id="theme-toggle-input" />
          <span class="theme-switch-slider"></span>
        </label>
      </div>
      <button id="switch-account-btn" class="user-menu-item">Switch account</button>
      <button id="logout-btn" class="user-menu-item">Log out</button>
    `;
    menuEl.style.display = "none";

    bindThemeToggle(document.getElementById("theme-toggle-input"));

    document.getElementById("theme-toggle-input")?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.getElementById("switch-account-btn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      menuEl.style.display = "none";
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error("Switch account failed:", err);
      }
    });

    document.getElementById("logout-btn")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      await signOutUser();
    });
  });

  cardBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuEl.style.display = menuEl.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", () => {
    menuEl.style.display = "none";
  });
}

// ---- Require auth - redirect to login if not signed in ----
export function requireAuth(loginUrl = "index.html") {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("User authenticated");
        resolve(user);
      } else {
        console.log("User not authenticated, redirecting to login");
        window.location.href = loginUrl;
      }
    });
  });
}

export { auth };