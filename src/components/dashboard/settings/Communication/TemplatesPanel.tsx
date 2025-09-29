import { Eye, Edit, Trash2, Plus } from 'lucide-react';

type Template = {
  id: string;
  name: string;
  type: string;
  subject?: string;
  content: string;
  variables: string[];
  isActive: boolean;
};

type Props = {
  templates: Template[];
  onNew: () => void;
  onEdit: (tpl: Template) => void;
  onDelete: (id: string) => void;
};

export default function TemplatesPanel({ templates, onNew, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onNew} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>
      {templates.map((template) => (
        <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {template.type.replace('_', ' ')}
                </span>
                {template.isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Active
                  </span>
                )}
              </div>

              {template.subject && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Subject: </span>
                  <span className="text-sm text-gray-600">{template.subject}</span>
                </div>
              )}

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Content: </span>
                <p className="text-sm text-gray-600 mt-1">{template.content}</p>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <span>Variables: {template.variables.map((v: string) => `{{${v}}}`).join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-blue-600" onClick={() => onEdit(template)}>
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-amber-600" onClick={() => onEdit(template)}>
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600" onClick={() => onDelete(template.id)}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
