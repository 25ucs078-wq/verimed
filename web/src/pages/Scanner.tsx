import React, { useState } from 'react';
import { Camera, Scan, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { useVeriMedStore } from '../lib/store';
import { api } from '../lib/api';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';

interface ScannerProps {
  setSelectedScanResult: (res: any) => void;
  setReportBatchNumber: (batch: string) => void;
  setActiveTab: (tab: string) => void;
}

export const Scanner: React.FC<ScannerProps> = ({
  setSelectedScanResult,
  setReportBatchNumber,
  setActiveTab,
}) => {
  const { isOnline, addRecentScan, queueOfflineScan } = useVeriMedStore();
  const [scanMode, setScanMode] = useState<'image' | 'qr'>('image');
  const [scanning, setScanning] = useState(false);

  const triggerScan = async (isGenuine: boolean) => {
    if (scanning) return;
    setScanning(true);

    // Simulate scanning sweep time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      if (scanMode === 'image') {
        const mockFilename = isGenuine ? 'photo_genuine.jpg' : 'photo_cnt_fake.jpg';
        
        if (isOnline) {
          const res = await api.verifyImage(mockFilename, { lat: 12.9716, lng: 77.5946 }, 'South Asia', isGenuine ? 'GEN-100002' : 'CNT-200003');
          
          const detailedResult = {
            is_authentic: res.is_authentic,
            confidence_score: res.confidence_score,
            deviations: res.deviations,
            flagged_categories: res.flagged_categories,
            brand_name: isGenuine ? 'Prilosec' : 'Amoxil',
            generic_name: isGenuine ? 'Omeprazole' : 'Amoxicillin',
            manufacturer_name: isGenuine ? 'Merck & Co' : 'VeloPharm Ltd',
            batch_number: isGenuine ? 'GEN-100002' : 'CNT-200003',
            qr_scan: false,
          };

          addRecentScan({
            id: `scan-${Date.now()}`,
            genericName: detailedResult.generic_name,
            brandName: detailedResult.brand_name,
            manufacturerName: detailedResult.manufacturer_name,
            batchNumber: detailedResult.batch_number,
            scanType: 'image',
            isAuthentic: res.is_authentic,
            timestamp: new Date().toISOString(),
          });

          setSelectedScanResult(detailedResult);
        } else {
          // Offline Image Scan simulation
          const detailedResult = {
            is_authentic: isGenuine,
            confidence_score: isGenuine ? 0.94 : 0.42,
            deviations: {
              logo: isGenuine ? 0.02 : 0.09,
              typography: isGenuine ? 0.01 : 0.05,
              color_gamut: isGenuine ? 0.03 : 0.12,
            },
            flagged_categories: isGenuine ? [] : ['Logo Misalignment', 'Color Gamut Deviation'],
            brand_name: isGenuine ? 'Prilosec' : 'Amoxil',
            generic_name: isGenuine ? 'Omeprazole' : 'Amoxicillin',
            manufacturer_name: isGenuine ? 'Merck & Co' : 'VeloPharm Ltd',
            batch_number: isGenuine ? 'GEN-100002' : 'CNT-200003',
            qr_scan: false,
            is_offline: true,
          };

          queueOfflineScan({
            scan_type: 'image',
            latitude: 12.9716,
            longitude: 77.5946,
            region: 'South Asia',
            metadata: {
              batch_number: detailedResult.batch_number,
              is_suspicious: !isGenuine,
              offline_check: true,
            },
          });

          addRecentScan({
            id: `scan-${Date.now()}`,
            genericName: detailedResult.generic_name,
            brandName: detailedResult.brand_name,
            manufacturerName: detailedResult.manufacturer_name,
            batchNumber: detailedResult.batch_number,
            scanType: 'image',
            isAuthentic: isGenuine,
            timestamp: new Date().toISOString(),
          });

          setSelectedScanResult(detailedResult);
        }
      } else {
        // QR Code verify simulation
        const mockQRPayload = {
          unique_product_id: isGenuine ? 'prod-10922' : 'prod-fake-99',
          generic_name: isGenuine ? 'Paracetamol' : 'Sildenafil',
          brand_name: isGenuine ? 'Panadol' : 'Viagra',
          manufacturer_name: isGenuine ? 'GlaxoSmithKline' : 'AsiaVax Corp',
          manufacturer_address: 'London, UK',
          manufacturer_license_no: 'GSK-UK-992',
          batch_number: isGenuine ? 'GEN-100005' : 'CNT-200007',
          manufacturing_date: '2026-01-10',
          expiry_date: '2028-01-10',
          dosage_form: 'Tablet',
          strength: isGenuine ? '500mg' : '100mg',
          packaging_size: '20s',
          serialization_code: isGenuine ? 'SER90210' : 'SERFAKE99',
        };

        if (isOnline) {
          const res = await api.verifyQr(mockQRPayload, { lat: 9.082, lng: 8.675 }, 'Sub-Saharan Africa');
          const isAuthentic = res.signature_valid && res.batch_status === 'active';

          const detailedResult = {
            is_authentic: isAuthentic,
            confidence_score: isAuthentic ? 0.98 : 0.12,
            signature_valid: res.signature_valid,
            batch_status: res.batch_status,
            signature_token: res.signature_token,
            brand_name: mockQRPayload.brand_name,
            generic_name: mockQRPayload.generic_name,
            manufacturer_name: mockQRPayload.manufacturer_name,
            batch_number: mockQRPayload.batch_number,
            qr_scan: true,
          };

          addRecentScan({
            id: `scan-${Date.now()}`,
            genericName: detailedResult.generic_name,
            brandName: detailedResult.brand_name,
            manufacturerName: detailedResult.manufacturer_name,
            batchNumber: detailedResult.batch_number,
            scanType: 'qr',
            isAuthentic,
            timestamp: new Date().toISOString(),
          });

          setSelectedScanResult(detailedResult);
        } else {
          // Offline QR Code verify simulation
          const isAuthentic = isGenuine;

          const detailedResult = {
            is_authentic: isAuthentic,
            confidence_score: isAuthentic ? 0.96 : 0.15,
            signature_valid: isAuthentic,
            batch_status: isAuthentic ? 'active' : 'recalled',
            signature_token: isAuthentic ? 'v1_sig_offline_mock' : 'v1_sig_invalid',
            brand_name: mockQRPayload.brand_name,
            generic_name: mockQRPayload.generic_name,
            manufacturer_name: mockQRPayload.manufacturer_name,
            batch_number: mockQRPayload.batch_number,
            qr_scan: true,
            is_offline: true,
          };

          queueOfflineScan({
            scan_type: 'qr',
            latitude: 9.082,
            longitude: 8.675,
            region: 'Sub-Saharan Africa',
            metadata: {
              batch_number: detailedResult.batch_number,
              is_suspicious: !isAuthentic,
              offline_check: true,
            },
          });

          addRecentScan({
            id: `scan-${Date.now()}`,
            genericName: detailedResult.generic_name,
            brandName: detailedResult.brand_name,
            manufacturerName: detailedResult.manufacturer_name,
            batchNumber: detailedResult.batch_number,
            scanType: 'qr',
            isAuthentic,
            timestamp: new Date().toISOString(),
          });

          setSelectedScanResult(detailedResult);
        }
      }
    } catch (e: any) {
      alert(e.message || 'Error occurred during scan simulation.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
          Authenticity Viewfinder
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Perform packaging integrity audits or decodes batch serialization QR codes
        </p>
      </div>

      {/* Segment switcher */}
      <GlassCard className="p-1 flex" intensity="low">
        <button
          onClick={() => setScanMode('image')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-200
            ${scanMode === 'image' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Packaging Verification
        </button>
        <button
          onClick={() => setScanMode('qr')}
          className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-200
            ${scanMode === 'qr' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          QR Cryptography Check
        </button>
      </GlassCard>

      {/* Sweeping scan focus container */}
      <div className="relative w-full h-[280px] bg-slate-950 rounded-3xl overflow-hidden border border-glass-border flex flex-col items-center justify-center">
        {/* Cam fallback styling */}
        <div className="text-slate-600 flex flex-col items-center gap-2">
          <Camera size={44} className="stroke-1 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider">Viewfinder standby</span>
        </div>

        {/* Framing border corners */}
        <div className="absolute w-[180px] h-[180px] border-2 border-dashed border-brand-teal/40 rounded-2xl flex items-center justify-center">
          {scanning ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl text-center p-4">
              <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-3" />
              <span className="text-xs text-slate-300 font-bold tracking-wide uppercase">
                {scanMode === 'image' ? 'Analyzing logo alignment...' : 'Decrypting serialization...'}
              </span>
            </div>
          ) : (
            // Scanning laser animation sweep
            <div className="absolute top-0 bottom-0 left-0 right-0 overflow-hidden rounded-2xl pointer-events-none">
              <div 
                className="w-full h-[2px] bg-brand-teal shadow-[0_0_8px_#2de0c2] absolute left-0"
                style={{
                  animation: 'drift 2.2s infinite ease-in-out',
                }}
              />
            </div>
          )}
        </div>

        {/* Text descriptions */}
        <div className="absolute bottom-4 text-center text-xs text-slate-500 font-medium px-6">
          {scanMode === 'image' 
            ? 'Align print features inside border. Evaluates typography, dimensions, and spectrum deviations.' 
            : 'Focus on the DCGI QR tag. Decrypts security keys to check batch recalled status.'}
        </div>
      </div>

      {/* Simulator Testing Controls */}
      <GlassCard className="p-5 space-y-4" intensity="mid">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
          Dev Simulator Testing Controls
        </h4>
        <div className="flex gap-4">
          <GlassButton
            title="Simulate Genuine"
            variant="success"
            loading={scanning}
            onClick={() => triggerScan(true)}
            className="flex-1"
          />
          <GlassButton
            title="Simulate Suspect"
            variant="danger"
            loading={scanning}
            onClick={() => triggerScan(false)}
            className="flex-1"
          />
        </div>
      </GlassCard>
    </div>
  );
};
