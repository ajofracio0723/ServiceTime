import React from 'react';
import { X, Calendar, Clock, MapPin, User, ClipboardList, Briefcase } from 'lucide-react';
import type { Visit as VisitType } from './types';

interface VisitDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  visit: VisitType;
  onOpenJob?: (jobId: string) => void;
}

export const VisitDetails: React.FC<VisitDetailsProps> = ({ isOpen, onClose, visit, onOpenJob }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Visit Details</h2>
            <p className="text-sm text-gray-500">Review schedule, client, property, and job info</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Schedule */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-gray-700 font-medium mb-2">
                <Calendar className="w-4 h-4 mr-2" /> Schedule
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {visit.scheduledDate}</div>
                <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> {visit.scheduledTime} - {visit.endTime}</div>
                <div className="flex items-center"><ClipboardList className="w-4 h-4 mr-2 text-gray-400" /> {visit.estimatedDuration} minutes</div>
              </div>
            </div>

            {/* Technician */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-gray-700 font-medium mb-2">
                <User className="w-4 h-4 mr-2" /> Technician
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <div>{visit.technician || 'Unassigned'}</div>
                <div className="text-xs text-gray-500">Technician ID: {visit.technicianId || '—'}</div>
                <div className="inline-flex px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">Priority: {visit.priority}</div>
              </div>
            </div>
          </div>

          {/* Client & Property */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-gray-700 font-medium mb-2">Client</div>
              <div className="text-sm text-gray-700">
                <div className="font-medium">{visit.clientName}</div>
                <div className="text-xs text-gray-500">Client ID: {visit.clientId}</div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-gray-700 font-medium mb-2">Property</div>
              <div className="text-sm text-gray-700">
                <div className="flex items-start"><MapPin className="w-4 h-4 mt-0.5 mr-2 text-gray-400" /> <span>{visit.propertyAddress}</span></div>
                <div className="text-xs text-gray-500 mt-1">Property ID: {visit.propertyId}</div>
              </div>
            </div>
          </div>

          {/* Job Link */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-700 font-medium">
                <Briefcase className="w-4 h-4 mr-2" /> Job
              </div>
              {visit.jobId && onOpenJob && (
                <button
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  onClick={() => onOpenJob(visit.jobId!)}
                >
                  Open Job
                </button>
              )}
            </div>
            <div className="text-sm text-gray-700 mt-2">
              <div>Job ID: {visit.jobId || '—'}</div>
              <div className="text-xs text-gray-500">Type: {visit.visitType}</div>
              <div className="text-xs text-gray-500">Status: {visit.status}</div>
            </div>
          </div>

          {/* Notes */}
          {visit.notes && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-gray-700 font-medium mb-2">Notes</div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}

          {/* Contacts */}
          {(visit.contactPhone || visit.contactEmail) && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-gray-700 font-medium mb-2">Contact Phone</div>
                <div className="text-sm text-gray-700">{visit.contactPhone || '—'}</div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-gray-700 font-medium mb-2">Contact Email</div>
                <div className="text-sm text-gray-700">{visit.contactEmail || '—'}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
