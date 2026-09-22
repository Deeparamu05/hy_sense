import React, { useState } from 'react';
import type { AttendanceRecord, Department, ShiftType, AttendanceStatus } from '../../types';
import { Clock, Search, UserCheck, UserX, CheckCircle, Play, Camera, X } from 'lucide-react';
import { CameraScanner } from '../scanner/CameraScanner';
import { dataService } from '../../services/dataService';
import type { Employee } from '../../types';

interface AttendancePageProps {
  attendanceRecords: AttendanceRecord[];
  onRefreshData?: () => void;
}

export const AttendancePage: React.FC<AttendancePageProps> = ({ attendanceRecords }) => {
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [shiftFilter, setShiftFilter] = useState<ShiftType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'All'>('All');

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedEmployee, setScannedEmployee] = useState<Employee | null>(null);
  const [scanMessage, setScanMessage] = useState<{ type: 'error'|'success', text: string } | null>(null);

  // First filter by date, then by search/dept/shift/status
  const dateFiltered = attendanceRecords.filter((rec) => rec.date === selectedDate);

  const filtered = dateFiltered.filter((rec) => {
    const matchesSearch =
      rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'All' || rec.department === departmentFilter;
    const matchesShift = shiftFilter === 'All' || rec.shift === shiftFilter;
    const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;

    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  const currentlyWorkingCount = dateFiltered.filter(a => a.status === 'Currently Working').length;
  const completedCount = dateFiltered.filter(a => a.status === 'Completed').length;
  const presentTotal = currentlyWorkingCount + completedCount;
  const absentCount = dateFiltered.filter(a => a.status === 'Absent').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Clock className="w-4 h-4" />
            <span>Industrial Shift Verification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Worker Shift Attendance Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time shift clock-ins, shift completions, and missing attendance audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          />
          <button
            onClick={() => { setIsScannerOpen(true); setScanMessage(null); }}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR</span>
          </button>
        </div>
      </div>

      {/* TODAY'S ATTENDANCE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Total Present</div>
            <div className="text-2xl font-black text-slate-900 font-mono mt-1">{presentTotal}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Currently Working</div>
            <div className="text-2xl font-black text-cyan-700 font-mono mt-1">{currentlyWorkingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center">
            <Play className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Shift Completed</div>
            <div className="text-2xl font-black text-sky-700 font-mono mt-1">{completedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">Absent Workers</div>
            <div className="text-2xl font-black text-red-700 font-mono mt-1">{absentCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter employee name or ID..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as Department | 'All')}
            className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
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
            className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="All">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | 'All')}
            className="px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          >
            <option value="All">All Attendance Statuses</option>
            <option value="Currently Working">Currently Working</option>
            <option value="Completed">Completed</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">In Time</th>
                <th className="py-3.5 px-4">Out Time</th>
                <th className="py-3.5 px-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                    {att.employeeId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {att.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {att.department}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                      {att.shift}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {att.inTime}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {att.outTime || (att.status === 'Currently Working' ? 'Active On Shift' : '-')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        att.status === 'Currently Working'
                          ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                          : att.status === 'Completed'
                          ? 'bg-sky-100 text-sky-800 border border-sky-200'
                          : att.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Camera Scanner */}
      {isScannerOpen && (
        <CameraScanner
          mode="QR"
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={async (decodedText) => {
            if (!decodedText) return;
            setIsScannerOpen(false);
            
            // Expected format: HYSENSE|WK1024|X7K92
            const parts = decodedText.split('|');
            if (parts.length < 2) {
              setScanMessage({ type: 'error', text: 'Invalid QR Format. Not recognized.' });
              return;
            }
            
            const empId = parts[1]; // e.g. WK1024
            try {
              const allEmps = await dataService.getEmployees();
              const emp = allEmps.find(e => e.employeeId === empId);
              if (emp) {
                // Automatically log attendance
                const today = new Date().toISOString().slice(0, 10);
                const existingRecord = attendanceRecords.find(r => r.employeeId === emp.employeeId && r.date === today);
                const nowString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                if (!existingRecord) {
                  await dataService.createAttendanceRecord({
                    employeeId: emp.employeeId,
                    employeeName: emp.employeeName,
                    department: emp.department,
                    shift: emp.shift,
                    date: today,
                    inTime: nowString,
                    outTime: null,
                    status: 'Currently Working'
                  });
                  setScanMessage({ type: 'success', text: `Attendance IN Recorded for ${emp.employeeName}` });
                  setScannedEmployee(emp); // show details
                } else if (existingRecord.status === 'Currently Working') {
                  await dataService.updateAttendanceRecord(existingRecord.id, {
                    outTime: nowString,
                    status: 'Completed'
                  });
                  setScanMessage({ type: 'success', text: `Attendance OUT Recorded for ${emp.employeeName}` });
                  setScannedEmployee(emp); // show details
                } else {
                  setScanMessage({ type: 'error', text: `Today's attendance already completed for ${emp.employeeName}` });
                  setScannedEmployee(null);
                }
                
                if (onRefreshData) onRefreshData();
              } else {
                setScanMessage({ type: 'error', text: `Employee ${empId} not found in database.` });
                setScannedEmployee(null);
              }
            } catch (err) {
              setScanMessage({ type: 'error', text: 'Backend Error. Could not process attendance.' });
              setScannedEmployee(null);
            }
          }}
        />
      )}

      {/* Scanned Employee Modal */}
      {scannedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">Attendance Updated Successfully</h2>
              <button onClick={() => setScannedEmployee(null)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{scannedEmployee.employeeName}</h3>
                <p className="font-mono text-emerald-700 font-bold">{scannedEmployee.employeeId}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex justify-between">
                <span>Dept: <strong>{scannedEmployee.department}</strong></span>
                <span>Shift: <strong>{scannedEmployee.shift}</strong></span>
              </div>
              <button
                onClick={() => setScannedEmployee(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Message Banner */}
      {scanMessage && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl shadow-xl flex items-center space-x-3 text-sm font-bold animate-fadeIn ${
          scanMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {scanMessage.type === 'error' ? <UserX className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
          <span>{scanMessage.text}</span>
          <button onClick={() => setScanMessage(null)} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};
