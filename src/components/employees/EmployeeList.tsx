import React, { useState } from 'react';
import type { Employee, Department, ShiftType, EmployeeStatus } from '../../types';
import { Search, Plus, QrCode, Eye, Users } from 'lucide-react';

interface EmployeeListProps {
  employees: Employee[];
  onOpenCreate: () => void;
  onOpenQR: (emp: Employee) => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  onOpenCreate,
  onOpenQR,
  onSelectEmployee
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'All'>('All');
  const [shiftFilter, setShiftFilter] = useState<ShiftType | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'All'>('All');

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.contact.includes(searchTerm);

    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;
    const matchesShift = shiftFilter === 'All' || emp.shift === shiftFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesShift && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>Industrial Workforce Directory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Employee Records & QR Tokens
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage worker credentials, department assignments, and unique HYSENSE security QR identifiers.
          </p>
        </div>

        <div className="flex items-center space-x-3">          <button
            onClick={onOpenCreate}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Employee</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, name or contact..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as Department | 'All')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="All">All Departments</option>
              <option value="Operations">Operations</option>
              <option value="Production">Production</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Electrical">Electrical</option>
              <option value="Laboratory">Laboratory</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div className="relative">
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value as ShiftType | 'All')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="All">All Shifts</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | 'All')}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Shift">On Shift</option>
              <option value="Off Shift">Off Shift</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 px-1 pt-1 font-mono">
          <span>Showing {filteredEmployees.length} of {employees.length} workers</span>
          {(searchTerm || departmentFilter !== 'All' || shiftFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDepartmentFilter('All');
                setShiftFilter('All');
                setStatusFilter('All');
              }}
              className="text-amber-700 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* EMPLOYEE DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Employee Name</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Shift</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-xs">
                    No matching employee records found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                      {emp.employeeId}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {emp.employeeName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.gender}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-mono font-semibold">
                        {emp.shift}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {emp.contact}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          emp.status === 'On Shift'
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                            : emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectEmployee(emp)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="View Employee Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenQR(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                          title="View Unique QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View QR</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
