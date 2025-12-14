import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/forgot-password`,
        { email }
      );

      setSubmitted(true);
      toast.success(t('resetLinkSent'));
    } catch (error) {
      console.error('Password reset request failed:', error);
      // Still show success message for security (don't reveal if email exists)
      setSubmitted(true);
      toast.success(t('resetLinkSent'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {t('checkYourEmail')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('resetInstructions')}
              </p>
              <p className="mt-4 text-xs text-gray-500">
                {t('checkConsole')}
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-sm font-medium text-red-600 hover:text-red-800"
              >
                {t('backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('enterEmailForReset')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('emailAddress')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('sending') : t('sendResetLink')}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-sm text-red-600 hover:text-red-800"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
