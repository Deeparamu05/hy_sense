import React, { useState } from 'react';
import type { H2SScanRecord, ExposureLevel, Department, ShiftType } from '../../types';
import { Activity, ShieldCheck, AlertTriangle, Flame, AlertOctagon, CheckCircle2, Clock, Camera, X } from 'lucide-react';
import { CameraScanner } from '../scanner/CameraScanner';
import { dataService } from '../../services/dataService';
import type { Employee } from '../../types';

interface H2SMonitoringPageProps {
  h2sScans: H2SScanRecord[];
  employees?: Employee[];
  onRefreshData?: () => void;
}

export const H2SMonitoringPage: React.FC<H2SMonitoringPageProps> = ({ h2sScans, employees = [], onRefreshData }) => {
  const [levelFilter, setLevelFilter] = useState<ExposureLevel | 'All'>('All');
  const [deptFilter, setDeptFilter] = useState<Department | 'All'>('All');
  const [shiftFilter, setShiftFilter] = useState<ShiftType | 'All'>('All');

  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [scanType, setScanType] = useState<'initial' | 'final'>('initial');
  const [scanMessage, setScanMessage] = useState<{ type: 'error'|'success', text: string } | null>(null);

  // Metrics — computed from REAL scan records, no offsets
  const safeCount = h2sScans.filter(s => s.exposureLevel === 'Safe').length;
  const cautionCount = h2sScans.filter(s => s.exposureLevel === 'Caution').length;
  const highCount = h2sScans.filter(s => s.exposureLevel === 'High').length;
  const criticalCount = h2sScans.filter(s => s.exposureLevel === 'Critical').length;

  const filtered = h2sScans.filter((s) => {
    const matchesLevel = levelFilter === 'All' || s.exposureLevel === levelFilter;
    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesShift = shiftFilter === 'All' || s.shift === shiftFilter;
    return matchesLevel && matchesDept && matchesShift;
  });

  const getLevelBadge = (level: ExposureLevel) => {
    switch (level) {
      case 'Safe':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">SAFE</span>;
      case 'Caution':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 font-mono">CAUTION</span>;
      case 'High':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 font-mono">HIGH</span>;
      case 'Critical':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 font-mono">CRITICAL</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 font-mono">PENDING</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" />
            <span>Industrial Gas Exposure Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            H₂S Strip Monitoring & Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Displays hydrogen sulfide exposure estimations ingested from worker strip scans and image processing modules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
            <span className="text-slate-800 font-bold">Backend Ingestion: ACTIVE</span>
          </div>
          <button
            onClick={() => { setIsEmployeeModalOpen(true); setSelectedEmployeeId(''); setScanMessage(null); }}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan H₂S Strip</span>
          </button>
        </div>
      </div>

      {/* SUMMARY CATEGORY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SAFE */}
        <div
          onClick={() => setLevelFilter('Safe')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            levelFilter === 'Safe' ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">SAFE (0 - 5 PPM)</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-mono">{safeCount}</div>
            <span className="text-xs text-emerald-700 font-bold font-mono">Nominal Range</span>
          </div>
        </div>

        {/* CAUTION */}
        <div
          onClick={() => setLevelFilter('Caution')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            levelFilter === 'Caution' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700">CAUTION (5 - 10 PPM)</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-mono">{cautionCount}</div>
            <span className="text-xs text-amber-700 font-bold font-mono">Elevated</span>
          </div>
        </div>

        {/* HIGH */}
        <div
          onClick={() => setLevelFilter('High')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            levelFilter === 'High' ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20' : 'border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700">HIGH (10 - 20 PPM)</span>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-orange-700 font-mono">{highCount}</div>
            <span className="text-xs text-orange-700 font-bold font-mono">Hazardous Zone</span>
          </div>
        </div>

        {/* CRITICAL */}
        <div
          onClick={() => setLevelFilter('Critical')}
          className={`bg-white p-5 rounded-3xl border transition-all cursor-pointer shadow-sm ${
            levelFilter === 'Critical' ? 'border-red-500 bg-red-50/50 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-700">CRITICAL (&gt; 20 PPM)</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-red-700 font-mono">{criticalCount}</div>
            <span className="text-xs text-red-700 font-bold font-mono">Evacuate Alert</span>
          </div>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as ExposureLevel | 'All')}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="All">All Exposure Levels</option>
            <option value="Safe">Safe</option>
            <option value="Caution">Caution</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as Department | 'All')}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="All">All Departments</option>
            <option value="Operations">Operations</option>
            <option value="Production">Production</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Electrical">Electrical</option>
            <option value="Laboratory">Laboratory</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value as ShiftType | 'All')}
            className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>

        {levelFilter !== 'All' && (
          <button onClick={() => setLevelFilter('All')} className="text-xs text-amber-700 font-bold hover:underline">
            Clear Exposure Filter
          </button>
        )}
      </div>

      {/* H2S EXPOSURE LOGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Initial Strip Scan</th>
                <th className="py-3.5 px-4">Final Strip Scan</th>
                <th className="py-3.5 px-4">Exposure Level (PPM)</th>
                <th className="py-3.5 px-4">Analysis Status</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                    {scan.employeeId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {scan.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {scan.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                      {scan.shift}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {scan.initialStripScan.scanned ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-mono text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Scanned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {scan.finalStripScan.scanned ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-mono text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Scanned</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{scan.exposurePpm} ppm</span>
                      {getLevelBadge(scan.exposureLevel)}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                      {scan.analysisStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {scan.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Select Employee Modal */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Select Employee for Scan</h2>
              <button onClick={() => setIsEmployeeModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scan Type</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setScanType('initial')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${scanType === 'initial' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    Initial Strip
                  </button>
                  <button
                    onClick={() => setScanType('final')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border ${scanType === 'final' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                  >
                    Final Strip
                  </button>
                </div>
              </div>

              <button
                disabled={!selectedEmployeeId}
                onClick={() => { setIsEmployeeModalOpen(false); setIsScannerOpen(true); }}
                className="w-full py-3 mt-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all"
              >
                Proceed to Scanner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner */}
      {isScannerOpen && (
        <CameraScanner
          mode="H2S"
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={async (_, capturedImageBase64) => {
            setIsScannerOpen(false);
            if (!capturedImageBase64) return;
            
            const emp = employees.find(e => e.employeeId === selectedEmployeeId);
            if (!emp) return;

            console.log("Image analysis started");
            
            // Mock Image Processing
            // Randomly calculate ppm between 0 and 25 for prototype
            const mockPpm = Math.floor(Math.random() * 26);
            let computedLevel: ExposureLevel = 'Safe';
            if (mockPpm > 20) computedLevel = 'Critical';
            else if (mockPpm > 10) computedLevel = 'High';
            else if (mockPpm > 5) computedLevel = 'Caution';

            console.log("Analysis completed", { exposurePpm: mockPpm, exposureLevel: computedLevel });

            try {
              const today = new Date().toISOString().slice(0, 10);
              
              if (scanType === 'initial') {
                const newScan = {
                  employeeId: emp.employeeId,
                  employeeName: emp.employeeName,
                  department: emp.department,
                  shift: emp.shift,
                  date: today,
                  initialStripScan: { scanned: true, imageBase64: capturedImageBase64 },
                  finalStripScan: { scanned: false },
                  exposureLevel: 'Pending' as ExposureLevel,
                  exposurePpm: 0,
                  analysisStatus: 'Pending Final Scan' as any,
                  timestamp: new Date().toISOString()
                };
                await dataService.createH2SScan(newScan);
                setScanMessage({ type: 'success', text: `Initial H₂S scan saved for ${emp.employeeName}` });
              } else {
                // Find existing initial scan for today
                const existingScan = h2sScans.find(s => s.employeeId === emp.employeeId && s.date === today && s.initialStripScan.scanned);
                
                if (existingScan) {
                  await dataService.updateH2SScan(existingScan.id, {
                    finalStripScan: { scanned: true, imageBase64: capturedImageBase64 },
                    exposureLevel: computedLevel,
                    exposurePpm: mockPpm,
                    analysisStatus: 'Analysis Complete' as any
                  });
                  setScanMessage({ type: 'success', text: `Final H₂S scan saved for ${emp.employeeName}` });

                  if (computedLevel === 'High' || computedLevel === 'Critical') {
                    await dataService.createAlert({
                      employeeId: emp.employeeId,
                      employeeName: emp.employeeName,
                      type: 'H2S_EXPOSURE',
                      severity: computedLevel === 'Critical' ? 'Critical' : 'High',
                      message: `Detected ${computedLevel} H2S Exposure (${mockPpm} ppm)`,
                      status: 'Active',
                      timestamp: new Date().toISOString()
                    });
                  }
                } else {
                  setScanMessage({ type: 'error', text: `No initial scan found today for ${emp.employeeName}. Please scan initial strip first.` });
                  return;
                }
              }
              
              if (onRefreshData) onRefreshData();
            } catch (err) {
              setScanMessage({ type: 'error', text: 'Error saving H2S scan to backend.' });
            }
          }}
        />
      )}

      {/* Global Message Banner */}
      {scanMessage && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-bold animate-fadeIn ${
          scanMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {scanMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 text-red-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{scanMessage.text}</span>
          <button onClick={() => setScanMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};
