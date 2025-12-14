import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_number: '',
    department: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        student_number: user.student_number || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data (excluding email and role)
      const updateData = {
        full_name: formData.full_name,
        student_number: formData.student_number || null,
        department: formData.department || null,
      };

      // Update user profile via API
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/users/${user.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update local user data
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success(t('profileUpdatedSuccessfully'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.detail || t('failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('myProfile')}</h1>
        <p className="mt-2 text-gray-600">
          {t('manageYourPersonalInfo')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('fullName')} *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('emailAddress')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              disabled
              value={formData.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('emailCannotBeChanged')}
            </p>
          </div>

          {/* Student Number */}
          <div>
            <label htmlFor="student_number" className="block text-sm font-medium text-gray-700 mb-2">
              {t('studentNumber')}
            </label>
            <input
              type="text"
              id="student_number"
              name="student_number"
              value={formData.student_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={t('enterStudentNumber')}
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              {t('department')}
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder={t('enterDepartment')}
            />
          </div>

          {/* Role (Read-only) */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              {t('role')}
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                {t(user?.role)}
              </span>
              <p className="text-xs text-gray-500">
                {t('roleCannotBeChanged')}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('accountInformation')}</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">{t('memberSince')}:</span>{' '}
            {user?.created_at && new Date(user.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p>
            <span className="font-medium">{t('userId')}:</span> {user?.id}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
