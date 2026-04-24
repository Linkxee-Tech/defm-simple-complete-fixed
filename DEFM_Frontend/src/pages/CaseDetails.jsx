// src/pages/CaseDetails.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Clock, User, MapPin, 
  AlertCircle, FileText, Package, Activity, Save, X
} from 'lucide-react';
import { casesAPI, evidenceAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

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

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assigned_to: '',
    incident_date: '',
    location: '',
    client_name: '',
    client_contact: ''
  });

  const canEditCase = useMemo(() => {
    if (!user || !caseData) return false;
    // Admin can edit any case
    if (user.role === 'admin') return true;
    // Manager can edit any case
    if (user.role === 'manager') return true;
    // Investigator can only edit if assigned to this case
    if (user.role === 'investigator' && caseData.assigned_to === user.id) return true;
    return false;
  }, [user, caseData]);

  const canDeleteCase = user?.role === 'admin' || user?.role === 'manager';
  const canManageAssignments = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchCaseDetails();
    fetchEvidence();
    if (canManageAssignments) {
      fetchUsers();
    } else {
      setUsers([]);
    }
  }, [id, canManageAssignments]);

  const fetchCaseDetails = async () => {
    try {
      const response = await casesAPI.get(id);
      setCaseData(response.data);
      setEditForm({
        title: response.data.title || '',
        description: response.data.description || '',
        status: response.data.status || 'open',
        priority: response.data.priority || 'medium',
        assigned_to: response.data.assigned_to || '',
        incident_date: response.data.incident_date ? response.data.incident_date.slice(0, 16) : '',
        location: response.data.location || '',
        client_name: response.data.client_name || '',
        client_contact: response.data.client_contact || ''
      });
    } catch (error) {
      console.error('Error fetching case:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await evidenceAPI.list({ case_id: id });
      setEvidence(response.data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.list({ limit: 200 });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const payload = {
        title: editForm.title,
        description: editForm.description || null,
        status: editForm.status,
        priority: editForm.priority,
        assigned_to: editForm.assigned_to ? Number(editForm.assigned_to) : null,
        incident_date: editForm.incident_date ? new Date(editForm.incident_date).toISOString() : null,
        location: editForm.location || null,
        client_name: editForm.client_name || null,
        client_contact: editForm.client_contact || null,
      };

      await casesAPI.update(id, payload);
      await fetchCaseDetails();
      setShowEditModal(false);
      alert('Case updated successfully!');
    } catch (error) {
      console.error('Error updating case:', error);
      alert(error.response?.data?.detail || 'Failed to update case');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDeleteCase) {
      alert('You do not have permission to delete cases.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await casesAPI.delete(id);
        navigate('/cases');
      } catch (error) {
        console.error('Error deleting case:', error);
        alert(error.response?.data?.detail || 'Failed to delete case');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Loading fullScreen text="Loading case details..." />;
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Case Not Found</h2>
        <p className="text-gray-600 mb-4">The requested case could not be found.</p>
        <button
          onClick={() => navigate('/cases')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Back to Cases
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cases')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <p className="text-gray-600">Case #{caseData.case_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEditCase && (
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDeleteCase && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
              {caseData.status.replace('_', ' ')}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Priority:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(caseData.priority)}`}>
              {caseData.priority}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            Created: {new Date(caseData.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Details
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'evidence'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Evidence ({evidence.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Activity
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Case Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{caseData.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </label>
                    <p className="text-gray-900">{caseData.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
                    <p className="text-gray-900">
                      {caseData.incident_date 
                        ? new Date(caseData.incident_date).toLocaleString() 
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Assigned To
                    </label>
                    <p className="text-gray-900">{caseData.assigned_to_user?.full_name || 'Unassigned'}</p>
                  </div>
                </div>
              </div>

              {caseData.client_name && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                      <p className="text-gray-900">{caseData.client_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Contact</label>
                      <p className="text-gray-900">{caseData.client_contact || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div>
              {evidence.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No evidence items found for this case.</p>
                  <button
                    onClick={() => navigate('/evidence')}
                    className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                  >
                    Add Evidence
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {evidence.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {item.evidence_type}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/evidence/${item.id}`)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View Details ->
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Activity log feature coming soon.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit Case</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
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
                    value={editForm.priority}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value }))}
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
                    value={editForm.assigned_to}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={!canManageAssignments}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.role})
                      </option>
                    ))}
                  </select>
                  {!canManageAssignments && (
                    <p className="text-xs text-gray-500 mt-1">Only admin/manager can reassign cases.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.incident_date}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, incident_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    type="text"
                    value={editForm.client_name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, client_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Contact</label>
                  <input
                    type="text"
                    value={editForm.client_contact}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, client_contact: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
