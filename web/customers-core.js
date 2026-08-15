(() => {
  "use strict";

  if (!window.FarmandehDB) {
    console.error("FarmandehDB not found");
    return;
  }

  let customers = [];
  let currentCustomerId = null;

  const esc = v =>
    String(v ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[c]);

  function phone(c) {
    return Array.isArray(c.phones) && c.phones.length
      ? c.phones[0]
      : "";
  }

  function customerNo() {
    return "C-" + Date.now().toString(36).toUpperCase();
  }

  function topbar(title) {
    return `
      <header class="topbar">
        <button class="icon-btn" data-customer-action="back">→</button>

        <div class="brand">
          <div class="logo">👥</div>
          <div>
            <div class="brand-title">${esc(title)}</div>
            <div class="brand-sub">Customers Core</div>
          </div>
        </div>

        <div></div>
      </header>
    `;
  }

  function nav() {
    return `
      <nav class="bottom-nav">
        <button class="nav-btn" data-customer-action="home">
          🏠<br><small>خانه</small>
        </button>

        <button class="nav-btn active" data-customer-action="list">
          👥<br><small>مشتریان</small>
        </button>

        <button class="nav-btn" data-customer-action="new">
          ➕<br><small>جدید</small>
        </button>
      </nav>
    `;
  }

  function setHTML(html) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `<div class="shell">${html}</div>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pushCustomerHistory(view, id = null, replace = false) {
    const state = {
      farmandehCustomer: true,
      view,
      id
    };

    if (replace) {
      history.replaceState(state, "");
    } else {
      history.pushState(state, "");
    }
  }

  async function loadCustomers() {
    customers = await FarmandehDB.all("customers");

    customers.sort((a, b) =>
      String(b.updatedAt || "").localeCompare(
        String(a.updatedAt || "")
      )
    );
  }

  function rows(items) {
    if (!items.length) {
      return `<div class="empty">هنوز مشتری ثبت نشده است.</div>`;
    }

    return items.map(c => `
      <div class="row clickable" data-customer-id="${esc(c.id)}">
        <div class="row-main">
          <div class="row-title">${esc(c.name || "بدون نام")}</div>
          <div class="row-sub">${esc(phone(c) || "بدون تلفن")}</div>
          <div class="row-sub">${esc(c.customerNo || "")}</div>
        </div>
        <span>‹</span>
      </div>
    `).join("");
  }

  async function showList(addHistory = true) {
    await loadCustomers();

    setHTML(`
      ${topbar("مشتریان")}

      <main class="page">

        <section class="hero">
          <div class="badge">Real Customers Core</div>
          <h1>مشتریان</h1>
          <p>پروفایل، خودروها و سابقه تعمیرات واقعی.</p>

          <div class="stats">
            <div class="stat">
              <b>${customers.length}</b>
              <span>مشتری</span>
            </div>
          </div>
        </section>

        <div class="section-head">
          <div>
            <h2>لیست مشتریان</h2>
            <small>IndexedDB</small>
          </div>

          <button class="primary-btn" data-customer-action="new">
            + مشتری
          </button>
        </div>

        <section class="panel">

          <div class="field" style="margin-bottom:12px">
            <label>جستجو</label>
            <input
              id="customerSearch"
              placeholder="نام، تلفن، شماره مشتری..."
              autocomplete="off"
            >
          </div>

          <div id="customerList" class="list">
            ${rows(customers)}
          </div>

        </section>

      </main>

      ${nav()}
    `);

    currentCustomerId = null;

    if (addHistory) {
      pushCustomerHistory("list");
    }
  }

  function showForm(customer = null, addHistory = true) {
    const c = customer || {
      id: "",
      customerNo: customerNo(),
      name: "",
      phones: [],
      address: "",
      notes: ""
    };

    setHTML(`
      ${topbar(customer ? "ویرایش مشتری" : "مشتری جدید")}

      <main class="page">

        <section class="panel">

          <div class="section-head">
            <div>
              <h2>${customer ? "ویرایش پروفایل" : "ثبت مشتری"}</h2>
              <small>Customer Entity</small>
            </div>
          </div>

          <div class="form-grid">

            <div class="field">
              <label>شماره مشتری</label>
              <input id="customerNo" value="${esc(c.customerNo || customerNo())}">
            </div>

            <div class="field">
              <label>نام مشتری</label>
              <input id="customerName" value="${esc(c.name || "")}">
            </div>

            <div class="field">
              <label>تلفن</label>
              <input id="customerPhone" type="tel" value="${esc(phone(c))}">
            </div>

            <div class="field">
              <label>آدرس</label>
              <input id="customerAddress" value="${esc(c.address || "")}">
            </div>

          </div>

          <div class="field" style="margin-top:12px">
            <label>یادداشت</label>
            <textarea id="customerNotes" rows="4">${esc(c.notes || "")}</textarea>
          </div>

          <div class="toolbar" style="margin-top:18px">

            <button
              class="primary-btn"
              data-customer-action="save"
              data-id="${esc(c.id || "")}"
            >
              ذخیره مشتری
            </button>

            ${customer ? `
              <button
                class="danger-btn"
                data-customer-action="archive"
                data-id="${esc(c.id)}"
              >
                بایگانی
              </button>
            ` : ""}

          </div>

        </section>

      </main>

      ${nav()}
    `);

    currentCustomerId = customer?.id || null;

    if (addHistory) {
      pushCustomerHistory(
        customer ? "edit" : "new",
        customer?.id || null
      );
    }
  }

  async function relations(customerId) {
    const [vehicles, repairs] = await Promise.all([
      FarmandehDB.byIndex(
        "vehicles",
        "customerId",
        customerId
      ),

      FarmandehDB.byIndex(
        "repairs",
        "customerId",
        customerId
      )
    ]);

    return { vehicles, repairs };
  }

  async function showDetail(id, addHistory = true) {
    const c = await FarmandehDB.get("customers", id);

    if (!c) {
      await showList(false);
      return;
    }

    const { vehicles, repairs } = await relations(id);

    setHTML(`
      ${topbar("پروفایل مشتری")}

      <main class="page">

        <section class="hero">

          <div class="badge">${esc(c.customerNo || "")}</div>

          <h1>${esc(c.name || "بدون نام")}</h1>

          <p>${esc(phone(c) || "بدون تلفن")}</p>

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
            data-customer-action="edit"
            data-id="${esc(c.id)}"
          >
            ✏️ ویرایش
          </button>

          <button
            class="ghost-btn"
            data-customer-action="vehicle-new"
            data-id="${esc(c.id)}"
          >
            🚗 ثبت خودرو
          </button>

        </section>

        <div class="section-head">
          <h2>اطلاعات</h2>
        </div>

        <section class="list">

          <div class="row">
            <div class="row-main">
              <div class="row-title">تلفن</div>
              <div class="row-sub">${esc(phone(c) || "—")}</div>
            </div>
          </div>

          <div class="row">
            <div class="row-main">
              <div class="row-title">آدرس</div>
              <div class="row-sub">${esc(c.address || "—")}</div>
            </div>
          </div>

          <div class="row">
            <div class="row-main">
              <div class="row-title">یادداشت</div>
              <div class="row-sub">${esc(c.notes || "—")}</div>
            </div>
          </div>

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
                          .join(" ") || "خودرو"
                      )}
                    </div>

                    <div class="row-sub">
                      ${v.plate ? "پلاک: " + esc(v.plate) : "بدون پلاک"}
                    </div>
                  </div>
                </div>
              `).join("")
              : `<div class="empty">خودرویی ثبت نشده است.</div>`
          }

        </section>

        <div class="section-head">
          <h2>سوابق تعمیرات</h2>
        </div>

        <section class="list">

          ${
            repairs.length
              ? repairs.map(r => `
                <div class="row">
                  <div class="row-main">

                    <div class="row-title">
                      ${esc(r.repairNo || "بدون شماره")}
                    </div>

                    <div class="row-sub">
                      ${esc(r.faultDescription || "")}
                    </div>

                    <div class="row-sub">
                      ${esc(r.status || "")}
                    </div>

                  </div>
                </div>
              `).join("")
              : `<div class="empty">هنوز سابقه تعمیر ندارد.</div>`
          }

        </section>

      </main>

      ${nav()}
    `);

    currentCustomerId = id;

    if (addHistory) {
      pushCustomerHistory("detail",
