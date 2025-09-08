import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Job } from './types';
import { jobStorage } from '../../../utils/jobStorage';

export const JobsOverview = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const savedJobs = jobStorage.getJobs();
    // Show only the most recent 4 jobs
    const recentJobs = savedJobs.slice(0, 4);
    setJobs(recentJobs);
  }, []);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'in-progress':
        return 'text-orange-600 bg-orange-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{job.clientName}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1">{formatStatus(job.status)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{job.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${job.estimatedCost}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No recent jobs</p>
            <p className="text-xs">Jobs will appear here once created</p>
          </div>
        )}
      </div>
    </div>
  );
};