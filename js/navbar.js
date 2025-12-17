// js/navbar.js
(function () {
  const mount = document.getElementById("navbarMount");
  if (!mount) return;

  const currentPage = (() => {
    const file = window.location.pathname.split("/").pop();
    return file && file.length ? file : "index.html";
  })();

  const isActive = (href) => href === currentPage;

  const linkClass = (href, extra = "") =>
    [
      "text-sm font-medium hover:text-brand-green",
      isActive(href) ? "text-brand-green" : "text-slate-700",
      extra,
    ].join(" ");

  const mobileLinkClass = (href) =>
    [
      "px-3 py-2 rounded-xl hover:bg-slate-100",
      isActive(href) ? "text-brand-green font-semibold" : "text-slate-800",
    ].join(" ");

  mount.innerHTML = `
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div class="mx-auto max-w-7xl px-4">
        <div class="h-16 flex items-center justify-between">
          <!-- Logo -->
          <a href="index.html" class="flex items-center gap-3">
            <img
              src="https://foodcheq.coop/upload/eSio9fKkSKNFqEeGkq6kRnJDhaFpE1.png"
              alt="FoodCheQ"
              class="h-10 w-auto"
            />
          </a>

          <!-- Desktop Nav -->
          <nav class="hidden lg:flex items-center gap-6">
            <a href="index.html" class="${linkClass("index.html")}">Home</a>
            <a href="about.html" class="${linkClass("about.html")}">About</a>
            <a href="product-category.html" class="${linkClass("product-category.html")}">Shop</a>
            <a href="sample.html" class="${linkClass("sample.html")}">Request Sample</a>
            <a href="wishlist.html" class="${linkClass("wishlist.html")}">Wishlist</a>

            <span class="h-6 w-px bg-slate-200"></span>

            <a href="login.html" class="text-xs uppercase tracking-wide font-semibold ${isActive("login.html") ? "text-brand-green" : "text-slate-700"} hover:text-brand-green">
              Request<br />Logistics
            </a>
            <a href="track-shipment.html" class="text-xs uppercase tracking-wide font-semibold ${isActive("track-shipment.html") ? "text-brand-green" : "text-slate-700"} hover:text-brand-green">
              Track<br />Shipment
            </a>
            <a href="register.html" class="text-xs uppercase tracking-wide font-semibold ${isActive("register.html") ? "text-brand-green" : "text-slate-700"} hover:text-brand-green">
              Become a<br />Partner
            </a>
          </nav>

          <!-- Icons -->
          <div class="flex items-center gap-3">
            <a
              href="wishlist.html"
              class="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-100"
              aria-label="Wishlist"
              title="Wishlist"
            >
              <i class="fa-regular fa-heart text-slate-700"></i>
            </a>

            <a
              href="login.html"
              class="hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-100"
              aria-label="Account"
              title="Account"
            >
              <i class="fa-solid fa-user text-slate-700"></i>
            </a>

            <a
              href="cart.html"
              class="relative inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-100"
              aria-label="Cart"
              title="Cart"
            >
              <i class="fa-solid fa-cart-shopping text-slate-700"></i>
              <span
                id="cartCount"
                class="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-brand-green rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center"
              >0</span>
            </a>

            <!-- Mobile menu button -->
            <button
              id="menuBtn"
              class="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl hover:bg-slate-100"
              aria-label="Open menu"
              type="button"
            >
              <i class="fa-solid fa-bars text-slate-800"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Drawer -->
      <div id="mobileDrawer" class="lg:hidden fixed inset-0 z-50 hidden" aria-hidden="true">
        <div id="drawerBackdrop" class="absolute inset-0 bg-black/40"></div>

        <div class="absolute left-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-soft p-4 flex flex-col">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-slate-900">Menu</span>
            <button
              id="closeDrawer"
              class="h-10 w-10 rounded-xl hover:bg-slate-100 inline-flex items-center justify-center"
              aria-label="Close menu"
              type="button"
            >
              <i class="fa-solid fa-xmark text-slate-800"></i>
            </button>
          </div>

          <div class="mt-4 flex flex-col gap-2">
            <a class="${mobileLinkClass("index.html")}" href="index.html">Home</a>
            <a class="${mobileLinkClass("about.html")}" href="about.html">About</a>
            <a class="${mobileLinkClass("product-category.html")}" href="product-category.html">Shop</a>
            <a class="${mobileLinkClass("sample.html")}" href="sample.html">Request Sample</a>
            <a class="${mobileLinkClass("wishlist.html")}" href="wishlist.html">Wishlist</a>
          </div>

          <div class="mt-4 border-t pt-4 flex flex-col gap-2">
            <a class="px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold text-brand-green" href="login.html">Request Logistics</a>
            <a class="px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold text-brand-green" href="register.html">Become a Partner</a>
            <a class="px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold text-brand-green" href="track-shipment.html">Track Shipment</a>
          </div>

          <div class="mt-auto pt-4 border-t">
            <div class="text-xs text-slate-500 mb-2">Currency</div>
            <form action="https://foodcheq.coop/set-currency" method="POST">
              <input type="hidden" name="_token" value="hBap8p3Rj0gaLm42Yhgu4TZJH08MesPvE74ATfN9" />
              <select
                id="currencyMobile"
                name="currency"
                onchange="this.form.submit()"
                class="w-full rounded-xl px-3 py-2 border outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="USD" selected>USD ($)</option>
                <option value="NGN">NGN (₦)</option>
              </select>
            </form>
          </div>
        </div>
      </div>
    </header>
  `;

  // ===== Drawer logic =====
  const menuBtn = document.getElementById("menuBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const closeDrawer = document.getElementById("closeDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");

  function openDrawer() {
    mobileDrawer.classList.remove("hidden");
    mobileDrawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDrawerFn() {
    mobileDrawer.classList.add("hidden");
    mobileDrawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", openDrawer);
  closeDrawer?.addEventListener("click", closeDrawerFn);
  drawerBackdrop?.addEventListener("click", closeDrawerFn);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawerFn();
  });

  // ===== Cart badge sync (safe, no dependency on cart.js internals) =====
  function syncCartBadge() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const count = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
      const badge = document.getElementById("cartCount");
      if (badge) badge.textContent = String(count);
    } catch {
      // ignore
    }
  }

  syncCartBadge();
  window.addEventListener("storage", syncCartBadge);
})();
