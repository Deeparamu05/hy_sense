import type { Employee, AttendanceRecord, H2SScanRecord, SafetyAlert } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const dataService = {
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  async getEmployeeById(employeeId: string): Promise<Employee | undefined> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}`);
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error('Failed to fetch employee');
    return res.json();
  },

  async createEmployee(employeeData: Omit<Employee, 'id' | 'qrId' | 'qrData' | 'createdAt' | 'status'>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create employee');
    }
    return res.json();
  },

  async updateEmployee(updated: Employee): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${updated.employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Failed to update employee');
    return res.json();
  },

  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    const res = await fetch(`${API_BASE}/attendance`);
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  async createAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
    if (!res.ok) throw new Error('Failed to create attendance');
    return res.json();
  },

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const res = await fetch(`${API_BASE}/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update attendance');
    return res.json();
  },

  async getH2SScans(): Promise<H2SScanRecord[]> {
    const res = await fetch(`${API_BASE}/strips`);
    if (!res.ok) throw new Error('Failed to fetch strips');
    return res.json();
  },

  async getAlerts(): Promise<SafetyAlert[]> {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async createH2SScan(scan: Omit<H2SScanRecord, 'id'>): Promise<H2SScanRecord> {
    const res = await fetch(`${API_BASE}/strips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scan)
    });
    if (!res.ok) throw new Error('Failed to create H2S scan');
    return res.json();
  },

  async updateH2SScan(id: string, updates: Partial<H2SScanRecord>): Promise<H2SScanRecord> {
    const res = await fetch(`${API_BASE}/strips/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update H2S scan');
    return res.json();
  },

  async createAlert(alert: Omit<SafetyAlert, 'id'>): Promise<SafetyAlert> {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },

  async resolveAlert(alertId: string, notes?: string): Promise<SafetyAlert> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Resolved', notes: notes || '' })
    });
    if (!res.ok) throw new Error('Failed to resolve alert');
    return res.json();
  },

  async getDashboardStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }
};
