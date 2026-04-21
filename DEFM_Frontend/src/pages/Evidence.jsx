// src/pages/Evidence.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Trash2, Eye, FileText, Shield } from 'lucide-react';
import { evidenceAPI, casesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const EVIDENCE_TYPE_OPTIONS = [
  { label: 'Digital', value: 'digital' },
  { label: 'Physical', value: 'physical' },
  { label: 'Document', value: 'document' },
  { label: 'Image', value: 'image' },
  { label: 'Video', value: 'video' },
  { label: 'Audio', value: 'audio' },
  { label: 'Log', value: 'log' },
  { label: 'Other', value: 'other' },
];

const EVIDENCE_STATUS_OPTIONS = [
  { label: 'Collected', value: 'collected' },
  { label: 'Analyzed', value: 'analyzed' },
  { label: 'Processed', value: 'processed' },
  { label: 'Archived', value: 'archived' },
];

const Evidence = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    evidence_type: 'digital',
    case_id: '',
    collected_date: '',
    location: '',
    hash_value: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const canManageEvidence = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchEvidence();
    fetchCases();
  }, []);

  const fetchEvidence = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await evidenceAPI.list({ limit: 200 });
      setEvidenceItems(response.data);
    } catch (err) {
      console.error('Failed to load evidence', err);
      setError(err.response?.data?.detail || 'Failed to load evidence. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await casesAPI.list({ limit: 200 });
      setCases(response.data);
    } catch (err) {
      console.warn('Failed to load cases', err);
      setCases([]);
    }
  };

  const handleCreateEvidence = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      const payload = {
        title: formData.name,
        description: formData.description || undefined,
        evidence_type: formData.evidence_type,
        case_id: Number(formData.case_id),
        collection_location: formData.location || undefined,
        collection_method: undefined
        // status will use default 'collected'
      };

      console.log('Creating evidence with payload:', payload);
      
      const evidenceResponse = await evidenceAPI.create(payload);
      console.log('Evidence created:', evidenceResponse.data);
      const evidenceId = evidenceResponse.data.id;
      
      // If there's a file selected, upload it
      if (selectedFile) {
        const formDataFile = new FormData();
        formDataFile.append('file', selectedFile);
        await evidenceAPI.uploadFile(evidenceId, formDataFile);
      }
      
      await fetchEvidence();
      setShowAddForm(false);
      resetForm();
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to create evidence', err.response?.data || err);
      alert(err.response?.data?.detail || 'Failed to create evidence.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!canManageEvidence) return;
    if (!window.confirm('Are you sure you want to delete this evidence?')) return;

    try {
      await evidenceAPI.delete(evidenceId);
      await fetchEvidence();
    } catch (err) {
      console.error('Failed to delete evidence', err);
      alert(err.response?.data?.detail || 'Failed to delete evidence.');
    }
  };

  const handleDownload = async (evidenceId) => {
    try {
      const response = await evidenceAPI.download(evidenceId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `evidence_${evidenceId}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download evidence', err);
      alert('Failed to download evidence file.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      evidence_type: 'digital',
      case_id: '',
      collected_date: '',
      location: '',
      hash_value: '',
      notes: ''
    });
    setSelectedFile(null);
  };

  const filteredEvidence = useMemo(() => {
    return evidenceItems.filter((item) => {
      const matchesSearch = searchTerm
        ? [
            item.name,
            item.evidence_number,
            item.description,
            item.hash_value,
            item.case?.case_number,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [evidenceItems, searchTerm, statusFilter]);

  const formatStatusBadge = (status) => {
    const map = {
      collected: 'bg-green-100 text-green-800',
      analyzed: 'bg-blue-100 text-blue-800',
      processed: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const AddEvidenceForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Evidence</h2>
        </div>
        
        <form onSubmit={handleCreateEvidence} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>             
              <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type *</label>
              <select
                value={formData.evidence_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, evidence_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {EVIDENCE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case *</label>
              <select
                value={formData.case_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, case_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a case</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.case_number} - {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date</label>
              <input
                type="datetime-local"
                value={formData.collected_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, collected_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hash Value (SHA-256)</label>
              <input
                type="text"
                value={formData.hash_value}
                onChange={(e) => setFormData((prev) => ({ ...prev, hash_value: e.target.value }))}
                placeholder="e.g., a1b2c3d4e5f6..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Where evidence is stored"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                id="evidence-file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
              />
              <label htmlFor="evidence-file" className="cursor-pointer">
                {selectedFile ? (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    <p className="text-primary-600 text-xs mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    <p>Click to upload evidence file</p>
                    <p className="text-xs mt-1">or drag and drop</p>
                  </div>
                )}
              </label>
              {selectedFile && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFile(null);
                  }}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Remove file
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? 'Adding...' : 'Add Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return <Loading fullScreen text="Loading evidence..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Evidence Management
        </h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Evidence</span>
        </button>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search evidence by name, hash, case..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {EVIDENCE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchEvidence}
              className="border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredEvidence.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium">No evidence found</p>
            <p className="text-sm">Try adjusting your filters or add new evidence.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collected</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvidence.map((evidence) => (
                  <tr key={evidence.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{evidence.name}</div>
                        <div className="text-xs text-gray-500">{evidence.evidence_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">{evidence.evidence_type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {evidence.case ? (
                        <button
                          onClick={() => navigate(`/cases/${evidence.case.id}`)}
                          className="text-primary-600 hover:underline"
                        >
                          {evidence.case.case_number}
                        </button>
                      ) : (
                        'No Case'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-mono truncate max-w-xs" title={evidence.hash_value}>
                        {evidence.hash_value || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${formatStatusBadge(evidence.status)}`}>
                        {evidence.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {evidence.collected_date ? new Date(evidence.collected_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/evidence/${evidence.id}`)}
                          className="text-gray-400 hover:text-primary-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(evidence.id)}
                          className="text-gray-400 hover:text-green-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {canManageEvidence && (
                          <button
                            onClick={() => handleDeleteEvidence(evidence.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddForm && <AddEvidenceForm />}
    </div>
  );
};

export default Evidence;