# TASK: Seed Test Data İyileştirmeleri

**Öncelik**: Orta
**Tahmini Süre**: 2-3 saat
**Zorluk**: Orta
**Tarih**: 2025-12-14

---

## 📋 GENEL BAKIŞ

Mevcut `seed_test_users.py` dosyası sadece temel kullanıcılar ve kulüpler oluşturuyor. Gerçekçi bir test ortamı için daha fazla veri gerekiyor.

**Mevcut Durum**:
- ✅ 5 kullanıcı (admin, advisor, 2 club manager, 1 student)
- ✅ 3 kulüp (Computer Science, Robotics, AI & ML)
- ❌ Hiç event yok
- ❌ Hiç event registration yok
- ❌ Hiç room yok
- ❌ Hiç follow relationship yok
- ❌ Hiç notification yok

**Hedef**:
- Gerçekçi event'ler (pending, approved, rejected, completed)
- Event registration'lar (bazı event'lerde katılımcılar)
- Room'lar (kapasite bazlı oda önerisi için)
- Follow relationship'leri (student'lar kulüpleri takip etsin)
- Bildirimler (notification sistemi testi için)

---

## 🎯 EKLENECEKLEr

### 1. Room'lar (Önce)

Room recommendation sistemi için çeşitli kapasitelerde odalar gerekli.

**Eklenecek Room'lar**:
```python
# Küçük odalar (10-30 kişi)
- "D101 - Small Classroom" (capacity: 20)
- "D102 - Study Room" (capacity: 15)
- "D103 - Meeting Room" (capacity: 10)

# Orta odalar (30-100 kişi)
- "D201 - Medium Classroom" (capacity: 50)
- "D202 - Computer Lab" (capacity: 40)
- "D203 - Workshop Room" (capacity: 35)

# Büyük odalar (100-300 kişi)
- "Main Hall" (capacity: 250)
- "Conference Hall" (capacity: 150)
- "Auditorium A" (capacity: 300)

# Çok büyük (300+)
- "Sports Hall" (capacity: 500)
```

---

### 2. Event'ler (Çeşitli Durumlar)

Her durum için event oluşturulmalı.

#### APPROVED Events (4-5 adet)
```python
# 1. Yakın gelecek - Kayıt kabul ediliyor
{
    "title": "Python Workshop for Beginners",
    "description": "Learn Python basics with hands-on projects",
    "event_datetime": datetime.now() + timedelta(days=7),  # 1 hafta sonra
    "location": "D201 - Medium Classroom",
    "expected_capacity": 40,
    "max_capacity": 50,
    "status": EventStatus.APPROVED,
    "club_id": cs_club.id,
    "room_id": medium_room.id,
    "approved_by_id": advisor.id
}

# 2. Uzak gelecek
{
    "title": "AI & Machine Learning Symposium",
    "description": "Guest speakers from industry and academia",
    "event_datetime": datetime.now() + timedelta(days=30),
    "location": "Main Hall",
    "expected_capacity": 200,
    "max_capacity": 250,
    "status": EventStatus.APPROVED,
    "club_id": ai_club.id,
    "room_id": main_hall.id,
    "approved_by_id": advisor.id
}

# 3. Yakın tarih - Neredeyse dolu
{
    "title": "Robotics Competition Preparation",
    "description": "Prepare for the upcoming robotics competition",
    "event_datetime": datetime.now() + timedelta(days=3),
    "location": "D203 - Workshop Room",
    "expected_capacity": 30,
    "max_capacity": 35,
    "status": EventStatus.APPROVED,
    "club_id": robotics_club.id,
    "room_id": workshop_room.id,
    "approved_by_id": advisor.id
}
```

#### PENDING Events (2-3 adet)
```python
# 1. Onay bekleyen
{
    "title": "Web Development Bootcamp",
    "description": "2-day intensive bootcamp on modern web development",
    "event_datetime": datetime.now() + timedelta(days=14),
    "location": "D202 - Computer Lab",
    "expected_capacity": 35,
    "max_capacity": 40,
    "status": EventStatus.PENDING,
    "club_id": cs_club.id,
    "room_id": computer_lab.id
}

# 2. Yakın tarihe onay bekleyen
{
    "title": "Tech Talk: Cloud Computing",
    "description": "Introduction to cloud platforms",
    "event_datetime": datetime.now() + timedelta(days=5),
    "location": "D201 - Medium Classroom",
    "expected_capacity": 45,
    "max_capacity": 50,
    "status": EventStatus.PENDING,
    "club_id": ai_club.id,
    "room_id": medium_room.id
}
```

