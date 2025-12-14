# TASK: Eksik Çevirilerin Tamamlanması

**Öncelik**: Orta
**Tahmini Süre**: 1-2 saat
**Zorluk**: Kolay
**Tarih**: 2025-12-14

---

## 📋 GENEL BAKIŞ

Projede multi-language desteği var (TR/EN/FR) ancak bazı yerler hala hard-coded İngilizce. Tüm metinler LanguageContext üzerinden çevrilmeli.

**Mevcut Durum**:
- ✅ Navbar çevrilmiş
- ✅ Auth sayfaları (Login/Register) çevrilmiş
- ✅ Home sayfası filtre butonları kısmen çevrilmiş
- ❌ EventDetail sayfası tam çevrilmemiş
- ❌ ClubDetail sayfası tam çevrilmemiş
- ❌ CreateEvent sayfası tam çevrilmemiş
- ❌ EventCard component çevrilmemiş
- ❌ Toast mesajları çevrilmemiş

---

## 🌍 EKSİK ÇEVİRİLER

### 1. EventCard Component
**Dosya**: `frontend/src/components/EventCard.jsx`

**Eksik**: Satır 91
```jsx
View Details
```

**Çözüm**: LanguageContext kullan
```jsx
{t('viewDetails')}
```

---

### 2. Home Page (Filter Butonları)
**Dosya**: `frontend/src/pages/Home.jsx`

**Eksik**: Satır 50, 60, 70, 80
```jsx
All Events
Approved
Pending
Completed
```

**Not**: `approved`, `pending`, `completed` zaten var LanguageContext'te ama kullanılmıyor!

**Çözüm**:
```jsx
{t('allEvents')}
{t('approved')}
{t('pending')}
{t('completed')}
```

---

### 3. EventDetail Page
**Dosya**: `frontend/src/pages/EventDetail.jsx`

#### Eksik Çeviriler:

**Satır 56** (Toast):
```jsx
toast.success('Successfully registered for the event!');
```

**Satır 70** (Toast):
```jsx
toast.success('Successfully unregistered from the event');
```

**Satır 272** (Buton):
```jsx
{registering ? 'Registering...' : 'Register for Event'}
```

**Satır 282** (Buton):
```jsx
{registering ? 'Processing...' : 'Unregister'}
```

---

### 4. ClubDetail Page
**Dosya**: `frontend/src/pages/ClubDetail.jsx`

#### Eksik Çeviriler:

**Satır 61** (Toast):
```jsx
toast.success(`You are now following ${club.name}!`);
```

**Satır 75** (Toast):
```jsx
toast.success(`You unfollowed ${club.name}`);
```

**Satır 132** (Buton):
```jsx
{followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
```

---

### 5. CreateEvent Page
**Dosya**: `frontend/src/pages/CreateEvent.jsx`

#### Eksik Çeviriler:

**Satır 143** (Label):
```jsx
Event Title *
```

**Satır 160** (Label):
```jsx
Description
```

**Satır 229** (Help Text):
```jsx
Room recommendations will appear below based on this capacity
```

**Satır 256** (Label):
```jsx
Recommended Rooms
```

**Satır 265** (Select Option):
```jsx
Select a room (optional)
```

**Satır 281** (Label):
```jsx
Location
```

**Satır 317** (Buton):
```jsx
{loading ? 'Creating...' : 'Create Event'}
```

---

## 🔧 ÇÖZÜM: LanguageContext'e Eklenecek Çeviriler

**Dosya**: `frontend/src/context/LanguageContext.jsx`

### Eklenecek Translation Keys:

```javascript
const translations = {
  en: {
    // ... existing translations ...

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
  },

  tr: {
    // ... existing translations ...

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
  },

  fr: {
    // ... existing translations ...

    // EventCard
    viewDetails: 'Voir les détails',

    // EventDetail
    registerForEvent: "S'inscrire à l'événement",
    unregister: "Se désinscrire",
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
  },
};
```

---

## 📝 DOSYA BAZLI GÜNCELLEMELER

### 1. EventCard.jsx

**Değişiklik**:
```jsx
// Import ekle
import { useLanguage } from '../context/LanguageContext';

// Component içinde
const { t } = useLanguage();

// Satır 91
- View Details
+ {t('viewDetails')}
```

---

### 2. Home.jsx

**Değişiklik** (zaten `t` import edilmiş):
```jsx
// Satır 50
- All Events
+ {t('allEvents')}

// Satır 60
- Approved
+ {t('approved')}

// Satır 70
- Pending
+ {t('pending')}

// Satır 80
- Completed
+ {t('completed')}
```

---

### 3. EventDetail.jsx

**Değişiklik**:
```jsx
// Import ekle
import { useLanguage } from '../context/LanguageContext';

// Component içinde
const { t } = useLanguage();

// Toast mesajları
toast.success(t('successfullyRegistered'));
toast.success(t('successfullyUnregistered'));

// Butonlar
{registering ? t('registering') : t('registerForEvent')}
{registering ? t('processing') : t('unregister')}
```

---

### 4. ClubDetail.jsx

**Değişiklik**:
```jsx
// Import ekle
import { useLanguage } from '../context/LanguageContext';

// Component içinde
const { t } = useLanguage();

// Toast mesajları
toast.success(`${t('nowFollowing')} ${club.name}!`);
toast.success(`${t('unfollowed')} ${club.name}`);

// Buton
{followLoading ? t('loading') : isFollowing ? t('following') : t('follow')}
```

---

### 5. CreateEvent.jsx

