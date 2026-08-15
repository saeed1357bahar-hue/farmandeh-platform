(() => {
  "use strict";

  const VERSION = "2.2.0";

  const THEME_KEY = "farmandeh-global-theme-v2";
  const SAVE_KEY = "farmandeh-customization-v2";

  const STYLE_ID = "farmandeh-runtime-fix-v2-style";

  let applying = false;

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }

  function saveTheme(mode) {
    localStorage.setItem(THEME_KEY, mode);
  }

  function getCustomization() {
    try {
      return JSON.parse(
        localStorage.getItem(SAVE_KEY) || "{}"
      );
    } catch {
      return {};
    }
  }

  function saveCustomization(data) {
    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(data)
    );
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;

    style.textContent = `
      :root {
        --fx-bg-dark: #07101d;
        --fx-surface-dark: #121d32;
        --fx-card-dark: #16233a;
        --fx-text-dark: #f8fafc;
        --fx-muted-dark: #94a3b8;
        --fx-border-dark: #334155;

        --fx-bg-light: #f3f6fb;
        --fx-surface-light: #ffffff;
        --fx-card-light: #ffffff;
        --fx-text-light: #111827;
        --fx-muted-light: #64748b;
        --fx-border-light: #dbe2ea;
      }

      html[data-farm-theme="dark"],
      html[data-farm-theme="dark"] body {
        background: var(--farm-bg, var(--fx-bg-dark)) !important;
        color: var(--farm-text, var(--fx-text-dark)) !important;
      }

      html[data-farm-theme="light"],
      html[data-farm-theme="light"] body {
        background: var(--fx-bg-light) !important;
        color: var(--fx-text-light) !important;
      }

      html[data-farm-theme="dark"] .shell,
      html[data-farm-theme="dark"] .page,
      html[data-farm-theme="dark"] main {
        background: var(--farm-bg, var(--fx-bg-dark)) !important;
        color: var(--farm-text, var(--fx-text-dark)) !important;
      }

      html[data-farm-theme="light"] .shell,
      html[data-farm-theme="light"] .page,
      html[data-farm-theme="light"] main {
        background: var(--fx-bg-light) !important;
        color: var(--fx-text-light) !important;
      }

      html[data-farm-theme="dark"] .topbar,
      html[data-farm-theme="dark"] .bottom-nav,
      html[data-farm-theme="dark"] .panel,
      html[data-farm-theme="dark"] .card,
      html[data-farm-theme="dark"] .row,
      html[data-farm-theme="dark"] .list,
      html[data-farm-theme="dark"] .sv2-card {
        background: var(--farm-card, var(--fx-card-dark)) !important;
        color: var(--farm-text, var(--fx-text-dark)) !important;
        border-color: var(--farm-border, var(--fx-border-dark)) !important;
      }

      html[data-farm-theme="light"] .topbar,
      html[data-farm-theme="light"] .bottom-nav,
      html[data-farm-theme="light"] .panel,
      html[data-farm-theme="light"] .card,
      html[data-farm-theme="light"] .row,
      html[data-farm-theme="light"] .list,
      html[data-farm-theme="light"] .sv2-card {
        background: var(--fx-card-light) !important;
        color: var(--fx-text-light) !important;
        border-color: var(--fx-border-light) !important;
      }

      html[data-farm-theme="light"] input,
      html[data-farm-theme="light"] textarea,
      html[data-farm-theme="light"] select {
        background: #ffffff !important;
        color: #111827 !important;
        border-color: #cbd5e1 !important;
      }

      html[data-farm-theme="dark"] input,
      html[data-farm-theme="dark"] textarea,
      html[data-farm-theme="dark"] select {
        background: #0f172a !important;
        color: #f8fafc !important;
      }

      html[data-farm-theme="light"] .row-sub,
      html[data-farm-theme="light"] .brand-sub,
      html[data-farm-theme="light"] small,
      html[data-farm-theme="light"] .sv2-section-sub {
        color: #64748b !important;
      }

      .farm-global-save {
        position: fixed;
        z-index: 99990;

        right: 14px;
        left: 14px;

        bottom:
          calc(78px + env(safe-area-inset-bottom));

        display: none;

        min-height: 52px;

        border: 0;
        border-radius: 17px;

        background:
          linear-gradient(
            135deg,
            var(--farm-accent, #7c3aed),
            var(--farm-accent-2, #2563eb)
          );

        color: white;

        font-family: inherit;
        font-size: 14px;
        font-weight: 900;

        box-shadow:
          0 15px 35px rgba(0,0,0,.28);
      }

      .farm-global-save.visible {
        display: block;
      }

      .farm-save-toast {
        position: fixed;

        z-index: 99999;

        left: 50%;
        bottom:
          calc(145px + env(safe-area-inset-bottom));

        transform: translateX(-50%);

        background: #111827;
        color: white;

        padding: 10px 16px;

        border-radius: 999px;

        font-size: 11px;

        border:
          1px solid rgba(255,255,255,.12);

        box-shadow:
          0 10px 35px rgba(0,0,0,.3);
      }
    `;

    document.head.appendChild(style);
  }

  function applyTheme(mode = getTheme()) {
    if (applying) return;

    applying = true;

    try {
      saveTheme(mode);

      document.documentElement.dataset.farmTheme = mode;
      document.documentElement.dataset.theme = mode;

      const buttons =
        document.querySelectorAll(
          '[data-action="toggle-theme"]'
        );

      buttons.forEach(button => {
        button.textContent =
          mode === "dark"
            ? "☀️"
            : "🌙";
      });

      try {
        const raw =
          localStorage.getItem(
            "farmandeh-runtime-V1"
          );

        if (raw) {
          const runtime = JSON.parse(raw);

          runtime.theme =
            runtime.theme || {};

          runtime.theme.mode =
            mode;

          localStorage.setItem(
            "farmandeh-runtime-V1",
            JSON.stringify(runtime)
          );
        }
      } catch (error) {
        console.warn(
          "Runtime theme sync failed",
          error
        );
      }
    } finally {
      applying = false;
    }
  }

  function toggleTheme() {
    applyTheme(
      getTheme() === "dark"
        ? "light"
        : "dark"
    );
  }

  function showToast(message) {
    document
      .querySelector(".farm-save-toast")
      ?.remove();

    const toast =
      document.createElement("div");

    toast.className =
      "farm-save-toast";

    toast.textContent =
      message;

    document.body.appendChild(
      toast
    );

    setTimeout(
      () => toast.remove(),
      1800
    );
  }

  function createSaveButton() {
    let button =
      document.getElementById(
        "farmGlobalSave"
      );

    if (button) return button;

    button =
      document.createElement(
        "button"
      );

    button.id =
      "farmGlobalSave";

    button.className =
      "farm-global-save";

    button.textContent =
      "💾 ذخیره تغییرات";

    document.body.appendChild(
      button
    );

    button.addEventListener(
      "click",
      () => {
        saveAll();
      }
    );

    return button;
  }

  function isStudio() {
    return Boolean(
      document.querySelector(
        '[data-route="studio"].active'
      ) ||
      document.querySelector(
        ".sv2-root"
      )
    );
  }

  function updateSaveButton() {
    const button =
      createSaveButton();

    button.classList.toggle(
      "visible",
      isStudio()
    );
  }

  function collectStudioValues() {
    const existing =
      getCustomization();

    const result =
      JSON.parse(
        JSON.stringify(
          existing || {}
        )
      );

    document
      .querySelectorAll(
        "[data-cfg]"
      )
      .forEach(element => {
        const path =
          element.dataset.cfg;

        if (!path) return;

        let value;

        const kind =
          element.dataset.kind;

        if (
          kind === "boolean"
        ) {
          value =
            element.checked;
        } else if (
          kind === "number"
        ) {
          value =
            Number(
              element.value
            );
        } else {
          value =
            element.value;
        }

        setPath(
          result,
          path,
          value
        );
      });

    return result;
  }

  function setPath(
    object,
    path,
    value
  ) {
    const parts =
      path.split(".");

    let cursor =
      object;

    parts.forEach(
      (part, index) => {
        if (
          index ===
          parts.length - 1
        ) {
          cursor[part] =
            value;
          return;
        }

        if (
          !cursor[part] ||
          typeof cursor[part] !==
            "object"
        ) {
          cursor[part] = {};
        }

        cursor =
          cursor[part];
      }
    );
  }

  function saveAll() {
    try {
      const values =
        collectStudioValues();

      saveCustomization(
        values
      );

      if (
        window
          .FarmandehCustomizationV2
      ) {
        window
          .FarmandehCustomizationV2
          .import(values);

        window
          .FarmandehCustomizationV2
          .apply();
      }

      applyTheme(
        getTheme()
      );

      window.dispatchEvent(
        new CustomEvent(
          "farmandeh:customization-changed",
          {
            detail: values
          }
        )
      );

      showToast(
        "✅ تغییرات ذخیره شد"
      );
    } catch (error) {
      console.error(
        "Farmandeh save error:",
        error
      );

      showToast(
        "❌ خطا در ذخیره"
      );
    }
  }

  function restoreCustomization() {
    try {
      const saved =
        getCustomization();

      if (
        window
          .FarmandehCustomizationV2 &&
        saved &&
        Object.keys(saved).length
      ) {
        window
          .FarmandehCustomizationV2
          .import(saved);

        window
          .FarmandehCustomizationV2
          .apply();
      }
    } catch (error) {
      console.warn(
        "Customization restore failed",
        error
      );
    }
  }

  document.addEventListener(
    "click",
    event => {
      const toggle =
        event.target.closest(
          '[data-action="toggle-theme"]'
        );

      if (!toggle) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      toggleTheme();
    },
    true
  );

  window.addEventListener(
    "farmandeh:customization-changed",
    () => {
      setTimeout(
        () => {
          applyTheme(
            getTheme()
          );
        },
        0
      );
    }
  );

  function refresh() {
    applyTheme(
      getTheme()
    );

    updateSaveButton();
  }

  function start() {
    installStyles();

    createSaveButton();

    restoreCustomization();

    applyTheme(
      getTheme()
    );

    const app =
      document.getElementById(
        "app"
      );

    if (app) {
      const observer =
        new MutationObserver(
          () => {
            setTimeout(
              refresh,
              20
            );
          }
        );

      observer.observe(
        app,
        {
          childList: true,
          subtree: true
        }
      );
    }

    refresh();

    console.log(
      `Farmandeh Runtime Fix V${VERSION} loaded`
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
