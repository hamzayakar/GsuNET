#!/usr/bin/env python3
"""
GSUNET Final Presentation - 5 Dakikalık Format
Merve Hoca'nın gereksinimlerine uygun: Kısa fizibilite/QFD + Demo odaklı
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
BLUE = RGBColor(1, 87, 155)
ORANGE = RGBColor(230, 81, 0)
GREEN = RGBColor(46, 125, 50)

def add_title_slide(prs):
    """Slide 1: Title (10 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

    # Title
    title_box = slide.shapes.add_textbox(Inches(1), Inches(2.2), Inches(8), Inches(1.2))
    title_frame = title_box.text_frame
    title_frame.text = "GsuNET"
    title_frame.paragraphs[0].font.size = Pt(72)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED
    title_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Subtitle
    subtitle_box = slide.shapes.add_textbox(Inches(1), Inches(3.5), Inches(8), Inches(0.7))
    subtitle_frame = subtitle_box.text_frame
    subtitle_frame.text = "Üniversite Kulüp ve Etkinlik Yönetim Platformu"
    subtitle_frame.paragraphs[0].font.size = Pt(24)
    subtitle_frame.paragraphs[0].font.color.rgb = DARK_GRAY
    subtitle_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Tagline
    tagline_box = slide.shapes.add_textbox(Inches(1), Inches(4.3), Inches(8), Inches(0.5))
    tagline_frame = tagline_box.text_frame
    tagline_frame.text = "AI-Powered • Multi-University • Scalable"
    tagline_frame.paragraphs[0].font.size = Pt(18)
    tagline_frame.paragraphs[0].font.color.rgb = GREEN
    tagline_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    tagline_frame.paragraphs[0].font.italic = True

    # Team
    team_box = slide.shapes.add_textbox(Inches(1), Inches(5.2), Inches(8), Inches(1))
    team_frame = team_box.text_frame
    p1 = team_frame.add_paragraph()
    p1.text = "Endüstri Müh.: Başar Saraç, Berkay Çadırcı"
    p1.font.size = Pt(14)
    p1.font.color.rgb = BLUE
    p1.alignment = PP_ALIGN.CENTER

    p2 = team_frame.add_paragraph()
    p2.text = "Bilgisayar Müh.: Hamza Yakar, Mert Samet Kayacıoğlu, Edipcan Erol"
    p2.font.size = Pt(14)
    p2.font.color.rgb = ORANGE
    p2.alignment = PP_ALIGN.CENTER

    # Footer
    footer_box = slide.shapes.add_textbox(Inches(1), Inches(6.7), Inches(8), Inches(0.3))
    footer_frame = footer_box.text_frame
    footer_frame.text = "INF493 - Galatasaray Üniversitesi - Aralık 2025"
    footer_frame.paragraphs[0].font.size = Pt(12)
    footer_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    footer_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def add_problem_solution(prs):
    """Slide 2: Problem & Solution (40 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "Problem & Çözüm"
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Problem side
    problem_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(4.3), Inches(4.5))
    problem_frame = problem_box.text_frame

    p_title = problem_frame.add_paragraph()
    p_title.text = "❌ PROBLEM"
    p_title.font.size = Pt(28)
    p_title.font.bold = True
    p_title.font.color.rgb = RGBColor(198, 40, 40)
    p_title.space_after = Pt(15)

    problems = [
        "GSÜ'de etkinlik yönetimi dağınık",
        "E-mail, WhatsApp, Excel karmaşası",
        "Kulüpler sponsora erişemiyor",
        "Google Calendar yetersiz (approval, registration, tracking yok)",
        "Ölçeklenebilir değil"
    ]

    for prob in problems:
        p = problem_frame.add_paragraph()
        p.text = f"• {prob}"
        p.font.size = Pt(16)
        p.space_before = Pt(8)
        p.font.color.rgb = DARK_GRAY

    # Solution side
    solution_box = slide.shapes.add_textbox(Inches(5.2), Inches(1.3), Inches(4.3), Inches(4.5))
    solution_frame = solution_box.text_frame

    s_title = solution_frame.add_paragraph()
    s_title.text = "✅ GSUNET"
    s_title.font.size = Pt(28)
    s_title.font.bold = True
    s_title.font.color.rgb = GREEN
    s_title.space_after = Pt(15)

    solutions = [
        "Merkezi platform (tek kaynak)",
        "Etkinlik onay sistemi (advisor)",
        "AI ile akıllı sponsor eşleştirme",
        "Kayıt + bildirim + oda rezervasyonu",
        "Multi-university SaaS (100K+ user)"
    ]

    for sol in solutions:
        p = solution_frame.add_paragraph()
        p.text = f"• {sol}"
        p.font.size = Pt(16)
        p.space_before = Pt(8)
        p.font.color.rgb = DARK_GRAY

    # Arrow between
    arrow_box = slide.shapes.add_textbox(Inches(4.5), Inches(3.2), Inches(0.7), Inches(0.5))
    arrow_frame = arrow_box.text_frame
    arrow_frame.text = "→"
    arrow_frame.paragraphs[0].font.size = Pt(48)
    arrow_frame.paragraphs[0].font.color.rgb = GSU_GOLD
    arrow_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def add_feasibility_qfd(prs):
    """Slide 3: Fizibilite & QFD Özeti (90 saniye - Endüstri Müh.)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "Fizibilite & QFD Analizi (Özet)"
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Left: Feasibility
    left_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(4.5), Inches(5))
    left_frame = left_box.text_frame

    feas_title = left_frame.add_paragraph()
    feas_title.text = "📊 Fizibilite"
    feas_title.font.size = Pt(24)
    feas_title.font.bold = True
    feas_title.font.color.rgb = BLUE
    feas_title.space_after = Pt(12)

    feasibility_items = [
        "Teknik: FastAPI + React stack (proven)",
        "Ekonomik: ₺2K/ay (pilot) → ₺4.5M gelir (3 yıl)",
        "Hedef: 1K users (GSÜ) → 100K (20 üniversite)",
        "Geliştirme: 12 hafta (tamamlandı)",
        "ROI: %85+ (enterprise licensing model)"
    ]

    for item in feasibility_items:
        p = left_frame.add_paragraph()
        p.text = f"• {item}"
        p.font.size = Pt(15)
        p.space_before = Pt(6)

    # Right: QFD
    right_box = slide.shapes.add_textbox(Inches(5.2), Inches(1.3), Inches(4.3), Inches(5))
    right_frame = right_box.text_frame

    qfd_title = right_frame.add_paragraph()
    qfd_title.text = "🏠 QFD (Kalite Evi)"
    qfd_title.font.size = Pt(24)
    qfd_title.font.bold = True
    qfd_title.font.color.rgb = ORANGE
    qfd_title.space_after = Pt(12)

    qfd_items = [
        "Kullanıcı İhtiyaçları:",
        "  → Kolay etkinlik oluşturma (9/10)",
        "  → Hızlı kayıt sistemi (9/10)",
        "  → Sponsora erişim (8/10)",
        "",
        "Teknik Gereksinimler:",
        "  → Async processing (ARQ)",
        "  → AI matching (Gemma/ChatGPT)",
        "  → RBAC security (JWT)"
    ]

    for item in qfd_items:
        p = right_frame.add_paragraph()
        p.text = item
        p.font.size = Pt(15)
        p.space_before = Pt(4)

    # Note
    note_box = slide.shapes.add_textbox(Inches(0.5), Inches(6.5), Inches(9), Inches(0.4))
    note_frame = note_box.text_frame
    note_frame.text = "* Detaylı Gantt şeması, QFD matrisi ve fizibilite analizi raporda mevcuttur"
    note_frame.paragraphs[0].font.size = Pt(11)
    note_frame.paragraphs[0].font.italic = True
    note_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    note_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def add_tech_stack_why(prs):
    """Slide 4: Tech Stack WHY (40 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "Teknoloji Seçimleri - NEDEN?"
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Three columns
    # FastAPI
    col1_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(3), Inches(5))
    col1_frame = col1_box.text_frame

    c1_title = col1_frame.add_paragraph()
    c1_title.text = "⚡ FastAPI"
    c1_title.font.size = Pt(24)
    c1_title.font.bold = True
    c1_title.font.color.rgb = GREEN
    c1_title.space_after = Pt(10)

    fastapi_items = [
        "18K req/s",
        "vs Django: 6x faster",
        "vs Flask: 7.2x faster",
        "Native async",
        "Auto API docs",
        "Type safety"
    ]

    for item in fastapi_items:
        p = col1_frame.add_paragraph()
        p.text = f"✓ {item}"
        p.font.size = Pt(16)
        p.space_before = Pt(5)

    # PostgreSQL
    col2_box = slide.shapes.add_textbox(Inches(3.7), Inches(1.3), Inches(3), Inches(5))
    col2_frame = col2_box.text_frame

    c2_title = col2_frame.add_paragraph()
    c2_title.text = "🗄️ PostgreSQL"
    c2_title.font.size = Pt(24)
    c2_title.font.bold = True
    c2_title.font.color.rgb = BLUE
    c2_title.space_after = Pt(10)

    postgres_items = [
        "10K+ TPS",
        "Full ACID",
        "JSONB support",
        "Advanced indexes",
        "Foreign keys",
        "Scalable"
    ]

    for item in postgres_items:
        p = col2_frame.add_paragraph()
        p.text = f"✓ {item}"
        p.font.size = Pt(16)
        p.space_before = Pt(5)

    # Redis + ARQ
    col3_box = slide.shapes.add_textbox(Inches(6.9), Inches(1.3), Inches(2.8), Inches(5))
    col3_frame = col3_box.text_frame

    c3_title = col3_frame.add_paragraph()
    c3_title.text = "🔄 Redis+ARQ"
    c3_title.font.size = Pt(24)
    c3_title.font.bold = True
    c3_title.font.color.rgb = ORANGE
    c3_title.space_after = Pt(10)

    redis_items = [
        "100K msg/s",
        "<1ms latency",
        "Cache + Queue",
        "Async tasks",
        "Cron jobs",
        "vs Kafka: simpler"
    ]

    for item in redis_items:
        p = col3_frame.add_paragraph()
        p.text = f"✓ {item}"
        p.font.size = Pt(16)
        p.space_before = Pt(5)

    # Bottom note
    note_box = slide.shapes.add_textbox(Inches(0.5), Inches(6.5), Inches(9), Inches(0.4))
    note_frame = note_box.text_frame
    note_frame.text = "Kaynak: TechEmpower Benchmarks Round 22"
    note_frame.paragraphs[0].font.size = Pt(11)
    note_frame.paragraphs[0].font.italic = True
    note_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    note_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def add_key_innovations(prs):
    """Slide 5: Key Innovations (40 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "🚀 Yenilikçi Özellikler"
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Main innovation: AI Sponsor Matching
    ai_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(9), Inches(1.5))
    ai_frame = ai_box.text_frame

    ai_title = ai_frame.add_paragraph()
    ai_title.text = "🤖 AI-Powered Sponsor Matching"
    ai_title.font.size = Pt(28)
    ai_title.font.bold = True
    ai_title.font.color.rgb = GSU_GOLD
    ai_title.space_after = Pt(8)

    ai_desc = ai_frame.add_paragraph()
    ai_desc.text = "Sponsor manifestosu + kulüp profilleri → AI modeli (Gemma 7B / ChatGPT) → Akıllı eşleştirme (0-100 skor)"
    ai_desc.font.size = Pt(18)
    ai_desc.font.color.rgb = DARK_GRAY

    ai_benefit = ai_frame.add_paragraph()
    ai_benefit.text = "💰 %10 komisyon gelir modeli  •  ⚡ 50-70ms latency (Gemma local)  •  💸 ₺30/ay (ChatGPT demo)"
    ai_benefit.font.size = Pt(14)
    ai_benefit.font.color.rgb = GREEN
    ai_benefit.space_before = Pt(6)

    # Other features - Two columns
    left_features_box = slide.shapes.add_textbox(Inches(0.5), Inches(3.1), Inches(4.5), Inches(3.2))
    left_features_frame = left_features_box.text_frame

    lf_title = left_features_frame.add_paragraph()
    lf_title.text = "✨ Core Features"
    lf_title.font.size = Pt(22)
    lf_title.font.bold = True
    lf_title.font.color.rgb = BLUE
    lf_title.space_after = Pt(10)

    left_features = [
        "Etkinlik onay sistemi (3-tier approval)",
        "Akıllı oda önerisi (kapasite-based)",
        "Background notifications (ARQ async)",
        "Kulüp üyelik yönetimi",
        "Haftalık takvim (room scheduling)"
    ]

    for feat in left_features:
        p = left_features_frame.add_paragraph()
        p.text = f"• {feat}"
        p.font.size = Pt(15)
        p.space_before = Pt(5)

    right_features_box = slide.shapes.add_textbox(Inches(5.2), Inches(3.1), Inches(4.3), Inches(3.2))
    right_features_frame = right_features_box.text_frame

    rf_title = right_features_frame.add_paragraph()
    rf_title.text = "🔐 Security & Quality"
    rf_title.font.size = Pt(22)
    rf_title.font.bold = True
    rf_title.font.color.rgb = ORANGE
    rf_title.space_after = Pt(10)

    right_features = [
        "4-tier RBAC (Student/Manager/Advisor/Admin)",
        "JWT authentication (7-day expiry)",
        "SQL injection prevention (ORM)",
        "Multi-language (TR/EN/FR - 458 keys)",
        "Responsive design (mobile-first)"
    ]

    for feat in right_features:
        p = right_features_frame.add_paragraph()
        p.text = f"• {feat}"
        p.font.size = Pt(15)
        p.space_before = Pt(5)

