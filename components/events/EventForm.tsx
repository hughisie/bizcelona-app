'use client';

import { useState } from 'react';

export type EventFormData = {
  title: string;
  description: string;
  event_date: string; // datetime-local value
  end_date: string;
  location: string;
  cover_image_url: string;
  external_url: string;
  platform: 'luma' | 'eventbrite' | 'meetup' | 'other';
  category: 'networking' | 'workshop' | 'social' | 'other';
  is_published: boolean;
};

export type EventFormProps = {
  initialValues?: Partial<EventFormData>;
  eventId?: string; // if editing
  onSuccess: () => void;
  onCancel: () => void;
};

const EMPTY: EventFormData = {
  title: '',
  description: '',
  event_date: '',
  end_date: '',
  location: '',
  cover_image_url: '',
  external_url: '',
  platform: 'luma',
  category: 'networking',
  is_published: true,
};

/** Convert ISO timestamp to datetime-local input value */
function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  // datetime-local expects "YYYY-MM-DDTHH:MM"
  return iso.slice(0, 16);
}

export function EventForm({ initialValues, eventId, onSuccess, onCancel }: EventFormProps) {
  const [form, setForm] = useState<EventFormData>({
    ...EMPTY,
    ...initialValues,
    event_date: isoToDatetimeLocal(initialValues?.event_date),
    end_date: isoToDatetimeLocal(initialValues?.end_date),
  });

  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFetch() {
    if (!fetchUrl.trim()) return;
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/events/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fetchUrl.trim() }),
      });
      const json = await res.json();
      if (!json.ok) {
        setFetchError(json.error ?? 'Failed to fetch event details.');
        return;
      }
      const d = json.data ?? {};
      setForm((prev) => ({
        ...prev,
        title: d.title ?? prev.title,
        description: d.description ?? prev.description,
        event_date: isoToDatetimeLocal(d.event_date) || prev.event_date,
        end_date: isoToDatetimeLocal(d.end_date) || prev.end_date,
        location: d.location ?? prev.location,
        cover_image_url: d.cover_image_url ?? prev.cover_image_url,
        platform: d.platform ?? prev.platform,
        external_url: fetchUrl.trim(),
      }));
    } catch {
      setFetchError('Something went wrong fetching event details.');
    } finally {
      setFetchLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);

    // Convert datetime-local back to ISO
    const payload = {
      ...form,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : form.event_date,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      description: form.description || null,
      end_date_val: form.end_date || null,
      location: form.location || null,
      cover_image_url: form.cover_image_url || null,
    };

    const url = eventId ? `/api/events/${eventId}` : '/api/events';
    const method = eventId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) {
        setSubmitError(json.error ?? 'Failed to save event.');
        return;
      }
      onSuccess();
    } catch {
      setSubmitError('Something went wrong saving the event.');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* URL fetch */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Import from URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={fetchUrl}
            onChange={(e) => setFetchUrl(e.target.value)}
            placeholder="https://lu.ma/... or eventbrite.com/..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={fetchLoading || !fetchUrl.trim()}
            className="px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 disabled:opacity-50 transition flex items-center gap-2"
          >
            {fetchLoading && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {fetchLoading ? 'Fetching…' : 'Fetch details'}
          </button>
        </div>
        {fetchError && <p className="mt-1.5 text-xs text-red-600">{fetchError}</p>}
      </div>

      <hr className="border-gray-100" />

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron resize-none"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">
            Start date &amp; time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => set('event_date', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">End date &amp; time</label>
          <input
            type="datetime-local"
            value={form.end_date}
            onChange={(e) => set('end_date', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          placeholder="e.g. Betahaus, Barcelona"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
        />
      </div>

      {/* Cover image URL */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">Cover image URL</label>
        <input
          type="url"
          value={form.cover_image_url}
          onChange={(e) => set('cover_image_url', e.target.value)}
          placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
        />
      </div>

      {/* External URL */}
      <div>
        <label className="block text-sm font-medium text-navy mb-1">
          RSVP / event URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          value={form.external_url}
          onChange={(e) => set('external_url', e.target.value)}
          required
          placeholder="https://lu.ma/..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron"
        />
      </div>

      {/* Platform + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Platform</label>
          <select
            value={form.platform}
            onChange={(e) => set('platform', e.target.value as EventFormData['platform'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white"
          >
            <option value="luma">Luma</option>
            <option value="eventbrite">Eventbrite</option>
            <option value="meetup">Meetup</option>
            <option value="other">Other / Website</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value as EventFormData['category'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron bg-white"
          >
            <option value="networking">Networking</option>
            <option value="workshop">Workshop</option>
            <option value="social">Social</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.is_published}
          onClick={() => set('is_published', !form.is_published)}
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition',
            form.is_published ? 'bg-navy' : 'bg-gray-300',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition',
              form.is_published ? 'translate-x-6' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
        <span className="text-sm text-gray-700">
          {form.is_published ? 'Published — visible to all members' : 'Draft — only visible to you'}
        </span>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitLoading}
          className="px-5 py-2.5 bg-saffron text-navy font-semibold text-sm rounded-lg hover:bg-saffron/90 disabled:opacity-50 transition flex items-center gap-2"
        >
          {submitLoading && (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {submitLoading ? 'Saving…' : eventId ? 'Save changes' : 'Publish event'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitLoading}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
