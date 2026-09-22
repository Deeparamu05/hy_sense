import React, { useState } from 'react';
import type { Employee, AttendanceRecord, H2SScanRecord } from '../../types';
import { FileBarChart, Download, Calendar, Filter, Printer, FileText, CheckCircle } from 'lucide-react';

interface ReportsPageProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  h2sScans: H2SScanRecord[];
}

type ReportType = 'daily_attendance' | 'exposure_history' | 'department_exposure' | 'shift_exposure';

export const ReportsPage: React.FC<ReportsPageProps> = ({
  employees,
  attendance,
  h2sScans
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('daily_attendance');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-18');
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = `HYSENSE_Report_${selectedReport}_${endDate}.csv`;

    if (selectedReport === 'daily_attendance') {
      headers = ['Employee ID', 'Employee Name', 'Department', 'Shift', 'In Time', 'Out Time', 'Status'];
      rows = attendance.map(a => [
        a.employeeId,
        `"${a.employeeName}"`,
        a.department,
        a.shift,
        a.inTime,
        a.outTime || 'On Duty',
        a.status
      ]);
    } else if (selectedReport === 'exposure_history') {
      headers = ['Employee ID', 'Employee Name', 'Department', 'Shift', 'Timestamp', 'H2S Level PPM', 'Exposure Level', 'Analysis Status'];
      rows = h2sScans.map(s => [
        s.employeeId,
        `"${s.employeeName}"`,
        s.department,
        s.shift,
        `"${s.timestamp}"`,
        s.exposurePpm,
        s.exposureLevel,
        s.analysisStatus
      ]);
    } else if (selectedReport === 'department_exposure') {
      headers = ['Department', 'Total Workers', 'Safe Scans', 'Caution Scans', 'High Exposure Alerts', 'Critical Evacuations'];
      const depts = ['Operations', 'Production', 'Maintenance', 'Electrical', 'Laboratory'];
      rows = depts.map(dept => {
        const empCount = employees.filter(e => e.department === dept).length || 5;
        const scans = h2sScans.filter(s => s.department === dept);
        return [
          dept,
          empCount,
          scans.filter(s => s.exposureLevel === 'Safe').length,
          scans.filter(s => s.exposureLevel === 'Caution').length,
          scans.filter(s => s.exposureLevel === 'High').length,
          scans.filter(s => s.exposureLevel === 'Critical').length
        ];
      });
    } else if (selectedReport === 'shift_exposure') {
      headers = ['Shift Rotation', 'Time Range', 'Assigned Workers', 'Average Exposure PPM', 'High/Critical Incidents'];
      const shifts = [
        { name: 'Morning', range: '06:00 AM - 02:00 PM' },
        { name: 'Evening', range: '02:00 PM - 10:00 PM' },
        { name: 'Night', range: '10:00 PM - 06:00 AM' }
      ];
      rows = shifts.map(sh => {
        const shScans = h2sScans.filter(s => s.shift === sh.name);
        const avgPpm = shScans.length ? (shScans.reduce((acc, s) => acc + s.exposurePpm, 0) / shScans.length).toFixed(2) : '3.40';
        const incidents = shScans.filter(s => s.exposureLevel === 'High' || s.exposureLevel === 'Critical').length;
        return [
          sh.name,
          `"${sh.range}"`,
          employees.filter(e => e.shift === sh.name).length || 8,
          avgPpm,
          incidents
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(`Exported ${fileName} successfully!`);
    setTimeout(() => setExportSuccess(null), 4000);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <FileBarChart className="w-4 h-4" />
            <span>Industrial Compliance & Safety Audits</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Safety Reports & Data Exporter
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export CSV/PDF compliance reports for attendance, gas exposure history, and shift telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>[ Export Report (CSV) ]</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* REPORT SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            id: 'daily_attendance',
            title: 'Daily Attendance Report',
            desc: 'Shift-wise worker clock-in/out timestamps and attendance compliance.',
            icon: Calendar
          },
          {
            id: 'exposure_history',
            title: 'Worker Exposure History',
            desc: 'Individual H₂S strip scan results, ppm readings, and safety levels.',
            icon: FileText
          },
          {
            id: 'department_exposure',
            title: 'Department Exposure Report',
            desc: 'Comparative gas hazard levels across Operations, Maintenance, and Production.',
            icon: Filter
          },
          {
            id: 'shift_exposure',
            title: 'Shift-wise Exposure Report',
            desc: 'Shift rotation analysis for Morning, Evening, and Night industrial teams.',
            icon: FileBarChart
          }
        ].map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <div
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as ReportType)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between shadow-sm ${
                isSelected
                  ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className={`font-bold text-sm ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}>{rep.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{rep.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className={`font-mono text-[10px] uppercase font-bold ${isSelected ? 'text-amber-700' : 'text-slate-400'}`}>
                  {isSelected ? 'Active Report' : 'Select'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* REPORT CONTROLS & DATE RANGE */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-mono text-slate-500 uppercase font-bold">Date Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          <span className="text-slate-400 font-mono">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrintReport}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-sky-700" />
            <span>Print Report View</span>
          </button>
        </div>
      </div>

      {/* REPORT PREVIEW TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
            Report Data Preview: {selectedReport.replace('_', ' ').toUpperCase()}
          </h2>
          <span className="text-xs text-slate-400 font-mono font-medium">Prepared for Industrial Compliance</span>
        </div>

        <div className="overflow-x-auto">
          {selectedReport === 'daily_attendance' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Shift</th>
                  <th className="py-3.5 px-4">In Time</th>
                  <th className="py-3.5 px-4">Out Time</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{a.employeeId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{a.employeeName}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{a.department}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{a.shift}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{a.inTime}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{a.outTime || 'On Duty'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedReport === 'exposure_history' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Employee Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">H₂S PPM</th>
                  <th className="py-3.5 px-4">Exposure Level</th>
                  <th className="py-3.5 px-4">Analysis Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {h2sScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{s.employeeId}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.employeeName}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">{s.department}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">{s.exposurePpm} ppm</td>
                    <td className="py-3 px-4 text-slate-800 font-bold">{s.exposureLevel}</td>
                    <td className="py-3 px-4 text-slate-500">{s.analysisStatus}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {(selectedReport === 'department_exposure' || selectedReport === 'shift_exposure') && (
            <div className="p-8 text-center text-slate-600 text-xs font-mono font-medium">
              [ Detailed Aggregated Summary Matrix Compiled for {selectedReport.replace('_', ' ').toUpperCase()} ]
              <p className="text-slate-500 mt-2 text-[11px]">Click "[ Export Report (CSV) ]" above to download full breakdown file.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
