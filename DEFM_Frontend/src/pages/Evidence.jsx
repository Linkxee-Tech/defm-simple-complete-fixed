// src/pages/Evidence.jsx
import React, { useState } from 'react';
import { Plus, Search, Filter, Download, MoreVertical } from 'lucide-react';

const Evidence = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  
  const evidenceItems = [
    {
      id: 'EVD-2025-001',
      name: 'Server Logs - Web Server',
      type: 'Log Files',
      case: 'Case #2025-001',
      hash: 'a1b2c3d4e5f6789012345678901234567890abcd',
      collectedBy: 'Solomon John',
      collectedDate: '2025-12-01',
      status: 'In Custody',
      integrity: 'Verified'
    },
    {
      id: 'EVD-2025-002',
      name: 'Network Capture',
      type: 'PCAP File',
      case: 'Case #2025-002',
      hash: 'b2c3d4e5f6789012345678901234567890abcde1',
      collectedBy: 'Ahmad Lawal',
      collectedDate: '2025-12-02',
      status: 'In Analysis',
      integrity: 'Verified'
    },
    {
      id: 'EVD-2025-003',
      name: 'Memory Dump',
      type: 'Memory Image',
      case: 'Case #2025-001',
      hash: 'c3d4e5f6789012345678901234567890abcde12f',
      collectedBy: 'Ibrahim Isa',
      collectedDate: '2025-12-03',
      status: 'Archived',
      integrity: 'Pending'
    }
  ];

  const AddEvidenceForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Evidence</h2>
        </div>
        
        <form action="" method="post" className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>             
              <label htmlFor="eviname" className="block text-sm font-medium text-gray-700 mb-1">Evidence Name</label>
              <input type="text" name="eviname" id="eviname" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
            </div>
            <div>
              <label htmlFor="evitype" className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
              <select name="evitype" id="evitype" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option value="">select</option>
                <option>Log Files</option>
                <option>PCAP File</option>
                <option>Memory Image</option>
                <option>Disk Image</option>
                <option>Document</option>
              </select>
            </div>
            <div>
              <label htmlFor="caseid" className="block text-sm font-medium text-gray-700 mb-1">Case ID</label>
              <select name="caseid" id="caseid" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required>
                <option>Case #2025-001</option>
                <option>Case #2025-002</option>
                <option>Case #2025-003</option>
              </select>
            </div>
            <div>
              <label htmlFor="cdata" className="block text-sm font-medium text-gray-700 mb-1">Collection Date</label>
              <input type="datetime-local" name="cdata" id="cdata" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} name="description" id="description" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"></textarea>
          </div>
          
          <div>
            <label htmlFor="hash" className="block text-sm font-medium text-gray-700 mb-1">Hash Value</label>
            <input type="text" name="hash" id="hash" placeholder="SHA-256 hash" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent" required />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Add Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex">Evidence Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary-500 text-white px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Evidence</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search evidence..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option>All Status</option>
              <option>In Custody</option>
              <option>In Analysis</option>
              <option>Archived</option>
            </select>
            <button className="border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {evidenceItems.map((evidence) => (
                <tr key={evidence.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{evidence.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{evidence.name}</div>
                      <div className="text-sm text-gray-500">{evidence.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{evidence.case}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-mono truncate max-w-xs">{evidence.hash}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        evidence.status === 'In Custody' ? 'bg-green-100 text-green-800' :
                        evidence.status === 'In Analysis' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evidence.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        evidence.integrity === 'Verified' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {evidence.integrity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && <AddEvidenceForm />}
    </div>
  );
};

export default Evidence;