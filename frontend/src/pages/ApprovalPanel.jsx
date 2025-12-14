import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';

const ApprovalPanel = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending'); // 'pending' or 'rejected'

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await eventsAPI.getAll({ status: filter });
      setEvents(data);
    } catch (err) {
      setError(`Failed to load ${filter} events. Please try again later.`);
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (eventId, status, rejectionReason = null) => {
    setProcessingId(eventId);
    setError('');

    try {
      await eventsAPI.approve(eventId, status, rejectionReason);
      // Remove the event from the list after approval/rejection/un-rejection
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process event. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnreject = async (eventId) => {
    setProcessingId(eventId);
    setError('');

    try {
      // Change status back to pending
      await eventsAPI.approve(eventId, 'pending', null);
      // Remove from rejected list
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to un-reject event. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Event Approval Panel</h1>
        <p className="mt-2 text-gray-600">
          Review and manage event approval requests
        </p>

        {/* Filter Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Events
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected Events
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
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
            {filter === 'pending' ? 'No pending events' : 'No rejected events'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'pending'
              ? 'All events have been reviewed.'
              : 'No events have been rejected.'}
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
                      <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full ${
                        filter === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {filter === 'pending' ? 'Pending' : 'Rejected'}
                      </span>
                    </div>

                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                      {event.club && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <span className="font-medium">Club:</span>
                          <span className="ml-1">{event.club.name}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="font-medium">Date:</span>
                        <span className="ml-1">{formatDate(event.event_datetime)}</span>
                      </div>

                      {event.room && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                          <span className="font-medium">Room:</span>
                          <span className="ml-1">
                            {event.room.name} (Capacity: {event.room.capacity})
                          </span>
                        </div>
                      )}

                      {event.expected_attendees && (
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                          <span className="font-medium">Expected Attendees:</span>
                          <span className="ml-1">{event.expected_attendees}</span>
                        </div>
                      )}
                    </div>

                    {/* Rejection Information (for rejected events) */}
                    {filter === 'rejected' && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-start gap-2 mb-2">
                          <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-red-900">Rejection Reason:</h4>
                            <p className="text-sm text-red-700 mt-1">
                              {event.rejection_reason || 'No reason provided'}
                            </p>
                          </div>
                        </div>
                        {event.updated_at && (
                          <p className="text-xs text-red-600 mt-2">
                            <span className="font-medium">Rejected on:</span> {formatDate(event.updated_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-200">
                  {filter === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApproval(event.id, 'approved')}
                        disabled={processingId === event.id}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processingId === event.id ? 'Processing...' : 'Approve'}
                      </button>

                      <button
                        onClick={() => {
                          const reason = prompt(
                            'Please provide a reason for rejection (optional):'
                          );
                          if (reason !== null) {
                            handleApproval(event.id, 'rejected', reason || null);
                          }
                        }}
                        disabled={processingId === event.id}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleUnreject(event.id)}
                      disabled={processingId === event.id}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingId === event.id ? 'Processing...' : 'Un-reject (Return to Pending)'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalPanel;
