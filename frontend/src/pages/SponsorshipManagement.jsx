/**
 * Sponsorship Management Page
 * Review6: Sponsor matching feature
 *
 * For sponsor users to:
 * - Create sponsorship applications
 * - View application status (PENDING/APPROVED/REJECTED)
 * - Track submitted applications
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { sponsorshipsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function SponsorshipManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    contact_info: '',
    vision: '',
    sponsorship_goals: '',
    sponsorship_type: 'corporate',
    budget_range: ''
  });

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'applications'

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await sponsorshipsAPI.getMyApplications();
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(t('sponsorshipFetchError') || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.company_name || !formData.contact_info || !formData.vision || !formData.sponsorship_goals) {
      toast.error(t('sponsorshipFillRequired') || 'Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await sponsorshipsAPI.createApplication(formData);

      toast.success(t('sponsorshipCreated') || 'Sponsorship application submitted successfully!');

      // Reset form
      setFormData({
        company_name: '',
        contact_info: '',
        vision: '',
        sponsorship_goals: '',
        sponsorship_type: 'corporate',
        budget_range: ''
      });

      // Refresh applications and switch to applications tab
      fetchApplications();
      setActiveTab('applications');

    } catch (error) {
      console.error('Error creating application:', error);
      toast.error(error.response?.data?.detail || t('sponsorshipCreateError') || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: t('statusPending') || 'Pending',
      approved: t('statusApproved') || 'Approved',
      rejected: t('statusRejected') || 'Rejected'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || badges.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('sponsorshipManagement') || 'Sponsorship Management'}
        </h1>
        <p className="text-gray-600">
          {t('sponsorshipDescription') || 'Create and manage your sponsorship applications'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('form')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'form'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('newApplication') || 'New Application'}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('myApplications') || 'My Applications'} ({applications.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'form' ? (
        /* Application Form */
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            {t('createSponsorshipApplication') || 'Create Sponsorship Application'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('companyName') || 'Company Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder={t('companyNamePlaceholder') || 'e.g., Tech Corp Inc.'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('contactInfo') || 'Contact Information'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="contact_info"
                value={formData.contact_info}
                onChange={handleChange}
                placeholder={t('contactInfoPlaceholder') || 'Email, phone, website...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Vision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('companyVision') || 'Company Vision/Mission'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                placeholder={t('visionPlaceholder') || 'Describe your company vision and mission...'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Sponsorship Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sponsorshipGoals') || 'Sponsorship Goals'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="sponsorship_goals"
                value={formData.sponsorship_goals}
                onChange={handleChange}
                placeholder={t('goalsPlaceholder') || 'What types of events/activities do you want to sponsor?'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Type & Budget (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sponsorship Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sponsorshipType') || 'Sponsorship Type'}
                </label>
                <select
                  name="sponsorship_type"
                  value={formData.sponsorship_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="corporate">{t('typeCorporate') || 'Corporate'}</option>
                  <option value="individual">{t('typeIndividual') || 'Individual'}</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('budgetRange') || 'Budget Range'} ({t('optional') || 'Optional'})
                </label>
                <input
                  type="text"
                  name="budget_range"
                  value={formData.budget_range}
                  onChange={handleChange}
                  placeholder={t('budgetPlaceholder') || 'e.g., 10,000 - 50,000 TL'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (t('submitting') || 'Submitting...') : (t('submitApplication') || 'Submit Application')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* My Applications Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              {t('myApplications') || 'My Applications'}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">{t('loading') || 'Loading...'}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {t('noApplications') || 'No applications yet. Create your first one!'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('company') || 'Company'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('type') || 'Type'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('budget') || 'Budget'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status') || 'Status'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('submitted') || 'Submitted'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {app.company_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {app.vision}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                          {app.sponsorship_type}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {app.budget_range || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(app.status)}
                          {app.status === 'rejected' && app.rejection_reason && (
                            <div className="mt-1 text-xs text-red-600">
                              {app.rejection_reason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(app.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
