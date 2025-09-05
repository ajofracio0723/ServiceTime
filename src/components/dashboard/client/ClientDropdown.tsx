import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  type: 'company' | 'individual';
  companyName?: string;
  status: 'active' | 'inactive';
}

interface ClientDropdownProps {
  value: string;
  onChange: (clientId: string) => void;
  className?: string;
}

export const ClientDropdown = ({
  value,
  onChange,
  className = '',
}: ClientDropdownProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load clients from localStorage (same as Client component)
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      const clientData = JSON.parse(savedClients);
      // Filter only active clients for property assignment
      const activeClients = clientData.filter((client: Client) => client.status === 'active');
      setClients(activeClients);
    }
  }, []);

  const selectedClient = clients.find(client => client.id === value);

  const getClientDisplayName = (client: Client) => {
    if (client.type === 'company' && client.companyName) {
      return `${client.companyName} (${client.name})`;
    }
    return client.name;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center justify-between cursor-pointer`}
      >
        <span className={selectedClient ? 'text-gray-900' : 'text-gray-500'}>
          {selectedClient ? getClientDisplayName(selectedClient) : 'Select a client...'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {clients.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No active clients found
              </div>
            ) : (
              clients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    onChange(client.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                    value === client.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{getClientDisplayName(client)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.type === 'company' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {client.type}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
