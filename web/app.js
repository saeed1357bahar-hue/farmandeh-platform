(() => {
  "use strict";

  const STORAGE_KEY = "farmandeh-runtime-V1";

  const DEFAULT = {
    version: "1.1",

    workspace: {
      name: "فرمانده",
      subtitle: "پلتفرم شخصی‌سازی‌پذیر"
    },

    theme: {
      mode: "dark",
      accent: "#7c3aed",
      radius: 18,
      density: "comfortable"
    },

    modules: [
      {
        id: "repairs",
        title: "تعمیرات",
        emoji: "🛠️",
        description: "پذیرش، عیب‌یابی، تعمیر، تحویل و سوابق",
        visible: true
      },
      {
        id: "customers",
        title: "مشتریان",
        emoji: "👥",
        description: "پروفایل مشتری، خودروها و تاریخچه تعمیر",
        visible: true
      },
      {
        id: "inventory",
        title: "انبار قطعات",
        emoji: "📦",
        description: "قطعات، موجودی و تامین‌کننده",
        visible: true
      },
      {
        id: "tasks",
        title: "کارها و برنامه",
        emoji: "✅",
        description: "وظایف، تایمر و گزارش روزانه",
        visible: true
      },
      {
        id: "forum",
        title: "انجمن",
        emoji: "💬",
        description: "موضوعات، گفتگوها و دانش جمعی",
        visible: true
      },
      {
        id: "sales",
        title: "فروش",
        emoji: "🛒",
        description: "محصولات، مقایسه و سفارش‌ها",
        visible: true
      }
    ],

    repairs: [],
    customers: [],
    vehicles: []
  };

  let state = loadState();
  let route = "home";
  let routeArg = null;
  let toastTimer;

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function esc(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      c =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        })[c]
    );
  }

  function uid(prefix = "id") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatMoney(v) {
    return Number(v || 0).toLocaleString("fa-IR");
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const p = JSON.parse(saved);

        return {
          ...clone(DEFAULT),
          ...p,

          workspace: {
            ...clone(DEFAULT.workspace),
            ...(p.workspace || {})
          },

          theme: {
            ...clone(DEFAULT.theme),
            ...(p.theme || {})
          },

          modules:
            Array.isArray(p.modules) && p.modules.length
              ? p.modules
              : clone(DEFAULT.modules),

          repairs:
            Array.isArray(p.repairs)
              ? p.repairs
              : [],

          customers:
            Array.isArray(p.customers)
              ? p.customers
              : [],

          vehicles:
            Array.isArray(p.vehicles)
              ? p.vehicles
              : []
        };
      }
    } catch (e) {
      console.error("Load error:", e);
    }

    return clone(DEFAULT);
  }

  function saveState(msg = "ذخیره شد") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    if (msg) toast(msg);
  }

  function toast(msg) {
    document.querySelector(".toast")?.remove();

    clearTimeout(toastTimer);

    const el = document.createElement("div");

    el.className = "toast";
    el.textContent = msg;

    document.body.appendChild(el);

    toastTimer = setTimeout(
      () => el.remove(),
      1800
    );
  }

  function applyTheme() {
    document.documentElement.dataset.theme =
      state.theme.mode;

    document.documentElement.style.setProperty(
      "--accent",
      state.theme.accent
    );

    document.documentElement.style.setProperty(
      "--radius",
      `${state.theme.radius}px`
    );

    document.documentElement.style.setProperty(
      "--gap",
      state.theme.density === "compact"
        ? "9px"
        : "14px"
    );
  }

  function navigate(
    next,
    arg = null,
    options = {}
  ) {
    const {
      replace = false,
      fromPop = false
    } = options;

    route = next;
    routeArg = arg;

    if (!fromPop) {
      const historyState = {
        farmandeh: true,
        route,
        routeArg
      };

      if (replace) {
        history.replaceState(
          historyState,
          ""
        );
      } else {
        history.pushState(
          historyState,
          ""
        );
      }
    }

    render();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function goBack() {
    if (route !== "home") {
      history.back();
    }
  }

  function topbar(title) {
    return `
      <header class="topbar">

        ${
          route !== "home"
            ? `
              <button
                class="icon-btn"
                data-action="back"
              >
                →
              </button>
            `
            : ""
        }

        <div class="brand">

          <div class="logo">
            F
          </div>

          <div>

            <div class="brand-title">
              ${esc(title || state.workspace.name)}
            </div>

            <div class="brand-sub">
              ${esc(state.workspace.subtitle)}
            </div>

          </div>

        </div>

        <button
          class="icon-btn"
          data-action="toggle-theme"
        >
          ${
            state.theme.mode === "dark"
              ? "☀️"
              : "🌙"
          }
        </button>

      </header>
    `;
  }

  function bottomNav() {
    return `
      <nav class="bottom-nav">

        <button
          class="nav-btn ${route === "home" ? "active" : ""}"
          data-route="home"
        >
          🏠<br>
          <small>خانه</small>
        </button>

        <button
          class="nav-btn ${route === "activity" ? "active" : ""}"
          data-route="activity"
        >
          📊<br>
          <small>فعالیت</small>
        </button>

        <button
          class="nav-btn ${route === "studio" ? "active" : ""}"
          data-route="studio"
        >
          🎛️<br>
          <small>استودیو</small>
        </button>

      </nav>
    `;
  }

  function field(
    id,
    label,
    value,
    type = "text"
  ) {
    return `
      <div class="field">
        <label>${label}</label>

        <input
          id="${id}"
          type="${type}"
          value="${esc(value)}"
        >
      </div>
    `;
  }

  function detailRow(k, v) {
    return `
      <div class="row">

        <div class="row-main">

          <div class="row-title">
            ${esc(k)}
          </div>

          <div class="row-sub">
            ${esc(v || "—")}
          </div>

        </div>

      </div>
    `;
  }

  // =========================
  // HOME
  // =========================

  function repairStats() {
    const open =
      state.repairs.filter(
        r =>
          ![
            "delivered",
            "cancelled"
          ].includes(r.status)
      ).length;

    const ready =
      state.repairs.filter(
        r => r.status === "ready"
      ).length;

    const returned =
      state.repairs.filter(
        r => r.isReturn
      ).length;

    return {
      open,
      ready,
      returned,
      total: state.repairs.length
    };
  }

  function home() {
    const s = repairStats();

    const modules =
      state.modules.filter(
        m => m.visible !== false
      );

    return `
      ${topbar()}

      <main class="page">

        <section class="hero">

          <div class="badge">
            Runtime V1.1 • Repairs + Customers
          </div>

          <h1>
            ${esc(state.workspace.name)}
          </h1>

          <p>
            هسته واقعی تعمیرات و مشتریان فعال است.
            اطلاعات ثبت می‌شوند و بعد از خروج باقی می‌مانند.
          </p>

          <div class="stats">

            <div class="stat">
              <b>${s.open}</b>
              <span>تعمیر باز</span>
            </div>

            <div class="stat">
              <b>${s.ready}</b>
              <span>آماده تحویل</span>
            </div>

            <div class="stat">
              <b>${state.customers.length}</b>
              <span>مشتری</span>
            </div>

          </div>

        </section>

        <div class="section-head">

          <div>
            <h2>Command Center</h2>
            <small>ماژول‌ها</small>
          </div>

          <button
            class="ghost-btn"
            data-route="studio"
          >
            ویرایش
          </button>

        </div>

        <section class="grid">

          ${
            modules.map(m => `
              <article
                class="card clickable"
                data-module="${esc(m.id)}"
              >

                <div class="emoji">
                  ${esc(m.emoji)}
                </div>

                <h3>
                  ${esc(m.title)}
                </h3>

                <p>
                  ${esc(m.description)}
                </p>

                <div class="card-footer">

                  <span class="badge">

                    ${
                      m.id === "repairs"
                        ? `${s.total} پرونده`

                        : m.id === "customers"
                          ? `${state.customers.length} مشتری`

                          : "ماژول"
                    }

                  </span>

                  <span>←</span>

                </div>

              </article>
            `).join("")
          }

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // =========================
  // REPAIRS
  // =========================

  function statusLabel(s) {
    return (
      {
        intake: "پذیرش",
        diagnosing: "عیب‌یابی",
        repairing: "در حال تعمیر",
        waiting_part: "منتظر قطعه",
        ready: "آماده تحویل",
        delivered: "تحویل شده",
        cancelled: "لغو شده"
      }[s] || s
    );
  }

  function getElapsedSeconds(r) {
    let sec =
      Number(r.elapsedSeconds || 0);

    if (
      r.timerRunning &&
      r.timerStartedAt
    ) {
      sec += Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            new Date(
              r.timerStartedAt
            ).getTime()
          ) / 1000
        )
      );
    }

    return sec;
  }

  function formatDuration(sec) {
    sec = Math.floor(sec || 0);

    const h =
      Math.floor(sec / 3600);

    const m =
      Math.floor(
        (sec % 3600) / 60
      );

    const s =
      sec % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function repairList() {
    const q =
      (
        document.getElementById(
          "repairSearch"
        )?.value || ""
      )
        .trim()
        .toLowerCase();

    return state.repairs.filter(r => {
      if (!q) return true;

      return [
        r.repairNo,
        r.customerName,
        r.customerPhone,
        r.vehicle,
        r.device,
        r.fault,
        r.technician,
        statusLabel(r.status)
      ].some(
        v =>
          String(v || "")
            .toLowerCase()
            .includes(q)
      );
    });
  }

  function renderRepairRows(items) {
    if (!items.length) {
      return `
        <div class="empty">
          هنوز پرونده‌ای ثبت نشده است.
        </div>
      `;
    }

    return items
      .slice()
      .sort(
        (a, b) =>
          String(
            b.updatedAt || ""
          ).localeCompare(
            String(
              a.updatedAt || ""
            )
          )
      )
      .map(r => {
        const elapsed =
          getElapsedSeconds(r);

        return `
          <div
            class="row clickable"
            data-repair-id="${r.id}"
          >

            <div class="row-main">

              <div class="row-title">
                ${esc(r.repairNo || "بدون شماره")}
                •
                ${esc(r.device || "دستگاه")}
              </div>

              <div class="row-sub">
                ${esc(r.customerName || "بدون مشتری")}
                •
                ${esc(r.vehicle || "بدون خودرو")}
                •
                ${esc(statusLabel(r.status))}
              </div>

              <div class="row-sub">
                ${
                  elapsed
                    ? `⏱ ${formatDuration(elapsed)}`
                    : ""
                }

                ${
                  r.isReturn
                    ? " • 🔁 برگشتی"
                    : ""
                }
              </div>

            </div>

            <span>‹</span>

          </div>
        `;
      })
      .join("");
  }

  function repairsPage() {
    const s = repairStats();

    return `
      ${topbar("تعمیرات")}

      <main class="page">

        <section class="hero">

          <div class="badge">
            Real Repairs Core
          </div>

          <h1>
            مدیریت تعمیرات
          </h1>

          <p>
            پرونده واقعی بساز، ویرایش کن،
            جستجو کن و زمان تعمیر را ثبت کن.
          </p>

          <div class="stats">

            <div class="stat">
              <b>${s.total}</b>
              <span>کل پرونده</span>
            </div>

            <div class="stat">
              <b>${s.open}</b>
              <span>باز</span>
            </div>

            <div class="stat">
              <b>${s.ready}</b>
              <span>آماده</span>
            </div>

          </div>

        </section>

        <div class="section-head">

          <div>
            <h2>پرونده‌ها</h2>
            <small>ذخیره دائمی</small>
          </div>

          <button
            class="primary-btn"
            data-action="new-repair"
          >
            + پذیرش
          </button>

        </div>

        <section class="panel">

          <div
            class="field"
            style="margin-bottom:12px"
          >

            <label>
              جستجوی سریع
            </label>

            <input
              id="repairSearch"
              placeholder="شماره، مشتری، خودرو، دستگاه، عیب..."
              autocomplete="off"
            >

          </div>

          <div
            id="repairList"
            class="list"
          >
            ${renderRepairRows(state.repairs)}
          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function repairForm(repair = null) {
    const r =
      repair || {
        id: "",
        repairNo: "",
        customerName: "",
        customerPhone: "",
        vehicle: "",
        device: "",
        fault: "",
        diagnosis: "",
        technician: "",
        status: "intake",
        partsUsed: "",
        cost: 0,
        paid: 0,
        isReturn: false,
        notes: ""
      };

    return `
      ${topbar(
        repair
          ? "ویرایش تعمیر"
          : "پذیرش تعمیر"
      )}

      <main class="page">

        <section class="panel">

          <div class="section-head">

            <div>

              <h2>
                ${
                  repair
                    ? "ویرایش پرونده"
                    : "پذیرش جدید"
                }
              </h2>

              <small>
                تمام فیلدها قابل ویرایش‌اند
              </small>

            </div>

          </div>

          <div class="form-grid">

            ${field(
              "repairNo",
              "شماره تعمیر",
              r.repairNo
            )}

            ${field(
              "customerName",
              "نام مشتری",
              r.customerName
            )}

            ${field(
              "customerPhone",
              "تلفن",
              r.customerPhone,
              "tel"
            )}

            ${field(
              "vehicle",
              "خودرو",
              r.vehicle
            )}

            ${field(
              "device",
              "دستگاه / مدل",
              r.device
            )}

            ${field(
              "technician",
              "تکنسین",
              r.technician
            )}

            <div class="field">

              <label>وضعیت</label>

              <select id="status">

                ${
                  [
                    "intake",
                    "diagnosing",
                    "repairing",
                    "waiting_part",
                    "ready",
                    "delivered",
                    "cancelled"
                  ]
                    .map(
                      s => `
                        <option
                          value="${s}"
                          ${r.status === s ? "selected" : ""}
                        >
                          ${statusLabel(s)}
                        </option>
                      `
                    )
                    .join("")
                }

              </select>

            </div>

            ${field(
              "cost",
              "هزینه کل",
              r.cost,
              "number"
            )}

            ${field(
              "paid",
              "پرداخت شده",
              r.paid,
              "number"
            )}

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>شرح عیب</label>

            <textarea
              id="fault"
              rows="4"
            >${esc(r.fault)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              تشخیص فنی
            </label>

            <textarea
              id="diagnosis"
              rows="4"
            >${esc(r.diagnosis)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              قطعات مصرفی
            </label>

            <textarea
              id="partsUsed"
              rows="3"
            >${esc(r.partsUsed)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              یادداشت
            </label>

            <textarea
              id="notes"
              rows="3"
            >${esc(r.notes)}</textarea>

          </div>

          <label
            class="switch"
            style="margin-top:14px"
          >

            <input
              type="checkbox"
              id="isReturn"
              ${r.isReturn ? "checked" : ""}
            >

            پرونده برگشتی / تکرار تعمیر

          </label>

          <div
            class="toolbar"
            style="margin-top:18px"
          >

            <button
              class="primary-btn"
              data-action="save-repair"
              data-id="${esc(r.id)}"
            >
              ذخیره پرونده
            </button>

            ${
              repair
                ? `
                  <button
                    class="danger-btn"
                    data-action="delete-repair"
                    data-id="${esc(r.id)}"
                  >
                    حذف
                  </button>
                `
                : ""
            }

          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function collectRepair(id) {
    const old =
      state.repairs.find(
        r => r.id === id
      );

    return {
      ...(old || {}),

      id:
        old?.id || uid("r"),

      repairNo:
        document.getElementById(
          "repairNo"
        ).value.trim(),

      customerName:
        document.getElementById(
          "customerName"
        ).value.trim(),

      customerPhone:
        document.getElementById(
          "customerPhone"
        ).value.trim(),

      vehicle:
        document.getElementById(
          "vehicle"
        ).value.trim(),

      device:
        document.getElementById(
          "device"
        ).value.trim(),

      technician:
        document.getElementById(
          "technician"
        ).value.trim(),

      status:
        document.getElementById(
          "status"
        ).value,

      cost:
        Number(
          document.getElementById(
            "cost"
          ).value || 0
        ),

      paid:
        Number(
          document.getElementById(
            "paid"
          ).value || 0
        ),

      fault:
        document.getElementById(
          "fault"
        ).value.trim(),

      diagnosis:
        document.getElementById(
          "diagnosis"
        ).value.trim(),

      partsUsed:
        document.getElementById(
          "partsUsed"
        ).value.trim(),

      notes:
        document.getElementById(
          "notes"
        ).value.trim(),

      isReturn:
        document.getElementById(
          "isReturn"
        ).checked,

      createdAt:
        old?.createdAt ||
        nowIso(),

      updatedAt:
        nowIso(),

      elapsedSeconds:
        Number(
          old?.elapsedSeconds || 0
        ),

      timerRunning:
        Boolean(
          old?.timerRunning
        ),

      timerStartedAt:
        old?.timerStartedAt || null
    };
  }

  function repairDetail(r) {
    const elapsed =
      getElapsedSeconds(r);

    return `
      ${topbar(`تعمیر ${r.repairNo || ""}`)}

      <main class="page">

        <section class="hero">

          <div class="badge">
            ${esc(statusLabel(r.status))}
          </div>

          <h1>
            ${esc(r.device || "دستگاه")}
          </h1>

          <p>
            ${esc(r.customerName || "بدون نام")}
            •
            ${esc(r.vehicle || "بدون خودرو")}
          </p>

          <div class="stats">

            <div class="stat">
              <b>${formatDuration(elapsed)}</b>
              <span>زمان تعمیر</span>
            </div>

            <div class="stat">
              <b>${formatMoney(r.cost)}</b>
              <span>هزینه</span>
            </div>

            <div class="stat">
              <b>${formatMoney((r.cost || 0) - (r.paid || 0))}</b>
              <span>مانده</span>
            </div>

          </div>

        </section>

        <div class="section-head">
          <h2>عملیات</h2>
        </div>

        <section class="toolbar">

          <button
            class="primary-btn"
            data-action="${
              r.timerRunning
                ? "pause-timer"
                : "start-timer"
            }"
            data-id="${r.id}"
          >
            ${
              r.timerRunning
                ? "⏸ توقف تایمر"
                : "▶ شروع تایمر"
            }
          </button>

          <button
            class="ghost-btn"
            data-action="edit-repair"
            data-id="${r.id}"
          >
            ✏️ ویرایش
          </button>

          <button
            class="ghost-btn"
            data-action="mark-ready"
            data-id="${r.id}"
          >
            ✅ آماده تحویل
          </button>

        </section>

        <div class="section-head">
          <h2>اطلاعات پرونده</h2>
        </div>

        <section class="list">

          ${detailRow("مشتری", r.customerName)}
          ${detailRow("تلفن", r.customerPhone)}
          ${detailRow("خودرو", r.vehicle)}
          ${detailRow("دستگاه", r.device)}
          ${detailRow("تکنسین", r.technician)}
          ${detailRow("شرح عیب", r.fault)}
          ${detailRow("تشخیص", r.diagnosis)}
          ${detailRow("قطعات مصرفی", r.partsUsed)}
          ${detailRow("وضعیت", statusLabel(r.status))}
          ${detailRow("برگشتی", r.isReturn ? "بله" : "خیر")}
          ${detailRow("یادداشت", r.notes)}

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // =========================
  // CUSTOMERS
  // =========================

  function customerRepairCount(c) {
    return state.repairs.filter(r => {
      if (
        c.phone &&
        r.customerPhone &&
        r.customerPhone === c.phone
      ) {
        return true;
      }

      return (
        c.name &&
        r.customerName &&
        r.customerName === c.name
      );
    }).length;
  }

  function customerRows(items) {
    if (!items.length) {
      return `
        <div class="empty">
          هنوز مشتری ثبت نشده است.
        </div>
      `;
    }

    return items
      .slice()
      .sort(
        (a, b) =>
          String(
            b.updatedAt || ""
          ).localeCompare(
            String(
              a.updatedAt || ""
            )
          )
      )
      .map(c => `
        <div
          class="row clickable"
          data-customer-id="${esc(c.id)}"
        >

          <div class="row-main">

            <div class="row-title">
              ${esc(c.name || "بدون نام")}
            </div>

            <div class="row-sub">
              ${esc(c.phone || "بدون تلفن")}
            </div>

            <div class="row-sub">
              ${customerRepairCount(c)}
              تعمیر
              •
              ${
                state.vehicles.filter(
                  v => v.customerId === c.id
                ).length
              }
              خودرو
            </div>

          </div>

          <span>‹</span>

        </div>
      `)
      .join("");
  }

  function customersPage() {
    return `
      ${topbar("مشتریان")}

      <main class="page">

        <section class="hero">

          <div class="badge">
            Real Customers Core
          </div>

          <h1>مشتریان</h1>

          <p>
            پروفایل واقعی مشتری،
            خودروها و تاریخچه تعمیرات.
          </p>

          <div class="stats">

            <div class="stat">
              <b>${state.customers.length}</b>
              <span>مشتری</span>
            </div>

            <div class="stat">
              <b>${state.vehicles.length}</b>
              <span>خودرو</span>
            </div>

            <div class="stat">
              <b>${state.repairs.length}</b>
              <span>تعمیر</span>
            </div>

          </div>

        </section>

        <div class="section-head">

          <div>
            <h2>لیست مشتریان</h2>
            <small>Customer Core</small>
          </div>

          <button
            class="primary-btn"
            data-action="new-customer"
          >
            + مشتری
          </button>

        </div>

        <section class="panel">

          <div
            class="field"
            style="margin-bottom:12px"
          >

            <label>
              جستجوی مشتری
            </label>

            <input
              id="customerSearch"
              placeholder="نام، تلفن، شماره مشتری..."
              autocomplete="off"
            >

          </div>

          <div
            id="customerList"
            class="list"
          >
            ${customerRows(state.customers)}
          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function customerForm(customer = null) {
    const c =
      customer || {
        id: "",
        customerNo:
          "C-" +
          Date.now()
            .toString(36)
            .toUpperCase(),
        name: "",
        phone: "",
        address: "",
        tags: "",
        notes: ""
      };

    return `
      ${topbar(
        customer
          ? "ویرایش مشتری"
          : "مشتری جدید"
      )}

      <main class="page">

        <section class="panel">

          <div class="section-head">

            <div>

              <h2>
                ${
                  customer
                    ? "ویرایش پروفایل"
                    : "ثبت مشتری"
                }
              </h2>

              <small>
                Real Customer Record
              </small>

            </div>

          </div>

          <div class="form-grid">

            ${field(
              "customerNo",
              "شماره مشتری",
              c.customerNo
            )}

            ${field(
              "customerName",
              "نام مشتری",
              c.name
            )}

            ${field(
              "customerPhone",
              "تلفن",
              c.phone,
              "tel"
            )}

            ${field(
              "customerAddress",
              "آدرس",
              c.address
            )}

          </div>

          ${field(
            "customerTags",
            "برچسب‌ها",
            c.tags
          )}

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              یادداشت
            </label>

            <textarea
              id="customerNotes"
              rows="4"
            >${esc(c.notes)}</textarea>

          </div>

          <div
            class="toolbar"
            style="margin-top:18px"
          >

            <button
              class="primary-btn"
              data-action="save-customer"
              data-id="${esc(c.id)}"
            >
              ذخیره مشتری
            </button>

            ${
              customer
                ? `
                  <button
                    class="danger-btn"
                    data-action="delete-customer"
                    data-id="${esc(c.id)}"
                  >
                    حذف
                  </button>
                `
                : ""
            }

          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function customerDetail(c) {
    const vehicles =
      state.vehicles.filter(
        v => v.customerId === c.id
      );

    const repairs =
      state.repairs.filter(r => {
        if (
          c.phone &&
          r.customerPhone === c.phone
        ) {
          return true;
        }

        return (
          c.name &&
          r.customerName === c.name
        );
      });

    return `
      ${topbar("پروفایل مشتری")}

      <main class="page">

        <section class="hero">

          <div class="badge">
            ${esc(c.customerNo || "")}
          </div>

          <h1>
            ${esc(c.name)}
          </h1>

          <p>
            ${esc(c.phone || "بدون تلفن")}
          </p>

          <div class="stats">

            <div class="stat">
              <b>${vehicles.length}</b>
              <span>خودرو</span>
            </div>

            <div class="stat">
              <b>${repairs.length}</b>
              <span>تعمیر</span>
            </div>

          </div>

        </section>

        <div class="section-head">
          <h2>عملیات</h2>
        </div>

        <section class="toolbar">

          <button
            class="primary-btn"
            data-action="edit-customer"
            data-id="${c.id}"
          >
            ✏️ ویرایش
          </button>

          <button
            class="ghost-btn"
            data-action="new-vehicle"
            data-id="${c.id}"
          >
            🚗 ثبت خودرو
          </button>

        </section>

        <div class="section-head">
          <h2>اطلاعات</h2>
        </div>

        <section class="list">

          ${detailRow("تلفن", c.phone)}
          ${detailRow("آدرس", c.address)}
          ${detailRow("برچسب‌ها", c.tags)}
          ${detailRow("یادداشت", c.notes)}

        </section>

        <div class="section-head">
          <h2>خودروها</h2>
        </div>

        <section class="list">

          ${
            vehicles.length
              ? vehicles.map(v => `
                <div class="row">

                  <div class="row-main">

                    <div class="row-title">
                      ${esc(
                        [v.brand, v.model]
                          .filter(Boolean)
                          .join(" ") ||
                        "خودرو"
                      )}
                    </div>

                    <div class="row-sub">
                      ${
                        v.plate
                          ? `پلاک: ${esc(v.plate)}`
                          : "بدون پلاک"
                      }
                    </div>

                  </div>

                </div>
              `).join("")

              : `
                <div class="empty">
                  خودرویی ثبت نشده است.
                </div>
              `
          }

        </section>

        <div class="section-head">
          <h2>سوابق تعمیرات</h2>
        </div>

        <section class="list">

          ${
            repairs.length
              ? repairs.map(r => `
                <div
                  class="row clickable"
                  data-repair-id="${r.id}"
                >

                  <div class="row-main">

                    <div class="row-title">
                      ${esc(
                        r.repairNo ||
                        "بدون شماره"
                      )}
                    </div>

                    <div class="row-sub">
                      ${esc(
                        r.device ||
                        "دستگاه"
                      )}
                    </div>

                    <div class="row-sub">
                      ${esc(
                        statusLabel(
                          r.status
                        )
                      )}
                    </div>

                  </div>

                  <span>‹</span>

                </div>
              `).join("")

              : `
                <div class="empty">
                  هنوز سابقه تعمیر ندارد.
                </div>
              `
          }

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function vehicleForm(customerId) {
    return `
      ${topbar("ثبت خودرو")}

      <main class="page">

        <section class="panel">

          <div class="section-head">
            <h2>خودروی مشتری</h2>
          </div>

          <div class="form-grid">

            ${field(
              "vehicleBrand",
              "برند",
              ""
            )}

            ${field(
              "vehicleModel",
              "مدل",
              ""
            )}

            ${field(
              "vehicleYear",
              "سال",
              "",
              "number"
            )}

            ${field(
              "vehiclePlate",
              "پلاک",
              ""
            )}

          </div>

          <div
            class="toolbar"
            style="margin-top:18px"
          >

            <button
              class="primary-btn"
              data-action="save-vehicle"
              data-id="${customerId}"
            >
              ذخیره خودرو
            </button>

          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  function collectCustomer(id) {
    const old =
      state.customers.find(
        c => c.id === id
      );

    return {
      ...(old || {}),

      id:
        old?.id ||
        uid("c"),

      customerNo:
        document.getElementById(
          "customerNo"
        ).value.trim(),

      name:
        document.getElementById(
          "customerName"
        ).value.trim(),

      phone:
        document.getElementById(
          "customerPhone"
        ).value.trim(),

      address:
        document.getElementById(
          "customerAddress"
        ).value.trim(),

      tags:
        document.getElementById(
          "customerTags"
        ).value.trim(),

      notes:
        document.getElementById(
          "customerNotes"
        ).value.trim(),

      createdAt:
        old?.createdAt ||
        nowIso(),

      updatedAt:
        nowIso()
    };
  }

  // =========================
  // ACTIVITY
  // =========================

  function activity() {
    const s = repairStats();

    return `
      ${topbar("فعالیت")}

      <main class="page">

        <section class="hero">

          <h1>مرکز فعالیت</h1>

          <p>
            آمار واقعی داده‌های ثبت‌شده.
          </p>

        </section>

        <div class="section-head">
          <h2>Repair KPIs</h2>
        </div>

        <section class="grid">

          <div class="card">
            <div class="emoji">🛠️</div>
            <h3>${s.total}</h3>
            <p>کل پرونده‌های تعمیر</p>
          </div>

          <div class="card">
            <div class="emoji">⏳</div>
            <h3>${s.open}</h3>
            <p>تعمیرات باز</p>
          </div>

          <div class="card">
            <div class="emoji">✅</div>
            <h3>${s.ready}</h3>
            <p>آماده تحویل</p>
          </div>

          <div class="card">
            <div class="emoji">👥</div>
            <h3>${state.customers.length}</h3>
            <p>مشتریان</p>
          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // =========================
  // STUDIO
  // =========================

  function studio() {
    return `
      ${topbar("Farmandeh Studio")}

      <main class="page">

        <section class="hero">

          <div class="badge">
            No-code customization
          </div>

          <h1>
            استودیو فرمانده
          </h1>

          <p>
            تنظیمات ظاهر و ماژول‌ها
            بدون ویرایش کد.
          </p>

        </section>

        <div class="section-head">
          <h2>هویت Workspace</h2>
        </div>

        <section class="panel form-grid">

          ${field(
            "workspaceName",
            "نام",
            state.workspace.name
          )}

          ${field(
            "workspaceSubtitle",
            "زیرعنوان",
            state.workspace.subtitle
          )}

        </section>

        <div class="section-head">
          <h2>ظاهر</h2>
        </div>

        <section class="panel form-grid">

          <div class="field">

            <label>حالت</label>

            <select id="themeMode">

              <option
                value="dark"
                ${
                  state.theme.mode === "dark"
                    ? "selected"
                    : ""
                }
              >
                تیره
              </option>

              <option
                value="light"
                ${
                  state.theme.mode === "light"
                    ? "selected"
                    : ""
                }
              >
                روشن
              </option>

            </select>

          </div>

          <div class="field">

            <label>Accent</label>

            <input
              id="accent"
              type="color"
              value="${state.theme.accent}"
            >

          </div>

          <div class="field">

            <label>گردی کارت‌ها</label>

            <input
              id="radius"
              type="range"
              min="4"
              max="32"
              value="${state.theme.radius}"
            >

          </div>

          <div class="field">

            <label>تراکم</label>

            <select id="density">

              <option
                value="comfortable"
                ${
                  state.theme.density === "comfortable"
                    ? "selected"
                    : ""
                }
              >
                راحت
              </option>

              <option
                value="compact"
                ${
                  state.theme.density === "compact"
                    ? "selected"
                    : ""
                }
              >
                فشرده
              </option>

            </select>

          </div>

        </section>

        <div class="section-head">
          <h2>ماژول‌ها</h2>
        </div>

        <section class="panel module-editor">

          ${
            state.modules.map((m, i) => `
              <div
                class="editor-row"
                data-editor-id="${m.id}"
              >

                <input
                  class="module-visible"
                  type="checkbox"
                  ${m.visible !== false ? "checked" : ""}
                >

                <div>

                  <input
                    class="module-title"
                    value="${esc(m.title)}"
                    style="
                      width:100%;
                      padding:9px;
                      border-radius:9px;
                      border:1px solid var(--border);
                      background:var(--surface);
                      color:var(--text)
                    "
                  >

                  <div class="row-sub">
                    ${esc(m.emoji)}
                    ${esc(m.id)}
                  </div>

                </div>

                <div class="editor-actions">

                  <button
                    class="mini"
                    data-move="up"
                    data-id="${m.id}"
                    ${i === 0 ? "disabled" : ""}
                  >
                    ↑
                  </button>

                  <button
                    class="mini"
                    data-move="down"
                    data-id="${m.id}"
                    ${
                      i === state.modules.length - 1
                        ? "disabled"
                        : ""
                    }
                  >
                    ↓
                  </button>

                </div>

              </div>
            `).join("")
          }

        </section>

        <div
          class="toolbar"
          style="margin-top:18px"
        >

          <button
            class="primary-btn"
            data-action="save-studio"
          >
            ذخیره تغییرات
          </button>

          <button
            class="ghost-btn"
            data-action="export"
          >
            خروجی JSON
          </button>

        </div>

      </main>

      ${bottomNav()}
    `;
  }

  // =========================
  // OTHER MODULES
  // =========================

  function genericModule(id) {
    const m =
      state.modules.find(
        x => x.id === id
      );

    return `
      ${topbar(
        `${m?.emoji || "◼"} ${m?.title || id}`
      )}

      <main class="page">

        <section class="hero">

          <h1>
            ${esc(m?.title || id)}
          </h1>

          <p>
            این ماژول هنوز در مرحله توسعه Core قرار دارد.
          </p>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // =========================
  // RENDER
  // =========================

  function render() {
    applyTheme();

    let html;

    if (route === "home") {
      html = home();
    }

    else if (route === "repairs") {
      html = repairsPage();
    }

    else if (route === "repair-new") {
      html = repairForm();
    }

    else if (route === "repair-edit") {
      const r =
        state.repairs.find(
          x => x.id === routeArg
        );

      html =
        r
          ? repairForm(r)
          : repairsPage();
    }

    else if (route === "repair-detail") {
      const r =
        state.repairs.find(
          x => x.id === routeArg
        );

      html =
        r
          ? repairDetail(r)
          : repairsPage();
    }

    else if (route === "customers") {
      html = customersPage();
    }

    else if (route === "customer-new") {
      html = customerForm();
    }

    else if (route === "customer-edit") {
      const c =
        state.customers.find(
          x => x.id === routeArg
        );

      html =
        c
          ? customerForm(c)
          : customersPage();
    }

    else if (route === "customer-detail") {
      const c =
        state.customers.find(
          x => x.id === routeArg
        );

      html =
        c
          ? customerDetail(c)
          : customersPage();
    }

    else if (route === "vehicle-new") {
      html =
        vehicleForm(routeArg);
    }

    else if (route === "activity") {
      html = activity();
    }

    else if (route === "studio") {
      html = studio();
    }

    else if (
      route.startsWith("module:")
    ) {
      html =
        genericModule(
          route.split(":")[1]
        );
    }

    else {
      route = "home";
      routeArg = null;
      html = home();
    }

    document.getElementById(
      "app"
    ).innerHTML = `
      <div class="shell">
        ${html}
      </div>
    `;
  }

  // =========================
  // EVENTS
  // =========================

  document.addEventListener(
    "click",
    e => {
      const routeEl =
        e.target.closest(
          "[data-route]"
        );

      if (routeEl) {
        const next =
          routeEl.dataset.route;

        if (next !== route) {
          navigate(next);
        }

        return;
      }

      const moduleEl =
        e.target.closest(
          "[data-module]"
        );

      if (moduleEl) {
        const id =
          moduleEl.dataset.module;

        if (id === "repairs") {
          navigate("repairs");
        }

        else if (
          id === "customers"
        ) {
          navigate("customers");
        }

        else {
          navigate(
            `module:${id}`
          );
        }

        return;
      }

      const repairEl =
        e.target.closest(
          "[data-repair-id]"
        );

      if (repairEl) {
        navigate(
          "repair-detail",
          repairEl.dataset.repairId
        );

        return;
      }

      const customerEl =
        e.target.closest(
          "[data-customer-id]"
        );

      if (customerEl) {
        navigate(
          "customer-detail",
          customerEl.dataset.customerId
        );

        return;
      }

      const moveEl =
        e.target.closest(
          "[data-move]"
        );

      if (moveEl) {
        const idx =
          state.modules.findIndex(
            x =>
              x.id ===
              moveEl.dataset.id
          );

        const next =
          moveEl.dataset.move === "up"
            ? idx - 1
            : idx + 1;

        if (
          idx >= 0 &&
          next >= 0 &&
          next < state.modules.length
        ) {
          [
            state.modules[idx],
            state.modules[next]
          ] = [
            state.modules[next],
            state.modules[idx]
          ];

          saveState("");
          render();
        }

        return;
      }

      const a =
        e.target.closest(
          "[data-action]"
        );

      if (!a) return;

      const action =
        a.dataset.action;

      const id =
        a.dataset.id;

      if (action === "back") {
        goBack();
        return;
      }

      if (
        action === "toggle-theme"
      ) {
        state.theme.mode =
          state.theme.mode === "dark"
            ? "light"
            : "dark";

        saveState("");
        render();

        return;
      }

      // REPAIRS

      if (
        action === "new-repair"
      ) {
        navigate("repair-new");
        return;
      }

      if (
        action === "edit-repair"
      ) {
        navigate(
          "repair-edit",
          id
        );

        return;
      }

      if (
        action === "save-repair"
      ) {
        const r =
          collectRepair(id);

        const idx =
          state.repairs.findIndex(
            x => x.id === r.id
          );

        if (idx >= 0) {
          state.repairs[idx] = r;
        } else {
          state.repairs.push(r);
        }

        saveState(
          "پرونده ذخیره شد"
        );

        navigate(
          "repair-detail",
          r.id,
          {
            replace: true
          }
        );

        return;
      }

      if (
        action === "delete-repair"
      ) {
        if (
          confirm(
            "این پرونده حذف شود؟"
          )
        ) {
          state.repairs =
            state.repairs.filter(
              r => r.id !== id
            );

          saveState(
            "پرونده حذف شد"
          );

          navigate(
            "repairs",
            null,
            {
              replace: true
            }
          );
        }

        return;
      }

      if (
        action === "start-timer"
      ) {
        const r =
          state.repairs.find(
            x => x.id === id
          );

        if (
          r &&
          !r.timerRunning
        ) {
          r.timerRunning = true;
          r.timerStartedAt =
            nowIso();
          r.updatedAt =
            nowIso();

          saveState("");
          render();
        }

        return;
      }

      if (
        action === "pause-timer"
      ) {
        const r =
          state.repairs.find(
            x => x.id === id
          );

        if (
          r &&
          r.timerRunning
        ) {
          r.elapsedSeconds =
            getElapsedSeconds(r);

          r.timerRunning = false;
          r.timerStartedAt = null;
          r.updatedAt = nowIso();

          saveState("");
          render();
        }

        return;
      }

      if (
        action === "mark-ready"
      ) {
        const r =
          state.repairs.find(
            x => x.id === id
          );

        if (r) {
          r.status = "ready";
          r.updatedAt = nowIso();

          saveState(
            "آماده تحویل شد"
          );

          render();
        }

        return;
      }

      // CUSTOMERS

      if (
        action === "new-customer"
      ) {
        navigate(
          "customer-new"
        );

        return;
      }

      if (
        action === "edit-customer"
      ) {
        navigate(
          "customer-edit",
          id
        );

        return;
      }

      if (
        action === "save-customer"
      ) {
        const name =
          document.getElementById(
            "customerName"
          ).value.trim();

        if (!name) {
          alert(
            "نام مشتری را وارد کن."
          );

          return;
        }

        const c =
          collectCustomer(id);

        const idx =
          state.customers.findIndex(
            x => x.id === c.id
          );

        if (idx >= 0) {
          state.customers[idx] = c;
        } else {
          state.customers.push(c);
        }

        saveState(
          "مشتری ذخیره شد"
        );

        navigate(
          "customer-detail",
          c.id,
          {
            replace: true
          }
        );

        return;
      }

      if (
        action === "delete-customer"
      ) {
        if (
          confirm(
            "این مشتری حذف شود؟"
          )
        ) {
          state.customers =
            state.customers.filter(
              c => c.id !== id
            );

          state.vehicles =
            state.vehicles.filter(
              v =>
                v.customerId !== id
            );

          saveState(
            "مشتری حذف شد"
          );

          navigate(
            "customers",
            null,
            {
              replace: true
            }
          );
        }

        return;
      }

      if (
        action === "new-vehicle"
      ) {
        navigate(
          "vehicle-new",
          id
        );

        return;
      }

      if (
        action === "save-vehicle"
      ) {
        const v = {
          id: uid("v"),
          customerId: id,

          brand:
            document.getElementById(
              "vehicleBrand"
            ).value.trim(),

          model:
            document.getElementById(
              "vehicleModel"
            ).value.trim(),

          year:
            document.getElementById(
              "vehicleYear"
            ).value.trim(),

          plate:
            document.getElementById(
              "vehiclePlate"
            ).value.trim(),

          createdAt:
            nowIso(),

          updatedAt:
            nowIso()
        };

        state.vehicles.push(v);

        saveState(
          "خودرو ذخیره شد"
        );

        navigate(
          "customer-detail",
          id,
          {
            replace: true
          }
        );

        return;
      }

      // STUDIO

      if (
        action === "save-studio"
      ) {
        state.workspace.name =
          document.getElementById(
            "workspaceName"
          ).value.trim() ||
          DEFAULT.workspace.name;

        state.workspace.subtitle =
          document.getElementById(
            "workspaceSubtitle"
          ).value.trim() ||
          DEFAULT.workspace.subtitle;

        state.theme.mode =
          document.getElementById(
            "themeMode"
          ).value;

        state.theme.accent =
          document.getElementById(
            "accent"
          ).value;

        state.theme.radius =
          Number(
            document.getElementById(
              "radius"
            ).value
          );

        state.theme.density =
          document.getElementById(
            "density"
          ).value;

        document
          .querySelectorAll(
            "[data-editor-id]"
          )
          .forEach(row => {
            const m =
              state.modules.find(
                x =>
                  x.id ===
                  row.dataset.editorId
              );

            if (m) {
              m.title =
                row
                  .querySelector(
                    ".module-title"
                  )
                  .value.trim() ||
                m.title;

              m.visible =
                row.querySelector(
                  ".module-visible"
                ).checked;
            }
          });

        saveState(
          "تغییرات Studio ذخیره شد"
        );

        render();

        return;
      }

      if (
        action === "export"
      ) {
        const blob =
          new Blob(
            [
              JSON.stringify(
                state,
                null,
                2
              )
            ],
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

        link.href = url;
        link.download =
          "farmandeh-V1-data.json";

        link.click();

        URL.revokeObjectURL(
          url
        );
      }
    }
  );

  document.addEventListener(
    "input",
    e => {
      if (
        e.target.id ===
        "repairSearch"
      ) {
        const list =
          document.getElementById(
            "repairList"
          );

        if (list) {
          list.innerHTML =
            renderRepairRows(
              repairList()
            );
        }
      }

      if (
        e.target.id ===
        "customerSearch"
      ) {
        const q =
          e.target.value
            .trim()
            .toLowerCase();

        const filtered =
          state.customers.filter(
            c =>
              [
                c.customerNo,
                c.name,
                c.phone
              ].some(v =>
                String(v || "")
                  .toLowerCase()
                  .includes(q)
              )
          );

        const list =
          document.getElementById(
            "customerList"
          );

        if (list) {
          list.innerHTML =
            customerRows(
              filtered
            );
        }
      }

      if (
        e.target.id === "accent"
      ) {
        document.documentElement.style.setProperty(
          "--accent",
          e.target.value
        );
      }

      if (
        e.target.id === "radius"
      ) {
        document.documentElement.style.setProperty(
          "--radius",
          `${e.target.value}px`
        );
      }
    }
  );

  // =========================
  // HISTORY / BACK
  // =========================

  history.replaceState(
    {
      farmandeh: true,
      route: "home",
      routeArg: null
    },
    ""
  );

  window.addEventListener(
    "popstate",
    event => {
      if (
        event.state &&
        event.state.farmandeh
      ) {
        navigate(
          event.state.route ||
            "home",

          event.state.routeArg ||
            null,

          {
            fromPop: true
          }
        );
      }
    }
  );

  render();

  console.log(
    "Farmandeh Runtime V1.1 loaded"
  );
})();
