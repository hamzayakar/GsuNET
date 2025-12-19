#!/usr/bin/env python3
"""
GSUNET Final Presentation Generator
Focuses on completed work and actual implementation
"""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
import os

# GSU Colors
GSU_RED = RGBColor(169, 4, 50)  # #a90432
GSU_GOLD = RGBColor(251, 192, 45)  # #fbc02d
DARK_GRAY = RGBColor(51, 51, 51)
LIGHT_GRAY = RGBColor(102, 102, 102)

def add_title_slide(prs):
    """Add title slide"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

    # Title
    title_box = slide.shapes.add_textbox(Inches(1), Inches(2), Inches(8), Inches(1.5))
    title_frame = title_box.text_frame
    title_frame.text = "GsuNET"
    title_frame.paragraphs[0].font.size = Pt(72)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Subtitle
    subtitle_box = slide.shapes.add_textbox(Inches(1), Inches(3.7), Inches(8), Inches(0.8))
    subtitle_frame = subtitle_box.text_frame
    subtitle_frame.text = "Galatasaray University Networking and Event Tracking System"
    subtitle_frame.paragraphs[0].font.size = Pt(24)
    subtitle_frame.paragraphs[0].font.color.rgb = DARK_GRAY
    subtitle_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Description
    desc_box = slide.shapes.add_textbox(Inches(1), Inches(4.6), Inches(8), Inches(0.5))
    desc_frame = desc_box.text_frame
    desc_frame.text = "Final Project Presentation - Completed Implementation"
    desc_frame.paragraphs[0].font.size = Pt(18)
    desc_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    desc_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Team
    team_box = slide.shapes.add_textbox(Inches(1), Inches(5.5), Inches(8), Inches(1.2))
    team_frame = team_box.text_frame
    p1 = team_frame.add_paragraph()
    p1.text = "Endüstri Mühendisliği: Başar Saraç, Berkay Çadırcı"
    p1.font.size = Pt(14)
    p1.font.color.rgb = RGBColor(1, 87, 155)
    p1.alignment = PP_ALIGN.CENTER

    p2 = team_frame.add_paragraph()
    p2.text = "Bilgisayar Mühendisliği: Hamza Yakar, Mert Samet Kayacıoğlu, Edipcan Erol"
    p2.font.size = Pt(14)
    p2.font.color.rgb = RGBColor(230, 81, 0)
    p2.alignment = PP_ALIGN.CENTER

    # Footer
    footer_box = slide.shapes.add_textbox(Inches(1), Inches(6.8), Inches(8), Inches(0.3))
    footer_frame = footer_box.text_frame
    footer_frame.text = "Galatasaray Üniversitesi - Aralık 2025"
    footer_frame.paragraphs[0].font.size = Pt(12)
    footer_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    footer_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def add_content_slide(prs, title, content_items):
    """Add a content slide with title and bullet points"""
    slide = prs.slides.add_slide(prs.slide_layouts[1])  # Title and Content

    # Title
    title_shape = slide.shapes.title
    title_shape.text = title
    title_shape.text_frame.paragraphs[0].font.size = Pt(40)
    title_shape.text_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Content
    content_shape = slide.placeholders[1]
    text_frame = content_shape.text_frame
    text_frame.clear()

    for item in content_items:
        p = text_frame.add_paragraph()
        p.text = item
        p.font.size = Pt(18)
        p.level = 0
        p.space_before = Pt(6)

def add_two_column_slide(prs, title, left_items, right_items, left_title="", right_title=""):
    """Add a two-column content slide"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.7))
    title_frame = title_box.text_frame
    title_frame.text = title
    title_frame.paragraphs[0].font.size = Pt(36)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Left column
    left_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.5), Inches(4.5), Inches(5))
    left_frame = left_box.text_frame
    if left_title:
        p = left_frame.add_paragraph()
        p.text = left_title
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = GSU_RED
        p.space_after = Pt(10)

    for item in left_items:
        p = left_frame.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(16)
        p.space_before = Pt(4)

    # Right column
    right_box = slide.shapes.add_textbox(Inches(5.2), Inches(1.5), Inches(4.5), Inches(5))
    right_frame = right_box.text_frame
    if right_title:
        p = right_frame.add_paragraph()
        p.text = right_title
        p.font.size = Pt(24)
        p.font.bold = True
        p.font.color.rgb = GSU_RED
        p.space_after = Pt(10)

    for item in right_items:
        p = right_frame.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(16)
        p.space_before = Pt(4)

