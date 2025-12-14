import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import EventCard from '../components/EventCard';

const MyEvents = () => {
  const { t } = useLanguage();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await eventsAPI.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError('Failed to load your registered events. Please try again later.');
      console.error('Error fetching registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('myEvents')}</h1>
        <p className="mt-2 text-gray-600">
          {t('viewEventsYouRegistered')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : registrations.length === 0 ? (
        <div className="text-center py-12">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noRegistrationsYet')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('startByBrowsingEvents')}</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {t('browseEvents')}
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            {t('youAreRegisteredFor')} <span className="font-semibold">{registrations.length}</span> {registrations.length === 1 ? t('event') : t('events')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((registration) => (
              <EventCard key={registration.event.id} event={registration.event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;
