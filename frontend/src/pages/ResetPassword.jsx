import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error(t('invalidResetLink'));
      navigate('/login');
    }
  }, [token, navigate, t]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/reset-password`,
        {
          token,
          new_password: formData.password,
        }
      );

      toast.success(t('passwordResetSuccess'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Password reset failed:', error);
      toast.error(error.response?.data?.detail || t('passwordResetFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('resetPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('enterNewPassword')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                {t('newPassword')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('newPassword')}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('confirmNewPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('confirmNewPassword')}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>{t('passwordRequirements')}:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t('minEightChars')}</li>
              <li>{t('oneUppercase')}</li>
              <li>{t('oneLowercase')}</li>
              <li>{t('oneNumber')}</li>
              <li>{t('oneSpecialChar')}</li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('resetting') : t('resetPassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
