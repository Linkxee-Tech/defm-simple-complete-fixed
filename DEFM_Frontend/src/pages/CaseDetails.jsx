// src/pages/CaseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Clock, User, MapPin, 
  AlertCircle, FileText, Package, Activity 
} from 'lucide-react';
import { casesAPI, evidenceAPI } from '../services/api';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCaseDetails();
    fetchEvidence();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const response = await casesAPI.get(id);
      setCaseData(response.data);
    } catch (error) {
      console.error('Error fetching case:', error);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await evidenceAPI.list({ case_id: id });
      setEvidence(response.data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await casesAPI.delete(id);
        navigate('/cases');
      } catch (error) {
        console.error('Error deleting case:', error);
        alert('Failed to delete case');
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
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
          <button
            onClick={() => navigate(`/cases/${id}/edit`)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
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
                          View Details →
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
    </div>
  );
};

export default CaseDetails;
