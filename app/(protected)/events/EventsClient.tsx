'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { EventsCalendar, type EventSummary } from '@/components/events/EventsCalendar';
import { EventCard, type EventCardEvent } from '@/components/events/EventCard';
import { EventForm } from '@/components/events/EventForm';

export type EventsClientProps = {
  events: EventCardEvent[];
  currentMonth: string; // 'YYYY-MM'
  isOrganiser: boolean;
  isAdmin: boolean;
  currentUserId: string | null;
};

export function EventsClient({
  events: initialEvents,
  currentMonth: initialMonth,
  isOrganiser,
  isAdmin,
  currentUserId,
}: EventsClientProps) {
  const [events, setEvents] = useState<EventCardEvent[]>(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventCardEvent | null>(null);

  // Keep a ref so async callbacks always see the latest month value
  const currentMonthRef = useRef(currentMonth);
  useEffect(() => { currentMonthRef.current = currentMonth; }, [currentMonth]);

  // Close modal on Escape
  useEffect(() => {
    if (!showForm) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowForm(false);
        setEditingEvent(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showForm]);

  const canManage = isOrganiser || isAdmin;

  // Summary list for calendar dots
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

  // Filter events by selected date
  const visibleEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((e) => e.event_date.split('T')[0] === selectedDate);
  }, [events, selectedDate]);

  // Refetch events for the current month
  const refetch = useCallback(async (month: string) => {
    try {
      const res = await fetch(`/api/events?month=${month}${canManage ? '&includeUnpublished=true' : ''}`);
      const json = await res.json();
      if (json.ok) setEvents(json.data ?? []);
    } catch {
      // silently ignore refetch errors — user still sees stale data
    }
  }, [canManage]);

  async function handleMonthChange(month: string) {
    setCurrentMonth(month);
    setSelectedDate(null);
    await refetch(month);
  }

  async function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) await refetch(currentMonthRef.current);
    } catch {
      await refetch(currentMonthRef.current);
    }
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingEvent(null);
    refetch(currentMonthRef.current);
  }

  function handleEditClick(event: EventCardEvent) {
    setEditingEvent(event);
    setShowForm(true);
  }

  function handleAddClick() {
    setEditingEvent(null);
    setShowForm(true);
  }

  const canEditEvent = (event: EventCardEvent) =>
    isAdmin || (isOrganiser && event.organiser_id === currentUserId);

  return (
    <div className="min-h-screen bg-off-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-navy">Events</h1>
            <p className="text-sm text-gray-600 mt-0.5">Barcelona business events worth your time.</p>
          </div>
          {canManage && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-saffron text-navy font-semibold text-sm rounded-lg hover:bg-saffron/90 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add event
            </button>
          )}
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
                {canManage ? (
                  <>
                    <p className="text-3xl mb-3">📅</p>
                    <h2 className="text-lg font-semibold text-navy">No events yet</h2>
                    <p className="text-sm text-gray-600 mt-1">Add the first one to get the calendar started.</p>
                    <button
                      onClick={handleAddClick}
                      className="mt-4 px-5 py-2.5 bg-saffron text-navy font-semibold text-sm rounded-lg hover:bg-saffron/90 transition"
                    >
                      Add event
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-3xl mb-3">📅</p>
                    <h2 className="text-lg font-semibold text-navy">No events this month</h2>
                    <p className="text-sm text-gray-600 mt-1">Check back soon!</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    canEdit={canEditEvent(event)}
                    onDelete={canEditEvent(event) ? handleDelete : undefined}
                    onEdit={canEditEvent(event) ? handleEditClick : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal overlay for EventForm */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForm(false);
              setEditingEvent(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-navy">
                {editingEvent ? 'Edit event' : 'Add event'}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditingEvent(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <EventForm
              initialValues={
                editingEvent
                  ? {
                      title: editingEvent.title,
                      description: editingEvent.description ?? '',
                      event_date: editingEvent.event_date,
                      end_date: editingEvent.end_date ?? '',
                      location: editingEvent.location ?? '',
                      cover_image_url: editingEvent.cover_image_url ?? '',
                      external_url: editingEvent.external_url,
                      platform: editingEvent.platform as any,
                      category: editingEvent.category as any,
                      is_published: editingEvent.is_published,
                    }
                  : undefined
              }
              eventId={editingEvent?.id}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingEvent(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
