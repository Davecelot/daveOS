import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  color: string
}

interface CalendarPopoverProps {
  isOpen: boolean
  onClose: () => void
  anchorElement?: HTMLElement | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Mock events for demo
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: new Date(),
    time: '10:00 AM',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Project Deadline',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '11:30 PM',
    color: 'bg-red-500'
  },
  {
    id: '3',
    title: 'Code Review',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '2:00 PM',
    color: 'bg-green-500'
  }
]

export function CalendarPopover({ isOpen, onClose, anchorElement }: CalendarPopoverProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events] = useState<CalendarEvent[]>(MOCK_EVENTS)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const popover = document.getElementById('calendar-popover')
      if (popover && !popover.contains(event.target as Node) && 
          anchorElement && !anchorElement.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorElement])

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays: (number | null)[] = []
  
  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }
  
  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setMonth(month + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const selectDate = (day: number) => {
    const newDate = new Date(year, month, day)
    setSelectedDate(newDate)
  }

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year
  }

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year
  }

  const hasEvent = (day: number) => {
    const dayDate = new Date(year, month, day)
    return events.some(event => 
      event.date.getDate() === day &&
      event.date.getMonth() === month &&
      event.date.getFullYear() === year
    )
  }

  const getEventsForSelectedDate = () => {
    return events.filter(event =>
      event.date.getDate() === selectedDate.getDate() &&
      event.date.getMonth() === selectedDate.getMonth() &&
      event.date.getFullYear() === selectedDate.getFullYear()
    )
  }

  return (
    <div 
      id="calendar-popover"
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-surface border border-surface-border rounded-xl shadow-2xl backdrop-blur-sm z-50 animate-fade-in"
      style={{ maxHeight: '400px' }}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-border">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        
        <h3 className="font-semibold text-lg">
          {MONTHS[month]} {year}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-foreground-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <button
              key={index}
              className={`
                relative h-8 w-8 text-sm rounded-lg transition-all duration-200 
                ${day === null ? 'invisible' : ''}
                ${isToday(day!) ? 'bg-accent text-accent-foreground font-semibold' : ''}
                ${isSelected(day!) && !isToday(day!) ? 'bg-surface-active' : ''}
                ${!isToday(day!) && !isSelected(day!) ? 'hover:bg-surface-hover' : ''}
              `}
              onClick={() => day && selectDate(day)}
              disabled={day === null}
            >
              {day}
              {day && hasEvent(day) && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Events for selected date */}
      {getEventsForSelectedDate().length > 0 && (
        <div className="border-t border-surface-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </h4>
            <button className="p-1 hover:bg-surface-hover rounded-lg transition-colors">
              <Plus size={14} />
            </button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {getEventsForSelectedDate().map(event => (
              <div key={event.id} className="flex items-center space-x-3 p-2 hover:bg-surface-hover rounded-lg transition-colors">
                <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  {event.time && (
                    <p className="text-xs text-foreground-muted">{event.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
