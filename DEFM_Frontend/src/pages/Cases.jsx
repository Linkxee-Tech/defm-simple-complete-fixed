// src/pages/Cases.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  User,
  AlertCircle,
  Eye,
  Trash2,
  Folder,
  Activity,
  ClipboardCheck,
} from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { casesAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CASE_STATUS_OPTIONS = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Closed', value: 'closed' },
  { label: 'Archived', value: 'archived' },
];

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    assigned_to: '',
    incident_date: '',
    location: '',
    client_name: '',
    client_contact: '',
  });
  const [selectedCase, setSelectedCase] = useState(null);

  const canManageCases = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (canManageCases) {
      fetchUsers();
    } else if (user) {
      setFormData((prev) => ({ ...prev, assigned_to: user.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageCases, user]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await casesAPI.list({ limit: 200 });
      setCases(response.data);
    } catch (err) {
      console.error('Failed to load cases', err);
      setError(err.response?.data?.detail || 'Failed to load cases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.list({ limit: 200 });
      setUsers(response.data);
    } catch (err) {
      console.warn('Unable to load user list for assignment', err);
      setUsers([]);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      assigned_to: user?.id || '',
      incident_date: '',
      location: '',
      client_name: '',
      client_contact: '',
    });
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
        incident_date: formData.incident_date ? new Date(formData.incident_date).toISOString() : null,
        location: formData.location || null,
        client_name: formData.client_name || null,
        client_contact: formData.client_contact || null,
      };

      await casesAPI.create(payload);
      await fetchCases();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to create case', err);
      alert(err.response?.data?.detail || 'Failed to create case.');
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (!canManageCases) return;
    if (!window.confirm('Are you sure you want to delete this case?')) return;

    try {
      await casesAPI.delete(caseId);
      await fetchCases();
      if (selectedCase?.id === caseId) {
        setSelectedCase(null);
      }
    } catch (err) {
      console.error('Failed to delete case', err);
      alert(err.response?.data?.detail || 'Failed to delete case.');
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const matchesSearch = filters.search
        ? [
            item.title,
            item.case_number,
            item.assigned_to_user?.full_name,
            item.description,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
        : true;

      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, filters]);

  const stats = useMemo(() => {
    const total = cases.length;
    const active = cases.filter((c) => c.status === 'open' || c.status === 'in_progress').length;
    const high = cases.filter((c) => c.priority === 'high' || c.priority === 'critical').length;
    const closed = cases.filter((c) => c.status === 'closed').length;

    return [
      { label: 'Total Cases', value: total, icon: Folder, color: 'bg-blue-500' },
      { label: 'Active Cases', value: active, icon: Activity, color: 'bg-green-500' },
      { label: 'High Priority', value: high, icon: AlertCircle, color: 'bg-yellow-500' },
      { label: 'Closed Cases', value: closed, icon: ClipboardCheck, color: 'bg-gray-500' },
    ];
  }, [cases]);

  const formatStatusBadge = (status) => {
    const map = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPriorityBadge = (priority) => {
    const map = {
      low: 'bg-slate-100 text-slate-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return map[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loading fullScreen text="Loading cases..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-600 mt-1">Track ongoing investigations and assign workloads in real time.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Case
          </button>
          <button
            onClick={fetchCases}
            className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by title, case number, investigator or description"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Statuses</option>
              {CASE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option value="all">All Priorities</option>
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium">No cases found</p>
            <p className="text-sm">Try adjusting your filters or create a new case.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investigator</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.case_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${formatStatusBadge(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${formatPriorityBadge(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="h-4 w-4 text-gray-400" />
                        {item.assigned_to_user?.full_name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium flex items-center justify-end gap-3">
                      <button
                        onClick={() => navigate(`/cases/${item.id}`)}
                        className="text-primary-600 hover:text-primary-800 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" /> View
                      </button>
                      {canManageCases && (
                        <button
                          onClick={() => handleDeleteCase(item.id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
        }}
        title="Create New Case"
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleCreateCase}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {CASE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
              <input
                type="datetime-local"
                value={formData.incident_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, incident_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus.border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Contact</label>
              <input
                type="text"
                value={formData.client_contact}
                onChange={(e) => setFormData((prev) => ({ ...prev, client_contact: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save Case
            </button>
          </div>
        </form>
      </Modal>

      {/* Case Details Modal */}
      {selectedCase && (
        <Modal
          isOpen={Boolean(selectedCase)}
          onClose={() => setSelectedCase(null)}
          title={selectedCase.title}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Case Number</p>
                <p className="font-medium text-gray-900">{selectedCase.case_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">{selectedCase.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Assigned Investigator</p>
                <p className="font-medium text-gray-900">{selectedCase.assigned_to_user?.full_name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedCase.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Description</p>
              <p className="bg-gray-50 rounded-lg p-4 text-gray-800 text-sm leading-relaxed">
                {selectedCase.description || 'No description provided.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Client Name</p>
                <p className="font-medium text-gray-900">{selectedCase.client_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Client Contact</p>
                <p className="font-medium text.gray-900">{selectedCase.client_contact || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{selectedCase.location || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-gray-500">Incident Date</p>
                <p className="font-medium text-gray-900">
                  {selectedCase.incident_date ? new Date(selectedCase.incident_date).toLocaleString() : 'Not recorded'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/cases/${selectedCase.id}`)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                View full details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cases;
