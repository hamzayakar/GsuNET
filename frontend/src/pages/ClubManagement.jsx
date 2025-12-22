/**
 * Club Management Page
 * Review6: Enhanced with Sponsorship Features (TWO-WAY MATCHING)
 *
 * Features:
 * - Club Info Edit (with sponsorship needs/budget - NEW)
 * - Event Creation
 * - Join Requests Management
 * - Members Management
 * - Sponsorship Matches (NEW - Review6)
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, clubsAPI, roomsAPI, clubJoinRequestsAPI, sponsorshipsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const ClubManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Active tab state (NEW - Review6: Added sponsorships tab)
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'events', 'requests', 'members', 'sponsorships'

  // Club management state
  const [managedClubs, setManagedClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);

  // Club info edit state (ENHANCED - Review6: Added sponsorship fields)
  const [editingInfo, setEditingInfo] = useState(false);
  const [clubInfo, setClubInfo] = useState({
    description: '',
    sponsorship_needs: '', // NEW - Review6
    sponsorship_budget_expectation: '' // NEW - Review6
  });

  // Join requests state
  const [joinRequests, setJoinRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // Members state
  const [clubMembers, setClubMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersPage, setMembersPage] = useState(1);
  const membersPerPage = 10;

  // Event creation state
  const [formData, setFormData] = useState({
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
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [conflictedRooms, setConflictedRooms] = useState([]);
  const [disabledRooms, setDisabledRooms] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [hoursUntilEvent, setHoursUntilEvent] = useState(null);
  const [roomRecommendationMessage, setRoomRecommendationMessage] = useState('');
  const [loadingEvent, setLoadingEvent] = useState(false);

  // Sponsorship matches state (NEW - Review6)
  const [sponsorshipMatches, setSponsorshipMatches] = useState([]);
  const [loadingSponsorships, setLoadingSponsorships] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Fetch managed clubs on mount
  useEffect(() => {
    fetchManagedClubs();
  }, []);

  // Fetch data when selected club changes
  useEffect(() => {
    if (selectedClubId) {
      const club = managedClubs.find(c => c.id === selectedClubId);
      setSelectedClub(club);
      setClubInfo({
        description: club?.description || '',
        sponsorship_needs: club?.sponsorship_needs || '',
        sponsorship_budget_expectation: club?.sponsorship_budget_expectation || ''
      });

      // Always fetch these for counts
      fetchJoinRequests();
      fetchClubMembers();
      fetchSponsorshipMatches();
    }
  }, [selectedClubId, managedClubs]);

  // Fetch room recommendations when capacity changes
  useEffect(() => {
    if (formData.max_capacity && parseInt(formData.max_capacity) > 0) {
      fetchRoomRecommendations();
    } else {
      setRecommendedRooms([]);
    }
  }, [formData.max_capacity, formData.event_datetime, formData.duration]);

  // ===========================================
  // DATA FETCHING FUNCTIONS
  // ===========================================

  const fetchManagedClubs = async () => {
    try {
      const clubs = await clubsAPI.getManagedClubs();
      if (clubs && clubs.length > 0) {
        setManagedClubs(clubs);
        setSelectedClubId(clubs[0].id);
      } else {
        toast.error(t('noManagedClubs') || 'No managed clubs found');
        navigate('/');
      }
    } catch (err) {
      console.error('Failed to load managed clubs:', err);
      toast.error(t('failedToLoadClubs') || 'Failed to load clubs');
    }
  };

  const fetchJoinRequests = async () => {
    if (!selectedClubId) return;
    setLoadingRequests(true);
    try {
      const requests = await clubJoinRequestsAPI.getClubRequests(selectedClubId);
      setJoinRequests(requests.filter(req => req.status === 'pending'));
    } catch (err) {
      console.error('Failed to fetch join requests:', err);
      toast.error(t('failedToLoadJoinRequests') || 'Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchClubMembers = async () => {
    if (!selectedClubId) return;
    setLoadingMembers(true);
    try {
      const members = await clubsAPI.getMembers(selectedClubId);
      setClubMembers(members || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
      toast.error(t('failedToLoadMembers') || 'Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchRoomRecommendations = async () => {
    try {
      // Use enhanced mode if date/time/duration available
      if (formData.event_datetime && formData.duration && formData.max_capacity) {
        const eventDate = formData.event_datetime.split('T')[0];
        const startTime = formData.event_datetime.split('T')[1] || '00:00';
        const response = await roomsAPI.recommendEnhanced(
          parseInt(formData.max_capacity),
          eventDate,
          startTime,
          parseInt(formData.duration),
          parseInt(formData.max_capacity) // Pass max_capacity for 24-hour rule
        );

        // Handle enhanced response with conflicts and disabled rooms
        if (response.available_rooms !== undefined) {
          setRecommendedRooms(response.available_rooms || []);
          setConflictedRooms(response.conflicted_rooms || []);
          setDisabledRooms(response.disabled_rooms || []);
          setConflicts(response.conflicts || []);
          setHasConflicts(response.has_conflicts || false);
          setHoursUntilEvent(response.hours_until_event);
          setRoomRecommendationMessage(response.message || '');
        } else {
          // Basic response (array of rooms)
          setRecommendedRooms(response || []);
          setConflictedRooms([]);
          setDisabledRooms([]);
          setConflicts([]);
          setHasConflicts(false);
          setHoursUntilEvent(null);
          setRoomRecommendationMessage('');
        }
      } else if (formData.max_capacity) {
        // Basic mode - only capacity
        const rooms = await roomsAPI.recommend(parseInt(formData.max_capacity));
        setRecommendedRooms(Array.isArray(rooms) ? rooms : []);
        setConflictedRooms([]);
        setDisabledRooms([]);
        setConflicts([]);
        setHasConflicts(false);
        setHoursUntilEvent(null);
        setRoomRecommendationMessage('');
      } else {
        // Clear all if no capacity set
        setRecommendedRooms([]);
        setConflictedRooms([]);
        setDisabledRooms([]);
        setConflicts([]);
        setHasConflicts(false);
        setHoursUntilEvent(null);
        setRoomRecommendationMessage('');
      }
    } catch (err) {
      console.error('Failed to fetch room recommendations:', err);
      toast.error(t('failed_to_fetch_rooms') || 'Failed to fetch room recommendations');
    }
  };

  // NEW - Review6: Fetch sponsorship matches
  const fetchSponsorshipMatches = async () => {
    setLoadingSponsorships(true);
    try {
      const matches = await sponsorshipsAPI.getMyClubMatches();
      setSponsorshipMatches(matches || []);
    } catch (err) {
      console.error('Failed to fetch sponsorship matches:', err);
      toast.error(t('failed_to_load_matches') || 'Failed to load sponsorship matches');
    } finally {
      setLoadingSponsorships(false);
    }
  };

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  const handleClubInfoSave = async () => {
    try {
      await clubsAPI.update(selectedClubId, clubInfo);
      toast.success(t('club_info_updated') || 'Club information updated successfully!');
      setEditingInfo(false);
      fetchManagedClubs(); // Refresh clubs
    } catch (err) {
      console.error('Failed to update club info:', err);
      toast.error(err.response?.data?.detail || t('failed_to_update_club') || 'Failed to update club');
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setLoadingEvent(true);

    // Validate room selection (can be selected via dropdown OR button)
    if (!formData.room_id || formData.room_id === '') {
      toast.error(t('selectRoom') || 'Please select a room');
      setLoadingEvent(false);
      return;
    }

    // Check if selected room has conflicts and prepare conflict info for admin/advisor
    const selectedRoomId = parseInt(formData.room_id);
    const hasConflict = conflictedRooms.some(room => room.id === selectedRoomId);
    const isDisabledRoom = disabledRooms.some(room => room.id === selectedRoomId);

    let conflictNote = '';
    if (hasConflict) {
      const roomConflicts = conflicts.filter(c => c.room_id === selectedRoomId);
      conflictNote = '\n\n⚠️ SCHEDULE CONFLICT - Manager Override:\n';
      roomConflicts.forEach(conflict => {
        conflictNote += `• ${conflict.conflict_type}: ${conflict.conflict_title} (${conflict.time_range})`;
        if (conflict.is_recurring) conflictNote += ' - Weekly';
        conflictNote += '\n';
      });
      conflictNote += 'Manager has chosen to proceed despite conflict. Advisor approval required.';
    } else if (isDisabledRoom) {
      const disabledRoom = disabledRooms.find(room => room.id === selectedRoomId);
      conflictNote = `\n\n⚠️ ROOM SIZE EXCEPTION:\n${disabledRoom.disable_reason}`;
      if (hoursUntilEvent !== null && hoursUntilEvent < 24) {
        conflictNote += `\nLast-minute booking exception applied (${Math.round(hoursUntilEvent)} hours until event).`;
      }
    }

    // Append conflict note to description
    const finalDescription = formData.description + conflictNote;

    try {
      await eventsAPI.create({
        ...formData,
        description: finalDescription,
        club_id: selectedClubId,
        expected_capacity: parseInt(formData.expected_capacity),
        max_capacity: parseInt(formData.max_capacity),
        room_id: selectedRoomId,
        duration: parseInt(formData.duration)
      });

      toast.success(t('eventCreated') || 'Event created successfully!');

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
    } catch (err) {
      console.error('Failed to create event:', err);
      toast.error(err.response?.data?.detail || t('failedToCreateEvent') || 'Failed to create event');
    } finally {
      setLoadingEvent(false);
    }
  };

  const handleJoinRequestReview = async (requestId, status, rejectionReason = null) => {
    setProcessingRequestId(requestId);
    try {
      await clubJoinRequestsAPI.review(requestId, status, rejectionReason);
      toast.success(status === 'approved' ? t('request_approved') || 'Request approved' : t('request_rejected') || 'Request rejected');
      fetchJoinRequests();
    } catch (err) {
      console.error('Failed to review request:', err);
      toast.error(err.response?.data?.detail || t('failed_to_review') || 'Failed to review request');
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm(t('confirm_remove_member') || 'Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await clubsAPI.removeMember(selectedClubId, userId);
      toast.success(t('member_removed') || 'Member removed successfully');
      fetchClubMembers();
    } catch (err) {
      console.error('Failed to remove member:', err);
      toast.error(err.response?.data?.detail || t('failed_to_remove_member') || 'Failed to remove member');
    }
  };

  // NEW - Review6: View match details
  const handleViewMatchDetails = async (match) => {
    try {
      const details = await sponsorshipsAPI.getDetails(match.sponsorship_request_id);
      setSelectedMatch({ ...match, details });
      setShowMatchModal(true);
    } catch (err) {
      console.error('Failed to load match details:', err);
      toast.error(t('failed_to_load_details') || 'Failed to load details');
    }
  };

  // ===========================================
  // RENDER HELPERS
  // ===========================================

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRankBadge = (rank) => {
    const badges = {
      1: 'bg-yellow-100 text-yellow-800',
      2: 'bg-gray-100 text-gray-800',
      3: 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[rank] || 'bg-blue-100 text-blue-800'}`}>
        Rank {rank}
      </span>
    );
  };

  // ===========================================
  // RENDER
  // ===========================================

  if (managedClubs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('clubManagement') || 'Club Management'}
        </h1>

        {/* Club Selector */}
        {managedClubs.length > 1 && (
          <select
            value={selectedClubId || ''}
            onChange={(e) => setSelectedClubId(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            {managedClubs.map(club => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tab Navigation (ENHANCED - Review6: Added Sponsorships tab) */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('club_info') || 'Club Info'}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'events'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('createEvent') || 'Create Event'}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('joinRequests') || 'Join Requests'} ({joinRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('membersTab') || 'Members'} ({clubMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('sponsorships')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'sponsorships'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('sponsorshipsTab') || 'Sponsorships'} ({sponsorshipMatches.length})
          </button>
        </nav>
      </div>

      {/* TAB CONTENT */}

      {/* ===== CLUB INFO TAB (ENHANCED - Review6) ===== */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {selectedClub?.name}
            </h2>
            {!editingInfo ? (
              <button
                onClick={() => setEditingInfo(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('edit') || 'Edit'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleClubInfoSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {t('save') || 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingInfo(false);
                    setClubInfo({
                      description: selectedClub?.description || '',
                      sponsorship_needs: selectedClub?.sponsorship_needs || '',
                      sponsorship_budget_expectation: selectedClub?.sponsorship_budget_expectation || ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description') || 'Description'}
              </label>
              {editingInfo ? (
                <textarea
                  value={clubInfo.description}
                  onChange={(e) => setClubInfo({ ...clubInfo, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              ) : (
                <p className="text-gray-600">{clubInfo.description || t('no_description') || 'No description'}</p>
              )}
            </div>

            {/* Sponsorship Needs (NEW - Review6: TWO-WAY MATCHING) */}
            <div className="border-t pt-6 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('sponsorship_requirements') || 'Sponsorship Requirements'} <span className="text-sm font-normal text-red-600">({t('two_way_matching') || 'TWO-WAY MATCHING'})</span>
              </h3>

              <div className="space-y-4">
                {/* Sponsorship Needs */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('sponsorship_needs') || 'What does your club need?'}
                  </label>
                  {editingInfo ? (
                    <textarea
                      value={clubInfo.sponsorship_needs}
                      onChange={(e) => setClubInfo({ ...clubInfo, sponsorship_needs: e.target.value })}
                      placeholder={t('sponsorship_needs_placeholder') || 'e.g., Hackathon sponsorship, workshop materials, speaker fees...'}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-600">{clubInfo.sponsorship_needs || t('not_specified') || 'Not specified'}</p>
                  )}
                </div>

                {/* Budget Expectation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('budget_expectation') || 'Budget Expectation'}
                  </label>
                  {editingInfo ? (
                    <input
                      type="text"
                      value={clubInfo.sponsorship_budget_expectation}
                      onChange={(e) => setClubInfo({ ...clubInfo, sponsorship_budget_expectation: e.target.value })}
                      placeholder={t('budget_expectation_placeholder') || 'e.g., 10,000 - 20,000 TL'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-600">{clubInfo.sponsorship_budget_expectation || t('not_specified') || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {!editingInfo && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-800">
                    {t('two_way_matching_info') || 'These requirements will be used by our AI-powered matching system to find sponsors that best fit your club\'s needs and budget expectations.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE EVENT TAB ===== */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            {t('createNewEvent') || 'Create New Event'}
          </h2>

          <form onSubmit={handleEventSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('eventTitle') || 'Event Title'} *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('description') || 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Date/Time and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('dateTime') || 'Date & Time'} *
                </label>
                <input
                  type="datetime-local"
                  value={formData.event_datetime}
                  onChange={(e) => setFormData({ ...formData, event_datetime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('future_date_only') || 'Past dates cannot be selected'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('duration') || 'Duration'} *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                  <option value="240">4 hours</option>
                </select>
              </div>
            </div>

            {/* Capacities - Disabled until date is selected */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expectedAttendees') || 'Expected Attendees'} *
                </label>
                <input
                  type="number"
                  value={formData.expected_capacity}
                  onChange={(e) => setFormData({ ...formData, expected_capacity: e.target.value })}
                  required
                  min="1"
                  disabled={!formData.event_datetime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  title={!formData.event_datetime ? (t('select_date_first') || 'Please select event date first') : ''}
                />
                {!formData.event_datetime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('select_date_first') || 'Select event date & time first'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('maxCapacity') || 'Max Capacity'} *
                </label>
                <input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
                  required
                  min="1"
                  disabled={!formData.event_datetime}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  title={!formData.event_datetime ? (t('select_date_first') || 'Please select event date first') : ''}
                />
                {!formData.event_datetime && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t('select_date_first') || 'Select event date & time first'}
                  </p>
                )}
              </div>
            </div>

            {/* Room Selection with Conflict Detection */}
            {(recommendedRooms.length > 0 || conflictedRooms.length > 0 || disabledRooms.length > 0) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('selectRoom') || 'Select Room'} *
                  </label>

                  {/* Recommendation message */}
                  {roomRecommendationMessage && (
                    <div className={`mb-3 p-3 rounded-lg ${
                      recommendedRooms.length > 0
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    }`}>
                      <p className="text-sm">{roomRecommendationMessage}</p>
                      {hoursUntilEvent !== null && hoursUntilEvent < 24 && (
                        <p className="text-xs mt-1">
                          ⏰ Event in {Math.round(hoursUntilEvent)} hours - 24-hour capacity rule applies
                        </p>
                      )}
                    </div>
                  )}

                  {/* Available Rooms (No conflicts, not disabled) */}
                  {recommendedRooms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Available Rooms</h4>
                      <select
                        value={formData.room_id}
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                        className="w-full px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-green-50"
                      >
                        <option value="">{t('selectRoom') || 'Select a room...'}</option>
                        {recommendedRooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.name} - Capacity: {room.capacity} {room.location ? `(${room.location})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Conflicted Rooms (Admin can override) */}
                  {conflictedRooms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-yellow-700 mb-2">
                        Rooms with Conflicts (Admin can override)
                      </h4>
                      <div className="space-y-2">
                        {conflictedRooms.map(room => {
                          const roomConflicts = conflicts.filter(c => c.room_id === room.id);
                          return (
                            <div key={room.id} className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {room.name} - Capacity: {room.capacity}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {roomConflicts.map((conflict, idx) => (
                                      <p key={idx} className="text-xs text-yellow-800">
                                        {conflict.conflict_type}: {conflict.conflict_title}
                                        ({conflict.time_range})
                                        {conflict.is_recurring && ' - Weekly'}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setFormData({ ...formData, room_id: room.id.toString() })}
                                  className={`ml-4 px-3 py-1 rounded text-sm ${
                                    formData.room_id === room.id.toString()
                                      ? 'bg-yellow-600 text-white'
                                      : 'bg-white border border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                                  }`}
                                >
                                  {formData.room_id === room.id.toString() ? t('selected') || 'Selected' : t('select_anyway') || 'Yine de Seç'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Disabled Rooms (24-hour rule) */}
                  {disabledRooms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">
                        {hoursUntilEvent !== null && hoursUntilEvent >= 24
                          ? 'Disabled Rooms (Too large - please select a more appropriately sized room)'
                          : 'Disabled Rooms (Not recommended)'}
                      </h4>
                      <div className="space-y-2">
                        {disabledRooms.map(room => {
                          // If event is less than 24 hours away, allow selecting disabled rooms (emergency exception)
                          const canSelectDisabled = hoursUntilEvent !== null && hoursUntilEvent < 24;

                          return (
                            <div key={room.id} className={`border border-red-300 bg-red-50 rounded-lg p-3 ${canSelectDisabled ? '' : 'opacity-60'}`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {room.name} - Capacity: {room.capacity}
                                  </p>
                                  <p className="text-xs text-red-800 mt-1">
                                    {room.disable_reason}
                                  </p>
                                  {canSelectDisabled && (
                                    <p className="text-xs text-green-700 mt-1 font-medium">
                                      ⏰ Last-minute exception: Can be selected (event in {Math.round(hoursUntilEvent)} hours)
                                    </p>
                                  )}
                                </div>
                                {canSelectDisabled && (
                                  <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, room_id: room.id.toString() })}
                                    className={`ml-4 px-3 py-1 rounded text-sm ${
                                      formData.room_id === room.id.toString()
                                        ? 'bg-red-600 text-white'
                                        : 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
                                    }`}
                                  >
                                    {formData.room_id === room.id.toString() ? t('selected') || 'Selected' : t('select_anyway') || 'Yine de Seç'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Members Only Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="members_only"
                checked={formData.members_only}
                onChange={(e) => setFormData({ ...formData, members_only: e.target.checked })}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="members_only" className="ml-2 text-sm text-gray-700">
                {t('members_only') || 'Members only event'}
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loadingEvent}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingEvent ? (t('creating') || 'Creating...') : (t('createEvent') || 'Create Event')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== JOIN REQUESTS TAB ===== */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            {t('joinRequests') || 'Join Requests'} ({joinRequests.length})
          </h2>

          {loadingRequests ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : joinRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('no_pending_requests') || 'No pending requests'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {joinRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{request.user.full_name}</h3>
                      <p className="text-sm text-gray-600">{request.user.email}</p>
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('requestedOn') || 'Requested on'}: {formatDate(request.requested_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinRequestReview(request.id, 'approved')}
                        disabled={processingRequestId === request.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {t('approve') || 'Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt(t('enter_rejection_reason') || 'Rejection reason (optional):');
                          if (reason !== null) {
                            handleJoinRequestReview(request.id, 'rejected', reason || null);
                          }
                        }}
                        disabled={processingRequestId === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        {t('reject') || 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MEMBERS TAB ===== */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            {t('members') || 'Members'} ({clubMembers.length})
          </h2>

          {loadingMembers ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            </div>
          ) : clubMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t('no_members') || 'No members yet'}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('name') || 'Name'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('email') || 'Email'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('student_number') || 'Student #'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clubMembers
                      .slice((membersPage - 1) * membersPerPage, membersPage * membersPerPage)
                      .map(member => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {member.full_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.student_number || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              {t('remove') || 'Remove'}
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={membersPage}
                totalItems={clubMembers.length}
                itemsPerPage={membersPerPage}
                onPageChange={setMembersPage}
              />
            </>
          )}
        </div>
      )}

      {/* ===== SPONSORSHIP MATCHES TAB (NEW - Review6) ===== */}
      {activeTab === 'sponsorships' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('sponsorship_matches') || 'Sponsorship Matches'}
            </h2>
            <p className="text-sm text-gray-600">
              {t('ai_matched_sponsors') || 'AI-powered sponsor matches based on your club\'s needs and budget'}
            </p>
          </div>

          {loadingSponsorships ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
            </div>
          ) : sponsorshipMatches.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {t('no_matches_yet') || 'No Sponsorship Matches Yet'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {t('no_matches_description') || 'When sponsors apply and get approved, our AI will match them with your club based on compatibility.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sponsorshipMatches.map(match => (
                <div
                  key={match.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {match.club_name}
                        </h3>
                        {getRankBadge(match.match_rank)}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {t('matched_on') || 'Matched on'}: {formatDate(match.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      {t('ai_analysis') || 'AI Matching Analysis'}
                    </h4>
                    <p className="text-sm text-gray-800">
                      {match.ai_reasoning}
                    </p>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={() => handleViewMatchDetails(match)}
                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    {t('viewSponsorDetails') || 'View Sponsor Details & Contact'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SPONSORSHIP DETAILS MODAL (NEW - Review6) ===== */}
      {showMatchModal && selectedMatch && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedMatch.details?.company_name}
                </h2>
                <button
                  onClick={() => {
                    setShowMatchModal(false);
                    setSelectedMatch(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">
                    {t('contactInfo') || 'Contact Information'}
                  </h3>
                  <p className="text-green-800 font-mono text-sm">
                    {selectedMatch.details?.contact_info}
                  </p>
                </div>

                {/* Vision */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('companyVision') || 'Vision/Mission'}
                  </h3>
                  <p className="text-gray-700">
                    {selectedMatch.details?.vision}
                  </p>
                </div>

                {/* Goals */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('sponsorshipGoals') || 'Sponsorship Goals'}
                  </h3>
                  <p className="text-gray-700">
                    {selectedMatch.details?.sponsorship_goals}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{t('type') || 'Type'}:</span>
                    <span className="ml-2 text-gray-600 capitalize">
                      {selectedMatch.details?.sponsorship_type}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{t('budget') || 'Budget'}:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedMatch.details?.budget_range || t('not_specified') || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('why_matched') || 'Why This Match?'}
                  </h3>
                  <p className="text-gray-800 text-sm">
                    {selectedMatch.ai_reasoning}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowMatchModal(false);
                    setSelectedMatch(null);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {t('close') || 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManagement;
