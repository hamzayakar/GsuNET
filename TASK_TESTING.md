# TASK: Notification ve Follow/Unfollow Sistemi Test

**Öncelik**: Yüksek
**Tahmini Süre**: 2-3 saat
**Zorluk**: Kolay-Orta
**Tarih**: 2025-12-14

---

## 📋 GENEL BAKIŞ

Eklenen yeni özellikler tam test edilmeli:
1. **Notification Sistemi** (Backend ready, frontend entegrasyonu)
2. **Club Follow/Unfollow** (Backend + frontend eksiksiz)

Bu task'ta sistemi test edip, varsa hataları düzeltecek ve eksik UI özelliklerini tamamlayacaksınız.

---

## 🔔 NOTIFICATION SİSTEMİ TEST

### Backend Test (Postman/Swagger)

#### 1. Notification Oluşturma
Şu an notification oluşturmak için endpoint yok (normal, sistem otomatik oluşturmalı). Test için manual olarak database'e ekleyelim:

**Python Script** (`backend/test_notifications.py`):
```python
import sys
sys.path.append('.')

from app.core.database import SessionLocal
from app.models.notification import Notification, NotificationType
from app.models.user import User

db = SessionLocal()

# Get a test user
user = db.query(User).filter(User.email == "student@gsu.edu.tr").first()

# Create test notifications
notifications = [
    Notification(
        user_id=user.id,
        title="Welcome to GSUNET!",
        message="Welcome to Galatasaray University Event Network.",
        notification_type=NotificationType.CLUB_UPDATE
    ),
    Notification(
        user_id=user.id,
        title="Event Approved",
        message="Your event 'Tech Workshop' has been approved.",
        notification_type=NotificationType.EVENT_APPROVED,
        read=False
    ),
    Notification(
        user_id=user.id,
        title="Event Reminder",
        message="Don't forget: AI Workshop starts tomorrow at 2 PM.",
        notification_type=NotificationType.EVENT_REMINDER,
        read=False
    ),
]

for notif in notifications:
    db.add(notif)

db.commit()
print(f"✅ Created {len(notifications)} test notifications for {user.email}")
db.close()
```

**Çalıştırma**:
```bash
cd backend
source venv/bin/activate
python test_notifications.py
```

#### 2. Backend Endpoint'leri Test Et

**Token Al** (Login):
```bash
POST http://localhost:8000/api/v1/auth/login
{
  "email": "student@gsu.edu.tr",
  "password": "Student123!"
}
```

**GET /notifications** - Tüm bildirimleri al:
```bash
GET http://localhost:8000/api/v1/notifications
Authorization: Bearer {token}

# Beklenen Response:
[
  {
    "id": 1,
    "title": "Welcome to GSUNET!",
    "message": "Welcome to Galatasaray University Event Network.",
    "notification_type": "club_update",
    "read": false,
    "created_at": "2025-12-14T10:00:00Z"
  },
  ...
]
```

**GET /notifications/unread-count** - Okunmamış sayısı:
```bash
GET http://localhost:8000/api/v1/notifications/unread-count
Authorization: Bearer {token}

# Beklenen Response:
{
  "unread_count": 2
}
```

**PUT /notifications/{id}/read** - Okundu işaretle:
```bash
PUT http://localhost:8000/api/v1/notifications/1/read
Authorization: Bearer {token}

# Beklenen Response:
{
  "id": 1,
  "read": true,
  ...
}
```

**PUT /notifications/mark-all-read** - Tümünü okundu işaretle:
```bash
PUT http://localhost:8000/api/v1/notifications/mark-all-read
Authorization: Bearer {token}

# Beklenen Response:
{
  "marked_count": 2
}
```

**DELETE /notifications/{id}** - Bildirimi sil:
```bash
DELETE http://localhost:8000/api/v1/notifications/1
Authorization: Bearer {token}

# Beklenen Response: 204 No Content
```

---

### Frontend Entegrasyonu (Eksik - Eklenecek)

#### 1. Notification Bell Component
**Dosya**: `frontend/src/components/NotificationBell.jsx` (YENİ)

```jsx
import { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.unread_count);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

#### 2. Navbar'a Ekle
**Dosya**: `frontend/src/components/Navbar.jsx`

```jsx
import NotificationBell from './NotificationBell';

// Navbar içinde, login olan kullanıcılar için:
{user && <NotificationBell />}
```

---

## 🔗 FOLLOW/UNFOLLOW SİSTEMİ TEST

### Backend Test (Postman/Swagger)

#### 1. Club Follow
```bash
POST http://localhost:8000/api/v1/clubs/1/follow
Authorization: Bearer {token}

# Beklenen Response:
{
  "message": "Successfully followed the club",
  "club_id": 1
}

# Tekrar denersen:
400 Bad Request - "You are already following this club"
```

#### 2. Club Unfollow
```bash
DELETE http://localhost:8000/api/v1/clubs/1/unfollow
Authorization: Bearer {token}

# Beklenen Response:
{
  "message": "Successfully unfollowed the club",
  "club_id": 1
}

