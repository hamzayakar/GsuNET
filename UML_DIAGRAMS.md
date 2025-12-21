# GSUNET - UML Diyagramları (Mermaid Format)

**Tarih**: 2025-12-19
**Kaynak**: Review5 code analysis + Backend models/routes
**Format**: Mermaid (mermaid.live veya LaTeX mermaid package ile render edilebilir)

---

## 1. CLASS DIAGRAM - Database Models (En Önemli)

Bu diyagram SQLAlchemy modellerini ve aralarındaki ilişkileri gösterir.

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string password_hash
        +string full_name
        +enum role
        +datetime created_at
        +clubs_managed: List~Club~
        +clubs_advised: List~Club~
        +event_registrations: List~EventRegistration~
        +notifications: List~Notification~
        +club_join_requests: List~ClubJoinRequest~
    }

    class Club {
        +int id
        +string name
        +string description
        +string category
        +int manager_id
        +int advisor_id
        +datetime created_at
        +events: List~Event~
        +join_requests: List~ClubJoinRequest~
        +sponsorships: List~Sponsorship~
        +manager: User
        +advisor: User
    }

    class Event {
        +int id
        +string title
        +string description
        +int club_id
        +int room_id
        +datetime event_datetime
        +int expected_capacity
        +int max_capacity
        +enum status
        +int approved_by_id
        +string rejection_reason
        +bool members_only
        +datetime created_at
        +club: Club
        +room: Room
        +approved_by: User
        +registrations: List~EventRegistration~
    }

    class Room {
        +int id
        +string name
        +string location
        +int capacity
        +string features
        +bool available
        +datetime created_at
        +events: List~Event~
        +schedules: List~RoomSchedule~
    }

    class EventRegistration {
        +int id
        +int user_id
        +int event_id
        +datetime registered_at
        +user: User
        +event: Event
    }

    class Notification {
        +int id
        +int user_id
        +string title
        +string message
        +enum type
        +int event_id
        +bool is_read
        +datetime created_at
        +user: User
        +event: Event
    }

    class ClubJoinRequest {
        +int id
        +int user_id
        +int club_id
        +enum status
        +datetime created_at
        +datetime decided_at
        +user: User
        +club: Club
    }

    class Sponsorship {
        +int id
        +int club_id
        +string company_name
        +string contact_email
        +string manifesto
        +decimal amount
        +enum status
        +datetime created_at
        +club: Club
    }

    class RoomSchedule {
        +int id
        +int room_id
        +string day_of_week
        +time start_time
        +time end_time
        +string course_name
        +room: Room
    }

    %% Relationships
    User "1" --> "0..*" Club : manages
    User "1" --> "0..*" Club : advises
    User "1" --> "0..*" EventRegistration : registers
    User "1" --> "0..*" Notification : receives
    User "1" --> "0..*" ClubJoinRequest : requests
    User "1" --> "0..*" Event : approves

    Club "1" --> "0..*" Event : hosts
    Club "1" --> "0..*" ClubJoinRequest : receives
    Club "1" --> "0..*" Sponsorship : has

    Event "1" --> "0..*" EventRegistration : has
    Event "1" --> "0..*" Notification : triggers
    Event "0..*" --> "1" Room : uses
    Event "0..*" --> "1" Club : belongs_to

    Room "1" --> "0..*" RoomSchedule : has_schedule
