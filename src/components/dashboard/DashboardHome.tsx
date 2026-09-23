import React, { useState, useEffect } from 'react';
import type { Employee, AttendanceRecord, H2SScanRecord, SafetyAlert } from '../../types';
import { dataService } from '../../services/dataService';
import { Users, UserCheck, Clock, AlertTriangle, ShieldCheck, Sun, Moon, Sunrise, ArrowUpRight, Activity } from 'lucide-react';

interface DashboardHomeProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  h2sScans: H2SScanRecord[];
  alerts: SafetyAlert[];
  onNavigateTab: (tab: 'employees' | 'attendance' | 'h2s' | 'alerts') => void;
  onOpenCreateEmployee: () => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  employees,
  attendance,
  h2sScans,
  alerts,
  onNavigateTab,
  onOpenCreateEmployee,
  onSelectEmployee
}) => {
  // Compute all metrics from REAL data — no fake offsets
  const [stats, setStats] = useState<any>({
    totalWorkers: 0,
    presentToday: 0,
    currentlyOnShift: 0,
    activeAlerts: 0,
    morningWorkers: 0,
    eveningWorkers: 0,
    nightWorkers: 0,
    safeCount: 0,
    cautionCount: 0,
    highCount: 0,
    criticalCount: 0
  });

  useEffect(() => {
    dataService.getDashboardStats().then(setStats).catch(console.error);
  }, [employees, attendance, h2sScans, alerts]);

  const criticalAlerts = alerts.filter(a => a.status === 'Active' && a.exposureLevel === 'Critical').length;

  const getStatusBadge = (level: string) => {
    switch (level) {
      case 'Safe':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Safe</span>;
      case 'Caution':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Caution</span>;
      case 'High':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'Critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Critical</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" />
            <span>Industrial Safety Operational Dashboard</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            Safety Monitoring System
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Real-time tracking of active industrial workers, attendance verification, and hydrogen sulfide (H₂S) gas exposure scans across shift zones.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">          <button
            onClick={onOpenCreateEmployee}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-all cursor-pointer"
          >
            <span>+ Create Employee</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL WORKERS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">TOTAL WORKERS</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-mono">{stats.totalWorkers}</div>
            <span className="text-xs text-slate-500 font-semibold">Registered</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>5 Departments</span>
            <button onClick={() => onNavigateTab('employees')} className="text-sky-700 hover:underline flex items-center font-bold">
              View <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* PRESENT TODAY */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">PRESENT TODAY</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-mono">{stats.presentToday}</div>
            <span className="text-xs text-emerald-700 font-bold font-mono">
              {stats.totalWorkers > 0 ? Math.round((stats.presentToday / stats.totalWorkers) * 100) : 0}% Attendance
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Daily Logged</span>
            <button onClick={() => onNavigateTab('attendance')} className="text-emerald-700 hover:underline flex items-center font-bold">
              Details <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* CURRENTLY ON SHIFT */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">CURRENTLY ON SHIFT</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-slate-900 font-mono">{stats.currentlyOnShift}</div>
            <span className="text-xs text-cyan-700 font-bold font-mono">Active Duty</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Morning Shift</span>
            <button onClick={() => onNavigateTab('attendance')} className="text-cyan-700 hover:underline flex items-center font-bold">
              Live Shifts <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* H₂S ALERTS */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">H₂S ALERTS</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-amber-700 font-mono">{stats.activeAlerts}</div>
            <span className="text-xs text-amber-800 font-bold font-mono">Action Required</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{criticalAlerts} Critical Level</span>
            <button onClick={() => onNavigateTab('alerts')} className="text-amber-700 hover:underline flex items-center font-bold">
              Review Alerts <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SHIFT OVERVIEW SECTION */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Shift Distribution & Operational Schedule</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">3 Active Rotations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Morning Shift */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-amber-400 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Sunrise className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Morning Shift</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">06:00 AM – 02:00 PM</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-700 font-mono">{stats.morningWorkers}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Workers</div>
            </div>
          </div>

          {/* Evening Shift */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-cyan-400 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Evening Shift</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">02:00 PM – 10:00 PM</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-cyan-700 font-mono">{stats.eveningWorkers}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Workers</div>
            </div>
          </div>

          {/* Night Shift */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-400 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Night Shift</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">10:00 PM – 06:00 AM</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-indigo-700 font-mono">{stats.nightWorkers}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase font-bold">Workers</div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" />
              <span>Recent Worker Activity & Exposure Monitoring</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest attendance check-ins and backend H₂S strip exposure readings</p>
          </div>
          <button
            onClick={() => onNavigateTab('h2s')}
            className="text-xs text-amber-700 font-bold hover:underline flex items-center"
          >
            View H₂S Monitor <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {h2sScans.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-bold text-slate-700">No H₂S scan data available</span>
            <p className="text-xs text-slate-400">Worker gas exposure readings will appear here once scans are completed.</p>
          </div>
        ) : (
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
                  <th className="py-3.5 px-4">H₂S Level</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {h2sScans.map((scan) => {
                  const emp = employees.find(e => e.employeeId === scan.employeeId);
                  const att = attendance.find(a => a.employeeId === scan.employeeId);
                  return (
                    <tr
                      key={scan.id}
                      onClick={() => emp && onSelectEmployee(emp)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {scan.employeeId}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {scan.employeeName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {scan.department}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                          {scan.shift}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {att?.inTime || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {att?.outTime || (att?.status === 'Currently Working' ? 'Active On Shift' : '-')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {scan.finalStripScan?.scanned ? (
                          <span className={scan.exposurePpm > 15 ? 'text-red-600' : scan.exposurePpm > 5 ? 'text-amber-600' : 'text-emerald-600'}>
                            {scan.exposurePpm} ppm
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(scan.exposureLevel)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
