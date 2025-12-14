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
    myEvents: 'My Events',
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
    rejected: 'Rejected',
    noEventsFound: 'No events found',
    thereAreNoEvents: 'There are no events yet.',
    thereAreNoStatusEvents: 'There are no {status} events.',

    // My Events Page
    viewEventsYouRegistered: 'View all the events you have registered for',
    noRegistrationsYet: 'No registrations yet',
    startByBrowsingEvents: 'Start by browsing and registering for events',
    browseEvents: 'Browse Events',
    youAreRegisteredFor: 'You are registered for',
    event: 'event',

    // Notifications Page
    notifications: 'Notifications',
    manageYourNotifications: 'Manage and view all your notifications',
    all: 'All',
    unread: 'Unread',
    read: 'Read',
    markAllAsRead: 'Mark All as Read',
    deleteAllRead: 'Delete All Read',
    markAsRead: 'Mark as Read',
    delete: 'Delete',
    noNotificationsHere: 'No notifications here',
    noNotificationsYet: "You don't have any notifications yet",
    noUnreadNotifications: 'You have no unread notifications',
    noReadNotifications: 'You have no read notifications',

    // Profile Page
    myProfile: 'My Profile',
    manageYourPersonalInfo: 'Manage your personal information and account settings',
    emailCannotBeChanged: 'Email address cannot be changed',
    enterStudentNumber: 'Enter your student number',
    department: 'Department',
    enterDepartment: 'Enter your department',
    role: 'Role',
    roleCannotBeChanged: 'Role is assigned by administrators',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    profileUpdatedSuccessfully: 'Profile updated successfully!',
    failedToUpdateProfile: 'Failed to update profile',
    accountInformation: 'Account Information',
    memberSince: 'Member since',
    userId: 'User ID',

    // Auth
    signIn: 'Sign in',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email address',
    password: 'Password',
    signingIn: 'Signing in...',
    dontHaveAccount: "Don't have an account? Register",

    // Password Reset
    forgotPassword: 'Forgot Password?',
    enterEmailForReset: 'Enter your email address to reset your password',
    sendResetLink: 'Send Reset Link',
    sending: 'Sending...',
    resetLinkSent: 'If the email exists, a reset link has been sent',
    checkYourEmail: 'Check Your Email',
    resetInstructions: 'If an account exists with this email, you will receive password reset instructions.',
    checkConsole: 'For demo purposes, check the backend console for the reset link.',
    backToLogin: 'Back to Login',
    resetPassword: 'Reset Password',
    enterNewPassword: 'Enter your new password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordResetSuccess: 'Password reset successful! Redirecting to login...',
    passwordResetFailed: 'Failed to reset password',
    invalidResetLink: 'Invalid or expired reset link',
    resetting: 'Resetting...',
    passwordRequirements: 'Password Requirements',
    minEightChars: 'At least 8 characters',
    oneUppercase: 'One uppercase letter',
    oneLowercase: 'One lowercase letter',
    oneNumber: 'One number',
    oneSpecialChar: 'One special character',

    // Register
    createAccount: 'Create your account',
    fullName: 'Full Name',
    studentNumber: 'Student Number (optional)',
    confirmPassword: 'Confirm Password',
    creatingAccount: 'Creating account...',
    alreadyHaveAccount: 'Already have an account? Sign in',

    // EventCard
    viewDetails: 'View Details',
    capacity: 'Capacity',
    expected: 'Expected',
    attendees: 'attendees',

    // EventDetail
    registerForEvent: 'Register for Event',
    unregister: 'Unregister',
    registering: 'Registering...',
    processing: 'Processing...',
    successfullyRegistered: 'Successfully registered for the event!',
    successfullyUnregistered: 'Successfully unregistered from the event',
    alreadyRegisteredError: 'You are already registered for this event',
    backToEvents: 'Back to Events',

    // ClubDetail
    follow: 'Follow',
    following: 'Following',
    loading: 'Loading...',
    nowFollowing: 'You are now following',
    unfollowed: 'You unfollowed',

    // Clubs Page
    campusClubs: 'Campus Clubs',
    exploreClubs: 'Explore all the clubs and organizations at Galatasaray University',
    noClubsFound: 'No clubs found',
    noClubsYet: 'There are no clubs registered yet.',
    members: 'members',
    allClubs: 'All Clubs',
    followedClubs: 'Followed Clubs',

    // CreateEvent
    eventTitle: 'Event Title',
    description: 'Description',
    eventDate: 'Event Date & Time',
    expectedCapacity: 'Expected Capacity',
    expectedNumberOfParticipants: 'Expected Number of Participants',
    roomRecommendationsHelp: 'Room recommendations will appear below based on this capacity',
    recommendedRooms: 'Recommended Rooms',
    selectRoom: 'Select a room (optional)',
    selectClub: 'Select a club',
    location: 'Location',
    creating: 'Creating...',
    createEvent: 'Create Event',
    eventCreatedSuccess: 'Event created successfully!',
    enterEventTitle: 'Enter event title',
    enterEventDescription: 'Enter event description',
    dateAndTime: 'Date and Time',
    club: 'Club',
    maxCapacity: 'Maximum Capacity',
    enterExpectedCapacity: 'Enter expected capacity',
    enterMaxCapacity: 'Enter maximum capacity',
    theseRoomsRecommended: 'These rooms are recommended based on your expected capacity',
    enterLocation: 'Enter location (auto-filled if room selected)',
    imageUrl: 'Image URL (Optional)',

    // AdminPanel
    userManagement: 'User Management',
    manageAllUsers: 'Manage all users in the system. You can update roles and delete users.',
    filterByRole: 'Filter by Role',
    allRoles: 'All Roles',
    name: 'Name',
    email: 'Email',
    studentNumber: 'Student Number',
    department: 'Department',
    role: 'Role',
    actions: 'Actions',
    noUsersFound: 'No users found',
    you: '(You)',
    deleteUser: 'Delete user',
    cannotDeleteSelf: 'You cannot delete your own account',
    totalUsers: 'Total Users',
    areYouSureDelete: 'Are you sure you want to delete this user? This action cannot be undone.',

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
    myEvents: 'Etkinliklerim',
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
    rejected: 'Reddedildi',
    noEventsFound: 'Etkinlik bulunamadı',
    thereAreNoEvents: 'Henüz etkinlik yok.',
    thereAreNoStatusEvents: '{status} etkinlik yok.',

    // My Events Page
    viewEventsYouRegistered: 'Kayıt olduğunuz tüm etkinlikleri görüntüleyin',
    noRegistrationsYet: 'Henüz kayıt yok',
    startByBrowsingEvents: 'Etkinliklere göz atarak ve kayıt olarak başlayın',
    browseEvents: 'Etkinliklere Göz At',
    youAreRegisteredFor: 'Kayıtlı olduğunuz etkinlik sayısı',
    event: 'etkinlik',

    // Notifications Page
    notifications: 'Bildirimler',
    manageYourNotifications: 'Tüm bildirimlerinizi görüntüleyin ve yönetin',
    all: 'Tümü',
    unread: 'Okunmamış',
    read: 'Okunmuş',
    markAllAsRead: 'Tümünü Okundu Olarak İşaretle',
    deleteAllRead: 'Tüm Okunmuşları Sil',
    markAsRead: 'Okundu Olarak İşaretle',
    delete: 'Sil',
    noNotificationsHere: 'Burada bildirim yok',
    noNotificationsYet: 'Henüz hiç bildiriminiz yok',
    noUnreadNotifications: 'Okunmamış bildiriminiz yok',
    noReadNotifications: 'Okunmuş bildiriminiz yok',

    // Profile Page
    myProfile: 'Profilim',
    manageYourPersonalInfo: 'Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin',
    emailCannotBeChanged: 'E-posta adresi değiştirilemez',
    enterStudentNumber: 'Öğrenci numaranızı girin',
    department: 'Bölüm',
    enterDepartment: 'Bölümünüzü girin',
    role: 'Rol',
    roleCannotBeChanged: 'Rol yöneticiler tarafından atanır',
    saveChanges: 'Değişiklikleri Kaydet',
    saving: 'Kaydediliyor...',
    profileUpdatedSuccessfully: 'Profil başarıyla güncellendi!',
    failedToUpdateProfile: 'Profil güncellenemedi',
    accountInformation: 'Hesap Bilgileri',
    memberSince: 'Üyelik tarihi',
    userId: 'Kullanıcı ID',

    // Auth
    signIn: 'Giriş Yap',
    signInToAccount: 'Hesabınıza giriş yapın',
    emailAddress: 'E-posta adresi',
    password: 'Şifre',
    signingIn: 'Giriş yapılıyor...',
    dontHaveAccount: 'Hesabınız yok mu? Kayıt olun',

    // Password Reset
    forgotPassword: 'Şifrenizi mi unuttunuz?',
    enterEmailForReset: 'Şifrenizi sıfırlamak için e-posta adresinizi girin',
    sendResetLink: 'Sıfırlama Bağlantısı Gönder',
    sending: 'Gönderiliyor...',
    resetLinkSent: 'E-posta mevcutsa, sıfırlama bağlantısı gönderildi',
    checkYourEmail: 'E-postanızı Kontrol Edin',
    resetInstructions: 'Bu e-posta ile bir hesap varsa, şifre sıfırlama talimatlarını alacaksınız.',
    checkConsole: 'Demo amaçlı, sıfırlama bağlantısı için backend konsolunu kontrol edin.',
    backToLogin: 'Girişe Dön',
    resetPassword: 'Şifreyi Sıfırla',
    enterNewPassword: 'Yeni şifrenizi girin',
    newPassword: 'Yeni Şifre',
    confirmNewPassword: 'Yeni Şifreyi Onayla',
    passwordsDoNotMatch: 'Şifreler eşleşmiyor',
    passwordTooShort: 'Şifre en az 8 karakter olmalıdır',
    passwordResetSuccess: 'Şifre başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...',
    passwordResetFailed: 'Şifre sıfırlama başarısız',
    invalidResetLink: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı',
    resetting: 'Sıfırlanıyor...',
    passwordRequirements: 'Şifre Gereksinimleri',
    minEightChars: 'En az 8 karakter',
    oneUppercase: 'Bir büyük harf',
    oneLowercase: 'Bir küçük harf',
    oneNumber: 'Bir sayı',
    oneSpecialChar: 'Bir özel karakter',

    // Register
    createAccount: 'Hesap oluştur',
    fullName: 'Ad Soyad',
    studentNumber: 'Öğrenci Numarası (opsiyonel)',
    confirmPassword: 'Şifreyi Onayla',
    creatingAccount: 'Hesap oluşturuluyor...',
    alreadyHaveAccount: 'Zaten hesabınız var mı? Giriş yapın',

    // EventCard
    viewDetails: 'Detayları Gör',
    capacity: 'Kapasite',
    expected: 'Beklenen',
    attendees: 'katılımcı',

    // EventDetail
    registerForEvent: 'Etkinliğe Kayıt Ol',
    unregister: 'Kaydı İptal Et',
    registering: 'Kayıt Olunuyor...',
    processing: 'İşleniyor...',
    successfullyRegistered: 'Etkinliğe başarıyla kayıt oldunuz!',
    successfullyUnregistered: 'Etkinlik kaydınız başarıyla iptal edildi',
    alreadyRegisteredError: 'Bu etkinliğe zaten kayıtlısınız',
    backToEvents: 'Etkinliklere Dön',

    // ClubDetail
    follow: 'Takip Et',
    following: 'Takip Ediliyor',
    loading: 'Yükleniyor...',
    nowFollowing: 'Artık takip ediyorsunuz:',
    unfollowed: 'Takibi bıraktınız:',

    // Clubs Page
    campusClubs: 'Kampüs Kulüpleri',
    exploreClubs: 'Galatasaray Üniversitesi\'ndeki tüm kulüpleri ve organizasyonları keşfedin',
    noClubsFound: 'Kulüp bulunamadı',
    noClubsYet: 'Henüz kayıtlı kulüp yok.',
    members: 'üye',
    allClubs: 'Tüm Kulüpler',
    followedClubs: 'Takip Edilen Kulüpler',

    // CreateEvent
    eventTitle: 'Etkinlik Başlığı',
    description: 'Açıklama',
    eventDate: 'Etkinlik Tarihi ve Saati',
    expectedCapacity: 'Tahmini Katılımcı Sayısı',
    expectedNumberOfParticipants: 'Beklenen Katılımcı Sayısı',
    roomRecommendationsHelp: 'Bu kapasiteye göre oda önerileri aşağıda görünecektir',
    recommendedRooms: 'Önerilen Odalar',
    selectRoom: 'Bir oda seçin (opsiyonel)',
    selectClub: 'Bir kulüp seçin',
    location: 'Konum',
    creating: 'Oluşturuluyor...',
    createEvent: 'Etkinlik Oluştur',
    eventCreatedSuccess: 'Etkinlik başarıyla oluşturuldu!',
    enterEventTitle: 'Etkinlik başlığını girin',
    enterEventDescription: 'Etkinlik açıklamasını girin',
    dateAndTime: 'Tarih ve Saat',
    club: 'Kulüp',
    maxCapacity: 'Maksimum Kapasite',
    enterExpectedCapacity: 'Beklenen kapasiteyi girin',
    enterMaxCapacity: 'Maksimum kapasiteyi girin',
    theseRoomsRecommended: 'Bu odalar beklenen kapasitenize göre önerilmektedir',
    enterLocation: 'Konumu girin (oda seçilirse otomatik doldurulur)',
    imageUrl: 'Görsel URL (Opsiyonel)',

    // AdminPanel
    userManagement: 'Kullanıcı Yönetimi',
    manageAllUsers: 'Sistemdeki tüm kullanıcıları yönetin. Rolleri güncelleyebilir ve kullanıcıları silebilirsiniz.',
    filterByRole: 'Role Göre Filtrele',
    allRoles: 'Tüm Roller',
    name: 'İsim',
    email: 'E-posta',
    studentNumber: 'Öğrenci Numarası',
    department: 'Bölüm',
    role: 'Rol',
    actions: 'İşlemler',
    noUsersFound: 'Kullanıcı bulunamadı',
    you: '(Siz)',
    deleteUser: 'Kullanıcıyı sil',
    cannotDeleteSelf: 'Kendi hesabınızı silemezsiniz',
    totalUsers: 'Toplam Kullanıcı',
    areYouSureDelete: 'Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',

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
    myEvents: 'Mes événements',
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
    rejected: 'Rejeté',
    noEventsFound: 'Aucun événement trouvé',
    thereAreNoEvents: "Il n'y a pas encore d'événements.",
    thereAreNoStatusEvents: "Il n'y a pas d'événements {status}.",

    // My Events Page
    viewEventsYouRegistered: 'Voir tous les événements auxquels vous êtes inscrit',
    noRegistrationsYet: 'Aucune inscription pour le moment',
    startByBrowsingEvents: "Commencez par parcourir et vous inscrire aux événements",
    browseEvents: 'Parcourir les événements',
    youAreRegisteredFor: 'Vous êtes inscrit à',
    event: 'événement',

    // Notifications Page
    notifications: 'Notifications',
    manageYourNotifications: 'Gérer et voir toutes vos notifications',
    all: 'Tout',
    unread: 'Non lu',
    read: 'Lu',
    markAllAsRead: 'Tout marquer comme lu',
    deleteAllRead: 'Supprimer tout ce qui est lu',
    markAsRead: 'Marquer comme lu',
    delete: 'Supprimer',
    noNotificationsHere: 'Aucune notification ici',
    noNotificationsYet: "Vous n'avez pas encore de notifications",
    noUnreadNotifications: "Vous n'avez aucune notification non lue",
    noReadNotifications: "Vous n'avez aucune notification lue",

    // Profile Page
    myProfile: 'Mon profil',
    manageYourPersonalInfo: 'Gérer vos informations personnelles et paramètres de compte',
    emailCannotBeChanged: "L'adresse e-mail ne peut pas être modifiée",
    enterStudentNumber: 'Entrez votre numéro étudiant',
    department: 'Département',
    enterDepartment: 'Entrez votre département',
    role: 'Rôle',
    roleCannotBeChanged: 'Le rôle est attribué par les administrateurs',
    saveChanges: 'Enregistrer les modifications',
    saving: 'Enregistrement...',
    profileUpdatedSuccessfully: 'Profil mis à jour avec succès!',
    failedToUpdateProfile: 'Échec de la mise à jour du profil',
    accountInformation: 'Informations du compte',
    memberSince: 'Membre depuis',
    userId: 'ID utilisateur',

    // Auth
    signIn: 'Se connecter',
    signInToAccount: 'Connectez-vous à votre compte',
    emailAddress: 'Adresse e-mail',
    password: 'Mot de passe',
    signingIn: 'Connexion en cours...',
    dontHaveAccount: "Vous n'avez pas de compte? S'inscrire",

    // Password Reset
    forgotPassword: 'Mot de passe oublié?',
    enterEmailForReset: 'Entrez votre adresse e-mail pour réinitialiser votre mot de passe',
    sendResetLink: 'Envoyer le lien de réinitialisation',
    sending: 'Envoi...',
    resetLinkSent: "Si l'e-mail existe, un lien de réinitialisation a été envoyé",
    checkYourEmail: 'Vérifiez votre e-mail',
    resetInstructions: "Si un compte existe avec cet e-mail, vous recevrez des instructions de réinitialisation de mot de passe.",
    checkConsole: 'À des fins de démonstration, vérifiez la console backend pour le lien de réinitialisation.',
    backToLogin: 'Retour à la connexion',
    resetPassword: 'Réinitialiser le mot de passe',
    enterNewPassword: 'Entrez votre nouveau mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordResetSuccess: 'Réinitialisation du mot de passe réussie! Redirection vers la connexion...',
    passwordResetFailed: 'Échec de la réinitialisation du mot de passe',
    invalidResetLink: 'Lien de réinitialisation invalide ou expiré',
    resetting: 'Réinitialisation...',
    passwordRequirements: 'Exigences du mot de passe',
    minEightChars: 'Au moins 8 caractères',
    oneUppercase: 'Une lettre majuscule',
    oneLowercase: 'Une lettre minuscule',
    oneNumber: 'Un chiffre',
    oneSpecialChar: 'Un caractère spécial',

    // Register
    createAccount: 'Créer votre compte',
    fullName: 'Nom complet',
    studentNumber: "Numéro d'étudiant (optionnel)",
    confirmPassword: 'Confirmer le mot de passe',
    creatingAccount: 'Création du compte...',
    alreadyHaveAccount: 'Vous avez déjà un compte? Se connecter',

    // EventCard
    viewDetails: 'Voir les détails',
    capacity: 'Capacité',
    expected: 'Attendu',
    attendees: 'participants',

    // EventDetail
    registerForEvent: "S'inscrire à l'événement",
    unregister: 'Se désinscrire',
    registering: 'Inscription en cours...',
    processing: 'Traitement...',
    successfullyRegistered: "Vous êtes inscrit à l'événement avec succès!",
    successfullyUnregistered: "Vous êtes désinscrit de l'événement",
    alreadyRegisteredError: 'Vous êtes déjà inscrit à cet événement',
    backToEvents: 'Retour aux événements',

    // ClubDetail
    follow: 'Suivre',
    following: 'Suivi',
    loading: 'Chargement...',
    nowFollowing: 'Vous suivez maintenant',
    unfollowed: 'Vous ne suivez plus',

    // Clubs Page
    campusClubs: 'Clubs du campus',
    exploreClubs: "Explorez tous les clubs et organisations de l'Université Galatasaray",
    noClubsFound: 'Aucun club trouvé',
    noClubsYet: "Il n'y a pas encore de clubs enregistrés.",
    members: 'membres',
    allClubs: 'Tous les clubs',
    followedClubs: 'Clubs suivis',

    // CreateEvent
    eventTitle: "Titre de l'événement",
    description: 'Description',
    eventDate: "Date et heure de l'événement",
    expectedCapacity: 'Capacité attendue',
    expectedNumberOfParticipants: 'Nombre de participants attendus',
    roomRecommendationsHelp: 'Les recommandations de salle apparaîtront ci-dessous en fonction de cette capacité',
    recommendedRooms: 'Salles recommandées',
    selectRoom: 'Sélectionner une salle (optionnel)',
    selectClub: 'Sélectionner un club',
    location: 'Emplacement',
    creating: 'Création...',
    createEvent: 'Créer un événement',
    eventCreatedSuccess: 'Événement créé avec succès!',
    enterEventTitle: "Entrez le titre de l'événement",
    enterEventDescription: "Entrez la description de l'événement",
    dateAndTime: 'Date et heure',
    club: 'Club',
    maxCapacity: 'Capacité maximale',
    enterExpectedCapacity: 'Entrez la capacité attendue',
    enterMaxCapacity: 'Entrez la capacité maximale',
    theseRoomsRecommended: 'Ces salles sont recommandées en fonction de votre capacité attendue',
    enterLocation: 'Entrez l\'emplacement (auto-rempli si une salle est sélectionnée)',
    imageUrl: 'URL de l\'image (Optionnel)',

    // AdminPanel
    userManagement: 'Gestion des utilisateurs',
    manageAllUsers: 'Gérez tous les utilisateurs du système. Vous pouvez mettre à jour les rôles et supprimer les utilisateurs.',
    filterByRole: 'Filtrer par rôle',
    allRoles: 'Tous les rôles',
    name: 'Nom',
    email: 'E-mail',
    studentNumber: 'Numéro d\'étudiant',
    department: 'Département',
    role: 'Rôle',
    actions: 'Actions',
    noUsersFound: 'Aucun utilisateur trouvé',
    you: '(Vous)',
    deleteUser: 'Supprimer l\'utilisateur',
    cannotDeleteSelf: 'Vous ne pouvez pas supprimer votre propre compte',
    totalUsers: 'Total des utilisateurs',
    areYouSureDelete: 'Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action ne peut pas être annulée.',

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
