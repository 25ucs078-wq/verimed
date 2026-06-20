import { Platform } from "react-native";

// Detect emulator local host address for iOS/Android/Web
const getBaseUrl = () => {
  if (Platform.OS === "android") {
    // 10.0.2.2 is Android emulator link to localhost
    return "http://10.0.2.2:8000/api/v1";
  }
  // Web and iOS simulator can hit localhost directly
  return "http://localhost:8000/api/v1";
};

export const API_URL = getBaseUrl();

export interface ScanLocation {
  lat: number;
  lng: number;
}

export interface QRVerifyRequest {
  unique_product_id: string;
  generic_name: string;
  brand_name: string;
  manufacturer_name: string;
  manufacturer_address?: string;
  manufacturer_license_no?: string;
  batch_number: string;
  manufacturing_date: string;
  expiry_date: string;
  dosage_form?: string;
  strength?: string;
  packaging_size?: string;
  serialization_code: string;
}

export const api = {
  verifyImage: async (
    imageUri: string,
    coords?: ScanLocation,
    region?: string,
    batchNumber?: string
  ) => {
    const formData = new FormData();
    
    // In React Native, file formats are represented as { uri, name, type }
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;
    
    // Check if running on web target vs mobile target
    if (Platform.OS === "web") {
      // Simulate file upload on web using synthetic mock file or base64 conversion
      // For testing, we just pass raw text or mock a genuine/counterfeit trigger
      const mockFile = new File([imageUri.includes("cnt") ? "counterfeit" : "genuine"], filename, { type });
      formData.append("file", mockFile);
    } else {
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type,
      } as any);
    }

    if (coords) {
      formData.append("latitude", coords.lat.toString());
      formData.append("longitude", coords.lng.toString());
    }
    if (region) {
      formData.append("region", region);
    }
    if (batchNumber) {
      formData.append("batch_number", batchNumber);
    }

    const response = await fetch(`${API_URL}/verify/image`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`CV Analysis error: ${response.statusText}`);
    }

    return response.json();
  },

  verifyQr: async (
    payload: QRVerifyRequest,
    coords?: ScanLocation,
    region?: string
  ) => {
    let url = `${API_URL}/verify/qr`;
    const queryParams: string[] = [];
    if (coords) {
      queryParams.push(`latitude=${coords.lat}`);
      queryParams.push(`longitude=${coords.lng}`);
    }
    if (region) {
      queryParams.push(`region=${encodeURIComponent(region)}`);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join("&")}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`QR Verification error: ${response.statusText}`);
    }

    return response.json();
  },

  getRiskMap: async () => {
    const response = await fetch(`${API_URL}/risk-map`);
    if (!response.ok) {
      throw new Error("Could not fetch risk map.");
    }
    return response.json();
  },

  getAlerts: async (region?: string) => {
    const url = region
      ? `${API_URL}/alerts/news?region=${encodeURIComponent(region)}`
      : `${API_URL}/alerts/news`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Could not fetch alerts.");
    }
    return response.json();
  },

  syncOfflineData: async (cachedScans: any[]) => {
    const response = await fetch(`${API_URL}/offline/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cached_scans: cachedScans }),
    });

    if (!response.ok) {
      throw new Error("Offline sync session failed.");
    }

    return response.json();
  },

  submitReport: async (reportData: {
    notes: string;
    latitude?: number;
    longitude?: number;
    region?: string;
    batch_number?: string;
  }) => {
    const response = await fetch(`${API_URL}/reports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error("Could not submit report.");
    }

    return response.json();
  },
};
