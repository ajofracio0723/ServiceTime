import React from 'react';
import { Eye, Edit, Trash2, Send } from 'lucide-react';
import { Communication as CommunicationType } from '../../../../types/domains/Communication';

type Props = {
  messages: any[] | CommunicationType[];
  searchTerm: string;
  onClearSearch: () => void;
  onOpenCompose: () => void;
  onViewDetails: (msg: any) => void;
  onEdit: (msg: any) => void;
  onDelete: (msg: any) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getTypeIcon: (type: string) => React.ReactNode;
};

export default function MessagesPanel({
  messages,
  searchTerm,
  onClearSearch,
  onOpenCompose,
  onViewDetails,
  onEdit,
  onDelete,
  getStatusIcon,
  getTypeIcon,
}: Props) {
  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center bg-white">
          <div className="text-gray-900 font-medium text-lg mb-2">No messages found</div>
          {searchTerm ? (
            <div className="text-gray-600 mb-4">Your search didn’t match any messages. Try clearing your search.</div>
          ) : (
            <div className="text-gray-600 mb-4">You haven’t sent any messages yet. Create your first email or SMS.</div>
          )}
          <div className="flex items-center justify-center gap-3">
            {searchTerm && (
              <button onClick={onClearSearch} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
                Clear Search
              </button>
            )}
            <button
              onClick={onOpenCompose}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>New Message</span>
            </button>
          </div>
        </div>
      )}

      {messages.map((comm: any) => (
        <div key={comm.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {getTypeIcon(comm.type)}
                <span className="font-medium text-gray-900">
                  {comm.type === 'email' ? comm.recipientEmail : comm.recipientPhone}
                </span>
                {getStatusIcon(comm.status)}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    comm.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : comm.status === 'sent'
                      ? 'bg-blue-100 text-blue-800'
                      : comm.status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {comm.status}
                </span>
              </div>

              {comm.subject && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{comm.subject}</h3>
              )}

              <p className="text-gray-600 mb-4">{comm.content}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                {comm.sentAt && <span>Sent: {new Date(comm.sentAt).toLocaleString()}</span>}
                {comm.receipt?.deliveredAt && (
                  <span>Delivered: {new Date(comm.receipt.deliveredAt).toLocaleString()}</span>
                )}
                {comm.receipt?.openedAt && (
                  <span>Opened: {new Date(comm.receipt.openedAt).toLocaleString()}</span>
                )}
                {comm.relatedEntityType && (
                  <span>
                    Related: {comm.relatedEntityType} #{comm.relatedEntityId}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600" onClick={() => onViewDetails(comm)}>
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-amber-600" onClick={() => onEdit(comm)}>
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600" onClick={() => onDelete(comm)}>
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-green-600" onClick={onOpenCompose}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
