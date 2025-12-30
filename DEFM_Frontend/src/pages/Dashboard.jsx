// src/pages/Dashboard.jsx
import React from 'react';
import { Folder, Shield, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

  const stats = [
    {
      title: 'Total Cases',
      value: '24',
      icon: Folder,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Evidence',
      value: '156',
      icon: Shield,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Pending Actions',
      value: '7',
      icon: Activity,
      color: 'bg-yellow-500',
      change: '-3%'
    },
    {
      title: 'Integrity Alerts',
      value: '2',
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '+1'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Evidence Collected',
      case: 'Case #2023-001',
      officer: 'John Smith',
      time: '2 hours ago',
      type: 'collection'
    },
    {
      id: 2,
      action: 'Chain of Custody Updated',
      case: 'Case #2023-005',
      officer: 'Sarah Johnson',
      time: '4 hours ago',
      type: 'custody'
    },
    {
      id: 3,
      action: 'New Case Created',
      case: 'Case #2023-008',
      officer: 'Mike Davis',
      time: '1 day ago',
      type: 'case'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}! {/* Updated this line */}
        </h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'collection' ? 'bg-green-500' :
                  activity.type === 'custody' ? 'bg-blue-500' : 'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.case}</p>
                  <p className="text-xs text-gray-500">By {activity.officer} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors">
              Create New Case
            </button>
            <button className="w-full border border-primary-500 text-primary-500 py-3 px-4 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              Add Evidence
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;