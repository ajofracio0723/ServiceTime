import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Save, X } from 'lucide-react';
import { JobSignature } from './types';

interface SignatureCaptureProps {
  signatures: JobSignature[];
  onSignaturesChange: (signatures: JobSignature[]) => void;
}

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  signerName: string;
  signerTitle?: string;
  type: JobSignature['type'];
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  onSave, 
  onCancel, 
  signerName, 
  signerTitle, 
  type 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
            <p className="text-sm text-gray-600">
              {type === 'client' ? 'Client' : type === 'technician' ? 'Technician' : 'Supervisor'} Signature
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signer Name
            </label>
            <p className="text-sm text-gray-900">{signerName}</p>
            {signerTitle && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">
                  Title
                </label>
                <p className="text-sm text-gray-900">{signerTitle}</p>
              </>
            )}
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Please sign below:</p>
            <canvas
              ref={canvasRef}
              className="w-full h-48 bg-white border border-gray-200 rounded cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={clearSignature}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveSignature}
              disabled={isEmpty}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Save Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({ 
  signatures, 
  onSignaturesChange 
}) => {
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureType, setSignatureType] = useState<JobSignature['type']>('client');
  const [signerName, setSignerName] = useState('');
  const [signerTitle, setSignerTitle] = useState('');

  const handleAddSignature = (type: JobSignature['type']) => {
    setSignatureType(type);
    setSignerName('');
    setSignerTitle('');
    setShowSignaturePad(true);
  };

  const handleSaveSignature = (signatureData: string) => {
    const newSignature: JobSignature = {
      id: `signature_${Date.now()}`,
      type: signatureType,
      signatureData,
      signerName,
      signerTitle,
      signedAt: new Date().toISOString()
    };

    onSignaturesChange([...signatures, newSignature]);
    setShowSignaturePad(false);
  };

  const handleDeleteSignature = (signatureId: string) => {
    onSignaturesChange(signatures.filter(sig => sig.id !== signatureId));
  };

  const getSignatureTypeColor = (type: JobSignature['type']) => {
    switch (type) {
      case 'client': return 'bg-blue-100 text-blue-800';
      case 'technician': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignatureTypeLabel = (type: JobSignature['type']) => {
    switch (type) {
      case 'client': return 'Client';
      case 'technician': return 'Technician';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Signature Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleAddSignature('client')}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <PenTool className="w-4 h-4" />
          <span>Client Signature</span>
        </button>
        <button
          type="button"
          onClick={() => handleAddSignature('technician')}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <PenTool className="w-4 h-4" />
          <span>Technician Signature</span>
        </button>
      </div>

      {/* Existing Signatures */}
      {signatures.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Captured Signatures</h4>
          <div className="grid gap-4">
            {signatures.map((signature) => (
              <div key={signature.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getSignatureTypeColor(signature.type)}`}>
                        {getSignatureTypeLabel(signature.type)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {signature.signerName}
                      </span>
                    </div>
                    {signature.signerTitle && (
                      <p className="text-sm text-gray-600">{signature.signerTitle}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Signed on {new Date(signature.signedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSignature(signature.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Signature"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded p-2">
                  <img
                    src={signature.signatureData}
                    alt={`${signature.signerName} signature`}
                    className="max-w-full h-20 object-contain"
                  />
                </div>

                {signature.notes && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{signature.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Signature Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Signer Name *
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter signer name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter title"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowSignaturePad(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (signerName.trim()) {
                    setShowSignaturePad(false);
                    // Show signature pad after a brief delay
                    setTimeout(() => {
                      setShowSignaturePad(true);
                    }, 100);
                  }
                }}
                disabled={!signerName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad */}
      {showSignaturePad && signerName.trim() && (
        <SignaturePad
          onSave={handleSaveSignature}
          onCancel={() => setShowSignaturePad(false)}
          signerName={signerName}
          signerTitle={signerTitle}
          type={signatureType}
        />
      )}
    </div>
  );
};