**Not**: Bu dosyada `t` zaten import edilmiş (satır 130'da kullanılmış).

**Değişiklik**:
```jsx
// Satır 143
- Event Title *
+ {t('eventTitle')} *

// Satır 160
- Description
+ {t('description')}

// Satır 229
- Room recommendations will appear below based on this capacity
+ {t('roomRecommendationsHelp')}

// Satır 256
- Recommended Rooms
+ {t('recommendedRooms')}

// Satır 265
- Select a room (optional)
+ {t('selectRoom')}

// Satır 281
- Location
+ {t('location')}

// Satır 317
- {loading ? 'Creating...' : 'Create Event'}
+ {loading ? t('creating') : t('createEvent')}
```

**Not**: `t('createEvent')` zaten LanguageContext'te var!

---

## 📋 KONTROL LİSTESİ

### LanguageContext Güncellemesi
- [ ] `frontend/src/context/LanguageContext.jsx` dosyasını aç
- [ ] Yukarıdaki tüm translation key'leri ekle (en, tr, fr)
- [ ] Dosyayı kaydet

### Component Güncellemeleri
- [ ] `EventCard.jsx` - useLanguage import + t kullan
- [ ] `Home.jsx` - Filter butonlarında t kullan
- [ ] `EventDetail.jsx` - useLanguage import + tüm hard-coded metinleri çevir
- [ ] `ClubDetail.jsx` - useLanguage import + tüm hard-coded metinleri çevir
- [ ] `CreateEvent.jsx` - Mevcut t'yi tüm metinlerde kullan

### Test
- [ ] Tarayıcıda siteyi aç
- [ ] Dil seçiciyi TR'ye çevir → Tüm metinler Türkçe olmalı
- [ ] Dil seçiciyi EN'ye çevir → Tüm metinler İngilizce olmalı
- [ ] Dil seçiciyi FR'ye çevir → Tüm metinler Fransızca olmalı
- [ ] Her sayfayı kontrol et (Home, EventDetail, ClubDetail, CreateEvent)
- [ ] Toast mesajlarını kontrol et (register, follow, etc.)
- [ ] Console'da hata yok mu kontrol et

---

## 🧪 TEST SENARYOLARI

### 1. EventCard Testi
1. Home sayfasına git
2. Dil: TR → "Detayları Gör" görmeli
3. Dil: EN → "View Details" görmeli
4. Dil: FR → "Voir les détails" görmeli

### 2. EventDetail Testi
1. Bir etkinliğe tıkla
2. Dil: TR → "Etkinliğe Kayıt Ol" butonu
3. Kayıt ol → Toast: "Etkinliğe başarıyla kayıt oldunuz!"
4. Dil: EN → "Register for Event" butonu
5. Kaydı iptal et → Toast: "Successfully unregistered from the event"

### 3. ClubDetail Testi
1. Clubs sayfasına git
2. Bir kulübe tıkla
3. Dil: TR → "Takip Et" butonu
4. Follow et → Toast: "Artık takip ediyorsunuz: Computer Science Club!"
5. Dil: EN → "Follow" butonu
6. Unfollow et → Toast: "You unfollowed Computer Science Club"

### 4. CreateEvent Testi
1. Club manager ile login yap
2. Create Event sayfasına git
3. Dil: TR → "Etkinlik Başlığı", "Açıklama", etc.
4. Dil: EN → "Event Title", "Description", etc.
5. Kapasite gir → Help text: "Room recommendations will appear below based on this capacity"

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

1. **Dinamik Metinler**: Club/event adları çevrilmez, sadece sistem metinleri çevrilir
   ```jsx
   // ✅ Doğru
   toast.success(`${t('nowFollowing')} ${club.name}!`);

   // ❌ Yanlış
   toast.success(t('nowFollowingClub')); // club adı kaybolur
   ```

2. **Mevcut Key'leri Kullan**: LanguageContext'te zaten var olanları kullan
   ```jsx
   // ✅ Doğru - Zaten var
   {t('createEvent')}

   // ❌ Yanlış - Gereksiz yeni key
   {t('createEventButton')}
   ```

3. **Fallback**: Key bulunamazsa kendisi döner
   ```jsx
   t('nonExistentKey') // Returns: 'nonExistentKey'
   ```

4. **İmla Kontrol**: Çevirileri eklerken Türkçe karakterlere dikkat
   ```jsx
   // ✅ Doğru
   eventTitle: 'Etkinlik Başlığı'

   // ❌ Yanlış
   eventTitle: 'Etkinlik Basligi' // ş yerine s
   ```

---

## 💡 BONUS İYİLEŞTİRMELER (Opsiyonel)

1. **Role Çevirileri**: ApprovalPanel'de role'ler gösteriliyorsa çevir
2. **Error Messages**: Backend'den gelen error mesajları frontend'de çevrilebilir
3. **Date Formatting**: Tarih formatlarını dile göre değiştir
   ```javascript
   new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'fr' ? 'fr-FR' : 'en-US')
   ```
4. **Number Formatting**: Sayıları dile göre formatla (1.000 vs 1,000)

---

## 📊 TAMAMLANMA TAKİBİ

| Dosya | Satır Sayısı | Durum |
|-------|-------------|-------|
| LanguageContext.jsx | ~50 key | ⬜ |
| EventCard.jsx | 1 | ⬜ |
| Home.jsx | 4 | ⬜ |
| EventDetail.jsx | 4 | ⬜ |
| ClubDetail.jsx | 3 | ⬜ |
| CreateEvent.jsx | 7 | ⬜ |

**Toplam**: ~69 çeviri eklenmeli/güncellenmeli

---

**Başarılar!** Çeviriler eklenince proje tam multi-language olacak!

**Tahmini Tamamlanma**: 1-2 saat
