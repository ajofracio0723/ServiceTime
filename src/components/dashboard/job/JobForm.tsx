import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  FileText, 
  CheckSquare,
  Camera,
  PenTool,
  AlertTriangle,
  Save,
  Users
} from 'lucide-react';
import { Job, JobFormData, ChecklistItem, ScheduledVisit, AssignedTechnician, JobScope } from './types';
import { validateJob, getFieldError, ValidationError } from '../../../utils/jobValidation';
import { SignatureCapture } from './SignatureCapture';
import { JobPhotosFromVisits } from './JobPhotosFromVisits';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: Job) => void;
  editingJob?: Job | null;
}

export const JobForm: React.FC<JobFormProps> = ({ isOpen, onClose, onSubmit, editingJob }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    clientId: '',
    clientName: '',
    propertyId: '',
    propertyAddress: '',
    estimateId: '',
    scope: {
      description: '',
      objectives: [''],
      deliverables: [''],
      exclusions: [],
      requirements: [],
      safetyNotes: []
    },
    description: '',
    category: 'maintenance',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: '',
    scheduledVisits: [],
    status: 'draft',
    priority: 'medium',
    estimatedCost: 0,
    actualCost: 0,
    laborCost: 0,
    materialCost: 0,
    assignedTechnicians: [],
    checklist: [],
    sla: {
      responseTime: 24,
      completionTime: 72,
      escalationContacts: []
    },
    signatures: [],
    internalNotes: '',
    clientNotes: ''
  });

  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title,
        clientId: editingJob.clientId,
        clientName: editingJob.clientName,
        propertyId: editingJob.propertyId,
        propertyAddress: editingJob.propertyAddress,
        estimateId: editingJob.estimateId || '',
        scope: editingJob.scope,
        description: editingJob.description,
        category: editingJob.category,
        scheduledDate: editingJob.scheduledDate,
        scheduledTime: editingJob.scheduledTime || '',
        estimatedDuration: editingJob.estimatedDuration,
        scheduledVisits: editingJob.scheduledVisits,
        status: editingJob.status,
        priority: editingJob.priority,
        estimatedCost: editingJob.estimatedCost,
        actualCost: editingJob.actualCost || 0,
        laborCost: editingJob.laborCost || 0,
        materialCost: editingJob.materialCost || 0,
        assignedTechnicians: editingJob.assignedTechnicians,
        checklist: editingJob.checklist,
        sla: editingJob.sla,
        signatures: editingJob.signatures,
        internalNotes: editingJob.internalNotes || '',
        clientNotes: editingJob.clientNotes || ''
      });
    } else {
      // Reset form for new job
      setFormData({
        title: '',
        clientId: '',
        clientName: '',
        propertyId: '',
        propertyAddress: '',
        estimateId: '',
        scope: {
          description: '',
          objectives: [''],
          deliverables: [''],
          exclusions: [],
          requirements: [],
          safetyNotes: []
        },
        description: '',
        category: 'maintenance',
        scheduledDate: '',
        scheduledTime: '',
        estimatedDuration: '',
        scheduledVisits: [],
        status: 'draft',
        priority: 'medium',
        estimatedCost: 0,
        actualCost: 0,
        laborCost: 0,
        materialCost: 0,
        assignedTechnicians: [],
        checklist: [],
        sla: {
          responseTime: 24,
          completionTime: 72,
          escalationContacts: []
        },
          signatures: [],
        internalNotes: '',
        clientNotes: ''
      });
    }
    setValidationErrors([]);
    setShowValidationErrors(false);
  }, [editingJob, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateJob(formData);
    setValidationErrors(errors);
    setShowValidationErrors(true);
    
    if (errors.length > 0) {
      return;
    }

    const now = new Date().toISOString();
    const jobData: Job = {
      ...formData,
      id: editingJob?.id || `job_${Date.now()}`,
      jobNumber: editingJob?.jobNumber || `JOB-${Date.now()}`,
      createdAt: editingJob?.createdAt || now,
      createdBy: editingJob?.createdBy || 'current_user',
      updatedAt: now,
      updatedBy: 'current_user',
      completedAt: editingJob?.completedAt
    };

    onSubmit(jobData);
    onClose();
  };

  const addChecklistItem = () => {
    const newItem: ChecklistItem = {
      id: `checklist_${Date.now()}`,
      task: '',
      completed: false
    };
    setFormData(prev => ({
      ...prev,
      checklist: [...prev.checklist, newItem]
    }));
  };

  const updateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
  };

  const addScheduledVisit = () => {
    const newVisit: ScheduledVisit = {
      id: `visit_${Date.now()}`,
      date: '',
      time: '',
      duration: '1 hour',
      purpose: '',
      status: 'scheduled'
    };
    setFormData(prev => ({
      ...prev,
      scheduledVisits: [...prev.scheduledVisits, newVisit]
    }));
  };

  const updateScheduledVisit = (index: number, field: keyof ScheduledVisit, value: any) => {
    setFormData(prev => ({
      ...prev,
      scheduledVisits: prev.scheduledVisits.map((visit, i) => 
        i === index ? { ...visit, [field]: value } : visit
      )
    }));
  };

  const removeScheduledVisit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      scheduledVisits: prev.scheduledVisits.filter((_, i) => i !== index)
    }));
  };

  const addTechnician = () => {
    const newTech: AssignedTechnician = {
      id: `tech_${Date.now()}`,
      name: '',
      role: '',
      isPrimary: formData.assignedTechnicians.length === 0
    };
    setFormData(prev => ({
      ...prev,
      assignedTechnicians: [...prev.assignedTechnicians, newTech]
    }));
  };

  const updateTechnician = (index: number, field: keyof AssignedTechnician, value: any) => {
    setFormData(prev => ({
      ...prev,
      assignedTechnicians: prev.assignedTechnicians.map((tech, i) => {
        if (i === index) {
          // If setting this tech as primary, unset others
          if (field === 'isPrimary' && value === true) {
            return { ...tech, [field]: value };
          }
          return { ...tech, [field]: value };
        } else if (field === 'isPrimary' && value === true) {
          // Unset primary for other techs
          return { ...tech, isPrimary: false };
        }
        return tech;
      })
    }));
  };

  const removeTechnician = (index: number) => {
    setFormData(prev => ({
      ...prev,
      assignedTechnicians: prev.assignedTechnicians.filter((_, i) => i !== index)
    }));
  };

  const updateScopeArray = (field: keyof JobScope, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [field]: (prev.scope[field] as string[]).map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addScopeArrayItem = (field: keyof JobScope) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [field]: [...(prev.scope[field] as string[]), '']
      }
    }));
  };

  const removeScopeArrayItem = (field: keyof JobScope, index: number) => {
    setFormData(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [field]: (prev.scope[field] as string[]).filter((_, i) => i !== index)
      }
    }));
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'scope', label: 'Scope', icon: AlertTriangle },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'sla', label: 'SLA', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'signatures', label: 'Signatures', icon: PenTool }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingJob ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showValidationErrors && getFieldError(validationErrors, 'title') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter job title"
                    />
                    {showValidationErrors && getFieldError(validationErrors, 'title') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'title')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hvac">🌡️ HVAC</option>
                      <option value="plumbing">🔧 Plumbing</option>
                      <option value="electrical">⚡ Electrical</option>
                      <option value="landscaping">🌿 Landscaping</option>
                      <option value="cleaning">🧹 Cleaning</option>
                      <option value="maintenance">🔨 Maintenance</option>
                      <option value="repair">🛠️ Repair</option>
                      <option value="installation">📦 Installation</option>
                      <option value="inspection">🔍 Inspection</option>
                      <option value="other">📋 Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client *
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value, clientId: `client_${Date.now()}` }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showValidationErrors && getFieldError(validationErrors, 'clientId') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter client name"
                    />
                    {showValidationErrors && getFieldError(validationErrors, 'clientId') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'clientId')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value, propertyId: `property_${Date.now()}` }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      showValidationErrors && getFieldError(validationErrors, 'propertyId') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter property address"
                  />
                  {showValidationErrors && getFieldError(validationErrors, 'propertyId') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'propertyId')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter job description"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Cost
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Labor Cost
                    </label>
                    <input
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, laborCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material Cost
                    </label>
                    <input
                      type="number"
                      value={formData.materialCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scope Tab */}
            {activeTab === 'scope' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scope Description *
                  </label>
                  <textarea
                    value={formData.scope.description}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      scope: { ...prev.scope, description: e.target.value }
                    }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      showValidationErrors && getFieldError(validationErrors, 'scope.description') ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the scope of work"
                  />
                  {showValidationErrors && getFieldError(validationErrors, 'scope.description') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'scope.description')}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Objectives *
                    </label>
                    <button
                      type="button"
                      onClick={() => addScopeArrayItem('objectives')}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Objective
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.scope.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => updateScopeArray('objectives', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter objective"
                        />
                        {formData.scope.objectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScopeArrayItem('objectives', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {showValidationErrors && getFieldError(validationErrors, 'scope.objectives') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'scope.objectives')}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Deliverables
                    </label>
                    <button
                      type="button"
                      onClick={() => addScopeArrayItem('deliverables')}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Deliverable
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.scope.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={deliverable}
                          onChange={(e) => updateScopeArray('deliverables', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter deliverable"
                        />
                        {formData.scope.deliverables.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScopeArrayItem('deliverables', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showValidationErrors && getFieldError(validationErrors, 'scheduledDate') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {showValidationErrors && getFieldError(validationErrors, 'scheduledDate') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'scheduledDate')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Duration *
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        showValidationErrors && getFieldError(validationErrors, 'estimatedDuration') ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 2 hours"
                    />
                    {showValidationErrors && getFieldError(validationErrors, 'estimatedDuration') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'estimatedDuration')}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Scheduled Visits</h3>
                    <button
                      type="button"
                      onClick={addScheduledVisit}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Visit
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.scheduledVisits.map((visit, index) => (
                      <div key={visit.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Visit {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeScheduledVisit(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                            <input
                              type="date"
                              value={visit.date}
                              onChange={(e) => updateScheduledVisit(index, 'date', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                            <input
                              type="time"
                              value={visit.time}
                              onChange={(e) => updateScheduledVisit(index, 'time', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                            <input
                              type="text"
                              value={visit.duration}
                              onChange={(e) => updateScheduledVisit(index, 'duration', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="1 hour"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Purpose</label>
                          <input
                            type="text"
                            value={visit.purpose}
                            onChange={(e) => updateScheduledVisit(index, 'purpose', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Purpose of this visit"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Assigned Technicians</h3>
                    <button
                      type="button"
                      onClick={addTechnician}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Technician
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.assignedTechnicians.map((tech, index) => (
                      <div key={tech.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Technician {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeTechnician(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              value={tech.name}
                              onChange={(e) => updateTechnician(index, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Technician name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
                            <input
                              type="text"
                              value={tech.role}
                              onChange={(e) => updateTechnician(index, 'role', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Lead Technician"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={tech.phone || ''}
                              onChange={(e) => updateTechnician(index, 'phone', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Phone number"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={tech.email || ''}
                              onChange={(e) => updateTechnician(index, 'email', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Email address"
                            />
                          </div>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`primary-${tech.id}`}
                            checked={tech.isPrimary}
                            onChange={(e) => updateTechnician(index, 'isPrimary', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`primary-${tech.id}`} className="ml-2 block text-sm text-gray-900">
                            Primary Technician
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  {showValidationErrors && getFieldError(validationErrors, 'assignedTechnicians') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError(validationErrors, 'assignedTechnicians')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Checklist Tab */}
            {activeTab === 'checklist' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Job Checklist</h3>
                    <button
                      type="button"
                      onClick={addChecklistItem}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Task
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.checklist.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => updateChecklistItem(index, 'completed', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          value={item.task}
                          onChange={(e) => updateChecklistItem(index, 'task', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter task description"
                        />
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SLA Tab */}
            {activeTab === 'sla' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Response Time (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.sla.responseTime}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        sla: { ...prev.sla, responseTime: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Completion Time (hours)
                    </label>
                    <input
                      type="number"
                      value={formData.sla.completionTime}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        sla: { ...prev.sla, completionTime: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Photos from Visits</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <p className="text-blue-800 font-medium">Photos are managed through Visit Progress</p>
                    </div>
                    <p className="text-blue-600 text-sm mt-2">
                      All photos for this job are captured by technicians during visits and will be displayed here automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signatures Tab */}
            {activeTab === 'signatures' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Signatures</h3>
                  <SignatureCapture
                    signatures={formData.signatures}
                    onSignaturesChange={(signatures) => setFormData(prev => ({ ...prev, signatures }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{editingJob ? 'Update Job' : 'Create Job'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