```

**Render için**: https://mermaid.live/

---

## 2. SEQUENCE DIAGRAM - Event Creation & Approval Flow

Bu diyagram bir kulüp yöneticisinin etkinlik oluşturmasından, danışman onayına kadar olan akışı gösterir.

```mermaid
sequenceDiagram
    actor CM as Club Manager
    participant FE as Frontend (React)
    participant API as Backend API (FastAPI)
    participant DB as PostgreSQL
    participant Redis as Redis + ARQ
    actor ADV as Advisor

    %% Event Creation
    CM->>FE: Fill event form (title, date, capacity)
    FE->>API: POST /api/v1/events (JWT token)

    activate API
    API->>API: Validate JWT & role (club_manager)
    API->>DB: Check club ownership
    DB-->>API: Club validated

    API->>DB: Check room availability (overlap)
    DB-->>API: Room available

    API->>DB: INSERT Event (status=pending)
    DB-->>API: Event created (id=123)

    API->>Redis: Enqueue notification task (notify_advisor)
    Redis-->>API: Task queued

    API-->>FE: 201 Created (event_id: 123)
    deactivate API

    FE-->>CM: "Event created, waiting approval"

    %% Background notification
    Redis->>DB: Fetch advisor info
    DB-->>Redis: Advisor email, user_id
    Redis->>DB: INSERT Notification (type=event_pending)

    %% Approval Flow
    ADV->>FE: Open Approval Panel
    FE->>API: GET /api/v1/events?status=pending
    API->>DB: SELECT events WHERE status=pending
    DB-->>API: [Event 123, ...]
    API-->>FE: Event list (pending)
    FE-->>ADV: Show pending events

    ADV->>FE: Click "Approve" on Event 123
    FE->>API: PUT /api/v1/events/123/approve (action=approve)

    activate API
    API->>API: Validate role (advisor/admin)
    API->>DB: UPDATE Event SET status=approved, approved_by=advisor_id
    DB-->>API: Event updated

    API->>Redis: Enqueue notification task (notify_club_manager)
    API-->>FE: 200 OK (Event approved)
    deactivate API

    FE-->>ADV: "Event approved successfully"

    Redis->>DB: Fetch club manager info
    Redis->>DB: INSERT Notification (type=event_approved)

    CM->>FE: Refresh page
    FE-->>CM: Event now visible (status=approved)
```

---

## 3. SEQUENCE DIAGRAM - Event Registration Flow

Bir öğrencinin etkinliğe kayıt olma akışı.

```mermaid
sequenceDiagram
    actor STU as Student
    participant FE as Frontend (React)
    participant API as Backend API
    participant DB as PostgreSQL
    participant Redis as Redis Queue

    STU->>FE: Browse events (Home page)
    FE->>API: GET /api/v1/events?status=approved
    API->>DB: SELECT events WHERE status=approved
    DB-->>API: [Event 1, Event 2, ...]
    API-->>FE: Approved events list
    FE-->>STU: Display events

    STU->>FE: Click event card → EventDetail page
    FE->>API: GET /api/v1/events/{id}
    API->>DB: SELECT event + club + room
    DB-->>API: Event details
    API-->>FE: Event full info
    FE-->>STU: Show event details + "Register" button

    STU->>FE: Click "Register for Event"
    FE->>API: POST /api/v1/events/{id}/register (JWT)

    activate API
    API->>API: Validate JWT
    API->>DB: Check if already registered
    alt Already registered
        DB-->>API: Registration exists
        API-->>FE: 400 Bad Request ("Already registered")
        FE-->>STU: Toast: "You're already registered"
    else Not registered
        DB-->>API: No registration found
        API->>DB: Check event capacity
        alt Event full
            DB-->>API: Registrations >= max_capacity
            API-->>FE: 400 Bad Request ("Event full")
            FE-->>STU: Toast: "Event is full"
        else Capacity available
            DB-->>API: Capacity OK
            API->>DB: INSERT EventRegistration
            DB-->>API: Registration created

            API->>Redis: Enqueue notification (registration_success)

            API-->>FE: 201 Created
            deactivate API
            FE-->>STU: Toast: "Registered successfully"

            Redis->>DB: INSERT Notification (user_id, event_id)
        end
    end
