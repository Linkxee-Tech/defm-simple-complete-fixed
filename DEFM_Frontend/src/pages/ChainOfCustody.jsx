// src/pages/ChainOfCustody.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, FileText, Shield, Search, RefreshCw, Eye, Link as LinkIcon, ArrowRightLeft } from 'lucide-react';
import { chainOfCustodyAPI, evidenceAPI, usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const ChainOfCustody = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [custodyRecords, setCustodyRecords] = useState([]);
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferData, setTransferData] = useState({
    evidence_id: '',
    transferred_to: '',
    purpose: '',
    location: '',
    notes: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  const canManageCustody = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchCustodyRecords();
    fetchEvidence();
    fetchUsers();
  }, []);

  const fetchCustodyRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedEvidence) {
        params.evidence_id = selectedEvidence;
      }
      const response = await chainOfCustodyAPI.list(params);
      setCustodyRecords(response.data);
    } catch (err) {
      console.error('Failed to load custody records', err);
      setError(err.response?.data?.detail || 'Failed to load chain of custody records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidence = async () => {
    try {
      const response = await evidenceAPI.list({ limit: 200 });
      setEvidenceItems(response.data);
    } catch (err) {
      console.warn('Failed to load evidence', err);
      setEvidenceItems([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.list({ limit: 200 });
      setUsers(response.data);
    } catch (err) {
      console.warn('Failed to load users', err);
      setUsers([]);
    }
  };

  const handleFilterChange = (evidenceId) => {
    setSelectedEvidence(evidenceId);
    fetchCustodyRecords();
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      
      await chainOfCustodyAPI.transfer({
        evidence_id: Number(transferData.evidence_id),
        transferred_to: Number(transferData.transferred_to),
        purpose: transferData.purpose,
        location: transferData.location,
        notes: transferData.notes || null,
      });
      
      await fetchCustodyRecords();
      setShowTransferForm(false);
      resetTransferForm();
      alert('Custody transferred successfully!');
    } catch (err) {
      console.error('Failed to create transfer', err);
      alert(err.response?.data?.detail || 'Failed to transfer custody.');
    } finally {
      setFormLoading(false);
    }
  };

  const resetTransferForm = () => {
    setTransferData({
      evidence_id: '',
      transferred_to: '',
      purpose: '',
      location: '',
      notes: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getEvidenceName = (evidenceId) => {
    const evidence = evidenceItems.find(e => e.id === evidenceId);
    return evidence ? `${evidence.evidence_number} - ${evidence.name}` : `Evidence #${evidenceId}`;
  };

  const getUserName = (userId) => {
    const u = users.find(user => user.id === userId);
    return u ? u.full_name : `User #${userId}`;
  };

  const groupRecordsByEvidence = () => {
    const grouped = {};
    custodyRecords.forEach((record) => {
      const key = record.evidence_id;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });
    return grouped;
  };

  const TransferForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transfer Custody</h2>
        </div>
        
        <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Evidence *</label>
            <select
              value={transferData.evidence_id}
              onChange={(e) => setTransferData((prev) => ({ ...prev, evidence_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select evidence</option>
              {evidenceItems.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.evidence_number} - {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transfer To *</label>
            <select
              value={transferData.transferred_to}
              onChange={(e) => setTransferData((prev) => ({ ...prev, transferred_to: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select user</option>
              {users.filter(u => u.id !== user?.id).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
              <input
                type="text"
                value={transferData.purpose}
                onChange={(e) => setTransferData((prev) => ({ ...prev, purpose: e.target.value }))}
                placeholder="e.g., Forensic Analysis, Storage"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={transferData.location}
                onChange={(e) => setTransferData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Lab 3, Storage Room A"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={transferData.notes}
              onChange={(e) => setTransferData((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowTransferForm(false);
                resetTransferForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
<button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowRightLeft className="h-4 w-4" />
              {formLoading ? 'Transferring...' : 'Transfer Custody'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return <Loading fullScreen text="Loading chain of custody..." />;
  }

  const groupedRecords = groupRecordsByEvidence();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <LinkIcon className="h-8 w-8" />
            Chain of Custody
          </h1>
          <p className="text-gray-600 mt-1">Track evidence transfers and custody history</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCustodyRecords}
            className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {canManageCustody && (
<button
              onClick={() => setShowTransferForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Custody
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedEvidence}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Evidence</option>
              {evidenceItems.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.evidence_number} - {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chain of Custody Records */}
      {custodyRecords.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No custody records found</p>
          <p className="text-sm text-gray-500 mt-1">Custody records will appear here when evidence is transferred.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([evidenceId, records]) => (
            <div key={evidenceId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{getEvidenceName(Number(evidenceId))}</h3>
                    <p className="text-sm text-gray-600">Evidence ID: {evidenceId}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4" />
                    <span>{records.length} record(s)</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="relative">
                  {records.map((record, index) => (
                    <div key={record.id || index} className="flex items-start space-x-4 mb-8 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-primary-500 rounded-full border-4 border-white shadow-sm"></div>
                        {index < records.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                        )}
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <label className="font-medium text-gray-700">Handler</label>
                            <div className="flex items-center mt-1">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{getUserName(record.handler_id)}</span>
                            </div>
                          </div>
                          <div>
                            <label className="font-medium text-gray-700">From User</label>
                            <div className="flex items-center mt-1">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{record.transferred_from ? getUserName(record.transferred_from) : 'Initial'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="font-medium text-gray-700">To User</label>
                            <div className="flex items-center mt-1">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{record.transferred_to ? getUserName(record.transferred_to) : 'N/A'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="font-medium text-gray-700">Date & Time</label>
                            <div className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{formatDate(record.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <label className="font-medium text-gray-700">Action</label>
                            <div className="flex items-center mt-1">
                              <FileText className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="capitalize">{record.action || 'Transfer'}</span>
                            </div>
                          </div>
                          <div>
                            <label className="font-medium text-gray-700">Location</label>
                            <div className="mt-1">
                              <span>{record.location || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>

                        {record.purpose && (
                          <div className="mt-3 text-sm">
                            <label className="font-medium text-gray-700">Purpose</label>
                            <p className="text-gray-600 mt-1">{record.purpose}</p>
                          </div>
                        )}

                        {record.notes && (
                          <div className="mt-3 text-sm">
                            <label className="font-medium text-gray-700">Notes</label>
                            <p className="text-gray-600 mt-1">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTransferForm && <TransferForm />}
    </div>
  );
};

export default ChainOfCustody;