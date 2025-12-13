import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
    { code: 'en', flag: '🇬🇧', name: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'Français' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <>
      {/* Desktop Navbar - Top */}
      <nav className="hidden md:block bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">GSUNET</span>
              </Link>

              {isAuthenticated() && (
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    to="/"
                    className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t('events')}
                  </Link>
                  <Link
                    to="/clubs"
                    className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t('clubs')}
                  </Link>
                  {user?.role === 'club_manager' && (
                    <Link
                      to="/create-event"
                      className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('createEvent')}
                    </Link>
                  )}
                  {(user?.role === 'advisor' || user?.role === 'admin') && (
                    <Link
                      to="/approval-panel"
                      className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('approvalPanel')}
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  title="Change language"
                >
                  <span className="text-xl">{currentLang?.flag}</span>
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            changeLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 $${'{'}
                            language === lang.code ? 'bg-gray-50 font-semibold' : ''
                          ${'}'}`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="text-gray-900">{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isAuthenticated() ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700 font-medium">{user?.full_name}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-red-600 text-white font-semibold shadow-sm">
                    {t(user?.role)}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
                  >
                    {t('register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Click outside to close language menu */}
      {showLangMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLangMenu(false)}
        ></div>
      )}

      {/* Mobile Navbar - Bottom */}
      {isAuthenticated() && (
        <nav className="md:hidden bg-white shadow-md fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200">
          <div className="flex justify-around items-center h-16">
            <Link
              to="/"
              className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs mt-1">{t('events')}</span>
            </Link>

            <Link
              to="/clubs"
              className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs mt-1">{t('clubs')}</span>
            </Link>

            {user?.role === 'club_manager' && (
              <Link
                to="/create-event"
                className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs mt-1">{t('create')}</span>
              </Link>
            )}

            {(user?.role === 'advisor' || user?.role === 'admin') && (
              <Link
                to="/approval-panel"
                className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">{t('approve')}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-xs mt-1">{t('logout')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Top Bar - Logo & Language */}
      <div className="md:hidden bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-14 px-4">
          <Link to="/" className="text-xl font-bold text-primary">
            GSUNET
          </Link>

          {/* Mobile Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center px-2 py-1 rounded hover:bg-gray-100"
            >
              <span className="text-lg">{currentLang?.flag}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 $${'{'}
                        language === lang.code ? 'bg-gray-50 font-semibold' : ''
                      ${'}'}`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-gray-900">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed navbars */}
      <div className="h-14 md:h-16"></div>
      {isAuthenticated() && <div className="h-16 md:h-0"></div>}
    </>
  );
};

export default Navbar;
