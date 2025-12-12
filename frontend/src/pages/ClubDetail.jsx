import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clubsAPI, eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';

const ClubDetail = () => {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClubData();
  }, [id]);

  const fetchClubData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch club details
      const clubData = await clubsAPI.getById(id);
      setClub(clubData);

      // Fetch club events
      const eventsData = await eventsAPI.getAll({ club_id: id });
      setEvents(eventsData);
    } catch (err) {
      setError('Failed to load club details. Please try again later.');
      console.error('Error fetching club:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error || 'Club not found'}
        </div>
        <Link to="/" className="mt-4 inline-block text-primary hover:text-primary-dark">
          ← Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Club Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {club.logo_url && (
          <div className="mb-4">
            <img
              src={club.logo_url}
              alt={club.name}
              className="w-24 h-24 object-cover rounded-full"
            />
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>

        {club.description && (
          <p className="text-gray-600 mb-4">{club.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {club.email && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href={`mailto:${club.email}`} className="hover:text-primary">
                {club.email}
              </a>
            </div>
          )}

          {club.website && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary"
              >
                Website
              </a>
            </div>
          )}

          {club.member_count !== undefined && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {club.member_count} members
            </div>
          )}
        </div>
      </div>

      {/* Club Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Events</h2>

        {events.length === 0 ? (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This club hasn't organized any events yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
