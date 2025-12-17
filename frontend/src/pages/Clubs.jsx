import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubsAPI } from '../services/api';
import Pagination from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Clubs = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFollowedOnly, setShowFollowedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchClubs();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [showFollowedOnly]);

  const fetchClubs = async () => {
    setLoading(true);
    setError('');

    try {
      const data = showFollowedOnly
        ? await clubsAPI.getMyFollowedClubs()
        : await clubsAPI.getAll();
      setClubs(data);
    } catch (err) {
      setError('Failed to load clubs. Please try again later.');
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('campusClubs')}</h1>
        <p className="mt-2 text-gray-600">
          {t('exploreClubs')}
        </p>

        {/* Filter buttons */}
        {isAuthenticated() && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowFollowedOnly(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !showFollowedOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('allClubs')}
            </button>
            <button
              onClick={() => setShowFollowedOnly(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showFollowedOnly
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('followedClubs')}
            </button>
          </div>
        )}
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
      ) : clubs.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noClubsFound')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('noClubsYet')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((club) => (
                <Link
                  key={club.id}
                  to={`/club/${club.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    {club.logo_url && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={club.logo_url}
                          alt={club.name}
                          className="w-20 h-20 object-cover rounded-full"
                        />
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                      {club.name}
                    </h3>

                    {club.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {club.description}
                      </p>
                    )}

                    <div className="flex justify-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {club.member_count || 0} {t('members')}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                        {club.follower_count || 0} {t('followers')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={clubs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default Clubs;
