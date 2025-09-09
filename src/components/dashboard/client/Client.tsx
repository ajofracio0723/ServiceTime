import React, { useState } from 'react';
import { Client as DomainClient } from '../../../types/domains/Client';
import { sampleClients } from '../../../mockData/sampleClients';
import { ClientForm } from './ClientForm';
import { ClientListItem } from './ClientListItem';

const Client: React.FC = () => {
  const [clients, setClients] = useState<DomainClient[]>(() => {
    try {
      const saved = localStorage.getItem('clients');
      if (saved) return JSON.parse(saved) as DomainClient[];
    } catch {}
    return sampleClients;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<DomainClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEditClient = (client: DomainClient) => {
    setCurrentClient(client);
    setIsFormOpen(true);
  };

  // Filter clients based on search term (company/individual fields and contacts)
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const baseMatch = (
      (client.type === 'company' && (client.companyName || '').toLowerCase().includes(term)) ||
      (client.type === 'individual' && (
        `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase().includes(term)
      )) ||
      (client.email || '').toLowerCase().includes(term) ||
      (client.phone || '').toLowerCase().includes(term)
    );
    const contactsMatch = client.contacts?.some((c) =>
      `${c.name} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(term)
    );
    return baseMatch || contactsMatch;
  });

  const handleSaveClient = (clientData: Omit<DomainClient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentClient) {
      // Update existing client
      setClients((prev) =>
        prev.map((c) =>
          c.id === currentClient.id
            ? {
                ...c,
                ...clientData,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } else {
      // Add new client
      const now = new Date().toISOString();
      const newClient: DomainClient = {
        id: `client-${Date.now()}`,
        ...clientData,
        serviceHistory: clientData.serviceHistory || [],
        contacts: clientData.contacts || [],
        isActive: clientData.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      } as DomainClient;
      setClients((prev) => [...prev, newClient]);
    }
    setIsFormOpen(false);
    setCurrentClient(null);
  };

  // Persist to localStorage whenever clients change
  React.useEffect(() => {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Customer records: company/individual, contacts, notes, service history</p>
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
              placeholder="Search clients by name, company, email, phone, or contact..."
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
