import React, { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  Edit,
  Users,
  Building2,
  User,
  FileText,
  X,
  Clock,
} from "lucide-react";
import type {
  Client as ClientType,
  Contact,
  ServiceHistory,
} from "../../types/domains/Client";

interface Note {
  id: string;
  content: string;
  date: string;
  author: string;
}

// Extended interface for display purposes that matches the component's needs
interface DisplayClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  lastContact: string;
  totalJobs: number;
  type: "company" | "individual";
  companyName?: string;
  contacts: Contact[];
  notes: Note[];
  serviceHistory: DisplayServiceHistory[];
}

interface DisplayServiceHistory {
  id: string;
  service: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

export const Client: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterType, setFilterType] = useState<
    "all" | "company" | "individual"
  >("all");
  const [selectedClient, setSelectedClient] = useState<DisplayClient | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({});
  const [selectedNoteTemplate, setSelectedNoteTemplate] = useState<string>("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showEditClient, setShowEditClient] = useState(false);
  const [editingClient, setEditingClient] = useState<DisplayClient | null>(
    null
  );
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);
  const [clients, setClients] = useState<DisplayClient[]>([]);
  const [newClient, setNewClient] = useState<Partial<DisplayClient>>({
    type: "individual",
    status: "active",
    contacts: [],
    notes: [],
    serviceHistory: [],
  });

  const noteTemplates = [
    "Appointment scheduled - customer prefers morning hours",
    "Customer has pets in backyard - please be aware",
    "Parking available in driveway - no street parking",
    "Customer requested follow-up call after service",
    "Special access instructions - use side gate",
    "Customer mentioned budget constraints",
    "Previous service issues resolved satisfactorily",
    "Customer referred by neighbor/friend",
    "Seasonal maintenance reminder needed",
    "Customer prefers text message communication",
    "Building access code required - contact customer",
    "Customer has security system - call before arrival",
    "Service area requires cleanup after work",
    "Customer requested detailed invoice breakdown",
    "Follow-up service recommended in 6 months",
    "Customer has specific brand preferences",
    "Emergency contact information updated",
    "Customer mentioned upcoming renovations",
    "Warranty information provided",
    "Customer satisfaction survey completed",
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedClients = localStorage.getItem("clients");
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Initialize with mock data if no saved data exists
      const initialClients: DisplayClient[] = [
        {
          id: "1",
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "(555) 123-4567",
          address: "123 Main St, Anytown, ST 12345",
          status: "active",
          lastContact: "2024-01-15",
          totalJobs: 12,
          type: "individual",
          contacts: [
            {
              id: "c1",
              name: "John Smith",
              email: "john.smith@email.com",
              phone: "(555) 123-4567",
              role: "Primary Contact",
              isPrimary: true,
            },
          ],
          notes: [
            {
              id: "n1",
              content:
                "Prefers morning appointments. Has a dog in the backyard.",
              date: "2024-01-15",
              author: "Mike Tech",
            },
          ],
          serviceHistory: [
            {
              id: "sh1",
              service: "HVAC Maintenance",
              date: "2024-01-10",
              amount: 150.0,
              status: "completed",
              description: "Annual AC maintenance and filter replacement",
            },
          ],
        },
        {
          id: "2",
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "(555) 234-5678",
          address: "456 Oak Ave, Somewhere, ST 67890",
          status: "active",
          lastContact: "2024-01-10",
          totalJobs: 8,
          type: "company",
          companyName: "Johnson Enterprises",
          contacts: [
            {
              id: "c2",
              name: "Sarah Johnson",
              email: "sarah.j@email.com",
              phone: "(555) 234-5678",
              role: "CEO",
              isPrimary: true,
            },
            {
              id: "c3",
              name: "Tom Wilson",
              email: "tom.w@johnson.com",
              phone: "(555) 234-5679",
              role: "Facility Manager",
              isPrimary: false,
            },
          ],
          notes: [
            {
              id: "n2",
              content:
                "Company expanding to new location. Need to schedule maintenance for both sites.",
              date: "2024-01-10",
              author: "Sarah Tech",
            },
          ],
          serviceHistory: [
            {
              id: "sh2",
              service: "Plumbing Repair",
              date: "2024-01-08",
              amount: 300.0,
              status: "completed",
              description: "Fixed leaking pipe in main office bathroom",
            },
          ],
        },
        {
          id: "3",
          name: "Mike Wilson",
          email: "mike.w@email.com",
          phone: "(555) 345-6789",
          address: "789 Pine Rd, Elsewhere, ST 11111",
          status: "inactive",
          lastContact: "2023-12-20",
          totalJobs: 3,
          type: "individual",
          contacts: [
            {
              id: "c4",
              name: "Mike Wilson",
              email: "mike.w@email.com",
              phone: "(555) 345-6789",
              role: "Primary Contact",
              isPrimary: true,
            },
          ],
          notes: [
            {
              id: "n3",
              content: "Moved to new house. Old address services completed.",
              date: "2023-12-20",
              author: "Mike Tech",
            },
          ],
          serviceHistory: [
            {
              id: "sh3",
              service: "Electrical Inspection",
              date: "2023-12-15",
              amount: 120.0,
              status: "completed",
              description: "Pre-sale electrical inspection",
            },
          ],
        },
      ];
      setClients(initialClients);
      localStorage.setItem("clients", JSON.stringify(initialClients));
    }
  }, []);

  // Save to localStorage whenever clients change
  useEffect(() => {
    localStorage.setItem("clients", JSON.stringify(clients));
  }, [clients]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        setShowMoreMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.companyName &&
        client.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      filterStatus === "all" || client.status === filterStatus;
    const matchesType = filterType === "all" || client.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddClient = () => {
    if (
      newClient.name &&
      newClient.email &&
      newClient.phone &&
      newClient.address
    ) {
      const client: DisplayClient = {
        id: `client_${Date.now()}`,
        name: newClient.name!,
        email: newClient.email!,
        phone: newClient.phone!,
        address: newClient.address!,
        status: newClient.status as "active" | "inactive",
        lastContact: new Date().toISOString().split("T")[0],
        totalJobs: 0,
        type: newClient.type as "company" | "individual",
        companyName: newClient.companyName,
        contacts: newClient.contacts || [],
        notes: newClient.notes || [],
        serviceHistory: newClient.serviceHistory || [],
      };

      setClients([...clients, client]);
      setNewClient({
        type: "individual",
        status: "active",
        contacts: [],
        notes: [],
        serviceHistory: [],
      });
      setShowAddClient(false);
    }
  };

  const handleEditClient = (client: DisplayClient) => {
    setEditingClient(client);
    setShowEditClient(true);
  };

  const handleSaveClient = () => {
    if (editingClient) {
      const updatedClients = clients.map((c) =>
        c.id === editingClient.id ? editingClient : c
      );
      setClients(updatedClients);
      setEditingClient(null);
      setShowEditClient(false);
    }
  };

  const handleViewDetails = (client: DisplayClient) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.email && selectedClient) {
      const contact: Contact = {
        id: `c${Date.now()}`,
        name: newContact.name!,
        email: newContact.email!,
        phone: newContact.phone || "",
        role: newContact.role || "Contact",
        isPrimary: false,
      };

      const updatedClient = {
        ...selectedClient,
        contacts: [...selectedClient.contacts, contact],
      };

      const updatedClients = clients.map((c) =>
        c.id === selectedClient.id ? updatedClient : c
      );

      setClients(updatedClients);
      setSelectedClient(updatedClient);
      setNewContact({});
      setShowAddContact(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleSaveContact = () => {
    if (editingContact && selectedClient) {
      const updatedClient = {
        ...selectedClient,
        contacts: selectedClient.contacts.map((c) =>
          c.id === editingContact.id ? editingContact : c
        ),
      };

      const updatedClients = clients.map((c) =>
        c.id === selectedClient.id ? updatedClient : c
      );

      setClients(updatedClients);
      setSelectedClient(updatedClient);
      setEditingContact(null);
    }
  };

  const handleAddNote = () => {
    if (selectedNoteTemplate && selectedClient) {
      const note: Note = {
        id: `n${Date.now()}`,
        content: selectedNoteTemplate,
        date: new Date().toISOString().split("T")[0],
        author: "Current User",
      };

      const updatedClient = {
        ...selectedClient,
        notes: [...selectedClient.notes, note],
      };

      const updatedClients = clients.map((c) =>
        c.id === selectedClient.id ? updatedClient : c
      );

      setClients(updatedClients);
      setSelectedClient(updatedClient);
      setSelectedNoteTemplate("");
      setShowAddNote(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleSaveNote = () => {
    if (editingNote && selectedClient) {
      const updatedClient = {
        ...selectedClient,
        notes: selectedClient.notes.map((n) =>
          n.id === editingNote.id ? editingNote : n
        ),
      };

      const updatedClients = clients.map((c) =>
        c.id === selectedClient.id ? updatedClient : c
      );

      setClients(updatedClients);
      setSelectedClient(updatedClient);
      setEditingNote(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-gray-600">
            Manage your client database and contact information
          </p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          onClick={() => setShowAddClient(true)}
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as "all" | "active" | "inactive")
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value as "all" | "company" | "individual")
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="company">Company</option>
          <option value="individual">Individual</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Jobs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {client.address}
                      </div>
                      {client.companyName && (
                        <div className="text-xs text-blue-600">
                          {client.companyName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {client.type === "company" ? (
                        <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      ) : (
                        <User className="w-4 h-4 mr-2 text-green-600" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">
                        {client.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {client.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {client.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.lastContact}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.totalJobs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewDetails(client)}
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() =>
                            setShowMoreMenu(
                              showMoreMenu === client.id ? null : client.id
                            )
                          }
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMoreMenu === client.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                            <button
                              onClick={() => {
                                setShowMoreMenu(null);
                                handleViewDetails(client);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setShowMoreMenu(null);
                                handleEditClient(client);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Client
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No clients found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Add New Client
                </h3>
                <button
                  onClick={() => setShowAddClient(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newClient.name || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={newClient.type || "individual"}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        type: e.target.value as "company" | "individual",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newClient.email || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={newClient.phone || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={newClient.address || ""}
                    onChange={(e) =>
                      setNewClient({ ...newClient, address: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                {newClient.type === "company" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={newClient.companyName || ""}
                      onChange={(e) =>
                        setNewClient({
                          ...newClient,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Company name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={newClient.status || "active"}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAddClient(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={
                    !newClient.name ||
                    !newClient.email ||
                    !newClient.phone ||
                    !newClient.address
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditClient && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Client: {editingClient.name}
                </h3>
                <button
                  onClick={() => setShowEditClient(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={editingClient.type}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        type: e.target.value as "company" | "individual",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={editingClient.address}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St, City, State ZIP"
                  />
                </div>
                {editingClient.type === "company" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={editingClient.companyName || ""}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Company name"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={editingClient.status}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditClient(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveClient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedClient.name}
                  </h3>
                  <p className="text-gray-600">
                    {selectedClient.type === "company"
                      ? "Company"
                      : "Individual"}
                    {selectedClient.companyName &&
                      ` • ${selectedClient.companyName}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedClient.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedClient.phone}
                    </div>
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {selectedClient.address}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedClient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedClient.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Statistics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Total Jobs:</span>{" "}
                      {selectedClient.totalJobs}
                    </div>
                    <div>
                      <span className="font-medium">Last Contact:</span>{" "}
                      {selectedClient.lastContact}
                    </div>
                    <div>
                      <span className="font-medium">Contacts:</span>{" "}
                      {selectedClient.contacts.length}
                    </div>
                    <div>
                      <span className="font-medium">Notes:</span>{" "}
                      {selectedClient.notes.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    Contacts
                  </h4>
                  <button
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    onClick={() => setShowAddContact(true)}
                  >
                    Add Contact
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedClient.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      {editingContact?.id === contact.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingContact.name}
                            onChange={(e) =>
                              setEditingContact({
                                ...editingContact,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Name"
                          />
                          <input
                            type="email"
                            value={editingContact.email || ""}
                            onChange={(e) =>
                              setEditingContact({
                                ...editingContact,
                                email: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Email"
                          />
                          <input
                            type="text"
                            value={editingContact.phone || ""}
                            onChange={(e) =>
                              setEditingContact({
                                ...editingContact,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Phone"
                          />
                          <input
                            type="text"
                            value={editingContact.role || ""}
                            onChange={(e) =>
                              setEditingContact({
                                ...editingContact,
                                role: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Role"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveContact}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingContact(null)}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {contact.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {contact.role}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contact.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              {contact.phone}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEditContact(contact)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Contact Form */}
              {showAddContact && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Add New Contact
                  </h5>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newContact.name || ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Name *"
                    />
                    <input
                      type="email"
                      value={newContact.email || ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Email *"
                    />
                    <input
                      type="text"
                      value={newContact.phone || ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Phone"
                    />
                    <input
                      type="text"
                      value={newContact.role || ""}
                      onChange={(e) =>
                        setNewContact({ ...newContact, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Role"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddContact}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Add Contact
                      </button>
                      <button
                        onClick={() => {
                          setShowAddContact(false);
                          setNewContact({});
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-900">Notes</h4>
                  <button
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    onClick={() => setShowAddNote(true)}
                  >
                    Add Note
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedClient.notes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      {editingNote?.id === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingNote.content}
                            onChange={(e) =>
                              setEditingNote({
                                ...editingNote,
                                content: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Note content"
                            rows={3}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveNote}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNote(null)}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-900">
                              {note.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {note.date} • {note.author}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => handleEditNote(note)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note Form */}
              {showAddNote && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Add New Note
                  </h5>
                  <div className="space-y-3">
                    <select
                      value={selectedNoteTemplate}
                      onChange={(e) => setSelectedNoteTemplate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a note template...</option>
                      {noteTemplates.map((template, index) => (
                        <option key={index} value={template}>
                          {template}
                        </option>
                      ))}
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddNote}
                        disabled={!selectedNoteTemplate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Add Note
                      </button>
                      <button
                        onClick={() => {
                          setShowAddNote(false);
                          setSelectedNoteTemplate("");
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Service History */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Service History
                </h4>
                <div className="space-y-3">
                  {selectedClient.serviceHistory.map((service) => (
                    <div
                      key={service.id}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-gray-900">
                              {service.service}
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                service.status
                              )}`}
                            >
                              {service.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {service.date} • ${service.amount.toFixed(2)}
                          </div>
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
