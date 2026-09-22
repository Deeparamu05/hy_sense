import React, { useState } from 'react';
import type { Employee, Gender, Department, ShiftType } from '../../types';
import { dataService } from '../../services/dataService';
import { UserPlus, X, AlertCircle } from 'lucide-react';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newEmployee: Employee) => void;
}

export const CreateEmployeeModal: React.FC<CreateEmployeeModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [gender, setGender] = useState<Gender>('Male');
  const [contact, setContact] = useState('');
  const [department, setDepartment] = useState<Department>('Production');
  const [shift, setShift] = useState<ShiftType>('Morning');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateNextId = async () => {
    try {
      const existing = await dataService.getEmployees();
      const nextNum = 1024 + existing.length;
      setEmployeeId(`WK${nextNum}`);
    } catch (err) {
      console.error('Failed to get employees for ID generation', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeName.trim()) {
      setError('Employee Name is required.');
      return;
    }
    if (!employeeId.trim()) {
      setError('Employee ID is required.');
      return;
    }
    if (!contact.trim()) {
      setError('Contact Number is required.');
      return;
    }

    const cleanContact = contact.trim();
    if (cleanContact.length < 8) {
      setError('Please enter a valid contact phone number.');
      return;
    }

    try {
      const created = await dataService.createEmployee({
        employeeName: employeeName.trim(),
        employeeId: employeeId.trim().toUpperCase(),
        gender,
        contact: cleanContact,
        department,
        shift
      });

      setEmployeeName('');
      setEmployeeId('');
      setContact('');
      onCreated(created);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create employee record.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Employee</h2>
              <p className="text-xs text-slate-500">Add worker details & generate unique HYSENSE QR token</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-2 text-xs text-red-800 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Employee Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employee Name <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                required
              />
            </div>

            {/* Employee ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Employee ID <span className="text-amber-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNextId}
                  className="text-[10px] text-amber-700 hover:underline font-mono font-bold"
                >
                  Auto-Suggest
                </button>
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. WK1024"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender <span className="text-amber-600">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Number <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Department <span className="text-amber-600">*</span>
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as Department)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="Operations">Operations</option>
                <option value="Production">Production</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Electrical">Electrical</option>
                <option value="Laboratory">Laboratory</option>
              </select>
            </div>

            {/* Shift */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Shift <span className="text-amber-600">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as ShiftType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              >
                <option value="Morning">Morning (06:00 AM – 02:00 PM)</option>
                <option value="Evening">Evening (02:00 PM – 10:00 PM)</option>
                <option value="Night">Night (10:00 PM – 06:00 AM)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Create Employee & Generate QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
