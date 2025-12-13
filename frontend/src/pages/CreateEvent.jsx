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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_datetime: '',
    expected_capacity: '',
    max_capacity: '',
    club_id: '',
    room_id: '',
    location: '',
    image_url: '',
  });

  // Fetch clubs on component mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const data = await clubsAPI.getAll();
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

  // Fetch room recommendations when expected capacity changes
  useEffect(() => {
    const fetchRoomRecommendations = async () => {
      if (formData.expected_capacity && parseInt(formData.expected_capacity) > 0) {
        try {
          const rooms = await roomsAPI.recommend(parseInt(formData.expected_capacity));
          setRecommendedRooms(rooms);
        } catch (err) {
          console.error('Failed to fetch room recommendations:', err);
          setRecommendedRooms([]);
        }
      } else {
        setRecommendedRooms([]);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchRoomRecommendations, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.expected_capacity]);

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

    try {
      // Prepare data for submission
      const eventData = {
        title: formData.title,
        description: formData.description,
        event_datetime: new Date(formData.event_datetime).toISOString(),
        expected_capacity: parseInt(formData.expected_capacity),
        max_capacity: parseInt(formData.max_capacity),
        club_id: parseInt(formData.club_id),
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        location: formData.location || null,
        image_url: formData.image_url || null,
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
            {t('createEvent') || 'Create Event'}
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
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="event_datetime" className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time *
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

            {/* Club Selection */}
            <div>
              <label htmlFor="club_id" className="block text-sm font-medium text-gray-700 mb-2">
                Club *
              </label>
              <select
                id="club_id"
                name="club_id"
                required
                value={formData.club_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select a club</option>
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
                Expected Number of Participants *
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
                placeholder="Enter expected capacity"
              />
              {formData.expected_capacity && (
                <p className="mt-1 text-sm text-gray-500">
                  Room recommendations will appear below based on this capacity
                </p>
              )}
            </div>

            {/* Max Capacity */}
            <div>
              <label htmlFor="max_capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Capacity *
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
                placeholder="Enter maximum capacity"
              />
            </div>

            {/* Room Selection (with recommendations) */}
            {recommendedRooms.length > 0 && (
              <div>
                <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Recommended Rooms
                </label>
                <select
                  id="room_id"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a room (optional)</option>
                  {recommendedRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} (Capacity: {room.capacity})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  These rooms are recommended based on your expected capacity
                </p>
              </div>
            )}

            {/* Location (Manual) */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter location (auto-filled if room selected)"
              />
            </div>

            {/* Image URL (Optional) */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
