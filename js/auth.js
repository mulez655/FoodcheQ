import { api, setToken } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // LOGIN
  // =========================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    console.log("[auth] login handler attached");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value;

      if (!email || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const btn = loginForm.querySelector('button[type="submit"]');
      const oldText = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Logging in...";
      }

      try {
        const res = await api("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });

        const token =
          res?.token ||
          res?.accessToken ||
          res?.data?.token ||
          res?.data?.accessToken;

        if (!token) throw new Error("No token returned from server");

        setToken(token);
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message || "Login failed");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = oldText || "Login";
        }
      }
    });
  }

  // =========================
  // REGISTER
  // =========================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    console.log("[auth] register handler attached");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("registerName")?.value.trim();
      const email = document.getElementById("registerEmail")?.value.trim();
      const password = document.getElementById("registerPassword")?.value;
      const confirm = document.getElementById("registerConfirm")?.value;

      if (!name || !email || !password) {
        alert("Please fill all required fields.");
        return;
      }

      if (confirm && password !== confirm) {
        alert("Passwords do not match.");
        return;
      }

      const btn = registerForm.querySelector('button[type="submit"]');
      const oldText = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Creating account...";
      }

      try {
        const res = await api("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
        });

        // Some backends return success:true, message, etc — we don't depend on shape
        alert("Account created. Please login.");
        window.location.href = "login.html";
      } catch (err) {
        alert(err.message || "Registration failed");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = oldText || "Register";
        }
      }
    });
  }
});
