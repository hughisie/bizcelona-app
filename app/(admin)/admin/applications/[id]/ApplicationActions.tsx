'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Application = {
  id: string;
  status: string;
  full_name: string;
  contributor_interest: boolean;
  [key: string]: any;
};

const getWelcomeMessage = (name: string, isContributor: boolean) => {
  const helperMessage = `Dear ${name},

Firstly, thank you for taking the time to apply to join our new community. We enjoyed reading your application and your set of skills and experiences and are delighted to welcome you to the community. Right now we are in the soft launch phase, so congratulations on being one of our original members. This will give you a chance to shape the community as we look to build the best community.

You will shortly be added or receive an invite to the main group where we will be organising a more formal introduction and start sharing our ideas and plans to make this community the best around. Please note, that we are an active community and we want people that will contribute and participate in the discussion and helping others.

We operate a mantra which is "give before you take" so please have this in mind.

You did mention that you would like to be a contributor, and to shape the community - this is appreciated and we will be in touch shortly to see how you might be able to help us to build this community.

In the meantime, please follow our page on LinkedIn :https://www.linkedin.com/company/110331955

See you in the groups!`;

  const nonHelperMessage = `Dear ${name}

Firstly, thank you for taking the time to apply to join our new community. We enjoyed reading your application and your set of skills and experiences and are delighted to welcome you to the community. Right now we are in the soft launch phase, so congratulations on being one of our original members. This will give you a chance to shape the community as we look to build the best community.

You will shortly be added or receive an invite to the main group where we will be organising a more formal introduction and start sharing our ideas and plans to make this community the best around. Please note, that we are an active community and we want people that will contribute and participate in the discussion and helping others.

We operate a mantra which is "give before you take" so please have this in mind.

In the meantime, please follow our page on LinkedIn :https://www.linkedin.com/company/110331955

See you in the groups!`;

  return isContributor ? helperMessage : nonHelperMessage;
};

export default function ApplicationActions({
  application,
  userId,
}: {
  application: Application;
  userId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    const message = getWelcomeMessage(application.full_name, application.contributor_interest);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this application?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          reviewed_by: userId,
          review_notes: notes || null,
        })
        .eq('id', application.id);

      if (updateError) {
        throw updateError;
      }

      // Create/update member record
      const { error: memberError } = await supabase
        .from('members')
        .upsert({
          user_id: application.user_id,
          status: 'active',
          approved_by: userId,
          approved_at: new Date().toISOString(),
          membership_notes: notes || null,
        });

      if (memberError) {
        throw memberError;
      }

      router.push('/admin/applications?status=approved');
      router.refresh();
    } catch (err: any) {
      console.error('Error approving application:', err);
      setError(err.message || 'Failed to approve application');
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this application?')) {
      return;
    }

    if (!notes.trim()) {
      setError('Please provide a reason for rejection in the notes field');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          reviewed_by: userId,
          review_notes: notes,
        })
        .eq('id', application.id);

      if (updateError) {
        throw updateError;
      }

      router.push('/admin/applications?status=rejected');
      router.refresh();
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
      setLoading(false);
    }
  };

  const handleMarkUnderReview = async () => {
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'under_review',
        })
        .eq('id', application.id);

      if (updateError) {
        throw updateError;
      }

      router.refresh();
      setLoading(false);
    } catch (err: any) {
      console.error('Error updating application:', err);
      setError(err.message || 'Failed to update application');
      setLoading(false);
    }
  };

  if (application.status === 'approved') {
    const welcomeMessage = getWelcomeMessage(application.full_name, application.contributor_interest);

    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✓ Application Approved</h3>
          <p className="text-green-700">
            This application has been approved and the user is now an active member.
          </p>
          {application.review_notes && (
            <div className="mt-4">
              <p className="text-sm font-medium text-green-900">Admin Notes:</p>
              <p className="text-sm text-green-800 mt-1">{application.review_notes}</p>
            </div>
          )}
        </div>

        {/* WhatsApp Welcome Message */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-1">WhatsApp Welcome Message</h3>
              <p className="text-sm text-gray-600">
                {application.contributor_interest
                  ? 'Message for contributors (includes contributor paragraph)'
                  : 'Standard welcome message'}
              </p>
            </div>
            <button
              onClick={handleCopyMessage}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-saffron text-navy hover:bg-orange-400'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy Message'}
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
              {welcomeMessage}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (application.status === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">✗ Application Rejected</h3>
        <p className="text-red-700">This application has been rejected.</p>
        {application.review_notes && (
          <div className="mt-4">
            <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
            <p className="text-sm text-red-800 mt-1">{application.review_notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-navy mb-6">Review Actions</h2>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Notes Section */}
      <div className="mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-navy mb-2">
          Admin Notes {application.status === 'submitted' ? '(Optional for approval, required for rejection)' : '(Optional)'}
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent"
          placeholder="Add internal notes about this application..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        {application.status === 'submitted' && (
          <button
            onClick={handleMarkUnderReview}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Mark as Under Review'}
          </button>
        )}

        <button
          onClick={handleApprove}
          disabled={loading}
          className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : '✓ Approve Application'}
        </button>

        <button
          onClick={handleReject}
          disabled={loading}
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : '✗ Reject Application'}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Approving will create an active member account and grant access to member features.
        Rejecting requires a reason in the notes field above.
      </p>
    </div>
  );
}
