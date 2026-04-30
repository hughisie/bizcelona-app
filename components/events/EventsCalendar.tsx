'use client';

import { useMemo } from 'react';

export type EventSummary = {
  id: string;
  slug: string;
  event_date: string; // ISO timestamp
  category: 'networking' | 'workshop' | 'social' | 'other';
  title: string;
};

export type EventsCalendarProps = {
  events: EventSummary[];
  selectedDate: string | null; // 'YYYY-MM-DD'
  currentMonth: string; // 'YYYY-MM'
  onDateSelect: (date: string | null) => void;
  onMonthChange: (month: string) => void;
};

const CATEGORY_COLOURS: Record<EventSummary['category'], string> = {
  networking: 'bg-blue-500',
  workshop: 'bg-purple-500',
  social: 'bg-orange-400',
  other: 'bg-green-500',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (m === 1) return `${y - 1}-12`;
  return `${y}-${String(m - 1).padStart(2, '0')}`;
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  );
}

export function EventsCalendar({
  events,
  selectedDate,
  currentMonth,
  onDateSelect,
  onMonthChange,
}: EventsCalendarProps) {
  const [year, month] = currentMonth.split('-').map(Number);
  const todayStr = new Date().toISOString().split('T')[0];

  // Map date-string → list of categories for that day
  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventSummary['category'][]>();
    for (const ev of events) {
      const dateStr = ev.event_date.split('T')[0];
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(ev.category);
    }
    return map;
  }, [events]);

  // Build calendar grid: days of month + leading/trailing empty cells
  // JS getDay() is 0=Sun..6=Sat; we want 0=Mon..6=Sun
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const leadingEmpties = firstDow === 0 ? 6 : firstDow - 1; // shift to Mon-start
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number | null }> = [
    ...Array.from({ length: leadingEmpties }, () => ({ day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1 })),
  ];

  // Pad trailing cells to complete the last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    for (let i = 0; i < 7 - remainder; i++) cells.push({ day: null });
  }

  function handleDayClick(day: number) {
    const dateStr = toDateString(year, month, day);
    onDateSelect(selectedDate === dateStr ? null : dateStr);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={() => onMonthChange(prevMonth(currentMonth))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-navy transition"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold text-navy text-sm">{formatMonthLabel(currentMonth)}</span>
        <button
          onClick={() => onMonthChange(nextMonth(currentMonth))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-navy transition"
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-center text-[11px] font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, idx) => {
          if (cell.day === null) {
            return <div key={`empty-${idx}`} className="h-12" />;
          }

          const dateStr = toDateString(year, month, cell.day);
          const dots = eventsByDate.get(dateStr) ?? [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(cell.day!)}
              className={[
                'h-12 flex flex-col items-center justify-center gap-0.5 relative transition rounded-lg mx-0.5 my-0.5',
                isSelected
                  ? 'bg-navy text-white'
                  : isToday
                  ? 'ring-2 ring-saffron text-navy font-semibold'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="text-sm leading-none">{cell.day}</span>
              {dots.length > 0 && (
                <div className="flex gap-0.5">
                  {dots.slice(0, 3).map((cat, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : CATEGORY_COLOURS[cat]}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
