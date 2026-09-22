import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Bell, LogOut, Menu, ChevronDown, CheckCircle } from 'lucide-react';
import type { SafetyAlert } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  activeAlerts: SafetyAlert[];
  onNavigateToAlerts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  activeAlerts,
  onNavigateToAlerts
}) => {
  const { manager, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unresolvedCount = activeAlerts.filter(a => a.status === 'Active').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-3 transition-all shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Sidebar Toggle + Brand Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-slate-900 tracking-wide font-mono">
                  HY<span className="text-amber-600">SENSE</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono font-bold tracking-widest bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                  H₂S Safety Hub
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center space-x-3 lg:space-x-4">

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unresolvedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                  {unresolvedCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50 text-slate-800 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">Safety Notifications</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      {unresolvedCount} Active
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigateToAlerts();
                    }}
                    className="text-xs text-amber-700 hover:underline font-bold"
                  >
                    View All
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {activeAlerts.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mb-2" />
                      <span>All safety zones nominal. No active alerts.</span>
                    </div>
                  ) : (
                    activeAlerts.slice(0, 4).map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigateToAlerts();
                        }}
                        className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                            alert.exposureLevel === 'Critical' ? 'bg-red-600' : 'bg-amber-500'
                          }`}
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{alert.alertType}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp.split(' ')[1]}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            Worker <span className="text-slate-900 font-bold">{alert.employeeName}</span> ({alert.employeeId}) • Level:{' '}
                            <span className={alert.exposureLevel === 'Critical' ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>
                              {alert.exposureLevel} ({alert.exposurePpm} ppm)
                            </span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-1.5 pl-3 pr-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm">
                {manager?.name?.charAt(0) || 'M'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                  {manager?.name || 'Manager'}
                </div>
                <div className="text-[10px] text-amber-700 font-mono truncate font-bold">
                  Safety Officer
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{manager?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{manager?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                    window.history.replaceState({}, '', '/');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors cursor-pointer mt-1 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
