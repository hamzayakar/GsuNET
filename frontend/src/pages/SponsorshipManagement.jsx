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

  // Detail modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch applications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await sponsorshipsAPI.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(t('sponsorshipFetchError') || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation - Check required fields
    if (!formData.company_name || !formData.contact_info || !formData.vision || !formData.sponsorship_goals) {
      toast.error(t('sponsorshipFillRequired') || 'Please fill all required fields');
      return;
    }

    // Validation - Check minimum lengths
    if (formData.company_name.length < 2) {
      toast.error('Company name must be at least 2 characters');
      return;
    }
    if (formData.contact_info.length < 5) {
      toast.error('Contact info must be at least 5 characters');
      return;
    }
    if (formData.vision.length < 10) {
      toast.error('Company vision must be at least 10 characters');
      return;
    }
    if (formData.sponsorship_goals.length < 10) {
      toast.error('Sponsorship goals must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);

      // Debug logging
      console.log('[SPONSORSHIP DEBUG] Submitting application:', formData);
      console.log('[SPONSORSHIP DEBUG] Vision length:', formData.vision?.length);
      console.log('[SPONSORSHIP DEBUG] Goals length:', formData.sponsorship_goals?.length);

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
      console.error('[SPONSORSHIP DEBUG] Error creating application:', error);
      console.error('[SPONSORSHIP DEBUG] Error response:', error.response);
      console.error('[SPONSORSHIP DEBUG] Error data:', error.response?.data);

      // Handle validation errors (422)
      if (error?.response?.status === 422) {
        const validationErrors = error.response?.data?.detail;
        console.error('[SPONSORSHIP DEBUG] Validation errors:', validationErrors);

        if (Array.isArray(validationErrors) && validationErrors.length > 0) {
          // Display first validation error
          const firstError = validationErrors[0];
          const fieldName = firstError?.loc?.[1] || 'field';
          const message = firstError?.msg || 'Validation error';
          toast.error(`${fieldName}: ${message}`);
        } else if (typeof validationErrors === 'string') {
          toast.error(validationErrors);
        } else {
          toast.error(t('sponsorshipValidationError') || 'Please check all required fields (min 10 chars for vision and goals)');
        }
      } else if (error?.response?.data?.detail) {
        // Handle other API errors
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          toast.error(detail);
        } else {
          toast.error(t('sponsorshipCreateError') || 'Failed to create application');
        }
      } else {
        // Handle network errors or unknown errors
        toast.error(error?.message || t('sponsorshipCreateError') || 'Failed to create application');
      }
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions') || 'Actions'}
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            {t('viewDetails') || 'View Details'}
                          </button>
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

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowDetailModal(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Header */}
              <div className="bg-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {t('applicationDetails') || 'Application Details'}
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white hover:text-gray-200"
                  >
                    <span className="text-2xl">&times;</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-4 space-y-4">
                {/* Status Badge */}
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-sm text-gray-500">Status:</span>
                  {getStatusBadge(selectedApplication.status)}
                </div>

                {/* Company Name */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    {t('companyName') || 'Company Name'}
                  </h4>
                  <p className="text-gray-900">{selectedApplication.company_name}</p>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    {t('contactInfo') || 'Contact Information'}
                  </h4>
                  <p className="text-gray-900">{selectedApplication.contact_info}</p>
                </div>

                {/* Vision */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    {t('companyVision') || 'Company Vision/Mission'}
                  </h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.vision}</p>
                </div>

                {/* Sponsorship Goals */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    {t('sponsorshipGoals') || 'Sponsorship Goals'}
                  </h4>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.sponsorship_goals}</p>
                </div>

                {/* Type and Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      {t('sponsorshipType') || 'Type'}
                    </h4>
                    <p className="text-gray-900 capitalize">{selectedApplication.sponsorship_type}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      {t('budgetRange') || 'Budget Range'}
                    </h4>
                    <p className="text-gray-900">{selectedApplication.budget_range || t('notSpecified') || 'Not specified'}</p>
                  </div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedApplication.status === 'rejected' && selectedApplication.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                      {t('rejectionReason') || 'Rejection Reason'}
                    </h4>
                    <p className="text-red-700">{selectedApplication.rejection_reason}</p>
                  </div>
                )}

                {/* Submission Date */}
                <div className="pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {t('submittedOn') || 'Submitted on'}: {formatDate(selectedApplication.created_at)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
}
