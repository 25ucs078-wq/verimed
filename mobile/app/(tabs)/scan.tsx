import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, SafeAreaView, Pressable, Platform, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Camera } from "expo-camera";
import { colors } from "../../theme/colors";
import { GlassCard } from "../../components/glass/GlassCard";
import { GlassButton } from "../../components/glass/GlassButton";
import { ScanOverlay } from "../../components/scan/ScanOverlay";
import { ScanLaser } from "../../components/scan/ScanLaser";
import { api } from "../../lib/api";
import { offlineDb } from "../../lib/offlineDb";
import { useVeriMedStore } from "../../lib/store";

export default function ScanHub() {
  const { mode: initialMode } = useLocalSearchParams<{ mode: string }>();
  const [scanMode, setScanMode] = useState<"image" | "qr">(
    (initialMode as "image" | "qr") || "image"
  );
  
  const { isOnline, addRecentScan, loadStats } = useVeriMedStore();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setScanMode(initialMode as "image" | "qr");
    }
  }, [initialMode]);

  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === "web") {
        setHasPermission(true);
        return;
      }
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };
    checkPermission();
  }, []);

  const handleSimulateScan = async (isGenuine: boolean) => {
    if (scanning) return;
    setScanning(true);
    
    // Simulating processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      if (scanMode === "image") {
        const simulatedUri = isGenuine ? "photo_genuine.jpg" : "photo_cnt_fake.jpg";
        
        if (isOnline) {
          const res = await api.verifyImage(simulatedUri, { lat: 12.9716, lng: 77.5946 }, "South Asia", isGenuine ? "GEN-100002" : "CNT-200003");
          
          const scanRecord = {
            id: `scan-${Date.now()}`,
            genericName: isGenuine ? "Omeprazole" : "Amoxicillin",
            brandName: isGenuine ? "Prilosec" : "Amoxil",
            manufacturerName: isGenuine ? "Merck & Co" : "VeloPharm Ltd",
            batchNumber: isGenuine ? "GEN-100002" : "CNT-200003",
            scanType: "image" as const,
            isAuthentic: res.is_authentic,
            timestamp: new Date().toISOString()
          };
          addRecentScan(scanRecord);
          
          router.push({
            pathname: "/result",
            params: {
              data: JSON.stringify({
                is_authentic: res.is_authentic,
                confidence_score: res.confidence_score,
                deviations: res.deviations,
                flagged_categories: res.flagged_categories,
                brand_name: scanRecord.brandName,
                generic_name: scanRecord.genericName,
                manufacturer_name: scanRecord.manufacturerName,
                batch_number: scanRecord.batchNumber
              })
            }
          });
        } else {
          // OFFLINE Image Scan Check
          const offlineMatch = await offlineDb.getOfflineBatch(isGenuine ? "GEN-100002" : "CNT-200003");
          
          let isAuthentic = isGenuine;
          let details: any = {};
          
          if (offlineMatch) {
            isAuthentic = offlineMatch.batch.status === "active" && offlineMatch.batch.hologram_status === "genuine";
          }
          
          // Queue in local outbox
          await offlineDb.queueScanAction({
            scan_type: "image",
            timestamp: new Date().toISOString(),
            latitude: 12.9716,
            longitude: 77.5946,
            region: "South Asia",
            metadata: JSON.stringify({
              batch_number: isGenuine ? "GEN-100002" : "CNT-200003",
              is_suspicious: !isAuthentic,
              simulated_offline: true
            })
          });

          await loadStats();

          router.push({
            pathname: "/result",
            params: {
              data: JSON.stringify({
                is_authentic: isAuthentic,
                confidence_score: isAuthentic ? 0.94 : 0.42,
                deviations: {
                  logo: isAuthentic ? 0.02 : 0.09,
                  typography: isAuthentic ? 0.01 : 0.05,
                  color_gamut: isAuthentic ? 0.03 : 0.12
                },
                flagged_categories: isAuthentic ? [] : ["Logo Misalignment", "Color Gamut"],
                brand_name: isGenuine ? "Prilosec" : "Amoxil",
                generic_name: isGenuine ? "Omeprazole" : "Amoxicillin",
                manufacturer_name: isGenuine ? "Merck & Co" : "VeloPharm Ltd",
                batch_number: isGenuine ? "GEN-100002" : "CNT-200003",
                is_offline: true
              })
            }
          });
        }
      } else {
        // QR Code Scan
        const mockQRPayload = {
          unique_product_id: isGenuine ? "prod-10922" : "prod-fake-99",
          generic_name: isGenuine ? "Paracetamol" : "Sildenafil",
          brand_name: isGenuine ? "Panadol" : "Viagra",
          manufacturer_name: isGenuine ? "GlaxoSmithKline" : "AsiaVax Corp",
          manufacturer_address: "Pune, India",
          manufacturer_license_no: "SII-IND-808",
          batch_number: isGenuine ? "GEN-100005" : "CNT-200007",
          manufacturing_date: "2026-01-10",
          expiry_date: "2028-01-10",
          dosage_form: "Tablet",
          strength: isGenuine ? "500mg" : "100mg",
          packaging_size: "20s",
          serialization_code: isGenuine ? "SER90210" : "SERFAKE99"
        };

        if (isOnline) {
          const res = await api.verifyQr(mockQRPayload, { lat: 9.082, lng: 8.675 }, "Sub-Saharan Africa");
          const isAuthentic = res.signature_valid && res.batch_status === "active";
          
          const scanRecord = {
            id: `scan-${Date.now()}`,
            genericName: mockQRPayload.generic_name,
            brandName: mockQRPayload.brand_name,
            manufacturerName: mockQRPayload.manufacturer_name,
            batchNumber: mockQRPayload.batch_number,
            scanType: "qr" as const,
            isAuthentic,
            timestamp: new Date().toISOString()
          };
          addRecentScan(scanRecord);

          router.push({
            pathname: "/result",
            params: {
              data: JSON.stringify({
                is_authentic: isAuthentic,
                confidence_score: isAuthentic ? 0.98 : 0.12,
                signature_valid: res.signature_valid,
                batch_status: res.batch_status,
                signature_token: res.signature_token,
                brand_name: mockQRPayload.brand_name,
                generic_name: mockQRPayload.generic_name,
                manufacturer_name: mockQRPayload.manufacturer_name,
                batch_number: mockQRPayload.batch_number,
                qr_scan: true
              })
            }
          });
        } else {
          // OFFLINE QR code checking
          const isAuthentic = isGenuine; // Simulated
          
          await offlineDb.queueScanAction({
            scan_type: "qr",
            timestamp: new Date().toISOString(),
            latitude: 9.082,
            longitude: 8.675,
            region: "Sub-Saharan Africa",
            metadata: JSON.stringify({
              batch_number: mockQRPayload.batch_number,
              is_suspicious: !isAuthentic,
              simulated_offline: true
            })
          });

          await loadStats();

          router.push({
            pathname: "/result",
            params: {
              data: JSON.stringify({
                is_authentic: isAuthentic,
                confidence_score: isAuthentic ? 0.96 : 0.15,
                signature_valid: isAuthentic,
                batch_status: isAuthentic ? "active" : "recalled",
                signature_token: isAuthentic ? "v1_sig_offline_mock" : "v1_sig_invalid",
                brand_name: mockQRPayload.brand_name,
                generic_name: mockQRPayload.generic_name,
                manufacturer_name: mockQRPayload.manufacturer_name,
                batch_number: mockQRPayload.batch_number,
                qr_scan: true,
                is_offline: true
              })
            }
          });
        }
      }
    } catch (e: any) {
      Alert.alert("Scan Error", e.message || "An unexpected error occurred during analysis.");
    } finally {
      setScanning(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.authentic} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No camera permissions granted.</Text>
        <Text style={styles.errorSub}>Please enable camera access in your device settings.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Mode Selector Segmented Bar */}
      <View style={styles.segmentContainer}>
        <BlurView intensity={40} tint="dark" style={styles.segmentBlur}>
          <Pressable
            onPress={() => setScanMode("image")}
            style={[styles.segmentBtn, scanMode === "image" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, scanMode === "image" && styles.segmentTextActive]}>
              Packaging Scan
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setScanMode("qr")}
            style={[styles.segmentBtn, scanMode === "qr" && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, scanMode === "qr" && styles.segmentTextActive]}>
              QR / Batch Scan
            </Text>
          </Pressable>
        </BlurView>
      </View>

      {/* Main Viewfinder Section */}
      <View style={styles.viewfinderContainer}>
        {Platform.OS !== "web" ? (
          // Camera viewport on physical mobile devices
          <Camera style={StyleSheet.absoluteFillObject} />
        ) : (
          // Web fallback styling
          <View style={styles.webCameraFallback}>
            <Text style={styles.webCameraText}>[ Camera Viewport Active ]</Text>
          </View>
        )}

        <ScanOverlay
          statusText={scanMode === "image" ? "Scan Packaging Layout" : "Scan Serialization QR"}
          subText={
            scanMode === "image"
              ? "Verifying text dimensions, logos, and color gamut thresholds."
              : "Decoding regulatory batch markings."
          }
        />
        
        {scanning ? (
          <View style={styles.loadingOverlay}>
            <BlurView intensity={70} tint="dark" style={styles.loadingBlur}>
              <ActivityIndicator size="large" color={colors.authentic} />
              <Text style={styles.loadingText}>
                {scanMode === "image" ? "Analyzing structural layout..." : "Decrypting signatures..."}
              </Text>
            </BlurView>
          </View>
        ) : (
          <ScanLaser />
        )}
      </View>

      {/* Simulation Controls for testing without cameras */}
      <View style={styles.controlsContainer}>
        <GlassCard style={styles.simulatorCard} intensity={40}>
          <Text style={styles.simulatorTitle}>Simulator Testing Controls</Text>
          <View style={styles.simButtonsRow}>
            <GlassButton
              title="Simulate Genuine"
              variant="success"
              onPress={() => handleSimulateScan(true)}
              style={styles.simBtn}
              loading={scanning}
            />
            <GlassButton
              title="Simulate Suspect"
              variant="danger"
              onPress={() => handleSimulateScan(false)}
              style={styles.simBtn}
              loading={scanning}
            />
          </View>
        </GlassCard>
      </View>

      <View style={{ height: 90 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textLight,
  },
  errorSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
  segmentContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "android" ? 40 : 10,
    marginBottom: 16,
    zIndex: 10,
  },
  segmentBlur: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  segmentText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: colors.textLight,
  },
  viewfinderContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#03050C",
    position: "relative",
  },
  webCameraFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0E1122",
    justifyContent: "center",
    alignItems: "center",
  },
  webCameraText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(7, 10, 24, 0.5)",
  },
  loadingBlur: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  loadingText: {
    color: colors.textLight,
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  simulatorCard: {
    padding: 16,
  },
  simulatorTitle: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    textAlign: "center",
  },
  simButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  simBtn: {
    width: "48%",
  },
});
