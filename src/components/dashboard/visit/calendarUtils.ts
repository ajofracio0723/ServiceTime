import { Visit, CalendarDay, CalendarEvent } from './types';

export const WORKING_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
  interval: 30 // 30 minutes
};

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += WORKING_HOURS.interval) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  return slots;
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

export const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

export const isTimeSlotAvailable = (
  date: string,
  time: string,
  duration: number,
  visits: Visit[],
  excludeVisitId?: string
): boolean => {
  const endTime = addMinutesToTime(time, duration);
  
  return !visits.some(visit => {
    if (excludeVisitId && visit.id === excludeVisitId) return false;
    if (visit.scheduledDate !== date) return false;
    
    const visitStart = visit.scheduledTime;
    const visitEnd = visit.endTime;
    
    // Check for overlap
    return (time < visitEnd && endTime > visitStart);
  });
};

export const getDaysInMonth = (year: number, month: number): CalendarDay[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days: CalendarDay[] = [];
  const today = new Date();
  
  // Add previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      visits: [],
      timeSlots: []
    });
  }
  
  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      visits: [],
      timeSlots: []
    });
  }
  
  // Add next month's leading days to complete the grid
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      visits: [],
      timeSlots: []
    });
  }
  
  return days;
};

export const getWeekDays = (date: Date): CalendarDay[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day; // First day is Sunday
  startOfWeek.setDate(diff);
  
  const days: CalendarDay[] = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    const isToday = currentDate.toDateString() === today.toDateString();
    
    days.push({
      date: currentDate,
      isCurrentMonth: true,
      isToday,
      visits: [],
      timeSlots: []
    });
  }
  
  return days;
};

export const visitToCalendarEvent = (visit: Visit): CalendarEvent => {
  const startDateTime = new Date(`${visit.scheduledDate}T${visit.scheduledTime}`);
  const endDateTime = new Date(`${visit.scheduledDate}T${visit.endTime}`);
  
  const colors = {
    maintenance: '#3B82F6', // blue
    repair: '#F59E0B', // orange
    inspection: '#10B981', // green
    emergency: '#EF4444' // red
  };
  
  return {
    id: visit.id,
    title: `${visit.clientName} - ${visit.visitType}`,
    start: startDateTime,
    end: endDateTime,
    visit,
    color: colors[visit.visitType]
  };
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatTimeForInput = (date: Date): string => {
  return date.toTimeString().slice(0, 5);
};

export const getVisitsForDate = (visits: Visit[], date: Date): Visit[] => {
  const dateString = formatDateForInput(date);
  return visits.filter(visit => visit.scheduledDate === dateString);
};

export const getVisitsForWeek = (visits: Visit[], startDate: Date): Visit[] => {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return visits.filter(visit => {
    const visitDate = new Date(visit.scheduledDate);
    return visitDate >= startDate && visitDate <= endDate;
  });
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
