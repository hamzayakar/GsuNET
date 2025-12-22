import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import Pagination from '../components/Pagination';

const AdminPanel = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterStudentNumber, setFilterStudentNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers();
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filterRole, filterName, filterStudentNumber]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = filterRole ? { role: filterRole } : {};
      const data = await usersAPI.getAll(params);
      setUsers(data);
    } catch (error) {
      toast.error(t('failedToLoadUsers'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await usersAPI.update(userId, { role: newRole });
      toast.success(t('userRoleUpdated'));
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('failedToUpdateRole'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('areYouSureDelete'))) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      toast.success(t('userDeleted'));
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('failedToDeleteUser'));
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      advisor: 'bg-purple-100 text-purple-800',
      club_manager: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      sponsor: 'bg-yellow-100 text-yellow-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Filter users by name and student number (client-side filtering)
  const filteredUsers = users.filter(u => {
    const matchesName = filterName ? u.full_name?.toLowerCase().includes(filterName.toLowerCase()) : true;
    const matchesStudentNumber = filterStudentNumber ? u.student_number?.includes(filterStudentNumber) : true;
    return matchesName && matchesStudentNumber;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('userManagement')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('manageAllUsers')}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role Filter */}
            <div>
              <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByRole')}
              </label>
              <select
                id="roleFilter"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="">{t('allRoles')}</option>
                <option value="admin">{t('admin')}</option>
                <option value="advisor">{t('advisor')}</option>
                <option value="club_manager">{t('club_manager')}</option>
                <option value="student">{t('student')}</option>
                <option value="sponsor">{t('sponsor')}</option>
              </select>
            </div>

            {/* Name Filter */}
            <div>
              <label htmlFor="nameFilter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByName') || 'Filter by Name'}
              </label>
              <input
                type="text"
                id="nameFilter"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder={t('enterName') || 'Enter name...'}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Student Number Filter */}
            <div>
              <label htmlFor="studentNumberFilter" className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByStudentNumber') || 'Filter by Student Number'}
              </label>
              <input
                type="text"
                id="studentNumberFilter"
                value={filterStudentNumber}
                onChange={(e) => setFilterStudentNumber(e.target.value)}
                placeholder={t('enterStudentNumber') || 'Enter student number...'}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filterRole || filterName || filterStudentNumber) && (
            <button
              onClick={() => {
                setFilterRole('');
                setFilterName('');
                setFilterStudentNumber('');
              }}
              className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
            >
              {t('clearFilters') || 'Clear Filters'}
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('email')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('studentNumber')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('department')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('role')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        {t('noUsersFound')}
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u.id} className={u.id === user?.id ? 'bg-yellow-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.full_name}</div>
                          {u.id === user?.id && (
                            <span className="text-xs text-yellow-600 font-semibold">{t('you')}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{u.student_number || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{u.department || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            disabled={u.id === user?.id}
                            className={`text-xs font-medium px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                              u.id === user?.id
                                ? 'cursor-not-allowed opacity-60'
                                : 'cursor-pointer'
                            } ${getRoleBadgeColor(u.role)}`}
                          >
                            <option value="student">{t('student')}</option>
                            <option value="club_manager">{t('club_manager')}</option>
                            <option value="advisor">{t('advisor')}</option>
                            <option value="sponsor">{t('sponsor')}</option>
                            <option value="admin">{t('admin')}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === user?.id}
                            className={`text-red-600 hover:text-red-900 ${
                              u.id === user?.id ? 'cursor-not-allowed opacity-40' : ''
                            }`}
                            title={u.id === user?.id ? t('cannotDeleteSelf') : t('deleteUser')}
                          >
                            {t('delete')}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                {t('showing')}: <span className="font-semibold">{filteredUsers.length}</span> {t('of')} <span className="font-semibold">{users.length}</span> {t('users')}
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
