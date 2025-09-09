import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  User,
  DollarSign,
  Edit,
  MoreVertical,
  Eye,
  Users,
  FileText,
  CheckSquare,
} from 'lucide-react';
import { Job as JobType } from './types';
import { JobForm } from './JobForm';
import { JobDetails } from './JobDetails';
import { jobStorage } from '../../../utils/jobStorage';

export const Job = () => {
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobType | null>(null);
  const [viewingJob, setViewingJob] = useState<JobType | null>(null);

  // Load jobs from localStorage on component mount
  useEffect(() => {
    const savedJobs = jobStorage.getJobs();
    setJobs(savedJobs);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.assignedTechnicians.some(tech => tech.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const handleEditJob = (job: JobType) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };


  const handleViewJob = (job: JobType) => {
    setViewingJob(job);
  };


  const handleSubmitJob = (jobData: JobType) => {
    if (editingJob) {
      jobStorage.updateJob(jobData);
      setJobs(prev => prev.map(job => job.id === jobData.id ? jobData : job));
    } else {
      jobStorage.addJob(jobData);
      setJobs(prev => [...prev, jobData]);
    }
    setIsFormOpen(false);
    setEditingJob(null);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jobs & Work Orders</h2>
          <p className="text-gray-600">Manage your service jobs and work orders</p>
        </div>
        <button 
          onClick={handleCreateJob}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high' | 'urgent')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(job.status)}`}>
                  {getStatusIcon(job.status)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-lg">{getCategoryIcon(job.category)}</span>
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
                  onClick={() => handleEditJob(job)}
                  className="text-blue-600 hover:text-blue-900"
                  title="Edit Job"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Client:</span> {job.clientName}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{job.propertyAddress}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Team:</span> {job.assignedTechnicians.map(tech => tech.name).join(', ')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Duration:</span> {job.estimatedDuration}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Cost:</span> ${job.estimatedCost}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckSquare className="w-4 h-4 mr-2 text-gray-400" />
                  <span><span className="font-medium">Tasks:</span> {job.checklist.length} items</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">{job.scope.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {job.scheduledVisits && job.scheduledVisits.length > 0 && (
                    <span className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {job.scheduledVisits.length} visits
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewJob(job)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
          {jobs.length === 0 && (
            <button 
              onClick={handleCreateJob}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Job</span>
            </button>
          )}
        </div>
      )}

      {/* Job Form Modal */}
      <JobForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
        }}
        onSubmit={handleSubmitJob}
        editingJob={editingJob}
      />

      {/* Job Details Modal */}
      {viewingJob && (
        <JobDetails
          job={viewingJob}
          isOpen={true}
          onClose={() => setViewingJob(null)}
          onEdit={(job) => {
            setViewingJob(null);
            handleEditJob(job);
          }}
        />
      )}

    </div>
  );
};
