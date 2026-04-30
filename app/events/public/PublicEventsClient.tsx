'use client';

import { useState, useMemo, useCallback } from 'react';
import { EventsCalendar, type EventSummary } from '@/components/events/EventsCalendar';
import { EventCard, type EventCardEvent } from '@/components/events/EventCard';

export type PublicEventsClientProps = {
  events: EventCardEvent[];
  currentMonth: string;
};

export function PublicEventsClient({ events: initialEvents, currentMonth: initialMonth }: PublicEventsClientProps) {
  const [events, setEvents] = useState<EventCardEvent[]>(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const calendarSummaries: EventSummary[] = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        slug: e.slug,
        event_date: e.event_date,
        category: e.category as EventSummary['category'],
        title: e.title,
      })),
    [events]
  );

  const visibleEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((e) => e.event_date.split('T')[0] === selectedDate);
  }, [events, selectedDate]);

  const refetch = useCallback(async (month: string) => {
    try {
      const res = await fetch(`/api/events/public?month=${month}`);
      const json = await res.json();
      if (json.ok) setEvents(json.data ?? []);
    } catch {
      // ignore
    }
  }, []);

  async function handleMonthChange(month: string) {
    setCurrentMonth(month);
    setSelectedDate(null);
    await refetch(month);
  }

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Upcoming Bizcelona Events</h1>
          <p className="text-sm text-gray-600 mt-0.5">Barcelona business events for our community.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Calendar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <EventsCalendar
              events={calendarSummaries}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onDateSelect={setSelectedDate}
              onMonthChange={handleMonthChange}
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="mt-2 text-xs text-gray-500 hover:text-navy underline w-full text-center"
              >
                Clear date filter
              </button>
            )}
          </div>

          {/* Event list */}
          <div>
            {selectedDate && (
              <p className="text-sm text-gray-500 mb-3">
                Showing events on{' '}
                <span className="font-medium text-navy">
                  {new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(
                    new Date(selectedDate + 'T00:00:00')
                  )}
                </span>
              </p>
            )}

            {visibleEvents.length === 0 ? (
              <div className="rounded-xl bg-white border border-gray-200 p-10 text-center">
                <p className="text-3xl mb-3">📅</p>
                <h2 className="text-lg font-semibold text-navy">No events this month</h2>
                <p className="text-sm text-gray-600 mt-1">Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleEvents.map((event) => (
                  <EventCard key={event.id} event={event} canEdit={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
