// landing.js - Complete rewrite with proper error handling and mobile support
import { signInWithGoogle, signInWithEmail, signUpWithEmail, watchAuthState } from "./auth.js";

const DASHBOARD_URL = "dashboard.html";

// ---- Build sign-in modal ----
function buildModal() {
  const overlay = document.createElement("div");
  overlay.id = "signin-modal-overlay";
  overlay.innerHTML = `
    <div id="signin-modal">
      <button id="signin-modal-close" aria-label="Close">&times;</button>
      <h2>Sign in to continue</h2>
      <p>Create your account to save progress and track your learning journey.</p>

      <button id="signin-google-btn" class="signin-provider-btn">
        <span>🔵</span> Continue with Google
      </button>

      <div class="signin-divider"><span>or</span></div>

      <form id="signin-email-form">
        <input 
          type="email" 
          id="signin-email-input" 
          placeholder="Email" 
          required 
          autocomplete="email"
        />
        <input 
          type="password" 
          id="signin-password-input" 
          placeholder="Password" 
          required 
          autocomplete="current-password"
        />
        <button 
          type="submit" 
          id="signin-email-submit" 
          class="signin-provider-btn signin-email-btn"
        >
          Sign in
        </button>
      </form>

      <p id="signin-toggle-mode">
        Don't have an account? <a href="#" id="signin-toggle-link">Sign up</a>
      </p>

      <p id="signin-modal-error"></p>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function showModal(overlay) {
  overlay.style.display = "flex";
  document.getElementById("signin-modal-error").textContent = "";
}

function hideModal(overlay) {
  overlay.style.display = "none";
}

function showError(message) {
  const errorEl = document.getElementById("signin-modal-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearError() {
  const errorEl = document.getElementById("signin-modal-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

// ---- Initialize modal on page load ----
document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to dashboard
  watchAuthState((user) => {
    if (user) {
      console.log("User already logged in, redirecting to dashboard");
      window.location.href = DASHBOARD_URL;
    }
  });

  const overlay = buildModal();
  let isSignUpMode = false;

  // Wire up all "Get Started" buttons
  document.querySelectorAll(".get-started-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showModal(overlay);
    });
  });

  // Close modal when X is clicked
  document.getElementById("signin-modal-close").addEventListener("click", () => {
    hideModal(overlay);
  });

  // Close modal when clicking outside
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideModal(overlay);
  });

  // Google sign-in button
  document.getElementById("signin-google-btn").addEventListener("click", async () => {
    clearError();
    const btn = document.getElementById("signin-google-btn");
    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      await signInWithGoogle();
      window.location.href = DASHBOARD_URL;
    } catch (err) {
      console.error("Google sign-in failed:", err);
      showError(err.message || "Google sign-in failed. Please try again.");
      btn.disabled = false;
      btn.textContent = "Continue with Google";
    }
  });

  // Toggle between Sign In and Sign Up mode
  document.getElementById("signin-toggle-mode").addEventListener("click", (e) => {
    if (e.target.id !== "signin-toggle-link") return;
    e.preventDefault();

    isSignUpMode = !isSignUpMode;
    clearError();

    const submitBtn = document.getElementById("signin-email-submit");
    const toggleLink = document.getElementById("signin-toggle-mode");

    if (isSignUpMode) {
      submitBtn.textContent = "Sign up";
      toggleLink.innerHTML =
        'Already have an account? <a href="#" id="signin-toggle-link">Sign in</a>';
    } else {
      submitBtn.textContent = "Sign in";
      toggleLink.innerHTML =
        "Don't have an account? <a href=\"#\" id=\"signin-toggle-link\">Sign up</a>";
    }
  });

  // Email sign-in/sign-up form
  document.getElementById("signin-email-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = document.getElementById("signin-email-input").value.trim();
    const password = document.getElementById("signin-password-input").value;
    const submitBtn = document.getElementById("signin-email-submit");

    // Validation
    if (!email || !password) {
      showError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = isSignUpMode ? "Creating account..." : "Signing in...";

    try {
      if (isSignUpMode) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      window.location.href = DASHBOARD_URL;
    } catch (err) {
      console.error("Auth error:", err);
      showError(err.message || "Authentication failed. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = isSignUpMode ? "Sign up" : "Sign in";
    }
  });

  // FAQ accordion
  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      const wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });

  // Reveal animations on scroll
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
});