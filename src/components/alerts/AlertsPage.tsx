import React, { useState } from 'react';
import type { SafetyAlert, Employee } from '../../types';
import { AlertTriangle, ShieldAlert, CheckCircle2, Eye, Filter } from 'lucide-react';

interface AlertsPageProps {
  alerts: SafetyAlert[];
  employees: Employee[];
  onResolveAlert: (alertId: string) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  employees,
  onResolveAlert,
  onSelectEmployee
}) => {
  const [filter, setFilter] = useState<'All' | 'High' | 'Critical' | 'Resolved'>('All');

  const filteredAlerts = alerts.filter((alt) => {
    if (filter === 'All') return true;
    if (filter === 'High') return alt.exposureLevel === 'High';
    if (filter === 'Critical') return alt.exposureLevel === 'Critical';
    if (filter === 'Resolved') return alt.status === 'Resolved';
    return true;
  });

  const activeCriticalCount = alerts.filter(a => a.status === 'Active' && a.exposureLevel === 'Critical').length;
  const activeHighCount = alerts.filter(a => a.status === 'Active' && a.exposureLevel === 'High').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-red-700 uppercase tracking-widest mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Emergency Safety Incident Log</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Safety Alerts & H₂S Threshold Violations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immediate notification logs for elevated H₂S gas exposure, missed safety scans, and plant evacuations.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-red-700 uppercase font-bold">Active Critical Incidents</div>
            <div className="text-3xl font-black text-red-700 font-mono mt-1">{activeCriticalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-orange-700 uppercase font-bold">Active High Hazard Alerts</div>
            <div className="text-3xl font-black text-orange-700 font-mono mt-1">{activeHighCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center border border-orange-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-emerald-700 uppercase font-bold">Resolved Today</div>
            <div className="text-3xl font-black text-emerald-700 font-mono mt-1">{resolvedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 ml-1" />
          <span className="text-xs font-mono font-bold text-slate-500 uppercase mr-2">Filter Alerts:</span>
          {(['All', 'High', 'Critical', 'Resolved'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === item
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-slate-500 font-medium">
          Showing {filteredAlerts.length} alert records
        </span>
      </div>

      {/* ALERTS CARDS / TABLE LIST */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 font-mono text-xs">
            No safety alerts match the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const emp = employees.find((e) => e.employeeId === alert.employeeId);
            const isResolved = alert.status === 'Resolved';
            const isCritical = alert.exposureLevel === 'Critical';

            return (
              <div
                key={alert.id}
                className={`bg-white p-5 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isResolved
                    ? 'border-slate-200 opacity-85'
                    : isCritical
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-orange-200 bg-orange-50/30'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center font-bold ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isCritical
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}
                  >
                    {isResolved ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">{alert.alertType}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isCritical
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}
                      >
                        {alert.exposureLevel} ({alert.exposurePpm} ppm)
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 mt-1 space-x-2 font-medium">
                      <span>Worker: <strong className="text-slate-900 font-bold">{alert.employeeName}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>ID: <strong className="font-mono text-amber-700 font-bold">{alert.employeeId}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Dept: <strong className="text-slate-800">{alert.department}</strong></span>
                      <span className="text-slate-300">•</span>
                      <span>Shift: <strong className="text-slate-800">{alert.shift}</strong></span>
                    </div>

                    {alert.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {alert.notes}
                      </p>
                    )}

                    <div className="text-[11px] font-mono text-slate-400 mt-2">
                      Logged at: {alert.timestamp}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 shrink-0 self-end md:self-center">
                  {emp && (
                    <button
                      onClick={() => onSelectEmployee(emp)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Employee</span>
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