# Tekrar denersen:
400 Bad Request - "You are not following this club"
```

#### 3. Get Followers
```bash
GET http://localhost:8000/api/v1/clubs/1/followers
Authorization: Bearer {token}

# Beklenen Response:
[
  {
    "id": 4,
    "email": "student@gsu.edu.tr",
    "full_name": "Zeynep Kaya",
    "role": "student"
  }
]
```

#### 4. Get My Followed Clubs
```bash
GET http://localhost:8000/api/v1/users/me/followed-clubs
Authorization: Bearer {token}

# Beklenen Response:
[
  {
    "id": 1,
    "name": "Computer Science Club",
    "description": "...",
    "logo_url": null,
    "contact_email": "csclub@gsu.edu.tr"
  }
]
```

---

### Frontend Test (ClubDetail.jsx)

**Dosya**: `frontend/src/pages/ClubDetail.jsx`

Zaten eklendi! Test senaryosu:

1. Student ile login yap
2. /clubs sayfasına git
3. Bir kulübün detayına tıkla
4. "Follow" butonuna tıkla
   - ✅ Toast: "You are now following Computer Science Club!"
   - ✅ Buton "Following" olmalı
   - ✅ Renk gri olmalı
5. "Following" butonuna tıkla
   - ✅ Toast: "You unfollowed Computer Science Club"
   - ✅ Buton tekrar "Follow" olmalı
   - ✅ Renk kırmızı olmalı
6. Backend'e GET /users/me/followed-clubs yap
   - ✅ Takip ettiğin kulüpler listede olmalı

---

## 📝 KONTROL LİSTESİ

### Notification Sistemi
- [ ] Backend test_notifications.py script'i çalıştır
- [ ] Postman ile tüm notification endpoint'lerini test et
- [ ] NotificationBell component'ini oluştur
- [ ] Navbar'a NotificationBell ekle
- [ ] Unread count doğru gösteriliyor mu kontrol et
- [ ] Mark as read çalışıyor mu test et
- [ ] Mark all as read çalışıyor mu test et
- [ ] Delete notification çalışıyor mu test et
- [ ] Toast notification'lar çalışıyor mu kontrol et
- [ ] Responsive tasarım kontrol et (mobile)

### Follow/Unfollow Sistemi
- [ ] Backend follow endpoint'ini test et
- [ ] Backend unfollow endpoint'ini test et
- [ ] Backend followers endpoint'ini test et
- [ ] Backend my-followed-clubs endpoint'ini test et
- [ ] Frontend ClubDetail sayfasında follow butonu çalışıyor mu
- [ ] Toast mesajları doğru mu
- [ ] Buton rengi ve text doğru değişiyor mu
- [ ] State yönetimi doğru çalışıyor mu

---

## 🧪 EDGE CASE TEST SENARYOLARI

### Notification
1. **Okunmamış bildirim yok**: Bell icon üzerinde badge gösterilmemeli
2. **10'dan fazla okunmamış**: "9+" göstermeli
3. **Bildirim yok**: "No notifications" mesajı
4. **Arka arkaya mark as read**: Duplicate request olmamalı
5. **Notification silinince**: Unread count düşmeli (eğer unread ise)

### Follow/Unfollow
1. **Zaten follow edilen kulübü follow et**: 400 error + toast
2. **Follow etmediğin kulübü unfollow et**: 400 error + toast
3. **Hızlı follow/unfollow (double click)**: Loading state ile engellenmeli
4. **Olmayan kulüp ID**: 404 error
5. **Authorization**: Token olmadan 401 error

---

## ⚠️ BİLİNEN SORUNLAR VE ÇÖZÜMLER

### Problem 1: Notification Bell Her Zaman Polling Yapıyor
**Çözüm**: Kullanıcı dropdown'ı açtığında poll'u durdur:
```javascript
useEffect(() => {
  if (!isOpen) {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }
}, [isOpen]);
```

### Problem 2: Follow Butonu Hızlı Tıklamada Duplicate Request
**Çözüm**: Loading state kullanılıyor, disabled prop ekle:
```jsx
<button
  disabled={followLoading}
  onClick={isFollowing ? handleUnfollow : handleFollow}
>
  {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
</button>
```

### Problem 3: Notification Dropdown Dışına Tıklayınca Kapanmıyor
**Çözüm**: useEffect ile click outside listener ekle:
```javascript
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  if (isOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen]);
```

---

## 💡 BONUS ÖZELLİKLER (Opsiyonel)

1. **Real-time Notifications**: WebSocket ile anlık bildirim
2. **Notification Preferences**: Kullanıcı hangi bildirimleri almak istediğini seçebilsin
3. **Notification Groups**: Tip bazında grupla (event, club, etc.)
4. **Sound/Desktop Notification**: Browser notification API
5. **Followed Clubs Page**: Takip edilen kulüplerin listesi ayrı sayfa
6. **Club Follower Count**: ClubCard'da follower sayısı göster

---

**Başarılar!** Test ederken bulduğunuz hataları düzeltin, claude'a soru sorabilirsiniz.

**Tahmini Tamamlanma**: 2-3 saat
