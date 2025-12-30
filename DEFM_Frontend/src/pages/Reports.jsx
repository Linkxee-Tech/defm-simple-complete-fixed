// src/pages/Reports.jsx
import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, Plus, BarChart3, Shield } from 'lucide-react';

const Reports = () => {
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  const reports = [
    {
      id: 'RPT-2023-001',
      title: 'Monthly Security Incident Report',
      type: 'Monthly Summary',
      generatedBy: 'John Smith',
      generatedDate: '2023-12-01',
      period: 'November 2023',
      caseCount: 12,
      evidenceCount: 45,
      status: 'Completed',
      fileSize: '2.4 MB'
    },
    {
      id: 'RPT-2023-002',
      title: 'Data Breach Investigation Report',
      type: 'Case Report',
      generatedBy: 'Sarah Johnson',
      generatedDate: '2023-11-28',
      period: 'Case #2023-001',
      caseCount: 1,
      evidenceCount: 15,
      status: 'Completed',
      fileSize: '1.8 MB'
    },
    {
      id: 'RPT-2023-003',
      title: 'Q3 Forensic Analysis Summary',
      type: 'Quarterly Report',
      generatedBy: 'Mike Davis',
      generatedDate: '2023-10-01',
      period: 'Q3 2023',
      caseCount: 8,
      evidenceCount: 32,
      status: 'Completed',
      fileSize: '3.1 MB'
    }
  ];

  const GenerateReportForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Generate New Report</h2>
        </div>
        
        <form className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Title *</label>
              <input 
                type="text" 
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type *</label>
              <select 
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option>Case Report</option>
                <option>Monthly Summary</option>
                <option>Quarterly Report</option>
                <option>Annual Report</option>
                <option>Incident Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input 
                type="date" 
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input 
                type="date" 
                required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Include Cases</label>
            <select 
              multiple 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32"
            >
              <option value="all">All Cases</option>
              <option value="CASE-2023-001">CASE-2023-001 - Corporate Data Breach</option>
              <option value="CASE-2023-002">CASE-2023-002 - Network Intrusion</option>
              <option value="CASE-2023-003">CASE-2023-003 - Malware Analysis</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Report Sections</label>
            <div className="space-y-2">
              {['Executive Summary', 'Case Details', 'Evidence Summary', 'Chain of Custody', 'Findings', 'Recommendations'].map(section => (
                <label key={section} className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-700">{section}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowGenerateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <button
          onClick={() => setShowGenerateForm(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3 mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reports.length}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reports.reduce((sum, report) => sum + report.caseCount, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 rounded-lg p-3 mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Evidence Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reports.reduce((sum, report) => sum + report.evidenceCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period/Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{report.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500">{report.type}</div>
                      <div className="text-xs text-gray-400 mt-1">By {report.generatedBy}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{report.period}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cases:</span>
                        <span className="font-medium">{report.caseCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Evidence:</span>
                        <span className="font-medium">{report.evidenceCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{report.fileSize}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {report.generatedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span className="text-sm">PDF</span>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showGenerateForm && <GenerateReportForm />}
    </div>
  );
};

export default Reports;