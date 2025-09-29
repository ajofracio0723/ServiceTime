const FOLDERS_KEY = 'servicetime_folders_v1';

function readAll(): string[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(folders: string[]) {
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch {}
}

export const folderStorage = {
  list(): string[] {
    return readAll();
  },
  add(name: string): { ok: boolean; reason?: string } {
    const n = name.trim();
    if (!n) return { ok: false, reason: 'Folder name is required' };
    const folders = readAll();
    if (folders.some(f => f.toLowerCase() === n.toLowerCase())) {
      return { ok: false, reason: 'Folder already exists' };
    }
    folders.push(n);
    writeAll(folders);
    return { ok: true };
  },
  remove(name: string) {
    const folders = readAll().filter(f => f !== name);
    writeAll(folders);
  }
};