def add_image_slide(prs, title, image_path, caption=""):
    """Add a slide with title and centered image"""
    if not os.path.exists(image_path):
        print(f"Warning: Image not found: {image_path}")
        return

    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(0.7))
    title_frame = title_box.text_frame
    title_frame.text = title
    title_frame.paragraphs[0].font.size = Pt(36)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Image
    slide.shapes.add_picture(image_path, Inches(1.5), Inches(1.5), width=Inches(7))

    # Caption
    if caption:
        caption_box = slide.shapes.add_textbox(Inches(1), Inches(6.5), Inches(8), Inches(0.5))
        caption_frame = caption_box.text_frame
        caption_frame.text = caption
        caption_frame.paragraphs[0].font.size = Pt(14)
        caption_frame.paragraphs[0].font.italic = True
        caption_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
        caption_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def create_presentation():
    """Create the full presentation"""
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    print("Creating slide 1: Title...")
    add_title_slide(prs)

    print("Creating slide 2: Project Overview...")
    add_content_slide(prs, "Proje Özeti", [
        "✅ Tam işlevsel bir kulüp ve etkinlik yönetim platformu geliştirildi",
        "✅ React frontend + FastAPI backend ile modern web uygulaması",
        "✅ PostgreSQL veritabanı + Redis cache/queue sistemi",
        "✅ 4 farklı kullanıcı rolü (Student, Club Manager, Advisor, Admin)",
        "✅ Rol tabanlı yetkilendirme (RBAC) ve JWT authentication",
        "✅ Background task processing (ARQ) ve cron jobs",
        "✅ Responsive tasarım ve çoklu dil desteği (TR/EN/FR)",
        "✅ Docker containerization ile deployment"
    ])

    print("Creating slide 3: Core Features...")
    add_two_column_slide(prs, "Tamamlanan Temel Özellikler",
        [
            "Etkinlik oluşturma ve yönetimi",
            "Etkinlik onay sistemi (Advisor)",
            "Etkinliklere kayıt olma",
            "Kulüpleri takip etme",
            "Kulüp üyelik talepleri",
            "Sadece üyelere özel etkinlikler"
        ],
        [
            "Bildirim sistemi (event reminders)",
            "Oda/salon rezervasyonu",
            "Haftalık program takvimi",
            "Kullanıcı yönetimi (Admin)",
            "Sponsorluk yönetimi",
            "Çoklu dil desteği"
        ],
        "Etkinlik ve Kulüp Yönetimi",
        "Sistem Özellikleri"
    )

    print("Creating slide 4: System Architecture...")
    add_content_slide(prs, "Sistem Mimarisi - Gerçekleşen", [
        "🏗️ Three-Tier Architecture (Client-Server Model)",
        "⚛️ Frontend: React 19.x + Vite + TailwindCSS + React Router",
        "🚀 Backend: FastAPI 0.104.1 + Uvicorn (async ASGI server)",
        "💾 Database: PostgreSQL 15 + SQLAlchemy ORM + Alembic migrations",
        "🔄 Cache/Queue: Redis 8.4 + ARQ (async background tasks)",
        "🔐 Security: JWT authentication, bcrypt password hashing, RBAC",
        "📦 Deployment: Docker + Docker Compose (5 containers)",
        "🌐 API Documentation: OpenAPI/Swagger (auto-generated)"
    ])

    print("Creating slide 5: Technology Stack...")
    add_two_column_slide(prs, "Kullanılan Teknolojiler",
        [
            "React 19.2.0 - UI framework",
            "Vite 7.2.4 - Build tool",
            "TailwindCSS 4.1.18 - Styling",
            "React Router 7.10.1 - Routing",
            "Axios 1.13.2 - HTTP client",
            "React Hot Toast - Notifications"
        ],
        [
            "FastAPI 0.104.1 - Web framework",
            "PostgreSQL 15 - Database",
            "SQLAlchemy 2.0.23 - ORM",
            "Redis 8.4 - Cache/Queue",
            "ARQ 0.26.1 - Background tasks",
            "Pydantic 2.5.0 - Validation"
        ],
        "Frontend Stack",
        "Backend Stack"
    )

    print("Creating slide 6: Database Design...")
    add_content_slide(prs, "Veritabanı Tasarımı - 10 Tablo", [
        "👥 Users - Kullanıcılar ve roller (student/club_manager/advisor/admin)",
        "🏢 Clubs - Kulüp profilleri ve yöneticileri",
        "📅 Events - Etkinlikler (status: pending/approved/rejected/cancelled/completed)",
        "🏫 Rooms - Odalar ve salonlar (kapasite, özellikler)",
        "📋 RoomSchedule - Oda rezervasyonları ve zaman blokları",
        "✅ EventRegistration - Kullanıcı-etkinlik kayıtları",
        "🔔 Notifications - Bildirimler (8 farklı tip)",
        "🤝 ClubJoinRequest - Kulüp üyelik talepleri",
        "💼 Sponsorships - Sponsorluk yönetimi"
    ])

    print("Creating slide 7: Backend Implementation...")
    add_content_slide(prs, "Backend Gerçekleştirimi", [
        "✅ RESTful API: 7 ana route modülü (auth, events, clubs, rooms, schedule, notifications, users)",
        "✅ Authentication: JWT token-based (7-day expiration)",
        "✅ Authorization: Rol bazlı erişim kontrolü (decorator-based)",
        "✅ Validation: Pydantic schemas ile input/output validation",
        "✅ ORM: SQLAlchemy models ve relationships",
        "✅ Background Tasks: ARQ worker ile asenkron bildirimler",
        "✅ Scheduled Jobs: Günlük event reminder (cron: 9:00 AM)",
        "✅ Error Handling: Detaylı HTTP exception responses"
    ])

    print("Creating slide 8: Frontend Implementation...")
    add_content_slide(prs, "Frontend Gerçekleştirimi", [
        "✅ Single Page Application (SPA) - React ile geliştirildi",
        "✅ Rol bazlı sayfa erişimi ve dinamik navigasyon",
        "✅ 15+ ana sayfa (Login, Events, Clubs, Admin Panel, vb.)",
        "✅ Context API ile global state management (Auth, Language)",
        "✅ Responsive tasarım - Mobile, Tablet, Desktop",
        "✅ Form validation ve error handling",
        "✅ Toast notifications (react-hot-toast)",
        "✅ i18n - 3 dil desteği (TR/EN/FR), localStorage persistence"
    ])

    print("Creating slide 9: Key Features Demo...")
    add_two_column_slide(prs, "Önemli Özellikler - Detay",
        [
            "Event Creation: Form validation, room selection, capacity limits",
            "Event Approval: Advisor panel, approve/reject with reason",
            "Event Registration: One-click register, capacity check",
            "Event Cancellation: Background task (ARQ), bulk notifications",
            "Event Reminders: Daily cron job (3-day advance notice)"
        ],
        [
            "Room Scheduling: Weekly view, conflict detection, capacity-based recommendations",
            "Club Management: Member requests, approve/reject, follower system",
            "User Management: Admin panel, role editing, filtering",
            "Notifications: 8 types, read/unread status, event linking",
            "Multi-language: Dynamic switching, all UI elements translated"
        ],
        "Etkinlik Özellikleri",
        "Sistem Özellikleri"
    )

    print("Creating slide 10: Security Implementation...")
    add_content_slide(prs, "Güvenlik Gerçekleştirimi", [
        "🔐 JWT Authentication - Stateless, token-based authentication",
        "🔑 Password Security - Bcrypt hashing (salt + hash)",
        "🛡️ RBAC (Role-Based Access Control) - 4 seviye yetkilendirme",
        "🚫 SQL Injection Prevention - SQLAlchemy ORM (parametrized queries)",
        "🛡️ XSS Protection - React built-in escaping",
        "🔒 CORS Policy - Configured for security",
        "✅ Input Validation - Pydantic schemas ile tüm endpoint'lerde",
        "📋 Foreign Key Constraints - Database integrity enforcement"
    ])

    print("Creating slide 11: Background Processing...")
    add_content_slide(prs, "Background Task Processing (ARQ)", [
        "✅ Redis-based async queue (ARQ 0.26.1)",
        "✅ Worker process - 5 functions, 10 max concurrent jobs",
        "✅ Event Cancellation Notifications - Async, non-blocking",
        "   → 100+ users: Response time <100ms (was ~5 seconds)",
        "✅ Event Reminder Notifications - Scheduled daily at 9 AM",
        "   → Finds events 2.5-3.5 days away, sends reminders",
        "✅ Cron Jobs - ARQ cron decorator (@cron)",
        "✅ Job Retention - Results kept for 1 hour",
        "✅ Health Checks - Redis connection monitoring"
    ])

    print("Creating slide 12: Challenges & Solutions...")
    add_two_column_slide(prs, "Karşılaşılan Zorluklar ve Çözümler",
        [
            "Room scheduling conflicts → Overlap detection algorithm",
            "Event capacity management → Database constraints + validation",
            "Performance (100+ notifications) → ARQ background tasks",
            "Role-based access → Decorator-based RBAC system"
        ],
        [
            "Multi-language support → Context API + localStorage",
            "Database migrations → Alembic version control",
            "Docker networking → Docker Compose service dependencies",
            "Worker startup issues → ARQ CLI wrapper solution"
        ],
        "Teknik Zorluklar",
        "Uygulama Zorlukları"
    )

    print("Creating slide 13: Testing & Deployment...")
    add_content_slide(prs, "Test ve Deployment", [
        "🐳 Docker Containerization - 5 containers (frontend, backend, db, redis, worker)",
        "📦 Docker Compose Orchestration - Service dependencies, networks, volumes",
        "🔄 Development Workflow - Hot reload (Vite + Uvicorn)",
        "🗄️ Database Migrations - Alembic (version-controlled schema)",
        "✅ API Testing - Swagger UI (/docs endpoint)",
        "🏥 Health Checks - Database + Redis connection monitoring",
        "📝 API Documentation - OpenAPI/Swagger auto-generated",
        "🚀 Production Ready - Environment-based configuration"
    ])

    print("Creating slide 14: Results & Achievements...")
    add_content_slide(prs, "Sonuçlar ve Başarılar", [
        "✅ Fully functional club and event management platform",
        "✅ Complete 3-tier architecture implementation",
        "✅ 10-table normalized database with proper relationships",
        "✅ Async background processing for scalability",
        "✅ Comprehensive security implementation",
        "✅ Modern, responsive UI with multi-language support",
        "✅ Dockerized deployment for easy setup",
        "✅ Well-documented API (OpenAPI/Swagger)",
        "🎯 Ready for pilot testing with real users"
    ])

    print("Creating slide 15: Future Improvements...")
    add_content_slide(prs, "Gelecek Geliştirmeler", [
        "📱 Mobile Application - React Native or PWA enhancement",
        "🤖 AI-powered Event Recommendations - Machine learning based on user preferences",
        "📊 Advanced Analytics Dashboard - Club performance metrics, attendance trends",
        "🔔 Push Notifications - Web push for real-time updates",
        "📧 Email Integration - Automated email notifications",
        "🌐 Social Media Integration - Share events to social platforms",
        "📅 Calendar Integration - Export to Google Calendar, iCal",
        "🧪 Automated Testing - Unit tests, integration tests, E2E tests"
    ])

    # Add image slides if they exist
    if os.path.exists("gantt.png"):
        print("Creating slide: Gantt Chart...")
        add_image_slide(prs, "Proje Zaman Planı (Gantt)", "gantt.png", "12 haftalık geliştirme süreci")

    if os.path.exists("qfd.png"):
        print("Creating slide: QFD...")
        add_image_slide(prs, "Kalite Evi (QFD)", "qfd.png", "Kullanıcı ihtiyaçlarından teknik gereksinimlere")

    if os.path.exists("proje-akis-diyagrami.png"):
        print("Creating slide: Project Flow...")
        add_image_slide(prs, "Proje Akış Diyagramı", "proje-akis-diyagrami.png", "İteratif geliştirme süreci")

    print("Creating final slide: Thank You...")
    # Thank You Slide
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    title_box = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(8), Inches(1))
    title_frame = title_box.text_frame
    title_frame.text = "Teşekkürler!"
    title_frame.paragraphs[0].font.size = Pt(60)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    subtitle_box = slide.shapes.add_textbox(Inches(1), Inches(3.7), Inches(8), Inches(0.5))
    subtitle_frame = subtitle_box.text_frame
    subtitle_frame.text = "Sorularınız için hazırız"
    subtitle_frame.paragraphs[0].font.size = Pt(28)
    subtitle_frame.paragraphs[0].font.color.rgb = DARK_GRAY
    subtitle_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    footer_box = slide.shapes.add_textbox(Inches(1), Inches(6), Inches(8), Inches(1))
    footer_frame = footer_box.text_frame
    footer_frame.text = "Galatasaray Üniversitesi\nMühendislik ve Teknoloji Fakültesi\nINF493 Bitirme Projesi - Aralık 2025"
    footer_frame.paragraphs[0].font.size = Pt(14)
    footer_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    footer_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Save presentation
    output_file = "GSUNET_Final_Presentation.pptx"
    prs.save(output_file)
    print(f"\n✅ Presentation created successfully: {output_file}")
    print(f"Total slides: {len(prs.slides)}")

if __name__ == "__main__":
    os.chdir("/home/user/Six_Seven/yeni_sunum")
    create_presentation()
