import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  Circle, 
  Play, 
  Pause, 
  Camera, 
  MessageSquare, 
  Navigation,
  AlertTriangle,
  Timer,
  Activity
} from 'lucide-react';
import { Visit, VisitProgress as VisitProgressType, VisitStage, ProgressNote, TimeEntry } from './types';

interface VisitProgressProps {
  visit: Visit;
  onUpdateProgress: (visitId: string, progress: Partial<VisitProgressType>) => void;
  onUpdateVisitStatus: (visitId: string, status: Visit['status']) => void;
}

const defaultStages: VisitStage[] = [
  { id: '1', name: 'Travel', description: 'En route to location', order: 1, required: true, estimatedDuration: 15 },
  { id: '2', name: 'Arrival', description: 'Arrived at property', order: 2, required: true, estimatedDuration: 5 },
  { id: '3', name: 'Assessment', description: 'Initial assessment and setup', order: 3, required: true, estimatedDuration: 15 },
  { id: '4', name: 'Work', description: 'Main service work', order: 4, required: true, estimatedDuration: 60 },
  { id: '5', name: 'Testing', description: 'Testing and quality check', order: 5, required: true, estimatedDuration: 10 },
  { id: '6', name: 'Cleanup', description: 'Cleanup and documentation', order: 6, required: true, estimatedDuration: 10 },
  { id: '7', name: 'Completion', description: 'Client sign-off and departure', order: 7, required: true, estimatedDuration: 5 }
];

