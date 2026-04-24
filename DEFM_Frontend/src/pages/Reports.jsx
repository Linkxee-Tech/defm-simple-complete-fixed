// src/pages/Reports.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Calendar, Filter, Plus, BarChart3, Shield, Trash2, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { reportsAPI, casesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';

const REPORT_TYPE_OPTIONS = [
  { label: 'Summary', value: 'summary' },
  { label: 'Detailed', value: 'detailed' },
  { label: 'Forensic', value: 'forensic' },
  { label: 'Executive', value: 'executive' },
  { label: 'Incident', value: 'incident' },
];

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [formData, setFormData] = useState({
    case_id: '',
    report_type: 'summary',
    format: 'pdf',
    include_evidence: true,
    include_custody: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canManageReports = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    fetchReports();
    fetchCases();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await reportsAPI.list({ limit: 200 });
      setReports(response.data);
    } catch (err) {
      console.error('Failed to load reports', err);
      setError(err.response?.data?.detail || 'Failed to load reports. Please try again later.');
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

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const caseId = Number(formData.case_id);
      
      const response = await reportsAPI.generate(caseId, {
        report_type: formData.report_type,
        format: formData.format,
        include_evidence: formData.include_evidence,
        include_custody: formData.include_custody,
      });

      await fetchReports();
      setShowGenerateForm(false);
      resetForm();
      alert('Report generated successfully!');
    } catch (err) {
      console.error('Failed to generate report', err);
      alert(err.response?.data?.detail || 'Failed to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!canManageReports) return;
    if (!window.confirm('Are you sure you want to delete this report?')) return;

    try {
      await reportsAPI.delete(reportId);
      await fetchReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to delete report', err);
      alert(err.response?.data?.detail || 'Failed to delete report.');
    }
  };

  const handleDownloadReport = async (reportId, reportTitle) => {
    try {
      const response = await reportsAPI.download(reportId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = response.headers['content-type']?.includes('pdf') ? 'pdf' : 'txt';
      link.setAttribute('download', `${reportTitle || 'report'}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download report', err);
      alert('Failed to download report.');
    }
  };

  const resetForm = () => {
    setFormData({
      case_id: '',
      report_type: 'summary',
      format: 'pdf',
      include_evidence: true,
      include_custody: true,
    });
  };

  const filteredReports = useMemo(() => {
    const filtered = reports.filter((item) => {
      const matchesSearch = searchTerm
        ? [item.title, item.report_type, item.case?.case_number]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()))
        : true;

      const matchesType = typeFilter === 'all' || item.report_type === typeFilter;

      return matchesSearch && matchesType;
    });

    // UI guard: newest report first.
    return filtered.sort((a, b) => {
      const aTime = new Date(a.generated_at || 0).getTime();
      const bTime = new Date(b.generated_at || 0).getTime();
      return bTime - aTime;
    });
  }, [reports, searchTerm, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      casesCovered: new Set(reports.map(r => r.case_id)).size,
    };
  }, [reports]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatusBadge = (filePath) => {
    if (filePath) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Generated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <XCircle className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  };

  const generateReportForm = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
        </div>
        
        <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Case *</label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData((prev) => ({ ...prev, report_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                {REPORT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
              <select
                value={formData.format}
                onChange={(e) => setFormData((prev) => ({ ...prev, format: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="pdf">PDF</option>
                <option value="txt">Text</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Include Sections</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.include_evidence}
                  onChange={(e) => setFormData((prev) => ({ ...prev, include_evidence: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Evidence Summary</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.include_custody}
                  onChange={(e) => setFormData((prev) => ({ ...prev, include_custody: e.target.checked }))}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Chain of Custody</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowGenerateForm(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return <Loading fullScreen text="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Reports
          </h1>
          <p className="text-gray-600 mt-1">Generate and manage forensic investigation reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReports}
            className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowGenerateForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3 mr-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cases Covered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.casesCovered}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Report Types</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{new Set(reports.map(r => r.report_type)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {REPORT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg font-medium">No reports found</p>
            <p className="text-sm">Generate a new report to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-xs text-gray-500">ID: {report.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {report.case ? (
                        <button
                          onClick={() => navigate(`/cases/${report.case.id}`)}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          {report.case.case_number}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 capitalize">{report.report_type}</span>
                    </td>
                    <td className="px-6 py-4">
                      {formatStatusBadge(report.file_path)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(report.generated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {report.file_path && (
                          <button
                            onClick={() => handleDownloadReport(report.id, report.title)}
                            className="text-green-600 hover:text-green-800 flex items-center gap-1"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                            <span className="text-sm">PDF</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-gray-400 hover:text-primary-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canManageReports && (
                          <button
                            onClick={() => handleDeleteReport(report.id)}
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

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Report ID</p>
                  <p className="font-medium text-gray-900">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Report Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedReport.report_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Case</p>
                  <p className="font-medium text-gray-900">
                    {selectedReport.case ? `${selectedReport.case.case_number} - ${selectedReport.case.title}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Generated At</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedReport.generated_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  {formatStatusBadge(selectedReport.file_path)}
                </div>
                <div>
                  <p className="text-gray-500">File Path</p>
                  <p className="font-medium text-gray-900 text-xs break-all">
                    {selectedReport.file_path || 'Not generated'}
                  </p>
                </div>
              </div>
              {selectedReport.content && (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Content</p>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 max-h-40 overflow-y-auto">
                    {selectedReport.content}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                {selectedReport.file_path && (
                  <button
                    onClick={() => handleDownloadReport(selectedReport.id, selectedReport.title)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGenerateForm && generateReportForm}
    </div>
  );
};

export default Reports;
