import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Package, Wrench, Clock, Percent } from 'lucide-react';
import { PriceBookStorage, type ServiceItem, type PartItem, type LaborRate, type TaxItem, type DiscountItem, type PriceBookKind } from '../../../utils/pricebookStorage';
import { ServicesList } from './lists/ServicesList';
import { PartsList } from './lists/PartsList';
import { LaborRatesList } from './lists/LaborRatesList';
import { TaxesList } from './lists/TaxesList';
import { DiscountsList } from './lists/DiscountsList';
import { PriceBookModal, type ModalMode } from './components/PriceBookModal';

export const PriceBook = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [searchTerm, setSearchTerm] = useState('');

  // Local lists
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [parts, setParts] = useState<PartItem[]>([]);
  const [laborRates, setLaborRates] = useState<LaborRate[]>([]);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [modalKind, setModalKind] = useState<PriceBookKind>('services');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state (generic)
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    try {
      setServices(PriceBookStorage.getServices());
      setParts(PriceBookStorage.getParts());
      setLaborRates(PriceBookStorage.getLaborRates());
      setTaxes(PriceBookStorage.getTaxes());
      setDiscounts(PriceBookStorage.getDiscounts());
    } catch (e) {
      // ignore localStorage errors
      console.error('Failed to load pricebook data', e);
    }
  }, []);

  const filtered = <T extends { name?: string; description?: string; category?: string }>(list: T[]): T[] => {
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((x) =>
      (x.name || '').toLowerCase().includes(q) ||
      (x.description || '').toLowerCase().includes(q) ||
      (x.category || '').toLowerCase().includes(q)
    );
  };

  // Helper available if needed in future to get the list by tab
  // const currentList = useMemo(() => {
  //   switch (activeTab as PriceBookKind) {
  //     case 'services': return filtered(services);
  //     case 'parts': return filtered(parts);
  //     case 'labor': return filtered(laborRates);
  //     case 'taxes': return filtered(taxes);
  //     case 'discounts': return filtered(discounts);
  //     default: return [];
  //   }
  // }, [activeTab, services, parts, laborRates, taxes, discounts, searchTerm]);

  const openAdd = (kind: PriceBookKind) => {
    setModalMode('add');
    setModalKind(kind);
    setEditingId(null);
    setForm({});
    setIsModalOpen(true);
  };

  const openEdit = (kind: PriceBookKind, id: string) => {
    setModalMode('edit');
    setModalKind(kind);
    setEditingId(id);
    let item: any;
    switch (kind) {
      case 'services': item = services.find(x => x.id === id); break;
      case 'parts': item = parts.find(x => x.id === id); break;
      case 'labor': item = laborRates.find(x => x.id === id); break;
      case 'taxes': item = taxes.find(x => x.id === id); break;
      case 'discounts': item = discounts.find(x => x.id === id); break;
    }
    setForm(item || {});
    setIsModalOpen(true);
  };

  const removeItem = (kind: PriceBookKind, id: string) => {
    PriceBookStorage[`delete${kind === 'labor' ? 'LaborRate' : kind === 'taxes' ? 'Tax' : kind === 'discounts' ? 'Discount' : kind === 'parts' ? 'Part' : 'Service'}` as
      keyof typeof PriceBookStorage](id as any);
    // refresh lists
    setServices(PriceBookStorage.getServices());
    setParts(PriceBookStorage.getParts());
    setLaborRates(PriceBookStorage.getLaborRates());
    setTaxes(PriceBookStorage.getTaxes());
    setDiscounts(PriceBookStorage.getDiscounts());
  };

  const submitForm = (payload?: Record<string, any>) => {
    const kind = modalKind;
    const data = payload ?? form;
    try {
      if (kind === 'services') {
        PriceBookStorage.upsertService({ ...(data as Partial<ServiceItem>), id: editingId || undefined });
        setServices(PriceBookStorage.getServices());
      } else if (kind === 'parts') {
        PriceBookStorage.upsertPart({ ...(data as Partial<PartItem>), id: editingId || undefined });
        setParts(PriceBookStorage.getParts());
      } else if (kind === 'labor') {
        PriceBookStorage.upsertLaborRate({ ...(data as Partial<LaborRate>), id: editingId || undefined });
        setLaborRates(PriceBookStorage.getLaborRates());
      } else if (kind === 'taxes') {
        PriceBookStorage.upsertTax({ ...(data as Partial<TaxItem>), id: editingId || undefined });
        setTaxes(PriceBookStorage.getTaxes());
      } else if (kind === 'discounts') {
        PriceBookStorage.upsertDiscount({ ...(data as Partial<DiscountItem>), id: editingId || undefined });
        setDiscounts(PriceBookStorage.getDiscounts());
      }
      setIsModalOpen(false);
      setForm({});
      setEditingId(null);
    } catch (e) {
      console.error('Failed to save item', e);
    }
  };

  const tabs = [
    { id: 'services', label: 'Services', icon: Wrench, count: services.length },
    { id: 'parts', label: 'Parts', icon: Package, count: parts.length },
    { id: 'labor', label: 'Labor Rates', icon: Clock, count: laborRates.length },
    { id: 'taxes', label: 'Taxes', icon: Percent, count: taxes.length },
    { id: 'discounts', label: 'Discounts', icon: Percent, count: discounts.length }
  ];
  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return (
          <ServicesList
            items={filtered(services)}
            onEdit={(id) => openEdit('services', id)}
            onDelete={(id) => removeItem('services', id)}
          />
        );
      case 'parts':
        return (
          <PartsList
            items={filtered(parts)}
            onEdit={(id) => openEdit('parts', id)}
            onDelete={(id) => removeItem('parts', id)}
          />
        );
      case 'labor':
        return (
          <LaborRatesList
            items={filtered(laborRates)}
            onEdit={(id) => openEdit('labor', id)}
            onDelete={(id) => removeItem('labor', id)}
          />
        );
      case 'taxes':
        return (
          <TaxesList
            items={filtered(taxes)}
            onEdit={(id) => openEdit('taxes', id)}
            onDelete={(id) => removeItem('taxes', id)}
          />
        );
      case 'discounts':
        return (
          <DiscountsList
            items={filtered(discounts)}
            onEdit={(id) => openEdit('discounts', id)}
            onDelete={(id) => removeItem('discounts', id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price Book</h1>
          <p className="text-gray-600">Catalog of services, parts, labor rates, taxes, and discounts</p>
        </div>
        <button onClick={() => openAdd(activeTab as PriceBookKind)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search price book..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {renderContent()}
      </div>

      {/* Modal */}
      <PriceBookModal
        isOpen={isModalOpen}
        mode={modalMode}
        kind={modalKind}
        initialForm={form}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(f) => submitForm(f)}
      />
    </div>
  );
};
