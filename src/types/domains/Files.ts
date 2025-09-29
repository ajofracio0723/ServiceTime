export type FileCategory = 'photo' | 'document' | 'signature' | 'logo' | 'avatar' | 'equipment_manual' | 'warranty' | 'other';
export type FileStatus = 'uploading' | 'processing' | 'available' | 'quarantined' | 'deleted';
export type ScanStatus = 'pending' | 'clean' | 'infected' | 'failed';

export interface AntivirusScan {
  scanId: string;
  status: ScanStatus;
  scannedAt?: string;
  threatDetails?: {
    threatName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  };
}

export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For video/audio files
}

export interface S3Object {
  bucket: string;
  key: string;
  region: string;
  etag: string;
  versionId?: string;
}

export interface FileAccess {
  signedUrl: string;
  expiresAt: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface File {
  id: string;
  s3Object: S3Object;
  category: FileCategory;
  metadata: FileMetadata;
  status: FileStatus;
  antivirusScan: AntivirusScan;
  fileAccess: FileAccess;
  relatedEntityType?: 'job' | 'client' | 'property' | 'user' | 'invoice' | 'estimate' | 'payment';
  relatedEntityId?: string;
  tags: string[];
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}