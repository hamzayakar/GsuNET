import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('weekly');
  const [schedules, setSchedules] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedDate, setSelectedDate] = useState('');

  // Filters and pagination for management tab
  const [filterRoom, setFilterRoom] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    room_id: '',
    title: '',
    day_of_week: '0',
    start_time: '09:00',
    end_time: '11:00',
    block_type: 'class',
    description: '',
  });

  const dayNames = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];

  // Helper function to get Monday of the week for a given date
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // Get dates for the current week (Monday to Sunday)
  function getWeekDates(weekStart) {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  // Filtered and paginated schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      if (filterRoom && schedule.room_id !== parseInt(filterRoom)) return false;
      if (filterDay !== '' && schedule.day_of_week !== parseInt(filterDay)) return false;
      return true;
    });
  }, [schedules, filterRoom, filterDay]);

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchedules.slice(start, start + itemsPerPage);
  }, [filteredSchedules, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRoom, filterDay]);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error(t('adminAccessRequired'));
      navigate('/');
    }
  }, [user, navigate, t]);

  useEffect(() => {
    fetchSchedules();
    fetchRooms();
    fetchWeeklySchedule();
  }, [currentWeekStart]);

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/schedule/recurring');
      setSchedules(response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
      toast.error(t('failedToLoadSchedules'));
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySchedule = async () => {
    try {
      const weekDates = getWeekDates(currentWeekStart);
      const schedulePromises = weekDates.map(date =>
        api.get('/schedule/daily', {
          params: { schedule_date: formatDate(date) }
        })
      );

      const responses = await Promise.all(schedulePromises);
      const newWeeklySchedule = {};

      responses.forEach((response, index) => {
        newWeeklySchedule[index] = response.data.blocks || [];
      });

      setWeeklySchedule(newWeeklySchedule);
    } catch (err) {
      console.error('Failed to fetch weekly schedule:', err);
      toast.error(t('failedToLoadWeeklySchedule'));
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
      toast.success(t('scheduleBlockCreated'));
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
      toast.error(err.response?.data?.detail || t('failedToCreateSchedule'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDeleteScheduleBlock'))) return;

    try {
      await api.delete(`/schedule/${id}`);
      toast.success(t('scheduleBlockDeleted'));
      fetchSchedules();
      fetchWeeklySchedule();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
      toast.error(t('failedToDeleteSchedule'));
    }
  };

  const goToPreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleDateSelect = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    if (date) {
      setCurrentWeekStart(getMonday(new Date(date)));
    }
  };

  const clearFilters = () => {
    setFilterRoom('');
    setFilterDay('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'weekly'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('weeklyScheduleView')}
              </button>
              <button
                onClick={() => setActiveTab('management')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'management'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('scheduleManagement')}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Weekly Schedule View Tab */}
            {activeTab === 'weekly' && (
              <>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex gap-2">
                    <button
                      onClick={goToPreviousWeek}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      ← {t('previousWeek')}
                    </button>
                    <button
                      onClick={goToCurrentWeek}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      {t('currentWeek')}
                    </button>
                    <button
                      onClick={goToNextWeek}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      {t('nextWeek')} →
                    </button>
                  </div>

                  {/* Date Picker */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">{t('goToDate')}:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleDateSelect}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Week Range Display */}
                <div className="text-center mb-4 text-gray-700">
                  <span className="font-medium text-lg">
                    {formatDate(currentWeekStart)} - {formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
                  </span>
                </div>

                {/* Weekly Grid */}
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-7 gap-2 min-w-max">
                    {getWeekDates(currentWeekStart).map((date, dayIndex) => (
                      <div key={dayIndex} className="border rounded-lg p-3 bg-gray-50 min-w-[150px]">
                        <div className="font-bold text-center mb-2 text-gray-800 border-b pb-2">
                          <div>{dayNames[dayIndex]}</div>
                          <div className="text-sm text-gray-600">{formatDate(date)}</div>
                        </div>
                        <div className="space-y-2">
                          {weeklySchedule[dayIndex] && weeklySchedule[dayIndex].length > 0 ? (
                            weeklySchedule[dayIndex]
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((block, blockIndex) => (
                                <div
                                  key={blockIndex}
                                  className={`text-xs p-2 rounded ${
                                    block.block_type === 'class'
                                      ? 'bg-blue-100 border border-blue-300'
                                      : block.block_type === 'event'
                                      ? 'bg-green-100 border border-green-300'
                                      : block.block_type === 'reserved'
                                      ? 'bg-yellow-100 border border-yellow-300'
                                      : 'bg-gray-100 border border-gray-300'
                                  }`}
                                >
                                  <div className="font-semibold truncate" title={block.title}>
                                    {block.title}
                                  </div>
                                  <div className="text-gray-700 mt-1">
                                    {block.start_time} - {block.end_time}
                                  </div>
                                  <div className="text-gray-600 truncate" title={block.room_name}>
                                    {block.room_name}
                                  </div>
                                  {block.is_recurring ? (
                                    <div className="text-gray-500 italic mt-1">{t('recurring')}</div>
                                  ) : (
                                    <div className="text-green-700 font-medium mt-1">{t('event')}</div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="text-gray-400 text-xs text-center py-4">{t('noSchedule')}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 text-sm text-gray-600">
                  <p className="font-medium mb-2">{t('legend')}</p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                      <span>{t('recurringClass')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>{t('eventOneTime')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span>{t('reserved')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                      <span>{t('maintenance')}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Schedule Management Tab */}
            {activeTab === 'management' && (
              <>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{t('recurringSchedules')}</h2>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    {showAddForm ? t('cancel') : t('addScheduleBlock')}
                  </button>
                </div>

                {/* Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('filterByRoom')}</label>
                      <select
                        value={filterRoom}
                        onChange={(e) => setFilterRoom(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[180px]"
                      >
                        <option value="">{t('allRooms')}</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('filterByDay')}</label>
                      <select
                        value={filterDay}
                        onChange={(e) => setFilterDay(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
                      >
                        <option value="">{t('allDays')}</option>
                        {dayNames.map((day, idx) => (
                          <option key={idx} value={idx}>{day}</option>
                        ))}
                      </select>
                    </div>
                    {(filterRoom || filterDay !== '') && (
                      <button
                        onClick={clearFilters}
                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        {t('clearFilters')}
                      </button>
                    )}
                    <div className="ml-auto text-sm text-gray-500">
                      {t('showing')} {paginatedSchedules.length} / {filteredSchedules.length} {t('items')}
                    </div>
                  </div>
                </div>

                {/* Add Form */}
                {showAddForm && (
                  <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-md space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('room')} *</label>
                        <select
                          required
                          value={formData.room_id}
                          onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">{t('selectRoom')}</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name} ({t('capacity')}: {room.capacity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('dayOfWeek')} *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('startTime')} *</label>
                        <input
                          type="time"
                          required
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('endTime')} *</label>
                        <input
                          type="time"
                          required
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('title')} *</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                        <select
                          value={formData.block_type}
                          onChange={(e) => setFormData({ ...formData, block_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="class">{t('class')}</option>
                          <option value="reserved">{t('reserved')}</option>
                          <option value="maintenance">{t('maintenance')}</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      {t('createScheduleBlock')}
                    </button>
                  </form>
                )}

                {/* Schedule List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('room')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dayOfWeek')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('time')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('title')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('type')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSchedules.map((schedule) => (
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
                              {schedule.block_type === 'class' ? t('class') : schedule.block_type === 'reserved' ? t('reserved') : t('maintenance')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              {t('delete')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredSchedules.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {t('noRecurringSchedules')}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 border rounded-md ${
                          currentPage === page
                            ? 'bg-red-600 text-white border-red-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;
