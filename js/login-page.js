// js/login-page.js
(function () {
  const tabsRoot = document.querySelector("[data-role-tabs]");
  const roleInput = document.getElementById("loginRole");
  const form = document.getElementById("loginForm");

  if (tabsRoot && roleInput) {
    tabsRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-role]");
      if (!btn) return;

      const role = btn.getAttribute("data-role");
      roleInput.value = role;

      // UI state
      tabsRoot.querySelectorAll("button[data-role]").forEach((b) => {
        b.classList.remove("bg-white", "shadow-sm");
        b.classList.add("text-slate-700");
      });

      btn.classList.add("bg-white", "shadow-sm");
      btn.classList.remove("text-slate-700");
    });
  }

  // Wiring happens later (Phase 2)
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("✅ UI ready. Backend wiring for login will be done after all pages are rebuilt.");
    });
  }
})();
