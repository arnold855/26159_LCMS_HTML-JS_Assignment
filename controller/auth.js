import { findForLogin, emailExists, createUser } from "../model/data-store.js";
import { setSession } from "./session.js";

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const errorBox = document.getElementById("errorMessage");
    const submitBtn = document.getElementById("submitBtn");

    errorBox.style.display = "none";
    if (!role) { showError(errorBox, "Please choose an account type."); return; }

    submitBtn.textContent = "Signing in...";
    submitBtn.disabled = true;

    const user = await findForLogin(email, password, role);
    if (!user) {
      showError(errorBox, "Wrong email, password or account type.");
      submitBtn.textContent = "Sign In";
      submitBtn.disabled = false;
    } else {
      setSession(user);
      window.location.href = "dashboard-" + role + ".html";
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const role = document.getElementById("role").value;
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const errorBox = document.getElementById("errorMessage");
    const successBox = document.getElementById("successMessage");
    const submitBtn = document.getElementById("submitBtn");

    errorBox.style.display = "none";
    successBox.style.display = "none";

    if (!role) { showError(errorBox, "Please choose an account type."); return; }
    if (password !== confirmPassword) { showError(errorBox, "Passwords do not match."); return; }

    if (await emailExists(email)) {
      showError(errorBox, "This email is already registered.");
      return;
    }

    submitBtn.textContent = "Creating account...";
    submitBtn.disabled = true;

    try {
      await createUser(name, email, phone, password, role);
      successBox.innerHTML = '✓ Account created! You can now <a href="login.html">sign in</a>.';
      successBox.style.display = "block";
      registerForm.reset();
    } catch (err) {
      showError(errorBox, err.message || "Could not save this account. Make sure the site is running through Apache.");
    } finally {
      submitBtn.textContent = "Create Account";
      submitBtn.disabled = false;
    }
  });
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = "block";
}
