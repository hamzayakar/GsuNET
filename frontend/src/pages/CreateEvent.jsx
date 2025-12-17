import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, clubsAPI, roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [clubs, setClubs] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [conflictMessage, setConflictMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_datetime: '',
    duration: '120', // Default 2 hours (120 minutes)
    expected_capacity: '',
    max_capacity: '',
    club_id: '',
    room_id: '',
    location: '',
    members_only: false,
  });

  // Fetch clubs on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const allClubs = await clubsAPI.getAll();
        // Filter clubs for club managers to only show their clubs
        const data = user?.role === "club_manager" && user?.managed_clubs
          ? allClubs.filter(club => user.managed_clubs.some(mc => mc.id === club.id))
          : allClubs;
        setClubs(data);

        // If user is a club manager, pre-select their club
        if (user?.managed_clubs && user.managed_clubs.length > 0) {
          setFormData((prev) => ({
            ...prev,
            club_id: user.managed_clubs[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch clubs:', err);
        setError('Failed to load clubs');
      }
    };

    fetchClubs();
  }, [user]);

  // Fetch room recommendations when capacity, date, or duration changes
  useEffect(() => {
    const fetchRoomRecommendations = async () => {
      // Reset recommendations and conflicts
      setRecommendedRooms([]);
      setConflicts([]);
      setConflictMessage('');

      if (!formData.expected_capacity || parseInt(formData.expected_capacity) <= 0) {
        return;
      }

      try {
        // If date and duration are provided, use enhanced recommendation (conflict-aware)
        if (formData.event_datetime && formData.duration) {
          const datetime = new Date(formData.event_datetime);
          const eventDate = datetime.toISOString().split('T')[0]; // YYYY-MM-DD
          const eventTime = datetime.toTimeString().slice(0, 5); // HH:MM

          const response = await roomsAPI.recommendEnhanced(
            parseInt(formData.expected_capacity),
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
            const rooms = await roomsAPI.recommend(parseInt(formData.expected_capacity));
            setRecommendedRooms(Array.isArray(rooms) ? rooms : []);
          }
        } else {
          // Basic recommendation (capacity only - backward compatible)
          const rooms = await roomsAPI.recommend(parseInt(formData.expected_capacity));
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
  }, [formData.expected_capacity, formData.event_datetime, formData.duration]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update location when room is selected
    if (name === 'room_id' && value) {
      const selectedRoom = recommendedRooms.find((room) => room.id === parseInt(value));
      if (selectedRoom) {
        setFormData((prev) => ({
          ...prev,
          location: selectedRoom.name,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Frontend validation for capacity
    const expectedCap = parseInt(formData.expected_capacity);
    const maxCap = parseInt(formData.max_capacity);

    if (expectedCap > maxCap) {
      setError(t('expectedCapacityExceedsMax') || 'Expected capacity cannot exceed maximum capacity');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for submission
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_datetime: new Date(formData.event_datetime).toISOString(),
        duration: parseInt(formData.duration),
        expected_capacity: expectedCap,
        max_capacity: maxCap,
        club_id: parseInt(formData.club_id),
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        location: formData.location || null,
        members_only: formData.members_only,
      };

      await eventsAPI.create(eventData);

      // Success - redirect to home
      navigate('/');
    } catch (err) {
      console.error('Failed to create event:', err);
      setError(
        err.response?.data?.detail || 'Failed to create event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('createEvent')}
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
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
                value={formData.event_datetime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes) *
              </label>
              <select
                id="duration"
                name="duration"
                required
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
                <option value="150">2.5 hours</option>
                <option value="180">3 hours</option>
                <option value="240">4 hours</option>
                <option value="300">5 hours</option>
                <option value="360">6 hours</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select how long your event will last (30 min - 6 hours)
              </p>
            </div>

            {/* Club Selection */}
            <div>
              <label htmlFor="club_id" className="block text-sm font-medium text-gray-700 mb-2">
                {t('club')} *
              </label>
              <select
                id="club_id"
                name="club_id"
                required
                value={formData.club_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">{t('selectClub')}</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
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
              {formData.expected_capacity && (
                <p className="mt-1 text-sm text-gray-500">
                  {t('roomRecommendationsHelp')}
                </p>
              )}
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
              {formData.expected_capacity && formData.max_capacity && parseInt(formData.expected_capacity) > parseInt(formData.max_capacity) && (
                <p className="mt-1 text-sm text-red-600">
                  ⚠️ Maximum capacity must be greater than or equal to expected capacity
                </p>
              )}
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  ⚠️ Schedule Conflicts Detected
                </h3>
                <p className="text-sm text-yellow-700 mb-2">{conflictMessage}</p>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {conflicts.slice(0, 3).map((conflict, idx) => (
                    <li key={idx}>
                      • <strong>{conflict.room_name}</strong>: {conflict.conflict_title} ({conflict.time_range})
                      {conflict.is_recurring && <span className="ml-1 text-xs">(Weekly class)</span>}
                    </li>
                  ))}
                  {conflicts.length > 3 && (
                    <li className="text-xs italic">...and {conflicts.length - 3} more conflicts</li>
                  )}
                </ul>
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
                  {recommendedRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({t('capacity')}: {room.capacity})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {t('theseRoomsRecommended')}
                </p>
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

            {/* Location (Manual) */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                {t('location')}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={t('enterLocation')}
              />
            </div>

            {/* Members Only Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="members_only"
                  name="members_only"
                  type="checkbox"
                  checked={formData.members_only}
                  onChange={(e) => setFormData(prev => ({ ...prev, members_only: e.target.checked }))}
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="members_only" className="text-sm font-medium text-gray-700">
                  {t('membersOnly')}
                </label>
                <p className="text-sm text-gray-500">{t('membersOnlyHelp')}</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? t('creating') : t('createEvent')}
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

export default CreateEvent;
