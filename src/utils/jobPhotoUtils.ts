import { visitStorage } from './visitStorage';

export interface VisitPhoto {
  id: string;
  url: string;
  caption: string;
  category: 'before' | 'during' | 'after' | 'issue' | 'completion';
  technicianId: string;
  timestamp: string;
  visitId: string;
  visitDate: string;
}

/**
 * Get all photos from visits related to a specific job
 * @param jobId - The job ID to fetch photos for
 * @returns Array of photos from all related visits
 */
export const getJobPhotosFromVisits = (jobId: string): VisitPhoto[] => {
  try {
    const allVisits = visitStorage.getAll();
    const jobVisits = allVisits.filter(visit => visit.jobId === jobId);
    
    const photos: VisitPhoto[] = [];
    
    jobVisits.forEach(visit => {
      if (visit.progress?.photos) {
        visit.progress.photos.forEach(photo => {
          photos.push({
            ...photo,
            visitId: visit.id,
            visitDate: visit.scheduledDate
          });
        });
      }
    });
    
    // Sort photos by timestamp (newest first)
    return photos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Error fetching job photos from visits:', error);
    return [];
  }
};

/**
 * Get photos grouped by visit for a specific job
 * @param jobId - The job ID to fetch photos for
 * @returns Object with visit IDs as keys and photo arrays as values
 */
export const getJobPhotosGroupedByVisit = (jobId: string): Record<string, VisitPhoto[]> => {
  const photos = getJobPhotosFromVisits(jobId);
  const grouped: Record<string, VisitPhoto[]> = {};
  
  photos.forEach(photo => {
    if (!grouped[photo.visitId]) {
      grouped[photo.visitId] = [];
    }
    grouped[photo.visitId].push(photo);
  });
  
  return grouped;
};

/**
 * Get photo count by category for a specific job
 * @param jobId - The job ID to get photo counts for
 * @returns Object with category counts
 */
export const getJobPhotoCounts = (jobId: string) => {
  const photos = getJobPhotosFromVisits(jobId);
  const counts = {
    before: 0,
    during: 0,
    after: 0,
    issue: 0,
    completion: 0,
    other: 0,
    total: photos.length
  };
  
  photos.forEach(photo => {
    counts[photo.category]++;
  });
  
  return counts;
};
