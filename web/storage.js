(() => {
  "use strict";

  const DB_NAME = "farmandeh-db";
  const DB_VERSION = 1;

  const STORES = [
    "meta",
    "customers",
    "vehicles",
    "devices",
    "repairs",
    "repairEvents",
    "parts",
    "inventoryTransactions",
    "payments",
    "attachments",
    "tasks"
  ];

  function uuid() {
    if (crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return (
      "id_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 10)
    );
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = () => {
        const db = req.result;

        for (const storeName of STORES) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: "id"
            });

            if (storeName !== "meta") {
              store.createIndex(
                "workspaceId",
                "workspaceId",
                { unique: false }
              );

              store.createIndex(
                "updatedAt",
                "updatedAt",
                { unique: false }
              );
            }

            if (storeName === "vehicles") {
              store.createIndex(
                "customerId",
                "customerId",
                { unique: false }
              );

              store.createIndex(
                "plate",
                "plate",
                { unique: false }
              );
            }

            if (storeName === "devices") {
              store.createIndex(
                "customerId",
                "customerId",
                { unique: false }
              );

              store.createIndex(
                "vehicleId",
                "vehicleId",
                { unique: false }
              );

              store.createIndex(
                "serial",
                "serial",
                { unique: false }
              );
            }

            if (storeName === "repairs") {
              store.createIndex(
                "customerId",
                "customerId",
                { unique: false }
              );

              store.createIndex(
                "vehicleId",
                "vehicleId",
                { unique: false }
              );

              store.createIndex(
                "deviceId",
                "deviceId",
                { unique: false }
              );

              store.createIndex(
                "status",
                "status",
                { unique: false }
              );

              store.createIndex(
                "repairNo",
                "repairNo",
                { unique: false }
              );
            }

            if (storeName === "repairEvents") {
              store.createIndex(
                "repairId",
                "repairId",
                { unique: false }
              );

              store.createIndex(
                "eventType",
                "eventType",
                { unique: false }
              );
            }

            if (storeName === "inventoryTransactions") {
              store.createIndex(
                "partId",
                "partId",
                { unique: false }
              );

              store.createIndex(
                "repairId",
                "repairId",
                { unique: false }
              );

              store.createIndex(
                "type",
                "type",
                { unique: false }
              );
            }

            if (storeName === "payments") {
              store.createIndex(
                "repairId",
                "repairId",
                { unique: false }
              );

              store.createIndex(
                "customerId",
                "customerId",
                { unique: false }
              );
            }

            if (storeName === "tasks") {
              store.createIndex(
                "status",
                "status",
                { unique: false }
              );

              store.createIndex(
                "ownerUserId",
                "ownerUserId",
                { unique: false }
              );
            }
          }
        }
      };

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function withStore(storeName, mode, handler) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      try {
        handler(store, tx);
      } catch (e) {
        reject(e);
        return;
      }

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () =>
        reject(tx.error || new Error("Transaction aborted"));
    });
  }

  async function put(storeName, record) {
    const clean = {
      ...record,
      id: record.id || uuid(),
      createdAt: record.createdAt || nowIso(),
      updatedAt: nowIso(),
      deletedAt: record.deletedAt || null
    };

    await withStore(storeName, "readwrite", store => {
      store.put(clean);
    });

    return clean;
  }

  async function get(storeName, id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function all(
    storeName,
    { includeDeleted = false } = {}
  ) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();

      req.onsuccess = () => {
        const rows = req.result || [];

        resolve(
          includeDeleted
            ? rows
            : rows.filter(x => !x.deletedAt)
        );
      };

      req.onerror = () => reject(req.error);
    });
  }

  async function byIndex(
    storeName,
    indexName,
    value,
    { includeDeleted = false } = {}
  ) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const index = tx
        .objectStore(storeName)
        .index(indexName);

      const req = index.getAll(value);

      req.onsuccess = () => {
        const rows = req.result || [];

        resolve(
          includeDeleted
            ? rows
            : rows.filter(x => !x.deletedAt)
        );
      };

      req.onerror = () => reject(req.error);
    });
  }

  async function softDelete(storeName, id) {
    const current = await get(storeName, id);

    if (!current) {
      return false;
    }

    current.deletedAt = nowIso();
    current.updatedAt = nowIso();

    await withStore(storeName, "readwrite", store => {
      store.put(current);
    });

    return true;
  }

  async function hardDelete(storeName, id) {
    await withStore(storeName, "readwrite", store => {
      store.delete(id);
    });

    return true;
  }

  async function createRepairEvent({
    workspaceId = "default",
    repairId,
    eventType,
    fromValue = null,
    toValue = null,
    actorUserId = null,
    note = ""
  }) {
    return put("repairEvents", {
      workspaceId,
      repairId,
      eventType,
      fromValue,
      toValue,
      actorUserId,
      note
    });
  }

  async function changeRepairStatus(
    repairId,
    nextStatus,
    actorUserId = null
  ) {
    const repair = await get("repairs", repairId);

    if (!repair) {
      throw new Error("Repair not found");
    }

    const previous = repair.status;

    if (previous === nextStatus) {
      return repair;
    }

    repair.status = nextStatus;

    if (nextStatus === "ready") {
      repair.completedAt =
        repair.completedAt || nowIso();
    }

    if (nextStatus === "delivered") {
      repair.deliveredAt =
        repair.deliveredAt || nowIso();
    }

    const updated = await put(
      "repairs",
      repair
    );

    await createRepairEvent({
      workspaceId:
        repair.workspaceId || "default",
      repairId,
      eventType: "status_changed",
      fromValue: previous,
      toValue: nextStatus,
      actorUserId
    });

    return updated;
  }

  async function startRepairTimer(
    repairId,
    actorUserId = null
  ) {
    const repair = await get("repairs", repairId);

    if (!repair) {
      throw new Error("Repair not found");
    }

    if (repair.timerRunning) {
      return repair;
    }

    repair.timerRunning = true;
    repair.timerStartedAt = nowIso();

    const updated = await put(
      "repairs",
      repair
    );

    await createRepairEvent({
      workspaceId:
        repair.workspaceId || "default",
      repairId,
      eventType: "timer_started",
      actorUserId
    });

    return updated;
  }

  async function stopRepairTimer(
    repairId,
    actorUserId = null
  ) {
    const repair = await get(
      "repairs",
      repairId
    );

    if (!repair) {
      throw new Error("Repair not found");
    }

    if (
      !repair.timerRunning ||
      !repair.timerStartedAt
    ) {
      return repair;
    }

    const elapsed = Math.max(
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

    repair.timerSeconds =
      Number(repair.timerSeconds || 0) +
      elapsed;

    repair.timerRunning = false;
    repair.timerStartedAt = null;

    const updated = await put(
      "repairs",
      repair
    );

    await createRepairEvent({
      workspaceId:
        repair.workspaceId || "default",
      repairId,
      eventType: "timer_stopped",
      toValue: {
        elapsedSeconds: elapsed
      },
      actorUserId
    });

    return updated;
  }

  async function addPayment({
    workspaceId = "default",
    repairId,
    customerId,
    amount,
    method = "cash",
    referenceNo = "",
    actorUserId = null,
    note = ""
  }) {
    if (!(Number(amount) > 0)) {
      throw new Error(
        "Payment amount must be greater than zero"
      );
    }

    const payment = await put(
      "payments",
      {
        workspaceId,
        repairId,
        customerId,
        amount: Number(amount),
        method,
        referenceNo,
        paidAt: nowIso(),
        actorUserId,
        note
      }
    );

    await createRepairEvent({
      workspaceId,
      repairId,
      eventType: "payment_added",
      toValue: {
        paymentId: payment.id,
        amount: payment.amount
      },
      actorUserId
    });

    return payment;
  }

  async function getRepairFinance(
    repairId
  ) {
    const repair = await get(
      "repairs",
      repairId
    );

    if (!repair) {
      throw new Error("Repair not found");
    }

    const payments = await byIndex(
      "payments",
      "repairId",
      repairId
    );

    const paidAmount = payments.reduce(
      (sum, p) =>
        sum + Number(p.amount || 0),
      0
    );

    const laborAmount =
      Number(repair.laborAmount || 0);

    const partsAmount =
      Number(repair.partsAmount || 0);

    const discountAmount =
      Number(repair.discountAmount || 0);

    const totalAmount =
      laborAmount +
      partsAmount -
      discountAmount;

    const balanceAmount =
      totalAmount - paidAmount;

    return {
      totalAmount,
      paidAmount,
      balanceAmount,
      payments
    };
  }

  async function consumePart({
    workspaceId = "default",
    repairId,
    partId,
    quantity,
    actorUserId = null,
    note = ""
  }) {
    quantity = Number(quantity);

    if (!(quantity > 0)) {
      throw new Error(
        "Quantity must be greater than zero"
      );
    }

    const db = await openDB();

    return new Promise(
      (resolve, reject) => {
        const tx = db.transaction(
          [
            "parts",
            "inventoryTransactions",
            "repairEvents"
          ],
          "readwrite"
        );

        const partsStore =
          tx.objectStore("parts");

        const invStore =
          tx.objectStore(
            "inventoryTransactions"
          );

        const eventStore =
          tx.objectStore(
            "repairEvents"
          );

        const req =
          partsStore.get(partId);

        req.onsuccess = () => {
          const part = req.result;

          if (!part || part.deletedAt) {
            tx.abort();

            reject(
              new Error("Part not found")
            );

            return;
          }

          const currentQty =
            Number(part.quantity || 0);

          if (
            currentQty < quantity
          ) {
            tx.abort();

            reject(
              new Error(
                "Insufficient stock"
              )
            );

            return;
          }

          part.quantity =
            currentQty - quantity;

          part.updatedAt = nowIso();

          partsStore.put(part);

          const transaction = {
            id: uuid(),
            workspaceId,
            repairId,
            partId,
            type: "consume",
            quantityDelta: -quantity,
            unitCost: Number(
              part.purchasePrice || 0
            ),
            actorUserId,
            note,
            createdAt: nowIso(),
            updatedAt: nowIso(),
            deletedAt: null
          };

          invStore.put(transaction);

          eventStore.put({
            id: uuid(),
            workspaceId,
            repairId,
            eventType: "part_added",
            fromValue: null,
            toValue: {
              partId,
              quantity,
              inventoryTransactionId:
                transaction.id
            },
            actorUserId,
            note,
            createdAt: nowIso(),
            updatedAt: nowIso(),
            deletedAt: null
          });

          tx.oncomplete = () =>
            resolve({
              part,
              transaction
            });
        };

        req.onerror = () =>
          reject(req.error);

        tx.onerror = () =>
          reject(tx.error);

        tx.onabort = () => {
          if (tx.error) {
            reject(tx.error);
          }
        };
      }
    );
  }

  async function exportDatabase() {
    const output = {
      exportedAt: nowIso(),
      dbName: DB_NAME,
      version: DB_VERSION,
      stores: {}
    };

    for (
      const storeName of STORES
    ) {
      output.stores[storeName] =
        await all(
          storeName,
          {
            includeDeleted: true
          }
        );
    }

    return output;
  }

  async function clearAll() {
    const db = await openDB();

    for (
      const storeName of STORES
    ) {
      await new Promise(
        (resolve, reject) => {
          const tx = db.transaction(
            storeName,
            "readwrite"
          );

          tx
            .objectStore(storeName)
            .clear();

          tx.oncomplete = resolve;

          tx.onerror = () =>
            reject(tx.error);
        }
      );
    }
  }

  window.FarmandehDB = {
    DB_NAME,
    DB_VERSION,
    STORES,
    uuid,
    nowIso,
    openDB,
    put,
    get,
    all,
    byIndex,
    softDelete,
    hardDelete,
    createRepairEvent,
    changeRepairStatus,
    startRepairTimer,
    stopRepairTimer,
    addPayment,
    getRepairFinance,
    consumePart,
    exportDatabase,
    clearAll
  };

  window.dispatchEvent(
    new CustomEvent(
      "farmandeh-db-ready"
    )
  );
})();
