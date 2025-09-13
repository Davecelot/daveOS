import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2,
  X,
  Save
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  reminder?: number; // minutes before
  color: string;
  allDay: boolean;
}

interface CalendarProps {
  windowId?: string;
  onClose?: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onClose: _onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    attendees: '',
    reminder: 15,
    color: '#3b82f6',
    allDay: false
  });

  const eventColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('daveOS-calendar-events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }));
      setEvents(parsedEvents);
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('daveOS-calendar-events', JSON.stringify(events));
  }, [events]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -1 : 1;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const openEventModal = (date?: Date, event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setEventForm({
        title: event.title,
        description: event.description,
        date: event.date.toISOString().split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || '',
        attendees: event.attendees?.join(', ') || '',
        reminder: event.reminder || 15,
        color: event.color,
        allDay: event.allDay
      });
    } else {
      setEditingEvent(null);
      const targetDate = date || selectedDate;
      setEventForm({
        title: '',
        description: '',
        date: targetDate.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        attendees: '',
        reminder: 15,
        color: '#3b82f6',
        allDay: false
      });
    }
    setShowEventModal(true);
  };

  const saveEvent = () => {
    const eventData: Event = {
      id: editingEvent?.id || Date.now().toString(),
      title: eventForm.title,
      description: eventForm.description,
      date: new Date(eventForm.date),
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      location: eventForm.location,
      attendees: eventForm.attendees ? eventForm.attendees.split(',').map(a => a.trim()) : [],
      reminder: eventForm.reminder,
      color: eventForm.color,
      allDay: eventForm.allDay
    };

    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? eventData : e));
    } else {
      setEvents(prev => [...prev, eventData]);
    }

    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (eventId: string) => {
    if (confirm('Delete this event?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setShowEventModal(false);
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Day headers
    days.push(
      <div key="headers" className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
    );

    // Calendar grid
    const weeks = [];
    let currentWeek = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(
        <div key={`empty-${i}`} className="h-24 p-1 border border-gray-200"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();

      currentWeek.push(
        <div
          key={day}
          className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setSelectedDate(date)}
          onDoubleClick={() => openEventModal(date)}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                style={{ backgroundColor: event.color, color: 'white' }}
                onClick={(e) => {
                  e.stopPropagation();
                  openEventModal(undefined, event);
                }}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      );

      if (currentWeek.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    // Fill remaining cells
    while (currentWeek.length < 7 && currentWeek.length > 0) {
      currentWeek.push(
        <div key={`empty-end-${currentWeek.length}`} className="h-24 p-1 border border-gray-200"></div>
      );
    }

    if (currentWeek.length === 7) {
      weeks.push(
        <div key={`week-${weeks.length}`} className="grid grid-cols-7 gap-1">
          {currentWeek}
        </div>
      );
    }

    days.push(...weeks);
    return <div>{days}</div>;
  };

  const renderEventModal = () => {
    if (!showEventModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingEvent ? 'Edit Event' : 'New Event'}
            </h3>
            <button
              onClick={() => setShowEventModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allDay"
                checked={eventForm.allDay}
                onChange={(e) => setEventForm(prev => ({ ...prev, allDay: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                All day
              </label>
            </div>

            {!eventForm.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex space-x-2">
                {eventColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setEventForm(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded-full border-2 ${
                      eventForm.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder
              </label>
              <select
                value={eventForm.reminder}
                onChange={(e) => setEventForm(prev => ({ ...prev, reminder: Number(e.target.value) }))}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>No reminder</option>
                <option value={5}>5 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
                <option value={1440}>1 day before</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <div>
              {editingEvent && (
                <button
                  onClick={() => deleteEvent(editingEvent.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEvent}
                disabled={!eventForm.title}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (view === 'month') navigateMonth('prev');
                else if (view === 'week') navigateWeek('prev');
                else navigateDay('prev');
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {view === 'month' && formatMonthYear(currentDate)}
              {view === 'week' && formatWeekRange(currentDate)}
              {view === 'day' && currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
              })}
            </h2>
            
            <button
              onClick={() => {
                if (view === 'month') navigateMonth('next');
                else if (view === 'week') navigateWeek('next');
                else navigateDay('next');
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex border border-gray-300 rounded">
            {(['month', 'week', 'day'] as const).map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 text-sm capitalize ${
                  view === viewType 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>

          <button
            onClick={() => openEventModal()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 p-4 overflow-auto">
        {view === 'month' && renderMonthView()}
        {view === 'week' && (
          <div className="text-center text-gray-500 mt-20">
            Week view - Coming soon
          </div>
        )}
        {view === 'day' && (
          <div className="text-center text-gray-500 mt-20">
            Day view - Coming soon
          </div>
        )}
      </div>

      {/* Event Modal */}
      {renderEventModal()}
    </div>
  );
};
