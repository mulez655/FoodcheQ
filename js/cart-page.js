/**

* js/cart-page.js
* Tailwind cart page renderer + backend-ready checkout.
*
* Works NOW with localStorage cart (name/price/image/qty),
* and works LATER when backend product IDs exist (productId or id).
*
* IMPORTANT:
* * cart.js currently stores: { id, name, price, image, qty }
* (id might be null right now — that's okay).
* * When backend products are loaded, ensure Add-to-Cart buttons pass data-id="PRODUCT_ID"
* so cart items get id/productId and checkout can create orders.
  */

(function () {
// ====== CONFIG ======
// Set to your backend base URL.
// If you're using a proxy, you can set this to "" and use relative paths.
const API_BASE = "[http://localhost:4000](http://localhost:4000)";

// ====== HELPERS ======
const $ = (sel) => document.querySelector(sel);

function getToken() {
return (
localStorage.getItem("token") ||
localStorage.getItem("accessToken") ||
sessionStorage.getItem("token") ||
""
);
}

function getCart() {
try {
return JSON.parse(localStorage.getItem("cart")) || [];
} catch {
return [];
}
}

function saveCart(cart) {
localStorage.setItem("cart", JSON.stringify(cart));


// keep navbar badges in sync (your navbar.js exposes this)
if (typeof window.__updateCartBadges === "function") {
  window.__updateCartBadges();
}

}

function money(n) {
const num = Number(n) || 0;
return `$${num.toFixed(2)}`;
}

function calcSubtotal(cart) {
return cart.reduce((sum, item) => {
const price = Number(item.price) || 0;
const qty = Number(item.qty) || 1;
return sum + price * qty;
}, 0);
}

// ====== RENDER ======
function render() {
const cart = getCart();

const empty = $("#emptyCart");
const section = $("#cartSection");
const list = $("#cartList");
const subtotalEl = $("#cartSubtotal");
const totalEl = $("#cartTotal");

// If you're missing these IDs in cart.html, nothing will render
if (!empty || !section || !list || !subtotalEl || !totalEl) {
  console.warn(
    "[cart-page.js] Missing required DOM nodes. Ensure cart.html has: #emptyCart, #cartSection, #cartList, #cartSubtotal, #cartTotal"
  );
  return;
}

if (!cart.length) {
  empty.classList.remove("hidden");
  section.classList.add("hidden");
  return;
}

empty.classList.add("hidden");
section.classList.remove("hidden");

const subtotal = calcSubtotal(cart);
subtotalEl.textContent = money(subtotal);
totalEl.textContent = money(subtotal);

list.innerHTML = cart
  .map((item, idx) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const line = price * qty;

    // Backend identity:
    // - id: what your cart.js saves from dataset.id
    // - productId: optional alias if you later migrate
    const hasBackendId = Boolean(item.productId || item.id);

    const identityNote = hasBackendId
      ? `<span class="text-xs text-slate-400">ID linked</span>`
      : `<span class="text-xs text-amber-700">Awaiting backend product ID</span>`;

    const safeName = (item.name || "Unnamed product").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `
      <div class="p-5 flex gap-4" data-index="${idx}">
        <div class="h-20 w-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
          <img src="${item.image || ""}" alt="${safeName}" class="h-full w-full object-cover" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 truncate">${safeName}</p>
              <div class="mt-1 flex items-center gap-3">
                <span class="text-sm text-slate-600">${money(price)}</span>
                <span class="text-slate-300">•</span>
                ${identityNote}
              </div>
            </div>

            <button
              type="button"
              class="text-sm font-semibold text-red-600 hover:text-red-700"
              data-remove
            >
              Remove
            </button>
          </div>

          <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="inline-flex items-center gap-2">
              <button
                type="button"
                class="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                data-minus
                aria-label="Decrease quantity"
              >−</button>

              <span class="min-w-[44px] text-center font-semibold" data-qty>${qty}</span>

              <button
                type="button"
                class="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50"
                data-plus
                aria-label="Increase quantity"
              >+</button>
            </div>

            <div class="text-sm">
              <span class="text-slate-600">Line total:</span>
              <span class="font-bold text-slate-900">${money(line)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  })
  .join("");

attachEvents();


}

function attachEvents() {
const list = $("#cartList");
if (!list) return;

list.querySelectorAll("[data-index]").forEach((row) => {
  const index = Number(row.dataset.index);
  const minus = row.querySelector("[data-minus]");
  const plus = row.querySelector("[data-plus]");
  const remove = row.querySelector("[data-remove]");

  minus?.addEventListener("click", () => {
    const cart = getCart();
    if (!cart[index]) return;

    cart[index].qty = Math.max(1, (Number(cart[index].qty) || 1) - 1);
    saveCart(cart);
    render();
  });

  plus?.addEventListener("click", () => {
    const cart = getCart();
    if (!cart[index]) return;

    cart[index].qty = (Number(cart[index].qty) || 1) + 1;
    saveCart(cart);
    render();
  });

  remove?.addEventListener("click", () => {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    render();
  });
});


}

// ====== BACKEND CHECKOUT (READY FOR LATER) ======
function normalizeForBackend(cart) {
// Only send productId + quantity to backend.
// Backend should compute prices from DB.
const missing = cart.filter((i) => !(i.productId || i.id));
if (missing.length) return { ok: false, missing };

return {
  ok: true,
  items: cart.map((i) => ({
    productId: i.productId || i.id,
    quantity: Number(i.qty) || 1,
  })),
};


}

async function checkout() {
const token = getToken();
if (!token) {
window.location.href = "login.html";
return;
}


const cart = getCart();
if (!cart.length) {
  alert("Your cart is empty.");
  return;
}

const normalized = normalizeForBackend(cart);
if (!normalized.ok) {
  alert(
    "Checkout is ready, but products are not linked to backend IDs yet.\n\nOnce products are loaded into the backend, we’ll run a one-time sync so your cart items get productId automatically."
  );
  return;
}

const btn = document.querySelector("[data-checkout-btn]");
if (btn) {
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing...`;
}

try {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items: normalized.items }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    alert(data?.message || "Checkout failed. Please try again.");
    return;
  }

  // You might return { order: {...} } OR just { ... }
  const orderId = data?.order?.id || data?.id;

  if (orderId) {
    window.location.href = `checkout.html?orderId=${encodeURIComponent(orderId)}`;
  } else {
    window.location.href = "checkout.html";
  }
} catch (e) {
  console.error("Checkout error:", e);
  alert("Network error. Please try again.");
} finally {
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-lock"></i> Proceed to Checkout`;
  }
}


}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
render();


const btn = document.querySelector("[data-checkout-btn]");
btn?.addEventListener("click", (e) => {
  e.preventDefault();
  checkout();
});

// if cart changes in another tab
window.addEventListener("storage", (e) => {
  if (e.key === "cart") render();
});


});
})();
