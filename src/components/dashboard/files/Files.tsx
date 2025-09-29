import { useEffect, useState } from 'react';
import { Plus, Upload, Download, Eye, Trash2, Search, Filter, FileText, Image, Shield, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { fileStorage } from '../../../utils/fileStorage';
import type { File as FileRecord, FileCategory } from '../../../types/domains/Files';
import { FileUploader } from './FileUploader';
import { folderStorage } from '../../../utils/folderStorage';

export const Files = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRecord | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [folders, setFolders] = useState<string[]>(folderStorage.list());
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  const refresh = () => setFiles(fileStorage.list());

  useEffect(() => {
    refresh();
    setFolders(folderStorage.list());
    // small timer to catch async scan status transition after uploads
    const interval = setInterval(() => {
      setFiles(prev => {
        const latest = fileStorage.list();
        // only update if something changed in count or updatedAt
        if (latest.length !== prev.length) return latest;
        const prevMax = Math.max(0, ...prev.map(f => new Date(f.updatedAt).getTime()));
        const curMax = Math.max(0, ...latest.map(f => new Date(f.updatedAt).getTime()));
        return curMax > prevMax ? latest : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const filteredFiles = (activeTab === 'all' ? files : files.filter(f => f.category === activeTab))
    .filter(f => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        f.metadata.originalName.toLowerCase().includes(q) ||
        f.metadata.mimeType.toLowerCase().includes(q) ||
        (f.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (f.relatedEntityType || '').toLowerCase().includes(q) ||
        (f.relatedEntityId || '').toLowerCase().includes(q)
      );
    })
    .filter(f => {
      if (!selectedFolder) return true;
      return (f.tags || []).includes(`folder:${selectedFolder}`);
    });

  const inferCategory = (mime: string): FileCategory => {
    if (mime.startsWith('image/')) return 'photo';
    if (mime === 'application/pdf') return 'document';
    return 'other';
  };

  const handleUpload = async (selected: File[]) => {
    for (const f of selected) {
      await fileStorage.createFromBlob(f, {
        category: inferCategory(f.type),
        originalName: f.name,
        tags: selectedFolder ? [`folder:${selectedFolder}`] : [],
        isPublic: false,
      });
    }
    refresh();
    // refresh again after scan completes
    setTimeout(() => refresh(), 1200);
    setShowUploader(false);
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm('Delete this file? This cannot be undone.');
    if (!ok) return;
    fileStorage.delete(id);
    refresh();
  };

  const handleDownload = (file: FileRecord) => {
    try {
      fileStorage.incrementAccess(file.id);
      const a = document.createElement('a');
      a.href = file.fileAccess.signedUrl;
      a.download = file.metadata.originalName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      refresh();
    } catch (e) {
      console.error('Download failed', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-600">S3 objects (photos, docs) with signed URL access + antivirus scan</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowUploader(s => !s)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{showUploader ? 'Close Uploader' : 'Upload'}</span>
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            onClick={() => {
              const name = window.prompt('Folder name');
              if (!name) return;
              const res = folderStorage.add(name);
              if (!res.ok) {
                window.alert(res.reason || 'Failed to create folder');
                return;
              }
              setFolders(folderStorage.list());
              setSelectedFolder(name);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
          <div className="ml-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              title="Grid View"
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm border-l border-gray-200 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
              title="List View"
            >
              List
            </button>
          </div>
        </div>
      </div>

      {showUploader && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Upload Files</h3>
          <FileUploader
            onFilesSelected={handleUpload}
            accept="image/*,application/pdf"
            multiple
            maxSizeBytes={15 * 1024 * 1024}
          />
          <p className="text-xs text-gray-500 mt-2">Images and PDFs supported in MVP. Others stored as generic files.</p>
        </div>
      )}

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
        <div>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Folders</option>
            {folders.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
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

      {/* Files Content: Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
                {file.metadata.mimeType.startsWith('image/') ? (
                  <img src={file.fileAccess.signedUrl} alt={file.metadata.originalName} className="w-full h-full object-cover" />
                ) : file.metadata.mimeType === 'application/pdf' ? (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText className="w-12 h-12" />
                    <span className="text-xs mt-1">PDF</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Shield className="w-12 h-12" />
                    <span className="text-xs mt-1">File</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] font-medium rounded-full bg-white/90 border border-gray-200 text-gray-700">
                    {getStatusIcon(file.status)}
                    <span className="capitalize">{file.status}</span>
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {file.status === 'available' && (
                      <>
                        <button onClick={() => setPreviewFile(file)} className="p-2 rounded-full bg-white text-gray-700 hover:text-blue-600 shadow">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownload(file)} className="p-2 rounded-full bg-white text-gray-700 hover:text-green-600 shadow">
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(file.id)} className="p-2 rounded-full bg-white text-gray-700 hover:text-red-600 shadow">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <div className="truncate font-medium text-gray-900" title={file.metadata.originalName}>{file.metadata.originalName}</div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                  <span className="truncate">{file.metadata.mimeType}</span>
                  <span>{formatFileSize(file.metadata.size)}</span>
                </div>
                {file.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {file.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">{tag}</span>
                    ))}
                    {file.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">+{file.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      {file.metadata.mimeType.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-gray-600" />
                      ) : file.metadata.mimeType === 'application/pdf' ? (
                        <FileText className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Shield className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{file.metadata.originalName}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{file.metadata.mimeType}</span>
                        <span>•</span>
                        <span>{formatFileSize(file.metadata.size)}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{file.category}</span>
                    <span className="flex items-center space-x-1 text-xs text-gray-500">
                      {getStatusIcon(file.status)}
                      <span>{file.status}</span>
                    </span>
                    {file.antivirusScan?.status === 'infected' && (
                      <span className="flex items-center space-x-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Infected</span>
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
                      <button onClick={() => setPreviewFile(file)} className="p-2 text-gray-400 hover:text-blue-600">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDownload(file)} className="p-2 text-gray-400 hover:text-green-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(file.id)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b p-3">
              <div>
                <h4 className="font-medium text-gray-900">{previewFile.metadata.originalName}</h4>
                <p className="text-xs text-gray-500">{previewFile.metadata.mimeType} • {formatFileSize(previewFile.metadata.size)}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-2 text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {previewFile.metadata.mimeType.startsWith('image/') ? (
                <img src={previewFile.fileAccess.signedUrl} alt={previewFile.metadata.originalName} className="max-w-full h-auto mx-auto" />
              ) : previewFile.metadata.mimeType === 'application/pdf' ? (
                <iframe src={previewFile.fileAccess.signedUrl} title="PDF Preview" className="w-full h-[70vh] border" />
              ) : (
                <div className="text-center text-gray-600">
                  <p>Preview not available for this file type.</p>
                  <button onClick={() => handleDownload(previewFile)} className="mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Download</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
