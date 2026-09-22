import type { Employee, AttendanceRecord, H2SScanRecord, SafetyAlert } from '../types';

// Dynamic today date for demo records - ensures attendance filter works on any run date
const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const YESTERDAY = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1024',
    employeeId: 'WK1024',
    employeeName: 'Arjun Sharma',
    gender: 'Male',
    contact: '+91 98765 43210',
    department: 'Production',
    shift: 'Morning',
    qrId: 'X7K92',
    qrData: 'HYSENSE|WK1024|X7K92',
    createdAt: '2026-01-15T08:00:00Z',
    status: 'On Shift'
  },
  {
    id: 'emp-1025',
    employeeId: 'WK1025',
    employeeName: 'Priya Patel',
    gender: 'Female',
    contact: '+91 98123 45678',
    department: 'Operations',
    shift: 'Morning',
    qrId: 'M3R88',
    qrData: 'HYSENSE|WK1025|M3R88',
    createdAt: '2026-01-16T09:15:00Z',
    status: 'On Shift'
  },
  {
    id: 'emp-1026',
    employeeId: 'WK1026',
    employeeName: 'Rajesh Kumar',
    gender: 'Male',
    contact: '+91 97654 32109',
    department: 'Maintenance',
    shift: 'Morning',
    qrId: 'P9L12',
    qrData: 'HYSENSE|WK1026|P9L12',
    createdAt: '2026-01-18T10:30:00Z',
    status: 'On Shift'
  },
  {
    id: 'emp-1027',
    employeeId: 'WK1027',
    employeeName: 'Ananya Verma',
    gender: 'Female',
    contact: '+91 96543 21098',
    department: 'Laboratory',
    shift: 'Morning',
    qrId: 'K4W90',
    qrData: 'HYSENSE|WK1027|K4W90',
    createdAt: '2026-01-20T11:00:00Z',
    status: 'On Shift'
  },
  {
    id: 'emp-1028',
    employeeId: 'WK1028',
    employeeName: 'Vikram Singh',
    gender: 'Male',
    contact: '+91 95432 10987',
    department: 'Electrical',
    shift: 'Morning',
    qrId: 'Q2T54',
    qrData: 'HYSENSE|WK1028|Q2T54',
    createdAt: '2026-02-01T08:30:00Z',
    status: 'On Shift'
  },
  {
    id: 'emp-1029',
    employeeId: 'WK1029',
    employeeName: 'Suresh Menon',
    gender: 'Male',
    contact: '+91 94321 09876',
    department: 'Production',
    shift: 'Evening',
    qrId: 'Z9Y33',
    qrData: 'HYSENSE|WK1029|Z9Y33',
    createdAt: '2026-02-05T09:00:00Z',
    status: 'Off Shift'
  },
  {
    id: 'emp-1030',
    employeeId: 'WK1030',
    employeeName: 'Deepak Joshi',
    gender: 'Male',
    contact: '+91 93210 98765',
    department: 'Maintenance',
    shift: 'Evening',
    qrId: 'R1A77',
    qrData: 'HYSENSE|WK1030|R1A77',
    createdAt: '2026-02-10T14:20:00Z',
    status: 'Off Shift'
  },
  {
    id: 'emp-1031',
    employeeId: 'WK1031',
    employeeName: 'Kavita Reddy',
    gender: 'Female',
    contact: '+91 92109 87654',
    department: 'Operations',
    shift: 'Night',
    qrId: 'H5B44',
    qrData: 'HYSENSE|WK1031|H5B44',
    createdAt: '2026-02-14T16:00:00Z',
    status: 'Off Shift'
  },
  {
    id: 'emp-1032',
    employeeId: 'WK1032',
    employeeName: 'Rohan Gupta',
    gender: 'Male',
    contact: '+91 91098 76543',
    department: 'Electrical',
    shift: 'Night',
    qrId: 'J8K21',
    qrData: 'HYSENSE|WK1032|J8K21',
    createdAt: '2026-02-20T10:10:00Z',
    status: 'Off Shift'
  },
  {
    id: 'emp-1033',
    employeeId: 'WK1033',
    employeeName: 'Sunita Das',
    gender: 'Female',
    contact: '+91 90987 65432',
    department: 'Laboratory',
    shift: 'Evening',
    qrId: 'L3M99',
    qrData: 'HYSENSE|WK1033|L3M99',
    createdAt: '2026-03-01T12:00:00Z',
    status: 'Off Shift'
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employeeId: 'WK1024',
    employeeName: 'Arjun Sharma',
    department: 'Production',
    shift: 'Morning',
    date: TODAY,
    inTime: '05:55 AM',
    outTime: null,
    status: 'Currently Working'
  },
  {
    id: 'att-2',
    employeeId: 'WK1025',
    employeeName: 'Priya Patel',
    department: 'Operations',
    shift: 'Morning',
    date: TODAY,
    inTime: '06:02 AM',
    outTime: null,
    status: 'Currently Working'
  },
  {
    id: 'att-3',
    employeeId: 'WK1026',
    employeeName: 'Rajesh Kumar',
    department: 'Maintenance',
    shift: 'Morning',
    date: TODAY,
    inTime: '06:10 AM',
    outTime: null,
    status: 'Currently Working'
  },
  {
    id: 'att-4',
    employeeId: 'WK1027',
    employeeName: 'Ananya Verma',
    department: 'Laboratory',
    shift: 'Morning',
    date: TODAY,
    inTime: '06:00 AM',
    outTime: null,
    status: 'Currently Working'
  },
  {
    id: 'att-5',
    employeeId: 'WK1028',
    employeeName: 'Vikram Singh',
    department: 'Electrical',
    shift: 'Morning',
    date: TODAY,
    inTime: '06:15 AM',
    outTime: null,
    status: 'Currently Working'
  },
  {
    id: 'att-6',
    employeeId: 'WK1029',
    employeeName: 'Suresh Menon',
    department: 'Production',
    shift: 'Night',
    date: TODAY,
    inTime: '10:00 PM',
    outTime: '06:00 AM',
    status: 'Completed'
  },
  {
    id: 'att-7',
    employeeId: 'WK1030',
    employeeName: 'Deepak Joshi',
    department: 'Maintenance',
    shift: 'Night',
    date: TODAY,
    inTime: '10:05 PM',
    outTime: '06:00 AM',
    status: 'Completed'
  },
  {
    id: 'att-8',
    employeeId: 'WK1031',
    employeeName: 'Kavita Reddy',
    department: 'Operations',
    shift: 'Evening',
    date: TODAY,
    inTime: '-',
    outTime: null,
    status: 'Absent'
  }
];

