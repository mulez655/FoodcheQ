// js/checkout-summary.js

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

function money(amount) {
  const n = Number(amount) || 0;
  return `$${n.toFixed(2)}`;
}

function renderOrderSummary() {
  const list = document.getElementById("orderSummaryList");
  const totalEl = document.getElementById("orderSummaryTotal");

  if (!list || !totalEl) return;

  const cart = getCart();

  // Remove any previously injected item rows (keep the total row)
  const totalRow = list.querySelector("li:last-child");
  list.innerHTML = "";
  if (totalRow) list.appendChild(totalRow);

  if (cart.length === 0) {
    const empty = document.createElement("li");
    empty.className = "list-group-item text-muted";
    empty.textContent = "Your cart is empty.";
    list.insertBefore(empty, totalRow);
    totalEl.textContent = money(0);
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const lineTotal = qty * price;
    total += lineTotal;

    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    li.innerHTML = `
      <div class="d-flex flex-column">
        <strong>${item.name || "Item"}</strong>
        <small class="text-muted">Qty: ${qty}</small>
      </div>
      <span>${money(lineTotal)}</span>
    `;

    list.insertBefore(li, totalRow);
  });

  totalEl.textContent = money(total);
}

document.addEventListener("DOMContentLoaded", () => {
  renderOrderSummary();

  // Optional: keep summary updated if cart changes in another tab/page
  window.addEventListener("storage", (e) => {
    if (e.key === "cart") renderOrderSummary();
  });
});
