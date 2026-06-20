import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Send, X } from 'lucide-react';
import { VeriMedProvider, useVeriMedStore } from './lib/store';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { RiskRadar } from './pages/RiskRadar';
import { AlertsFeed } from './pages/AlertsFeed';
import { SyncCenter } from './pages/SyncCenter';
import { ProfileSettings } from './pages/ProfileSettings';
import { BottomSheet } from './components/BottomSheet';
import { GlassCard } from './components/GlassCard';
import { GlassButton } from './components/GlassButton';
import { ResultGauge } from './components/ResultGauge';
import { api } from './lib/api';

const AppContent: React.FC = () => {
  const { isOnline, pendingOutboxCount, syncWithBackend } = useVeriMedStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Results viewer state
  const [selectedScanResult, setSelectedScanResult] = useState<any | null>(null);

  // Report submission state
  const [reportBatchNumber, setReportBatchNumber] = useState<string>('');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  const handleOpenReport = (batch: string) => {
    setReportBatchNumber(batch);
    setReportNotes('');
    setReportSubmitted(false);
    setShowReportSheet(true);
  };

  const handleReportSubmit = async () => {
    if (!reportNotes.trim()) {
      alert("Please enter observational notes about the suspect medicine.");
      return;
    }

    setReportSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

    try {
      if (isOnline) {
        await api.submitReport({
          notes: reportNotes,
          batch_number: reportBatchNumber || undefined,
          latitude: 12.9716,
          longitude: 77.5946,
          region: "South Asia",
        });
      } else {
        // Queue in local outbox
        const outboxStr = localStorage.getItem("verimed_outbox") || "[]";
        const outbox = JSON.parse(outboxStr);
        outbox.push({
          scan_type: "report_submission",
          timestamp: new Date().toISOString(),
          latitude: 12.9716,
          longitude: 77.5946,
          region: "South Asia",
          metadata: {
            batch_number: reportBatchNumber,
            notes: reportNotes,
            offline_report: true,
          }
        });
        localStorage.setItem("verimed_outbox", JSON.stringify(outbox));
        // Force refresh store statistics
        window.dispatchEvent(new Event("storage"));
      }
      setReportSubmitted(true);
    } catch (e: any) {
      alert("Could not submit report: " + e.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <Scanner
            setSelectedScanResult={setSelectedScanResult}
            setReportBatchNumber={handleOpenReport}
            setActiveTab={setActiveTab}
          />
        );
      case 'map':
        return <RiskRadar />;
      case 'alerts':
        return <AlertsFeed />;
      case 'sync':
        return <SyncCenter />;
      case 'profile':
        return <ProfileSettings />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            setSelectedScanResult={setSelectedScanResult}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background-start flex">
      {/* Animated Mesh Glow Background Gradients */}
      <div className="absolute -top-[120px] -right-[120px] w-[320px] h-[320px] rounded-full bg-brand-teal/15 blur-[90px] pointer-events-none mesh-glow-cyan" />
      <div className="absolute -bottom-[120px] -left-[120px] w-[360px] h-[360px] rounded-full bg-brand-violet/12 blur-[100px] pointer-events-none mesh-glow-violet" />

      {/* Aggregate sidebar navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        pendingOutboxCount={pendingOutboxCount}
      />

      {/* Main content grid view */}
      <main className="flex-1 p-6 md:pl-72 max-w-5xl mx-auto w-full pb-28 md:pb-6">
        {renderActivePage()}
      </main>

      {/* Detailed Result Bottom Sheet */}
      <BottomSheet
        visible={selectedScanResult !== null}
        onClose={() => setSelectedScanResult(null)}
        title="Verification analysis"
      >
        {selectedScanResult && (
          <div className="space-y-6">
            {/* Radial gauge */}
            <div className="flex justify-center py-2">
              <ResultGauge
                score={selectedScanResult.confidence_score}
                isAuthentic={selectedScanResult.is_authentic}
              />
            </div>

            {/* Banner status text */}
            <div
              className={`border-1.5 rounded-2xl py-3.5 px-4 text-center font-bold tracking-wide border
                ${selectedScanResult.is_authentic 
                  ? 'border-brand-teal/20 text-brand-teal bg-brand-teal/5' 
                  : 'border-brand-red/20 text-brand-red bg-brand-red/5'}`}
            >
              {selectedScanResult.is_authentic ? '✓ Verified Authentic Medicine' : '⚠ Suspect Counterfeit / Diverted'}
              {selectedScanResult.is_offline && (
                <div className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">Checked offline via local cache</div>
              )}
            </div>

            {/* Product specifics */}
            <GlassCard className="p-4" intensity="low">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Specifications</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>Brand Name</span>
                  <span className="font-semibold text-slate-200">{selectedScanResult.brand_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>Generic Formula</span>
                  <span className="font-semibold text-slate-200">{selectedScanResult.generic_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                  <span>Manufacturer</span>
                  <span className="font-semibold text-slate-200">{selectedScanResult.manufacturer_name}</span>
                </div>
                <div className="flex justify-between pb-1 text-slate-400">
                  <span>Batch Number</span>
                  <span className="font-semibold text-slate-200">{selectedScanResult.batch_number}</span>
                </div>
              </div>
            </GlassCard>

            {/* SmartID verification details */}
            {selectedScanResult.qr_scan && (
              <GlassCard className="p-4" intensity="low">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Signature Verification</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                    <span>Cryptographical Check</span>
                    <span className={`font-semibold ${selectedScanResult.signature_valid ? 'text-brand-teal' : 'text-brand-red'}`}>
                      {selectedScanResult.signature_valid ? 'VALID SIGNATURE' : 'INVALID / CORRUPT'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2 text-slate-400">
                    <span>Batch status</span>
                    <span className="font-semibold text-slate-200 uppercase">{selectedScanResult.batch_status}</span>
                  </div>
                  <div className="flex justify-between pb-1 text-slate-400">
                    <span>Digital Token</span>
                    <span className="font-mono text-[9px] text-slate-300 truncate max-w-[180px]">{selectedScanResult.signature_token}</span>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Print metric deviations (if packaging scan) */}
            {!selectedScanResult.qr_scan && (
              <GlassCard className="p-4" intensity="low">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Metric Deviation Index</h4>
                <div className="space-y-3.5">
                  {/* Logo alignment */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Logo alignment</span>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(selectedScanResult.deviations.logo * 100)}% / max 5%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${selectedScanResult.deviations.logo > 0.05 ? 'bg-brand-red' : 'bg-brand-teal'}`}
                        style={{ width: `${Math.min(100, selectedScanResult.deviations.logo * 1000)}%` }}
                      />
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Typography kerning</span>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(selectedScanResult.deviations.typography * 100)}% / max 3%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${selectedScanResult.deviations.typography > 0.03 ? 'bg-brand-red' : 'bg-brand-teal'}`}
                        style={{ width: `${Math.min(100, selectedScanResult.deviations.typography * 1000)}%` }}
                      />
                    </div>
                  </div>

                  {/* Color gamut */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300 font-semibold">
                      <span>Color spectrum fidelity</span>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(selectedScanResult.deviations.color_gamut * 100)}% / max 7%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${selectedScanResult.deviations.color_gamut > 0.07 ? 'bg-brand-red' : 'bg-brand-teal'}`}
                        style={{ width: `${Math.min(100, selectedScanResult.deviations.color_gamut * 1000)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Flagged anomalies triggers */}
            {!selectedScanResult.is_authentic && selectedScanResult.flagged_categories && selectedScanResult.flagged_categories.length > 0 && (
              <div className="bg-brand-red/5 border border-brand-red/20 p-4 rounded-2xl">
                <h5 className="text-xs font-bold text-brand-red uppercase tracking-wider mb-2">Flagged Anomaly Triggers</h5>
                <ul className="text-xs text-slate-200 space-y-1 list-disc list-inside">
                  {selectedScanResult.flagged_categories.map((cat: string, i: number) => (
                    <li key={i}>{cat}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bottom buttons */}
            <div className="flex flex-col gap-3">
              {!selectedScanResult.is_authentic && (
                <GlassButton
                  title="File suspicious product report"
                  variant="danger"
                  onClick={() => {
                    setSelectedScanResult(null);
                    handleOpenReport(selectedScanResult.batch_number);
                  }}
                  className="w-full"
                />
              )}
              <GlassButton
                title="Dismiss"
                variant="primary"
                onClick={() => setSelectedScanResult(null)}
                className="w-full"
              />
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Suspicious report sheet */}
      <BottomSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        title="File Suspect Product Report"
      >
        {reportSubmitted ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Regulatory Report Logged</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isOnline 
                  ? 'Your investigation report has been dispatched to regional drug controllers.'
                  : 'Report saved in offline queue outbox. Will sync automatically upon connection.'}
              </p>
            </div>
            <GlassButton
              title="Dismiss"
              onClick={() => setShowReportSheet(false)}
              className="w-full"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Submit observed packaging details. Suspicious logs are flagged for investigation.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Number</label>
                <input 
                  type="text" 
                  value={reportBatchNumber}
                  onChange={(e) => setReportBatchNumber(e.target.value)}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-teal/50"
                  placeholder="e.g. CNT-200004"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suspect characteristics</label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-glass-border rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-brand-teal/50 resize-none"
                  placeholder="smudged branding print, static non-responsive hologram tags, incorrect font spacing..."
                />
              </div>
            </div>

            <div className="pt-2">
              <GlassButton
                title={isOnline ? "Submit Report" : "Queue Offline Report"}
                variant="danger"
                loading={reportSubmitting}
                onClick={handleReportSubmit}
                className="w-full"
                icon={<Send size={14} />}
              />
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default function App() {
  return (
    <VeriMedProvider>
      <AppContent />
    </VeriMedProvider>
  );
}