def add_scalability_vision(prs):
    """Slide 6: Scalability Vision (30 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.4), Inches(9), Inches(0.6))
    title_frame = title_box.text_frame
    title_frame.text = "📈 Ölçeklenebilirlik Vizyonu"
    title_frame.paragraphs[0].font.size = Pt(40)
    title_frame.paragraphs[0].font.bold = True
    title_frame.paragraphs[0].font.color.rgb = GSU_RED

    # Vision statement
    vision_box = slide.shapes.add_textbox(Inches(0.5), Inches(1.3), Inches(9), Inches(0.8))
    vision_frame = vision_box.text_frame
    vision_frame.text = "GSUNET, sadece GSÜ için değil — tüm Türkiye üniversiteleri için SaaS platformu"
    vision_frame.paragraphs[0].font.size = Pt(24)
    vision_frame.paragraphs[0].font.bold = True
    vision_frame.paragraphs[0].font.color.rgb = GSU_GOLD
    vision_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Scaling scenarios table
    table_box = slide.shapes.add_textbox(Inches(0.8), Inches(2.4), Inches(8.4), Inches(3))
    table_frame = table_box.text_frame

    # Table header
    header = table_frame.add_paragraph()
    header.text = "Kullanıcı Ölçeği          Üniversite Sayısı      Altyapı                    Yıllık Gelir"
    header.font.size = Pt(14)
    header.font.bold = True
    header.font.color.rgb = DARK_GRAY
    header.space_after = Pt(8)

    scenarios = [
        ("1K-2K (Pilot)", "1 (GSÜ)", "1 server", "₺0 (free tier)"),
        ("10K-15K (Regional)", "5 (Boğaziçi, İTÜ, ODTÜ...)", "4 servers + LB", "₺375K"),
        ("50K-100K (National)", "20+ üniversite", "15-20 servers + K8s", "₺1.5M"),
        ("100K+ (Scale)", "Türkiye çapında (200+ potansiyel)", "Auto-scaling", "₺5M+")
    ]

    for scale, unis, infra, revenue in scenarios:
        p = table_frame.add_paragraph()
        p.text = f"• {scale:25} {unis:28} {infra:24} {revenue}"
        p.font.size = Pt(13)
        p.space_before = Pt(6)
        if "National" in scale or "Scale" in scale:
            p.font.color.rgb = GREEN
            p.font.bold = True

    # Multi-tenant highlights
    highlights_box = slide.shapes.add_textbox(Inches(0.5), Inches(5.6), Inches(9), Inches(1.2))
    highlights_frame = highlights_box.text_frame

    hl_title = highlights_frame.add_paragraph()
    hl_title.text = "🏗️ Multi-Tenant Architecture Avantajları:"
    hl_title.font.size = Pt(18)
    hl_title.font.bold = True
    hl_title.font.color.rgb = BLUE
    hl_title.space_after = Pt(6)

    hl_text = highlights_frame.add_paragraph()
    hl_text.text = "✓ Shared infrastructure (cost efficiency)  •  ✓ 5 dakikada yeni tenant  •  ✓ Data isolation (tenant_id)  •  ✓ 100K+ user ready"
    hl_text.font.size = Pt(14)
    hl_text.font.color.rgb = DARK_GRAY

def add_demo_transition(prs):
    """Slide 7: Demo Transition (10 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Big centered text
    demo_box = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(8), Inches(2))
    demo_frame = demo_box.text_frame
    demo_frame.vertical_anchor = MSO_ANCHOR.MIDDLE

    demo_title = demo_frame.add_paragraph()
    demo_title.text = "🎬 DEMO"
    demo_title.font.size = Pt(80)
    demo_title.font.bold = True
    demo_title.font.color.rgb = GSU_RED
    demo_title.alignment = PP_ALIGN.CENTER
    demo_title.space_after = Pt(20)

    demo_subtitle = demo_frame.add_paragraph()
    demo_subtitle.text = "Canlı Sistem Gösterimi"
    demo_subtitle.font.size = Pt(32)
    demo_subtitle.font.color.rgb = DARK_GRAY
    demo_subtitle.alignment = PP_ALIGN.CENTER

    # Demo features to show
    features_box = slide.shapes.add_textbox(Inches(1.5), Inches(5.2), Inches(7), Inches(1.2))
    features_frame = features_box.text_frame

    features = features_frame.add_paragraph()
    features.text = "📌 Etkinlik oluşturma  →  Onay sistemi  →  Kayıt  →  Bildirimler  →  AI sponsor eşleştirme"
    features.font.size = Pt(16)
    features.font.color.rgb = LIGHT_GRAY
    features.alignment = PP_ALIGN.CENTER
    features.font.italic = True

