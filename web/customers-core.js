(() => {
  "use strict";

  const WORKSPACE_ID = "default";

  let customerRoute = "list";
  let selectedCustomerId = null;
  let customers = [];

  function esc(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[c]
    );
  }

  function phoneText(customer) {
    const phones = Array.isArray(customer.phones)
      ? customer.phones
      : [];

    return phones.join("، ");
  }

  function customerNo() {
    return (
      "C-" +
      Date.now()
        .toString(36)
        .toUpperCase()
    );
  }

  function topbar(title) {
    return `
      <header class="topbar">
        <button
          class="icon-btn"
          data-customer-action="back"
        >→</button>

        <div class="brand">
          <div class="logo">👥</div>

          <div>
            <div class="brand-title">
              ${esc(title)}
            </div>

            <div class="brand-sub">
              Customers Core
            </div>
          </div>
        </div>

        <div></div>
      </header>
    `;
  }

  function bottomNav() {
    return `
      <nav class="bottom-nav">
        <button
          class="nav-btn"
          data-customer-action="home"
        >
          🏠<br>
          <small>خانه</small>
        </button>

        <button
          class="nav-btn"
          data-customer-action="customers"
        >
          👥<br>
          <small>مشتریان</small>
        </button>

        <button
          class="nav-btn"
          data-customer-action="new"
        >
          ➕<br>
          <small>جدید</small>
        </button>
      </nav>
    `;
  }

  async function loadCustomers() {
    customers =
      await FarmandehDB.all(
        "customers"
      );

    customers.sort(
      (a, b) =>
        String(b.updatedAt || "")
          .localeCompare(
            String(a.updatedAt || "")
          )
    );
  }

  async function getRelations(customerId) {
    const [
      vehicles,
      devices,
      repairs
    ] = await Promise.all([
      FarmandehDB.byIndex(
        "vehicles",
        "customerId",
        customerId
      ),

      FarmandehDB.byIndex(
        "devices",
        "customerId",
        customerId
      ),

      FarmandehDB.byIndex(
        "repairs",
        "customerId",
        customerId
      )
    ]);

    return {
      vehicles,
      devices,
      repairs
    };
  }

  function statusLabel(status) {
    return ({
      intake: "پذیرش",
      diagnosis: "عیب‌یابی",
      repairing: "در حال تعمیر",
      testing: "تست",
      ready: "آماده تحویل",
      delivered: "تحویل‌شده",
      cancelled: "لغو‌شده"
    })[status] || status || "—";
  }

  async function renderList() {
    await loadCustomers();

    const app =
      document.getElementById("app");

    app.innerHTML = `
      <div class="shell">
        ${topbar("مشتریان")}

        <main class="page">

          <section class="hero">
            <div class="badge">
              Real Customers Core
            </div>

            <h1>مشتریان</h1>

            <p>
              پروفایل واقعی مشتری،
              خودروها، دستگاه‌ها و
              تاریخچه تعمیرات.
            </p>

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
              <small>
                ذخیره در IndexedDB
              </small>
            </div>

            <button
              class="primary-btn"
              data-customer-action="new"
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
              ${renderCustomerRows(customers)}
            </div>
          </section>

        </main>

        ${bottomNav()}
      </div>
    `;

    customerRoute = "list";
    selectedCustomerId = null;
  }

  function renderCustomerRows(items) {
    if (!items.length) {
      return `
        <div class="empty">
          هنوز مشتری ثبت نشده است.
        </div>
      `;
    }

    return items.map(c => `
      <div
        class="row clickable"
        data-customer-id="${esc(c.id)}"
      >
        <div class="row-main">

          <div class="row-title">
            ${esc(c.name || "بدون نام")}
          </div>

          <div class="row-sub">
            ${esc(phoneText(c) || "بدون تلفن")}
          </div>

          <div class="row-sub">
            ${esc(c.customerNo || "")}
          </div>

        </div>

        <span>‹</span>
      </div>
    `).join("");
  }

  function renderForm(customer = null) {
    const c = customer || {
      id: "",
      customerNo: "",
      name: "",
      phones: [],
      address: "",
      tags: [],
      notes: ""
    };

    const firstPhone =
      Array.isArray(c.phones)
        ? c.phones[0] || ""
        : "";

    const app =
      document.getElementById("app");

    app.innerHTML = `
      <div class="shell">

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
                  Customer Entity
                </small>
              </div>
            </div>

            <div class="form-grid">

              <div class="field">
                <label>
                  شماره مشتری
                </label>

                <input
                  id="customerNo"
                  value="${esc(
                    c.customerNo ||
                    customerNo()
                  )}"
                >
              </div>

              <div class="field">
                <label>
                  نام مشتری
                </label>

                <input
                  id="customerName"
                  value="${esc(c.name)}"
                >
              </div>

              <div class="field">
                <label>
                  تلفن
                </label>

                <input
                  id="customerPhone"
                  type="tel"
                  value="${esc(firstPhone)}"
                >
              </div>

              <div class="field">
                <label>
                  آدرس
                </label>

                <input
                  id="customerAddress"
                  value="${esc(c.address || "")}"
                >
              </div>

            </div>

            <div
              class="field"
              style="margin-top:12px"
            >
              <label>
                برچسب‌ها
              </label>

              <input
                id="customerTags"
                placeholder="VIP، همکار، شهرستان..."
                value="${esc(
                  Array.isArray(c.tags)
                    ? c.tags.join("، ")
                    : ""
                )}"
              >
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
              >${esc(c.notes || "")}</textarea>
            </div>

            <div
              class="toolbar"
              style="margin-top:18px"
            >
              <button
                class="primary-btn"
                data-customer-action="save"
                data-id="${esc(c.id)}"
              >
                ذخیره مشتری
              </button>

              ${
                customer
                  ? `
                    <button
                      class="danger-btn"
                      data-customer-action="archive"
                      data-id="${esc(c.id)}"
                    >
                      بایگانی
                    </button>
                  `
                  : ""
              }

            </div>

          </section>

        </main>

        ${bottomNav()}
      </div>
    `;

    customerRoute =
      customer ? "edit" : "new";

    selectedCustomerId =
      customer?.id || null;
  }

  async function renderDetail(customerId) {
    const customer =
      await FarmandehDB.get(
        "customers",
        customerId
      );

    if (!customer) {
      await renderList();
      return;
    }

    const {
      vehicles,
      devices,
      repairs
    } = await getRelations(customerId);

    const app =
      document.getElementById("app");

    app.innerHTML = `
      <div class="shell">

        ${topbar("پروفایل مشتری")}

        <main class="page">

          <section class="hero">

            <div class="badge">
              ${esc(customer.customerNo || "")}
            </div>

            <h1>
              ${esc(customer.name)}
            </h1>

            <p>
              ${esc(
                phoneText(customer) ||
                "بدون تلفن"
              )}
            </p>

            <div class="stats">

              <div class="stat">
                <b>${vehicles.length}</b>
                <span>خودرو</span>
              </div>

              <div class="stat">
                <b>${devices.length}</b>
                <span>دستگاه</span>
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
              data-id="${esc(customer.id)}"
            >
              ✏️ ویرایش
            </button>

            <button
              class="ghost-btn"
              data-customer-action="new-vehicle"
              data-id="${esc(customer.id)}"
            >
              🚗 خودرو
            </button>

          </section>

          <div class="section-head">
            <h2>اطلاعات</h2>
          </div>

          <section class="list">

            ${detailRow(
              "تلفن",
              phoneText(customer)
            )}

            ${detailRow(
              "آدرس",
              customer.address
            )}

            ${detailRow(
              "برچسب‌ها",
              Array.isArray(customer.tags)
                ? customer.tags.join("، ")
                : ""
            )}

            ${detailRow(
              "یادداشت",
              customer.notes
