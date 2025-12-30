// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Folder, 
  Shield, 
  Link as LinkIcon, 
  FileText,
  Users,
  Activity,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/cases', icon: Folder, label: 'Cases' },
    { path: '/evidence', icon: Shield, label: 'Evidence' },
    { path: '/chain-of-custody', icon: LinkIcon, label: 'Chain of Custody' },
    { path: '/reports', icon: FileText, label: 'Reports' },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { path: '/users', icon: Users, label: 'User Management', adminOnly: true },
    { path: '/audit-logs', icon: Activity, label: 'Audit Logs', adminOnly: true },
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
  };

  // Combine menu items - add admin items if user is admin
  const allMenuItems = [...menuItems];
  if (user?.role === 'admin') {
    allMenuItems.push(...adminMenuItems);
  }

  return (
    <div className="w-64 bg-white h-full flex flex-col shadow-lg relative">
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden z-10"
        aria-label="Close menu"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Logo and title */}
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">DEFM</span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Digital Evidence Framework</p>
      </div>
      
      {/* User info */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'Role'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 space-y-1">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                           (item.path === '/' && location.pathname === '/dashboard');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Settings and Logout */}
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            location.pathname === '/settings'
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </Link>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
