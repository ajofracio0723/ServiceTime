import React, { useState, useEffect } from 'react';
import { Client, ClientType, Contact } from '../../../types/domains/Client';

interface ClientFormProps {
  client: Client | null;
  onSave: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ 
  client,
  onSave, 
  onCancel 
}) => {
  const [type, setType] = useState<ClientType>('individual');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (client) {
      setType(client.type);
      setFirstName(client.firstName || '');
      setLastName(client.lastName || '');
      setCompanyName(client.companyName || '');
      setEmail(client.email || '');
      setPhone(client.phone || '');
      setIsActive(client.isActive);
      setNotes(client.notes || '');
      setBillingAddress(client.billingAddress);
      setContacts(client.contacts || []);
    }
  }, [client]);

  const updateContact = (id: string, partial: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const addContact = () => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      role: '',
      isPrimary: contacts.length === 0,
    };
    setContacts((prev) => [...prev, newContact]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const setPrimaryContact = (id: string) => {
    setContacts((prev) => prev.map((c) => ({ ...c, isPrimary: c.id === id })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      firstName: type === 'individual' ? firstName : undefined,
      lastName: type === 'individual' ? lastName : undefined,
      companyName: type === 'company' ? companyName : undefined,
      email,
      phone,
      contacts,
      billingAddress,
      notes,
      serviceHistory: client?.serviceHistory || [],
      tags: client?.tags || [],
      preferredPaymentMethod: client?.preferredPaymentMethod,
      creditLimit: client?.creditLimit,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {client ? 'Edit Client' : 'Add New Client'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Client Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ClientType)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Names */}
          {type === 'individual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <input
                placeholder="Street"
                value={billingAddress.street}
                onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                placeholder="City"
                value={billingAddress.city}
                onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                placeholder="State"
                value={billingAddress.state}
                onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                placeholder="Zip Code"
                value={billingAddress.zipCode}
                onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                placeholder="Country"
                value={billingAddress.country}
                onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:col-span-2"
              />
            </div>
          </div>

          {/* Contacts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Contacts</label>
              <button type="button" onClick={addContact} className="text-sm text-blue-600 hover:underline">Add contact</button>
            </div>
            {contacts.length === 0 && (
              <p className="text-sm text-gray-500">No contacts yet. Add a contact to get started.</p>
            )}
            <div className="space-y-3">
              {contacts.map((c) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start border rounded-md p-3">
                  <input
                    placeholder="Name"
                    value={c.name}
                    onChange={(e) => updateContact(c.id, { name: e.target.value })}
                    className="md:col-span-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Email"
                    value={c.email || ''}
                    onChange={(e) => updateContact(c.id, { email: e.target.value })}
                    className="md:col-span-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Phone"
                    value={c.phone || ''}
                    onChange={(e) => updateContact(c.id, { phone: e.target.value })}
                    className="md:col-span-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    placeholder="Role"
                    value={c.role || ''}
                    onChange={(e) => updateContact(c.id, { role: e.target.value })}
                    className="md:col-span-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="md:col-span-2 flex items-center gap-2">
                    <label className="flex items-center text-sm text-gray-700">
                      <input
                        type="radio"
                        name="primaryContact"
                        checked={!!c.isPrimary}
                        onChange={() => setPrimaryContact(c.id)}
                        className="mr-2"
                      />
                      Primary
                    </label>
                    <button type="button" onClick={() => removeContact(c.id)} className="text-xs text-red-600 hover:underline ml-auto">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes and Active */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="pt-6">
              <label className="inline-flex items-center text-sm text-gray-700">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="mr-2" />
                Active Client
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {client ? 'Update' : 'Create'} Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
