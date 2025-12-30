// src/pages/ChainOfCustody.jsx
import React from 'react';
import { User, Calendar, FileText, Shield } from 'lucide-react';

const ChainOfCustody = () => {
  const custodyRecords = [
    {
      id: 'COC-001',
      evidenceId: 'EVD-2025-001',
      evidenceName: 'Server Logs - Web Server',
      transfers: [
        {
          from: 'Solomon John',
          to: 'Ibrahim Isa',
          date: '2025-12-01 14:30',
          purpose: 'Initial Collection',
          signature: 'Verified',
          location: 'Data Center A'
        },
        {
          from: 'Ahmad Lawal',
          to: 'Mike Davis',
          date: '2025-12-02 09:15',
          purpose: 'Forensic Analysis',
          signature: 'Verified',
          location: 'Lab 3'
        }
      ]
    },
    {
      id: 'COC-002',
      evidenceId: 'EVD-2025-002',
      evidenceName: 'Network Capture',
      transfers: [
        {
          from: 'Ahmad Lawal',
          to: 'John Smith',
          date: '2025-12-02 11:20',
          purpose: 'Initial Collection',
          signature: 'Verified',
          location: 'Network Operations'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Chain of Custody</h1>
        <div className="text-sm text-gray-500">
          Track evidence transfers and custody history
        </div>
      </div>

      <div className="space-y-6">
        {custodyRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.evidenceName}</h3>
                  <p className="text-sm text-gray-600">Evidence ID: {record.evidenceId}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Chain ID: {record.id}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="relative">
                {/* Timeline */}
                {record.transfers.map((transfer, index) => (
                  <div key={index} className="flex items-start space-x-4 mb-8 last:mb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-primary-500 rounded-full border-4 border-white shadow-sm"></div>
                      {index < record.transfers.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      )}
                    </div>

                    {/* Transfer details */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-gray-700">From</label>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{transfer.from}</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">To</label>
                          <div className="flex items-center mt-1">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{transfer.to}</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Date & Time</label>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{transfer.date}</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Signature</label>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                            transfer.signature === 'Verified' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transfer.signature}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="font-medium text-gray-700">Purpose</label>
                          <div className="flex items-center mt-1">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{transfer.purpose}</span>
                          </div>
                        </div>
                        <div>
                          <label className="font-medium text-gray-700">Location</label>
                          <div className="mt-1">
                            <span>{transfer.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChainOfCustody;