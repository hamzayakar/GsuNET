import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const RoomManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    description: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        ...formData,
        capacity: parseInt(formData.capacity),
      });
      toast.success('Room created successfully');
      setShowAddForm(false);
      setFormData({
        name: '',
        capacity: '',
        description: '',
      });
      fetchRooms();
    } catch (err) {
      console.error('Failed to create room:', err);
      toast.error(err.response?.data?.detail || 'Failed to create room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {showAddForm ? 'Cancel' : '+ Add Room'}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., D101 - Small Classroom"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Ground floor, has projector"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Room
              </button>
            </form>
          )}

          {/* Room List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.capacity} people
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {room.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No rooms found. Click "Add Room" to create one.
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Note:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Rooms are used for event location recommendations</li>
              <li>Larger capacity rooms appear first in recommendations</li>
              <li>Room deletion is disabled to prevent data integrity issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
