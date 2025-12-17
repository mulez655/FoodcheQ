// js/product-category.js
(function () {
  const grid = document.getElementById("productGrid");
  const loading = document.getElementById("shopLoading");
  const empty = document.getElementById("shopEmpty");
  const searchInput = document.getElementById("shopSearch");
  const sortSelect = document.getElementById("sortProducts");

  // Expecting products-data.js to set this:
  const DATA = window.PRODUCTS_DATA || {};
  const PRODUCTS = Array.isArray(DATA.products) ? DATA.products : [];

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function money(n) {
    const num = Number(n || 0);
    return `$${num.toFixed(2)}`;
  }

  function normalizeProduct(p) {
    const slug = p.slug || slugify(p.name);
    return {
      slug,
      name: p.name || "Product",
      price: Number(p.price || 0),
      unit: p.unit || "",
      image: p.image || "",
      short: p.short || p.shortDescription || "",
      category: p.category || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
    };
  }

  let state = {
    q: "",
    sort: "az",
    list: PRODUCTS.map(normalizeProduct),
  };

  function applyFilters() {
    const q = state.q.trim().toLowerCase();

    let filtered = state.list.filter((p) => {
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.tags || []).join(" ").toLowerCase().includes(q)
      );
    });

    // sorting
    const s = state.sort;
    filtered.sort((a, b) => {
      if (s === "az") return a.name.localeCompare(b.name);
      if (s === "za") return b.name.localeCompare(a.name);
      if (s === "low-high") return a.price - b.price;
      if (s === "high-low") return b.price - a.price;
      return 0;
    });

    return filtered;
  }

  function cardHTML(p) {
    const unitText = p.unit ? ` / ${p.unit}` : "";
    const subtitle = p.short
      ? p.short
      : "Premium herbal product — natural and effective.";

    return `
      <article class="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
        <a href="product.html?slug=${encodeURIComponent(p.slug)}" class="block">
          <div class="aspect-[4/3] bg-slate-50 overflow-hidden">
            <img
              src="${p.image}"
              alt="${p.name}"
              class="h-full w-full object-cover group-hover:scale-[1.03] transition"
              loading="lazy"
            />
          </div>

          <div class="p-4">
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-semibold leading-tight">${p.name}</h3>
              <span class="shrink-0 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                ${money(p.price)}
              </span>
            </div>

            <p class="mt-2 text-sm text-slate-600 line-clamp-2">
              ${subtitle}
            </p>

            <p class="mt-3 text-xs text-slate-500">
              ${money(p.price)}${unitText}
            </p>
          </div>
        </a>

        <div class="px-4 pb-4">
          <div class="grid grid-cols-2 gap-2">
            <button
              class="js-add-to-cart rounded-xl bg-emerald-600 text-white py-2 text-sm font-semibold hover:bg-emerald-700 transition"
              data-name="${p.name}"
              data-price="${p.price}"
              data-image="${p.image}"
              data-qty="1"
            >
              <i class="fa-solid fa-cart-shopping mr-2"></i>Add
            </button>

            <button
              class="js-add-to-wishlist rounded-xl border border-emerald-200 text-emerald-700 py-2 text-sm font-semibold hover:bg-emerald-50 transition"
              data-name="${p.name}"
              data-price="${p.price}"
              data-image="${p.image}"
            >
              <i class="fa-regular fa-heart mr-2"></i>Save
            </button>
          </div>

          <a
            href="product.html?slug=${encodeURIComponent(p.slug)}"
            class="mt-2 block text-center rounded-xl border border-slate-200 py-2 text-sm font-semibold hover:bg-slate-50 transition"
          >
            View Details
          </a>
        </div>
      </article>
    `;
  }

  function attachActions() {
    // cart.js functions should exist in your project already
    const hasAddToCart = typeof window.addToCart === "function";
    const hasAddToWishlist = typeof window.addToWishlist === "function";

    grid.querySelectorAll(".js-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", function () {
        const product = {
          name: this.dataset.name,
          price: parseFloat(this.dataset.price),
          image: this.dataset.image,
          qty: parseInt(this.dataset.qty || "1", 10),
        };

        if (hasAddToCart) {
          window.addToCart(product);
        } else {
          // fallback
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const existing = cart.find((x) => x.name === product.name);
          if (existing) existing.qty += product.qty;
          else cart.push(product);
          localStorage.setItem("cart", JSON.stringify(cart));
        }

        if (typeof window.updateCartCount === "function") window.updateCartCount();
      });
    });

    grid.querySelectorAll(".js-add-to-wishlist").forEach((btn) => {
      btn.addEventListener("click", function () {
        const item = {
          name: this.dataset.name,
          price: parseFloat(this.dataset.price),
          image: this.dataset.image,
        };

        if (hasAddToWishlist) {
          window.addToWishlist(item);
        } else {
          // fallback
          const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
          const exists = wishlist.some((x) => x.name === item.name);
          if (!exists) wishlist.push(item);
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }

        if (typeof window.updateWishlistCount === "function") window.updateWishlistCount();
      });
    });
  }

  function render() {
    // show loading once
    loading.classList.add("hidden");
    grid.classList.remove("hidden");

    const list = applyFilters();

    if (!list.length) {
      grid.classList.add("hidden");
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    grid.classList.remove("hidden");

    grid.innerHTML = list.map(cardHTML).join("");
    attachActions();
  }

  function init() {
    if (!PRODUCTS.length) {
      // If you forgot to load products-data.js
      loading.classList.add("hidden");
      empty.classList.remove("hidden");
      return;
    }

    // initial render
    loading.classList.add("hidden");
    render();

    // events
    searchInput?.addEventListener("input", (e) => {
      state.q = e.target.value || "";
      render();
    });

    sortSelect?.addEventListener("change", (e) => {
      state.sort = e.target.value || "az";
      render();
    });
  }

  init();
})();
