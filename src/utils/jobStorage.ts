import { Job } from '../components/dashboard/job/types';

const JOBS_STORAGE_KEY = 'servicetime_jobs';

export const jobStorage = {
  // Get all jobs from localStorage
  getJobs: (): Job[] => {
    try {
      const jobsData = localStorage.getItem(JOBS_STORAGE_KEY);
      return jobsData ? JSON.parse(jobsData) : [];
    } catch (error) {
      console.error('Error loading jobs from localStorage:', error);
      return [];
    }
  },

  // Save all jobs to localStorage
  saveJobs: (jobs: Job[]): void => {
    try {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
      // Notify same-tab listeners that jobs have updated
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('servicetime_jobs_updated'));
      }
    } catch (error) {
      console.error('Error saving jobs to localStorage:', error);
    }
  },

  // Get a single job by ID
  getJobById: (id: string): Job | null => {
    const jobs = jobStorage.getJobs();
    return jobs.find(job => job.id === id) || null;
  },

  // Add a new job
  addJob: (job: Job): void => {
    const jobs = jobStorage.getJobs();
    jobs.push(job);
    jobStorage.saveJobs(jobs);
  },

  // Update an existing job
  updateJob: (updatedJob: Job): void => {
    const jobs = jobStorage.getJobs();
    const index = jobs.findIndex(job => job.id === updatedJob.id);
    if (index !== -1) {
      jobs[index] = updatedJob;
      jobStorage.saveJobs(jobs);
    }
  },

  // Delete a job
  deleteJob: (id: string): void => {
    const jobs = jobStorage.getJobs();
    const filteredJobs = jobs.filter(job => job.id !== id);
    jobStorage.saveJobs(filteredJobs);
  },

  // Generate next job number
  generateJobNumber: (): string => {
    const jobs = jobStorage.getJobs();
    const currentYear = new Date().getFullYear();
    const yearPrefix = currentYear.toString();
    
    // Find the highest job number for current year
    const yearJobs = jobs.filter(job => job.jobNumber.startsWith(yearPrefix));
    let maxNumber = 0;
    
    yearJobs.forEach(job => {
      const numberPart = job.jobNumber.split('-')[1];
      if (numberPart) {
        const num = parseInt(numberPart, 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    
    const nextNumber = (maxNumber + 1).toString().padStart(4, '0');
    return `${yearPrefix}-${nextNumber}`;
  },

  // Search jobs
  searchJobs: (searchTerm: string): Job[] => {
    const jobs = jobStorage.getJobs();
    const term = searchTerm.toLowerCase();
    
    return jobs.filter(job =>
      job.title.toLowerCase().includes(term) ||
      job.jobNumber.toLowerCase().includes(term) ||
      job.clientName.toLowerCase().includes(term) ||
      job.propertyAddress.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.assignedTechnicians.some(tech => tech.name.toLowerCase().includes(term))
    );
  },

  // Filter jobs by status
  filterJobsByStatus: (status: string): Job[] => {
    const jobs = jobStorage.getJobs();
    return status === 'all' ? jobs : jobs.filter(job => job.status === status);
  },

  // Filter jobs by priority
  filterJobsByPriority: (priority: string): Job[] => {
    const jobs = jobStorage.getJobs();
    return priority === 'all' ? jobs : jobs.filter(job => job.priority === priority);
  },

  // Get jobs by date range
  getJobsByDateRange: (startDate: string, endDate: string): Job[] => {
    const jobs = jobStorage.getJobs();
    return jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return jobDate >= start && jobDate <= end;
    });
  },

  // Get overdue jobs
  getOverdueJobs: (): Job[] => {
    const jobs = jobStorage.getJobs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return jobs.filter(job => {
      if (job.status === 'completed' || job.status === 'cancelled') {
        return false;
      }
      const scheduledDate = new Date(job.scheduledDate);
      scheduledDate.setHours(0, 0, 0, 0);
      return scheduledDate < today;
    });
  },

  // Get jobs for today
  getTodaysJobs: (): Job[] => {
    const jobs = jobStorage.getJobs();
    const today = new Date().toISOString().split('T')[0];
    
    return jobs.filter(job => job.scheduledDate === today);
  },

  // Clear all jobs (for development/testing)
  clearAllJobs: (): void => {
    localStorage.removeItem(JOBS_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('servicetime_jobs_updated'));
    }
  }
};
