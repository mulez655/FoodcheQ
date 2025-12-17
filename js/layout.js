async function mount(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const res = await fetch(url);
    el.innerHTML = await res.text();

    // ✅ allow navbar.js to re-run after mount
    if (window.__setAuthUI) window.__setAuthUI();
    if (window.__updateCartBadges) window.__updateCartBadges();
  } catch (e) {
    console.error("Layout mount failed:", url, e);
  }
}


mount("#footerMount", "components/footer.html");
