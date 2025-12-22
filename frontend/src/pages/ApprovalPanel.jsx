/**
 * Approval Panel - Events & Sponsorships
 * Review6: Enhanced with Sponsorship Approval Tab
 *
 * Admin/Advisor panel for approving/rejecting:
 * - Events (existing)
 * - Sponsorship Requests (NEW - Review6)
 */
import { useState, useEffect } from 'react';
import { eventsAPI, sponsorshipsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ApprovalPanel = () => {
  const { t } = useLanguage();

  // Tab state
  const [activeTab, setActiveTab] = useState('events'); // 'events' or 'sponsorships'

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [eventsProcessingId, setEventsProcessingId] = useState(null);
  const [eventsFilter, setEventsFilter] = useState('pending'); // 'pending' or 'rejected'

  // Sponsorships state
  const [sponsorships, setSponsorships] = useState([]);
  const [sponsorshipsLoading, setSponsorshipsLoading] = useState(false);
  const [sponsorshipsError, setSponsorshipsError] = useState('');
  const [sponsorshipsProcessingId, setSponsorshipsProcessingId] = useState(null);

  // Fetch initial counts on mount
  useEffect(() => {
    fetchEvents();
    fetchSponsorships();
  }, []);

  // Fetch on tab/filter change
  useEffect(() => {
    if (activeTab === 'events') {
      fetchEvents();
    } else if (activeTab === 'sponsorships') {
      fetchSponsorships();
    }
  }, [activeTab, eventsFilter]);

  // ========================================
  // EVENTS FUNCTIONS
  // ========================================

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError('');

    try {
      const data = await eventsAPI.getAll({ status: eventsFilter });
      setEvents(data);
    } catch (err) {
      setEventsError(`Failed to load ${eventsFilter} events. Please try again later.`);
      console.error('Error fetching events:', err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleEventApproval = async (eventId, status, rejectionReason = null) => {
    setEventsProcessingId(eventId);
    setEventsError('');

    try {
      await eventsAPI.approve(eventId, status, rejectionReason);
      if (status === 'approved') {
        toast.success(t('eventApproved'));
      }
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setEventsError(err.response?.data?.detail || 'Failed to process event. Please try again.');
    } finally {
      setEventsProcessingId(null);
    }
  };

  const handleUnreject = async (eventId) => {
    setEventsProcessingId(eventId);
    setEventsError('');

    try {
      await eventsAPI.approve(eventId, 'pending', null);
      setEvents(events.filter((event) => event.id !== eventId));
      toast.success(t('eventUnrejected'));
    } catch (err) {
      setEventsError(err.response?.data?.detail || 'Failed to un-reject event. Please try again.');
      toast.error(err.response?.data?.detail || 'Failed to un-reject event');
    } finally {
      setEventsProcessingId(null);
    }
  };

  // ========================================
  // SPONSORSHIPS FUNCTIONS (NEW - Review6)
  // ========================================

  const fetchSponsorships = async () => {
    setSponsorshipsLoading(true);
    setSponsorshipsError('');

    try {
      const data = await sponsorshipsAPI.getPendingApplications();
      setSponsorships(data || []);
    } catch (err) {
      setSponsorshipsError('Failed to load sponsorship requests. Please try again later.');
      console.error('Error fetching sponsorships:', err);
    } finally {
      setSponsorshipsLoading(false);
    }
  };

  const handleSponsorshipReview = async (requestId, status, rejectionReason = null) => {
    setSponsorshipsProcessingId(requestId);
    setSponsorshipsError('');

    try {
      await sponsorshipsAPI.reviewApplication(requestId, {
        status,
        rejection_reason: rejectionReason
      });

      if (status === 'approved') {
        toast.success(t('sponsorshipApproved') || 'Sponsorship approved! AI matching in progress...');
      } else {
        toast.success(t('sponsorshipRejected') || 'Sponsorship rejected');
      }

      // Remove from list
      setSponsorships(sponsorships.filter((s) => s.id !== requestId));
    } catch (err) {
      setSponsorshipsError(err.response?.data?.detail || 'Failed to process sponsorship. Please try again.');
      toast.error(err.response?.data?.detail || 'Failed to process sponsorship');
    } finally {
      setSponsorshipsProcessingId(null);
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('approvalPanel') || 'Approval Panel'}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('approvalPanelDescription') || 'Review and manage pending requests'}
        </p>

        {/* Tab Navigation (NEW - Review6) */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('events') || 'Events'} ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('sponsorships')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sponsorships'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('sponsorshipsTab') || 'Sponsorships'} ({sponsorships.length})
            </button>
          </nav>
        </div>
      </div>

      {/* ========================================
          EVENTS TAB CONTENT
          ======================================== */}
      {activeTab === 'events' && (
        <>
          {/* Filter Buttons */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setEventsFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                eventsFilter === 'pending'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('pendingEvents')}
            </button>
            <button
              onClick={() => setEventsFilter('rejected')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                eventsFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('rejectedEvents')}
            </button>
          </div>

          {eventsError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
              {eventsError}
            </div>
          )}

          {eventsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {eventsFilter === 'pending' ? t('noPendingEvents') : t('noRejectedEvents')}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {eventsFilter === 'pending' ? t('noEventsPending') : t('noEventsRejected')}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {event.title}
                          </h3>
                          <span
                            className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                              eventsFilter === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {eventsFilter === 'pending' ? t('pending') : t('rejected')}
                          </span>
                        </div>

                        {event.description && (() => {
                          // Parse description to extract conflict info
                          const hasConflictWarning = event.description.includes('⚠️ SCHEDULE CONFLICT') || event.description.includes('⚠️ ROOM SIZE EXCEPTION');

                          if (hasConflictWarning) {
                            // Split description into main content and conflict note
                            const parts = event.description.split(/\n\n⚠️/);
                            const mainDescription = parts[0];
                            const conflictInfo = parts.length > 1 ? '⚠️' + parts[1] : '';

                            return (
                              <>
                                {mainDescription && <p className="text-gray-600 mb-4">{mainDescription}</p>}

                                {conflictInfo && (
                                  <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <div className="flex items-start">
                                      <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                      </div>
                                      <div className="ml-3 flex-1">
                                        <h4 className="text-sm font-bold text-yellow-800 mb-1">
                                          {conflictInfo.includes('SCHEDULE CONFLICT') ? 'Schedule Conflict - Requires Review' : 'Room Size Exception'}
                                        </h4>
                                        <pre className="text-xs text-yellow-700 whitespace-pre-wrap font-mono">
                                          {conflictInfo}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          }

                          return <p className="text-gray-600 mb-4">{event.description}</p>;
                        })()}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                          {event.club && (
                            <div className="flex items-center">
                              <span className="font-medium">{t('club')}:</span>
                              <span className="ml-1">{event.club.name}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <span className="font-medium">{t('date')}:</span>
                            <span className="ml-1">{formatDate(event.event_datetime)}</span>
                          </div>
                          {event.room && (
                            <div className="flex items-center">
                              <span className="font-medium">{t('room')}:</span>
                              <span className="ml-1">
                                {event.room.name} ({t('capacity')}: {event.room.capacity})
                              </span>
                            </div>
                          )}
                          {event.expected_attendees && (
                            <div className="flex items-center">
                              <span className="font-medium">{t('expectedAttendees')}:</span>
                              <span className="ml-1">{event.expected_attendees}</span>
                            </div>
                          )}
                        </div>

                        {eventsFilter === 'rejected' && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <h4 className="text-sm font-semibold text-red-900">
                              {t('rejectionInfo')}
                            </h4>
                            <p className="text-sm text-red-700 mt-1">
                              {event.rejection_reason || t('noReasonProvided')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                      {eventsFilter === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleEventApproval(event.id, 'approved')}
                            disabled={eventsProcessingId === event.id}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {eventsProcessingId === event.id ? t('processing') : t('approve')}
                          </button>

                          <button
                            onClick={() => {
                              const reason = prompt(t('enterRejectionReason'));
                              if (reason !== null) {
                                handleEventApproval(event.id, 'rejected', reason || null);
                                toast.success('Event rejected');
                              }
                            }}
                            disabled={eventsProcessingId === event.id}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {t('reject')}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUnreject(event.id)}
                          disabled={eventsProcessingId === event.id}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {eventsProcessingId === event.id ? t('processing') : t('returnToPending')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================
          SPONSORSHIPS TAB CONTENT (NEW - Review6)
          ======================================== */}
      {activeTab === 'sponsorships' && (
        <>
          {sponsorshipsError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
              {sponsorshipsError}
            </div>
          )}

          {sponsorshipsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : sponsorships.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t('noPendingSponsorships') || 'No Pending Sponsorships'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('allSponsorshipsReviewed') || 'All sponsorship requests have been reviewed'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sponsorships.map((sponsorship) => (
                <div
                  key={sponsorship.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {sponsorship.company_name}
                      </h3>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {t('pending') || 'Pending'}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Vision */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          {t('companyVision') || 'Vision/Mission'}
                        </h4>
                        <p className="text-sm text-gray-600">{sponsorship.vision}</p>
                      </div>

                      {/* Goals */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">
                          {t('sponsorshipGoals') || 'Sponsorship Goals'}
                        </h4>
                        <p className="text-sm text-gray-600">{sponsorship.sponsorship_goals}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{t('type') || 'Type'}:</span>
                          <span className="ml-2 text-gray-600 capitalize">{sponsorship.sponsorship_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('budget') || 'Budget'}:</span>
                          <span className="ml-2 text-gray-600">{sponsorship.budget_range || '-'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{t('contact') || 'Contact'}:</span>
                          <span className="ml-2 text-gray-600 truncate">{sponsorship.contact_info}</span>
                        </div>
                      </div>

                      {/* Submitted Date */}
                      <div className="text-xs text-gray-500">
                        {t('submitted') || 'Submitted'}: {formatDate(sponsorship.created_at)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleSponsorshipReview(sponsorship.id, 'approved')}
                        disabled={sponsorshipsProcessingId === sponsorship.id}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {sponsorshipsProcessingId === sponsorship.id ? (
                          <>{t('processing') || 'Processing...'}</>
                        ) : (
                          <>{t('approveAndMatch') || 'Approve & Match with AI'}</>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt(t('enterRejectionReason') || 'Enter rejection reason (optional):');
                          if (reason !== null) {
                            handleSponsorshipReview(sponsorship.id, 'rejected', reason || null);
                          }
                        }}
                        disabled={sponsorshipsProcessingId === sponsorship.id}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('reject') || 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovalPanel;
