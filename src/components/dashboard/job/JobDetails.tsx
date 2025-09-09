import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  MapPin, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Camera, 
  PenTool,
  AlertTriangle,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Job } from './types';

interface JobDetailsProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ job, isOpen, onClose, onEdit }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'on-hold': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'on-hold': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hvac': return '🌡️';
      case 'plumbing': return '🔧';
      case 'electrical': return '⚡';
      case 'landscaping': return '🌿';
      case 'cleaning': return '🧹';
      case 'maintenance': return '🔨';
      case 'repair': return '🛠️';
      case 'installation': return '📦';
      case 'inspection': return '🔍';
      default: return '📋';
    }
  };

  const getCompletedTasksCount = () => {
    return job.checklist?.filter(item => item.completed).length || 0;
  };

  const getCompletedVisitsCount = () => {
    return job.scheduledVisits?.filter(visit => visit.status === 'completed').length || 0;
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'scope', label: 'Scope', icon: AlertTriangle },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'checklist', label: 'Checklist', icon: CheckSquare },
    { id: 'visits', label: 'Visits', icon: Calendar },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'signatures', label: 'Signatures', icon: PenTool }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(job.status)}`}>
              {getStatusIcon(job.status)}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <span className="text-xl">{getCategoryIcon(job.category)}</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="text-xs text-gray-500">#{job.jobNumber}</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                  {job.priority}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {job.scheduledDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(job)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Job</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex" style={{ height: 'calc(90vh - 120px)' }}>
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Job Information Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Job Information</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 w-1/4">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              Client
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.clientName}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              Location
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.propertyAddress}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              Duration
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.estimatedDuration}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                              Estimated Cost
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${job.estimatedCost}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Category</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center">
                              <span className="mr-2">{getCategoryIcon(job.category)}</span>
                              {job.category}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Priority</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                              {job.priority}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Progress Summary Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Progress Summary</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 w-1/2">Tasks Completed</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {getCompletedTasksCount()}/{job.checklist?.length || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Visits Completed</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {getCompletedVisitsCount()}/{job.scheduledVisits?.length || 0}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Photos Captured</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.photos?.length || 0}</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Digital Signatures</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{job.signatures?.length || 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SLA & Timestamps Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">SLA & Timeline Information</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 w-1/2">Response Time SLA</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.sla.responseTime} hours</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Completion Time SLA</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.sla.completionTime} hours</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Created</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(job.createdAt).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Last Updated</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(job.updatedAt).toLocaleString()}
                          </td>
                        </tr>
                        {job.completedAt && (
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">Completed</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(job.completedAt).toLocaleString()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Description */}
                {job.description && (
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Description</h3>
                    </div>
                    <div className="px-6 py-4">
                      <p className="text-gray-700">{job.description}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Scope Section */}
            {activeSection === 'scope' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Scope Description</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{job.scope.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Objectives</h3>
                    <ul className="space-y-2">
                      {job.scope?.objectives?.map((objective, index) => (
                        <li key={`objective-${index}`} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{objective}</span>
                        </li>
                      )) || <li className="text-gray-500 italic">No objectives defined</li>}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Deliverables</h3>
                    <ul className="space-y-2">
                      {job.scope?.deliverables?.map((deliverable, index) => (
                        <li key={`deliverable-${index}`} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{deliverable}</span>
                        </li>
                      )) || <li className="text-gray-500 italic">No deliverables defined</li>}
                    </ul>
                  </div>
                </div>

                {job.scope?.exclusions && job.scope.exclusions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Exclusions</h3>
                    <ul className="space-y-2">
                      {job.scope.exclusions.map((exclusion, index) => (
                        <li key={`exclusion-${index}`} className="flex items-start">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Assigned Team</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {job.assignedTechnicians?.map((tech) => (
                          <tr key={tech.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tech.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tech.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="space-y-1">
                                {tech.phone && <div>📞 {tech.phone}</div>}
                                {tech.email && <div>✉️ {tech.email}</div>}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {tech.isPrimary && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Primary
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Section */}
            {activeSection === 'checklist' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Task Checklist</h3>
                      <span className="text-sm text-gray-600">
                        {getCompletedTasksCount()}/{job.checklist?.length || 0} completed
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed By</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {job.checklist?.map((item) => (
                          <tr key={item.id} className={item.completed ? 'bg-green-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                item.completed 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <span className={item.completed ? 'line-through text-gray-500' : ''}>
                                {item.task}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.notes || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {item.completed && item.completedBy ? (
                                <div>
                                  <div>{item.completedBy}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(item.completedAt!).toLocaleString()}
                                  </div>
                                </div>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Visits Section */}
            {activeSection === 'visits' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Scheduled Visits</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {job.scheduledVisits?.map((visit, index) => (
                          <tr key={visit.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Visit {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>{visit.date}</div>
                                <div className="text-xs text-gray-500">{visit.time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.duration}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{visit.purpose}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                                visit.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                visit.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {visit.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {visit.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Section */}
            {activeSection === 'photos' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Photos ({job.photos?.length || 0})</h3>
                  {job.photos && job.photos.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {job.photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={photo.url}
                              alt={photo.description || photo.filename}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              photo.category === 'before' ? 'bg-blue-100 text-blue-800' :
                              photo.category === 'during' ? 'bg-yellow-100 text-yellow-800' :
                              photo.category === 'after' ? 'bg-green-100 text-green-800' :
                              photo.category === 'issue' ? 'bg-red-100 text-red-800' :
                              photo.category === 'completion' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {photo.category}
                            </span>
                            {photo.description && (
                              <p className="text-xs text-gray-600 mt-1">{photo.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No photos uploaded yet</p>
                  )}
                </div>
              </div>
            )}

            {/* Signatures Section */}
            {activeSection === 'signatures' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Digital Signatures ({job.signatures?.length || 0})</h3>
                  {job.signatures && job.signatures.length > 0 ? (
                    <div className="space-y-4">
                      {job.signatures.map((signature) => (
                        <div key={signature.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                signature.type === 'client' ? 'bg-blue-100 text-blue-800' :
                                signature.type === 'technician' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {signature.type}
                              </span>
                              <span className="ml-2 font-medium text-gray-900">{signature.signerName}</span>
                              {signature.signerTitle && (
                                <span className="ml-1 text-sm text-gray-600">({signature.signerTitle})</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(signature.signedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-white border border-gray-200 rounded p-2">
                            <img
                              src={signature.signatureData}
                              alt={`${signature.signerName} signature`}
                              className="max-w-full h-20 object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No signatures captured yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