export const VisitProgress: React.FC<VisitProgressProps> = ({
  visit,
  onUpdateProgress,
  onUpdateVisitStatus
}) => {
  const [progress, setProgress] = useState<VisitProgressType>(
    visit.progress || {
      id: `progress-${visit.id}`,
      visitId: visit.id,
      currentStage: defaultStages[0],
      stages: defaultStages.map(stage => ({
        stage,
        status: 'pending'
      })),
      progressNotes: [],
      photos: [],
      timeTracking: [],
      completionPercentage: 0
    }
  );
  
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStageUpdate = (stageId: string, status: 'in-progress' | 'completed' | 'skipped') => {
    const updatedStages = progress.stages.map(stageProgress => {
      if (stageProgress.stage.id === stageId) {
        const now = new Date().toISOString();
        return {
          ...stageProgress,
          status,
          startTime: status === 'in-progress' ? now : stageProgress.startTime,
          endTime: status === 'completed' ? now : undefined,
          actualDuration: status === 'completed' && stageProgress.startTime 
            ? Math.round((new Date(now).getTime() - new Date(stageProgress.startTime).getTime()) / 60000)
            : undefined
        };
      }
      return stageProgress;
    });

    const completedStages = updatedStages.filter(s => s.status === 'completed').length;
    const completionPercentage = Math.round((completedStages / updatedStages.length) * 100);
    
    const currentStageIndex = updatedStages.findIndex(s => s.status === 'in-progress');
    const currentStage = currentStageIndex >= 0 ? updatedStages[currentStageIndex].stage : defaultStages[0];

    const updatedProgress = {
      ...progress,
      stages: updatedStages,
      currentStage,
      completionPercentage
    };

    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);

    // Auto-update visit status based on progress
    if (completionPercentage === 100) {
      onUpdateVisitStatus(visit.id, 'completed');
    } else if (completionPercentage > 0) {
      onUpdateVisitStatus(visit.id, 'in-progress');
    }
  };

  const handleCheckIn = () => {
    const now = new Date().toISOString();
    const updatedProgress = {
      ...progress,
      checkInTime: now,
      actualStartTime: now
    };
    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);
    onUpdateVisitStatus(visit.id, 'arrived');
    
    // Start first stage
    handleStageUpdate('1', 'completed'); // Travel completed
    handleStageUpdate('2', 'in-progress'); // Arrival in progress
  };

  const handleCheckOut = () => {
    const now = new Date().toISOString();

    const updatedProgress = {
      ...progress,
      checkOutTime: now,
      actualEndTime: now
    };
    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);
    onUpdateVisitStatus(visit.id, 'completed');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note: ProgressNote = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      note: newNote,
      type: 'info',
      technicianId: visit.technicianId,
      technicianName: visit.technician
    };

    const updatedProgress = {
      ...progress,
      progressNotes: [...progress.progressNotes, note]
    };

    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);
    setNewNote('');
  };

  const startTimer = (activity: string) => {
    const timeEntry: TimeEntry = {
      id: Date.now().toString(),
      startTime: new Date().toISOString(),
      activity,
      description: `Timer started for ${activity}`
    };

    const updatedProgress = {
      ...progress,
      timeTracking: [...progress.timeTracking, timeEntry]
    };

    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);
    setActiveTimer(timeEntry.id);
  };

  const stopTimer = () => {
    if (!activeTimer) return;

    const now = new Date().toISOString();
    const updatedTimeTracking = progress.timeTracking.map(entry => {
      if (entry.id === activeTimer) {
        const duration = Math.round((new Date(now).getTime() - new Date(entry.startTime).getTime()) / 60000);
        return {
          ...entry,
          endTime: now,
          duration
        };
      }
      return entry;
    });

    const updatedProgress = {
      ...progress,
      timeTracking: updatedTimeTracking
    };

    setProgress(updatedProgress);
    onUpdateProgress(visit.id, updatedProgress);
    setActiveTimer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'in-progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'skipped': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Circle className="w-5 h-5" />;
      case 'in-progress': return <Play className="w-5 h-5 text-blue-600" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'skipped': return <Circle className="w-5 h-5 text-yellow-600" />;
      default: return <Circle className="w-5 h-5" />;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getElapsedTime = () => {
    if (!progress.checkInTime) return '0m';
    const elapsed = Math.round((currentTime.getTime() - new Date(progress.checkInTime).getTime()) / 60000);
    return formatDuration(elapsed);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visit Progress</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {visit.technician}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {visit.clientName}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {visit.scheduledTime} - {visit.endTime}
            </span>
          </div>
        </div>
        
        {/* Progress Circle */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${progress.completionPercentage * 1.76} 176`}
              className="text-blue-600"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-900">
              {progress.completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Status and Timer */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <Activity className="w-4 h-4 text-gray-500" />
          </div>
          <span className={`text-lg font-semibold capitalize ${
            visit.status === 'completed' ? 'text-green-600' :
            visit.status === 'in-progress' ? 'text-blue-600' :
            visit.status === 'arrived' ? 'text-orange-600' :
            'text-gray-600'
          }`}>
            {visit.status.replace('-', ' ')}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Elapsed Time</span>
            <Timer className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            {getElapsedTime()}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Stage</span>
            <Navigation className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-lg font-semibold text-blue-600">
            {progress.currentStage.name}
          </span>
        </div>
      </div>

      {/* Check In/Out Buttons */}
      {!progress.checkInTime ? (
        <div className="mb-6">
          <button
            onClick={handleCheckIn}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Check In & Start Visit</span>
          </button>
        </div>
      ) : !progress.checkOutTime ? (
        <div className="mb-6">
          <button
            onClick={handleCheckOut}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
          >
            <Pause className="w-5 h-5" />
            <span>Check Out & Complete Visit</span>
          </button>
        </div>
      ) : null}

      {/* Progress Stages */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Progress Stages</h4>
        <div className="space-y-3">
          {progress.stages.map((stageProgress) => (
            <div key={stageProgress.stage.id} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 ${getStatusColor(stageProgress.status)}`}>
                {getStatusIcon(stageProgress.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getStatusColor(stageProgress.status)}`}>
                    {stageProgress.stage.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    {stageProgress.actualDuration && (
                      <span className="text-xs text-gray-500">
                        {formatDuration(stageProgress.actualDuration)}
                      </span>
                    )}
                    {progress.checkInTime && stageProgress.status === 'pending' && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleStageUpdate(stageProgress.stage.id, 'in-progress')}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => handleStageUpdate(stageProgress.stage.id, 'skipped')}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
                        >
                          Skip
                        </button>
                      </div>
                    )}
                    {stageProgress.status === 'in-progress' && (
                      <button
                        onClick={() => handleStageUpdate(stageProgress.stage.id, 'completed')}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{stageProgress.stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Tracking */}
      {progress.checkInTime && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold text-gray-900">Time Tracking</h4>
            {!activeTimer ? (
              <button
                onClick={() => startTimer('General Work')}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 flex items-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Start Timer</span>
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 flex items-center space-x-1"
              >
                <Pause className="w-3 h-3" />
                <span>Stop Timer</span>
              </button>
            )}
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {progress.timeTracking.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                <span className="font-medium">{entry.activity}</span>
                <span className="text-gray-600">
                  {entry.duration ? formatDuration(entry.duration) : 'Running...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Notes */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Progress Notes</h4>
        
        {/* Add Note */}
        <div className="flex space-x-2 mb-3">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a progress note..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <button
            onClick={handleAddNote}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {progress.progressNotes.map((note) => (
            <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{note.technicianName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(note.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200">
          <Camera className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
        <button className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200">
          <AlertTriangle className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>
    </div>
  );
};
