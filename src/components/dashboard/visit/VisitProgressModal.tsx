import React from 'react';
import { X } from 'lucide-react';
import { Visit, VisitProgress as VisitProgressType } from './types';
import { VisitProgress } from './VisitProgress';

interface VisitProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: Visit;
  onUpdateProgress: (visitId: string, progress: Partial<VisitProgressType>) => void;
  onUpdateVisitStatus: (visitId: string, status: Visit['status']) => void;
}

export const VisitProgressModal: React.FC<VisitProgressModalProps> = ({
  isOpen,
  onClose,
  visit,
  onUpdateProgress,
  onUpdateVisitStatus
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Visit Progress - {visit.clientName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <VisitProgress
            visit={visit}
            onUpdateProgress={onUpdateProgress}
            onUpdateVisitStatus={onUpdateVisitStatus}
          />
        </div>
      </div>
    </div>
  );
};
