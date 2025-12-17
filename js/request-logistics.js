// js/request-logistics.js
(function () {
  const form = document.getElementById("logisticsForm");
  const btn = document.getElementById("submitBtn");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalMsg = document.getElementById("modalMsg");

  function openModal(title, msg) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalMsg.textContent = msg;
    modal.classList.remove("hidden");
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
  }

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function getToken() {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("token") ||
      ""
    );
  }

  // 🔧 Change this later to your real backend base URL if needed
  const API_BASE = ""; // e.g. "http://localhost:4000" or your deployed URL

  // NOTE:
  // Your current backend delivery creation endpoint is vendor-only:
  // POST /vendor/deliveries requires vendor auth + orderId.
  //
  // This page is a "customer request logistics" page, so for now we:
  // 1) Save request locally (works immediately)
  // 2) Later you can replace submitToBackend() with your real customer logistics endpoint.

  async function submitToBackend(payload) {
    // Placeholder: if you later add a real endpoint like:
    // POST /logistics/requests (customer)
    //
    // return fetch(`${API_BASE}/logistics/requests`, {...})
    //
    // For now we return null so it falls back to local storage.
    return null;
  }

  function saveLocally(payload) {
    const key = "logisticsRequests";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const requestId = "FQ-LR-" + Date.now().toString(36).toUpperCase();

    existing.unshift({
      id: requestId,
      createdAt: new Date().toISOString(),
      status: "PENDING",
      ...payload,
    });

    localStorage.setItem(key, JSON.stringify(existing));
    return requestId;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      orderId: form.orderId.value.trim() || null,
      fullName: form.fullName.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      pickupLocation: form.pickupLocation.value.trim(),
      dropoffLocation: form.dropoffLocation.value.trim(),
      pickupDate: form.pickupDate.value || null,
      packageType: form.packageType.value,
      notes: form.notes.value.trim() || null,
    };

    // tiny validation
    if (!payload.fullName || !payload.phone || !payload.email) {
      openModal("Missing details", "Please fill in your name, phone, and email.");
      return;
    }

    btn.disabled = true;
    btn.classList.add("opacity-70", "cursor-not-allowed");

    try {
      // Try backend (future)
      const token = getToken();
      const backendRes = await submitToBackend(payload, token);

      if (backendRes && backendRes.ok) {
        openModal("Request submitted", "Your logistics request has been submitted successfully.");
        form.reset();
      } else {
        // Local fallback (works now)
        const requestId = saveLocally(payload);
        openModal(
          "Request saved",
          `Your request was saved locally for now. Reference ID: ${requestId}.`
        );
        form.reset();
      }
    } catch (err) {
      const requestId = saveLocally(payload);
      openModal(
        "Saved (offline)",
        `We couldn't reach the server. Your request was saved locally. Reference ID: ${requestId}.`
      );
    } finally {
      btn.disabled = false;
      btn.classList.remove("opacity-70", "cursor-not-allowed");
    }
  });
})();
