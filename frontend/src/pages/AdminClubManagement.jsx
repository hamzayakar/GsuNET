import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { clubsAPI, usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminClubManagement = () => {
  const { t } = useLanguage();
  const [clubs, setClubs] = useState([]);
  const [managers, setManagers] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingClub, setEditingClub] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    contact_email: '',
    manager_id: '',
    advisor_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clubsData, managersData, advisorsData] = await Promise.all([
        clubsAPI.getAll(),
        usersAPI.getAll({ role: 'club_manager' }),
        usersAPI.getAll({ role: 'advisor' }),
      ]);
      setClubs(clubsData);
      setManagers(managersData);
      setAdvisors(advisorsData);
    } catch (error) {
      toast.error(t('failedToLoadData'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('clubNameRequired'));
      return;
    }

    try {
      setCreating(true);
      const clubData = {
        name: formData.name,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        contact_email: formData.contact_email || null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        advisor_id: formData.advisor_id ? parseInt(formData.advisor_id) : null,
      };

      await clubsAPI.create(clubData);
      toast.success(t('clubCreatedSuccess'));

      // Reset form
      setFormData({
        name: '',
        description: '',
        logo_url: '',
        contact_email: '',
        manager_id: '',
        advisor_id: '',
      });

      // Refresh clubs list
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('failedToCreateClub'));
    } finally {
      setCreating(false);
    }
  };

  const handleEditClub = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description || '',
      logo_url: club.logo_url || '',
      contact_email: club.contact_email || '',
      manager_id: club.manager_id || '',
      advisor_id: club.advisor_id || '',
    });

    // Scroll to top smoothly to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateClub = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t('clubNameRequired'));
      return;
    }

    try {
      setCreating(true);
      const clubData = {
        name: formData.name,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        contact_email: formData.contact_email || null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        advisor_id: formData.advisor_id ? parseInt(formData.advisor_id) : null,
      };

      await clubsAPI.update(editingClub.id, clubData);
      toast.success(t('clubUpdatedSuccess'));

      // Reset form and editing state
      setEditingClub(null);
      setFormData({
        name: '',
        description: '',
        logo_url: '',
        contact_email: '',
        manager_id: '',
        advisor_id: '',
      });

      // Refresh clubs list
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('failedToUpdateClub'));
    } finally {
      setCreating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingClub(null);
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      contact_email: '',
      manager_id: '',
      advisor_id: '',
    });
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm(t('areYouSureDeleteClub'))) {
      return;
    }

    try {
      await clubsAPI.delete(clubId);
      toast.success(t('clubDeleted'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('failedToDeleteClub'));
    }
  };

  const getManagerName = (managerId) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? manager.full_name : t('notAssigned');
  };

  const getAdvisorName = (advisorId) => {
    const advisor = advisors.find(a => a.id === advisorId);
    return advisor ? advisor.full_name : t('notAssigned');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('adminClubManagement')}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {t('createManageClubs')}
          </p>
        </div>

        {/* Create/Edit Club Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingClub ? t('editClub') : t('createNewClub')}
          </h2>
          <form onSubmit={editingClub ? handleUpdateClub : handleCreateClub} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Club Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('clubName')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t('enterClubName')}
                />
              </div>

              {/* Contact Email */}
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactEmail')}
                </label>
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t('enterContactEmail')}
                />
              </div>

              {/* Manager Selection */}
              <div>
                <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('clubManager')}
                </label>
                <select
                  id="manager_id"
                  name="manager_id"
                  value={formData.manager_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">{t('selectManager')}</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name} ({manager.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Advisor Selection */}
              <div>
                <label htmlFor="advisor_id" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('advisor')}
                </label>
                <select
                  id="advisor_id"
                  name="advisor_id"
                  value={formData.advisor_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">{t('selectAdvisor')}</option>
                  {advisors.map((advisor) => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.full_name} ({advisor.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Logo URL */}
              <div className="md:col-span-2">
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('logoUrl')}
                </label>
                <input
                  type="url"
                  id="logo_url"
                  name="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t('enterLogoUrl')}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('description')}
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t('enterClubDescription')}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? t('saving') : editingClub ? t('updateClub') : t('createClub')}
              </button>
              {editingClub && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Clubs Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">{t('noClubsYet')}</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clubName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('clubManager')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('advisor')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('members')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('followers')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {club.logo_url && (
                          <img
                            src={club.logo_url}
                            alt={club.name}
                            className="h-10 w-10 rounded-full mr-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{club.name}</div>
                          {club.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {club.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getManagerName(club.manager_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getAdvisorName(club.advisor_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {club.member_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {club.follower_count}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditClub(club)}
                        className="text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer transition-colors"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClubManagement;
