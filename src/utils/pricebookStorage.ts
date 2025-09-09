// Utility for localStorage-based CRUD for PriceBook entities
// Types and helpers for services, parts, labor rates, taxes, and discounts

export type ID = string;

// Service catalog item
export interface ServiceItem {
  id: ID;
  name: string;
  description?: string;
  category?: string;
  basePrice?: number;
  unit?: string; // e.g., job, hour, each
  estimatedDuration?: number; // minutes
  skillsRequired?: string[];
  isActive?: boolean;
}

// Part catalog item
export interface PartItem {
  id: ID;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  cost?: number;
  markup?: number; // percent
  unit?: string; // each, foot, etc.
  supplier?: string;
  stockLevel?: number;
  minStockLevel?: number;
  isActive?: boolean;
}

export type SkillLevel = 'apprentice' | 'journeyman' | 'master';

// Labor rate
export interface LaborRate {
  id: ID;
  name: string;
  description?: string;
  hourlyRate: number;
  skillLevel: SkillLevel;
  isDefault?: boolean;
  isActive?: boolean;
}

export type TaxType = 'percentage' | 'fixed';

// Tax item
export interface TaxItem {
  id: ID;
  name: string;
  rate: number; // percentage or fixed amount depending on type
  type: TaxType;
  applicableServices?: string[]; // e.g., ['all'] or ['labor']
  isDefault?: boolean;
  isActive?: boolean;
}

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountConditions {
  minimumAmount?: number;
  firstTimeCustomer?: boolean;
}

// Discount item
export interface DiscountItem {
  id: ID;
  name: string;
  type: DiscountType;
  value: number; // percentage or fixed amount depending on type
  conditions?: DiscountConditions;
  isActive?: boolean;
}

export type PriceBookKind = 'services' | 'parts' | 'labor' | 'taxes' | 'discounts';

const STORAGE_KEYS: Record<PriceBookKind, string> = {
  services: 'pricebook.services',
  parts: 'pricebook.parts',
  labor: 'pricebook.labor',
  taxes: 'pricebook.taxes',
  discounts: 'pricebook.discounts',
};

// Generic functions
function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function genId(): ID {
  // Simple unique id generator for local usage
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getList<T>(kind: PriceBookKind): T[] {
  const key = STORAGE_KEYS[kind];
  return safeParse<T[]>(localStorage.getItem(key), []);
}

export function saveList<T>(kind: PriceBookKind, items: T[]): void {
  const key = STORAGE_KEYS[kind];
  localStorage.setItem(key, JSON.stringify(items));
}

export function upsertItem<T extends { id?: ID }>(kind: PriceBookKind, item: T): T & { id: ID } {
  const list = getList<any>(kind);
  let saved;
  if (item.id) {
    const idx = list.findIndex((x: any) => x.id === item.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
      saved = list[idx];
    } else {
      saved = { ...item, id: item.id };
      list.push(saved);
    }
  } else {
    saved = { ...item, id: genId() };
    list.push(saved);
  }
  saveList(kind, list);
  return saved;
}

export function deleteItem(kind: PriceBookKind, id: ID): void {
  const list = getList<any>(kind);
  const next = list.filter((x: any) => x.id !== id);
  saveList(kind, next);
}

// Convenience getters by type to keep calling code clean
export const PriceBookStorage = {
  // Services
  getServices: () => getList<ServiceItem>('services'),
  saveServices: (items: ServiceItem[]) => saveList<ServiceItem>('services', items),
  upsertService: (item: Partial<ServiceItem>) => upsertItem<ServiceItem>('services', item as ServiceItem),
  deleteService: (id: ID) => deleteItem('services', id),

  // Parts
  getParts: () => getList<PartItem>('parts'),
  saveParts: (items: PartItem[]) => saveList<PartItem>('parts', items),
  upsertPart: (item: Partial<PartItem>) => upsertItem<PartItem>('parts', item as PartItem),
  deletePart: (id: ID) => deleteItem('parts', id),

  // Labor
  getLaborRates: () => getList<LaborRate>('labor'),
  saveLaborRates: (items: LaborRate[]) => saveList<LaborRate>('labor', items),
  upsertLaborRate: (item: Partial<LaborRate>) => upsertItem<LaborRate>('labor', item as LaborRate),
  deleteLaborRate: (id: ID) => deleteItem('labor', id),

  // Taxes
  getTaxes: () => getList<TaxItem>('taxes'),
  saveTaxes: (items: TaxItem[]) => saveList<TaxItem>('taxes', items),
  upsertTax: (item: Partial<TaxItem>) => upsertItem<TaxItem>('taxes', item as TaxItem),
  deleteTax: (id: ID) => deleteItem('taxes', id),

  // Discounts
  getDiscounts: () => getList<DiscountItem>('discounts'),
  saveDiscounts: (items: DiscountItem[]) => saveList<DiscountItem>('discounts', items),
  upsertDiscount: (item: Partial<DiscountItem>) => upsertItem<DiscountItem>('discounts', item as DiscountItem),
  deleteDiscount: (id: ID) => deleteItem('discounts', id),
};
