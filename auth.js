// auth.js
// Handles Google sign-in, Email/Password sign-in, and session state
// Import this in dashboard.js/modules.js wherever you need the current user

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

// ---- Firebase config ----
// Make sure these environment variables are set in Vercel
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ---- Configure Google Auth Provider ----
// This ensures Google Auth works properly on both localhost and production
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ---- Sign in with Google ----
export async function signInWithGoogle() {
  try {
    console.log("Attempting Google sign-in...");
    
    // signInWithPopup keeps the popup open until auth completes
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log("Google sign-in successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Google sign-in error:", err.code, err.message);
    
    // Handle specific auth errors
    if (err.code === "auth/popup-blocked") {
      alert("Pop-up was blocked. Please allow pop-ups for this site.");
    } else if (err.code === "auth/cancelled-popup-request" || err.code === "auth/popup-closed-by-user") {
      console.log("User closed the sign-in popup");
    } else if (err.code === "auth/unauthorized-domain") {
      console.error("This domain is not authorized in Firebase Console. Add it to the whitelist.");
      alert("Authentication domain not configured. Please contact support.");
    }
    
    throw err;
  }
}

// ---- Sign up with email/password ----
export async function signUpWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email sign-up successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Email sign-up error:", err.code, err.message);
    
    // Handle specific errors
    if (err.code === "auth/email-already-in-use") {
      throw new Error("This email is already in use. Please sign in instead.");
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
    console.log("Email sign-in successful:", result.user.email);
    return result.user;
  } catch (err) {
    console.error("Email sign-in error:", err.code, err.message);
    
    // Handle specific errors
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      throw new Error("Invalid email or password.");
    }
    
    throw err;
  }
}

// ---- Sign out ----
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log("Sign-out successful");
  } catch (err) {
    console.error("Sign-out error:", err.code, err.message);
    throw err;
  }
}

// ---- Session state listener ----
// Call this once on app load. The callback fires with `user` (or null)
// any time auth state changes, and again automatically on page refresh.
export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed:", user ? user.email : "logged out");
    callback(user);
  });
}

// ---- Sidebar user card wiring ----
// Expects this exact markup in the sidebar (see dashboard-usercard-snippet.html):
//   <div class="user-card" id="user-card-btn">
//     <div class="avatar" id="user-avatar"></div>
//     <div>
//       <div class="user-name" id="user-name">[USERNAME]</div>
//       <div class="user-plan" id="user-email">Free</div>
//     </div>
//   </div>
//   <div id="user-menu"></div>
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
    if (!user) return; // requireAuth() already redirects logged-out users away

    nameEl.textContent = user.displayName || "Account";
    emailEl.textContent = user.email || "";
    
    if (avatarEl && user.photoURL) {
      avatarEl.style.backgroundImage = `url(${user.photoURL})`;
      avatarEl.style.backgroundSize = "cover";
    }

    // Build the dropdown menu once
    menuEl.innerHTML = `
      <button id="switch-account-btn" class="user-menu-item">Switch account</button>
      <button id="logout-btn" class="user-menu-item">Log out</button>
    `;
    menuEl.style.display = "none";

    document.getElementById("switch-account-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      menuEl.style.display = "none";
      try {
        await signInWithGoogle(); // opens the Google account picker again
      } catch (err) {
        console.error("Switch account failed:", err);
      }
    });

    document.getElementById("logout-btn").addEventListener("click", async (e) => {
      e.stopPropagation();
      await signOutUser();
    });
  });

  // Toggle the menu open/closed on card click
  cardBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuEl.style.display = menuEl.style.display === "none" ? "block" : "none";
  });

  // Click anywhere else closes the menu
  document.addEventListener("click", () => {
    menuEl.style.display = "none";
  });
}

// ---- Route guard for pages that require login (e.g. dashboard.html) ----
// Call this at the very top of the protected page's script.
// Resolves with the user once confirmed logged in; redirects and never
// resolves if the user is not logged in.
// Assumes the login page is at "index.html" — change loginUrl if yours
// lives elsewhere.
export function requireAuth(loginUrl = "index.html") {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        console.log("User authenticated, granting access");
        resolve(user);
      } else {
        console.log("User not authenticated, redirecting to login");
        window.location.href = loginUrl;
        // no resolve() — page is navigating away
      }
    });
  });
}

export { auth };