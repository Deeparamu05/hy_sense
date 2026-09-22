import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import type { NavTab } from './components/layout/Sidebar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { EmployeeList } from './components/employees/EmployeeList';
import { CreateEmployeeModal } from './components/employees/CreateEmployeeModal';
import { QRCodeModal } from './components/employees/QRCodeModal';
import { EmployeeDetailModal } from './components/employees/EmployeeDetailModal';
import { AttendancePage } from './components/attendance/AttendancePage';
import { H2SMonitoringPage } from './components/h2s/H2SMonitoringPage';
import { AlertsPage } from './components/alerts/AlertsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';

import { dataService } from './services/dataService';
import type { Employee, AttendanceRecord, H2SScanRecord, SafetyAlert } from './types';

const MainDashboardApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Mapping URL paths to Tab IDs
  const getTabFromPath = (path: string): NavTab => {
    const p = path.toLowerCase();
    if (p === '/dashboard') return 'dashboard';
    if (p === '/employees') return 'employees';
    if (p === '/attendance') return 'attendance';
    if (p === '/h2s-monitoring') return 'h2s';
    if (p === '/alerts') return 'alerts';
    if (p === '/reports') return 'reports';
    if (p === '/settings') return 'settings';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<NavTab>(getTabFromPath(window.location.pathname));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Sync tab with URL on load and back/forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Update URL when tab changes
  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    const path = tab === 'h2s' ? '/h2s-monitoring' : `/${tab}`;
    window.history.pushState({}, '', path);
  };

  // State data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [h2sScans, setH2sScans] = useState<H2SScanRecord[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [qrModalState, setQrModalState] = useState<{ isOpen: boolean; employee: Employee | null; isJustCreated: boolean }>({
    isOpen: false,
    employee: null,
    isJustCreated: false
  });
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<Employee | null>(null);

  // Load state from dataService API
  const refreshData = async () => {
    try {
      const [empData, attData, h2sData, alertsData] = await Promise.all([
        dataService.getEmployees(),
        dataService.getAttendanceRecords(),
        dataService.getH2SScans(),
        dataService.getAlerts()
      ]);
      setEmployees(empData);
      setAttendance(attData);
      setH2sScans(h2sData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      // Ensure we are at a valid dashboard subpath if authenticated
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        window.history.replaceState({}, '', '/dashboard');
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-mono text-sm">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-bold text-slate-700">Initializing HYSENSE Safety Hub...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated and not at root, redirect to root/login
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    return <LoginPage />;
  }

  // Handle Employee Created
  const handleEmployeeCreated = async (newEmp: Employee) => {
    setIsCreateModalOpen(false);
    await refreshData();
    setQrModalState({
      isOpen: true,
      employee: newEmp,
      isJustCreated: true
    });
  };

  const handleOpenQR = (emp: Employee) => {
    setQrModalState({
      isOpen: true,
      employee: emp,
      isJustCreated: false
    });
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await dataService.resolveAlert(alertId, 'Resolved by Manager in Web Dashboard');
      await refreshData();
    } catch (err) {
      console.error('Error resolving alert', err);
    }
  };

  const unresolvedAlertCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        activeAlerts={alerts}
        onNavigateToAlerts={() => handleSelectTab('alerts')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          unresolvedAlertCount={unresolvedAlertCount}
        />

        {/* Main Content View Container */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardHome
              employees={employees}
              attendance={attendance}
              h2sScans={h2sScans}
              alerts={alerts}
              onNavigateTab={(tab) => handleSelectTab(tab)}
              onOpenCreateEmployee={() => setIsCreateModalOpen(true)}
              onSelectEmployee={(emp) => setSelectedDetailEmployee(emp)}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeList
              employees={employees}
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onOpenQR={handleOpenQR}
              onSelectEmployee={(emp) => setSelectedDetailEmployee(emp)}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage attendanceRecords={attendance} onRefreshData={refreshData} />
          )}

          {activeTab === 'h2s' && (
            <H2SMonitoringPage h2sScans={h2sScans} employees={employees} onRefreshData={refreshData} />
          )}

          {activeTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              employees={employees}
              onResolveAlert={handleResolveAlert}
              onSelectEmployee={(emp) => setSelectedDetailEmployee(emp)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsPage
              employees={employees}
              attendance={attendance}
              h2sScans={h2sScans}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage onDataReset={refreshData} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <CreateEmployeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleEmployeeCreated}
      />

      <QRCodeModal
        isOpen={qrModalState.isOpen}
        employee={qrModalState.employee}
        isJustCreated={qrModalState.isJustCreated}
        onClose={() => setQrModalState({ isOpen: false, employee: null, isJustCreated: false })}
      />

      <EmployeeDetailModal
        isOpen={!!selectedDetailEmployee}
        employee={selectedDetailEmployee}
        onClose={() => setSelectedDetailEmployee(null)}
        attendanceRecords={attendance}
        h2sScanRecords={h2sScans}
        alertRecords={alerts}
        onOpenQR={handleOpenQR}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainDashboardApp />
    </AuthProvider>
  );
};

export default App;
