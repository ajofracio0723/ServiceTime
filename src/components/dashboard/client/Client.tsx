import React, { useState } from 'react';
import { Client as ClientType } from './types';
import { sampleClients } from './mockData';
import { ClientForm } from './ClientForm';
import { ClientListItem } from './ClientListItem';

const Client: React.FC = () => {
  const [clients, setClients] = useState<ClientType[]>(sampleClients);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<ClientType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEditClient = (client: ClientType) => {
    setCurrentClient(client);
    setIsFormOpen(true);
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.companyName && client.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveClient = (clientData: Omit<ClientType, 'id'>) => {
    if (currentClient) {
      // Update existing client
      setClients(clients.map(c => 
        c.id === currentClient.id ? { ...clientData, id: currentClient.id, services: c.services || [] } : c
      ));
    } else {
      // Add new client
      const newClient: ClientType = {
        ...clientData,
        id: Date.now().toString(),
        services: [],
        totalJobs: 0,
        status: 'active',
        lastContact: new Date().toISOString(),
        name: clientData.name || 'New Client',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
      };
      setClients([...clients, newClient]);
    }
    setIsFormOpen(false);
    setCurrentClient(null);
  };

  const totalJobs = clients.reduce((sum, client) => sum + (client.totalJobs || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your clients</p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            type="button"
            onClick={() => {
              setCurrentClient(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{clients.length}</p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L12 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                12% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {clients.filter(c => c.status === 'active').length}
              </p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L12 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                8% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Jobs</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{totalJobs}</p>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L12 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                24% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${(totalJobs * 150).toLocaleString()}
              </p>
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center">
                <svg className="h-3 w-3 mr-1 transform rotate-180" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L12 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 7z" clipRule="evenodd" />
                </svg>
                2% from last month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Client List</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <ClientListItem
                key={client.id}
                client={client}
                onEdit={handleEditClient}
              />
            ))
          ) : (
            <li className="px-4 py-6 sm:px-6">
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm ? 'No clients found' : 'No clients'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm 
                    ? `No clients match "${searchTerm}". Try a different search term.`
                    : 'Get started by creating a new client.'}
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentClient(null);
                      setIsFormOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    New Client
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Client Form Modal */}
      {isFormOpen && (
        <ClientForm
          client={currentClient}
          onSave={handleSaveClient}
          onCancel={() => {
            setIsFormOpen(false);
            setCurrentClient(null);
          }}
        />
      )}
    </div>
  );
};

export default Client;
