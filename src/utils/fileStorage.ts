import type { File as FileRecord, FileCategory, AntivirusScan } from '../types/domains/Files';

const STORAGE_KEY = 'servicetime_files_v1';

function readAll(): FileRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as FileRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(files: FileRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to persist files', e);
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface CreateFileOptions {
  category: FileCategory;
  originalName: string;
  relatedEntityType?: FileRecord['relatedEntityType'];
  relatedEntityId?: string;
  tags?: string[];
  isPublic?: boolean;
  uploadedBy?: string;
}

export const fileStorage = {
  list(): FileRecord[] {
    // return newest first
    return readAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  get(id: string): FileRecord | undefined {
    return readAll().find(f => f.id === id);
  },

  async createFromBlob(blob: Blob, opts: CreateFileOptions): Promise<FileRecord> {
    const id = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
    const now = new Date().toISOString();

    const dataUrl = await blobToDataUrl(blob);

    const record: FileRecord = {
      id,
      s3Object: {
        bucket: 'local-dev',
        key: `local/${id}`,
        region: 'local',
        etag: id,
      },
      category: opts.category,
      metadata: {
        originalName: opts.originalName,
        mimeType: blob.type || 'application/octet-stream',
        size: blob.size,
      },
      status: 'processing',
      antivirusScan: {
        scanId: `scan-${id}`,
        status: 'pending',
      } as AntivirusScan,
      fileAccess: {
        signedUrl: dataUrl, // using data URL for local preview/download
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        accessCount: 0,
      },
      relatedEntityType: opts.relatedEntityType,
      relatedEntityId: opts.relatedEntityId,
      tags: opts.tags ?? [],
      isPublic: !!opts.isPublic,
      uploadedBy: opts.uploadedBy ?? 'local-user',
      createdAt: now,
      updatedAt: now,
    };

    const all = readAll();
    all.push(record);
    writeAll(all);

    // simulate antivirus scanning async transition
    setTimeout(() => {
      const files = readAll();
      const idx = files.findIndex(f => f.id === id);
      if (idx >= 0) {
        // simple rule: mark images/pdf as clean, others as clean too; keep example simple
        files[idx].antivirusScan = {
          scanId: files[idx].antivirusScan.scanId,
          status: 'clean',
          scannedAt: new Date().toISOString(),
        };
        files[idx].status = 'available';
        files[idx].updatedAt = new Date().toISOString();
        writeAll(files);
      }
    }, 800);

    return record;
  },

  delete(id: string): boolean {
    const all = readAll();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return false;
    all.splice(idx, 1);
    writeAll(all);
    return true;
  },

  incrementAccess(id: string) {
    const all = readAll();
    const idx = all.findIndex(f => f.id === id);
    if (idx === -1) return;
    all[idx].fileAccess.accessCount = (all[idx].fileAccess.accessCount || 0) + 1;
    all[idx].fileAccess.lastAccessedAt = new Date().toISOString();
    all[idx].updatedAt = new Date().toISOString();
    writeAll(all);
  }
};
