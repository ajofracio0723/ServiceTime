import React from 'react';
import { Client } from '../../../types/domains/Client';

interface ClientListItemProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export const ClientListItem: React.FC<ClientListItemProps> = ({ 
  client, 
  onEdit 
}) => {
  const displayName = client.type === 'company'
    ? client.companyName || 'Company'
    : `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Individual';

  const primaryContact = client.contacts?.find(c => c.isPrimary) || client.contacts?.[0];
  const addressLine = client.billingAddress
    ? `${client.billingAddress.street}, ${client.billingAddress.city}, ${client.billingAddress.state} ${client.billingAddress.zipCode}, ${client.billingAddress.country}`
    : '';

  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium text-lg">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1 px-4">
            <div className="flex items-center">
              <h2 className="text-base font-medium text-gray-900 truncate">
                {displayName}
                {client.type === 'individual' && client.companyName && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">({client.companyName})</span>
                )}
              </h2>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {client.isActive ? 'active' : 'inactive'}
                </p>
              </div>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <p className="truncate">
                {(client.email || '—')}{client.phone ? ` • ${client.phone}` : ''}
              </p>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{addressLine || 'No billing address set'}</span>
            </div>
            {primaryContact && (
              <div className="mt-1 text-xs text-gray-500">
                Primary contact: <span className="font-medium text-gray-700">{primaryContact.name}</span>
                {primaryContact.email ? ` • ${primaryContact.email}` : ''}
                {primaryContact.phone ? ` • ${primaryContact.phone}` : ''}
              </div>
            )}
            {client.notes && (
              <div className="mt-1 text-xs text-gray-500 line-clamp-1">Notes: {client.notes}</div>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">{client.serviceHistory?.length || 0}</span>
            <span className="ml-1 text-sm text-gray-500">service records</span>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="flex -space-x-1">
              <button
                onClick={() => onEdit(client)}
                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="Edit client"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                className="inline-flex items-center p-1.5 border border-transparent rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="View details"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

