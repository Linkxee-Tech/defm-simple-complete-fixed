// src/pages/Cases.jsx
import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, User, AlertCircle, MoreVertical, Eye, Edit, Archive, Folder, Activity } from 'lucide-react';

const Cases = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  const cases = [
    {
      id: 'CASE-2025-001',
      title: 'Corporate Data Breach Investigation',
      status: 'Active',
      priority: 'High',
      type: 'Data Breach',
      assignedTo: 'Solomon John',
      createdDate: '2025-12-01',
      lastUpdated: '2025-12-05',
      evidenceCount: 15,
      description: 'Investigation into unauthorized access to corporate financial data.',
      suspects: ['Unknown Actor', 'Internal Threat'],
      tags: ['Financial', 'Sensitive']
    },
    {
      id: 'CASE-2025-002',
      title: 'Network Intrusion Detection',
      status: 'Under Review',
      priority: 'Medium',
      type: 'Network Security',
      assignedTo: 'Ahmad Lawal',
      createdDate: '2025-11-28',
      lastUpdated: '2025-12-04',
      evidenceCount: 8,
      description: 'Monitoring and analysis of suspicious network activities.',
      suspects: ['External IP: 192.168.1.100'],
      tags: ['Network', 'Monitoring']
    },
    {
      id: 'CASE-2025-003',
      title: 'Malware Analysis - Ransomware',
      status: 'Closed',
      priority: 'High',
      type: 'Malware Analysis',
      assignedTo: 'Mike Davis',
      createdDate: '2025-11-20',
      lastUpdated: '2025-11-30',
      evidenceCount: 22,
      description: 'Analysis of ransomware sample and impact assessment.',
      suspects: ['Ransomware Group A'],
      tags: ['Ransomware', 'Encryption']
    },
    {
      id: 'CASE-2025-004',
      title: 'Phishing Campaign Investigation',
      status: 'Active',
      priority: 'Medium',
      type: 'Email Security',
      assignedTo: 'Ibrahim Isa',
      createdDate: '2023-12-03',
      lastUpdated: '2023-12-05',
      evidenceCount: 6,
      description: 'Tracking and analysis of targeted phishing campaign.',
      suspects: ['Multiple Actors'],
      tags: ['Phishing', 'Email']
    }
  ];

  const CreateCaseForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Case</h2>
        </div>
        
        <form action="" method="post" className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="casetitle" className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
              <input 
                type="text" name="casetitle" id="casetitle" placeholder="Enter case title" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"/>
            </div>
            <div>
              <label htmlFor="casetype" className="block text-sm font-medium text-gray-700 mb-1">Case Type *</label>
              <select name="casetype" id="casetype" required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option>Data Breach</option>
                <option>Network Security</option>
                <option>Malware Analysis</option>
                <option>Email Security</option>
                <option>Insider Threat</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select name="priority" id="priority" required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select priority</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="assign" className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
              <select name="assign" id="assign" required 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select investigator</option>
                <option>Ahmad Lawal</option>
                <option>Solomon John</option>
                <option>Mike Davis</option>
                <option>Ibrahim Isa</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" id="description" required rows={4} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Provide detailed case description..."
            ></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Suspects/Threat Actors</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              placeholder="Enter suspects or threat actors (comma separated)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
              placeholder="Add tags (comma separated)"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const CaseDetailsModal = () => {
    if (!selectedCase) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCase.title}</h2>
                <p className="text-sm text-gray-600 mt-1">Case ID: {selectedCase.id}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Case Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedCase.status === 'Active' ? 'bg-green-100 text-green-800' :
                  selectedCase.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedCase.status}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Priority</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  selectedCase.priority === 'High' ? 'bg-red-100 text-red-800' :
                  selectedCase.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedCase.priority}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Evidence Items</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedCase.evidenceCount}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Type</p>
                <p className="text-sm text-gray-900 mt-1">{selectedCase.type}</p>
              </div>
            </div>

            {/* Case Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Case Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Assigned Investigator:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.assignedTo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Created Date:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.createdDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-700">{selectedCase.description}</p>
              </div>
            </div>

            {/* Suspects and Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Suspects/Threat Actors</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.suspects.map((suspect, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {suspect}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Case</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{cases.length}</p>
            </div>
            <div className="bg-blue-500 rounded-lg p-3">
              <Folder className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cases.filter(c => c.status === 'Active').length}
              </p>
            </div>
            <div className="bg-green-500 rounded-lg p-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cases.filter(c => c.priority === 'High').length}
              </p>
            </div>
            <div className="bg-red-500 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed Cases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {cases.filter(c => c.status === 'Closed').length}
              </p>
            </div>
            <div className="bg-gray-500 rounded-lg p-3">
              <Archive className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search cases..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>All Status</option>
              <option>Active</option>
              <option>Under Review</option>
              <option>Closed</option>
            </select>
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <button className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 flex gap-2 focus:ring-primary-500 focus:border-transparent">
              <Filter className="h-5 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title & Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{caseItem.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{caseItem.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{caseItem.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{caseItem.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {caseItem.lastUpdated}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedCase(caseItem)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4">
                          
                        </MoreVertical>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateForm && <CreateCaseForm />}
      {selectedCase && <CaseDetailsModal />}
    </div>
  );
};

export default Cases;