```

---

## 4. COMPONENT DIAGRAM - System Architecture

Sistemin fiziksel bileşenleri ve aralarındaki ilişkiler.

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend Layer"
        React[React 19 + Vite]
        Router[React Router]
        AuthCtx[AuthContext]
        LangCtx[LanguageContext]
        API_Service[API Service - Axios]
    end

    subgraph "Backend Layer"
        FastAPI[FastAPI 0.104.1]
        Uvicorn[Uvicorn ASGI Server]

        subgraph "Routes"
            AuthRoute[auth.py]
            EventRoute[events.py]
            ClubRoute[clubs.py]
            RoomRoute[rooms.py]
            UserRoute[users.py]
            NotifRoute[notifications.py]
        end

        subgraph "Core"
            Security[security.py - JWT]
            Config[config.py]
            Deps[dependencies.py - RBAC]
        end

        subgraph "Models"
            UserModel[user.py]
            EventModel[event.py]
            ClubModel[club.py]
            RoomModel[room.py]
        end
    end

    subgraph "Database Layer"
        PostgreSQL[(PostgreSQL 15)]
        Alembic[Alembic Migrations]
    end

    subgraph "Cache & Queue Layer"
        Redis[(Redis 8.4)]
        ARQ[ARQ Worker]

        subgraph "Background Jobs"
            NotifJob[notification_tasks.py]
            CronJob[Cron: event_reminder]
        end
    end

    subgraph "External Services"
        OpenAI[OpenAI API - GPT-4o-mini]
        Email[Email Service - Future]
    end

    %% Connections
    Browser --> React
    Mobile --> React

    React --> Router
    React --> AuthCtx
    React --> LangCtx
    React --> API_Service

    API_Service -->|HTTP/REST| FastAPI

    FastAPI --> Uvicorn
    FastAPI --> AuthRoute
    FastAPI --> EventRoute
    FastAPI --> ClubRoute
    FastAPI --> RoomRoute
    FastAPI --> UserRoute
    FastAPI --> NotifRoute

    AuthRoute --> Security
    EventRoute --> Security
    EventRoute --> Deps

    AuthRoute --> UserModel
    EventRoute --> EventModel
    ClubRoute --> ClubModel
    RoomRoute --> RoomModel

    UserModel -.->|SQLAlchemy ORM| PostgreSQL
    EventModel -.->|SQLAlchemy ORM| PostgreSQL
    ClubModel -.->|SQLAlchemy ORM| PostgreSQL
    RoomModel -.->|SQLAlchemy ORM| PostgreSQL

    Alembic -.->|Migrations| PostgreSQL

    FastAPI -->|Enqueue tasks| Redis
    Redis --> ARQ
    ARQ --> NotifJob
    ARQ --> CronJob

    NotifJob -.->|Write notifications| PostgreSQL
    CronJob -.->|Read events| PostgreSQL

    EventRoute -.->|AI matching| OpenAI

    style React fill:#61dafb
    style FastAPI fill:#009688
    style PostgreSQL fill:#336791
    style Redis fill:#dc382d
    style OpenAI fill:#10a37f
```

**Not**: Oklar düz (-->) ise senkron bağlantı, noktalı (-.->) ise asenkron/veri akışı.

---

## 5. USE CASE DIAGRAM - User Roles & Actions

Sistemdeki 4 rolün (Student, Club Manager, Advisor, Admin) yetkilerini gösterir.