#### REJECTED Event (1 adet)
```python
{
    "title": "Unauthorized Party Event",
    "description": "This was rejected for policy violations",
    "event_datetime": datetime.now() + timedelta(days=10),
    "location": "Main Hall",
    "expected_capacity": 100,
    "max_capacity": 150,
    "status": EventStatus.REJECTED,
    "rejection_reason": "Event content does not align with university policies. Please submit an academic or professional event.",
    "club_id": cs_club.id,
    "approved_by_id": advisor.id
}
```

#### COMPLETED Event (1 adet)
```python
{
    "title": "Introduction to Programming - Fall 2024",
    "description": "Completed introductory programming workshop",
    "event_datetime": datetime.now() - timedelta(days=30),  # 1 ay önce
    "location": "D201 - Medium Classroom",
    "expected_capacity": 40,
    "max_capacity": 50,
    "status": EventStatus.COMPLETED,
    "club_id": cs_club.id,
    "room_id": medium_room.id,
    "approved_by_id": advisor.id
}
```

---

### 3. Event Registrations

Approved event'lere kayıtlar ekleyelim.

```python
# Python Workshop - 3 kayıt
EventRegistration(user_id=student.id, event_id=python_workshop.id, attended=False)
EventRegistration(user_id=manager2.id, event_id=python_workshop.id, attended=False)
EventRegistration(user_id=advisor.id, event_id=python_workshop.id, attended=False)

# AI Symposium - 5 kayıt
EventRegistration(user_id=student.id, event_id=ai_symposium.id, attended=False)
EventRegistration(user_id=manager1.id, event_id=ai_symposium.id, attended=False)
# ... 3 more

# Completed Event - attended=True
EventRegistration(user_id=student.id, event_id=completed_event.id, attended=True)
EventRegistration(user_id=manager1.id, event_id=completed_event.id, attended=True)
```

---

### 4. Follow Relationships (user_club_association)

Öğrenciler kulüpleri takip etsin.

```python
# Student follows all clubs
student.followed_clubs.append(cs_club)
student.followed_clubs.append(robotics_club)
student.followed_clubs.append(ai_club)

# Manager2 follows CS and AI clubs
manager2.followed_clubs.append(cs_club)
manager2.followed_clubs.append(ai_club)

# Advisor follows all clubs (normal, advisor zaten)
advisor.followed_clubs.append(cs_club)
advisor.followed_clubs.append(robotics_club)
advisor.followed_clubs.append(ai_club)
```

---

### 5. Notifications

Test için birkaç notification oluşturalım.

```python
# Student için
Notification(
    user_id=student.id,
    title="Welcome to GSUNET!",
    message="Welcome to Galatasaray University Event Network. Start exploring events!",
    notification_type=NotificationType.CLUB_UPDATE,
    read=False
)

Notification(
    user_id=student.id,
    title="Event Approved",
    message=f"The event 'Python Workshop for Beginners' has been approved and is now open for registration!",
    notification_type=NotificationType.EVENT_APPROVED,
    read=False
)

Notification(
    user_id=student.id,
    title="Event Reminder",
    message=f"Don't forget: 'Robotics Competition Preparation' starts in 3 days!",
    notification_type=NotificationType.EVENT_REMINDER,
    read=True  # Okunmuş
)

# Club Manager için
Notification(
    user_id=manager1.id,
    title="Event Rejected",
    message=f"Your event 'Unauthorized Party Event' has been rejected. Reason: Event content does not align with university policies.",
    notification_type=NotificationType.EVENT_REJECTED,
    read=False
)
```

---

## 📝 YENİ SEED DOSYASI YAPISI

**Dosya**: `backend/seed_test_users.py`

### Güncellenecek Fonksiyon: `create_test_users()`

