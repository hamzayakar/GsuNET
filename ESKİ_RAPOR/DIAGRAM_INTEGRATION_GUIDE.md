# UML Diyagramları - LaTeX Entegrasyon Rehberi

**Tarih**: 2025-12-19
**Hedef**: IEEE SDD bölümüne 8 UML diyagramı eklemek

---

## 1. DOSYA İSİMLENDİRMESİ

Mermaid Live'dan export ettiğiniz PNG dosyalarını şu isimlerle kaydedin:

```
1. class_diagram.png                    (Class Diagram - Database Models)
2. sequence_event_creation.png          (Sequence - Event Creation & Approval)
3. sequence_event_registration.png      (Sequence - Student Registration)
4. component_diagram.png                (Component - System Architecture)
5. use_case_diagram.png                 (Use Case - User Roles)
6. activity_event_lifecycle.png         (Activity - Event Lifecycle States)
7. deployment_diagram.png               (Deployment - Docker Infrastructure)
8. sequence_ai_matching.png             (Sequence - AI Sponsor Matching)
```

---

## 2. DOSYA KONUMU

Dosyaları şu klasöre koyun:

```
/workspace/GsuNET/ESKİ_RAPOR/images/
```

Eğer `images/` klasörü yoksa oluşturun:

```bash
mkdir -p /workspace/GsuNET/ESKİ_RAPOR/images
```

Alternatif olarak, LaTeX dosyası ile aynı dizine koyabilirsiniz, ama `images/` daha düzenli.

---

## 3. LATEX KODU

UPDATED_final_rapor.tex dosyasına aşağıdaki kodları ekleyin.

### 3.1. Component Diagram (Mimari Tasarım'a ekle)

**Konum**: Line 2425 civarı (Mimari Tasarım bölümünün sonuna)

```latex
\subsection{Bileşen Diyagramı (Component Diagram)}

Şekil~\ref{fig:component_diagram} GSUNET'in 3-tier architecture yapısını ve sistem bileşenleri arasındaki ilişkileri göstermektedir. Client Layer (React), Backend Layer (FastAPI), Database Layer (PostgreSQL) ve Cache/Queue Layer (Redis+ARQ) arasındaki veri akışı ve bağımlılıklar detaylandırılmıştır.

\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{images/component_diagram.png}
\caption{GSUNET Component Diagram - Sistem Bileşenleri ve İlişkileri}
\label{fig:component_diagram}
\end{figure}

\textbf{Bileşen Açıklamaları:}

\begin{itemize}
    \item \textbf{Frontend Layer}: React 19 SPA, React Router (sayfa yönetimi), AuthContext/LanguageContext (global state), Axios API Service (HTTP client)
    \item \textbf{Backend Layer}: FastAPI routes (7 modül: auth, events, clubs, rooms, schedule, notifications, users), Core services (security, config, dependencies - RBAC), SQLAlchemy ORM models
    \item \textbf{Database Layer}: PostgreSQL 15 (10 tablo), Alembic (migration versioning)
    \item \textbf{Cache/Queue Layer}: Redis 8.4 (cache + message queue), ARQ worker (background tasks + cron jobs)
    \item \textbf{External Services}: OpenAI API (AI sponsor matching - future integration)
\end{itemize}

\textbf{İletişim Protokolleri:}
\begin{itemize}
    \item Frontend $\leftrightarrow$ Backend: HTTP/REST (JSON), JWT authentication
    \item Backend $\leftrightarrow$ Database: SQLAlchemy ORM (async queries)
    \item Backend $\rightarrow$ Redis: Task enqueue (ARQ client)
    \item ARQ Worker $\leftrightarrow$ Redis: Job consumption (Redis streams)
    \item ARQ Worker $\rightarrow$ Database: Notification writes (async)
\end{itemize}
```

---

### 3.2. Class Diagram (Veri Tasarımı'na ekle)

**Konum**: Line 2475 civarı (Veri Tasarımı bölümünün sonuna, Redis açıklamasından sonra)