```mermaid
graph TB
    subgraph "Actors"
        Student[👤 Student]
        ClubMgr[👔 Club Manager]
        Advisor[🎓 Advisor]
        Admin[👨‍💼 Admin]
    end

    subgraph "Use Cases - Event Management"
        UC1[Browse Events]
        UC2[View Event Details]
        UC3[Register for Event]
        UC4[Cancel Registration]
        UC5[Create Event]
        UC6[Edit Own Event]
        UC7[Delete Own Event]
        UC8[Approve/Reject Event]
        UC9[View Event Registrations]
    end

    subgraph "Use Cases - Club Management"
        UC10[Browse Clubs]
        UC11[Follow Club]
        UC12[Request to Join Club]
        UC13[Manage Club Members]
        UC14[Create Club - Admin only]
        UC15[Delete Club - Admin only]
    end

    subgraph "Use Cases - Notification"
        UC16[View Notifications]
        UC17[Mark as Read]
    end

    subgraph "Use Cases - Admin"
        UC18[Manage Users]
        UC19[Change User Roles]
        UC20[Create/Delete Rooms]
        UC21[View All Events]
    end

    subgraph "Use Cases - Sponsorship"
        UC22[Submit Sponsor Manifesto]
        UC23[AI Match Clubs]
        UC24[View Match Results]
    end

    %% Student permissions
    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC10
    Student --> UC11
    Student --> UC12
    Student --> UC16
    Student --> UC17

    %% Club Manager permissions (includes Student)
    ClubMgr --> UC1
    ClubMgr --> UC2
    ClubMgr --> UC3
    ClubMgr --> UC5
    ClubMgr --> UC6
    ClubMgr --> UC7
    ClubMgr --> UC9
    ClubMgr --> UC13
    ClubMgr --> UC16

    %% Advisor permissions (includes Club Manager)
    Advisor --> UC1
    Advisor --> UC5
    Advisor --> UC6
    Advisor --> UC8
    Advisor --> UC9
    Advisor --> UC21

    %% Admin permissions (all)
    Admin --> UC8
    Admin --> UC14
    Admin --> UC15
    Admin --> UC18
    Admin --> UC19
    Admin --> UC20
    Admin --> UC21

    %% Sponsorship (new role - future)
    Sponsor[🏢 Sponsor] --> UC22
    Sponsor --> UC23
    Sponsor --> UC24

    style Student fill:#4CAF50
    style ClubMgr fill:#FF9800
    style Advisor fill:#2196F3
    style Admin fill:#F44336
    style Sponsor fill:#9C27B0
```

---

## 6. ACTIVITY DIAGRAM - Event Lifecycle

Bir etkinliğin yaşam döngüsü (Creation → Approval → Registration → Completion).

```mermaid
stateDiagram-v2
    [*] --> Draft: Club Manager starts

    Draft --> Pending: Submit for approval

    Pending --> Approved: Advisor approves
    Pending --> Rejected: Advisor rejects

    Rejected --> [*]: Event deleted/archived

    Approved --> OpenForRegistration: Auto-open

    OpenForRegistration --> RegistrationClosed: Capacity full OR deadline

    RegistrationClosed --> Ongoing: Event date arrives

    Ongoing --> Completed: Event ends

    Completed --> [*]: Archived

    Approved --> Cancelled: Club Manager cancels
    Cancelled --> [*]: Notifications sent

    note right of Pending
        Advisor receives notification
        Can approve or reject with reason
    end note

    note right of OpenForRegistration
        Students can register
        Real-time capacity check
    end note

    note right of Cancelled
        ARQ worker sends bulk notifications
        to all registered users
    end note
```

---

## 7. DEPLOYMENT DIAGRAM - Docker Infrastructure

GSUNET'in Docker Compose deployment mimarisi.

```mermaid
graph TB
    subgraph "Docker Host"
        subgraph "Network: gsunet-network"

            subgraph "Container: frontend"
                Vite[Vite Dev Server :5173]
                ReactApp[React App Build]
            end

            subgraph "Container: backend"
                Uvicorn2[Uvicorn :8000]
                FastAPI2[FastAPI App]
                Alembic2[Alembic CLI]
            end

            subgraph "Container: db"
                Postgres[PostgreSQL :5432]
                PGData[(Volume: postgres_data)]
            end

            subgraph "Container: redis"
                RedisServer[Redis Server :6379]
                RedisData[(Volume: redis_data)]
            end

            subgraph "Container: worker"
                ARQWorker[ARQ Worker Process]
                CronScheduler[Cron Scheduler]
            end

        end
    end

    subgraph "External"
        Browser2[User Browser :5173]
        PgAdmin[PgAdmin :5050 - Optional]
    end

    %% Connections
    Browser2 -->|HTTP| Vite
    Vite -->|Proxy API calls| Uvicorn2

    FastAPI2 -->|SQLAlchemy| Postgres
    FastAPI2 -->|Enqueue| RedisServer

    ARQWorker -->|Consume jobs| RedisServer
    ARQWorker -->|Write notifications| Postgres

    CronScheduler -->|Read events| Postgres

    PgAdmin -.->|Manage| Postgres

    Postgres --> PGData
    RedisServer --> RedisData

    style Vite fill:#646cff
    style FastAPI2 fill:#009688
    style Postgres fill:#336791
    style RedisServer fill:#dc382d
    style ARQWorker fill:#ff6b6b
```

