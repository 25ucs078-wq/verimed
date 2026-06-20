import React, { useState, useEffect, createContext, useContext } from "react";
import { api } from "./api";

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

export interface QueuedOfflineScan {
  scan_type: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  metadata: any;
}

interface VeriMedContextProps {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingOutboxCount: number;
  cachedMedsCount: number;
  cachedBatchesCount: number;
  recentScans: LocalScanRecord[];
  setOnline: (online: boolean) => void;
  addRecentScan: (scan: LocalScanRecord) => void;
  clearHistory: () => void;
  queueOfflineScan: (scan: Omit<QueuedOfflineScan, "timestamp">) => void;
  syncWithBackend: () => Promise<void>;
}

const getLocalStorageItem = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error("Failed to parse localStorage key:", key, e);
    return defaultValue;
  }
};

export const VeriMedContext = createContext<VeriMedContextProps | undefined>(undefined);

export const VeriMedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setOnlineState] = useState<boolean>(() => getLocalStorageItem("verimed_online", true));
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getLocalStorageItem("verimed_last_sync", null));
  const [recentScans, setRecentScans] = useState<LocalScanRecord[]>(() => 
    getLocalStorageItem("verimed_recent_scans", [
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
        manufacturerName: "VeloPharm Ltd",
        batchNumber: "CNT-200003",
        scanType: "image",
        isAuthentic: false,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ])
  );

  const [outbox, setOutbox] = useState<QueuedOfflineScan[]>(() => getLocalStorageItem("verimed_outbox", []));
  const [cachedMedsCount, setCachedMedsCount] = useState<number>(() => getLocalStorageItem("verimed_cached_meds_count", 0));
  const [cachedBatchesCount, setCachedBatchesCount] = useState<number>(() => getLocalStorageItem("verimed_cached_batches_count", 0));

  useEffect(() => {
    localStorage.setItem("verimed_online", JSON.stringify(isOnline));
  }, [isOnline]);

  useEffect(() => {
    localStorage.setItem("verimed_recent_scans", JSON.stringify(recentScans));
  }, [recentScans]);

  useEffect(() => {
    localStorage.setItem("verimed_outbox", JSON.stringify(outbox));
  }, [outbox]);

  const setOnline = (online: boolean) => {
    setOnlineState(online);
  };

  const addRecentScan = (scan: LocalScanRecord) => {
    setRecentScans((prev) => [scan, ...prev.slice(0, 19)]);
  };

  const clearHistory = () => {
    setRecentScans([]);
  };

  const queueOfflineScan = (scan: Omit<QueuedOfflineScan, "timestamp">) => {
    const newScan: QueuedOfflineScan = {
      ...scan,
      timestamp: new Date().toISOString()
    };
    setOutbox((prev) => [...prev, newScan]);
  };

  const syncWithBackend = async () => {
    try {
      const res = await api.syncOfflineData(outbox);
      
      localStorage.setItem("verimed_cached_medicines", JSON.stringify(res.medicines));
      localStorage.setItem("verimed_cached_batches", JSON.stringify(res.batches));
      localStorage.setItem("verimed_cached_meds_count", JSON.stringify(res.medicines.length));
      localStorage.setItem("verimed_cached_batches_count", JSON.stringify(res.batches.length));

      setCachedMedsCount(res.medicines.length);
      setCachedBatchesCount(res.batches.length);
      setOutbox([]);
      
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem("verimed_last_sync", JSON.stringify(now));
    } catch (e) {
      console.error("Offline sync failed:", e);
      throw e;
    }
  };

  return (
    <VeriMedContext.Provider
      value={{
        isOnline,
        lastSyncTime,
        pendingOutboxCount: outbox.length,
        cachedMedsCount,
        cachedBatchesCount,
        recentScans,
        setOnline,
        addRecentScan,
        clearHistory,
        queueOfflineScan,
        syncWithBackend,
      }}
    >
      {children}
    </VeriMedContext.Provider>
  );
};

export const useVeriMedStore = () => {
  const context = useContext(VeriMedContext);
  if (context === undefined) {
    throw new Error("useVeriMedStore must be used within a VeriMedProvider");
  }
  return context;
};
