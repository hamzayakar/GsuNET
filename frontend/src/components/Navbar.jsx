import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showMobileAdminMenu, setShowMobileAdminMenu] = useState(false);

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
                  <Link
                    to="/my-events"
                    className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {t('myEvents')}
                  </Link>
                  {(user?.role === 'club_manager' || user?.role === 'advisor') && (
                    <Link
                      to="/club-management"
                      className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('clubManagement')}
                    </Link>
                  )}
                  {user?.role === 'sponsor' && (
                    <Link
                      to="/sponsorship-management"
                      className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                    >
                      {t('sponsorshipManagement')}
                    </Link>
                  )}
                  {(user?.role === 'advisor' || user?.role === 'admin') && (
                    <div className="relative">
                      <button
                        onClick={() => setShowAdminMenu(!showAdminMenu)}
                        className="text-gray-900 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        {user?.role === 'admin' ? t('adminPanel') : t('approvalPanel')} ▾
                      </button>
                      {showAdminMenu && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                          <div className="py-1">
                            <Link
                              to="/approval-panel"
                              onClick={() => setShowAdminMenu(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {t('approvalPanel')}
                            </Link>
                            {user?.role === 'admin' && (
                              <>
                                <Link
                                  to="/admin"
                                  onClick={() => setShowAdminMenu(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t('userManagement')}
                                </Link>
                                <Link
                                  to="/admin/clubs"
                                  onClick={() => setShowAdminMenu(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t('adminClubManagement')}
                                </Link>
                                <Link
                                  to="/admin/schedule"
                                  onClick={() => setShowAdminMenu(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t('schedule')}
                                </Link>
                                <Link
                                  to="/admin/rooms"
                                  onClick={() => setShowAdminMenu(false)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {t('rooms')}
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Notification Bell - Only for logged in users */}
              {isAuthenticated() && <NotificationBell />}

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

      {/* Click outside to close menus */}
      {showLangMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLangMenu(false)}
        ></div>
      )}
      {showAdminMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAdminMenu(false)}
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

            <Link
              to="/my-events"
              className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs mt-1">{t('myEvents')}</span>
            </Link>

            {(user?.role === 'club_manager' || user?.role === 'advisor') && (
              <Link
                to="/club-management"
                className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-xs mt-1">{t('manage')}</span>
              </Link>
            )}

            {user?.role === 'sponsor' && (
              <Link
                to="/sponsorship-management"
                className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs mt-1">{t('sponsor')}</span>
              </Link>
            )}

            {(user?.role === 'advisor' || user?.role === 'admin') && (
              <button
                onClick={() => setShowMobileAdminMenu(true)}
                className="flex flex-col items-center justify-center flex-1 text-gray-600 hover:text-primary"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs mt-1">{user?.role === 'admin' ? t('adminPanel') : t('approve')}</span>
              </button>
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

      {/* Mobile Top Bar - Logo, Notifications & Language */}
      <div className="md:hidden bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-14 px-4">
          <Link to="/" className="text-xl font-bold text-primary">
            GSUNET
          </Link>

          <div className="flex items-center space-x-2">
            {/* Mobile Notifications */}
            {isAuthenticated() && <NotificationBell />}

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
                      className={`w-full text-left px-3 py-2 text-sm flex items-center space-x-2 hover:bg-gray-100 ${
                        language === lang.code ? 'bg-gray-50 font-semibold' : ''
                      }`}
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
      </div>

      {/* Mobile Admin Menu Modal */}
      {showMobileAdminMenu && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50"
            onClick={() => setShowMobileAdminMenu(false)}
          />
          <div className="md:hidden fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl z-50 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{user?.role === 'admin' ? t('adminPanel') : t('approvalPanel')}</h3>
              <button
                onClick={() => setShowMobileAdminMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <Link
                to="/approval-panel"
                onClick={() => setShowMobileAdminMenu(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
              >
                {t('approvalPanel')}
              </Link>
              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setShowMobileAdminMenu(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {t('userManagement')}
                  </Link>
                  <Link
                    to="/admin/clubs"
                    onClick={() => setShowMobileAdminMenu(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {t('adminClubManagement')}
                  </Link>
                  <Link
                    to="/admin/schedule"
                    onClick={() => setShowMobileAdminMenu(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {t('schedule')}
                  </Link>
                  <Link
                    to="/admin/rooms"
                    onClick={() => setShowMobileAdminMenu(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                  >
                    {t('rooms')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Spacer for fixed navbars */}
      <div className="h-14 md:h-16"></div>
      {isAuthenticated() && <div className="h-16 md:h-0"></div>}
    </>
  );
};

export default Navbar;
