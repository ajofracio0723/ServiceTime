import { Client } from './types';

export const sampleClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    companyName: 'Smith & Co',
    status: 'active',
    lastContact: '2023-10-15',
    totalJobs: 12,
    address: '123 Main St, Anytown, USA',
    services: [
      {
        id: 's1',
        service: 'HVAC Maintenance',
        status: 'Completed',
        description: 'Annual AC checkup',
        date: '2023-10-10',
        amount: 199.99
      },
      {
        id: 's2',
        service: 'Furnace Repair',
        status: 'In Progress',
        description: 'Furnace not heating',
        date: '2023-10-15',
        amount: 350.00
      }
    ]
  },
  // Add more sample clients as needed
];
