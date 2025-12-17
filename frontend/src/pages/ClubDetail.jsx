import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { clubsAPI, eventsAPI, clubJoinRequestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EventCard from '../components/EventCard';

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinRequest, setJoinRequest] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isManager, setIsManager] = useState(false);

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

      // Check if user is following this club
      if (user) {
        const followedClubs = await clubsAPI.getMyFollowedClubs();
        const isAlreadyFollowing = followedClubs.some(
          (followedClub) => followedClub.id === parseInt(id)
        );
        setIsFollowing(isAlreadyFollowing);

        // Check if user is a member of this club
        const clubMemberIds = clubData.members?.map(m => m.id) || [];
        setIsMember(clubMemberIds.includes(user.id));

        // Check if user is a manager or advisor of this club
        const userIsManager = clubData.manager_id === user.id ||
                              clubData.advisor_id === user.id ||
                              user.role === 'admin';
        setIsManager(userIsManager);

        // Get user's join request status for this club
        const myRequests = await clubJoinRequestsAPI.getMyRequests();
        const existingRequest = myRequests.find(
          req => req.club_id === parseInt(id) && req.status === 'pending'
        );
        setJoinRequest(existingRequest);

        // If user is a manager, get all join requests for this club
        if (userIsManager) {
          const clubRequests = await clubJoinRequestsAPI.getClubRequests(id);
          setJoinRequests(clubRequests.filter(req => req.status === 'pending'));
        }
      }
    } catch (err) {
      setError('Failed to load club details. Please try again later.');
      console.error('Error fetching club:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow clubs');
      return;
    }

    try {
      setFollowLoading(true);
      await clubsAPI.follow(parseInt(id));
      setIsFollowing(true);
      toast.success(`${t('nowFollowing')} ${club.name}!`);
    } catch (err) {
      console.error('Failed to follow club:', err);
      toast.error(err.response?.data?.detail || 'Failed to follow club');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setFollowLoading(true);
      await clubsAPI.unfollow(parseInt(id));
      setIsFollowing(false);
      toast.success(`${t('unfollowed')} ${club.name}`);
    } catch (err) {
      console.error('Failed to unfollow club:', err);
      toast.error(err.response?.data?.detail || 'Failed to unfollow club');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleRequestJoin = async () => {
    try {
      const response = await clubJoinRequestsAPI.create(parseInt(id));
      setJoinRequest(response);
      toast.success(t('joinRequestSent'));
    } catch (err) {
      console.error('Failed to request join:', err);
      toast.error(err.response?.data?.detail || 'Failed to send join request');
    }
  };

  const handleCancelRequest = async () => {
    try {
      await clubJoinRequestsAPI.cancel(joinRequest.id);
      setJoinRequest(null);
      toast.success(t('joinRequestCanceled'));
    } catch (err) {
      console.error('Failed to cancel request:', err);
      toast.error(err.response?.data?.detail || 'Failed to cancel request');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await clubJoinRequestsAPI.review(requestId, 'approved');
      toast.success('Join request approved!');
      fetchClubData(); // Refresh to update member count and requests
    } catch (err) {
      console.error('Failed to approve request:', err);
      toast.error(err.response?.data?.detail || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const reason = prompt('Enter rejection reason (optional):');
      await clubJoinRequestsAPI.review(requestId, 'rejected', reason);
      toast.success('Join request rejected');
      fetchClubData(); // Refresh to update requests
    } catch (err) {
      console.error('Failed to reject request:', err);
      toast.error(err.response?.data?.detail || 'Failed to reject request');
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

        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>

          {user && (
            <div className="flex gap-2">
              {isManager ? (
                <span className="px-6 py-2 rounded-md font-medium bg-purple-100 text-purple-800">
                  {club.manager_id === user.id ? t('clubManager') : club.advisor_id === user.id ? t('advisor') : t('admin')}
                </span>
              ) : isMember ? (
                <span className="px-6 py-2 rounded-md font-medium bg-blue-100 text-blue-800">
                  {t('member')}
                </span>
              ) : joinRequest ? (
                <button
                  onClick={handleCancelRequest}
                  className="px-6 py-2 rounded-md font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                >
                  {t('requestPending')}
                </button>
              ) : (
                <button
                  onClick={handleRequestJoin}
                  className="px-6 py-2 rounded-md font-medium bg-green-600 text-white hover:bg-green-700"
                >
                  {t('requestToJoin')}
                </button>
              )}
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                disabled={followLoading}
                className={`px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {followLoading ? t('loading') : isFollowing ? t('following') : t('follow')}
              </button>
            </div>
          )}
        </div>

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

          <div className="flex gap-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {club.member_count || 0} {t('members')}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {club.follower_count || 0} {t('followers')}
            </div>
          </div>
        </div>
      </div>

      {/* Join Requests Section (for managers only) */}
      {isManager && joinRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pending Join Requests ({joinRequests.length})
          </h2>
          <div className="space-y-4">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{request.user.full_name}</p>
                  <p className="text-sm text-gray-600">{request.user.email}</p>
                  {request.message && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{request.message}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Requested: {new Date(request.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
