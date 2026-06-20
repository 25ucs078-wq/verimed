import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "../theme/colors";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { api } from "../lib/api";
import { offlineDb } from "../lib/offlineDb";
import { useVeriMedStore } from "../lib/store";

export default function ReportSubmission() {
  const { batchNumber: paramBatch } = useLocalSearchParams<{ batchNumber: string }>();
  const { isOnline, loadStats } = useVeriMedStore();

  const [batchNumber, setBatchNumber] = useState(paramBatch || "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      Alert.alert("Requirement", "Please enter observational notes about the suspect medicine.");
      return;
    }

    setSubmitting(true);
    
    // Simulate slight upload progress
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (isOnline) {
        // Online submit
        await api.submitReport({
          notes,
          batch_number: batchNumber || undefined,
          latitude: 12.9716, // Bangalore default coordinates
          longitude: 77.5946,
          region: "South Asia",
        });
      } else {
        // Offline submit: save to outbox
        await offlineDb.queueScanAction({
          scan_type: "report_submission",
          timestamp: new Date().toISOString(),
          latitude: 12.9716,
          longitude: 77.5946,
          region: "South Asia",
          metadata: JSON.stringify({
            batch_number: batchNumber,
            notes,
            offline_queued_report: true,
          }),
        });
        await loadStats();
      }

      setSubmitted(true);
    } catch (e: any) {
      Alert.alert("Report failed", e.message || "Failed to submit report. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <GlassCard style={styles.successCard} intensity={50}>
          <View style={styles.successCircle}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Report Logged</Text>
          <Text style={styles.successDesc}>
            {isOnline
              ? "Your report has been successfully transmitted to regulatory channels for investigation."
              : "No connection detected. Your report has been saved to the offline outbox and will sync automatically when online."}
          </Text>
          <GlassButton title="Dismiss" onPress={() => router.back()} style={{ width: "100%" }} />
        </GlassCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>File Regulatory Report</Text>
          <Text style={styles.closeBtn} onPress={() => router.back()}>Cancel</Text>
        </View>

        <Text style={styles.instructions}>
          If you suspect a medicine is counterfeit, expired, or recalled, submit packaging details. Reports are sent directly to the manufacturer and regional drug inspectors.
        </Text>

        {/* Form Card */}
        <GlassCard style={styles.formCard} intensity={40}>
          {/* Batch number input */}
          <Text style={styles.inputLabel}>Batch / Serial Code (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={batchNumber}
            onChangeText={setBatchNumber}
            placeholder="e.g. CNT-200004"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />

          {/* Notes description input */}
          <Text style={styles.inputLabel}>Suspect Characteristics (Required)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="e.g., The color hologram is static, print layout seems misaligned, medicine caps look damaged..."
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
          />
        </GlassCard>

        {/* Submit */}
        <View style={styles.footer}>
          {submitting ? (
            <ActivityIndicator size="large" color={colors.counterfeit} />
          ) : (
            <GlassButton
              title={isOnline ? "Transmit Report Now" : "Save Offline Queue"}
              variant="danger"
              onPress={handleSubmit}
            />
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textLight,
  },
  closeBtn: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  formCard: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 12,
    color: colors.textLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  footer: {
    marginTop: 10,
  },
  successCard: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
  },
  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(45, 224, 194, 0.1)",
    borderWidth: 2,
    borderColor: colors.authentic,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successCheck: {
    color: colors.authentic,
    fontSize: 30,
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textLight,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
});
