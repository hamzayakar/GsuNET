import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navbar
    events: 'Events',
    clubs: 'Clubs',
    createEvent: 'Create Event',
    approvalPanel: 'Approval Panel',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    create: 'Create',
    approve: 'Approve',

    // Roles
    student: 'Student',
    club_manager: 'Club Manager',
    advisor: 'Advisor',
    admin: 'Admin',

    // Home Page
    campusEvents: 'Campus Events',
    allEvents: 'All Events',
    approved: 'Approved',
    pending: 'Pending',
    completed: 'Completed',
    noEventsFound: 'No events found',
    thereAreNoEvents: 'There are no events yet.',

    // Auth
    signIn: 'Sign in',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email address',
    password: 'Password',
    signingIn: 'Signing in...',
    dontHaveAccount: "Don't have an account? Register",

    // Register
    createAccount: 'Create your account',
    fullName: 'Full Name',
    studentNumber: 'Student Number (optional)',
    confirmPassword: 'Confirm Password',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account? Sign in',

    // EventCard
    viewDetails: 'View Details',

    // EventDetail
    registerForEvent: 'Register for Event',
    unregister: 'Unregister',
    registering: 'Registering...',
    processing: 'Processing...',
    successfullyRegistered: 'Successfully registered for the event!',
    successfullyUnregistered: 'Successfully unregistered from the event',
    alreadyRegisteredError: 'You are already registered for this event',

    // ClubDetail
    follow: 'Follow',
    following: 'Following',
    loading: 'Loading...',
    nowFollowing: 'You are now following',
    unfollowed: 'You unfollowed',

    // CreateEvent
    eventTitle: 'Event Title',
    description: 'Description',
    eventDate: 'Event Date & Time',
    expectedCapacity: 'Expected Capacity',
    roomRecommendationsHelp: 'Room recommendations will appear below based on this capacity',
    recommendedRooms: 'Recommended Rooms',
    selectRoom: 'Select a room (optional)',
    location: 'Location',
    creating: 'Creating...',
    eventCreatedSuccess: 'Event created successfully!',

    // General
    submit: 'Submit',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    adminPanel: 'Admin Panel',
  },

  tr: {
    // Navbar
    events: 'Etkinlikler',
    clubs: 'Kulüpler',
    createEvent: 'Etkinlik Oluştur',
    approvalPanel: 'Onay Paneli',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    logout: 'Çıkış Yap',
    create: 'Oluştur',
    approve: 'Onayla',

    // Roles
    student: 'Öğrenci',
    club_manager: 'Kulüp Yöneticisi',
    advisor: 'Danışman',
    admin: 'Yönetici',

    // Home Page
    campusEvents: 'Kampüs Etkinlikleri',
    allEvents: 'Tüm Etkinlikler',
    approved: 'Onaylandı',
    pending: 'Beklemede',
    completed: 'Tamamlandı',
    noEventsFound: 'Etkinlik bulunamadı',
    thereAreNoEvents: 'Henüz etkinlik yok.',

    // Auth
    signIn: 'Giriş Yap',
    signInToAccount: 'Hesabınıza giriş yapın',
    emailAddress: 'E-posta adresi',
    password: 'Şifre',
    signingIn: 'Giriş yapılıyor...',
    dontHaveAccount: 'Hesabınız yok mu? Kayıt olun',

    // Register
    createAccount: 'Hesap oluştur',
    fullName: 'Ad Soyad',
    studentNumber: 'Öğrenci Numarası (opsiyonel)',
    confirmPassword: 'Şifreyi Onayla',
    creatingAccount: 'Hesap oluşturuluyor...',
    alreadyHaveAccount: 'Zaten hesabınız var mı? Giriş yapın',

    // EventCard
    viewDetails: 'Detayları Gör',

    // EventDetail
    registerForEvent: 'Etkinliğe Kayıt Ol',
    unregister: 'Kaydı İptal Et',
    registering: 'Kayıt Olunuyor...',
    processing: 'İşleniyor...',
    successfullyRegistered: 'Etkinliğe başarıyla kayıt oldunuz!',
    successfullyUnregistered: 'Etkinlik kaydınız başarıyla iptal edildi',
    alreadyRegisteredError: 'Bu etkinliğe zaten kayıtlısınız',

    // ClubDetail
    follow: 'Takip Et',
    following: 'Takip Ediliyor',
    loading: 'Yükleniyor...',
    nowFollowing: 'Artık takip ediyorsunuz:',
    unfollowed: 'Takibi bıraktınız:',

    // CreateEvent
    eventTitle: 'Etkinlik Başlığı',
    description: 'Açıklama',
    eventDate: 'Etkinlik Tarihi ve Saati',
    expectedCapacity: 'Tahmini Katılımcı Sayısı',
    roomRecommendationsHelp: 'Bu kapasiteye göre oda önerileri aşağıda görünecektir',
    recommendedRooms: 'Önerilen Odalar',
    selectRoom: 'Bir oda seçin (opsiyonel)',
    location: 'Konum',
    creating: 'Oluşturuluyor...',
    eventCreatedSuccess: 'Etkinlik başarıyla oluşturuldu!',

    // General
    submit: 'Gönder',
    cancel: 'İptal',
    edit: 'Düzenle',
    delete: 'Sil',
    save: 'Kaydet',
    adminPanel: 'Yönetici Paneli',
  },

  fr: {
    // Navbar
    events: 'Événements',
    clubs: 'Clubs',
    createEvent: 'Créer un événement',
    approvalPanel: "Panneau d'approbation",
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    create: 'Créer',
    approve: 'Approuver',

    // Roles
    student: 'Étudiant',
    club_manager: 'Gestionnaire de club',
    advisor: 'Conseiller',
    admin: 'Administrateur',

    // Home Page
    campusEvents: 'Événements du campus',
    allEvents: 'Tous les événements',
    approved: 'Approuvé',
    pending: 'En attente',
    completed: 'Terminé',
    noEventsFound: 'Aucun événement trouvé',
    thereAreNoEvents: "Il n'y a pas encore d'événements.",

    // Auth
    signIn: 'Se connecter',
    signInToAccount: 'Connectez-vous à votre compte',
    emailAddress: 'Adresse e-mail',
    password: 'Mot de passe',
    signingIn: 'Connexion en cours...',
    dontHaveAccount: "Vous n'avez pas de compte? S'inscrire",

    // Register
    createAccount: 'Créer votre compte',
    fullName: 'Nom complet',
    studentNumber: "Numéro d'étudiant (optionnel)",
    confirmPassword: 'Confirmer le mot de passe',
    creatingAccount: 'Création du compte...',
    alreadyHaveAccount: 'Vous avez déjà un compte? Se connecter',

    // EventCard
    viewDetails: 'Voir les détails',

    // EventDetail
    registerForEvent: "S'inscrire à l'événement",
    unregister: 'Se désinscrire',
    registering: 'Inscription en cours...',
    processing: 'Traitement...',
    successfullyRegistered: "Vous êtes inscrit à l'événement avec succès!",
    successfullyUnregistered: "Vous êtes désinscrit de l'événement",
    alreadyRegisteredError: 'Vous êtes déjà inscrit à cet événement',

    // ClubDetail
    follow: 'Suivre',
    following: 'Suivi',
    loading: 'Chargement...',
    nowFollowing: 'Vous suivez maintenant',
    unfollowed: 'Vous ne suivez plus',

    // CreateEvent
    eventTitle: "Titre de l'événement",
    description: 'Description',
    eventDate: "Date et heure de l'événement",
    expectedCapacity: 'Capacité attendue',
    roomRecommendationsHelp: 'Les recommandations de salle apparaîtront ci-dessous en fonction de cette capacité',
    recommendedRooms: 'Salles recommandées',
    selectRoom: 'Sélectionner une salle (optionnel)',
    location: 'Emplacement',
    creating: 'Création...',
    eventCreatedSuccess: 'Événement créé avec succès!',

    // General
    submit: 'Soumettre',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Sauvegarder',
    adminPanel: "Panneau d'administration",
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get language from localStorage or default to Turkish
    return localStorage.getItem('language') || 'tr';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
