export type Gender = 'Male' | 'Female' | 'Other';
export type Department = 'Operations' | 'Production' | 'Maintenance' | 'Electrical' | 'Laboratory';
export type ShiftType = 'Morning' | 'Evening' | 'Night';
export type EmployeeStatus = 'Active' | 'On Shift' | 'Off Shift' | 'On Leave';

export interface Employee {
  id: string; // internal UUID / document ID
  employeeId: string; // e.g. WK1024
  employeeName: string;
  gender: Gender;
  contact: string;
  department: Department;
  shift: ShiftType;
  qrId: string; // e.g. X7K92
  qrData: string; // e.g. HYSENSE-WK1024-X7K92
  createdAt: string;
  status: EmployeeStatus;
  avatarUrl?: string;
}

export type AttendanceStatus = 'Present' | 'Completed' | 'Currently Working' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  shift: ShiftType;
  date: string; // YYYY-MM-DD
  inTime: string; // e.g. 06:05 AM
  outTime: string | null; // e.g. 02:00 PM or null if currently working
  status: AttendanceStatus;
}

export type ExposureLevel = 'Safe' | 'Caution' | 'High' | 'Critical' | 'Pending' | 'Low' | 'Moderate' | 'Very High / Critical';
export type AnalysisStatus = 'Completed' | 'Processing' | 'Pending' | 'Failed' | 'Analysis Complete' | 'Pending Final Scan';

export interface H2SScanRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  shift: ShiftType;
  date?: string;
  timestamp: string; // e.g. 2026-09-18 08:30 AM
  initialStripScan: {
    scanned: boolean;
    scannedAt?: string;
    imageUrl?: string;
    imageBase64?: string;
  };
  finalStripScan: {
    scanned: boolean;
    scannedAt?: string | null;
    imageUrl?: string;
    imageBase64?: string;
  };
  exposurePpm: number; // approximate estimated H2S ppm level
  estimatedPpmDisplay?: string; // e.g. "~10 - 20 ppm (Est.)"
  stripColor?: string; // detected strip colour name e.g. "Dark Brown"
  exposureLevel: ExposureLevel;
  analysisStatus: AnalysisStatus;
}

export type AlertType = 'H₂S Exposure Exceeded' | 'Strip Scan Missing' | 'Shift Overtime Safety Check' | 'Emergency SOS Triggered';
export type AlertStatus = 'Active' | 'Resolved';

export interface SafetyAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  shift: ShiftType;
  alertType?: AlertType;
  type?: string;
  severity?: string;
  message?: string;
  exposureLevel?: ExposureLevel;
  exposurePpm?: number;
  timestamp: string;
  status: AlertStatus;
  notes?: string;
}

export interface ShiftInfo {
  name: ShiftType;
  timeRange: string;
  activeWorkers: number;
  totalAssigned: number;
}

export interface ManagerProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  avatarUrl?: string;
}
