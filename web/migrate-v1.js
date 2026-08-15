(() => {
  "use strict";

  const LEGACY_KEY = "farmandeh-runtime-V1";
  const MIGRATION_KEY = "farmandeh-v1-indexeddb-migration";

  async function migrate() {
    if (!window.FarmandehDB) {
      console.error("FarmandehDB is not loaded.");
      return;
    }

    if (localStorage.getItem(MIGRATION_KEY) === "done") {
      console.log("Farmandeh migration already completed.");
      return;
    }

    let legacy;

    try {
      legacy = JSON.parse(
        localStorage.getItem(LEGACY_KEY) || "{}"
      );
    } catch (e) {
      console.error("Invalid legacy data", e);
      return;
    }

    const repairs = Array.isArray(legacy.repairs)
      ? legacy.repairs
      : [];

    const customerMap = new Map();
    const vehicleMap = new Map();
    const deviceMap = new Map();

    for (const oldRepair of repairs) {
      const customerName =
        String(oldRepair.customerName || "").trim();

      const customerPhone =
        String(oldRepair.customerPhone || "").trim();

      const vehicleName =
        String(oldRepair.vehicle || "").trim();

      const deviceName =
        String(oldRepair.device || "").trim();

      const customerKey =
        customerPhone || customerName || "unknown";

      let customerId =
        customerMap.get(customerKey);

      if (!customerId) {
        const customer =
          await FarmandehDB.put(
            "customers",
            {
              workspaceId: "default",
              customerNo:
                "C-" +
                Date.now().toString(36) +
                "-" +
                Math.random()
                  .toString(36)
                  .slice(2, 6),

              name:
                customerName ||
                "مشتری بدون نام",

              phones:
                customerPhone
                  ? [customerPhone]
                  : [],

              address: "",
              tags: [],
              notes: ""
            }
          );

        customerId = customer.id;

        customerMap.set(
          customerKey,
          customerId
        );
      }

      let vehicleId = null;

      if (vehicleName) {
        const vehicleKey =
          customerId + "|" + vehicleName;

        vehicleId =
          vehicleMap.get(vehicleKey);

        if (!vehicleId) {
          const vehicle =
            await FarmandehDB.put(
              "vehicles",
              {
                workspaceId: "default",
                customerId,
                brand: "",
                model: vehicleName,
                year: null,
                plate: "",
                vin: "",
                notes: ""
              }
            );

          vehicleId = vehicle.id;

          vehicleMap.set(
            vehicleKey,
            vehicleId
          );
        }
      }

      const deviceKey =
        customerId +
        "|" +
        (vehicleId || "") +
        "|" +
        (deviceName || "device");

      let deviceId =
        deviceMap.get(deviceKey);

      if (!deviceId) {
        const device =
          await FarmandehDB.put(
            "devices",
            {
              workspaceId: "default",
              customerId,
              vehicleId,
              category: "Multimedia",
              brand: "",
              model:
                deviceName ||
                "دستگاه بدون مدل",
              serial: "",
              boardNo: "",
              notes: ""
            }
          );

        deviceId = device.id;

        deviceMap.set(
          deviceKey,
          deviceId
        );
      }

      const normalizedStatus =
        {
          intake: "intake",
          diagnosing: "diagnosis",
          repairing: "repairing",
          waiting_part: "repairing",
          ready: "ready",
          delivered: "delivered",
          cancelled: "cancelled"
        }[oldRepair.status] ||
        "intake";

      const repair =
        await FarmandehDB.put(
          "repairs",
          {
            workspaceId: "default",

            repairNo:
              oldRepair.repairNo ||
              "R-" +
                Date.now()
                  .toString(36),

            customerId,
            vehicleId,
            deviceId,

            technicianUserId: null,

            bench: "",

            priority: "normal",

            status:
              normalizedStatus,

            faultDescription:
              oldRepair.fault || "",

            diagnosis:
              oldRepair.diagnosis || "",

            workDone:
              oldRepair.notes || "",

            laborAmount:
              Number(
                oldRepair.cost || 0
              ),

            partsAmount: 0,

            discountAmount: 0,

            warrantyUntil: null,

            isReturn:
              Boolean(
                oldRepair.isReturn
              ),

            returnOfRepairId: null,

            timerSeconds:
              Number(
                oldRepair.elapsedSeconds ||
                  0
              ),

            timerRunning:
              Boolean(
                oldRepair.timerRunning
              ),

            timerStartedAt:
              oldRepair.timerStartedAt ||
              null,

            createdAt:
              oldRepair.createdAt ||
              new Date().toISOString(),

            updatedAt:
              oldRepair.updatedAt ||
              new Date().toISOString()
          }
        );

      await FarmandehDB.createRepairEvent({
        workspaceId: "default",
        repairId: repair.id,
        eventType: "created",
        note: "Migrated from Runtime V1 localStorage"
      });

      const paid =
        Number(oldRepair.paid || 0);

      if (paid > 0) {
        await FarmandehDB.addPayment({
          workspaceId: "default",
          repairId: repair.id,
          customerId,
          amount: paid,
          method: "other",
          note:
            "Migrated legacy payment"
        });
      }
    }

    localStorage.setItem(
      MIGRATION_KEY,
      "done"
    );

    console.log(
      "Farmandeh migration completed:",
      {
        repairs: repairs.length,
        customers:
          customerMap.size,
        vehicles:
          vehicleMap.size,
        devices:
          deviceMap.size
      }
    );

    window.dispatchEvent(
      new CustomEvent(
        "farmandeh-migration-complete"
      )
    );
  }

  if (window.FarmandehDB) {
    migrate().catch(console.error);
  } else {
    window.addEventListener(
      "farmandeh-db-ready",
      () => {
        migrate().catch(
          console.error
        );
      },
      { once: true }
    );
  }
})();
