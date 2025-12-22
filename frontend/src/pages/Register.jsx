import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    student_number: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordHints, setShowPasswordHints] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('one special character (!@#$%^&*(),.?":{}|<>)');
    }

    return errors;
  };

  const sanitizeInput = (input) => {
    // Check for SQL injection patterns
    const sqlPatterns = [
      /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b/i,
      /(--|;|\/\*|\*\/)/,
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }

    // Check for script tags
    if (/<script|javascript:|onerror=|onload=/i.test(input)) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Sanitize inputs
    if (!sanitizeInput(formData.full_name) ||
        !sanitizeInput(formData.student_number)) {
      setError('Input contains invalid characters or patterns');
      return;
    }

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            GSUNET
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('createAccount')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="full_name" className="sr-only">
                {t('fullName')}
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('fullName')}
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
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
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('emailAddress')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="student_number" className="sr-only">
                {t('studentNumber')}
              </label>
              <input
                id="student_number"
                name="student_number"
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('studentNumber')}
                value={formData.student_number}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                onFocus={() => setShowPasswordHints(true)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={formData.password}
                onChange={handleChange}
              />
              {showPasswordHints && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
                  <p className="font-semibold text-blue-900 mb-1">Password must contain:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      ✓ At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One lowercase letter
                    </li>
                    <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>
                      ✓ One special character (!@#$%^&*(),.?":{}|&lt;&gt;)
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                placeholder={t('confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 shadow-sm"
            >
              {loading ? t('creatingAccount') : t('register')}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-red-600 hover:text-red-700"
            >
              {t('alreadyHaveAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
