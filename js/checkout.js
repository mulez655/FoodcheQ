// js/checkout.js
import { api } from "./api.js";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm") || document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cart = getCart();
    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    // backend expects: { items: [{ productId, quantity }] }
    const items = cart.map((item) => ({
      productId: item.id || item.productId,
      quantity: Number(item.qty || item.quantity || 1),
    }));

    // If any productId is missing, order/payment will fail
    if (items.some((i) => !i.productId)) {
      alert("Some cart items are missing productId. Please re-add them to cart.");
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const oldText = btn?.textContent;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Processing...";
    }

    try {
      // 1) Create order
      const orderRes = await api("/api/orders", {
        method: "POST",
        auth: true,
        body: { items },
      });

      const orderId = orderRes?.order?.id;
      if (!orderId) throw new Error("Order created but order id not returned.");

      // 2) Init Paystack (✅ correct endpoint)
      const payRes = await api("/api/payments/paystack/init", {
        method: "POST",
        auth: true,
        body: { orderId },
      });

      // backend returns { authorizationUrl, reference }
      const authorizationUrl = payRes?.authorizationUrl;
      if (!authorizationUrl) throw new Error("Payment init failed (no authorizationUrl).");

      // 3) Redirect to Paystack
      window.location.href = authorizationUrl;
    } catch (err) {
      alert(err.message || "Checkout failed.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = oldText || "Checkout";
      }
    }
  });
});
