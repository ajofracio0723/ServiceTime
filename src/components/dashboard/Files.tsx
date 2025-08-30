import React, { useState } from 'react';
import { Plus, Upload, Download, Eye, Trash2, Search, Filter, FileText, Image, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export const Files = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const files = [
    {
      id: '1',
      s3Object: {
        bucket: 'servicetime-files',
        key: 'jobs/job-123/before-photo.jpg',
        region: 'us-east-1',
        etag: 'abc123'
      },
      category: 'photo',
      metadata: {
        originalName: 'before-photo.jpg',
        mimeType: 'image/jpeg',
        size: 2048576,
        dimensions: { width: 1920, height: 1080 }
      },
      status: 'available',
      antivirusScan: {
        scanId: 'scan-001',
        status: 'clean',
        scannedAt: '2024-01-15T10:30:00Z'
      },
      fileAccess: {
        signedUrl: 'https://s3.amazonaws.com/servicetime-files/jobs/job-123/before-photo.jpg?signed',
        expiresAt: '2024-01-16T10:30:00Z',
        accessCount: 5,
        lastAccessedAt: '2024-01-15T14:20:00Z'
      },
      relatedEntityType: 'job',
      relatedEntityId: 'job-123',
      tags: ['before', 'hvac', 'inspection'],
      isPublic: false,
      uploadedBy: 'tech-001',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      s3Object: {
        bucket: 'servicetime-files',
        key: 'invoices/inv-001/invoice.pdf',
        region: 'us-east-1',
        etag: 'def456'
      },
      category: 'document',
      metadata: {
        originalName: 'invoice-001.pdf',
        mimeType: 'application/pdf',
        size: 512000
      },
      status: 'available',
      antivirusScan: {
        scanId: 'scan-002',
        status: 'clean',
        scannedAt: '2024-01-14T16:45:00Z'
      },
      fileAccess: {
        signedUrl: 'https://s3.amazonaws.com/servicetime-files/invoices/inv-001/invoice.pdf?signed',
        expiresAt: '2024-01-17T16:45:00Z',
        accessCount: 12,
        lastAccessedAt: '2024-01-15T09:15:00Z'
      },
      relatedEntityType: 'invoice',
      relatedEntityId: 'inv-001',
      tags: ['invoice', 'billing'],
      isPublic: false,
      uploadedBy: 'admin-001',
      createdAt: '2024-01-14T16:30:00Z'
    },
    {
      id: '3',
      s3Object: {
        bucket: 'servicetime-files',
        key: 'signatures/job-124/customer-signature.png',
        region: 'us-east-1',
        etag: 'ghi789'
      },
      category: 'signature',
      metadata: {
        originalName: 'signature.png',
        mimeType: 'image/png',
        size: 128000,
        dimensions: { width: 400, height: 200 }
      },
      status: 'processing',
      antivirusScan: {
        scanId: 'scan-003',
        status: 'pending'
      },
      fileAccess: {
        signedUrl: 'https://s3.amazonaws.com/servicetime-files/signatures/job-124/customer-signature.png?signed',
        expiresAt: '2024-01-16T11:00:00Z',
        accessCount: 1
      },
      relatedEntityType: 'job',
      relatedEntityId: 'job-124',
      tags: ['signature', 'completion'],
      isPublic: false,
      uploadedBy: 'tech-002',
      createdAt: '2024-01-15T11:00:00Z'
    },
    {
      id: '4',
      s3Object: {
        bucket: 'servicetime-files',
        key: 'equipment/manual-hvac-unit.pdf',
        region: 'us-east-1',
        etag: 'jkl012'
      },
      category: 'equipment_manual',
      metadata: {
        originalName: 'HVAC-Unit-Manual.pdf',
        mimeType: 'application/pdf',
        size: 5242880
      },
      status: 'quarantined',
      antivirusScan: {
        scanId: 'scan-004',
        status: 'infected',
        scannedAt: '2024-01-13T08:00:00Z',
        threatDetails: {
          threatName: 'Malware.Generic',
          severity: 'high',
          description: 'Potentially harmful content detected'
        }
      },
      fileAccess: {
        signedUrl: '',
        expiresAt: '',
        accessCount: 0
      },
      relatedEntityType: 'property',
      relatedEntityId: 'prop-001',
      tags: ['manual', 'equipment', 'hvac'],
      isPublic: false,
      uploadedBy: 'admin-001',
      createdAt: '2024-01-13T07:45:00Z'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'quarantined':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getScanIcon = (scanStatus: string) => {
    switch (scanStatus) {
      case 'clean':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'infected':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo':
        return <Image className="w-4 h-4 text-blue-500" />;
      case 'document':
      case 'equipment_manual':
      case 'warranty':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'signature':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = [
    { id: 'all', label: 'All Files', count: files.length },
    { id: 'photo', label: 'Photos', count: files.filter(f => f.category === 'photo').length },
    { id: 'document', label: 'Documents', count: files.filter(f => f.category === 'document').length },
    { id: 'signature', label: 'Signatures', count: files.filter(f => f.category === 'signature').length },
    { id: 'equipment_manual', label: 'Manuals', count: files.filter(f => f.category === 'equipment_manual').length }
  ];

  const filteredFiles = activeTab === 'all' ? files : files.filter(f => f.category === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600">S3 objects (photos, docs) with signed URL access + antivirus scan</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search files..."
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

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === category.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{category.label}</span>
              <span className="bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Files Grid */}
      <div className="space-y-4">
        {filteredFiles.map((file) => (
          <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getCategoryIcon(file.category)}
                  <h3 className="text-lg font-semibold text-gray-900">{file.metadata.originalName}</h3>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {file.category.replace('_', ' ')}
                  </span>
                  {getStatusIcon(file.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    file.status === 'available' ? 'bg-green-100 text-green-800' :
                    file.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    file.status === 'quarantined' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {file.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-6 mb-4 text-sm text-gray-500">
                  <span>Size: {formatFileSize(file.metadata.size)}</span>
                  <span>Type: {file.metadata.mimeType}</span>
                  {file.metadata.dimensions && (
                    <span>Dimensions: {file.metadata.dimensions.width}x{file.metadata.dimensions.height}</span>
                  )}
                  <span>Uploaded: {new Date(file.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center space-x-6 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {getScanIcon(file.antivirusScan.status)}
                    <span className={`font-medium ${
                      file.antivirusScan.status === 'clean' ? 'text-green-600' :
                      file.antivirusScan.status === 'infected' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      Scan: {file.antivirusScan.status}
                    </span>
                    {file.antivirusScan.threatDetails && (
                      <span className="text-red-600 text-xs">
                        ({file.antivirusScan.threatDetails.threatName})
                      </span>
                    )}
                  </div>
                  
                  <span className="text-gray-500">
                    Access Count: {file.fileAccess.accessCount}
                  </span>
                  
                  {file.relatedEntityType && (
                    <span className="text-gray-500">
                      Related: {file.relatedEntityType} #{file.relatedEntityId}
                    </span>
                  )}
                </div>

                {file.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-500">Tags:</span>
                    {file.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {file.status === 'available' && (
                  <>
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600">
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
