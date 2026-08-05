// landing.js
// Wires up every ".get-started-btn" on the landing page to open a sign-in
// modal (Google, or email/password). On success, redirects to the dashboard.

import { signInWithGoogle, signInWithEmail, signUpWithEmail, watchAuthState } from '/src/auth.js';

const DASHBOARD_URL = 'dashboard.html';

// ---- Build the modal once, reuse it for every click ----
function buildModal() {
  const overlay = document.createElement('div');
  overlay.id = 'signin-modal-overlay';
  overlay.innerHTML = `
    <div id="signin-modal">
      <button id="signin-modal-close" aria-label="Close">&times;</button>
      <h2>Sign in to continue</h2>
      <p>Create your account to save progress and pick up where you left off.</p>

      <button id="signin-google-btn" class="signin-provider-btn">
        Continue with Google
      </button>

      <div class="signin-divider"><span>or</span></div>

      <form id="signin-email-form">
        <input type="email" id="signin-email-input" placeholder="Email" required />
        <input type="password" id="signin-password-input" placeholder="Password" required />
        <button type="submit" id="signin-email-submit" class="signin-provider-btn signin-email-btn">
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
  overlay.style.display = 'flex';
  document.getElementById('signin-modal-error').textContent = '';
}

function hideModal(overlay) {
  overlay.style.display = 'none';
}

function showError(message) {
  document.getElementById('signin-modal-error').textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
  // If someone is already logged in and lands back on index.html,
  // send them straight to the dashboard instead of showing the landing page.
  watchAuthState((user) => {
    if (user) {
      window.location.href = DASHBOARD_URL;
    }
  });

  const overlay = buildModal();
  let isSignUpMode = false; // toggles between "Sign in" and "Sign up"

  // Wire up every button/link with the get-started-btn class
  document.querySelectorAll('.get-started-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showModal(overlay);
    });
  });

  document.getElementById('signin-modal-close').addEventListener('click', () => {
    hideModal(overlay);
  });

  // Click outside the modal box to close it
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal(overlay);
  });

  document.getElementById('signin-google-btn').addEventListener('click', async () => {
    try {
      await signInWithGoogle();
      window.location.href = DASHBOARD_URL;
    } catch (err) {
      showError('Google sign-in failed. Please try again.');
    }
  });

  // Toggle between "Sign in" and "Sign up" mode.
  // Uses event delegation on the parent <p> since the link's innerHTML
  // gets replaced when the mode switches.
  document.getElementById('signin-toggle-mode').addEventListener('click', (e) => {
    if (e.target.id !== 'signin-toggle-link') return;
    e.preventDefault();

    isSignUpMode = !isSignUpMode;

    document.getElementById('signin-email-submit').textContent = isSignUpMode ? 'Sign up' : 'Sign in';
    document.getElementById('signin-toggle-mode').innerHTML = isSignUpMode
      ? 'Already have an account? <a href="#" id="signin-toggle-link">Sign in</a>'
      : 'Don\'t have an account? <a href="#" id="signin-toggle-link">Sign up</a>';
  });

  document.getElementById('signin-email-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email-input').value.trim();
    const password = document.getElementById('signin-password-input').value;

    try {
      if (isSignUpMode) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      window.location.href = DASHBOARD_URL;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        showError('That email is already registered. Try signing in instead.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        showError('Incorrect email or password.');
      } else if (err.code === 'auth/weak-password') {
        showError('Password should be at least 6 characters.');
      } else {
        showError('Something went wrong. Please try again.');
      }
    }
  });
});