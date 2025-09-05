import React from 'react';
import { Client } from './types';
import { formatDate, getStatusColor } from './utils';

interface ClientListItemProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export const ClientListItem: React.FC<ClientListItemProps> = ({ 
  client, 
  onEdit 
}) => {
  return (
    <li className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-medium text-lg">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1 px-4">
            <div className="flex items-center">
              <h2 className="text-base font-medium text-gray-900 truncate">
                {client.name}
                {client.companyName && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    ({client.companyName})
                  </span>
                )}
              </h2>
              <div className="ml-2 flex-shrink-0 flex">
                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {client.status}
                </p>
              </div>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <p className="truncate">
                {client.email} • {client.phone}
              </p>
            </div>
            <div className="mt-1 flex items-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{client.address}</span>
            </div>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">{client.totalJobs}</span>
            <span className="ml-1 text-sm text-gray-500">jobs</span>
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

      {client.services && client.services.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <svg className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Recent Services
          </h4>
          <div className="space-y-3">
            {client.services.slice(0, 2).map((service) => (
              <div key={service.id} className="bg-gray-50 p-3 rounded-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{service.service}</h5>
                    <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(service.date)}</span>
                  <span className="font-medium">${service.amount.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {client.services.length > 2 && (
              <div className="text-center">
                <button className="text-sm font-medium text-primary-600 hover:text-primary-500">
                  View all {client.services.length} services
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
};
