(() => {
  "use strict";

  const STORAGE_KEY = "farmandeh-runtime-V1";

  const DEFAULT = {
    version: "1.2",

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
        description: "پروفایل مشتری، خودروها و تاریخچه تعمیرات",
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
  let toastTimer = null;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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

  function uid(prefix = "id") {
    return (
      prefix +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 9)
    );
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("fa-IR");
  }

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return clone(DEFAULT);
      }

      const saved = JSON.parse(raw);

      return {
        ...clone(DEFAULT),
        ...saved,

        workspace: {
          ...clone(DEFAULT.workspace),
          ...(saved.workspace || {})
        },

        theme: {
          ...clone(DEFAULT.theme),
          ...(saved.theme || {})
        },

        modules:
          Array.isArray(saved.modules) && saved.modules.length
            ? saved.modules
            : clone(DEFAULT.modules),

        repairs:
          Array.isArray(saved.repairs)
            ? saved.repairs
            : [],

        customers:
          Array.isArray(saved.customers)
            ? saved.customers
            : [],

        vehicles:
          Array.isArray(saved.vehicles)
            ? saved.vehicles
            : []
      };
    } catch (error) {
      console.error("Farmandeh load error:", error);
      return clone(DEFAULT);
    }
  }

  function saveState(message = "") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    if (message) {
      toast(message);
    }
  }

  function toast(message) {
    document
      .querySelector(".toast")
      ?.remove();

    clearTimeout(toastTimer);

    const element =
      document.createElement("div");

    element.className = "toast";
    element.textContent = message;

    document.body.appendChild(element);

    toastTimer = setTimeout(
      () => element.remove(),
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

  // ======================================================
  // NAVIGATION
  // ======================================================

  function navigate(
    nextRoute,
    arg = null,
    options = {}
  ) {
    const {
      replace = false,
      fromPop = false
    } = options;

    route = nextRoute;
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

  // ======================================================
  // COMMON UI
  // ======================================================

  function topbar(title) {
    return `
      <header class="topbar">

        ${
          route !== "home"
            ? `
              <button
                class="icon-btn"
                data-action="back"
                aria-label="بازگشت"
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
          🏠
          <br>
          <small>خانه</small>
        </button>

        <button
          class="nav-btn ${route === "activity" ? "active" : ""}"
          data-route="activity"
        >
          📊
          <br>
          <small>فعالیت</small>
        </button>

        <button
          class="nav-btn ${route === "studio" ? "active" : ""}"
          data-route="studio"
        >
          🎛️
          <br>
          <small>استودیو</small>
        </button>

      </nav>
    `;
  }

  function field(
    id,
    label,
    value = "",
    type = "text"
  ) {
    return `
      <div class="field">

        <label>
          ${label}
        </label>

        <input
          id="${id}"
          type="${type}"
          value="${esc(value)}"
        >

      </div>
    `;
  }

  function detailRow(label, value) {
    return `
      <div class="row">

        <div class="row-main">

          <div class="row-title">
            ${esc(label)}
          </div>

          <div class="row-sub">
            ${esc(value || "—")}
          </div>

        </div>

      </div>
    `;
  }

  // ======================================================
  // DATA HELPERS
  // ======================================================

  function customerRepairs(customer) {
    return state.repairs.filter(repair => {
      if (
        repair.customerId &&
        repair.customerId === customer.id
      ) {
        return true;
      }

      if (
        customer.phone &&
        repair.customerPhone &&
        normalizeText(customer.phone) ===
          normalizeText(repair.customerPhone)
      ) {
        return true;
      }

      return (
        customer.name &&
        repair.customerName &&
        normalizeText(customer.name) ===
          normalizeText(repair.customerName)
      );
    });
  }

  function customerVehicles(customerId) {
    return state.vehicles.filter(
      vehicle =>
        vehicle.customerId === customerId
    );
  }

  function findCustomer(
    name,
    phone
  ) {
    const normalizedPhone =
      normalizeText(phone);

    const normalizedName =
      normalizeText(name);

    return state.customers.find(customer => {
      if (
        normalizedPhone &&
        normalizeText(customer.phone) ===
          normalizedPhone
      ) {
        return true;
      }

      return (
        normalizedName &&
        normalizeText(customer.name) ===
          normalizedName
      );
    });
  }

  function ensureCustomerForRepair(repair) {
    const name =
      String(
        repair.customerName || ""
      ).trim();

    const phone =
      String(
        repair.customerPhone || ""
      ).trim();

    if (!name && !phone) {
      return null;
    }

    let customer =
      findCustomer(
        name,
        phone
      );

    if (!customer) {
      customer = {
        id: uid("c"),

        customerNo:
          "C-" +
          Date.now()
            .toString(36)
            .toUpperCase(),

        name:
          name ||
          "مشتری بدون نام",

        phone,

        address: "",
        tags: "",
        notes: "",

        createdAt:
          nowIso(),

        updatedAt:
          nowIso()
      };

      state.customers.push(
        customer
      );
    } else {
      if (name) {
        customer.name = name;
      }

      if (phone) {
        customer.phone = phone;
      }

      customer.updatedAt =
        nowIso();
    }

    repair.customerId =
      customer.id;

    return customer;
  }

  function ensureVehicleForRepair(
    repair,
    customer
  ) {
    if (
      !customer ||
      !String(
        repair.vehicle || ""
      ).trim()
    ) {
      return null;
    }

    const model =
      String(
        repair.vehicle
      ).trim();

    let vehicle =
      state.vehicles.find(v => {
        return (
          v.customerId ===
            customer.id &&
          normalizeText(v.model) ===
            normalizeText(model)
        );
      });

    if (!vehicle) {
      vehicle = {
        id: uid("v"),
        customerId:
          customer.id,

        brand: "",
        model,

        year: "",
        plate: "",

        createdAt:
          nowIso(),

        updatedAt:
          nowIso()
      };

      state.vehicles.push(
        vehicle
      );
    }

    repair.vehicleId =
      vehicle.id;

    return vehicle;
  }

  function migrateExistingRepairsToCustomers() {
    let changed = false;

    for (
      const repair of state.repairs
    ) {
      if (repair.customerId) {
        continue;
      }

      const customer =
        ensureCustomerForRepair(
          repair
        );

      if (customer) {
        ensureVehicleForRepair(
          repair,
          customer
        );

        changed = true;
      }
    }

    if (changed) {
      saveState("");
    }
  }

  // ======================================================
  // HOME / COMMAND CENTER
  // ======================================================

  function repairStats() {
    const open =
      state.repairs.filter(
        repair =>
          ![
            "delivered",
            "cancelled"
          ].includes(
            repair.status
          )
      ).length;

    const ready =
      state.repairs.filter(
        repair =>
          repair.status ===
          "ready"
      ).length;

    const returned =
      state.repairs.filter(
        repair =>
          repair.isReturn
      ).length;

    return {
      open,
      ready,
      returned,
      total:
        state.repairs.length
    };
  }

  function home() {
    const stats =
      repairStats();

    const modules =
      state.modules.filter(
        module =>
          module.visible !== false
      );

    return `
      ${topbar()}

      <main class="page">

        <section class="hero">

          <div class="badge">
            Runtime V1.2 • Repairs + Customers
          </div>

          <h1>
            ${esc(state.workspace.name)}
          </h1>

          <p>
            هسته واقعی تعمیرات و مشتریان فعال است.
            Back، ذخیره‌سازی، ارتباط مشتری و تعمیر فعال هستند.
          </p>

          <div class="stats">

            <div class="stat">
              <b>${stats.open}</b>
              <span>تعمیر باز</span>
            </div>

            <div class="stat">
              <b>${stats.ready}</b>
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

            <h2>
              Command Center
            </h2>

            <small>
              ماژول‌ها
            </small>

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
            modules
              .map(module => {
                let badge =
                  "ماژول";

                if (
                  module.id ===
                  "repairs"
                ) {
                  badge =
                    `${stats.total} پرونده`;
                }

                if (
                  module.id ===
                  "customers"
                ) {
                  badge =
                    `${state.customers.length} مشتری`;
                }

                return `
                  <article
                    class="card clickable"
                    data-module="${esc(module.id)}"
                  >

                    <div class="emoji">
                      ${esc(module.emoji)}
                    </div>

                    <h3>
                      ${esc(module.title)}
                    </h3>

                    <p>
                      ${esc(module.description)}
                    </p>

                    <div class="card-footer">

                      <span class="badge">
                        ${badge}
                      </span>

                      <span>
                        ←
                      </span>

                    </div>

                  </article>
                `;
              })
              .join("")
          }

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // ======================================================
  // REPAIRS
  // ======================================================

  function statusLabel(status) {
    return (
      {
        intake:
          "پذیرش",

        diagnosing:
          "عیب‌یابی",

        diagnosis:
          "عیب‌یابی",

        repairing:
          "در حال تعمیر",

        waiting_part:
          "منتظر قطعه",

        testing:
          "تست",

        ready:
          "آماده تحویل",

        delivered:
          "تحویل شده",

        cancelled:
          "لغو شده"
      }[status] || status
    );
  }

  function getElapsedSeconds(
    repair
  ) {
    let seconds =
      Number(
        repair.elapsedSeconds ||
          0
      );

    if (
      repair.timerRunning &&
      repair.timerStartedAt
    ) {
      seconds += Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            new Date(
              repair.timerStartedAt
            ).getTime()
          ) / 1000
        )
      );
    }

    return seconds;
  }

  function formatDuration(
    seconds
  ) {
    seconds =
      Math.floor(
        seconds || 0
      );

    const hours =
      Math.floor(
        seconds / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) /
          60
      );

    const remaining =
      seconds % 60;

    return (
      String(hours).padStart(
        2,
        "0"
      ) +
      ":" +
      String(minutes).padStart(
        2,
        "0"
      ) +
      ":" +
      String(remaining).padStart(
        2,
        "0"
      )
    );
  }

  function repairList() {
    const search =
      (
        document.getElementById(
          "repairSearch"
        )?.value || ""
      )
        .trim()
        .toLowerCase();

    return state.repairs.filter(
      repair => {
        if (!search) {
          return true;
        }

        return [
          repair.repairNo,
          repair.customerName,
          repair.customerPhone,
          repair.vehicle,
          repair.device,
          repair.fault,
          repair.technician,
          statusLabel(
            repair.status
          )
        ].some(value =>
          String(value || "")
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }

  function renderRepairRows(
    repairs
  ) {
    if (!repairs.length) {
      return `
        <div class="empty">
          هنوز پرونده‌ای ثبت نشده است.
        </div>
      `;
    }

    return repairs
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
      .map(repair => {
        const elapsed =
          getElapsedSeconds(
            repair
          );

        return `
          <div
            class="row clickable"
            data-repair-id="${esc(repair.id)}"
          >

            <div class="row-main">

              <div class="row-title">
                ${esc(repair.repairNo || "بدون شماره")}
                •
                ${esc(repair.device || "دستگاه")}
              </div>

              <div class="row-sub">
                ${esc(repair.customerName || "بدون مشتری")}
                •
                ${esc(repair.vehicle || "بدون خودرو")}
                •
                ${esc(statusLabel(repair.status))}
              </div>

              <div class="row-sub">

                ${
                  elapsed
                    ? `⏱ ${formatDuration(elapsed)}`
                    : ""
                }

                ${
                  repair.isReturn
                    ? " • 🔁 برگشتی"
                    : ""
                }

              </div>

            </div>

            <span>
              ‹
            </span>

          </div>
        `;
      })
      .join("");
  }

  function repairsPage() {
    const stats =
      repairStats();

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
            پذیرش، ویرایش، جستجو،
            تایمر، وضعیت و سابقه.
          </p>

          <div class="stats">

            <div class="stat">
              <b>${stats.total}</b>
              <span>کل پرونده</span>
            </div>

            <div class="stat">
              <b>${stats.open}</b>
              <span>باز</span>
            </div>

            <div class="stat">
              <b>${stats.ready}</b>
              <span>آماده</span>
            </div>

          </div>

        </section>

        <div class="section-head">

          <div>

            <h2>
              پرونده‌ها
            </h2>

            <small>
              ذخیره دائمی
            </small>

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

  function repairForm(
    repair = null
  ) {
    const value =
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
                Real Repair Record
              </small>

            </div>

          </div>

          <div class="form-grid">

            ${field(
              "repairNo",
              "شماره تعمیر",
              value.repairNo
            )}

            ${field(
              "repairCustomerName",
              "نام مشتری",
              value.customerName
            )}

            ${field(
              "repairCustomerPhone",
              "تلفن",
              value.customerPhone,
              "tel"
            )}

            ${field(
              "repairVehicle",
              "خودرو",
              value.vehicle
            )}

            ${field(
              "repairDevice",
              "دستگاه / مدل",
              value.device
            )}

            ${field(
              "repairTechnician",
              "تکنسین",
              value.technician
            )}

            <div class="field">

              <label>
                وضعیت
              </label>

              <select id="repairStatus">

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
                    .map(status => `
                      <option
                        value="${status}"
                        ${
                          value.status === status
                            ? "selected"
                            : ""
                        }
                      >
                        ${statusLabel(status)}
                      </option>
                    `)
                    .join("")
                }

              </select>

            </div>

            ${field(
              "repairCost",
              "هزینه کل",
              value.cost,
              "number"
            )}

            ${field(
              "repairPaid",
              "پرداخت شده",
              value.paid,
              "number"
            )}

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              شرح عیب
            </label>

            <textarea
              id="repairFault"
              rows="4"
            >${esc(value.fault)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              تشخیص فنی
            </label>

            <textarea
              id="repairDiagnosis"
              rows="4"
            >${esc(value.diagnosis)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              قطعات مصرفی
            </label>

            <textarea
              id="repairParts"
              rows="3"
            >${esc(value.partsUsed)}</textarea>

          </div>

          <div
            class="field"
            style="margin-top:12px"
          >

            <label>
              یادداشت
            </label>

            <textarea
              id="repairNotes"
              rows="3"
            >${esc(value.notes)}</textarea>

          </div>

          <label
            class="switch"
            style="margin-top:14px"
          >

            <input
              type="checkbox"
              id="repairReturn"
              ${
                value.isReturn
                  ? "checked"
                  : ""
              }
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
              data-id="${esc(value.id)}"
            >
              ذخیره پرونده
            </button>

            ${
              repair
                ? `
                  <button
                    class="danger-btn"
                    data-action="delete-repair"
                    data-id="${esc(value.id)}"
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

  function collectRepair(
    id
  ) {
    const old =
      state.repairs.find(
        repair =>
          repair.id === id
      );

    return {
      ...(old || {}),

      id:
        old?.id ||
        uid("r"),

      repairNo:
        document
          .getElementById(
            "repairNo"
          )
          .value
          .trim(),

      customerName:
        document
          .getElementById(
            "repairCustomerName"
          )
          .value
          .trim(),

      customerPhone:
        document
          .getElementById(
            "repairCustomerPhone"
          )
          .value
          .trim(),

      vehicle:
        document
          .getElementById(
            "repairVehicle"
          )
          .value
          .trim(),

      device:
        document
          .getElementById(
            "repairDevice"
          )
          .value
          .trim(),

      technician:
        document
          .getElementById(
            "repairTechnician"
          )
          .value
          .trim(),

      status:
        document
          .getElementById(
            "repairStatus"
          )
          .value,

      cost:
        Number(
          document
            .getElementById(
              "repairCost"
            )
            .value || 0
        ),

      paid:
        Number(
          document
            .getElementById(
              "repairPaid"
            )
            .value || 0
        ),

      fault:
        document
          .getElementById(
            "repairFault"
          )
          .value
          .trim(),

      diagnosis:
        document
          .getElementById(
            "repairDiagnosis"
          )
          .value
          .trim(),

      partsUsed:
        document
          .getElementById(
            "repairParts"
          )
          .value
          .trim(),

      notes:
        document
          .getElementById(
            "repairNotes"
          )
          .value
          .trim(),

      isReturn:
        document
          .getElementById(
            "repairReturn"
          )
          .checked,

      createdAt:
        old?.createdAt ||
        nowIso(),

      updatedAt:
        nowIso(),

      elapsedSeconds:
        Number(
          old?.elapsedSeconds ||
            0
        ),

      timerRunning:
        Boolean(
          old?.timerRunning
        ),

      timerStartedAt:
        old?.timerStartedAt ||
        null
    };
  }

  function repairDetail(
    repair
  ) {
    const elapsed =
      getElapsedSeconds(
        repair
      );

    return `
      ${topbar(
        `تعمیر ${
          repair.repairNo ||
          ""
        }`
      )}

      <main class="page">

        <section class="hero">

          <div class="badge">
            ${esc(statusLabel(repair.status))}
          </div>

          <h1>
            ${esc(repair.device || "دستگاه")}
          </h1>

          <p>
            ${esc(repair.customerName || "بدون نام")}
            •
            ${esc(repair.vehicle || "بدون خودرو")}
          </p>

          <div class="stats">

            <div class="stat">
              <b>
                ${formatDuration(elapsed)}
              </b>
              <span>
                زمان تعمیر
              </span>
            </div>

            <div class="stat">
              <b>
                ${formatMoney(repair.cost)}
              </b>
              <span>
                هزینه
              </span>
            </div>

            <div class="stat">
              <b>
                ${formatMoney(
                  Number(repair.cost || 0) -
                  Number(repair.paid || 0)
                )}
              </b>
              <span>
                مانده
              </span>
            </div>

          </div>

        </section>

        <div class="section-head">
          <h2>
            عملیات
          </h2>
        </div>

        <section class="toolbar">

          <button
            class="primary-btn"
            data-action="${
              repair.timerRunning
                ? "pause-timer"
                : "start-timer"
            }"
            data-id="${repair.id}"
          >

            ${
              repair.timerRunning
                ? "⏸ توقف تایمر"
                : "▶ شروع تایمر"
            }

          </button>

          <button
            class="ghost-btn"
            data-action="edit-repair"
            data-id="${repair.id}"
          >
            ✏️ ویرایش
          </button>

          <button
            class="ghost-btn"
            data-action="mark-ready"
            data-id="${repair.id}"
          >
            ✅ آماده تحویل
          </button>

        </section>

        <div class="section-head">
          <h2>
            اطلاعات پرونده
          </h2>
        </div>

        <section class="list">

          ${detailRow("مشتری", repair.customerName)}
          ${detailRow("تلفن", repair.customerPhone)}
          ${detailRow("خودرو", repair.vehicle)}
          ${detailRow("دستگاه", repair.device)}
          ${detailRow("تکنسین", repair.technician)}
          ${detailRow("شرح عیب", repair.fault)}
          ${detailRow("تشخیص", repair.diagnosis)}
          ${detailRow("قطعات مصرفی", repair.partsUsed)}
          ${detailRow("وضعیت", statusLabel(repair.status))}
          ${detailRow("برگشتی", repair.isReturn ? "بله" : "خیر")}
          ${detailRow("یادداشت", repair.notes)}

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // ======================================================
  // CUSTOMERS
  // ======================================================

  function customerRows(
    customers
  ) {
    if (!customers.length) {
      return `
        <div class="empty">
          هنوز مشتری ثبت نشده است.
        </div>
      `;
    }

    return customers
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
      .map(customer => {
        const repairs =
          customerRepairs(
            customer
          );

        const vehicles =
          customerVehicles(
            customer.id
          );

        return `
          <div
            class="row clickable"
            data-customer-id="${esc(customer.id)}"
          >

            <div class="row-main">

              <div class="row-title">
                ${esc(customer.name || "بدون نام")}
              </div>

              <div class="row-sub">
                ${esc(customer.phone || "بدون تلفن")}
              </div>

              <div class="row-sub">
                ${repairs.length} تعمیر
                •
                ${vehicles.length} خودرو
              </div>

            </div>

            <span>
              ‹
            </span>

          </div>
        `;
      })
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

          <h1>
            مشتریان
          </h1>

          <p>
            پروفایل مشتری، خودروها
            و تاریخچه تعمیرات واقعی.
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

            <h2>
              لیست مشتریان
            </h2>

            <small>
              Customer Core
            </small>

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

  function customerForm(
    customer = null
  ) {
    const value =
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
              value.customerNo
            )}

            ${field(
              "customerName",
              "نام مشتری",
              value.name
            )}

            ${field(
              "customerPhone",
              "تلفن",
              value.phone,
              "tel"
            )}

            ${field(
              "customerAddress",
              "آدرس",
              value.address
            )}

          </div>

          <div
            style="margin-top:12px"
          >
            ${field(
              "customerTags",
              "برچسب‌ها",
              value.tags
            )}
          </div>

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
            >${esc(value.notes)}</textarea>

          </div>

          <div
            class="toolbar"
            style="margin-top:18px"
          >

            <button
              class="primary-btn"
              data-action="save-customer"
              data-id="${esc(value.id)}"
            >
              ذخیره مشتری
            </button>

            ${
              customer
                ? `
                  <button
                    class="danger-btn"
                    data-action="delete-customer"
                    data-id="${esc(value.id)}"
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

  function collectCustomer(
    id
  ) {
    const old =
      state.customers.find(
        customer =>
          customer.id === id
      );

    return {
      ...(old || {}),

      id:
        old?.id ||
        uid("c"),

      customerNo:
        document
          .getElementById(
            "customerNo"
          )
          .value
          .trim(),

      name:
        document
          .getElementById(
            "customerName"
          )
          .value
          .trim(),

      phone:
        document
          .getElementById(
            "customerPhone"
          )
          .value
          .trim(),

      address:
        document
          .getElementById(
            "customerAddress"
          )
          .value
          .trim(),

      tags:
        document
          .getElementById(
            "customerTags"
          )
          .value
          .trim(),

      notes:
        document
          .getElementById(
            "customerNotes"
          )
          .value
          .trim(),

      createdAt:
        old?.createdAt ||
        nowIso(),

      updatedAt:
        nowIso()
    };
  }

  function customerDetail(
    customer
  ) {
    const vehicles =
      customerVehicles(
        customer.id
      );

    const repairs =
      customerRepairs(
        customer
      );

    return `
      ${topbar("پروفایل مشتری")}

      <main class="page">

        <section class="hero">

          <div class="badge">
            ${esc(customer.customerNo || "")}
          </div>

          <h1>
            ${esc(customer.name || "بدون نام")}
          </h1>

          <p>
            ${esc(customer.phone || "بدون تلفن")}
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
          <h2>
            عملیات
          </h2>
        </div>

        <section class="toolbar">

          <button
            class="primary-btn"
            data-action="edit-customer"
            data-id="${customer.id}"
          >
            ✏️ ویرایش
          </button>

          <button
            class="ghost-btn"
            data-action="new-vehicle"
            data-id="${customer.id}"
          >
            🚗 ثبت خودرو
          </button>

        </section>

        <div class="section-head">
          <h2>
            اطلاعات
          </h2>
        </div>

        <section class="list">

          ${detailRow("تلفن", customer.phone)}
          ${detailRow("آدرس", customer.address)}
          ${detailRow("برچسب‌ها", customer.tags)}
          ${detailRow("یادداشت", customer.notes)}

        </section>

        <div class="section-head">
          <h2>
            خودروها
          </h2>
        </div>

        <section class="list">

          ${
            vehicles.length
              ? vehicles
                  .map(vehicle => `
                    <div class="row">

                      <div class="row-main">

                        <div class="row-title">

                          ${esc(
                            [
                              vehicle.brand,
                              vehicle.model
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                            "خودرو"
                          )}

                        </div>

                        <div class="row-sub">

                          ${
                            vehicle.plate
                              ? `پلاک: ${esc(vehicle.plate)}`
                              : "بدون پلاک"
                          }

                        </div>

                      </div>

                    </div>
                  `)
                  .join("")
              : `
                <div class="empty">
                  خودرویی ثبت نشده است.
                </div>
              `
          }

        </section>

        <div class="section-head">
          <h2>
            سوابق تعمیر
          </h2>
        </div>

        <section class="list">

          ${
            repairs.length
              ? repairs
                  .map(repair => `
                    <div
                      class="row clickable"
                      data-repair-id="${repair.id}"
                    >

                      <div class="row-main">

                        <div class="row-title">
                          ${esc(repair.repairNo || "بدون شماره")}
                        </div>

                        <div class="row-sub">
                          ${esc(repair.device || "دستگاه")}
                        </div>

                        <div class="row-sub">
                          ${esc(statusLabel(repair.status))}
                        </div>

                      </div>

                      <span>
                        ‹
                      </span>

                    </div>
                  `)
                  .join("")
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

  function vehicleForm(
    customerId
  ) {
    return `
      ${topbar("ثبت خودرو")}

      <main class="page">

        <section class="panel">

          <div class="section-head">
            <h2>
              خودروی مشتری
            </h2>
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

  // ======================================================
  // ACTIVITY
  // ======================================================

  function activity() {
    const stats =
      repairStats();

    return `
      ${topbar("فعالیت")}

      <main class="page">

        <section class="hero">

          <h1>
            مرکز فعالیت
          </h1>

          <p>
            آمار واقعی داده‌های فعلی.
          </p>

        </section>

        <section class="grid">

          <div class="card">

            <div class="emoji">
              🛠️
            </div>

            <h3>
              ${stats.total}
            </h3>

            <p>
              کل تعمیرات
            </p>

          </div>

          <div class="card">

            <div class="emoji">
              ⏳
            </div>

            <h3>
              ${stats.open}
            </h3>

            <p>
              تعمیرات باز
            </p>

          </div>

          <div class="card">

            <div class="emoji">
              ✅
            </div>

            <h3>
              ${stats.ready}
            </h3>

            <p>
              آماده تحویل
            </p>

          </div>

          <div class="card">

            <div class="emoji">
              👥
            </div>

            <h3>
              ${state.customers.length}
            </h3>

            <p>
              مشتریان
            </p>

          </div>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // ======================================================
  // STUDIO
  // ======================================================

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
            تنظیم ظاهر، هویت،
            ترتیب و نمایش ماژول‌ها.
          </p>

        </section>

        <div class="section-head">
          <h2>
            هویت Workspace
          </h2>
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
          <h2>
            ظاهر
          </h2>
        </div>

        <section class="panel form-grid">

          <div class="field">

            <label>
              حالت
            </label>

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

            <label>
              Accent
            </label>

            <input
              id="accent"
              type="color"
              value="${state.theme.accent}"
            >

          </div>

          <div class="field">

            <label>
              گردی کارت‌ها
            </label>

            <input
              id="radius"
              type="range"
              min="4"
              max="32"
              value="${state.theme.radius}"
            >

          </div>

          <div class="field">

            <label>
              تراکم
            </label>

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
          <h2>
            ماژول‌ها
          </h2>
        </div>

        <section class="panel module-editor">

          ${
            state.modules
              .map(
                (module, index) => `
                  <div
                    class="editor-row"
                    data-editor-id="${module.id}"
                  >

                    <input
                      class="module-visible"
                      type="checkbox"
                      ${
                        module.visible !== false
                          ? "checked"
                          : ""
                      }
                    >

                    <div>

                      <input
                        class="module-title"
                        value="${esc(module.title)}"
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
                        ${esc(module.emoji)}
                        ${esc(module.id)}
                      </div>

                    </div>

                    <div class="editor-actions">

                      <button
                        class="mini"
                        data-move="up"
                        data-id="${module.id}"
                        ${
                          index === 0
                            ? "disabled"
                            : ""
                        }
                      >
                        ↑
                      </button>

                      <button
                        class="mini"
                        data-move="down"
                        data-id="${module.id}"
                        ${
                          index ===
                          state.modules.length -
                            1
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
              .join("")
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

  // ======================================================
  // GENERIC MODULES
  // ======================================================

  function genericModule(
    id
  ) {
    const module =
      state.modules.find(
        item =>
          item.id === id
      );

    return `
      ${topbar(
        `${module?.emoji || "◼"} ${
          module?.title || id
        }`
      )}

      <main class="page">

        <section class="hero">

          <h1>
            ${esc(module?.title || id)}
          </h1>

          <p>
            این ماژول در مرحله بعدی
            به Core عملیاتی تبدیل می‌شود.
          </p>

        </section>

      </main>

      ${bottomNav()}
    `;
  }

  // ======================================================
  // RENDER
  // ======================================================

  function render() {
    applyTheme();

    let html;

    if (route === "home") {
      html = home();
    }

    else if (
      route === "repairs"
    ) {
      html =
        repairsPage();
    }

    else if (
      route === "repair-new"
    ) {
      html =
        repairForm();
    }

    else if (
      route === "repair-edit"
    ) {
      const repair =
        state.repairs.find(
          item =>
            item.id ===
            routeArg
        );

      html =
        repair
          ? repairForm(
              repair
            )
          : repairsPage();
    }

    else if (
      route === "repair-detail"
    ) {
      const repair =
        state.repairs.find(
          item =>
            item.id ===
            routeArg
        );

      html =
        repair
          ? repairDetail(
              repair
            )
          : repairsPage();
    }

    else if (
      route === "customers"
    ) {
      html =
        customersPage();
    }

    else if (
      route === "customer-new"
    ) {
      html =
        customerForm();
    }

    else if (
      route === "customer-edit"
    ) {
      const customer =
        state.customers.find(
          item =>
            item.id ===
            routeArg
        );

      html =
        customer
          ? customerForm(
              customer
            )
          : customersPage();
    }

    else if (
      route === "customer-detail"
    ) {
      const customer =
        state.customers.find(
          item =>
            item.id ===
            routeArg
        );

      html =
        customer
          ? customerDetail(
              customer
            )
          : customersPage();
    }

    else if (
      route === "vehicle-new"
    ) {
      html =
        vehicleForm(
          routeArg
        );
    }

    else if (
      route === "activity"
    ) {
      html =
        activity();
    }

    else if (
      route === "studio"
    ) {
      html =
        studio();
    }

    else if (
      route.startsWith(
        "module:"
      )
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

    const app =
      document.getElementById(
        "app"
      );

    if (!app) {
      return;
    }

    app.innerHTML = `
      <div class="shell">
        ${html}
      </div>
    `;
  }

  // ======================================================
  // CLICK EVENTS
  // ======================================================

  document.addEventListener(
    "click",
    event => {
      const routeElement =
        event.target.closest(
          "[data-route]"
        );

      if (routeElement) {
        const next =
          routeElement.dataset.route;

        if (next !== route) {
          navigate(next);
        }

        return;
      }

      const moduleElement =
        event.target.closest(
          "[data-module]"
        );

      if (moduleElement) {
        const id =
          moduleElement.dataset.module;

        if (
          id === "repairs"
        ) {
          navigate(
            "repairs"
          );
        }

        else if (
          id === "customers"
        ) {
          navigate(
            "customers"
          );
        }

        else {
          navigate(
            `module:${id}`
          );
        }

        return;
      }

      const repairRow =
        event.target.closest(
          "[data-repair-id]"
        );

      if (repairRow) {
        navigate(
          "repair-detail",
          repairRow.dataset
            .repairId
        );

        return;
      }

      const customerRow =
        event.target.closest(
          "[data-customer-id]"
        );

      if (customerRow) {
        navigate(
          "customer-detail",
          customerRow.dataset
            .customerId
        );

        return;
      }

      const moveElement =
        event.target.closest(
          "[data-move]"
        );

      if (moveElement) {
        const index =
          state.modules.findIndex(
            item =>
              item.id ===
              moveElement.dataset.id
          );

        const target =
          moveElement.dataset.move ===
          "up"
            ? index - 1
            : index + 1;

        if (
          index >= 0 &&
          target >= 0 &&
          target <
            state.modules.length
        ) {
          [
            state.modules[index],
            state.modules[target]
          ] = [
            state.modules[target],
            state.modules[index]
          ];

          saveState("");
          render();
        }

        return;
      }

      const actionElement =
        event.target.closest(
          "[data-action]"
        );

      if (!actionElement) {
        return;
      }

      const action =
        actionElement.dataset.action;

      const id =
        actionElement.dataset.id;

      if (
        action === "back"
      ) {
        goBack();
        return;
      }

      if (
        action ===
        "toggle-theme"
      ) {
        state.theme.mode =
          state.theme.mode ===
          "dark"
            ? "light"
            : "dark";

        saveState("");
        render();

        return;
      }

      // --------------------------------
      // REPAIR ACTIONS
      // --------------------------------

      if (
        action ===
        "new-repair"
      ) {
        navigate(
          "repair-new"
        );

        return;
      }

      if (
        action ===
        "edit-repair"
      ) {
        navigate(
          "repair-edit",
          id
        );

        return;
      }

      if (
        action ===
        "save-repair"
      ) {
        const repair =
          collectRepair(
            id
          );

        const customer =
          ensureCustomerForRepair(
            repair
          );

        ensureVehicleForRepair(
          repair,
          customer
        );

        const index =
          state.repairs.findIndex(
            item =>
              item.id ===
              repair.id
          );

        if (index >= 0) {
          state.repairs[index] =
            repair;
        } else {
          state.repairs.push(
            repair
          );
        }

        saveState(
          "پرونده ذخیره شد"
        );

        navigate(
          "repair-detail",
          repair.id,
          {
            replace: true
          }
        );

        return;
      }

      if (
        action ===
        "delete-repair"
      ) {
        if (
          confirm(
            "این پرونده حذف شود؟"
          )
        ) {
          state.repairs =
            state.repairs.filter(
              repair =>
                repair.id !== id
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
        action ===
        "start-timer"
      ) {
        const repair =
          state.repairs.find(
            item =>
              item.id === id
          );

        if (
          repair &&
          !repair.timerRunning
        ) {
          repair.timerRunning =
            true;

          repair.timerStartedAt =
            nowIso();

          repair.updatedAt =
            nowIso();

          saveState("");
          render();
        }

        return;
      }

      if (
        action ===
        "pause-timer"
      ) {
        const repair =
          state.repairs.find(
            item =>
              item.id === id
          );

        if (
          repair &&
          repair.timerRunning
        ) {
          repair.elapsedSeconds =
            getElapsedSeconds(
              repair
            );

          repair.timerRunning =
            false;

          repair.timerStartedAt =
            null;

          repair.updatedAt =
            nowIso();

          saveState("");
          render();
        }

        return;
      }

      if (
        action ===
        "mark-ready"
      ) {
        const repair =
          state.repairs.find(
            item =>
              item.id === id
          );

        if (repair) {
          repair.status =
            "ready";

          repair.updatedAt =
            nowIso();

          saveState(
            "آماده تحویل شد"
          );

          render();
        }

        return;
      }

      // --------------------------------
      // CUSTOMER ACTIONS
      // --------------------------------

      if (
        action ===
        "new-customer"
      ) {
        navigate(
          "customer-new"
        );

        return;
      }

      if (
        action ===
        "edit-customer"
      ) {
        navigate(
          "customer-edit",
          id
        );

        return;
      }

      if (
        action ===
        "save-customer"
      ) {
        const name =
          document
            .getElementById(
              "customerName"
            )
            .value
            .trim();

        if (!name) {
          alert(
            "نام مشتری را وارد کن."
          );

          return;
        }

        const customer =
          collectCustomer(
            id
          );

        const index =
          state.customers.findIndex(
            item =>
              item.id ===
              customer.id
          );

        if (index >= 0) {
          state.customers[index] =
            customer;
        } else {
          state.customers.push(
            customer
          );
        }

        saveState(
          "مشتری ذخیره شد"
        );

        navigate(
          "customer-detail",
          customer.id,
          {
            replace: true
          }
        );

        return;
      }

      if (
        action ===
        "delete-customer"
      ) {
        const customer =
          state.customers.find(
            item =>
              item.id === id
          );

        const repairs =
          customer
            ? customerRepairs(
                customer
              )
            : [];

        if (
          repairs.length
        ) {
          alert(
            "این مشتری سابقه تعمیر دارد و حذف مستقیم مجاز نیست."
          );

          return;
        }

        if (
          confirm(
            "این مشتری حذف شود؟"
          )
        ) {
          state.customers =
            state.customers.filter(
              item =>
                item.id !== id
            );

          state.vehicles =
            state.vehicles.filter(
              vehicle =>
                vehicle.customerId !==
                id
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
        action ===
        "new-vehicle"
      ) {
        navigate(
          "vehicle-new",
          id
        );

        return;
      }

      if (
        action ===
        "save-vehicle"
      ) {
        const vehicle = {
          id:
            uid("v"),

          customerId:
            id,

          brand:
            document
              .getElementById(
                "vehicleBrand"
              )
              .value
              .trim(),

          model:
            document
              .getElementById(
                "vehicleModel"
              )
              .value
              .trim(),

          year:
            document
              .getElementById(
                "vehicleYear"
              )
              .value
              .trim(),

          plate:
            document
              .getElementById(
                "vehiclePlate"
              )
              .value
              .trim(),

          createdAt:
            nowIso(),

          updatedAt:
            nowIso()
        };

        state.vehicles.push(
          vehicle
        );

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

      // --------------------------------
      // STUDIO
      // --------------------------------

      if (
        action ===
        "save-studio"
      ) {
        state.workspace.name =
          document
            .getElementById(
              "workspaceName"
            )
            .value
            .trim() ||
          DEFAULT.workspace.name;

        state.workspace.subtitle =
          document
            .getElementById(
              "workspaceSubtitle"
            )
            .value
            .trim() ||
          DEFAULT.workspace.subtitle;

        state.theme.mode =
          document
            .getElementById(
              "themeMode"
            )
            .value;

        state.theme.accent =
          document
            .getElementById(
              "accent"
            )
            .value;

        state.theme.radius =
          Number(
            document
              .getElementById(
                "radius"
              )
              .value
          );

        state.theme.density =
          document
            .getElementById(
              "density"
            )
            .value;

        document
          .querySelectorAll(
            "[data-editor-id]"
          )
          .forEach(row => {
            const module =
              state.modules.find(
                item =>
                  item.id ===
                  row.dataset
                    .editorId
              );

            if (!module) {
              return;
            }

            module.title =
              row
                .querySelector(
                  ".module-title"
                )
                .value
                .trim() ||
              module.title;

            module.visible =
              row
                .querySelector(
                  ".module-visible"
                )
                .checked;
          });

        saveState(
          "تغییرات Studio ذخیره شد"
        );

        render();

        return;
      }

      if (
        action ===
        "export"
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
          "farmandeh-V1.2-data.json";

        link.click();

        URL.revokeObjectURL(
          url
        );
      }
    }
  );

  // ======================================================
  // INPUT EVENTS
  // ======================================================

  document.addEventListener(
    "input",
    event => {
      if (
        event.target.id ===
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
        event.target.id ===
        "customerSearch"
      ) {
        const search =
          event.target.value
            .trim()
            .toLowerCase();

        const customers =
          state.customers.filter(
            customer =>
              [
                customer.customerNo,
                customer.name,
                customer.phone
              ].some(value =>
                String(value || "")
                  .toLowerCase()
                  .includes(search)
              )
          );

        const list =
          document.getElementById(
            "customerList"
          );

        if (list) {
          list.innerHTML =
            customerRows(
              customers
            );
        }
      }

      if (
        event.target.id ===
        "accent"
      ) {
        document.documentElement.style.setProperty(
          "--accent",
          event.target.value
        );
      }

      if (
        event.target.id ===
        "radius"
      ) {
        document.documentElement.style.setProperty(
          "--radius",
          `${event.target.value}px`
        );
      }
    }
  );

  // ======================================================
  // BROWSER / ANDROID BACK
  // ======================================================

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

  // ======================================================
  // STARTUP
  // ======================================================

  migrateExistingRepairsToCustomers();

  render();

  console.log(
    "Farmandeh Runtime V1.2 loaded"
  );
})();