```python
def create_test_users():
    """Create comprehensive test data"""
    print("🌱 Seeding database with comprehensive test data...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # 1. Clean existing data
        print("🗑️  Cleaning existing data...")
        db.query(EventRegistration).delete()
        db.query(Notification).delete()
        db.query(Event).delete()
        db.query(Room).delete()
        db.query(Club).delete()
        db.query(User).delete()
        db.commit()

        # 2. Create Users
        print("👥 Creating users...")
        users = create_users(db)

        # 3. Create Rooms (ÖNCE)
        print("🏢 Creating rooms...")
        rooms = create_rooms(db)

        # 4. Create Clubs
        print("📋 Creating clubs...")
        clubs = create_clubs(db, users)

        # 5. Create Events
        print("🎉 Creating events...")
        events = create_events(db, clubs, rooms, users)

        # 6. Create Event Registrations
        print("✅ Creating event registrations...")
        create_registrations(db, events, users)

        # 7. Create Follow Relationships
        print("🔗 Creating follow relationships...")
        create_follows(db, clubs, users)

        # 8. Create Notifications
        print("🔔 Creating notifications...")
        create_notifications(db, users, events)

        # 9. Create TEST_CREDENTIALS.md
        create_credentials_file(users, clubs)

        print("\n✨ Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"  - Users: {len(users)}")
        print(f"  - Clubs: {len(clubs)}")
        print(f"  - Rooms: {len(rooms)}")
        print(f"  - Events: {len(events)}")
        print(f"  - Registrations: {db.query(EventRegistration).count()}")
        print(f"  - Notifications: {db.query(Notification).count()}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()
```

### Yeni Yardımcı Fonksiyonlar

```python
def create_users(db):
    """Create test users"""
    users_data = [
        # ... (mevcut users_data)
    ]

    users = {}
    for user_data in users_data:
        password = user_data.pop("password")
        user = User(**user_data, password_hash=hash_password(password))
        db.add(user)
        users[user.email] = user

    db.commit()
    return users


def create_rooms(db):
    """Create test rooms with various capacities"""
    rooms_data = [
        {"name": "D101 - Small Classroom", "capacity": 20, "location": "D Block - 1st Floor", "is_available": True},
        {"name": "D102 - Study Room", "capacity": 15, "location": "D Block - 1st Floor", "is_available": True},
        {"name": "D103 - Meeting Room", "capacity": 10, "location": "D Block - 1st Floor", "is_available": True},
        {"name": "D201 - Medium Classroom", "capacity": 50, "location": "D Block - 2nd Floor", "is_available": True},
        {"name": "D202 - Computer Lab", "capacity": 40, "location": "D Block - 2nd Floor", "is_available": True},
        {"name": "D203 - Workshop Room", "capacity": 35, "location": "D Block - 2nd Floor", "is_available": True},
        {"name": "Main Hall", "capacity": 250, "location": "Main Building", "is_available": True},
        {"name": "Conference Hall", "capacity": 150, "location": "Main Building", "is_available": True},
        {"name": "Auditorium A", "capacity": 300, "location": "Auditorium Complex", "is_available": True},
        {"name": "Sports Hall", "capacity": 500, "location": "Sports Complex", "is_available": True},
    ]

    rooms = {}
    for room_data in rooms_data:
        room = Room(**room_data)
        db.add(room)
        rooms[room_data["name"]] = room

    db.commit()
    return rooms


def create_clubs(db, users):
    """Create test clubs"""
    # ... (mevcut club creation)
    # Manager ve advisor assignment
    pass


def create_events(db, clubs, rooms, users):
    """Create test events with various statuses"""
    from datetime import datetime, timedelta

    events_data = [
        # APPROVED events
        {
            "title": "Python Workshop for Beginners",
            "description": "Learn Python basics with hands-on projects...",
            # ... (yukarıdaki event'ler)
        },
        # PENDING events
        # REJECTED event
        # COMPLETED event
    ]

    events = []
    for event_data in events_data:
        event = Event(**event_data)
        db.add(event)
        events.append(event)

    db.commit()
    return events


def create_registrations(db, events, users):
    """Create event registrations"""
    # Find specific events
    python_workshop = next(e for e in events if "Python" in e.title)

    registrations = [
        EventRegistration(user_id=users["student@gsu.edu.tr"].id, event_id=python_workshop.id),
        # ... more
    ]

    for reg in registrations:
        db.add(reg)

    db.commit()


def create_follows(db, clubs, users):
    """Create follow relationships"""
    student = users["student@gsu.edu.tr"]

    for club in clubs.values():
        student.followed_clubs.append(club)

    db.commit()


def create_notifications(db, users, events):
    """Create test notifications"""
    notifications = [
        # ... (yukarıdaki notification'lar)
    ]

    for notif in notifications:
        db.add(notif)

    db.commit()
```

---

## 📋 KONTROL LİSTESİ

### Kod Yazma
- [ ] `seed_test_users.py` dosyasını aç
- [ ] `create_rooms()` fonksiyonunu ekle
- [ ] `create_events()` fonksiyonunu ekle (4 approved, 2 pending, 1 rejected, 1 completed)
- [ ] `create_registrations()` fonksiyonunu ekle
- [ ] `create_follows()` fonksiyonunu ekle
- [ ] `create_notifications()` fonksiyonunu ekle
- [ ] `create_test_users()` fonksiyonunu güncelle (orchestration)
- [ ] Import'ları kontrol et (datetime, timedelta, EventStatus, etc.)

