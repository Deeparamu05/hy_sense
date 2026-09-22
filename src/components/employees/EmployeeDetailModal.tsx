import React, { useState } from 'react';
import type { Employee, AttendanceRecord, H2SScanRecord, SafetyAlert } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Clock, Activity, AlertTriangle, User, ShieldCheck } from 'lucide-react';

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  attendanceRecords: AttendanceRecord[];
  h2sScanRecords: H2SScanRecord[];
  alertRecords: SafetyAlert[];
  onOpenQR: (emp: Employee) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  attendanceRecords,
  h2sScanRecords,
  alertRecords,
  onOpenQR
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'h2s' | 'alerts'>('info');

  if (!isOpen || !employee) return null;

  const empAttendance = attendanceRecords.filter(a => a.employeeId === employee.employeeId);
  const empH2S = h2sScanRecords.filter(h => h.employeeId === employee.employeeId);
  const empAlerts = alertRecords.filter(a => a.employeeId === employee.employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white shadow-md flex items-center justify-center font-bold text-xl">
              {employee.employeeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{employee.employeeName}</h2>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono text-xs font-bold">
                  {employee.employeeId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {employee.department} Department • {employee.shift} Shift
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Header */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & QR</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Attendance History ({empAttendance.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('h2s')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'h2s'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>H₂S Exposure Logs ({empH2S.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-amber-600 text-amber-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts ({empAlerts.length})</span>
          </button>
        </div>



        {/* Modal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Worker Demographic Details
                </h3>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Full Name</span>
                    <span className="font-bold text-slate-900">{employee.employeeName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Employee ID</span>
                    <span className="font-mono font-bold text-amber-700">{employee.employeeId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Gender</span>
                    <span className="text-slate-700">{employee.gender}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Contact Number</span>
                    <span className="font-mono text-slate-700">{employee.contact}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="text-slate-700">{employee.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Assigned Shift</span>
                    <span className="text-slate-700">{employee.shift}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Unique QR Identifier</span>
                    <span className="font-mono text-amber-700 font-bold">{employee.qrId}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">System Enrollment</span>
                    <span className="font-mono text-slate-500">{new Date(employee.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* QR Preview Card */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Industrial Security QR Code
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <QRCodeSVG value={employee.qrData} size={140} level="H" />
                </div>
                <div className="mt-3 font-mono text-[11px] font-bold text-amber-800">
                  {employee.qrData}
                </div>
                <button
                  onClick={() => onOpenQR(employee)}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-700" />
                  <span>Expand & Download QR</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Shift Attendance History
              </h3>
              {empAttendance.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No attendance records logged for this employee yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  {empAttendance.map((att) => (
                    <div key={att.id} className="p-3.5 flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-mono font-bold text-slate-900">{att.date}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5 space-x-3">
                          <span>Shift: <span className="text-slate-700 font-semibold">{att.shift}</span></span>
                          <span>In: <span className="text-slate-700 font-mono">{att.inTime}</span></span>
                          <span>Out: <span className="text-slate-700 font-mono">{att.outTime || (att.status === 'Currently Working' ? 'On Duty' : '–')}</span></span>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        att.status === 'Currently Working'
                          ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                          : att.status === 'Completed'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : att.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === 'h2s' && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                H₂S Strip Exposure Records
              </h3>
              {empH2S.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                  No H₂S strip scan records associated with this worker yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  {empH2S.map((scan) => (
                    <div key={scan.id} className="p-3.5 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-slate-500 text-[11px]">{scan.timestamp}</div>
                        <div className="font-bold text-slate-800 mt-0.5">
                          Initial Scan: {scan.initialStripScan.scanned ? '✓ Completed' : 'Pending'} • Final Scan:{' '}
                          {scan.finalStripScan.scanned ? '✓ Completed' : 'Pending'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-amber-700">
                          {scan.exposurePpm} ppm
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-slate-600">
                          {scan.exposureLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Safety Alerts & Notifications
              </h3>
              {empAlerts.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
                  <span>Clean safety record. No incident alerts logged.</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden text-xs">
                  {empAlerts.map((alt) => (
                    <div key={alt.id} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-700">{alt.alertType}</span>
                        <span className="font-mono text-[10px] text-slate-400">{alt.timestamp}</span>
                      </div>
                      <div className="text-slate-700">
                        Level: <span className="font-bold text-amber-700">{alt.exposureLevel} ({alt.exposurePpm} ppm)</span>
                      </div>
                      {alt.notes && <div className="text-slate-500 text-[11px] italic">{alt.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
