// src/pages/Dashboard.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Shield, Activity, AlertTriangle, PlusCircle, PackagePlus, FileBarChart2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { casesAPI, healthCheck } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'healthy', 'error'

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await casesAPI.dashboard();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setError(err.response?.data?.detail || 'Failed to load dashboard data. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkApiHealth = useCallback(async () => {
    try {
      setApiStatus('checking');
      await healthCheck();
      setApiStatus('healthy');
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('error');
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    checkApiHealth();
  }, [loadDashboard, checkApiHealth]);

  const stats = useMemo(() => {
    const statValues = dashboardData?.stats;
    return [
      {
        title: 'Total Cases',
        value: statValues?.total_cases ?? 0,
        icon: Folder,
        color: 'bg-blue-500',
      },
      {
        title: 'Active Evidence',
        value: statValues?.active_evidence ?? 0,
        icon: Shield,
        color: 'bg-green-500',
      },
      {
        title: 'Pending Actions',
        value: statValues?.pending_actions ?? 0,
        icon: Activity,
        color: 'bg-yellow-500',
      },
      {
        title: 'Integrity Alerts',
        value: statValues?.integrity_alerts ?? 0,
        icon: AlertTriangle,
        color: 'bg-red-500',
      },
    ];
  }, [dashboardData]);

  const recentActivities = dashboardData?.recent_activities ?? [];

  const quickActions = useMemo(
    () => [
      {
        label: 'Create New Case',
        onClick: () => navigate('/cases#new'),
        primary: true,
        icon: PlusCircle,
      },
      {
        label: 'Add Evidence',
        onClick: () => navigate('/evidence#new'),
        primary: false,
        icon: PackagePlus,
      },
      {
        label: 'Generate Report',
        onClick: () => navigate('/reports'),
        primary: false,
        icon: FileBarChart2,
      },
    ],
    [navigate]
  );

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.full_name || user?.username || 'Investigator'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay ahead of forensic operations with real-time insights.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* API Status Indicator */}
          <div className="flex items-center gap-2 text-sm">
            {apiStatus === 'checking' && (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-gray-500">Checking API...</span>
              </>
            )}
            {apiStatus === 'healthy' && (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">API Healthy</span>
              </>
            )}
            {apiStatus === 'error' && (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600">API Error</span>
                <button
                  onClick={checkApiHealth}
                  className="ml-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                >
                  Retry
                </button>
              </>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>{error}</div>
          <button
            onClick={loadDashboard}
            className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Last 7 days</span>
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No recent investigative activity recorded.</div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      activity.activity_type === 'collection'
                        ? 'bg-green-500'
                        : activity.activity_type === 'custody'
                        ? 'bg-blue-500'
                        : activity.activity_type === 'integrity'
                        ? 'bg-red-500'
                        : 'bg-purple-500'
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.case_number}</p>
                    <p className="text-xs text-gray-500">
                      By {activity.officer} • {activity.time_ago}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 ${
                    action.primary
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