### Test
- [ ] Database'i sıfırla: `docker-compose down -v && docker-compose up -d`
- [ ] Script'i çalıştır: `python seed_test_users.py`
- [ ] Hata var mı kontrol et
- [ ] TEST_CREDENTIALS.md oluştu mu kontrol et
- [ ] Database'de veriler var mı kontrol et (PgAdmin)

### Doğrulama
- [ ] PgAdmin'de users tablosu: 5 user
- [ ] rooms tablosu: 10 room
- [ ] clubs tablosu: 3 club
- [ ] events tablosu: 8-9 event (approved, pending, rejected, completed)
- [ ] event_registrations tablosu: 10+ kayıt
- [ ] user_club_association tablosu: Follow'lar var
- [ ] notifications tablosu: 5+ notification

### Frontend Test
- [ ] Backend + Frontend başlat
- [ ] Home sayfası: Approved event'ler görünüyor mu
- [ ] Event detail: Registration çalışıyor mu
- [ ] Clubs: Follow butonu çalışıyor mu
- [ ] Notification bell: Bildirimler geliyor mu
- [ ] CreateEvent: Room önerileri geliyor mu

---

## 🧪 TEST SENARYOLARI

### 1. Room Recommendation Test
1. Club manager ile login yap
2. Create Event sayfasına git
3. Expected Capacity: 18 gir
4. Oda önerileri: D101 (20), D102 (15) görmemeli, D201 (50) görmeli
5. Expected Capacity: 45 gir
6. Oda önerileri: D201 (50), Conference Hall (150) görmeli

### 2. Event Status Test
1. Home sayfasında "All Events" → 8-9 event
2. "Approved" filtresi → 4-5 event
3. "Pending" filtresi → 2-3 event
4. "Completed" filtresi → 1 event
5. Rejected event homepage'de görünmemeli

### 3. Registration Test
1. Student ile login yap
2. Python Workshop'a tıkla
3. Zaten kayıtlı olmalı (seed'de eklendi)
4. "Unregister" butonu görünmeli
5. AI Symposium'a tıkla
6. "Register" butonu görünmeli

### 4. Follow Test
1. Student ile login yap
2. Computer Science Club'a git
3. Already following olmalı (seed'de eklendi)
4. "Following" butonu görünmeli

### 5. Notification Test
1. Student ile login yap
2. Notification bell: 2-3 unread
3. Dropdown aç → Bildirimler görünmeli
4. Mark as read → Unread count azalmalı

---

## ⚠️ DİKKAT EDİLMESİ GEREKENLER

1. **Tarih Formatı**: `datetime.now()` yerine `datetime.now(timezone.utc)` kullan
2. **Foreign Key Sırası**: Room → Club → Event → Registration order'ı önemli
3. **Cascade Delete**: Seed'den önce tüm tabloları temizle (FK constraint)
4. **Capacity Logic**: `expected_capacity <= max_capacity` olmalı
5. **Event Status**: PENDING event'lerde `approved_by_id` NULL olmalı
6. **Rejection Reason**: Sadece REJECTED event'lerde `rejection_reason` olmalı

---

## 💡 BONUS ÖZELLİKLER (Opsiyonel)

1. **Daha Fazla Kullanıcı**: 10-15 student ekle (realistic participation)
2. **Image URL'leri**: Event ve Club için placeholder image'lar
3. **Department Variety**: Farklı bölümlerden kullanıcılar
4. **Event Series**: Aynı kulübün birden fazla event'i
5. **Full Capacity Events**: Max capacity'ye ulaşmış event'ler

---

## 📊 BEKLENEN SONUÇ

**Database İçeriği**:
```
Users:              5
Clubs:              3
Rooms:             10
Events:           8-9 (4 approved, 2 pending, 1 rejected, 1 completed)
Registrations:   10-15
Follows:          5-10
Notifications:    5-8
```

**Frontend Görünüm**:
- Home: 4-5 approved event kartı
- Approval Panel: 2-3 pending event
- Event Detail: Bazılarında "Already Registered" durumu
- Club Detail: Bazılarında "Following" durumu
- Notification Bell: Unread badge

---

**Başarılar!** Seed data tamamlanınca sistem gerçekçi test edilebilir hale gelecek!

**Tahmini Tamamlanma**: 2-3 saat