def add_thank_you(prs):
    """Slide 8: Thank You (10 saniye)"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Thank you
    thanks_box = slide.shapes.add_textbox(Inches(1), Inches(2.2), Inches(8), Inches(1))
    thanks_frame = thanks_box.text_frame
    thanks_frame.text = "Teşekkürler!"
    thanks_frame.paragraphs[0].font.size = Pt(64)
    thanks_frame.paragraphs[0].font.bold = True
    thanks_frame.paragraphs[0].font.color.rgb = GSU_RED
    thanks_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Questions
    questions_box = slide.shapes.add_textbox(Inches(1), Inches(3.4), Inches(8), Inches(0.6))
    questions_frame = questions_box.text_frame
    questions_frame.text = "Sorularınız için hazırız"
    questions_frame.paragraphs[0].font.size = Pt(28)
    questions_frame.paragraphs[0].font.color.rgb = DARK_GRAY
    questions_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Key stats
    stats_box = slide.shapes.add_textbox(Inches(1), Inches(4.5), Inches(8), Inches(1.2))
    stats_frame = stats_box.text_frame

    stats_title = stats_frame.add_paragraph()
    stats_title.text = "📊 GSUNET Özet"
    stats_title.font.size = Pt(20)
    stats_title.font.bold = True
    stats_title.font.color.rgb = BLUE
    stats_title.alignment = PP_ALIGN.CENTER
    stats_title.space_after = Pt(8)

    stats = stats_frame.add_paragraph()
    stats.text = "53 API endpoints  •  10 database tables  •  16 pages  •  458 translation keys  •  100K+ users ready"
    stats.font.size = Pt(14)
    stats.font.color.rgb = LIGHT_GRAY
    stats.alignment = PP_ALIGN.CENTER

    # Footer
    footer_box = slide.shapes.add_textbox(Inches(1), Inches(6.2), Inches(8), Inches(0.8))
    footer_frame = footer_box.text_frame
    footer_frame.text = "Galatasaray Üniversitesi\nMühendislik ve Teknoloji Fakültesi\nINF493 Araştırma Yöntemleri - 22 Aralık 2025"
    footer_frame.paragraphs[0].font.size = Pt(12)
    footer_frame.paragraphs[0].font.color.rgb = LIGHT_GRAY
    footer_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

def create_presentation():
    """Create the final 5-minute presentation"""
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)

    print("🎨 Creating GSUNET Final Presentation (5-Minute Format)...")
    print()

    print("Slide 1: Title (10 sn)")
    add_title_slide(prs)

    print("Slide 2: Problem & Solution (40 sn)")
    add_problem_solution(prs)

    print("Slide 3: Fizibilite & QFD Özeti (90 sn - Endüstri Müh.)")
    add_feasibility_qfd(prs)

    print("Slide 4: Tech Stack WHY (40 sn)")
    add_tech_stack_why(prs)

    print("Slide 5: Key Innovations (40 sn)")
    add_key_innovations(prs)

    print("Slide 6: Scalability Vision (30 sn)")
    add_scalability_vision(prs)

    print("Slide 7: Demo Transition (10 sn)")
    add_demo_transition(prs)

    print("Slide 8: Thank You (10 sn)")
    add_thank_you(prs)

    # Save
    output_file = "GSUNET_5Minute_Presentation.pptx"
    prs.save(output_file)

    print()
    print("=" * 70)
    print(f"✅ Presentation created: {output_file}")
    print(f"📊 Total slides: {len(prs.slides)}")
    print()
    print("⏱️  TIMING BREAKDOWN:")
    print("   Slide 1: Title - 10 sn")
    print("   Slide 2: Problem & Solution - 40 sn")
    print("   Slide 3: Fizibilite & QFD - 90 sn (Endüstri Müh.)")
    print("   Slide 4: Tech Stack WHY - 40 sn")
    print("   Slide 5: Key Innovations - 40 sn")
    print("   Slide 6: Scalability Vision - 30 sn")
    print("   Slide 7: Demo Transition - 10 sn")
    print("   ─────────────────────────────────")
    print("   TOTAL (slides): ~4 dakika")
    print("   DEMO (live): ~2 dakika")
    print("   ─────────────────────────────────")
    print("   GRAND TOTAL: ~6 dakika (buffer dahil)")
    print()
    print("✅ Merve Hoca formatına uygun:")
    print("   ✓ Fizibilite/QFD kısa (1.5 dakika)")
    print("   ✓ Demo odaklı (2 dakika canlı demo)")
    print("   ✓ Can alıcı noktalar (AI sponsor, multi-uni, tech WHY)")
    print("=" * 70)

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    create_presentation()
