/* =========================================================
   FARMANDEH PLATFORM
   Customization Engine V2
   Version: 2.0.0
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "farmandeh-customization-v2";

  const DEFAULT_CONFIG = {
    version: "2.0.0",

    theme: {
      background: "#07101d",
      surface: "#121d32",
      surfaceAlt: "#192640",
      card: "#16233a",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      border: "#334155",

      accent: "#7c3aed",
      accent2: "#2563eb",
      accent3: "#06b6d4",

      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",

      gradient1: "#21184f",
      gradient2: "#111c33",

      radiusSmall: 12,
      radiusMedium: 18,
      radiusLarge: 28,

      borderWidth: 1,
      opacity: 100,

      shadowStrength: 30,
      glowStrength: 20,

      density: "comfortable"
    },

    typography: {
      fontFamily: "system-ui",
      baseSize: 14,
      titleSize: 30,
      sectionTitleSize: 18,
      cardTitleSize: 14,
      smallSize: 10,

      titleWeight: 900,
      sectionWeight: 800,
      cardWeight: 700
    },

    layout: {
      homeMode: "dashboard",
      columnsMobile: 2,
      columnsTablet: 4,
      gap: 10,
      pagePadding: 14,
      compactCards: false
    },

    pages: {
      home: {
        enabled: true,

        hero: {
          enabled: true,
          title: "فرمانده؛ امروز را کنترل کن.",
          subtitle:
            "تعمیرگاه، مشتری‌ها، جریان کار و مالی را از یک صفحه ببین.",
          badge: "COMMAND CENTER V2",
          liveLabel: "LIVE"
        },

        quickActions: {
          enabled: true,
          title: "عملیات سریع",
          subtitle: "کارهای پرمصرف روزانه"
        },

        kpis: {
          enabled: true,
          title: "وضعیت لحظه‌ای",
          subtitle: "داده واقعی Runtime"
        },

        pipeline: {
          enabled: true,
          title: "خط تعمیرگاه",
          subtitle: "Repair Pipeline"
        },

        finance: {
          enabled: true,
          title: "وضعیت مالی",
          subtitle: "براساس پرونده‌های ثبت‌شده"
        },

        recent: {
          enabled: true,
          title: "فعالیت اخیر",
          subtitle: "آخرین پرونده‌ها"
        },

        modules: {
          enabled: true,
          title: "ماژول‌ها",
          subtitle: "دسترسی مستقیم"
        },

        sectionOrder: [
          "hero",
          "quickActions",
          "kpis",
          "pipeline",
          "finance",
          "recent",
          "modules"
        ]
      },

      activity: {
        enabled: true,
        title: "مرکز فعالیت"
      },

      studio: {
        enabled: true,
        title: "استودیو فرمانده"
      },

      repairs: {
        enabled: true,
        title: "تعمیرات"
      },

      customers: {
        enabled: true,
        title: "مشتریان"
      }
    },

    labels: {
      home: "خانه",
      activity: "فعالیت",
      studio: "استودیو",

      repairs: "تعمیرات",
      customers: "مشتریان",
      inventory: "انبار",
      tasks: "برنامه",
      forum: "انجمن",
      sales: "فروش",

      newRepair: "پذیرش تعمیر",
      newCustomer: "مشتری جدید",
      reports: "گزارش",
      open: "باز کردن",

      totalRepairs: "پرونده تعمیر",
      activeRepairs: "در جریان کار",
      readyRepairs: "آماده مشتری",
      totalCustomers: "مشتری ثبت‌شده",

      intake: "پذیرش",
      diagnosing: "عیب‌یابی",
      repairing: "در حال تعمیر",
      waitingPart: "منتظر قطعه",
      ready: "آماده تحویل",

      received: "دریافتی ثبت‌شده",
      outstanding: "مانده مطالبات"
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function deepMerge(target, source) {
    if (
      typeof target !== "object" ||
      target === null
    ) {
      return clone(source);
    }

    const output = clone(target);

    Object.keys(source || {}).forEach(key => {
      const sourceValue = source[key];
      const targetValue = output[key];

      if (
        sourceValue &&
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue)
      ) {
        output[key] = deepMerge(
          targetValue || {},
          sourceValue
        );
      } else {
        output[key] = clone(sourceValue);
      }
    });

    return output;
  }

  function load() {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return clone(DEFAULT_CONFIG);
      }

      const saved =
        JSON.parse(raw);

      return deepMerge(
        DEFAULT_CONFIG,
        saved
      );
    } catch (error) {
      console.error(
        "Farmandeh customization load error:",
        error
      );

      return clone(DEFAULT_CONFIG);
    }
  }

  let config = load();

  function save() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(config)
    );

    window.dispatchEvent(
      new CustomEvent(
        "farmandeh:customization-changed",
        {
          detail: clone(config)
        }
      )
    );

    return true;
  }

  function get(path) {
    if (!path) {
      return clone(config);
    }

    return path
      .split(".")
      .reduce(
        (obj, key) =>
          obj &&
          obj[key] !== undefined
            ? obj[key]
            : undefined,
        config
      );
  }

  function set(path, value) {
    if (!path) return false;

    const keys =
      path.split(".");

    let cursor = config;

    for (
      let i = 0;
      i < keys.length - 1;
      i++
    ) {
      const key = keys[i];

      if (
        typeof cursor[key] !== "object" ||
        cursor[key] === null
      ) {
        cursor[key] = {};
      }

      cursor = cursor[key];
    }

    cursor[
      keys[keys.length - 1]
    ] = value;

    save();

    return true;
  }

  function reset() {
    config =
      clone(DEFAULT_CONFIG);

    save();

    return true;
  }

  function exportConfig() {
    return JSON.stringify(
      config,
      null,
      2
    );
  }

  function importConfig(
    value
  ) {
    try {
      const parsed =
        typeof value === "string"
          ? JSON.parse(value)
          : value;

      config =
        deepMerge(
          DEFAULT_CONFIG,
          parsed || {}
        );

      save();

      return true;
    } catch (error) {
      console.error(
        "Farmandeh customization import error:",
        error
      );

      return false;
    }
  }

  function cssVariables() {
    const t =
      config.theme;

    const ty =
      config.typography;

    const l =
      config.layout;

    return {
      "--farm-bg": t.background,
      "--farm-surface": t.surface,
      "--farm-surface-alt": t.surfaceAlt,
      "--farm-card": t.card,

      "--farm-text": t.text,
      "--farm-muted": t.textMuted,
      "--farm-border": t.border,

      "--farm-accent": t.accent,
      "--farm-accent-2": t.accent2,
      "--farm-accent-3": t.accent3,

      "--farm-success": t.success,
      "--farm-warning": t.warning,
      "--farm-danger": t.danger,

      "--farm-gradient-1": t.gradient1,
      "--farm-gradient-2": t.gradient2,

      "--farm-radius-sm":
        `${t.radiusSmall}px`,

      "--farm-radius-md":
        `${t.radiusMedium}px`,

      "--farm-radius-lg":
        `${t.radiusLarge}px`,

      "--farm-border-width":
        `${t.borderWidth}px`,

      "--farm-opacity":
        String(
          Number(t.opacity || 100) /
            100
        ),

      "--farm-gap":
        `${l.gap}px`,

      "--farm-page-padding":
        `${l.pagePadding}px`,

      "--farm-font":
        ty.fontFamily,

      "--farm-font-size":
        `${ty.baseSize}px`,

      "--farm-title-size":
        `${ty.titleSize}px`,

      "--farm-section-title-size":
        `${ty.sectionTitleSize}px`,

      "--farm-card-title-size":
        `${ty.cardTitleSize}px`,

      "--farm-small-size":
        `${ty.smallSize}px`
    };
  }

  function apply() {
    const vars =
      cssVariables();

    Object.entries(vars)
      .forEach(
        ([key, value]) => {
          document
            .documentElement
            .style
            .setProperty(
              key,
              value
            );
        }
      );

    document
      .documentElement
      .dataset
      .farmDensity =
        config.theme.density;

    window.dispatchEvent(
      new CustomEvent(
        "farmandeh:theme-applied",
        {
          detail: clone(config)
        }
      )
    );
  }

  window.FarmandehCustomizationV2 = {
    version: "2.0.0",

    defaults:
      clone(DEFAULT_CONFIG),

    get,

    set,

    save,

    reset,

    apply,

    export:
      exportConfig,

    import:
      importConfig,

    getAll() {
      return clone(config);
    }
  };

  apply();

  console.log(
    "Farmandeh Customization Engine V2 loaded"
  );

})();
