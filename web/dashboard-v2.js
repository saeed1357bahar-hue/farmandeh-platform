/* =========================================================
   FARMANDEH PLATFORM
   COMMAND CENTER V2
   Version: 2.1.0
   Purpose:
   - Replace V1 Home visually
   - Keep existing V1 routes/actions
   - Preserve Back / Repairs / Customers / Studio
   ========================================================= */

(() => {
  "use strict";

  const VERSION = "2.1.0";
  const STORAGE_KEY = "farmandeh-runtime-V1";
  const STYLE_ID = "farmandeh-v2-command-style";

  let patchTimer = null;
  let patching = false;

  /* =======================================================
     UTILITIES
  ======================================================= */

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

  function number(value) {
    return Number(value || 0).toLocaleString("fa-IR");
  }

  function money(value) {
    return `${number(value)} تومان`;
  }

  function state() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return {
          repairs: [],
          customers: [],
          vehicles: []
        };
      }

      const data = JSON.parse(raw);

      return {
        ...data,

        repairs:
          Array.isArray(data.repairs)
            ? data.repairs
            : [],

        customers:
          Array.isArray(data.customers)
            ? data.customers
            : [],

        vehicles:
          Array.isArray(data.vehicles)
            ? data.vehicles
            : []
      };
    } catch (error) {
      console.error(
        "Farmandeh V2 state error:",
        error
      );

      return {
        repairs: [],
        customers: [],
        vehicles: []
      };
    }
  }

  function statusLabel(status) {
    return (
      {
        intake: "پذیرش",
        diagnosing: "عیب‌یابی",
        diagnosis: "عیب‌یابی",
        repairing: "در حال تعمیر",
        waiting_part: "منتظر قطعه",
        testing: "تست",
        ready: "آماده تحویل",
        delivered: "تحویل‌شده",
        cancelled: "لغو‌شده"
      }[status] || status || "نامشخص"
    );
  }

  /* =======================================================
     STATISTICS
  ======================================================= */

  function statistics() {
    const data = state();

    const repairs = data.repairs;
    const customers = data.customers;

    const open = repairs.filter(
      repair =>
        ![
          "delivered",
          "cancelled"
        ].includes(repair.status)
    );

    const intake = repairs.filter(
      repair =>
        repair.status === "intake"
    );

    const diagnosing = repairs.filter(
      repair =>
        [
          "diagnosing",
          "diagnosis"
        ].includes(repair.status)
    );

    const repairing = repairs.filter(
      repair =>
        repair.status === "repairing"
    );

    const waiting = repairs.filter(
      repair =>
        repair.status === "waiting_part"
    );

    const testing = repairs.filter(
      repair =>
        repair.status === "testing"
    );

    const ready = repairs.filter(
      repair =>
        repair.status === "ready"
    );

    const returned = repairs.filter(
      repair =>
        repair.isReturn
    );

    const delivered = repairs.filter(
      repair =>
        repair.status === "delivered"
    );

    const revenue = repairs.reduce(
      (sum, repair) =>
        sum + Number(repair.paid || 0),
      0
    );

    const totalValue = repairs.reduce(
      (sum, repair) =>
        sum + Number(repair.cost || 0),
      0
    );

    const outstanding = repairs.reduce(
      (sum, repair) =>
        sum +
        Math.max(
          0,
          Number(repair.cost || 0) -
            Number(repair.paid || 0)
        ),
      0
    );

    return {
      data,
      repairs,
      customers,

      total: repairs.length,
      open: open.length,
      intake: intake.length,
      diagnosing: diagnosing.length,
      repairing: repairing.length,
      waiting: waiting.length,
      testing: testing.length,
      ready: ready.length,
      returned: returned.length,
      delivered: delivered.length,

      revenue,
      totalValue,
      outstanding
    };
  }

  /* =======================================================
     CSS
  ======================================================= */

  function installStyles() {
    if (
      document.getElementById(STYLE_ID)
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id = STYLE_ID;

    style.textContent = `

      /* ================================================
         V2 ROOT
      ================================================= */

      .fv2-home {
        --fv2-bg: #07101d;
        --fv2-panel: rgba(18,29,50,.93);
        --fv2-panel-soft: rgba(25,38,64,.82);
        --fv2-line: rgba(148,163,184,.15);
        --fv2-text: #f8fafc;
        --fv2-muted: #94a3b8;
        --fv2-purple: #7c3aed;
        --fv2-blue: #2563eb;
        --fv2-cyan: #06b6d4;
        --fv2-green: #22c55e;
        --fv2-orange: #f59e0b;
        --fv2-red: #ef4444;

        direction: rtl;
        color: var(--fv2-text);
        padding-bottom: 15px;
      }


      .fv2-home * {
        box-sizing: border-box;
      }


      /* ================================================
         COMMAND HERO
      ================================================= */

      .fv2-command {
        position: relative;
        overflow: hidden;

        min-height: 260px;

        padding: 22px;

        border-radius: 28px;

        border:
          1px solid rgba(139,92,246,.30);

        background:
          radial-gradient(
            circle at 85% 10%,
            rgba(139,92,246,.34),
            transparent 36%
          ),
          radial-gradient(
            circle at 5% 90%,
            rgba(37,99,235,.22),
            transparent 35%
          ),
          linear-gradient(
            145deg,
            #21184f,
            #111c33 70%
          );

        box-shadow:
          0 25px 65px rgba(0,0,0,.30);
      }


      .fv2-command::before {
        content: "";

        position: absolute;

        width: 220px;
        height: 220px;

        border-radius: 50%;

        left: -105px;
        top: -105px;

        background:
          rgba(99,102,241,.15);

        filter: blur(2px);
      }


      .fv2-command-top {
        position: relative;
        z-index: 2;

        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }


      .fv2-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;

        padding: 7px 11px;

        border-radius: 999px;

        background:
          rgba(2,6,23,.30);

        border:
          1px solid rgba(255,255,255,.07);

        color: #c4b5fd;

        font-size: 10px;
        font-weight: 700;
      }


      .fv2-live {
        display: flex;
        align-items: center;
        gap: 6px;

        font-size: 10px;
        color: #86efac;
      }


      .fv2-live-dot {
        width: 8px;
        height: 8px;

        border-radius: 50%;

        background: #22c55e;

        box-shadow:
          0 0 12px rgba(34,197,94,.9);
      }


      .fv2-command h1 {
        position: relative;
        z-index: 2;

        margin:
          22px 0 8px;

        font-size: 30px;
        font-weight: 950;
        line-height: 1.3;
      }


      .fv2-command-description {
        position: relative;
        z-index: 2;

        max-width: 540px;

        color: #cbd5e1;

        font-size: 13px;
        line-height: 1.9;
      }


      /* ================================================
         HERO STATS
      ================================================= */

      .fv2-hero-stats {
        position: relative;
        z-index: 2;

        display: grid;

        grid-template-columns:
          repeat(3,1fr);

        gap: 8px;

        margin-top: 20px;
      }


      .fv2-hero-stat {
        padding: 13px 7px;

        text-align: center;

        border-radius: 17px;

        border:
          1px solid rgba(255,255,255,.08);

        background:
          rgba(2,6,23,.25);

        backdrop-filter: blur(8px);
      }


      .fv2-hero-stat strong {
        display: block;

        font-size: 22px;
        font-weight: 950;
      }


      .fv2-hero-stat span {
        display: block;

        margin-top: 4px;

        color: #a5b4fc;

        font-size: 9px;
      }


      /* ================================================
         SECTION HEAD
      ================================================= */

      .fv2-section-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;

        gap: 12px;

        margin:
          25px 3px 11px;
      }


      .fv2-section-title {
        margin: 0;

        font-size: 18px;
        font-weight: 900;
      }


      .fv2-section-sub {
        display: block;

        margin-top: 4px;

        color: var(--fv2-muted);

        font-size: 10px;
      }


      .fv2-more {
        appearance: none;

        border:
          1px solid var(--fv2-line);

        background:
          rgba(15,23,42,.55);

        color: #cbd5e1;

        border-radius: 12px;

        padding: 8px 10px;

        font-family: inherit;
        font-size: 10px;
      }


      /* ================================================
         QUICK ACTIONS
      ================================================= */

      .fv2-quick-grid {
        display: grid;

        grid-template-columns:
          repeat(2,1fr);

        gap: 10px;
      }


      .fv2-quick {
        appearance: none;

        min-height: 105px;

        padding: 15px;

        text-align: right;

        border-radius: 21px;

        border:
          1px solid var(--fv2-line);

        background:
          linear-gradient(
            145deg,
            rgba(28,42,69,.96),
            rgba(14,24,43,.96)
          );

        color: var(--fv2-text);

        font-family: inherit;

        box-shadow:
          0 12px 30px rgba(0,0,0,.13);
      }


      .fv2-quick:active {
        transform: scale(.98);
      }


      .fv2-quick-icon {
        display: flex;

        width: 38px;
        height: 38px;

        align-items: center;
        justify-content: center;

        border-radius: 13px;

        margin-bottom: 11px;

        font-size: 20px;

        background:
          rgba(124,58,237,.15);
      }


      .fv2-quick-title {
        display: block;

        font-weight: 900;

        font-size: 13px;
      }


      .fv2-quick-sub {
        display: block;

        margin-top: 5px;

        color: var(--fv2-muted);

        font-size: 9px;
      }


      /* ================================================
         KPI GRID
      ================================================= */

      .fv2-kpi-grid {
        display: grid;

        grid-template-columns:
          repeat(2,1fr);

        gap: 10px;
      }


      .fv2-kpi {
        min-height: 130px;

        padding: 16px;

        border-radius: 22px;

        border:
          1px solid var(--fv2-line);

        background:
          var(--fv2-panel);
      }


      .fv2-kpi-top {
        display: flex;

        align-items: center;
        justify-content: space-between;

        gap: 10px;
      }


      .fv2-kpi-icon {
        font-size: 24px;
      }


      .fv2-kpi-trend {
        padding:
          5px 8px;

        border-radius:
          999px;

        color:
          #a7f3d0;

        background:
          rgba(34,197,94,.10);

        font-size:
          8px;
      }


      .fv2-kpi strong {
        display:
          block;

        margin-top:
          18px;

        font-size:
          27px;

        line-height:
          1;
      }


      .fv2-kpi-label {
        display:
          block;

        margin-top:
          9px;

        color:
          var(--fv2-muted);

        font-size:
          10px;
      }


      /* ================================================
         REPAIR PIPELINE
      ================================================= */

      .fv2-pipeline {
        overflow: hidden;

        border-radius: 23px;

        border:
          1px solid var(--fv2-line);

        background:
          var(--fv2-panel);
      }


      .fv2-pipeline-row {
        display: grid;

        grid-template-columns:
          auto 1fr auto;

        align-items: center;

        gap: 11px;

        min-height: 57px;

        padding:
          13px 15px;

        border-bottom:
          1px solid rgba(148,163,184,.08);
      }


      .fv2-pipeline-row:last-child {
        border-bottom: 0;
      }


      .fv2-pipeline-dot {
        width: 10px;
        height: 10px;

        border-radius: 50%;
      }


      .fv2-blue {
        background: #3b82f6;

        box-shadow:
          0 0 12px rgba(59,130,246,.70);
      }


      .fv2-purple {
        background: #8b5cf6;

        box-shadow:
          0 0 12px rgba(139,92,246,.70);
      }


      .fv2-orange {
        background: #f59e0b;

        box-shadow:
          0 0 12px rgba(245,158,11,.70);
      }


      .fv2-cyan {
        background: #06b6d4;

        box-shadow:
          0 0 12px rgba(6,182,212,.70);
      }


      .fv2-green {
        background: #22c55e;

        box-shadow:
          0 0 12px rgba(34,197,94,.70);
      }


      .fv2-pipeline-name {
        font-size:
          12px;

        font-weight:
          700;
      }


      .fv2-pipeline-count {
        min-width:
          38px;

        padding:
          6px 10px;

        text-align:
          center;

        border-radius:
          999px;

        background:
          rgba(148,163,184,.09);

        font-size:
          11px;

        font-weight:
          900;
      }


      /* ================================================
         FINANCE
      ================================================= */

      .fv2-finance-grid {
        display:
          grid;

        grid-template-columns:
          1fr;

        gap:
          10px;
      }


      .fv2-finance {
        position: relative;

        overflow: hidden;

        padding:
          18px;

        border-radius:
          22px;

        border:
          1px solid var(--fv2-line);

        background:
          var(--fv2-panel);
      }


      .fv2-finance-label {
        color:
          var(--fv2-muted);

        font-size:
          10px;
      }


      .fv2-finance-value {
        display:
          block;

        margin-top:
          8px;

        font-size:
          19px;

        font-weight:
          900;
      }


      .fv2-finance.green {
        border-color:
          rgba(34,197,94,.18);
      }


      .fv2-finance.orange {
        border-color:
          rgba(245,158,11,.18);
      }


      /* ================================================
         RECENT ACTIVITY
      ================================================= */

      .fv2-recent {
        overflow:
          hidden;

        border-radius:
          23px;

        border:
          1px solid var(--fv2-line);

        background:
          var(--fv2-panel);
      }


      .fv2-recent-row {
        display:
          grid;

        grid-template-columns:
          auto 1fr auto;

        gap:
          11px;

        align-items:
          center;

        padding:
          14px;

        border-bottom:
          1px solid rgba(148,163,184,.08);
      }


      .fv2-recent-row:last-child {
        border-bottom:
          0;
      }


      .fv2-recent-icon {
        width:
          40px;

        height:
          40px;

        display:
          grid;

        place-items:
          center;

        border-radius:
          14px;

        background:
          rgba(124,58,237,.12);
      }


      .fv2-recent-title {
        font-size:
          11px;

        font-weight:
          800;
      }


      .fv2-recent-sub {
        margin-top:
          4px;

        color:
          var(--fv2-muted);

        font-size:
          9px;
      }


      .fv2-status {
        padding:
          5px 8px;

        border-radius:
          999px;

        background:
          rgba(124,58,237,.12);

        color:
          #c4b5fd;

        font-size:
          8px;

        white-space:
          nowrap;
      }


      /* ================================================
         MODULE LAUNCHER
      ================================================= */

      .fv2-modules {
        display:
          grid;

        grid-template-columns:
          repeat(3,1fr);

        gap:
          9px;
      }


      .fv2-module {
        appearance:
          none;

        min-height:
          88px;

        padding:
          12px 7px;

        border-radius:
          19px;

        border:
          1px solid var(--fv2-line);

        background:
          rgba(18,29,50,.83);

        color:
          var(--fv2-text);

        font-family:
          inherit;

        text-align:
          center;
      }


      .fv2-module:active {
        transform:
          scale(.97);
      }


      .fv2-module-icon {
        display:
          block;

        margin-bottom:
          8px;

        font-size:
          22px;
      }


      .fv2-module-title {
        font-size:
          10px;

        font-weight:
          800;
      }


      /* ================================================
         EMPTY
      ================================================= */

      .fv2-empty {
        padding:
          26px 15px;

        text-align:
          center;

        color:
          var(--fv2-muted);

        font-size:
          11px;

        line-height:
          1.9;
      }


      .fv2-footer {
        margin:
          28px 0 4px;

        text-align:
          center;

        color:
          #64748b;

        font-size:
          9px;
      }


      /* ================================================
         TABLET
      ================================================= */

      @media (min-width:700px) {

        .fv2-quick-grid {
          grid-template-columns:
            repeat(4,1fr);
        }

        .fv2-kpi-grid {
          grid-template-columns:
            repeat(4,1fr);
        }

        .fv2-finance-grid {
          grid-template-columns:
            repeat(2,1fr);
        }

      }

    `;

    document.head.appendChild(
      style
    );
  }

  /* =======================================================
     RECENT REPAIRS
  ======================================================= */

  function recentRepairs(items) {
    if (!items.length) {
      return `
        <div class="fv2-empty">

          هنوز تعمیر ثبت نشده است.

          <br>

          با اولین پذیرش،
          فعالیت واقعی اینجا نمایش داده می‌شود.

        </div>
      `;
    }

    return items
      .slice()
      .sort(
        (a, b) =>
          String(
            b.updatedAt ||
              b.createdAt ||
              ""
          ).localeCompare(
            String(
              a.updatedAt ||
                a.createdAt ||
                ""
            )
          )
      )
      .slice(0, 5)
      .map(
        repair => `
          <div
            class="fv2-recent-row"
            data-repair-id="${esc(repair.id)}"
          >

            <div class="fv2-recent-icon">
              🛠️
            </div>

            <div>

              <div class="fv2-recent-title">
                ${esc(
                  repair.device ||
                    "دستگاه"
                )}
              </div>

              <div class="fv2-recent-sub">

                ${
                  esc(
                    repair.customerName ||
                      "بدون مشتری"
                  )
                }

                ${
                  repair.vehicle
                    ? ` • ${esc(repair.vehicle)}`
                    : ""
                }

              </div>

            </div>

            <span class="fv2-status">
              ${esc(
                statusLabel(
                  repair.status
                )
              )}
            </span>

          </div>
        `
      )
      .join("");
  }

  /* =======================================================
     HOME TEMPLATE
  ======================================================= */

  function dashboardHTML() {
    const s = statistics();

    return `
      <div class="fv2-home">


        <!-- =============================================
             COMMAND CENTER
        ============================================== -->

        <section class="fv2-command">

          <div class="fv2-command-top">

            <div class="fv2-label">
              ⚡ COMMAND CENTER V2
            </div>

            <div class="fv2-live">
              <span class="fv2-live-dot"></span>
              LIVE
            </div>

          </div>


          <h1>
            فرمانده؛ امروز را کنترل کن.
          </h1>


          <div class="fv2-command-description">

            تعمیرگاه، مشتری‌ها، جریان کار و مالی
            را از یک صفحه ببین و
            با یک لمس وارد عملیات شو.

          </div>


          <div class="fv2-hero-stats">

            <div class="fv2-hero-stat">

              <strong>
                ${number(s.open)}
              </strong>

              <span>
                تعمیر فعال
              </span>

            </div>


            <div class="fv2-hero-stat">

              <strong>
                ${number(s.ready)}
              </strong>

              <span>
                آماده تحویل
              </span>

            </div>


            <div class="fv2-hero-stat">

              <strong>
                ${number(s.customers.length)}
              </strong>

              <span>
                مشتری
              </span>

            </div>

          </div>

        </section>


        <!-- =============================================
             QUICK ACTIONS
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              عملیات سریع
            </h2>

            <span class="fv2-section-sub">
              کارهای پرمصرف روزانه
            </span>

          </div>

        </div>


        <section class="fv2-quick-grid">


          <button
            class="fv2-quick"
            data-action="new-repair"
          >

            <span class="fv2-quick-icon">
              ➕
            </span>

            <span class="fv2-quick-title">
              پذیرش تعمیر
            </span>

            <span class="fv2-quick-sub">
              پرونده جدید
            </span>

          </button>


          <button
            class="fv2-quick"
            data-action="new-customer"
          >

            <span class="fv2-quick-icon">
              👤
            </span>

            <span class="fv2-quick-title">
              مشتری جدید
            </span>

            <span class="fv2-quick-sub">
              ساخت پروفایل
            </span>

          </button>


          <button
            class="fv2-quick"
            data-module="repairs"
          >

            <span class="fv2-quick-icon">
              🛠️
            </span>

            <span class="fv2-quick-title">
              پرونده‌ها
            </span>

            <span class="fv2-quick-sub">
              تعمیرات فعال
            </span>

          </button>


          <button
            class="fv2-quick"
            data-route="studio"
          >

            <span class="fv2-quick-icon">
              🎛️
            </span>

            <span class="fv2-quick-title">
              استودیو
            </span>

            <span class="fv2-quick-sub">
              شخصی‌سازی
            </span>

          </button>

        </section>


        <!-- =============================================
             KPI
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              وضعیت لحظه‌ای
            </h2>

            <span class="fv2-section-sub">
              داده واقعی Runtime
            </span>

          </div>

          <button
            class="fv2-more"
            data-route="activity"
          >
            گزارش
          </button>

        </div>


        <section class="fv2-kpi-grid">


          <article class="fv2-kpi">

            <div class="fv2-kpi-top">

              <span class="fv2-kpi-icon">
                🛠️
              </span>

              <span class="fv2-kpi-trend">
                کل
              </span>

            </div>

            <strong>
              ${number(s.total)}
            </strong>

            <span class="fv2-kpi-label">
              پرونده تعمیر
            </span>

          </article>


          <article class="fv2-kpi">

            <div class="fv2-kpi-top">

              <span class="fv2-kpi-icon">
                ⚡
              </span>

              <span class="fv2-kpi-trend">
                فعال
              </span>

            </div>

            <strong>
              ${number(s.open)}
            </strong>

            <span class="fv2-kpi-label">
              در جریان کار
            </span>

          </article>


          <article class="fv2-kpi">

            <div class="fv2-kpi-top">

              <span class="fv2-kpi-icon">
                ✅
              </span>

              <span class="fv2-kpi-trend">
                تحویل
              </span>

            </div>

            <strong>
              ${number(s.ready)}
            </strong>

            <span class="fv2-kpi-label">
              آماده مشتری
            </span>

          </article>


          <article class="fv2-kpi">

            <div class="fv2-kpi-top">

              <span class="fv2-kpi-icon">
                👥
              </span>

              <span class="fv2-kpi-trend">
                CRM
              </span>

            </div>

            <strong>
              ${number(
                s.customers.length
              )}
            </strong>

            <span class="fv2-kpi-label">
              مشتری ثبت‌شده
            </span>

          </article>

        </section>


        <!-- =============================================
             PIPELINE
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              خط تعمیرگاه
            </h2>

            <span class="fv2-section-sub">
              Repair Pipeline
            </span>

          </div>

          <button
            class="fv2-more"
            data-module="repairs"
          >
            باز کردن
          </button>

        </div>


        <section class="fv2-pipeline">


          <div class="fv2-pipeline-row">

            <span class="fv2-pipeline-dot fv2-blue"></span>

            <span class="fv2-pipeline-name">
              پذیرش
            </span>

            <span class="fv2-pipeline-count">
              ${number(s.intake)}
            </span>

          </div>


          <div class="fv2-pipeline-row">

            <span class="fv2-pipeline-dot fv2-purple"></span>

            <span class="fv2-pipeline-name">
              عیب‌یابی
            </span>

            <span class="fv2-pipeline-count">
              ${number(s.diagnosing)}
            </span>

          </div>


          <div class="fv2-pipeline-row">

            <span class="fv2-pipeline-dot fv2-cyan"></span>

            <span class="fv2-pipeline-name">
              در حال تعمیر
            </span>

            <span class="fv2-pipeline-count">
              ${number(s.repairing)}
            </span>

          </div>


          <div class="fv2-pipeline-row">

            <span class="fv2-pipeline-dot fv2-orange"></span>

            <span class="fv2-pipeline-name">
              منتظر قطعه
            </span>

            <span class="fv2-pipeline-count">
              ${number(s.waiting)}
            </span>

          </div>


          <div class="fv2-pipeline-row">

            <span class="fv2-pipeline-dot fv2-green"></span>

            <span class="fv2-pipeline-name">
              آماده تحویل
            </span>

            <span class="fv2-pipeline-count">
              ${number(s.ready)}
            </span>

          </div>

        </section>


        <!-- =============================================
             FINANCE
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              وضعیت مالی
            </h2>

            <span class="fv2-section-sub">
              براساس پرونده‌های ثبت‌شده
            </span>

          </div>

        </div>


        <section class="fv2-finance-grid">


          <article class="fv2-finance green">

            <span class="fv2-finance-label">
              دریافتی ثبت‌شده
            </span>

            <strong class="fv2-finance-value">
              ${money(s.revenue)}
            </strong>

          </article>


          <article class="fv2-finance orange">

            <span class="fv2-finance-label">
              مانده مطالبات
            </span>

            <strong class="fv2-finance-value">
              ${money(s.outstanding)}
            </strong>

          </article>

        </section>


        <!-- =============================================
             RECENT
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              فعالیت اخیر
            </h2>

            <span class="fv2-section-sub">
              آخرین پرونده‌ها
            </span>

          </div>

        </div>


        <section class="fv2-recent">

          ${recentRepairs(s.repairs)}

        </section>


        <!-- =============================================
             MODULE LAUNCHER
        ============================================== -->

        <div class="fv2-section-head">

          <div>

            <h2 class="fv2-section-title">
              ماژول‌ها
            </h2>

            <span class="fv2-section-sub">
              دسترسی مستقیم
            </span>

          </div>

        </div>


        <section class="fv2-modules">


          <button
            class="fv2-module"
            data-module="repairs"
          >

            <span class="fv2-module-icon">
              🛠️
            </span>

            <span class="fv2-module-title">
              تعمیرات
            </span>

          </button>


          <button
            class="fv2-module"
            data-module="customers"
          >

            <span class="fv2-module-icon">
              👥
            </span>

            <span class="fv2-module-title">
              مشتریان
            </span>

          </button>


          <button
            class="fv2-module"
            data-module="inventory"
          >

            <span class="fv2-module-icon">
              📦
            </span>

            <span class="fv2-module-title">
              انبار
            </span>

          </button>


          <button
            class="fv2-module"
            data-module="tasks"
          >

            <span class="fv2-module-icon">
              ✅
            </span>

            <span class="fv2-module-title">
              برنامه
            </span>

          </button>


          <button
            class="fv2-module"
            data-module="forum"
          >

            <span class="fv2-module-icon">
              💬
            </span>

            <span class="fv2-module-title">
              انجمن
            </span>

          </button>


          <button
            class="fv2-module"
            data-module="sales"
          >

            <span class="fv2-module-icon">
              🛒
            </span>

            <span class="fv2-module-title">
              فروش
            </span>

          </button>

        </section>


        <div class="fv2-footer">

          Farmandeh Saeed
          •
          Command Center V${VERSION}

        </div>


      </div>
    `;
  }

  /* =======================================================
     DETECT HOME
  ======================================================= */

  function isHome() {
    const app =
      document.getElementById("app");

    if (!app) {
      return false;
    }

    const homeButton =
      app.querySelector(
        '[data-route="home"].active'
      );

    const main =
      app.querySelector(
        "main.page"
      );

    if (
      !homeButton ||
      !main
    ) {
      return false;
    }

    /*
      Non-home pages normally have
      a top back button.
    */

    const backButton =
      app.querySelector(
        '[data-action="back"]'
      );

    if (backButton) {
      return false;
    }

    return true;
  }

  /* =======================================================
     PATCH HOME
  ======================================================= */

  function patchHome() {
    if (patching) {
      return;
    }

    if (!isHome()) {
      return;
    }

    const app =
      document.getElementById("app");

    if (!app) {
      return;
    }

    const main =
      app.querySelector(
        "main.page"
      );

    if (!main) {
      return;
    }

    /*
      Already mounted?
    */

    if (
      main.dataset.fv2 === VERSION
    ) {
      return;
    }

    patching = true;

    try {
      installStyles();

      main.dataset.fv2 =
        VERSION;

      main.innerHTML =
        dashboardHTML();

      console.log(
        `Farmandeh Command Center V${VERSION} mounted`
      );
    } finally {
      patching = false;
    }
  }

  /* =======================================================
     AUTO PATCH AFTER V1 RENDERS
  ======================================================= */

  function schedulePatch() {
    clearTimeout(
      patchTimer
    );

    patchTimer =
      setTimeout(
        patchHome,
        30
      );
  }

  const observer =
    new MutationObserver(
      () => {
        schedulePatch();
      }
    );

  function start() {
    installStyles();

    const app =
      document.getElementById(
        "app"
      );

    if (!app) {
      setTimeout(
        start,
        100
      );

      return;
    }

    observer.observe(
      app,
      {
        childList: true,
        subtree: true
      }
    );

    schedulePatch();

    console.log(
      `Farmandeh Command Center V${VERSION} loaded`
    );
  }

  /* =======================================================
     STORAGE REFRESH
  ======================================================= */

  window.addEventListener(
    "storage",
    () => {
      const main =
        document.querySelector(
          "#app main.page"
        );

      if (
        main &&
        isHome()
      ) {
        delete main.dataset.fv2;
        schedulePatch();
      }
    }
  );

  /* =======================================================
     START
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();
