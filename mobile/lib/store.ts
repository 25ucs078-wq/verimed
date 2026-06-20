import { create } from "zustand";
import { offlineDb } from "./offlineDb";

export interface LocalScanRecord {
  id: string;
  genericName: string;
  brandName: string;
  manufacturerName: string;
  batchNumber: string;
  scanType: "image" | "qr";
  isAuthentic: boolean;
  timestamp: string;
}

interface VeriMedStore {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingOutboxCount: number;
  cachedMedicineCount: number;
  cachedBatchCount: number;
  recentScans: LocalScanRecord[];
  
  setOnline: (status: boolean) => void;
  addRecentScan: (scan: LocalScanRecord) => void;
  clearHistory: () => void;
  loadStats: () => Promise<void>;
  syncWithBackend: (syncFn: (outbox: any[]) => Promise<any>) => Promise<void>;
}

export const useVeriMedStore = create<VeriMedStore>((set, get) => ({
  isOnline: true,
  lastSyncTime: null,
  pendingOutboxCount: 0,
  cachedMedicineCount: 0,
  cachedBatchCount: 0,
  recentScans: [
    // Prepopulated demo scans to match look and feel
    {
      id: "scan-1",
      genericName: "Paracetamol",
      brandName: "Panadol",
      manufacturerName: "GlaxoSmithKline",
      batchNumber: "GEN-100001",
      scanType: "qr",
      isAuthentic: true,
      timestamp: new Date().toISOString()
    },
    {
      id: "scan-2",
      genericName: "Amoxicillin",
      brandName: "Amoxil",
      manufacturerName: "Pfizer Inc",
      batchNumber: "CNT-200004",
      scanType: "image",
      isAuthentic: false,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],

  setOnline: (status) => {
    set({ isOnline: status });
  },

  addRecentScan: (scan) => {
    set((state) => ({
      recentScans: [scan, ...state.recentScans.slice(0, 19)], // Cap history at 20
    }));
  },

  clearHistory: () => {
    set({ recentScans: [] });
  },

  loadStats: async () => {
    await offlineDb.initDb();
    const queued = await offlineDb.getQueuedScans();
    
    // In web fallback, we load from memory
    let medCount = 0;
    let batchCount = 0;
    
    try {
      const SQLite = await import("expo-sqlite");
      const db = SQLite.openDatabaseSync("verimed_local.db");
      
      const meds: any = db.getFirstSync("SELECT COUNT(*) as count FROM medicines;");
      const batches: any = db.getFirstSync("SELECT COUNT(*) as count FROM batches;");
      
      medCount = meds?.count || 0;
      batchCount = batches?.count || 0;
    } catch (e) {
      // Use fallback memory store lengths
      const cachedMeds = localStorage.getItem("verimed_medicines");
      const cachedBatches = localStorage.getItem("verimed_batches");
      medCount = cachedMeds ? JSON.parse(cachedMeds).length : 0;
      batchCount = cachedBatches ? JSON.parse(cachedBatches).length : 0;
    }

    set({
      pendingOutboxCount: queued.length,
      cachedMedicineCount: medCount,
      cachedBatchCount: batchCount,
    });
  },

  syncWithBackend: async (syncFn) => {
    const queued = await offlineDb.getQueuedScans();
    if (queued.length === 0) {
      // Sync empty is allowed, it will pull down refreshed cache
    }

    // Format queued items for server schema
    const formattedScans = queued.map(q => ({
      scan_type: q.scan_type,
      timestamp: q.timestamp,
      latitude: q.latitude,
      longitude: q.longitude,
      region: q.region,
      metadata: JSON.parse(q.metadata)
    }));

    // Trigger sync API call
    const res = await syncFn(formattedScans);

    // Save returned package to local db caches
    await offlineDb.saveCacheBundle(res.medicines, res.batches);
    
    // Clear outbox
    await offlineDb.clearQueuedScans();

    set({
      lastSyncTime: new Date().toISOString(),
      pendingOutboxCount: 0,
      cachedMedicineCount: res.medicines.length,
      cachedBatchCount: res.batches.length,
    });
  }
}));
