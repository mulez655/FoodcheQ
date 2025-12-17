// js/track-page.js
(function () {
  const form = document.getElementById("trackForm");
  const input = document.getElementById("trackingCode");

  const result = document.getElementById("trackResult");
  const empty = document.getElementById("trackEmpty");

  const trkCodeText = document.getElementById("trkCodeText");
  const trkStatus = document.getElementById("trkStatus");
  const trkLocation = document.getElementById("trkLocation");
  const trkEta = document.getElementById("trkEta");
  const trkTimeline = document.getElementById("trkTimeline");

  function show(el) {
    if (el) el.classList.remove("hidden");
  }
  function hide(el) {
    if (el) el.classList.add("hidden");
  }

  function renderTimeline(items) {
    trkTimeline.innerHTML = "";
    items.forEach((it) => {
      const row = document.createElement("div");
      row.className = "flex items-start gap-3";
      row.innerHTML = `
        <div class="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-600"></div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-slate-900">${it.title}</p>
          <p class="text-xs text-slate-500">${it.time}</p>
        </div>
      `;
      trkTimeline.appendChild(row);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Phase 1 placeholder until wiring
      const code = (input.value || "").trim();
      if (!code) return;

      hide(empty);

      // Demo output so UI is complete (real wiring later)
      trkCodeText.textContent = code;
      trkStatus.textContent = "In Transit";
      trkLocation.textContent = "Delta State Hub";
      trkEta.textContent = "2–3 days";

      renderTimeline([
        { title: "Order confirmed", time: "Today • 09:10" },
        { title: "Picked up by rider", time: "Today • 12:40" },
        { title: "In transit to destination", time: "Today • 16:05" },
      ]);

      show(result);
    });
  }
})();