---

## 8. SEQUENCE DIAGRAM - AI Sponsor Matching (Advanced)

AI sponsor eşleştirme sisteminin detaylı akışı.

```mermaid
sequenceDiagram
    actor Sponsor
    participant FE as Frontend
    participant API as FastAPI
    participant DB as PostgreSQL
    participant AI as AI Service (GPT-4o/Gemma)
    participant Cache as Redis Cache

    Sponsor->>FE: Fill sponsor manifesto form
    FE->>API: POST /api/sponsors/match (manifesto)

    activate API
    API->>API: Validate manifesto (min 100 chars)

    API->>Cache: Check cache (manifesto hash)
    alt Cache hit
        Cache-->>API: Cached match results
        API-->>FE: Return cached results (fast)
    else Cache miss
        Cache-->>API: No cache

        API->>DB: Fetch all active clubs
        DB-->>API: [Club1, Club2, ..., Club20]

        API->>API: Check data richness

        alt Rich Data (Tier 3)
            API->>AI: Send full prompt (manifesto + club history)
            Note over AI: GPT-4o-mini semantic matching
            AI-->>API: Match scores + reasoning
        else Moderate Data (Tier 2)
            API->>AI: Generate embeddings (manifesto + club desc)
            AI-->>API: Vectors
            API->>API: Calculate cosine similarity
        else Minimal Data (Tier 1)
            API->>API: Keyword extraction (TF-IDF)
            API->>API: Category-based filtering
        end

        API->>API: Rank clubs by score (0-100)
        API->>API: Select top 10

        API->>Cache: Store results (TTL: 1 hour)
        API-->>FE: Top 10 matches with scores
    end
    deactivate API

    FE-->>Sponsor: Display ranked clubs

    Sponsor->>FE: Click "Contact Club"
    FE->>API: POST /api/sponsors/{id}/contact/{club_id}
    API->>DB: INSERT Sponsorship (status=pending)
    API->>DB: INSERT Notification (club_manager)
    API-->>FE: Contact request sent
    FE-->>Sponsor: "Club notified"
```

---

## KULLANIM TALİMATLARI

### 1. Mermaid Live Editor
En kolay yöntem: https://mermaid.live/
- Yukarıdaki kod bloklarını kopyala-yapıştır
- PNG/SVG export et
- Rapora image olarak ekle

### 2. LaTeX ile Render (Overleaf)
```latex
\usepackage{tikz}
\usetikzlibrary{positioning,shapes,arrows}

% Veya mermaid-cli kullan (pdflatex yerine)
% Ama Overleaf'te çalışmayabilir
```

### 3. VS Code Extension
- Extension: "Markdown Preview Mermaid Support"
- Bu .md dosyasını aç, preview'da görürsün

### 4. CLI ile PNG Export
```bash
# mermaid-cli kur
npm install -g @mermaid-js/mermaid-cli

# PNG export
mmdc -i diagram.mmd -o diagram.png -w 2000 -b transparent
```

---

## RAPOR İÇİN ÖNERİLER

**En kritik 3 diyagram (raporda mutlaka olmalı)**:
1. ✅ **Class Diagram** - Database modelleri (IEEE SDD için şart)
2. ✅ **Sequence Diagram (Event Flow)** - İş akışı gösterimi
3. ✅ **Component Diagram** - Sistem mimarisi

**Bonus (varsa çok iyi)**:
4. ⭐ Use Case Diagram - Roller ve yetkiler
5. ⭐ Deployment Diagram - Docker infrastructure

**Raporda yerleştirme**:
- Bölüm 9 (IEEE SDD) içine ekle
- Her diyagramın altına caption: "Şekil X: [Diyagram adı]"
- Açıklama paragrafı ekle

---

**Oluşturulma**: 2025-12-19
**Review5 Code Analysis'e dayanarak hazırlanmıştır**
