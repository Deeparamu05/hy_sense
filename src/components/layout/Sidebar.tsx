import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  FileBarChart,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 'dashboard' | 'employees' | 'attendance' | 'h2s' | 'alerts' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  unresolvedAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  unresolvedAlertCount
}) => {
  const { logout } = useAuth();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'h2s', label: 'H₂S Monitoring', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unresolvedAlertCount },
    { id: 'reports', label: 'Reports', icon: FileBarChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 h-screen lg:h-[calc(100vh-61px)] w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Header Close */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
            <span className="font-mono text-xs font-bold text-amber-700 uppercase">SAFETY NAVIGATION</span>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Navigation Items */}
          <div className="px-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Safety Hub Menu
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-amber-600 text-white'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => {
              logout();
              window.history.replaceState({}, '', '/');
            }}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
