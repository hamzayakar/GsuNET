We are developing a fullstack app / website / whatever for my school project. The stuff in the repo and the stuff in here will give you some context as to what we're doing but it's essentially an "otomasyon" kind of website but for school clubs and their event management. INF rapor and INF sunum files will give you more context. 

IMPORTANT:
The frontend will use node.js and the backend FastAPI

Here are the instructions for the BACKEND:

Mert seninki (veritabanı & backend):

Adım 1: Kurulum ve Branch

Projeyi bilgisayarına çek: git clone {repo}

Çok Önemli: Ana dizine girdikten sonra git checkout develop komutuyla geliştirme dalına geç. Tüm işlerini burada yapacaksın.

Adım 2: Docker ile Veritabanını Ayağa Kaldır

Ana dizinde docker-compose up -d komutunu çalıştır.

Neden? Senin PostgreSQL kurmanla uğraşmayacağız. Ben ayarları yaptım; bu komut sana hazır bir Veritabanı (Port: 5432) ve Redis sunucusu verecek.

Adım 3: Backend Projesini Başlat

Ana dizinde backend isminde bir klasör oluştur.

İçinde bir venv (sanal ortam) kur ve FastAPI, Uvicorn, SQLAlchemy, Pydantic kütüphanelerini yükle.

Adım 4: Veritabanı Modelleri (ORM)

Rapordaki analizimize uygun olarak; User, Club, Event tablolarını temsil eden Python sınıflarını (Models) oluştur.

Docker'daki veritabanına bağlanmak için connection string: postgresql://gsu_user:gsu_password@localhost:5432/gsunet_db

Adım 5: Kimlik Doğrulama (Auth API)

/auth/register ve /auth/login endpoint'lerini yaz.

Güvenlik için JWT (JSON Web Token) yapısını kur. Edipcan frontend'den bu token ile istek atacak.

Teslim: İşin bittiğinde backend klasörünü commit'le ve develop branch'ine push'la. http://localhost:8000/docs adresinde Swagger arayüzünün çalıştığını görmeliyiz.

Here are the instructions for the FRONTEND:

Edipcan bu da seninki:

Teknoloji Yığınımız: React (Vite), Tailwind CSS.

Neden Vite + React? Create-React-App artık yavaş kalıyor. Vite ile geliştirme ortamımız çok daha hızlı olacak.

Neden Tailwind CSS? Proje raporumuzda "Mobile-First" (Mobil Öncelikli) mimari taahhüdümüz var. Klasik CSS ile uğraşmak yerine Tailwind'in md:, lg: gibi breakpoint'leriyle mobil uyumlu arayüzü çok hızlı çıkarabiliriz. Bu bir Web App olacak ama telefonda App gibi hissettirmeli.

Adım 1: Kurulum ve Branch

Projeyi çek: git clone {repo}

Çok Önemli: git checkout develop komutuyla geliştirme dalına geç.

Adım 2: Projeyi Oluştur

Ana dizinde frontend isminde bir klasör oluştur.

Bu klasörün içinde Vite kullanarak bir React projesi başlat (npm create vite@latest .).

Tailwind CSS kurulumunu resmi dokümantasyona göre yap.

Adım 3: Routing (Sayfa Yapısı)

react-router-dom kütüphanesini kur.

Şu sayfaların (boş bile olsa) rotalarını ayarla: /login, /register, / (Ana Akış - Feed), /club/:id (Kulüp Detay).

Adım 4: Temel Bileşenler (UI Kit)

Tasarım bütünlüğü için tekrar kullanacağımız bileşenleri kodla:

Navbar: Mobilde ekranın altında (Instagram gibi), masaüstünde üstte olacak.

EventCard: Bir etkinliğin fotoğrafını, tarihini ve adını gösteren kart.

Button: Projenin ana rengine sahip standart buton.

Adım 5: Servis Bağlantısı (Hazırlık)

axios kütüphanesini kur. Backend henüz bitmediği için şu anlık sahte (mock) verilerle arayüzün düzgün göründüğünden emin ol.

Teslim: Kodları frontend klasörü altında develop branch'ine push'la. Tarayıcıyı mobil görünüme aldığımızda menünün ve kartların düzgün görünmesi kritik.

Here's some more stuff as a RECOMMENDATION (so not indispensable) for the backend: 

Mert Gemini örnek olarak şöyle bir şey yazdı rapordan hareketle, sen de incelersin bir, fikir vermesi açısından:

(Rapor Bölüm 7.1'e göre):

1. Users (Kullanıcılar) Tablosu: 

id: Primary Key (UUID veya Integer)

student_number: String (Unique olmalı)

full_name: String

email: String (gsu.edu.tr uzantılı olmalı)

password_hash: String (Şifreler düz metin saklanmayacak!)

role: Enum ('student', 'club_manager', 'admin', 'advisor')

department: String (Bölümü)

2. Clubs (Kulüpler) Tablosu: 

id: Primary Key

name: String (Örn: IEEE GSÜ)

description: Text (Kulüp tanıtımı)

logo_url: String (Resim yolu)

contact_email: String

3. Events (Etkinlikler) Tablosu: 

id: Primary Key

title: String (Etkinlik Adı)

description: Text

date_time: DateTime (Ne zaman?)

location: String (Nerede? Örn: Yiğit Okur Amfisi) * capacity: Integer (Kontenjan sayısı) 

club_id: Foreign Key (Hangi kulüp düzenliyor?)

Here are some more stuff for the backend: 

Mert: 
1. Etkinlik İstek ve Onay Sistemi (Rapor Bölüm 5.11.2):

Event tablosuna status isminde bir sütun ekle. Varsayılan değeri pending (beklemede) olsun.

Etkinlik Oluşturma: POST /events endpoint'i yaz. Kulüp başkanı buradan istek attığında veritabanına pending olarak kaydolacak.

Onaylama: PUT /events/{id}/approve endpoint'i yaz. Bu endpoint'i sadece role değeri advisor (danışman) veya admin olan kullanıcılar tetikleyebilsin. Onaylanınca status -> approved olacak ve ana sayfada görünür hale gelecek.

2. Akıllı Salon Önerisi (Rapor Bölüm 5.11.3):

Rooms (Salonlar) diye basit bir tablo veya JSON dosyası oluştur (Örn: Yiğit Okur - Kapasite: 200, Cep Sineması - Kapasite: 50).

Etkinlik oluşturulurken girilen expected_capacity (beklenen kişi sayısı) değerine bakarak, kapasitesi yeten salonları listeleyen bir GET /rooms/recommend?capacity=100 endpoint'i hazırla. (Basit bir filtreleme mantığı yeterli: if room.capacity >= requested_capacity).


Edipcan:

1. Etkinlik Oluşturma Formu (Rapor Bölüm 5.6.2):

Kulüp yöneticisinin gireceği inputlar: Başlık, Tarih, Açıklama ve Tahmini Katılımcı Sayısı.

Öneri Entegrasyonu: Kullanıcı kişi sayısını girdiğinde, Mert'in hazırladığı /rooms/recommend servisine istek atıp gelen uygun salonları "Dropdown" (açılır menü) içinde listele.

2. Yönetici (Admin/Danışman) Paneli:

Sadece yetkili kullanıcıların görebileceği sade bir sayfa.

pending durumundaki etkinlikleri listeleyecek.

Her satırda "Onayla" (Yeşil) ve "Reddet" (Kırmızı) butonu olacak. Onayla'ya basınca Mert'in onay servisine istek atacak.