export const INITIAL_H2S_SCANS: H2SScanRecord[] = [
  {
    id: 'h2s-101',
    employeeId: 'WK1024',
    employeeName: 'Arjun Sharma',
    department: 'Production',
    shift: 'Morning',
    timestamp: `${TODAY} 11:30 AM`,
    initialStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 05:56 AM`,
    },
    finalStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 11:28 AM`,
    },
    exposurePpm: 18.4,
    exposureLevel: 'High',
    analysisStatus: 'Completed'
  },
  {
    id: 'h2s-102',
    employeeId: 'WK1025',
    employeeName: 'Priya Patel',
    department: 'Operations',
    shift: 'Morning',
    timestamp: `${TODAY} 11:15 AM`,
    initialStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 06:03 AM`,
    },
    finalStripScan: {
      scanned: false,
      scannedAt: null,
    },
    exposurePpm: 3.1,
    exposureLevel: 'Safe',
    analysisStatus: 'Completed'
  },
  {
    id: 'h2s-103',
    employeeId: 'WK1026',
    employeeName: 'Rajesh Kumar',
    department: 'Maintenance',
    shift: 'Morning',
    timestamp: `${TODAY} 11:00 AM`,
    initialStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 06:12 AM`,
    },
    finalStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 10:55 AM`,
    },
    exposurePpm: 24.8,
    exposureLevel: 'Critical',
    analysisStatus: 'Completed'
  },
  {
    id: 'h2s-104',
    employeeId: 'WK1027',
    employeeName: 'Ananya Verma',
    department: 'Laboratory',
    shift: 'Morning',
    timestamp: `${TODAY} 10:45 AM`,
    initialStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 06:01 AM`,
    },
    finalStripScan: {
      scanned: false,
      scannedAt: null,
    },
    exposurePpm: 7.6,
    exposureLevel: 'Caution',
    analysisStatus: 'Completed'
  },
  {
    id: 'h2s-105',
    employeeId: 'WK1028',
    employeeName: 'Vikram Singh',
    department: 'Electrical',
    shift: 'Morning',
    timestamp: `${TODAY} 10:30 AM`,
    initialStripScan: {
      scanned: true,
      scannedAt: `${TODAY} 06:16 AM`,
    },
    finalStripScan: {
      scanned: false,
      scannedAt: null,
    },
    exposurePpm: 1.2,
    exposureLevel: 'Safe',
    analysisStatus: 'Completed'
  }
];

export const INITIAL_ALERTS: SafetyAlert[] = [
  {
    id: 'alt-501',
    employeeId: 'WK1026',
    employeeName: 'Rajesh Kumar',
    department: 'Maintenance',
    shift: 'Morning',
    alertType: 'H₂S Exposure Exceeded',
    exposureLevel: 'Critical',
    exposurePpm: 24.8,
    timestamp: `${TODAY} 11:00 AM`,
    status: 'Active',
    notes: 'Immediate evacuation initiated in Valve Chamber Area B. Medical checkup recommended.'
  },
  {
    id: 'alt-502',
    employeeId: 'WK1024',
    employeeName: 'Arjun Sharma',
    department: 'Production',
    shift: 'Morning',
    alertType: 'H₂S Exposure Exceeded',
    exposureLevel: 'High',
    exposurePpm: 18.4,
    timestamp: `${TODAY} 11:30 AM`,
    status: 'Active',
    notes: 'Elevated H2S detected after strip processing in Desulfurization Unit.'
  },
  {
    id: 'alt-503',
    employeeId: 'WK1031',
    employeeName: 'Kavita Reddy',
    department: 'Operations',
    shift: 'Evening',
    alertType: 'Strip Scan Missing',
    exposureLevel: 'Caution',
    exposurePpm: 0,
    timestamp: `${TODAY} 07:15 AM`,
    status: 'Resolved',
    notes: 'Worker completed delayed shift entry scan.'
  },
  {
    id: 'alt-504',
    employeeId: 'WK1032',
    employeeName: 'Rohan Gupta',
    department: 'Electrical',
    shift: 'Night',
    alertType: 'H₂S Exposure Exceeded',
    exposureLevel: 'High',
    exposurePpm: 15.2,
    timestamp: `${YESTERDAY} 04:20 AM`,
    status: 'Resolved',
    notes: 'Assigned to low-exposure zone for subsequent 48h.'
  }
];
