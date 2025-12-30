// src/pages/EvidenceDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Trash2, Download, Upload, Shield, 
  CheckCircle, AlertCircle, FileText, Hash, Clock 
} from 'lucide-react';
import { evidenceAPI, chainOfCustodyAPI } from '../services/api';

const EvidenceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState(null);
  const [custody, setCustody] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const [evidenceRes, custodyRes] = await Promise.all([
        evidenceAPI.get(id),
        chainOfCustodyAPI.getByEvidence(id)
      ]);
      setEvidence(evidenceRes.data);
      setCustody(custodyRes.data);
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setVerifying(true);
      const response = await evidenceAPI.verifyIntegrity(id);
      alert(response.data.verified ? 'Integrity verified successfully!' : 'Integrity verification failed!');
      fetchDetails();
    } catch (error) {
      console.error('Error verifying integrity:', error);
      alert('Failed to verify integrity');
    } finally {
      setVerifying(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      await evidenceAPI.uploadFile(id, file);
      alert('File uploaded successfully!');
      fetchDetails();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      try {
        await evidenceAPI.delete(id);
        navigate('/evidence');
      } catch (error) {
        console.error('Error deleting evidence:', error);
        alert('Failed to delete evidence');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      collected: 'bg-blue-100 text-blue-800',
      analyzed: 'bg-purple-100 text-purple-800',
      processed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Evidence Not Found</h2>
        <button
          onClick={() => navigate('/evidence')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Back to Evidence
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
            onClick={() => navigate('/evidence')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{evidence.title}</h1>
            <p className="text-gray-600">Evidence #{evidence.evidence_number}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Shield className="w-4 h-4" />
            {verifying ? 'Verifying...' : 'Verify Integrity'}
          </button>
          <button
            onClick={() => navigate(`/evidence/${id}/edit`)}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(evidence.status)}`}>
              {evidence.status}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Type:</span>
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {evidence.evidence_type}
            </span>
          </div>
          <div>
            <Clock className="w-4 h-4 inline text-gray-600 mr-1" />
            <span className="text-sm text-gray-600">
              Collected: {new Date(evidence.collected_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            {evidence.is_verified ? (
              <span className="flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </span>
            ) : (
              <span className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Not Verified
              </span>
            )}
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
              onClick={() => setActiveTab('custody')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'custody'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Chain of Custody ({custody.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Evidence Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{evidence.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Collection Location</label>
                    <p className="text-gray-900">{evidence.collection_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Collected By</label>
                    <p className="text-gray-900">{evidence.collected_by_user?.full_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
                    <button
                      onClick={() => navigate(`/cases/${evidence.case_id}`)}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View Case →
                    </button>
                  </div>
                </div>
              </div>

              {evidence.file_path && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">File Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                      <p className="text-gray-900">{evidence.file_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                      <p className="text-gray-900">{(evidence.file_size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Hash className="w-4 h-4 inline mr-1" />
                        Hash (SHA256)
                      </label>
                      <p className="text-gray-900 text-xs font-mono break-all">{evidence.file_hash}</p>
                    </div>
                    <div>
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!evidence.file_path && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No file uploaded yet</p>
                  <label className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer inline-flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {uploadingFile ? 'Uploading...' : 'Upload File'}
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Chain of Custody Tab */}
          {activeTab === 'custody' && (
            <div>
              {custody.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No chain of custody records found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {custody.map((entry, index) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                            {custody.length - index}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                By: {entry.handler_user?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Location: {entry.location || 'Not specified'}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{new Date(entry.timestamp).toLocaleDateString()}</p>
                              <p>{new Date(entry.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          {entry.notes && (
                            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvidenceDetails;