```latex
\subsection{Class Diagram (Sınıf Diyagramı)}

Şekil~\ref{fig:class_diagram} GSUNET'in veritabanı modellerini ve aralarındaki ilişkileri UML Class Diagram formatında göstermektedir. 10 ana tablo, attributes, relationships ve multiplicity detayları görselleştirilmiştir.

\begin{figure}[H]
\centering
\includegraphics[width=0.98\textwidth]{images/class_diagram.png}
\caption{GSUNET Database Class Diagram - 10 Tablo ve İlişkileri}
\label{fig:class_diagram}
\end{figure}

\textbf{İlişki Tipleri:}

\begin{itemize}
    \item \textbf{User $\rightarrow$ Club}: 1:N (bir kullanıcı birden fazla kulüp yönetebilir/danışmanlık yapabilir)
    \item \textbf{Club $\rightarrow$ Event}: 1:N CASCADE (bir kulüp birden fazla etkinlik düzenler, kulüp silinirse etkinlikler de silinir)
    \item \textbf{User $\leftrightarrow$ Event}: M:N via EventRegistration (bir öğrenci birden fazla etkinliğe kayıt olabilir, bir etkinliğe birden fazla öğrenci kayıt olabilir)
    \item \textbf{Event $\rightarrow$ Room}: N:1 (birden fazla etkinlik aynı odayı farklı zamanlarda kullanabilir)
    \item \textbf{Room $\rightarrow$ RoomSchedule}: 1:N (bir odanın haftalık ders programı birden fazla time slot içerir)
    \item \textbf{User $\rightarrow$ Notification}: 1:N CASCADE (bir kullanıcının birden fazla bildirimi olabilir)
    \item \textbf{User/Club $\rightarrow$ ClubJoinRequest}: N:1 UNIQUE (bir kullanıcı bir kulübe sadece bir kez başvurabilir)
\end{itemize}

\textbf{Cascade Behavior}:
\begin{itemize}
    \item User silinirse: EventRegistrations, Notifications, ClubJoinRequests silinir
    \item Club silinirse: Events, Sponsorships, ClubJoinRequests silinir
    \item Event silinirse: EventRegistrations, RoomSchedules, related Notifications silinir
    \item Room silinirse: Event foreign keys SET NULL olur (room\_id = null)
\end{itemize}
```

---

### 3.3. Sequence Diagrams (Yeni bölüm ekle)

