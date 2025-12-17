// js/wishlist-page.js
(function () {
  function safeParse(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function getWishlist() {
    // If cart.js already has helpers, use them
    if (typeof window.getWishlist === "function") return window.getWishlist();
    return safeParse("wishlist", []);
  }

  function saveWishlist(list) {
    if (typeof window.saveWishlist === "function") return window.saveWishlist(list);
    localStorage.setItem("wishlist", JSON.stringify(list));
  }

  function getCart() {
    if (typeof window.getCart === "function") return window.getCart();
    return safeParse("cart", []);
  }

  function saveCart(cart) {
    if (typeof window.saveCart === "function") return window.saveCart(cart);
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function updateBadges() {
    // Prefer your existing functions
    if (typeof window.updateWishlistCount === "function") window.updateWishlistCount();
    if (typeof window.updateCartCount === "function") window.updateCartCount();

    // navbar.js exposes this (optional)
    if (typeof window.__updateCartBadges === "function") window.__updateCartBadges();
  }

  function formatMoney(n) {
    const num = Number(n) || 0;
    return `$${num.toFixed(2)}`;
  }

  function loadWishlist() {
    const wishlist = getWishlist();
    const table = document.getElementById("wishlistTable");
    const totalEl = document.getElementById("wishlistTotal");

    const empty = document.getElementById("emptyWishlist");
    const container = document.getElementById("wishlistContainer");
    const summary = document.getElementById("wishlistSummary");

    if (!table || !totalEl || !empty || !container || !summary) return;

    if (!wishlist.length) {
      empty.classList.remove("hidden");
      container.classList.add("hidden");
      summary.classList.add("hidden");
      totalEl.textContent = "0";
      updateBadges();
      return;
    }

    empty.classList.add("hidden");
    container.classList.remove("hidden");
    summary.classList.remove("hidden");

    totalEl.textContent = String(wishlist.length);

    table.innerHTML = `
      <thead class="bg-slate-50 text-slate-700">
        <tr>
          <th class="px-4 py-3 text-xs font-extrabold uppercase tracking-wide">Product</th>
          <th class="px-4 py-3 text-xs font-extrabold uppercase tracking-wide">Image</th>
          <th class="px-4 py-3 text-xs font-extrabold uppercase tracking-wide">Price</th>
          <th class="px-4 py-3 text-xs font-extrabold uppercase tracking-wide">Actions</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 bg-white"></tbody>
    `;

    const tbody = table.querySelector("tbody");

    wishlist.forEach((item, index) => {
      const name = item?.name || "Unnamed product";
      const img = item?.image || "";
      const price = Number(item?.price) || 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-4 font-semibold text-slate-800">${name}</td>
        <td class="px-4 py-4">
          <div class="h-14 w-14 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            ${img ? `<img src="${img}" alt="${name}" class="h-full w-full object-cover" />` : ""}
          </div>
        </td>
        <td class="px-4 py-4 font-bold text-slate-900">${formatMoney(price)}</td>
        <td class="px-4 py-4">
          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              class="move-to-cart inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700"
              data-index="${index}"
            >
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>

            <button
              class="remove-wishlist inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-50"
              data-index="${index}"
            >
              <i class="fa-solid fa-trash"></i> Remove
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Remove
    table.querySelectorAll(".remove-wishlist").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        const list = getWishlist();
        list.splice(i, 1);
        saveWishlist(list);
        loadWishlist();
        updateBadges();
      });
    });

    // Move to cart
    table.querySelectorAll(".move-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.index);
        const list = getWishlist();
        const product = list[i];
        if (!product) return;

        // Prefer cart.js addToCart if available
        if (typeof window.addToCart === "function") {
          window.addToCart({
            id: product.id || null,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image || "",
            qty: 1,
          });
        } else {
          const cart = getCart();
          const existing = cart.find((x) => x.name === product.name);
          if (existing) existing.qty = (Number(existing.qty) || 0) + 1;
          else cart.push({ ...product, qty: 1 });
          saveCart(cart);
        }

        // remove from wishlist
        list.splice(i, 1);
        saveWishlist(list);

        alert((product.name || "Item") + " moved to cart!");
        loadWishlist();
        updateBadges();
      });
    });

    updateBadges();
  }

  document.addEventListener("DOMContentLoaded", loadWishlist);
})();
