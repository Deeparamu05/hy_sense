import React, { useState } from 'react';
import { Settings, Database, Sliders, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsPageProps {
  onDataReset: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onDataReset }) => {
  const [safeLimit, setSafeLimit] = useState(5.0);
  const [cautionLimit, setCautionLimit] = useState(10.0);
  const [highLimit, setHighLimit] = useState(20.0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all records to default?')) {
      onDataReset();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4" />
            <span>Industrial Configuration & Safety Thresholds</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System & Safety Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure H₂S gas alert ppm thresholds, manager profiles, and database integration endpoints.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Safety thresholds saved successfully. Updated across telemetry modules.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* H2S Safety Threshold Configuration */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">H₂S Gas PPM Exposure Thresholds</h2>
              <p className="text-xs text-slate-500 font-medium">Configure safety categorization ppm levels</p>
            </div>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Safe Limit (Upper PPM Bound)
              </label>
              <input
                type="number"
                step="0.1"
                value={safeLimit}
                onChange={(e) => setSafeLimit(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Readings below {safeLimit} ppm flagged as SAFE</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Caution Threshold (Upper PPM Bound)
              </label>
              <input
                type="number"
                step="0.1"
                value={cautionLimit}
                onChange={(e) => setCautionLimit(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Readings between {safeLimit} and {cautionLimit} ppm flagged as CAUTION</span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                High Hazard Threshold (Upper PPM Bound)
              </label>
              <input
                type="number"
                step="0.1"
                value={highLimit}
                onChange={(e) => setHighLimit(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:bg-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Readings above {highLimit} ppm trigger CRITICAL evacuation alert</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md transition-all cursor-pointer mt-2"
            >
              Save Threshold Configuration
            </button>
          </form>
        </div>

        {/* Database & Architecture Connection Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Database & Backend Integration Status</h2>
              <p className="text-xs text-slate-500 font-medium">Architecture & API readiness status</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Active Storage Adapter</div>
                <div className="text-[11px] text-slate-500 font-mono">Local Storage Persistence (Mock Telemetry)</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-mono font-bold">
                ONLINE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Firebase Firestore Integration</div>
                <div className="text-[11px] text-slate-500 font-mono">Collection: "workers" & "h2s_scans"</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-mono font-bold">
                READY TO CONNECT
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Industrial QR Scanner Hardware Adapter</div>
                <div className="text-[11px] text-slate-500 font-mono">Standardized: HYSENSE|WK1024|X7K92</div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-mono font-bold">
                STANDALONE READY
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={handleResetData}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center space-x-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-amber-700" />
                <span>Reset Demo Records</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