**Konum**: Line 2476 civarı (Class Diagram'dan sonra, "Kullanıcı Arayüzleri" bölümünden ÖNCE)

```latex
\section{Davranışsal Tasarım (Behavioral Design)}

Bu bölümde sistemin dinamik davranışları UML Sequence Diagram ve Activity Diagram kullanılarak gösterilmektedir. Sequence diyagramları, kullanıcı etkileşimlerinin sistem bileşenleri arasında nasıl akışa dönüştüğünü adım adım gösterir.

\subsection{Sequence Diagram: Etkinlik Oluşturma ve Onay Süreci}

Şekil~\ref{fig:sequence_event_creation} bir kulüp yöneticisinin etkinlik oluşturma sürecini, backend validation'ı, database işlemlerini, background notification task'ını ve danışman onay akışını göstermektedir.

\begin{figure}[H]
\centering
\includegraphics[width=0.98\textwidth]{images/sequence_event_creation.png}
\caption{Event Creation \& Approval Sequence Diagram}
\label{fig:sequence_event_creation}
\end{figure}

\textbf{Akış Adımları:}

\begin{enumerate}
    \item \textbf{Event Creation (Club Manager):}
    \begin{itemize}
        \item Club Manager frontend'de event form'unu doldurur (title, description, date, capacity, room)
        \item Frontend \texttt{POST /api/v1/events} endpoint'ine JWT token ile istek gönderir
    \end{itemize}

    \item \textbf{Backend Validation:}
    \begin{itemize}
        \item FastAPI JWT token'ı validate eder, kullanıcı rolünü kontrol eder (club\_manager olmalı)
        \item Database'den kullanıcının club ownership'ini doğrular
        \item Room availability kontrolü: Aynı oda aynı tarih/saat'te başka bir event var mı? (overlap detection)
    \end{itemize}

    \item \textbf{Database Write:}
    \begin{itemize}
        \item Event PENDING status ile PostgreSQL'e yazılır
        \item Event ID generate edilir (örn: 123)
    \end{itemize}

    \item \textbf{Background Notification:}
    \begin{itemize}
        \item Backend Redis queue'ya \texttt{notify\_advisor} task'ını enqueue eder
        \item ARQ worker background'da bu task'ı consume eder
        \item Worker advisor bilgilerini database'den çeker, Notification tablosuna (type=event\_pending) yeni kayıt ekler
    \end{itemize}

    \item \textbf{Approval Flow (Advisor):}
    \begin{itemize}
        \item Advisor Approval Panel sayfasını açar
        \item Frontend \texttt{GET /api/v1/events?status=pending} ile pending event'leri getirir
        \item Advisor "Approve" butonuna tıklar
        \item Frontend \texttt{PUT /api/v1/events/123/approve} endpoint'ine action=approve ile istek gönderir
        \item Backend event status'ü APPROVED yapar, approved\_by\_id set eder
        \item Club manager'a notification gönderilir (type=event\_approved)
    \end{itemize}

    \item \textbf{Visibility:}
    \begin{itemize}
        \item Approved event artık \texttt{GET /api/v1/events?status=approved} endpoint'inde görünür
        \item Home page'de tüm öğrenciler bu event'i görebilir
    \end{itemize}
\end{enumerate}

\subsection{Sequence Diagram: Etkinliğe Kayıt Olma}

Şekil~\ref{fig:sequence_event_registration} bir öğrencinin etkinliğe kayıt olma sürecini, duplicate check, capacity validation ve notification oluşturma akışını göstermektedir.

\begin{figure}[H]
\centering
\includegraphics[width=0.98\textwidth]{images/sequence_event_registration.png}
\caption{Event Registration Sequence Diagram}
\label{fig:sequence_event_registration}
\end{figure}

\textbf{Akış Adımları:}

\begin{enumerate}
    \item Student Home page'de approved event listesini görüntüler (\texttt{GET /api/v1/events?status=approved})
    \item Event card'a tıklar → EventDetail sayfasına yönlendirilir (\texttt{GET /api/v1/events/\{id\}})
    \item "Register for Event" butonuna tıklar → \texttt{POST /api/v1/events/\{id\}/register}
    \item Backend JWT validate eder, user\_id extract eder
    \item \textbf{Duplicate Check:} EventRegistration tablosunda (user\_id, event\_id) pair'i var mı kontrol edilir
    \begin{itemize}
        \item Eğer varsa → 400 Bad Request ("Already registered")
        \item Eğer yoksa → devam
    \end{itemize}
    \item \textbf{Capacity Check:} Event'in current registration count < max\_capacity kontrolü
    \begin{itemize}
        \item Eğer event full → 400 Bad Request ("Event is full")
        \item Eğer kapasite var → devam
    \end{itemize}
    \item EventRegistration tablosuna yeni kayıt INSERT edilir
    \item Redis queue'ya notification task enqueue edilir (type=registration\_success)
    \item Frontend 201 Created response alır → Toast notification gösterir: "Registered successfully"
\end{enumerate}

\subsection{Sequence Diagram: AI Sponsor Matching}

Şekil~\ref{fig:sequence_ai_matching} sponsor manifestosu ile kulüplerin AI destekli eşleştirilmesi sürecini, 3-tier fall-back mekanizmasını (Keyword/Vector/Semantic) ve cache stratejisini göstermektedir.

\begin{figure}[H]
\centering
\includegraphics[width=0.98\textwidth]{images/sequence_ai_matching.png}
\caption{AI-Powered Sponsor Matching Sequence Diagram}
\label{fig:sequence_ai_matching}
\end{figure}

\textbf{Akış Adımları:}

\begin{enumerate}
    \item Sponsor manifesto form'unu doldurur (company values, budget, target audience, sponsorship preferences)
    \item Frontend \texttt{POST /api/sponsors/match} endpoint'ine manifesto text'ini gönderir
    \item Backend manifesto hash'ini oluşturur, Redis cache'de arar
    \begin{itemize}
        \item \textbf{Cache Hit:} Daha önce aynı manifesto için matching yapılmışsa cached results döndürülür (< 10ms latency)
        \item \textbf{Cache Miss:} Yeni matching işlemi başlar
    \end{itemize}
    \item Backend database'den tüm active club'ları çeker (name, description, category, event history)
    \item \textbf{Data Richness Check:}
    \begin{itemize}
        \item \textbf{Tier 3 (Rich Data):} Club'ın 20+ event geçmişi varsa → Full AI semantic matching (GPT-4o-mini veya Gemma 7B)
        \item \textbf{Tier 2 (Moderate Data):} 5-10 event geçmişi varsa → Vector similarity (OpenAI Embeddings API + cosine similarity)
        \item \textbf{Tier 1 (Minimal Data):} < 5 event veya yeni club → Keyword matching (TF-IDF) + category filtering
    \end{itemize}
    \item Matching sonuçları 0-100 arası score ile sıralanır, top 10 club seçilir
    \item Sonuçlar Redis'e cache'lenir (TTL: 1 hour)
    \item Frontend ranked club listesini alır (club name, score, reasoning)
    \item Sponsor "Contact Club" butonuna tıklar → Sponsorship request oluşturulur (status=pending)
    \item Club manager'a notification gönderilir (type=sponsorship\_request)
\end{enumerate}

\subsection{Activity Diagram: Event Lifecycle}

Şekil~\ref{fig:activity_event_lifecycle} bir etkinliğin yaşam döngüsünü (Draft → Pending → Approved → Registration → Completed) state transition formatında göstermektedir.

\begin{figure}[H]
\centering
\includegraphics[width=0.7\textwidth]{images/activity_event_lifecycle.png}
\caption{Event Lifecycle Activity Diagram (State Transitions)}
\label{fig:activity_event_lifecycle}
\end{figure}

\textbf{State Açıklamaları:}

\begin{itemize}
    \item \textbf{Draft:} Club Manager event oluşturmaya başlar (henüz submit edilmemiş)
    \item \textbf{Pending:} Submit edilmiş, advisor onayı bekliyor
    \item \textbf{Approved:} Advisor onayladı, öğrencilere görünür
    \item \textbf{Rejected:} Advisor reddetti (rejection\_reason ile), event archived
    \item \textbf{OpenForRegistration:} Kayıt açık, öğrenciler register olabilir
    \item \textbf{RegistrationClosed:} Kapasite doldu veya deadline geçti
    \item \textbf{Ongoing:} Event tarihi geldi, event şu an gerçekleşiyor
    \item \textbf{Completed:} Event bitti, archived
    \item \textbf{Cancelled:} Club Manager iptal etti, ARQ worker tüm registered users'a notification gönderir
\end{itemize}
```

---

### 3.4. Use Case Diagram (Yeni bölüm ekle)

**Konum**: "Davranışsal Tasarım" bölümünün devamı

```latex
\subsection{Use Case Diagram: Kullanıcı Rolleri ve Yetkiler}

Şekil~\ref{fig:use_case_diagram} GSUNET'teki 4 kullanıcı rolünün (Student, Club Manager, Advisor, Admin) sistem üzerinde gerçekleştirebileceği use case'leri göstermektedir. Her rol, kendinden önceki rolün tüm yetkilerine sahiptir (role hierarchy).

\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{images/use_case_diagram.png}
\caption{Use Case Diagram - User Roles and Permissions}
\label{fig:use_case_diagram}
\end{figure}

\textbf{Role Hierarchy ve Yetkiler:}

\begin{itemize}
    \item \textbf{Student (Base Role):}
    \begin{itemize}
        \item Browse Events, View Event Details
        \item Register for Event, Cancel Registration
        \item Browse Clubs, Follow/Unfollow Club
        \item Request to Join Club
        \item View Notifications, Mark as Read
    \end{itemize}

    \item \textbf{Club Manager (Student + Additional):}
    \begin{itemize}
        \item Tüm Student yetkileri +
        \item Create Event (pending status ile)
        \item Edit Own Event (sadece kendi kulübünün eventleri)
        \item Delete Own Event
        \item View Event Registrations (katılımcı listesi)
        \item Manage Club Members (approve/reject join requests)
    \end{itemize}

    \item \textbf{Advisor (Club Manager + Additional):}
    \begin{itemize}
        \item Tüm Club Manager yetkileri +
        \item Approve/Reject Any Event (rejection reason yazabilir)
        \item View All Events (pending dahil)
    \end{itemize}

    \item \textbf{Admin (Superuser - All Permissions):}
    \begin{itemize}
        \item Tüm Advisor yetkileri +
        \item Manage Users (view, edit, delete users)
        \item Change User Roles (promote/demote)
        \item Create/Delete Clubs
        \item Create/Delete Rooms
        \item View System Analytics
    \end{itemize}

    \item \textbf{Sponsor (Future Role):}
    \begin{itemize}
        \item Submit Sponsor Manifesto
        \item AI Match Clubs (semantic matching)
        \item View Match Results
        \item Contact Clubs
    \end{itemize}
\end{itemize}

\textbf{Authorization Enforcement:}
\begin{itemize}
    \item Backend'de \texttt{@requires\_role} decorator ile role-based access control (RBAC)
    \item Frontend'de \texttt{ProtectedRoute} component ile sayfa erişim kontrolü
    \item API endpoint'lerinde JWT token'dan user role extract edilir, yetki kontrolü yapılır
\end{itemize}
```

---

### 3.5. Deployment Diagram (Yeni bölüm ekle)

**Konum**: "Davranışsal Tasarım" bölümünün devamı

```latex
\section{Deployment Tasarımı (Physical Architecture)}

\subsection{Docker Container Infrastructure}

Şekil~\ref{fig:deployment_diagram} GSUNET'in Docker Compose deployment mimarisini göstermektedir. 5 container (frontend, backend, db, redis, worker) aynı network'te çalışır ve volume'lar ile data persistence sağlanır.

\begin{figure}[H]
\centering
\includegraphics[width=0.95\textwidth]{images/deployment_diagram.png}
\caption{Deployment Diagram - Docker Infrastructure}
\label{fig:deployment_diagram}
\end{figure}

\textbf{Container Detayları:}

\begin{table}[h]
\centering
\small
\begin{tabular}{|l|p{3cm}|p{3.5cm}|p{4cm}|}
\hline
\textbf{Container} & \textbf{Image/Base} & \textbf{Port Mapping} & \textbf{Dependencies} \\ \hline
frontend & node:20-alpine & 5173:5173 & backend (API proxy) \\ \hline
backend & python:3.12-slim & 8000:8000 & db, redis \\ \hline
db & postgres:15-alpine & 5432:5432 & - (base service) \\ \hline
redis & redis:8.4-alpine & 6379:6379 & - (base service) \\ \hline
worker & python:3.12-slim & - (no expose) & redis, db \\ \hline
pgadmin (optional) & dpage/pgadmin4 & 5050:80 & db \\ \hline
\end{tabular}
\caption{Docker Container Specifications}
\end{table}

\textbf{Network Topology:}
\begin{itemize}
    \item \textbf{Network Name:} gsunet-network (bridge mode)
    \item \textbf{Internal Communication:} Container'lar service name ile birbirine erişir (örn: \texttt{postgres://db:5432})
    \item \textbf{External Access:} Sadece frontend (5173) ve backend (8000) portları host'a expose edilir
\end{itemize}

\textbf{Volume Persistence:}
\begin{itemize}
    \item \textbf{postgres\_data:} PostgreSQL veritabanı dosyaları (/var/lib/postgresql/data)
    \item \textbf{redis\_data:} Redis persistence (AOF + RDB snapshots)
    \item Container restart/rebuild olsa bile data korunur
\end{itemize}

\textbf{Deployment Workflow:}
\begin{enumerate}
    \item \texttt{docker-compose up -d} → 5 container başlatılır
    \item Backend Alembic migration çalıştırır (database schema init)
    \item Seed script manuel çalıştırılır: \texttt{python seed\_test\_users.py}
    \item Frontend Vite dev server başlar (hot reload active)
    \item ARQ worker Redis'e connect olur, job consumption başlar
    \item User browser'dan localhost:5173'e erişir
\end{enumerate}

\textbf{Production Deployment (Future):}
\begin{itemize}
    \item Frontend: Static build (npm run build) → Nginx serve
    \item Backend: Uvicorn workers (4 worker/instance) → Nginx reverse proxy + load balancer
    \item Database: PostgreSQL master + read replicas
    \item Redis: Redis Cluster (3-6 nodes) + Sentinel (high availability)
    \item Orchestration: Kubernetes (auto-scaling, health checks)
\end{itemize}
```

---

## 4. LATEX ENTEGRASYON ADIMLARI

### Adım 1: Diyagramları Export Et
```bash
# Mermaid Live'dan her diyagramı PNG olarak export et
# Resolution: 2000px width (yüksek çözünürlük)
# Background: Transparent
```

### Adım 2: Dosyaları Yerleştir
```bash
# images/ klasörü oluştur
mkdir -p /workspace/GsuNET/ESKİ_RAPOR/images

# Export edilen PNG dosyalarını buraya taşı
# Dosya isimleri yukarıdaki standarda uygun olmalı
```

### Adım 3: LaTeX Kodlarını Ekle
```latex
% UPDATED_final_rapor.tex dosyasını aç

% Line 2425 civarına Component Diagram ekle (3.1. bölüm)
% Line 2475 civarına Class Diagram ekle (3.2. bölüm)
% Line 2476 civarına Sequence Diagrams ekle (3.3. bölüm)
% Sequence Diagrams'dan sonra Use Case ekle (3.4. bölüm)
% En sona Deployment ekle (3.5. bölüm)
```

### Adım 4: Compile Et
```bash
# LaTeX compile (2 kez çalıştır - references için)
pdflatex UPDATED_final_rapor.tex
pdflatex UPDATED_final_rapor.tex

# Veya Overleaf'te recompile et
```

---

## 5. HIZLI BAŞLANGIÇ CHEAT SHEET

```bash
# 1. Diyagramları export et
https://mermaid.live/
→ UML_DIAGRAMS.md'den kod kopyala
→ PNG export (2000px, transparent)
→ Dosyayı kaydet (isim standardına uygun)

# 2. Dosyaları taşı
cp *.png /workspace/GsuNET/ESKİ_RAPOR/images/

# 3. LaTeX kodlarını ekle
# Bu rehberdeki kodları UPDATED_final_rapor.tex'e kopyala

# 4. Compile
cd /workspace/GsuNET/ESKİ_RAPOR
pdflatex UPDATED_final_rapor.tex
```

---

## 6. SORUN GİDERME

### Hata: "File not found: images/class_diagram.png"
**Çözüm**: Dosya yolu doğru mu kontrol et. LaTeX dosyası ile aynı dizinde `images/` klasörü olmalı.

### Hata: "Unknown graphics extension: .png"
**Çözüm**: `\usepackage{graphicx}` package'inin preamble'da import edildiğinden emin ol.

### Görsel çok büyük/küçük
**Çözüm**: `\includegraphics[width=0.95\textwidth]` parametresini değiştir (0.7-1.0 arası dene)

### Görsel bulanık
**Çözüm**: Mermaid Live'dan daha yüksek resolution export et (3000px+)

---

**Hazırlayan**: Claude Sonnet 4.5
**Tarih**: 2025-12-19
**Versiyon**: 1.0
