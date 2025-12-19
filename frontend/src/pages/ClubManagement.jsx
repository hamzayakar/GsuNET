import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, clubsAPI, roomsAPI, clubJoinRequestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const ClubManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Club management state
  const [managedClubs, setManagedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Club description edit state
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState('');

  // Club events state
  const [clubEvents, setClubEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Club members state
  const [clubMembers, setClubMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const membersPerPage = 10;

  // Event creation state
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [conflictMessage, setConflictMessage] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_datetime: '',
    duration: '120', // Default 2 hours (120 minutes)
    expected_capacity: '',
    max_capacity: '',
    room_id: '',
    room_note: '', // Optional note about the room
    members_only: false,
  });

  // Fetch managed clubs on component mount
  useEffect(() => {
    let isMounted = true; // Flag to prevent double toast in React StrictMode

    const fetchManagedClubs = async () => {
      try {
        const clubs = await clubsAPI.getManagedClubs();

        if (!isMounted) return; // Don't update state if component unmounted

        if (clubs && clubs.length > 0) {
          setManagedClubs(clubs);
          setSelectedClubId(clubs[0].id); // Select first club by default
        } else {
          toast.error(t('noManagedClubs'));
          navigate('/');
        }
      } catch (err) {
        console.error('Failed to load managed clubs:', err);
        if (isMounted) {
          toast.error(t('failedToLoadClubs'));
        }
      }
    };

    fetchManagedClubs();

    return () => {
      isMounted = false; // Cleanup to prevent state updates after unmount
    };
  }, [navigate, t]);

  // Fetch join requests when selected club changes
  useEffect(() => {
    const fetchJoinRequests = async () => {
      if (!selectedClubId) return;

      setLoadingRequests(true);
      try {
        const requests = await clubJoinRequestsAPI.getClubRequests(selectedClubId);
        setJoinRequests(requests);
      } catch (err) {
        console.error('Failed to fetch join requests:', err);
        toast.error(t('failedToLoadJoinRequests'));
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchJoinRequests();
  }, [selectedClubId, t]);

  // Fetch room recommendations when capacity, date, or duration changes
  useEffect(() => {
    const fetchRoomRecommendations = async () => {
      // Reset recommendations and conflicts
      setRecommendedRooms([]);
      setConflicts([]);
      setConflictMessage('');

      // Use max_capacity for recommendations (not expected_capacity)
      // because max_capacity is the actual registration limit
      if (!formData.max_capacity || parseInt(formData.max_capacity) <= 0) {
        return;
      }

      try {
        // If date and duration are provided, use enhanced recommendation (conflict-aware)
        if (formData.event_datetime && formData.duration) {
          const datetime = new Date(formData.event_datetime);
          const eventDate = datetime.toISOString().split('T')[0]; // YYYY-MM-DD
          const eventTime = datetime.toTimeString().slice(0, 5); // HH:MM

          const response = await roomsAPI.recommendEnhanced(
            parseInt(formData.max_capacity),
            eventDate,
            eventTime,
            parseInt(formData.duration)
          );

          // Enhanced response has different structure
          if (response.available_rooms) {
            setRecommendedRooms(response.available_rooms);
            setConflicts(response.conflicts || []);
            setConflictMessage(response.message || '');
          } else {
            // Fallback to basic recommendation if enhanced fails
            const rooms = await roomsAPI.recommend(parseInt(formData.max_capacity));
            setRecommendedRooms(Array.isArray(rooms) ? rooms : []);
          }
        } else {
          // Basic recommendation (capacity only - backward compatible)
          const rooms = await roomsAPI.recommend(parseInt(formData.max_capacity));
          setRecommendedRooms(Array.isArray(rooms) ? rooms : []);
        }
      } catch (err) {
        console.error('Failed to fetch room recommendations:', err);
        setRecommendedRooms([]);
        setConflicts([]);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchRoomRecommendations, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.max_capacity, formData.event_datetime, formData.duration]);

  // Fetch club events when selected club changes
  useEffect(() => {
    const fetchClubEvents = async () => {
      if (!selectedClubId) return;

      setLoadingEvents(true);
      try {
        const events = await eventsAPI.getAll({ club_id: selectedClubId });
        setClubEvents(events);
      } catch (err) {
        console.error('Failed to fetch club events:', err);
        setClubEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchClubEvents();
  }, [selectedClubId]);

  // Fetch club members when selected club changes
  useEffect(() => {
    const fetchClubMembers = async () => {
      if (!selectedClubId) return;

      setLoadingMembers(true);
      setMembersPage(1); // Reset to first page when club changes
      try {
        const members = await clubsAPI.getMembers(selectedClubId);
        setClubMembers(members);
      } catch (err) {
        console.error('Failed to fetch club members:', err);
        setClubMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchClubMembers();
  }, [selectedClubId]);

  // Initialize description when selected club changes
  useEffect(() => {
    if (selectedClubId) {
      const selectedClub = managedClubs.find(club => club.id === selectedClubId);
      setDescription(selectedClub?.description || '');
      setEditingDescription(false);
    }
  }, [selectedClubId, managedClubs]);

  // Handle description edit
  const handleEditDescription = async () => {
    try {
      await clubsAPI.update(selectedClubId, { description });

      // Update local state
      setManagedClubs(managedClubs.map(club =>
        club.id === selectedClubId ? { ...club, description } : club
      ));

      setEditingDescription(false);
      toast.success(t('descriptionUpdated'));
    } catch (err) {
      console.error('Failed to update description:', err);
      toast.error(err.response?.data?.detail || t('failedToUpdateDescription'));
    }
  };

  // Handle member removal
  const handleRemoveMember = async (userId) => {
    if (!window.confirm(t('confirmRemoveMember'))) {
      return;
    }

    try {
      await clubsAPI.removeMember(selectedClubId, userId);

      // Refresh members list
      const updatedMembers = await clubsAPI.getMembers(selectedClubId);
      setClubMembers(updatedMembers);

      // Update member count in managed clubs
      const updatedClubs = await clubsAPI.getManagedClubs();
      setManagedClubs(updatedClubs);

      toast.success(t('memberRemoved'));
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error(err.response?.data?.detail || t('failedToRemoveMember'));
    }
  };

  // Handle join request approval
  const handleApproveRequest = async (requestId) => {
    setProcessingRequestId(requestId);
    try {
      await clubJoinRequestsAPI.review(requestId, 'approved');
      setJoinRequests(joinRequests.filter(req => req.id !== requestId));
      toast.success(t('joinRequestApproved'));
    } catch (err) {
      console.error('Failed to approve request:', err);
      toast.error(err.response?.data?.detail || t('failedToApproveRequest'));
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle join request rejection
  const handleRejectRequest = async (requestId) => {
    const reason = window.prompt(t('enterRejectionReason'));
    if (!reason) return;

    setProcessingRequestId(requestId);
    try {
      await clubJoinRequestsAPI.review(requestId, 'rejected', reason);
      setJoinRequests(joinRequests.filter(req => req.id !== requestId));
      toast.success(t('joinRequestRejected'));
    } catch (err) {
      console.error('Failed to reject request:', err);
      toast.error(err.response?.data?.detail || t('failedToRejectRequest'));
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle event creation
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setLoadingEvent(true);
    setError('');

    // Frontend validation for capacity
    const expectedCap = parseInt(formData.expected_capacity);
    const maxCap = parseInt(formData.max_capacity);

    if (expectedCap > maxCap) {
      setError(t('expectedCapacityExceedsMax') || 'Expected capacity cannot exceed maximum capacity');
      setLoadingEvent(false);
      return;
    }

    try {
      // Get selected room info for location
      const selectedRoom = formData.room_id
        ? recommendedRooms.find((room) => room.id === parseInt(formData.room_id))
        : null;

      // Build location string from room name + optional note
      let locationStr = null;
      if (selectedRoom) {
        locationStr = selectedRoom.name;
        if (formData.room_note?.trim()) {
          locationStr += ` (${formData.room_note.trim()})`;
        }
      }

      // Prepare data for submission
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_datetime: new Date(formData.event_datetime).toISOString(),
        duration: parseInt(formData.duration),
        expected_capacity: expectedCap,
        max_capacity: maxCap,
        club_id: selectedClubId, // Use selected club
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        location: locationStr,
        members_only: formData.members_only,
      };

      await eventsAPI.create(eventData);
      toast.success(t('eventCreatedSuccess'));

      // Reset form
      setFormData({
        title: '',
        description: '',
        event_datetime: '',
        duration: '120',
        expected_capacity: '',
        max_capacity: '',
        room_id: '',
        room_note: '',
        members_only: false,
      });
      setRecommendedRooms([]);
      setConflicts([]);
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(err.response?.data?.detail || t('failedToCreateEvent'));
    } finally {
      setLoadingEvent(false);
    }
  };

  const selectedClub = managedClubs.find(club => club.id === selectedClubId);
  const pendingRequests = joinRequests.filter(req => req.status === 'pending');

  // Members pagination
  const membersIndexOfLast = membersPage * membersPerPage;
  const membersIndexOfFirst = membersIndexOfLast - membersPerPage;
  const paginatedMembers = clubMembers.slice(membersIndexOfFirst, membersIndexOfLast);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('clubManagement')}</h1>
              <p className="mt-2 text-gray-600">{t('manageClubAndEvents')}</p>
            </div>
            <a
              href="#create-event-section"
              className="px-6 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('createNewEvent')}
            </a>
          </div>
        </div>

        {/* Tab Navigation (Multi-Club Support) */}
        {managedClubs.length > 1 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <div className="flex gap-2 overflow-x-auto">
              {managedClubs.map((club) => (
                <button
                  key={club.id}
                  onClick={() => setSelectedClubId(club.id)}
                  className={`px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${
                    selectedClubId === club.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {club.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Club Info Card */}
        {selectedClub && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedClub.name}</h2>

                {/* Description Edit */}
                {editingDescription ? (
                  <div className="mb-3">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={t('enterClubDescription')}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleEditDescription}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={() => {
                          setDescription(selectedClub.description || '');
                          setEditingDescription(false);
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    {selectedClub.description ? (
                      <p className="text-gray-600">{selectedClub.description}</p>
                    ) : (
                      <p className="text-gray-400 italic">{t('noDescription')}</p>
                    )}
                    <button
                      onClick={() => setEditingDescription(true)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      {t('editDescription')}
                    </button>
                  </div>
                )}

                <div className="flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {selectedClub.member_count || 0} {t('members')}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {selectedClub.follower_count || 0} {t('followers')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Requests Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('joinRequests')}</h2>

          {loadingRequests ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noPendingRequests')}</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{request.user.full_name}</h3>
                      <p className="text-sm text-gray-500">{request.user.email}</p>
                      {request.message && (
                        <p className="mt-2 text-gray-700">{request.message}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(request.requested_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={processingRequestId === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('approve')}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processingRequestId === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {t('reject')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Club Members Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('clubMembers')}</h2>

          {loadingMembers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : clubMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noMembersYet')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('email')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('department')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                        <div className="text-sm text-gray-500">{member.student_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer transition-colors"
                        >
                          {t('removeMember')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Members Pagination */}
          {!loadingMembers && clubMembers.length > 0 && (
            <Pagination
              currentPage={membersPage}
              totalItems={clubMembers.length}
              itemsPerPage={membersPerPage}
              onPageChange={setMembersPage}
            />
          )}
        </div>

        {/* Club Events Section */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('clubEvents')}</h2>

          {loadingEvents ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : clubEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t('noEventsYet')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('eventTitle')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('dateAndTime')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('registered')} / {t('maxCapacity')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clubEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        {event.location && (
                          <div className="text-sm text-gray-500">{event.location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(event.event_datetime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(event.event_datetime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          event.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          event.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          event.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {t(event.status.toLowerCase())}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.registration_count || 0} / {event.max_capacity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Event Creation Form */}
        <div id="create-event-section" className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('createNewEvent')}</h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleEventSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('eventTitle')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t('enterEventTitle')}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t('enterEventDescription')}
              />
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="event_datetime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('dateAndTime')} *
              </label>
              <input
                type="datetime-local"
                id="event_datetime"
                name="event_datetime"
                required
                min={new Date().toISOString().slice(0, 16)}
                value={formData.event_datetime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('eventDateMustBeFuture') || 'Event date must be in the future'}
              </p>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                {t('durationMinutes')} *
              </label>
              <select
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="30">30 {t('minutes')}</option>
                <option value="60">1 {t('hour')}</option>
                <option value="90">1.5 {t('hours')}</option>
                <option value="120">2 {t('hours')}</option>
                <option value="150">2.5 {t('hours')}</option>
                <option value="180">3 {t('hours')}</option>
                <option value="240">4 {t('hours')}</option>
                <option value="300">5 {t('hours')}</option>
                <option value="360">6 {t('hours')}</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {t('selectDuration')}
              </p>
            </div>

            {/* Expected Capacity */}
            <div>
              <label htmlFor="expected_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                {t('expectedNumberOfParticipants')} *
              </label>
              <input
                type="number"
                id="expected_capacity"
                name="expected_capacity"
                required
                min="1"
                value={formData.expected_capacity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t('enterExpectedCapacity')}
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('expectedCapacityHelp') || 'Estimated number of participants (for planning)'}
              </p>
            </div>

            {/* Max Capacity */}
            <div>
              <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                {t('maxCapacity')} *
              </label>
              <input
                type="number"
                id="max_capacity"
                name="max_capacity"
                required
                min="1"
                value={formData.max_capacity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t('enterMaxCapacity')}
              />
              <p className="mt-1 text-sm text-gray-500">
                {t('maxCapacityHelp') || 'Maximum registration limit. Room recommendations are based on this number.'}
              </p>
              {formData.expected_capacity && formData.max_capacity && parseInt(formData.expected_capacity) > parseInt(formData.max_capacity) && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ Maximum capacity must be greater than or equal to expected capacity
                </p>
              )}
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start gap-2 mb-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                      {t('scheduleConflictsDetected') || 'Schedule Conflicts Detected'}
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                      {t('conflictWarningMessage') || 'The following rooms have conflicts at the selected time. Available conflict-free rooms are shown below. You may still select a conflicting room if approved by an advisor.'}
                    </p>
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto bg-white/50 rounded p-2">
                  <ul className="text-sm text-yellow-800 space-y-2">
                    {conflicts.map((conflict, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-600 font-bold">•</span>
                        <div className="flex-1">
                          <strong className="text-yellow-900">{conflict.room_name}</strong>
                          <span className="text-yellow-700">: {conflict.conflict_title}</span>
                          <div className="text-xs text-yellow-600 mt-0.5">
                            {conflict.time_range}
                            {conflict.is_recurring && <span className="ml-2 px-1.5 py-0.5 bg-yellow-200 rounded text-yellow-800">{t('weeklyClass') || 'Weekly Class'}</span>}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-yellow-600 mt-2 italic">
                  {t('conflictOverrideNote') || 'Note: Advisors can approve events with schedule conflicts if there\'s a valid reason (e.g., class cancellation).'}
                </p>
              </div>
            )}

            {/* Room Selection (with recommendations) */}
            {recommendedRooms.length > 0 && (
              <div>
                <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('recommendedRooms')}
                  {conflicts.length > 0 && <span className="ml-2 text-green-600 text-xs">✓ Conflict-free</span>}
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">{t('selectRoom')}</option>
                  {recommendedRooms.map((room) => {
                    const maxCap = parseInt(formData.max_capacity) || 0;
                    const isTooLarge = maxCap > 0 && room.capacity > maxCap * 1.25;
                    // Check if event is within 24 hours (last-minute booking exception)
                    const eventDate = formData.event_datetime ? new Date(formData.event_datetime) : null;
                    const hoursUntilEvent = eventDate ? (eventDate - new Date()) / (1000 * 60 * 60) : 999;
                    const isLastMinute = hoursUntilEvent > 0 && hoursUntilEvent <= 24;
                    const isDisabled = isTooLarge && !isLastMinute;

                    return (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={isDisabled}
                        className={isDisabled ? 'text-gray-400' : ''}
                      >
                        {room.name} ({t('capacity')}: {room.capacity})
                        {isTooLarge && !isLastMinute && ` - ${t('roomTooLarge')}`}
                        {isTooLarge && isLastMinute && ` - ${t('roomAvailableSoon')}`}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {t('theseRoomsRecommended')}
                </p>
                {/* Room size warning info */}
                {formData.max_capacity && recommendedRooms.some(r => r.capacity > parseInt(formData.max_capacity) * 1.25) && (
                  <p className="mt-1 text-xs text-amber-600">
                    ℹ️ {t('roomTooLargeInfo')}
                  </p>
                )}
              </div>
            )}

            {/* No available rooms message */}
            {formData.event_datetime && formData.duration && formData.expected_capacity && recommendedRooms.length === 0 && conflicts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  No conflict-free rooms available for the selected time. Please choose a different time or contact an advisor for approval.
                </p>
              </div>
            )}

            {/* Room Note (Optional) */}
            {formData.room_id && (
              <div>
                <label htmlFor="room_note" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('roomNote')}
                </label>
                <input
                  type="text"
                  id="room_note"
                  name="room_note"
                  value={formData.room_note}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={t('enterRoomNote')}
                />
                <p className="mt-1 text-sm text-gray-500">{t('roomNoteHelp')}</p>
              </div>
            )}

            {/* Members Only */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="members_only"
                name="members_only"
                checked={formData.members_only}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="members_only" className="ml-2 block text-sm text-gray-700">
                {t('membersOnly')}
              </label>
            </div>
            {formData.members_only && (
              <p className="text-sm text-gray-500">{t('membersOnlyHelp')}</p>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loadingEvent}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingEvent ? t('creating') : t('createEvent')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClubManagement;
