/* =========================================================
   FARMANDEH PLATFORM
   Studio V2
   Version: 2.0.0
   Requires: customization-v2.js
   ========================================================= */

(() => {
  "use strict";

  const VERSION = "2.0.0";
  const STYLE_ID = "farmandeh-studio-v2-style";
  const BRIDGE_STYLE_ID = "farmandeh-studio-v2-bridge";

  let patchingStudio = false;
  let observerTimer = null;

  /* =======================================================
     ENGINE
  ======================================================= */

  function engine() {
    return window.FarmandehCustomizationV2 || null;
  }

  function cfg(path, fallback = "") {
    const e = engine();

    if (!e) return fallback;

    const value = e.get(path);

    return value === undefined
      ? fallback
      : value;
  }

  function setCfg(path, value) {
    const e = engine();

    if (!e) {
      console.error(
        "Customization Engine V2 not loaded."
      );
      return false;
    }

    e.set(path, value);
    e.apply();

    applyLiveCustomization();

    return true;
  }

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

  function toast(message) {
    document
      .querySelector(".sv2-toast")
      ?.remove();

    const el =
      document.createElement("div");

    el.className =
      "sv2-toast";

    el.textContent =
      message;

    document.body.appendChild(
      el
    );

    setTimeout(
      () => el.remove(),
      1700
    );
  }

  /* =======================================================
     GLOBAL STYLE
  ======================================================= */

  function installStyles() {
    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      STYLE_ID;

    style.textContent = `

      .sv2-root {
        direction: rtl;
        padding-bottom: 110px;
      }

      .sv2-root * {
        box-sizing: border-box;
      }

      .sv2-hero {
        padding: 22px;
        border-radius: 26px;
        border: 1px solid
          rgba(139,92,246,.25);

        background:
          radial-gradient(
            circle at 90% 0%,
            rgba(124,58,237,.24),
            transparent 35%
          ),
          linear-gradient(
            145deg,
            rgba(35,25,82,.97),
            rgba(18,29,50,.96)
          );

        margin-bottom: 22px;
      }

      .sv2-badge {
        display: inline-flex;
        padding: 6px 10px;
        border-radius: 999px;
        background:
          rgba(15,23,42,.45);
        color: #c4b5fd;
        font-size: 10px;
      }

      .sv2-hero h1 {
        margin:
          16px 0 7px;
        font-size: 27px;
      }

      .sv2-hero p {
        margin: 0;
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.9;
      }

      .sv2-tabs {
        position: sticky;
        top: 0;
        z-index: 20;

        display: grid;
        grid-template-columns:
          repeat(4,1fr);

        gap: 7px;

        padding:
          9px 0 12px;

        background:
          rgba(7,16,29,.92);

        backdrop-filter:
          blur(12px);
      }

      .sv2-tab {
        appearance: none;

        border:
          1px solid
          rgba(148,163,184,.14);

        background:
          rgba(18,29,50,.88);

        color:
          #cbd5e1;

        border-radius:
          13px;

        min-height:
          44px;

        font-family:
          inherit;

        font-size:
          10px;
      }

      .sv2-tab.active {
        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );

        color: white;
        border-color:
          transparent;
      }

      .sv2-panel {
        display: none;
      }

      .sv2-panel.active {
        display: block;
      }

      .sv2-section {
        margin-top: 18px;
      }

      .sv2-section-title {
        margin:
          0 3px 10px;

        font-size:
          17px;

        font-weight:
          900;
      }

      .sv2-section-sub {
        display: block;

        margin-top: 4px;

        color:
          #64748b;

        font-size:
          9px;
      }

      .sv2-card {
        padding: 14px;

        border-radius:
          21px;

        border:
          1px solid
          rgba(148,163,184,.13);

        background:
          rgba(18,29,50,.90);
      }

      .sv2-grid {
        display: grid;
        grid-template-columns:
          repeat(2,1fr);
        gap: 10px;
      }

      .sv2-field {
        min-width: 0;
      }

      .sv2-field.full {
        grid-column:
          1 / -1;
      }

      .sv2-field label {
        display: block;

        margin-bottom:
          7px;

        color:
          #94a3b8;

        font-size:
          9px;
      }

      .sv2-field input,
      .sv2-field select,
      .sv2-field textarea {
        width: 100%;

        border:
          1px solid
          rgba(148,163,184,.17);

        background:
          rgba(15,23,42,.72);

        color:
          #f8fafc;

        border-radius:
          13px;

        padding:
          11px;

        font-family:
          inherit;

        outline: none;
      }

      .sv2-field textarea {
        resize: vertical;
        min-height: 80px;
      }

      .sv2-field input:focus,
      .sv2-field select:focus,
      .sv2-field textarea:focus {
        border-color:
          #7c3aed;
      }

      .sv2-color-row {
        display: grid;

        grid-template-columns:
          58px 1fr;

        gap: 8px;

        align-items: center;
      }

      .sv2-color-row input[type="color"] {
        height:
          44px;

        padding:
          4px;
      }

      .sv2-range-value {
        display: flex;

        justify-content:
          space-between;

        align-items:
          center;

        margin-top:
          6px;

        color:
          #64748b;

        font-size:
          8px;
      }

      .sv2-switch-row {
        display: flex;

        align-items:
          center;

        justify-content:
          space-between;

        gap: 12px;

        padding:
          13px 0;

        border-bottom:
          1px solid
          rgba(148,163,184,.08);
      }

      .sv2-switch-row:last-child {
        border-bottom: 0;
      }

      .sv2-switch-info strong {
        display: block;
        font-size: 12px;
      }

      .sv2-switch-info span {
        display: block;

        margin-top: 4px;

        color:
          #64748b;

        font-size:
          8px;
      }

      .sv2-check {
        width: 20px;
        height: 20px;
        accent-color:
          #7c3aed;
      }

      .sv2-order-row {
        display: grid;

        grid-template-columns:
          1fr auto;

        gap: 9px;

        align-items: center;

        padding:
          11px;

        border-radius:
          15px;

        background:
          rgba(15,23,42,.55);

        margin-bottom:
          8px;
      }

      .sv2-order-row:last-child {
        margin-bottom: 0;
      }

      .sv2-order-title {
        font-size: 11px;
        font-weight: 800;
      }

      .sv2-order-actions {
        display: flex;
        gap: 5px;
      }

      .sv2-mini {
        appearance: none;

        width: 34px;
        height: 34px;

        border-radius:
          10px;

        border:
          1px solid
          rgba(148,163,184,.14);

        background:
          rgba(30,41,59,.9);

        color:
          white;
      }

      .sv2-mini:disabled {
        opacity: .25;
      }

      .sv2-toolbar {
        display: grid;

        grid-template-columns:
          repeat(2,1fr);

        gap: 9px;

        margin-top:
          18px;
      }

      .sv2-btn {
        appearance: none;

        min-height: 47px;

        border-radius:
          14px;

        font-family:
          inherit;

        border:
          1px solid
          rgba(148,163,184,.14);

        background:
          rgba(18,29,50,.92);

        color:
          white;
      }

      .sv2-btn.primary {
        border: 0;

        background:
          linear-gradient(
            135deg,
            #7c3aed,
            #2563eb
          );
      }

      .sv2-btn.danger {
        color:
          #fecaca;

        border-color:
          rgba(239,68,68,.25);
      }

      .sv2-info {
        padding: 13px;

        border-radius:
          15px;

        border:
          1px solid
          rgba(59,130,246,.18);

        background:
          rgba(37,99,235,.08);

        color:
          #bfdbfe;

        font-size:
          10px;

        line-height:
          1.9;
      }

      .sv2-toast {
        position: fixed;

        z-index:
          99999;

        left: 50%;
        bottom: 110px;

        transform:
          translateX(-50%);

        padding:
          10px 16px;

        border-radius:
          999px;

        background:
          #111827;

        color:
          white;

        border:
          1px solid
          rgba(148,163,184,.2);

        box-shadow:
          0 12px 35px
          rgba(0,0,0,.35);

        font-size:
          11px;
      }

      @media (min-width:700px) {

        .sv2-grid {
          grid-template-columns:
            repeat(3,1fr);
        }

      }

    `;

    document.head.appendChild(
      style
    );
  }

  /* =======================================================
     COLOR FIELD
  ======================================================= */

  function colorField(
    path,
    title
  ) {
    const value =
      cfg(path, "#000000");

    return `
      <div class="sv2-field">

        <label>
          ${esc(title)}
        </label>

        <div class="sv2-color-row">

          <input
            type="color"
            value="${esc(value)}"
            data-cfg="${esc(path)}"
            data-kind="color"
          >

          <input
            type="text"
            value="${esc(value)}"
            data-cfg="${esc(path)}"
            data-kind="color-text"
          >

        </div>

      </div>
    `;
  }

  function rangeField(
    path,
    title,
    min,
    max,
    step = 1
  ) {
    const value =
      Number(
        cfg(path, min)
      );

    return `
      <div class="sv2-field">

        <label>
          ${esc(title)}
        </label>

        <input
          type="range"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
          data-cfg="${esc(path)}"
          data-kind="number"
        >

        <div class="sv2-range-value">

          <span>
            ${min}
          </span>

          <strong
            data-value-for="${esc(path)}"
          >
            ${value}
          </strong>

          <span>
            ${max}
          </span>

        </div>

      </div>
    `;
  }

  function textField(
    path,
    title,
    multiline = false
  ) {
    const value =
      cfg(path, "");

    if (multiline) {
      return `
        <div class="sv2-field full">

          <label>
            ${esc(title)}
          </label>

          <textarea
            data-cfg="${esc(path)}"
            data-kind="text"
          >${esc(value)}</textarea>

        </div>
      `;
    }

    return `
      <div class="sv2-field">

        <label>
          ${esc(title)}
        </label>

        <input
          type="text"
          value="${esc(value)}"
          data-cfg="${esc(path)}"
          data-kind="text"
        >

      </div>
    `;
  }

  /* =======================================================
     THEME PANEL
  ======================================================= */

  function themePanel() {
    return `
      <div
        class="sv2-panel active"
        data-sv2-panel="theme"
      >

        <section class="sv2-section">

          <h2 class="sv2-section-title">
            رنگ‌های پایه

            <span class="sv2-section-sub">
              تمام رنگ‌های اصلی رابط
            </span>
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${colorField(
                "theme.background",
                "پس‌زمینه"
              )}

              ${colorField(
                "theme.surface",
                "سطح اصلی"
              )}

              ${colorField(
                "theme.surfaceAlt",
                "سطح دوم"
              )}

              ${colorField(
                "theme.card",
                "کارت"
              )}

              ${colorField(
                "theme.text",
                "متن اصلی"
              )}

              ${colorField(
                "theme.textMuted",
                "متن کم‌رنگ"
              )}

              ${colorField(
                "theme.border",
                "Border"
              )}

              ${colorField(
                "theme.accent",
                "Accent اصلی"
              )}

              ${colorField(
                "theme.accent2",
                "Accent دوم"
              )}

              ${colorField(
                "theme.accent3",
                "Accent سوم"
              )}

              ${colorField(
                "theme.success",
                "موفقیت"
              )}

              ${colorField(
                "theme.warning",
                "هشدار"
              )}

              ${colorField(
                "theme.danger",
                "خطر"
              )}

            </div>

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            گرادینت

            <span class="sv2-section-sub">
              رنگ‌های هدر و بخش‌های ویژه
            </span>
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${colorField(
                "theme.gradient1",
                "رنگ اول"
              )}

              ${colorField(
                "theme.gradient2",
                "رنگ دوم"
              )}

            </div>

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            فرم و ابعاد

            <span class="sv2-section-sub">
              گردی، فاصله و تراکم
            </span>
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${rangeField(
                "theme.radiusSmall",
                "گردی کوچک",
                0,
                30
              )}

              ${rangeField(
                "theme.radiusMedium",
                "گردی متوسط",
                0,
                40
              )}

              ${rangeField(
                "theme.radiusLarge",
                "گردی بزرگ",
                0,
                50
              )}

              ${rangeField(
                "layout.gap",
                "فاصله عناصر",
                2,
                30
              )}

              ${rangeField(
                "layout.pagePadding",
                "حاشیه صفحه",
                0,
                30
              )}

            </div>

          </div>

        </section>

      </div>
    `;
  }

  /* =======================================================
     TEXT PANEL
  ======================================================= */

  function textPanel() {
    return `
      <div
        class="sv2-panel"
        data-sv2-panel="text"
      >

        <section class="sv2-section">

          <h2 class="sv2-section-title">
            عنوان اصلی

            <span class="sv2-section-sub">
              متن‌های Command Center
            </span>
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${textField(
                "pages.home.hero.badge",
                "Badge"
              )}

              ${textField(
                "pages.home.hero.liveLabel",
                "Live Label"
              )}

              ${textField(
                "pages.home.hero.title",
                "عنوان اصلی",
                true
              )}

              ${textField(
                "pages.home.hero.subtitle",
                "توضیح اصلی",
                true
              )}

            </div>

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            عنوان بخش‌ها
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${textField(
                "pages.home.quickActions.title",
                "عملیات سریع"
              )}

              ${textField(
                "pages.home.quickActions.subtitle",
                "زیرعنوان عملیات سریع"
              )}

              ${textField(
                "pages.home.kpis.title",
                "KPI"
              )}

              ${textField(
                "pages.home.kpis.subtitle",
                "زیرعنوان KPI"
              )}

              ${textField(
                "pages.home.pipeline.title",
                "خط تعمیرگاه"
              )}

              ${textField(
                "pages.home.pipeline.subtitle",
                "زیرعنوان خط تعمیرگاه"
              )}

              ${textField(
                "pages.home.finance.title",
                "مالی"
              )}

              ${textField(
                "pages.home.finance.subtitle",
                "زیرعنوان مالی"
              )}

              ${textField(
                "pages.home.recent.title",
                "فعالیت اخیر"
              )}

              ${textField(
                "pages.home.recent.subtitle",
                "زیرعنوان فعالیت اخیر"
              )}

              ${textField(
                "pages.home.modules.title",
                "ماژول‌ها"
              )}

              ${textField(
                "pages.home.modules.subtitle",
                "زیرعنوان ماژول‌ها"
              )}

            </div>

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            نام ماژول‌ها
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${textField(
                "labels.repairs",
                "تعمیرات"
              )}

              ${textField(
                "labels.customers",
                "مشتریان"
              )}

              ${textField(
                "labels.inventory",
                "انبار"
              )}

              ${textField(
                "labels.tasks",
                "برنامه"
              )}

              ${textField(
                "labels.forum",
                "انجمن"
              )}

              ${textField(
                "labels.sales",
                "فروش"
              )}

            </div>

          </div>

        </section>

      </div>
    `;
  }

  /* =======================================================
     LAYOUT PANEL
  ======================================================= */

  const SECTION_NAMES = {
    hero: "هدر اصلی",
    quickActions:
      "عملیات سریع",
    kpis:
      "وضعیت لحظه‌ای",
    pipeline:
      "خط تعمیرگاه",
    finance:
      "وضعیت مالی",
    recent:
      "فعالیت اخیر",
    modules:
      "ماژول‌ها"
  };

  function sectionToggle(
    key
  ) {
    const path =
      key === "hero"
        ? "pages.home.hero.enabled"
        : `pages.home.${key}.enabled`;

    const enabled =
      cfg(path, true) !== false;

    return `
      <div class="sv2-switch-row">

        <div class="sv2-switch-info">

          <strong>
            ${esc(
              SECTION_NAMES[key] ||
                key
            )}
          </strong>

          <span>
            نمایش / عدم نمایش
          </span>

        </div>

        <input
          class="sv2-check"
          type="checkbox"
          data-cfg="${esc(path)}"
          data-kind="boolean"
          ${
            enabled
              ? "checked"
              : ""
          }
        >

      </div>
    `;
  }

  function orderRows() {
    const order =
      cfg(
        "pages.home.sectionOrder",
        [
          "hero",
          "quickActions",
          "kpis",
          "pipeline",
          "finance",
          "recent",
          "modules"
        ]
      );

    return order
      .map(
        (key, index) => `
          <div
            class="sv2-order-row"
            data-section-key="${esc(key)}"
          >

            <div class="sv2-order-title">
              ${esc(
                SECTION_NAMES[key] ||
                  key
              )}
            </div>

            <div class="sv2-order-actions">

              <button
                class="sv2-mini"
                data-sv2-move="up"
                data-section="${esc(key)}"
                ${
                  index === 0
                    ? "disabled"
                    : ""
                }
              >
                ↑
              </button>

              <button
                class="sv2-mini"
                data-sv2-move="down"
                data-section="${esc(key)}"
                ${
                  index ===
                  order.length - 1
                    ? "disabled"
                    : ""
                }
              >
                ↓
              </button>

            </div>

          </div>
        `
      )
      .join("");
  }

  function layoutPanel() {
    return `
      <div
        class="sv2-panel"
        data-sv2-panel="layout"
      >

        <section class="sv2-section">

          <h2 class="sv2-section-title">
            نمایش بخش‌ها

            <span class="sv2-section-sub">
              هر بخش را روشن یا خاموش کن
            </span>
          </h2>

          <div class="sv2-card">

            ${sectionToggle(
              "hero"
            )}

            ${sectionToggle(
              "quickActions"
            )}

            ${sectionToggle(
              "kpis"
            )}

            ${sectionToggle(
              "pipeline"
            )}

            ${sectionToggle(
              "finance"
            )}

            ${sectionToggle(
              "recent"
            )}

            ${sectionToggle(
              "modules"
            )}

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            ترتیب بخش‌ها

            <span class="sv2-section-sub">
              بالا و پایین کن
            </span>
          </h2>

          <div
            class="sv2-card"
            id="sv2OrderList"
          >

            ${orderRows()}

          </div>

        </section>


        <section class="sv2-section">

          <h2 class="sv2-section-title">
            چیدمان
          </h2>

          <div class="sv2-card">

            <div class="sv2-grid">

              ${rangeField(
                "layout.columnsMobile",
                "ستون موبایل",
                1,
                4
              )}

              ${rangeField(
                "layout.columnsTablet",
                "ستون تبلت",
                1,
                6
              )}

              ${rangeField(
                "typography.baseSize",
                "اندازه متن",
                10,
                22
              )}

              ${rangeField(
                "typography.titleSize",
                "اندازه عنوان اصلی",
                18,
                48
              )}

              ${rangeField(
                "typography.sectionTitleSize",
                "عنوان بخش‌ها",
                13,
                32
              )}

            </div>

          </div>

        </section>

      </div>
    `;
  }

  /* =======================================================
     SYSTEM PANEL
  ======================================================= */

  function systemPanel() {
    return `
      <div
        class="sv2-panel"
        data-sv2-panel="system"
      >

        <section class="sv2-section">

          <h2 class="sv2-section-title">
            مدیریت تنظیمات
          </h2>

          <div class="sv2-card">

            <div class="sv2-info">

              تغییرات Studio V2
              در مرورگر ذخیره می‌شوند
              و برای تغییر ظاهر
              نیازی به GitHub نیست.

            </div>

            <div class="sv2-toolbar">

              <button
                class="sv2-btn primary"
                data-sv2-action="export"
              >
                خروجی تنظیمات
              </button>

              <button
                class="sv2-btn"
                data-sv2-action="apply"
              >
                اعمال مجدد
              </button>

              <button
                class="sv2-btn danger"
                data-sv2-action="reset"
              >
                بازگشت به پیش‌فرض
              </button>

            </div>

          </div>

        </section>

      </div>
    `;
  }

  /* =======================================================
     STUDIO TEMPLATE
  ======================================================= */

  function studioHTML() {
    return `
      <div class="sv2-root">

        <section class="sv2-hero">

          <span class="sv2-badge">
            CUSTOMIZATION ENGINE V2
          </span>

          <h1>
            استودیو فرمانده V2
          </h1>

          <p>
            ظاهر، نوشته‌ها،
            ترتیب و ساختار صفحه را
            بدون تغییر کد کنترل کن.
          </p>

        </section>


        <div class="sv2-tabs">

          <button
            class="sv2-tab active"
            data-sv2-tab="theme"
          >
            🎨 ظاهر
          </button>

          <button
            class="sv2-tab"
            data-sv2-tab="text"
          >
            ✏️ متن
          </button>

          <button
            class="sv2-tab"
            data-sv2-tab="layout"
          >
            🧩 چیدمان
          </button>

          <button
            class="sv2-tab"
            data-sv2-tab="system"
          >
            ⚙️ سیستم
          </button>

        </div>

        ${themePanel()}

        ${textPanel()}

        ${layoutPanel()}

        ${systemPanel()}

      </div>
    `;
  }

  /* =======================================================
     DASHBOARD BRIDGE
  ======================================================= */

  function installBridgeStyle() {
    let style =
      document.getElementById(
        BRIDGE_STYLE_ID
      );

    if (!style) {
      style =
        document.createElement(
          "style"
        );

      style.id =
        BRIDGE_STYLE_ID;

      document.head.appendChild(
        style
      );
    }

    const t =
      engine()?.getAll()?.theme ||
      {};

    const ty =
      engine()?.getAll()?.typography ||
      {};

    const l =
      engine()?.getAll()?.layout ||
      {};

    style.textContent = `

      body {
        background:
          ${t.background || "#07101d"} !important;

        color:
          ${t.text || "#f8fafc"};
      }

      .shell,
      .page {
        background:
          ${t.background || "#07101d"} !important;
      }

      .topbar,
      .bottom-nav {
        background:
          ${t.background || "#07101d"} !important;

        border-color:
          ${t.border || "#334155"} !important;
      }

      .fv2-home {
        --fv2-bg:
          ${t.background || "#07101d"} !important;

        --fv2-panel:
          ${t.card || "#16233a"} !important;

        --fv2-panel-soft:
          ${t.surfaceAlt || "#192640"} !important;

        --fv2-line:
          ${t.border || "#334155"} !important;

        --fv2-text:
          ${t.text || "#f8fafc"} !important;

        --fv2-muted:
          ${t.textMuted || "#94a3b8"} !important;

        --fv2-purple:
          ${t.accent || "#7c3aed"} !important;

        --fv2-blue:
          ${t.accent2 || "#2563eb"} !important;

        --fv2-cyan:
          ${t.accent3 || "#06b6d4"} !important;

        --fv2-green:
          ${t.success || "#22c55e"} !important;

        --fv2-orange:
          ${t.warning || "#f59e0b"} !important;

        --fv2-red:
          ${t.danger || "#ef4444"} !important;

        font-size:
          ${Number(
            ty.baseSize || 14
          )}px !important;
      }

      .fv2-command {
        border-radius:
          ${Number(
            t.radiusLarge || 28
          )}px !important;

        background:
          radial-gradient(
            circle at 85% 10%,
            ${hexToRgba(
              t.accent ||
                "#7c3aed",
              .35
            )},
            transparent 36%
          ),
          linear-gradient(
            145deg,
            ${t.gradient1 || "#21184f"},
            ${t.gradient2 || "#111c33"}
          ) !important;
      }

      .fv2-command h1 {
        font-size:
          ${Number(
            ty.titleSize || 30
          )}px !important;
      }

      .fv2-section-title {
        font-size:
          ${Number(
            ty.sectionTitleSize ||
              18
          )}px !important;
      }

      .fv2-kpi,
      .fv2-quick,
      .fv2-pipeline,
      .fv2-finance,
      .fv2-recent,
      .fv2-module {
        border-color:
          ${t.border || "#334155"} !important;

        background:
          ${t.card || "#16233a"} !important;

        color:
          ${t.text || "#f8fafc"} !important;
      }

      .fv2-kpi,
      .fv2-finance,
      .fv2-pipeline,
      .fv2-recent {
        border-radius:
          ${Number(
            t.radiusMedium || 18
          )}px !important;
      }

      .fv2-quick,
      .fv2-module {
        border-radius:
          ${Number(
            t.radiusSmall || 12
          )}px !important;
      }

      .fv2-quick-grid,
      .fv2-kpi-grid,
      .fv2-modules {
        gap:
          ${Number(
            l.gap || 10
          )}px !important;
      }

      @media (max-width:699px) {

        .fv2-quick-grid,
        .fv2-kpi-grid {
          grid-template-columns:
            repeat(
              ${Math.max(
                1,
                Number(
                  l.columnsMobile ||
                    2
                )
              )},
              1fr
            ) !important;
        }

      }

    `;
  }

  function hexToRgba(
    hex,
    alpha
  ) {
    const safe =
      String(hex || "")
        .replace("#", "");

    if (
      !/^[0-9a-fA-F]{6}$/.test(
        safe
      )
    ) {
      return `rgba(124,58,237,${alpha})`;
    }

    const r =
      parseInt(
        safe.slice(0, 2),
        16
      );

    const g =
      parseInt(
        safe.slice(2, 4),
        16
      );

    const b =
      parseInt(
        safe.slice(4, 6),
        16
      );

    return `rgba(${r},${g},${b},${alpha})`;
  }

  /* =======================================================
     DASHBOARD TEXT + SECTIONS
  ======================================================= */

  function markDashboardSections() {
    const root =
      document.querySelector(
        ".fv2-home"
      );

    if (!root) return;

    const hero =
      root.querySelector(
        ".fv2-command"
      );

    if (hero) {
      hero.dataset.sv2Section =
        "hero";
    }

    const heads =
      Array.from(
        root.querySelectorAll(
          ".fv2-section-head"
        )
      );

    const keys = [
      "quickActions",
      "kpis",
      "pipeline",
      "finance",
      "recent",
      "modules"
    ];

    heads.forEach(
      (head, index) => {
        const key =
          keys[index];

        if (!key) return;

        head.dataset.sv2SectionHead =
          key;

        const content =
          head.nextElementSibling;

        if (content) {
          content.dataset.sv2SectionBody =
            key;
        }
      }
    );
  }

  function setText(
    selector,
    value
  ) {
    const element =
      document.querySelector(
        selector
      );

    if (
      element &&
      value !== undefined
    ) {
      element.textContent =
        value;
    }
  }

  function patchDashboardText() {
    const root =
      document.querySelector(
        ".fv2-home"
      );

    if (!root) return;

    setText(
      ".fv2-command h1",
      cfg(
        "pages.home.hero.title",
        "فرمانده؛ امروز را کنترل کن."
      )
    );

    setText(
      ".fv2-command-description",
      cfg(
        "pages.home.hero.subtitle",
        ""
      )
    );

    const badge =
      root.querySelector(
        ".fv2-label"
      );

    if (badge) {
      badge.textContent =
        "⚡ " +
        cfg(
          "pages.home.hero.badge",
          "COMMAND CENTER V2"
        );
    }

    setText(
      ".fv2-live",
      cfg(
        "pages.home.hero.liveLabel",
        "LIVE"
      )
    );

    const sectionMap = {
      quickActions:
        "pages.home.quickActions",

      kpis:
        "pages.home.kpis",

      pipeline:
        "pages.home.pipeline",

      finance:
        "pages.home.finance",

      recent:
        "pages.home.recent",

      modules:
        "pages.home.modules"
    };

    Object.entries(
      sectionMap
    ).forEach(
      ([key, path]) => {
        const head =
          root.querySelector(
            `[data-sv2-section-head="${key}"]`
          );

        if (!head) return;

        const title =
          head.querySelector(
            ".fv2-section-title"
          );

        const sub =
          head.querySelector(
            ".fv2-section-sub"
          );

        if (title) {
          title.textContent =
            cfg(
              `${path}.title`,
              title.textContent
            );
        }

        if (sub) {
          sub.textContent =
            cfg(
              `${path}.subtitle`,
              sub.textContent
            );
        }
      }
    );

    const modules =
      root.querySelectorAll(
        ".fv2-module-title"
      );

    const modulePaths = [
      "labels.repairs",
      "labels.customers",
      "labels.inventory",
      "labels.tasks",
      "labels.forum",
      "labels.sales"
    ];

    modules.forEach(
      (item, index) => {
        if (
          modulePaths[index]
        ) {
          item.textContent =
            cfg(
              modulePaths[index],
              item.textContent
            );
        }
      }
    );
  }

  function applySectionVisibility() {
    const root =
      document.querySelector(
        ".fv2-home"
      );

    if (!root) return;

    const keys = [
      "hero",
      "quickActions",
      "kpis",
      "pipeline",
      "finance",
      "recent",
      "modules"
    ];

    keys.forEach(
      key => {
        const enabled =
          cfg(
            key === "hero"
              ? "pages.home.hero.enabled"
              : `pages.home.${key}.enabled`,
            true
          ) !== false;

        if (key === "hero") {
          const hero =
            root.querySelector(
              '[data-sv2-section="hero"]'
            );

          if (hero) {
            hero.style.display =
              enabled
                ? ""
                : "none";
          }

          return;
        }

        const head =
          root.querySelector(
            `[data-sv2-section-head="${key}"]`
          );

        const body =
          root.querySelector(
            `[data-sv2-section-body="${key}"]`
          );

        if (head) {
          head.style.display =
            enabled
              ? ""
              : "none";
        }

        if (body) {
          body.style.display =
            enabled
              ? ""
              : "none";
        }
      }
    );
  }

  function applySectionOrder() {
    const root =
      document.querySelector(
        ".fv2-home"
      );

    if (!root) return;

    const footer =
      root.querySelector(
        ".fv2-footer"
      );

    const order =
      cfg(
        "pages.home.sectionOrder",
        [
          "hero",
          "quickActions",
          "kpis",
          "pipeline",
          "finance",
          "recent",
          "modules"
        ]
      );

    order.forEach(
      key => {
        if (key === "hero") {
          const hero =
            root.querySelector(
              '[data-sv2-section="hero"]'
            );

          if (hero) {
            root.insertBefore(
              hero,
              footer
            );
          }

          return;
        }

        const head =
          root.querySelector(
            `[data-sv2-section-head="${key}"]`
          );

        const body =
          root.querySelector(
            `[data-sv2-section-body="${key}"]`
          );

        if (head) {
          root.insertBefore(
            head,
            footer
          );
        }

        if (body) {
          root.insertBefore(
            body,
            footer
          );
        }
      }
    );
  }

  function applyLiveCustomization() {
    installBridgeStyle();

    markDashboardSections();

    patchDashboardText();

    applySectionVisibility();

    applySectionOrder();
  }

  /* =======================================================
     STUDIO DETECTION
  ======================================================= */

  function isStudioPage() {
    const app =
      document.getElementById(
        "app"
      );

    if (!app) return false;

    const active =
      app.querySelector(
        '[data-route="studio"].active'
      );

    const main =
      app.querySelector(
        "main.page"
      );

    return Boolean(
      active && main
    );
  }

  function patchStudio() {
    if (
      patchingStudio ||
      !isStudioPage()
    ) {
      return;
    }

    const main =
      document.querySelector(
        "#app main.page"
      );

    if (!main) return;

    if (
      main.dataset.sv2 ===
      VERSION
    ) {
      return;
    }

    patchingStudio =
      true;

    try {
      installStyles();

      main.dataset.sv2 =
        VERSION;

      main.innerHTML =
        studioHTML();

    } finally {
      patchingStudio =
        false;
    }
  }

  /* =======================================================
     EVENTS
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const tab =
        event.target.closest(
          "[data-sv2-tab]"
        );

      if (tab) {
        const name =
          tab.dataset.sv2Tab;

        document
          .querySelectorAll(
            ".sv2-tab"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        document
          .querySelectorAll(
            ".sv2-panel"
          )
          .forEach(
            item =>
              item.classList.remove(
                "active"
              )
          );

        tab.classList.add(
          "active"
        );

        document
          .querySelector(
            `[data-sv2-panel="${name}"]`
          )
          ?.classList.add(
            "active"
          );

        return;
      }

      const move =
        event.target.closest(
          "[data-sv2-move]"
        );

      if (move) {
        const key =
          move.dataset.section;

        const direction =
          move.dataset.sv2Move;

        const order =
          [
            ...cfg(
              "pages.home.sectionOrder",
              []
            )
          ];

        const index =
          order.indexOf(key);

        const next =
          direction === "up"
            ? index - 1
            : index + 1;

        if (
          index >= 0 &&
          next >= 0 &&
          next < order.length
        ) {
          [
            order[index],
            order[next]
          ] = [
            order[next],
            order[index]
          ];

          setCfg(
            "pages.home.sectionOrder",
            order
          );

          const list =
            document.getElementById(
              "sv2OrderList"
            );

          if (list) {
            list.innerHTML =
              orderRows();
          }

          toast(
            "ترتیب تغییر کرد"
          );
        }

        return;
      }

      const action =
        event.target.closest(
          "[data-sv2-action]"
        );

      if (!action) return;

      if (
        action.dataset.sv2Action ===
        "apply"
      ) {
        engine()?.apply();

        applyLiveCustomization();

        toast(
          "تنظیمات اعمال شد"
        );

        return;
      }

      if (
        action.dataset.sv2Action ===
        "reset"
      ) {
        if (
          confirm(
            "تمام تنظیمات شخصی‌سازی به حالت اولیه برگردد؟"
          )
        ) {
          engine()?.reset();

          applyLiveCustomization();

          const main =
            document.querySelector(
              "#app main.page"
            );

          if (main) {
            delete main.dataset.sv2;
          }

          patchStudio();

          toast(
            "تنظیمات بازنشانی شد"
          );
        }

        return;
      }

      if (
        action.dataset.sv2Action ===
        "export"
      ) {
        const json =
          engine()?.export();

        if (!json) return;

        const blob =
          new Blob(
            [json],
            {
              type:
                "application/json"
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href =
          url;

        link.download =
          "farmandeh-customization-v2.json";

        link.click();

        URL.revokeObjectURL(
          url
        );

        toast(
          "خروجی ساخته شد"
        );
      }

    }
  );

  function handleConfigInput(
    target
  ) {
    const path =
      target.dataset.cfg;

    const kind =
      target.dataset.kind;

    if (!path) return;

    let value;

    if (
      kind === "boolean"
    ) {
      value =
        target.checked;
    }

    else if (
      kind === "number"
    ) {
      value =
        Number(
          target.value
        );

      const display =
        document.querySelector(
          `[data-value-for="${path}"]`
        );

      if (display) {
        display.textContent =
          value;
      }
    }

    else {
      value =
        target.value;
    }

    if (
      kind === "color"
    ) {
      const field =
        target
          .closest(
            ".sv2-color-row"
          )
          ?.querySelector(
            '[data-kind="color-text"]'
          );

      if (field) {
        field.value =
          value;
      }
    }

    if (
      kind === "color-text"
    ) {
      if (
        /^#[0-9a-fA-F]{6}$/.test(
          value
        )
      ) {
        const picker =
          target
            .closest(
              ".sv2-color-row"
            )
            ?.querySelector(
              '[data-kind="color"]'
            );

        if (picker) {
          picker.value =
            value;
        }
      } else {
        return;
      }
    }

    setCfg(
      path,
      value
    );
  }

  document.addEventListener(
    "input",
    event => {
      const target =
        event.target.closest(
          "[data-cfg]"
        );

      if (!target) return;

      handleConfigInput(
        target
      );
    }
  );

  document.addEventListener(
    "change",
    event => {
      const target =
        event.target.closest(
          "[data-cfg]"
        );

      if (!target) return;

      handleConfigInput(
        target
      );
    }
  );

  /* =======================================================
     AUTO PATCH
  ======================================================= */

  function schedulePatch() {
    clearTimeout(
      observerTimer
    );

    observerTimer =
      setTimeout(
        () => {
          patchStudio();

          applyLiveCustomization();
        },
        40
      );
  }

  function start() {
    installStyles();

    installBridgeStyle();

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

    const observer =
      new MutationObserver(
        schedulePatch
      );

    observer.observe(
      app,
      {
        childList: true,
        subtree: true
      }
    );

    window.addEventListener(
      "farmandeh:customization-changed",
      () => {
        applyLiveCustomization();
      }
    );

    schedulePatch();

    console.log(
      `Farmandeh Studio V2 ${VERSION} loaded`
    );
  }

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
