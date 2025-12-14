import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventsAPI.getById(id);
        setEvent(data);

        // Check if user is already registered
        if (user) {
          const myRegistrations = await eventsAPI.getMyRegistrations();
          const isAlreadyRegistered = myRegistrations.some(
            (reg) => reg.event_id === parseInt(id)
          );
          setIsRegistered(isAlreadyRegistered);
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      await eventsAPI.register(parseInt(id));
      setIsRegistered(true);
      toast.success('Successfully registered for the event!');
    } catch (err) {
      console.error('Failed to register:', err);
      toast.error(err.response?.data?.detail || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setRegistering(true);
      await eventsAPI.unregister(parseInt(id));
      setIsRegistered(false);
      toast.success('Successfully unregistered from the event');
    } catch (err) {
      console.error('Failed to unregister:', err);
      toast.error(err.response?.data?.detail || 'Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Event not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const canRegister = event.status === 'approved' && !isRegistered;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Event Image */}
          {event.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Content */}
          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <div className="flex items-center gap-3">
                  {getStatusBadge(event.status)}
                  {event.club && (
                    <span className="text-gray-600">
                      by <span className="font-semibold">{event.club.name}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              {/* Date and Time */}
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-gray-400 mr-3 mt-1"
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
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="text-lg text-gray-900">{formatDate(event.event_datetime)}</p>
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-gray-400 mr-3 mt-1"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-lg text-gray-900">{event.location}</p>
                  </div>
                </div>
              )}

              {/* Capacity and Registrations */}
              {event.max_capacity && (
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-gray-400 mr-3 mt-1"
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
                  <div>
                    <p className="text-sm text-gray-500">Capacity & Registrations</p>
                    <p className="text-lg text-gray-900">
                      {event.registration_count || 0} / {event.max_capacity} registered
                      {event.expected_capacity && ` (Expected: ${event.expected_capacity})`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">About this event</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {event.status === 'rejected' && event.rejection_reason && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
                <p className="text-red-700">{event.rejection_reason}</p>
              </div>
            )}

            {/* Registration Button */}
            <div className="flex gap-4">
              {canRegister && (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registering ? 'Registering...' : 'Register for Event'}
                </button>
              )}

              {isRegistered && (
                <button
                  onClick={handleUnregister}
                  disabled={registering}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {registering ? 'Processing...' : 'Unregister'}
                </button>
              )}

              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Back to Events
              </button>
            </div>

            {!user && event.status === 'approved' && (
              <p className="mt-4 text-center text-gray-600">
                Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-red-600 hover:text-red-700 font-semibold underline"
                >
                  log in
                </button>{' '}
                to register for this event
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
