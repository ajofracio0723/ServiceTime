import { Communication, CommunicationTemplate } from '../types/domains/Communication';

const COMM_KEY = 'servicetime_communications';
const TPL_KEY = 'servicetime_comm_templates';

function safeParse<T>(val: string | null, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

export const communicationStorage = {
  getAll(): Communication[] {
    return safeParse<Communication[]>(localStorage.getItem(COMM_KEY), []);
  },
  getById(id: string): Communication | null {
    const list = communicationStorage.getAll();
    return list.find(c => c.id === id) || null;
  },
  saveAll(list: Communication[]): void {
    localStorage.setItem(COMM_KEY, JSON.stringify(list));
  },
  add(comm: Communication): void {
    const list = communicationStorage.getAll();
    list.unshift(comm);
    communicationStorage.saveAll(list);
  },
  update(id: string, partial: Partial<Communication>): Communication | null {
    const list = communicationStorage.getAll();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...partial, updatedAt: new Date().toISOString() };
    communicationStorage.saveAll(list);
    return list[idx];
  },
  remove(id: string): void {
    const list = communicationStorage.getAll().filter(c => c.id !== id);
    communicationStorage.saveAll(list);
  }
};

export const templateStorage = {
  getAll(): CommunicationTemplate[] {
    return safeParse<CommunicationTemplate[]>(localStorage.getItem(TPL_KEY), []);
  },
  saveAll(list: CommunicationTemplate[]): void {
    localStorage.setItem(TPL_KEY, JSON.stringify(list));
  },
  upsert(tpl: CommunicationTemplate): void {
    const list = templateStorage.getAll();
    const idx = list.findIndex(t => t.id === tpl.id);
    if (idx >= 0) {
      list[idx] = tpl;
    } else {
      list.unshift(tpl);
    }
    templateStorage.saveAll(list);
  },
  remove(id: string): void {
    const list = templateStorage.getAll().filter(t => t.id !== id);
    templateStorage.saveAll(list);
  }
};
