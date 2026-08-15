/* =========================================================
   FARMANDEH PLATFORM
   Dashboard V2
   Version: 2.0.0
   ========================================================= */

(() => {
  "use strict";

  const VERSION = "2.0.0";
  const STYLE_ID = "farmandeh-dashboard-v2-style";

  /* -------------------------------------------------------
     Utilities
  ------------------------------------------------------- */

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      char =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[char]
    );
  }

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("fa-IR");
  }

  function formatMoney(value) {
    return `${formatNumber(value)} تومان`;
  }

  function getState() {
    try {
      const raw =
        localStorage.getItem("farmandeh-runtime-V1") ||
        localStorage.getItem("farmandeh-runtime-v1");

      if (!raw) return {};

      return JSON.parse(raw);
    } catch (error) {
      console.warn("Farmandeh V2 state read error:", error);
      return {};
    }
  }

  function getRepairs() {
    const state = getState();
    return Array.isArray(state.repairs) ? state.repairs : [];
  }

  function getCustomers() {
    const state = getState();
    return Array.isArray(state.customers) ? state.customers : [];
  }

  function statusLabel(status) {
    const labels = {
      intake: "پذیرش",
      diagnosing: "عیب‌یابی",
      repairing: "در حال تعمیر",
      waiting_part: "منتظر قطعه",
      testing: "تست نهایی",
      ready: "آماده تحویل",
      delivered: "تحویل شده",
      cancelled: "لغو شده"
    };

    return labels[status] || status || "نامشخص";
  }

  /* -------------------------------------------------------
     Dashboard statistics
  ------------------------------------------------------- */

  function getStats() {
    const repairs = getRepairs();
    const customers = getCustomers();

    const active = repairs.filter(
      item =>
        !["delivered", "cancelled"].includes(item.status)
    );

    const ready = repairs.filter(
      item => item.status === "ready"
    );

    const diagnosing = repairs.filter(
      item => item.status === "diagnosing"
    );

    const repairing = repairs.filter(
      item => item.status === "repairing"
    );

    const waiting = repairs.filter(
      item => item.status === "waiting_part"
    );

    const returned = repairs.filter(
      item => item.isReturn
    );

    const revenue = repairs.reduce(
      (sum, item) => sum + Number(item.paid || 0),
      0
    );

    const outstanding = repairs.reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          Number(item.cost || 0) -
            Number(item.paid || 0)
        ),
      0
    );

    return {
      repairs,
      customers,
      total: repairs.length,
      active: active.length,
      ready: ready.length,
      diagnosing: diagnosing.length,
      repairing: repairing.length,
      waiting: waiting.length,
      returned: returned.length,
      revenue,
      outstanding
    };
  }

  /* -------------------------------------------------------
     CSS
  ------------------------------------------------------- */

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `
      .fv2-dashboard {
        --fv2-bg: #07101f;
        --fv2-panel: rgba(20, 31, 53, .88);
        --fv2-panel-2: rgba(26, 39, 67, .92);
        --fv2-border: rgba(148, 163, 184, .16);
        --fv2-text: #f8fafc;
        --fv2-muted: #94a3b8;
        --fv2-accent: #7c3aed;
        --fv2-accent2: #2563eb;
        --fv2-green: #22c55e;
        --fv2-orange: #f59e0b;
        --fv2-red: #ef4444;

        direction: rtl;
        color: var(--fv2-text);
        min-height: 100vh;
        padding:
          max(18px, env(safe-area-inset-top))
          14px
          calc(100px + env(safe-area-inset-bottom));
        background:
          radial-gradient(
            circle at 90% 0%,
            rgba(124,58,237,.22),
            transparent 30%
          ),
          radial-gradient(
            circle at 0% 25%,
            rgba(37,99,235,.16),
            transparent 28%
          ),
          var(--fv2-bg);
      }

      .fv2-dashboard * {
        box-sizing: border-box;
      }

      .fv2-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }

      .fv2-profile {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }

      .fv2-avatar {
        width: 52px;
        height: 52px;
        border-radius: 17px;
        display: grid;
        place-items: center;
        font-weight: 900;
        font-size: 21px;
        color: white;
        flex: 0 0 auto;
        background:
          linear-gradient(
            135deg,
            var(--fv2-accent),
            #06b6d4
          );
        box-shadow:
          0 10px 30px rgba(124,58,237,.28);
      }

      .fv2-title {
        margin: 0;
        font-size: 20px;
        font-weight: 900;
      }

      .fv2-subtitle {
        color: var(--fv2-muted);
        margin-top: 4px;
        font-size: 12px;
      }

      .fv2-version {
        border: 1px solid var(--fv2-border);
        background: rgba(15,23,42,.72);
        border-radius: 999px;
        padding: 8px 11px;
        color: #c4b5fd;
        font-size: 11px;
        white-space: nowrap;
      }

      .fv2-command {
        position: relative;
        overflow: hidden;
        padding: 22px;
        border-radius: 27px;
        border: 1px solid rgba(139,92,246,.28);
        background:
          linear-gradient(
            135deg,
            rgba(76,29,149,.62),
            rgba(30,41,59,.96)
          );
        box-shadow:
          0 22px 55px rgba(0,0,0,.22);
      }

      .fv2-command::after {
        content: "";
        position: absolute;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        left: -70px;
        top: -90px;
        background:
          rgba(99,102,241,.18);
        filter: blur(4px);
      }

      .fv2-eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 10px;
        border-radius: 999px;
        background: rgba(15,23,42,.46);
        color: #c4b5fd;
        font-size: 11px;
        position: relative;
        z-index: 1;
      }

      .fv2-command h1 {
        margin: 17px 0 8px;
        font-size: 30px;
        position: relative;
        z-index: 1;
      }

      .fv2-command p {
        margin: 0;
        color: #cbd5e1;
        line-height: 1.9;
        font-size: 13px;
        position: relative;
        z-index: 1;
      }

      .fv2-command-row {
        display: grid;
        grid-template-columns: repeat(3,1fr);
        gap: 9px;
        margin-top: 20px;
        position: relative;
        z-index: 1;
      }

      .fv2-mini-stat {
        padding: 12px 8px;
        text-align: center;
        border-radius: 17px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(2,6,23,.25);
      }

      .fv2-mini-stat strong {
        display: block;
        font-size: 20px;
      }

      .fv2-mini-stat span {
        display: block;
        color: #a5b4fc;
        margin-top: 4px;
        font-size: 10px;
      }

      .fv2-section-head {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 12px;
        margin: 25px 3px 12px;
      }

      .fv2-section-head h2 {
        margin: 0;
        font-size: 19px;
      }

      .fv2-section-head span {
        color: var(--fv2-muted);
        font-size: 11px;
      }

      .fv2-kpis {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 11px;
      }

      .fv2-kpi {
        min-height: 126px;
        padding: 16px;
        border-radius: 22px;
        border: 1px solid var(--fv2-border);
        background:
          linear-gradient(
            145deg,
            rgba(30,41,59,.94),
            rgba(15,23,42,.92)
          );
      }

      .fv2-kpi-icon {
        font-size: 25px;
        margin-bottom: 14px;
      }

      .fv2-kpi strong {
        display: block;
        font-size: 26px;
        line-height: 1;
      }

      .fv2-kpi span {
        display: block;
        margin-top: 10px;
        color: var(--fv2-muted);
        font-size: 12px;
      }

      .fv2-actions {
        display: grid;
        grid-template-columns: repeat(2,1fr);
        gap: 10px;
      }

      .fv2-action {
        appearance: none;
        width: 100%;
        border: 1px solid var(--fv2-border);
        background: var(--fv2-panel);
        color: var(--fv2-text);
        border-radius: 20px;
        min-height: 90px;
        padding: 15px;
        text-align: right;
        cursor: pointer;
        font-family: inherit;
      }

      .fv2-action:active {
        transform: scale(.98);
      }

      .fv2-action-icon {
        display: block;
        font-size: 25px;
        margin-bottom: 8px;
      }

      .fv2-action-title {
        display: block;
        font-weight: 800;
        font-size: 14px;
      }

      .fv2-action-sub {
        display: block;
        color: var(--fv2-muted);
        margin-top: 5px;
        font-size: 10px;
      }

      .fv2-flow {
        border-radius: 22px;
        border: 1px solid var(--fv2-border);
        background: var(--fv2-panel);
        overflow: hidden;
      }

      .fv2-flow-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 15px;
        border-bottom:
          1px solid rgba(148,163,184,.09);
      }

      .fv2-flow-row:last-child {
        border-bottom: 0;
      }

      .fv2-flow-name {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .fv2-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: 0 0 auto;
      }

      .fv2-dot.blue {
        background: #3b82f6;
        box-shadow: 0 0 15px rgba(59,130,246,.7);
      }

      .fv2-dot.purple {
        background: #8b5cf6;
        box-shadow: 0 0 15px rgba(139,92,246,.7);
      }

      .fv2-dot.orange {
        background: #f59e0b;
        box-shadow: 0 0 15px rgba(245,158,11,.7);
      }

      .fv2-dot.green {
        background: #22c55e;
        box-shadow: 0 0 15px rgba(34,197,94,.7);
      }

      .fv2-flow-count {
        min-width: 38px;
        padding: 6px 10px;
        text-align: center;
        border-radius: 999px;
        background: rgba(148,163,184,.1);
        font-weight: 800;
      }

      .fv2-finance {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .fv2-finance-card {
        padding: 17px;
        border-radius: 21px;
        border: 1px solid var(--fv2-border);
        background: var(--fv2-panel);
      }

      .fv2-finance-card span {
        color: var(--fv2-muted);
        display: block;
        font-size: 11px;
      }

      .fv2-finance-card strong {
        display: block;
        margin-top: 8px;
        font-size: 20px;
      }

      .fv2-recent {
        border-radius: 22px;
        overflow: hidden;
        border: 1px solid var(--fv2-border);
        background: var(--fv2-panel);
      }

      .fv2-repair {
        padding: 15px;
        border-bottom:
          1px solid rgba(148,163,184,.09);
      }

      .fv2-repair:last-child {
        border-bottom: 0;
      }

      .fv2-repair-top {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .fv2-repair-title {
        font-weight: 800;
        font-size: 13px;
      }

      .fv2-repair-status {
        color: #c4b5fd;
        font-size: 10px;
        white-space: nowrap;
      }

      .fv2-repair-sub {
        margin-top: 7px;
        color: var(--fv2-muted);
        font-size: 11px;
      }

      .fv2-empty {
        padding: 24px 15px;
        text-align: center;
        color: var(--fv2-muted);
        line-height: 1.9;
      }

      .fv2-footer-note {
        text-align: center;
        margin: 25px 0 5px;
        color: #64748b;
        font-size: 10px;
      }

      @media (min-width: 700px) {
        .fv2-dashboard {
          max-width: 920px;
          margin: 0 auto;
        }

        .fv2-kpis {
          grid-template-columns:
            repeat(4,1fr);
        }

        .fv2-actions {
          grid-template-columns:
            repeat(4,1fr);
        }

        .fv2-finance {
          grid-template-columns:
            repeat(2,1fr);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* -------------------------------------------------------
     Recent repairs
  ------------------------------------------------------- */

  function recentRepairs(repairs) {
    if (!repairs.length) {
      return `
        <div class="fv2-empty">
          هنوز پرونده‌ای ثبت نشده.<br>
          با اولین پذیرش، فعالیت واقعی اینجا نمایش داده می‌شود.
        </div>
      `;
    }

    return repairs
      .slice()
      .sort((a, b) =>
        String(b.updatedAt || b.createdAt || "")
          .localeCompare(
            String(a.updatedAt || a.createdAt || "")
          )
      )
      .slice(0, 5)
      .map(
        item => `
          <div class="fv2-repair">
            <div class="fv2-repair-top">
              <div class="fv2-repair-title">
                ${esc(item.device || "دستگاه بدون نام")}
              </div>

              <div class="fv2-repair-status">
                ${esc(statusLabel(item.status))}
              </div>
            </div>

            <div class="fv2-repair-sub">
              ${esc(item.customerName || "بدون مشتری")}
              ${item.vehicle
                ? ` • ${esc(item.vehicle)}`
                : ""}
            </div>
          </div>
        `
      )
      .join("");
  }

  /* -------------------------------------------------------
     Main dashboard renderer
  ------------------------------------------------------- */

  function renderDashboard() {
    const s = getStats();

    return `
      <div class="fv2-dashboard">

        <div class="fv2-top">

          <div class="fv2-profile">

            <div class="fv2-avatar">
              F
            </div>

            <div>
              <h2 class="fv2-title">
                فرمانده
              </h2>

              <div class="fv2-subtitle">
                مرکز فرماندهی شخصی و کسب‌وکار
              </div>
            </div>

          </div>

          <div class="fv2-version">
            V${VERSION}
          </div>

        </div>


        <section class="fv2-command">

          <div class="fv2-eyebrow">
            ⚡ COMMAND CENTER V2
          </div>

          <h1>
            امروز چه خبر است؟
          </h1>

          <p>
            وضعیت تعمیرگاه، مشتری‌ها، جریان تعمیر
            و امور مهم را از یک نقطه کنترل کن.
          </p>

          <div class="fv2-command-row">

            <div class="fv2-mini-stat">
              <strong>
                ${formatNumber(s.active)}
              </strong>
              <span>
                پرونده فعال
              </span>
            </div>

            <div class="fv2-mini-stat">
              <strong>
                ${formatNumber(s.ready)}
              </strong>
              <span>
                آماده تحویل
              </span>
            </div>

            <div class="fv2-mini-stat">
              <strong>
                ${formatNumber(s.customers.length)}
              </strong>
              <span>
                مشتری
              </span>
            </div>

          </div>

        </section>


        <div class="fv2-section-head">
          <div>
            <h2>
              وضعیت لحظه‌ای
            </h2>
          </div>

          <span>
            داده واقعی Runtime
          </span>
        </div>


        <section class="fv2-kpis">

          <article class="fv2-kpi">
            <div class="fv2-kpi-icon">
              🛠️
            </div>

            <strong>
              ${formatNumber(s.total)}
            </strong>

            <span>
              کل تعمیرات
            </span>
          </article>


          <article class="fv2-kpi">
            <div class="fv2-kpi-icon">
              ⚡
            </div>

            <strong>
              ${formatNumber(s.active)}
            </strong>

            <span>
              تعمیر فعال
            </span>
          </article>


          <article class="fv2-kpi">
            <div class="fv2-kpi-icon">
              ✅
            </div>

            <strong>
              ${formatNumber(s.ready)}
            </strong>

            <span>
              آماده تحویل
            </span>
          </article>


          <article class="fv2-kpi">
            <div class="fv2-kpi-icon">
              👥
            </div>

            <strong>
              ${formatNumber(s.customers.length)}
            </strong>

            <span>
              مشتریان
            </span>
          </article>

        </section>


        <div class="fv2-section-head">
          <div>
            <h2>
              دسترسی سریع
            </h2>
          </div>

          <span>
            عملیات روزانه
          </span>
        </div>


        <section class="fv2-actions">

          <button
            class="fv2-action"
            data-fv2-action="new-repair"
          >
            <span class="fv2-action-icon">
              ➕
            </span>

            <span class="fv2-action-title">
              پذیرش جدید
            </span>

            <span class="fv2-action-sub">
              ساخت پرونده تعمیر
            </span>
          </button>


          <button
            class="fv2-action"
            data-fv2-action="repairs"
          >
            <span class="fv2-action-icon">
              🛠️
            </span>

            <span class="fv2-action-title">
              تعمیرات
            </span>

            <span class="fv2-action-sub">
              پرونده‌ها و وضعیت
            </span>
          </button>


          <button
            class="fv2-action"
            data-fv2-action="customers"
          >
            <span class="fv2-action-icon">
              👥
            </span>

            <span class="fv2-action-title">
              مشتریان
            </span>

            <span class="fv2-action-sub">
              پروفایل و سوابق
            </span>
          </button>


          <button
            class="fv2-action"
            data-fv2-action="studio"
          >
            <span class="fv2-action-icon">
              🎛️
            </span>

            <span class="fv2-action-title">
              استودیو
            </span>

            <span class="fv2-action-sub">
              شخصی‌سازی فرمانده
            </span>
          </button>

        </section>


        <div class="fv2-section-head">
          <div>
            <h2>
              خط تعمیرگاه
            </h2>
          </div>

          <span>
            Repair Pipeline
          </span>
        </div>


        <section class="fv2-flow">

          <div class="fv2-flow-row">

            <div class="fv2-flow-name">
              <span class="fv2-dot blue"></span>
              عیب‌یابی
            </div>

            <span class="fv2-flow-count">
              ${formatNumber(s.diagnosing)}
            </span>

          </div>


          <div class="fv2-flow-row">

            <div class="fv2-flow-name">
              <span class="fv2-dot purple"></span>
              در حال تعمیر
            </div>

            <span class="fv2-flow-count">
              ${formatNumber(s.repairing)}
            </span>

          </div>


          <div class="fv2-flow-row">

            <div class="fv2-flow-name">
              <span class="fv2-dot orange"></span>
              منتظر قطعه
            </div>

            <span class="fv2-flow-count">
              ${formatNumber(s.waiting)}
            </span>

          </div>


          <div class="fv2-flow-row">

            <div class="fv2-flow-name">
              <span class="fv2-dot green"></span>
              آماده تحویل
            </div>

            <span class="fv2-flow-count">
              ${formatNumber(s.ready)}
            </span>

          </div>

        </section>


        <div class="fv2-section-head">
          <div>
            <h2>
              مالی
            </h2>
          </div>

          <span>
            بر اساس پرونده‌ها
          </span>
        </div>


        <section class="fv2-finance">

          <div class="fv2-finance-card">

            <span>
              دریافتی ثبت‌شده
            </span>

            <strong>
              ${formatMoney(s.revenue)}
            </strong>

          </div>


          <div class="fv2-finance-card">

            <span>
              مانده مطالبات
            </span>

            <strong>
              ${formatMoney(s.outstanding)}
            </strong>

          </div>

        </section>


        <div class="fv2-section-head">
          <div>
            <h2>
              آخرین فعالیت‌ها
            </h2>
          </div>

          <span>
            آخرین ۵ تعمیر
          </span>
        </div>


        <section class="fv2-recent">
          ${recentRepairs(s.repairs)}
        </section>


        <div class="fv2-footer-note">
          Farmandeh Platform • Dashboard V2
        </div>

      </div>
    `;
  }

  /* -------------------------------------------------------
     Public API
  ------------------------------------------------------- */

  window.FarmandehDashboardV2 = {

    version: VERSION,

    render() {
      installStyles();
      return renderDashboard();
    },

    mount(target) {
      installStyles();

      const element =
        typeof target === "string"
          ? document.querySelector(target)
          : target;

      if (!element) {
        console.error(
          "Farmandeh Dashboard V2 mount target not found."
        );
        return false;
      }

      element.innerHTML = renderDashboard();

      return true;
    },

    refresh(target) {
      return this.mount(target);
    },

    stats() {
      return getStats();
    }

  };

  /* -------------------------------------------------------
     Action bridge
     V1 will connect these actions in next step.
  ------------------------------------------------------- */

  document.addEventListener("click", event => {

    const button =
      event.target.closest("[data-fv2-action]");

    if (!button) return;

    const action =
      button.dataset.fv2Action;

    window.dispatchEvent(
      new CustomEvent(
        "farmandeh:v2-action",
        {
          detail: { action }
        }
      )
    );

  });

  console.log(
    `Farmandeh Dashboard V2 ${VERSION} loaded`
  );

})();
