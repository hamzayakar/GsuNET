/**
 * Admin Sponsorship Tracking Page
 * Comprehensive view of all sponsorship applications and matches
 *
 * Features:
 * - View all sponsorship applications (pending, approved, rejected)
 * - See AI matching details and reasoning
 * - Filter by status
 * - View detailed application information
 */
import { useState, useEffect } from 'react';
import { sponsorshipsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function AdminSponsorshipTracking() {
  const { t } = useLanguage();

  // State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Fetch all applications (pending, approved, rejected)
      const allApps = await sponsorshipsAPI.getAllApplications();
      setApplications(allApps || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error(t('failed_to_fetch_applications') || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesForApplication = async (applicationId) => {
    setLoadingMatches(true);
    try {
      const matchData = await sponsorshipsAPI.getMatches(applicationId);
      setMatches(matchData || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      toast.error(t('failed_to_fetch_matches') || 'Failed to fetch matches');
      setMatches([]);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleViewDetails = async (app) => {
    setSelectedApplication(app);
    setShowDetailModal(true);

    // Fetch matches if approved
    if (app.status === 'approved') {
      await fetchMatchesForApplication(app.id);
    } else {
      setMatches([]);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badges[status] || badges.pending}`}>
        {icons[status]} {status.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('sponsorship_tracking') || 'Sponsorship Tracking'}
        </h1>
        <p className="text-gray-600">
          {t('admin_sponsorship_description') || 'View and manage all sponsorship applications and AI matching results'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                filter === status
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {' '}
              ({status === 'all' ? applications.length : applications.filter(a => a.status === status).length})
            </button>
          ))}
        </nav>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">
            {t('no_applications_found') || 'No applications found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('company') || 'Company'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('sponsor') || 'Sponsor'}
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
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      #{app.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {app.company_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {app.vision}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {app.sponsor?.full_name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.sponsor?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 capitalize whitespace-nowrap">
                      {app.sponsorship_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {app.budget_range || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        {t('view_details') || 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setShowDetailModal(false)}
            />

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-red-600 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {t('application_details') || 'Application Details'} - #{selectedApplication.id}
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
              <div className="bg-white px-6 py-6 space-y-6">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-2 gap-6 pb-6 border-b">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
                    {getStatusBadge(selectedApplication.status)}
                    {selectedApplication.approved_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Approved on: {formatDate(selectedApplication.approved_at)}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Submitted</h4>
                    <p className="text-gray-900">{formatDate(selectedApplication.created_at)}</p>
                  </div>
                </div>

                {/* Company & Sponsor Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Company Information</h3>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Company Name</h4>
                      <p className="text-gray-900">{selectedApplication.company_name}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Contact Information</h4>
                      <p className="text-gray-900">{selectedApplication.contact_info}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Type</h4>
                      <p className="text-gray-900 capitalize">{selectedApplication.sponsorship_type}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Budget Range</h4>
                      <p className="text-gray-900">{selectedApplication.budget_range || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Sponsor Information</h3>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Name</h4>
                      <p className="text-gray-900">{selectedApplication.sponsor?.full_name || 'N/A'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Email</h4>
                      <p className="text-gray-900">{selectedApplication.sponsor?.email || 'N/A'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">User ID</h4>
                      <p className="text-gray-900">#{selectedApplication.sponsor_id}</p>
                    </div>
                  </div>
                </div>

                {/* Vision & Goals */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Company Vision/Mission</h4>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.vision}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Sponsorship Goals</h4>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedApplication.sponsorship_goals}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedApplication.status === 'rejected' && selectedApplication.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</h4>
                    <p className="text-red-700">{selectedApplication.rejection_reason}</p>
                  </div>
                )}

                {/* AI Matching Results (for approved applications) */}
                {selectedApplication.status === 'approved' && (
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      🤖 AI Matching Results
                    </h3>

                    {loadingMatches ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : matches.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800">No matching results available</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {matches.map((match, idx) => (
                          <div key={match.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">
                                  🏆 Rank #{match.match_rank} - {match.club?.name || 'Unknown Club'}
                                </h4>
                                <p className="text-sm text-gray-600">Club ID: #{match.club_id}</p>
                              </div>
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                Match #{idx + 1}
                              </span>
                            </div>

                            <div className="bg-white rounded-lg p-4 mt-3">
                              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                <span className="mr-2">🧠</span> ChatGPT Reasoning:
                              </h5>
                              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                                {match.ai_reasoning}
                              </p>
                            </div>

                            {match.club && (
                              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Club Description:</span>
                                  <p className="text-gray-900">{match.club.description || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Manager:</span>
                                  <p className="text-gray-900">{match.club.manager?.full_name || 'N/A'}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
