import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    day_of_week: '0',
    start_time: '09:00',
    end_time: '11:00',
    block_type: 'class',
    description: '',
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchSchedules();
    fetchRooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedule/recurring');
      setSchedules(response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedule/', {
        ...formData,
        room_id: parseInt(formData.room_id),
        day_of_week: parseInt(formData.day_of_week),
        is_recurring: true,
      });
      toast.success('Schedule block created successfully');
      setShowAddForm(false);
      setFormData({
        room_id: '',
        title: '',
        day_of_week: '0',
        start_time: '09:00',
        end_time: '11:00',
        block_type: 'class',
        description: '',
      });
      fetchSchedules();
    } catch (err) {
      console.error('Failed to create schedule:', err);
      toast.error(err.response?.data?.detail || 'Failed to create schedule block');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule block?')) return;

    try {
      await api.delete(`/schedule/${id}`);
      toast.success('Schedule block deleted');
      fetchSchedules();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      toast.error('Failed to delete schedule block');
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
            <h1 className="text-3xl font-bold text-gray-900">Weekly Class Schedule Management</h1>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              {showAddForm ? 'Cancel' : '+ Add Schedule Block'}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
                  <select
                    required
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} (Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week *</label>
                  <select
                    required
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {dayNames.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Calculus 101"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.block_type}
                    onChange={(e) => setFormData({ ...formData, block_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="class">Class</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Create Schedule Block
              </button>
            </form>
          )}

          {/* Schedule List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.room_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {dayNames[schedule.day_of_week]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {schedule.start_time} - {schedule.end_time}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{schedule.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        schedule.block_type === 'class' ? 'bg-blue-100 text-blue-800' :
                        schedule.block_type === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.block_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {schedules.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recurring schedules found. Click "Add Schedule Block" to create one.
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Note:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>This page manages recurring weekly class schedules</li>
              <li>Approved events are automatically added to the schedule</li>
              <li>Only delete recurring blocks here (not event blocks)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
