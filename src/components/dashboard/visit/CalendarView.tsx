import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Plus } from 'lucide-react';
import { Visit, CalendarView as CalendarViewType, CalendarDay } from './types';
import { getDaysInMonth, getWeekDays, getVisitsForDate, getPriorityColor } from './calendarUtils';

interface CalendarViewProps {
  visits: Visit[];
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onDateSelect: (date: Date, time?: string) => void;
  onVisitClick: (visit: Visit) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  visits,
  view,
  onViewChange,
  onDateSelect,
  onVisitClick
}) => {
  const [currentDate, setCurrentDate] = useState(view.currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    onViewChange({ ...view, currentDate: newDate });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
    onViewChange({ ...view, currentDate: newDate });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    onViewChange({ ...view, currentDate: newDate });
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    switch (view.type) {
      case 'month':
        navigateMonth(direction);
        break;
      case 'week':
        navigateWeek(direction);
        break;
      case 'day':
        navigateDay(direction);
        break;
    }
  };

  const getCalendarDays = (): CalendarDay[] => {
    switch (view.type) {
      case 'month':
        return getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      case 'week':
        return getWeekDays(currentDate);
      case 'day':
        return [{
          date: currentDate,
          isCurrentMonth: true,
          isToday: currentDate.toDateString() === new Date().toDateString(),
          visits: getVisitsForDate(visits, currentDate),
          timeSlots: []
        }];
      default:
        return [];
    }
  };

  const getHeaderTitle = (): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    switch (view.type) {
      case 'month':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      case 'week':
        const weekStart = new Date(currentDate);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day;
        weekStart.setDate(diff);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      case 'day':
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
      default:
        return '';
    }
  };

  const renderMonthView = () => {
    const days = getCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayVisits = getVisitsForDate(visits, day.date);
            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b cursor-pointer hover:bg-gray-50 ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${day.isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateSelect(day.date)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayVisits.slice(0, 3).map(visit => (
                    <div
                      key={visit.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVisitClick(visit);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                        visit.visitType === 'emergency' ? 'bg-red-100 text-red-800' :
                        visit.visitType === 'repair' ? 'bg-orange-100 text-orange-800' :
                        visit.visitType === 'inspection' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {visit.scheduledTime} {visit.clientName}
                    </div>
                  ))}
                  {dayVisits.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayVisits.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getCalendarDays();
    const timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-8 border-b">
          <div className="p-3 border-r"></div>
          {days.map((day, index) => (
            <div key={index} className="p-3 text-center border-r">
              <div className="text-sm font-medium text-gray-900">
                {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${
                day.isToday ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {day.date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map(time => (
            <div key={time} className="grid grid-cols-8 border-b border-gray-100">
              <div className="p-2 text-xs text-gray-500 border-r bg-gray-50">
                {time}
              </div>
              {days.map((day, dayIndex) => {
                const dayVisits = getVisitsForDate(visits, day.date);
                const timeVisit = dayVisits.find(v => v.scheduledTime === time);
                
                return (
                  <div
                    key={dayIndex}
                    className="p-1 border-r min-h-[40px] cursor-pointer hover:bg-gray-50"
                    onClick={() => onDateSelect(day.date, time)}
                  >
                    {timeVisit && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onVisitClick(timeVisit);
                        }}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                          timeVisit.visitType === 'emergency' ? 'bg-red-100 text-red-800' :
                          timeVisit.visitType === 'repair' ? 'bg-orange-100 text-orange-800' :
                          timeVisit.visitType === 'inspection' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        <div className="font-medium truncate">{timeVisit.clientName}</div>
                        <div className="truncate">{timeVisit.visitType}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayVisits = getVisitsForDate(visits, currentDate);
    const timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-sm text-gray-600">{dayVisits.length} visits scheduled</p>
        </div>

        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map(time => {
            const timeVisit = dayVisits.find(v => v.scheduledTime === time);
            
            return (
              <div key={time} className="flex border-b border-gray-100">
                <div className="w-20 p-3 text-sm text-gray-500 border-r bg-gray-50">
                  {time}
                </div>
                <div
                  className="flex-1 p-3 cursor-pointer hover:bg-gray-50 min-h-[60px]"
                  onClick={() => onDateSelect(currentDate, time)}
                >
                  {timeVisit ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onVisitClick(timeVisit);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{timeVisit.clientName}</h4>
                          <p className="text-sm text-gray-600">{timeVisit.propertyAddress}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(timeVisit.priority)}`}>
                            {timeVisit.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            timeVisit.visitType === 'emergency' ? 'bg-red-100 text-red-800' :
                            timeVisit.visitType === 'repair' ? 'bg-orange-100 text-orange-800' :
                            timeVisit.visitType === 'inspection' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {timeVisit.visitType}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {timeVisit.scheduledTime} - {timeVisit.endTime}
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {timeVisit.technician}
                        </span>
                      </div>
                      {timeVisit.notes && (
                        <p className="text-sm text-gray-600 mt-2">{timeVisit.notes}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="text-sm">Click to schedule</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleNavigation('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-[200px]">
              {getHeaderTitle()}
            </h2>
            <button
              onClick={() => handleNavigation('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              onViewChange({ ...view, currentDate: today });
            }}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Today
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as const).map((viewType) => (
            <button
              key={viewType}
              onClick={() => onViewChange({ ...view, type: viewType })}
              className={`px-3 py-1 text-sm rounded-md capitalize transition-colors ${
                view.type === viewType
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {viewType}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      {view.type === 'month' && renderMonthView()}
      {view.type === 'week' && renderWeekView()}
      {view.type === 'day' && renderDayView()}
    </div>
  );
};
