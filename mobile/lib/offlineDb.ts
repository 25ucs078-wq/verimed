import { Platform } from "react-native";

// Abstract interface for local database operations
export interface OfflineMedicine {
  id: string;
  generic_name: string;
  brand_name: string;
  manufacturer_name: string;
  manufacturer_address?: string;
  manufacturer_license_no?: string;
  dosage_form?: string;
  strength?: string;
  packaging_size?: string;
}

export interface OfflineBatch {
  id: string;
  medicine_id: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: string;
  hologram_status: string;
}

export interface QueuedScan {
  id?: number;
  scan_type: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  metadata: string; // JSON string
}

let dbInstance: any = null;

// Dynamic import for Native SQLite
const getDb = async () => {
  if (Platform.OS === "web") {
    return null;
  }
  if (!dbInstance) {
    const SQLite = await import("expo-sqlite");
    dbInstance = SQLite.openDatabaseSync("verimed_local.db");
  }
  return dbInstance;
};

// Web fallback memory store
const webStore = {
  medicines: [] as OfflineMedicine[],
  batches: [] as OfflineBatch[],
  outbox: [] as QueuedScan[],
};

export const offlineDb = {
  initDb: async () => {
    try {
      const db = await getDb();
      if (!db) {
        console.log("Using Web LocalStorage fallback for offline database.");
        // Try to load from localStorage if available
        const cachedMeds = localStorage.getItem("verimed_medicines");
        const cachedBatches = localStorage.getItem("verimed_batches");
        const cachedOutbox = localStorage.getItem("verimed_outbox");
        if (cachedMeds) webStore.medicines = JSON.parse(cachedMeds);
        if (cachedBatches) webStore.batches = JSON.parse(cachedBatches);
        if (cachedOutbox) webStore.outbox = JSON.parse(cachedOutbox);
        return;
      }

      // Initialize SQLite tables
      db.execSync(`
        CREATE TABLE IF NOT EXISTS medicines (
          id TEXT PRIMARY KEY,
          generic_name TEXT,
          brand_name TEXT,
          manufacturer_name TEXT,
          manufacturer_address TEXT,
          manufacturer_license_no TEXT,
          dosage_form TEXT,
          strength TEXT,
          packaging_size TEXT
        );
        CREATE TABLE IF NOT EXISTS batches (
          id TEXT PRIMARY KEY,
          medicine_id TEXT,
          batch_number TEXT UNIQUE,
          manufacturing_date TEXT,
          expiry_date TEXT,
          status TEXT,
          hologram_status TEXT
        );
        CREATE TABLE IF NOT EXISTS outbox_scans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          scan_type TEXT,
          timestamp TEXT,
          latitude REAL,
          longitude REAL,
          region TEXT,
          metadata TEXT
        );
      `);
      console.log("Local SQLite database initialized.");
    } catch (error) {
      console.error("Local DB Init failed, using memory store:", error);
    }
  },

  saveCacheBundle: async (medicines: OfflineMedicine[], batches: OfflineBatch[]) => {
    try {
      const db = await getDb();
      if (!db) {
        webStore.medicines = medicines;
        webStore.batches = batches;
        localStorage.setItem("verimed_medicines", JSON.stringify(medicines));
        localStorage.setItem("verimed_batches", JSON.stringify(batches));
        return;
      }

      // Clear existing caches and save new records
      db.execSync("DELETE FROM medicines;");
      db.execSync("DELETE FROM batches;");

      // Batch insert medicines
      for (const m of medicines) {
        db.runSync(
          "INSERT INTO medicines (id, generic_name, brand_name, manufacturer_name, manufacturer_address, manufacturer_license_no, dosage_form, strength, packaging_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
          [
            m.id,
            m.generic_name,
            m.brand_name,
            m.manufacturer_name,
            m.manufacturer_address || null,
            m.manufacturer_license_no || null,
            m.dosage_form || null,
            m.strength || null,
            m.packaging_size || null,
          ]
        );
      }

      // Batch insert batches
      for (const b of batches) {
        db.runSync(
          "INSERT INTO batches (id, medicine_id, batch_number, manufacturing_date, expiry_date, status, hologram_status) VALUES (?, ?, ?, ?, ?, ?, ?);",
          [
            b.id,
            b.medicine_id,
            b.batch_number,
            b.manufacturing_date,
            b.expiry_date,
            b.status,
            b.hologram_status,
          ]
        );
      }
      console.log("Cached sync package written to local DB.");
    } catch (e) {
      console.error("Could not write sync cache:", e);
    }
  },

  getOfflineBatch: async (batchNumber: string): Promise<{ batch: OfflineBatch; medicine: OfflineMedicine } | null> => {
    try {
      const db = await getDb();
      if (!db) {
        const batch = webStore.batches.find((b) => b.batch_number === batchNumber);
        if (!batch) return null;
        const medicine = webStore.medicines.find((m) => m.id === batch.medicine_id);
        return { batch, medicine: medicine! };
      }

      const batchResult: any = db.getFirstSync(
        "SELECT * FROM batches WHERE batch_number = ?;",
        [batchNumber]
      );
      if (!batchResult) return null;

      const medicineResult: any = db.getFirstSync(
        "SELECT * FROM medicines WHERE id = ?;",
        [batchResult.medicine_id]
      );

      return {
        batch: batchResult,
        medicine: medicineResult,
      };
    } catch (e) {
      console.error("Offline batch search failed:", e);
      return null;
    }
  },

  queueScanAction: async (scan: Omit<QueuedScan, "id">) => {
    try {
      const db = await getDb();
      if (!db) {
        const newScan = { ...scan, id: Date.now() };
        webStore.outbox.push(newScan);
        localStorage.setItem("verimed_outbox", JSON.stringify(webStore.outbox));
        return;
      }

      db.runSync(
        "INSERT INTO outbox_scans (scan_type, timestamp, latitude, longitude, region, metadata) VALUES (?, ?, ?, ?, ?, ?);",
        [
          scan.scan_type,
          scan.timestamp,
          scan.latitude || null,
          scan.longitude || null,
          scan.region || null,
          scan.metadata,
        ]
      );
      console.log("Scan action queued in local outbox.");
    } catch (e) {
      console.error("Queue scan action failed:", e);
    }
  },

  getQueuedScans: async (): Promise<QueuedScan[]> => {
    try {
      const db = await getDb();
      if (!db) {
        return webStore.outbox;
      }

      return db.getAllSync("SELECT * FROM outbox_scans;");
    } catch (e) {
      console.error("Retrieve queued scans failed:", e);
      return [];
    }
  },

  clearQueuedScans: async () => {
    try {
      const db = await getDb();
      if (!db) {
        webStore.outbox = [];
        localStorage.removeItem("verimed_outbox");
        return;
      }

      db.execSync("DELETE FROM outbox_scans;");
      console.log("Local sync outbox cleared.");
    } catch (e) {
      console.error("Clear queued scans failed:", e);
    }
  },
};
