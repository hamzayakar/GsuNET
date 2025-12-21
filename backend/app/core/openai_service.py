"""
OpenAI Service for AI-powered sponsor-club matching
Review6: Sponsor matching feature with TWO-WAY MATCHING

This service uses ChatGPT to intelligently match sponsors with clubs based on:
- Topic/vision alignment (40%)
- Budget compatibility (50%) - VETO power!
- Club activity level (10%)
"""
import os
import json
from openai import OpenAI
from sqlalchemy.orm import Session
from app.models.club import Club
from app.models.club_join_request import ClubJoinRequest, JoinRequestStatus


class OpenAIService:
    """Service for AI-powered sponsor-club matching"""

    def __init__(self):
        """Initialize OpenAI client"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        self.client = OpenAI(api_key=self.api_key)

    async def match_sponsor_with_clubs(
        self,
        sponsor_data: dict,
        db: Session,
        top_n: int = 3
    ) -> list[dict]:
        """
        Match sponsor with most suitable clubs using ChatGPT API.

        TWO-WAY MATCHING: Considers both sponsor offerings AND club needs/budget.

        Args:
            sponsor_data: Dict containing sponsor information
            db: Database session
            top_n: Number of top matches to return (default: 3)

        Returns:
            List of dicts with club_id, club_name, reasoning, and rank

        Example:
            [
                {
                    "club_id": 1,
                    "club_name": "AI Club",
                    "reasoning": "Topic: ⭐⭐⭐⭐⭐ Perfect - AI/ML synergy. Budget: ⭐⭐⭐⭐ Compatible!",
                    "rank": 1
                },
                ...
            ]
        """
        # Fetch all clubs with their statistics
        clubs = db.query(Club).all()

        # Prepare club information for matching (TWO-WAY MATCHING)
        clubs_info = []
        for club in clubs:
            # Count approved members
            members_count = db.query(ClubJoinRequest).filter(
                ClubJoinRequest.club_id == club.id,
                ClubJoinRequest.status == JoinRequestStatus.APPROVED
            ).count()

            # Count followers
            followers_count = len(club.followers)

            # Count events
            events_count = len(club.events)

            clubs_info.append({
                "id": club.id,
                "name": club.name,
                "description": club.description or "No description",
                "events_count": events_count,
                "members_count": members_count,
                "followers_count": followers_count,
                # TWO-WAY MATCHING fields (NEW - Review6)
                "sponsorship_needs": club.sponsorship_needs or "Belirtilmemiş",
                "budget_expectation": club.sponsorship_budget_expectation or "Belirtilmemiş",
            })

        # Build ChatGPT prompt (TWO-WAY MATCHING with scoring system)
        prompt = self._build_matching_prompt(sponsor_data, clubs_info, top_n)

        # Call ChatGPT API
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert sponsor-club matching assistant. Always respond in valid JSON format without any markdown formatting or code blocks."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1500
            )

            # Parse response
            response_text = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                # Extract JSON from code blocks
                lines = response_text.split("\n")
                json_lines = []
                in_json = False
                for line in lines:
                    if line.startswith("```"):
                        in_json = not in_json
                        continue
                    if in_json or not line.startswith("```"):
                        json_lines.append(line)
                response_text = "\n".join(json_lines)

            result = json.loads(response_text)
            matches = result.get("matches", [])[:top_n]

            return matches

        except Exception as e:
            print(f"OpenAI API Error: {e}")
            # Fallback: Return random 3 clubs with generic reasoning
            import random
            random_clubs = random.sample(clubs_info, min(top_n, len(clubs_info)))
            return [
                {
                    "club_id": club["id"],
                    "club_name": club["name"],
                    "reasoning": "API hatası nedeniyle otomatik eşleştirildi. Manuel inceleme önerilir.",
                    "rank": idx + 1
                }
                for idx, club in enumerate(random_clubs)
            ]

    def _build_matching_prompt(self, sponsor_data: dict, clubs_info: list[dict], top_n: int) -> str:
        """
        Build the ChatGPT prompt for TWO-WAY MATCHING.

        Scoring system:
        - Topic alignment: 40%
        - Budget compatibility: 50% (VETO power!)
        - Activity level: 10%
        """
        clubs_text = self._format_clubs_for_prompt(clubs_info)

        prompt = f"""
Sen bir sponsor-kulüp eşleştirme asistanısın. Aşağıdaki sponsor ve kulüp bilgilerine göre,
EN UYGUN {top_n} kulübü seç ve sırala. Bu bir ÇİFT YÖNLÜ EŞLEŞTİRME sistemidir.

SPONSOR SUNDUĞU:
- Şirket: {sponsor_data['company_name']}
- Tür: {sponsor_data['sponsorship_type']}
- Vizyon: {sponsor_data['vision']}
- Sponsorluk Hedefleri: {sponsor_data['sponsorship_goals']}
- Sponsor Bütçesi: {sponsor_data.get('budget_range', 'Belirtilmemiş')}
- İletişim: {sponsor_data['contact_info']}

KULÜPLER (İHTİYAÇLAR + BÜTÇE BEKLENTİSİ):
{clubs_text}

DEĞERLENDİRME KRİTERLERİ:
1. **Konu Uyumu** (40%): Sponsor vizyonu ve hedefleri ile kulüp açıklaması/ihtiyaçları uyumlu mu?
2. **Bütçe Uyumu** (50%): Sponsor bütçesi ile kulüp beklentisi uyumlu mu? (Kritik!)
   - Sponsor bütçesi kulüp beklentisinin %50'sinden azsa RED ET!
   - Örnek: Sponsor 1K TL, Kulüp 15-30K TL → EŞLEŞTİRME YAPMA!
   - Örnek: Sponsor 50K TL, Kulüp 15-30K TL → UYUMLU ✓
3. **Aktivite Uyumu** (10%): Kulübün etkinlik sayısı ve üye/takipçi kitlesi aktif mi?

ÖNEMLİ KURALLAR:
- Bütçe uyumsuzluğu VETO hakkıdır! Konu perfect olsa bile bütçe uyuşmuyorsa eşleştirme YAPMA.
- Kulüp bütçe beklentisi belirtmemişse, bütçe kontrolünü atla ve sadece konu uyumuna bak.
- Sponsor bütçe belirtmemişse, bütçe kontrolünü atla ve sadece konu uyumuna bak.
- En az {top_n} kulüp döndür. Eğer bütçe uyumsuzluğu nedeniyle {top_n} kulüp bulamazsan, en yakın {top_n} tanesini seç ama reasoning'de bütçe uyumsuzluğunu belirt.

CEVAP FORMATI (SADECE JSON, EXTRA YORUM YOK):
{{
    "matches": [
        {{
            "club_id": 1,
            "club_name": "Kulüp Adı",
            "reasoning": "Konu: ⭐⭐⭐⭐⭐ Perfect match - AI/ML synergy. Bütçe: ⭐⭐⭐⭐ 10-50K sponsor, 15-30K kulüp - uyumlu!",
            "rank": 1
        }},
        {{
            "club_id": 2,
            "club_name": "Diğer Kulüp",
            "reasoning": "Konu: ⭐⭐⭐ İyi - Teknoloji odaklı. Bütçe: ⭐⭐ Sponsor bütçesi düşük olabilir ama kabul edilebilir.",
            "rank": 2
        }}
    ]
}}
"""
        return prompt

    def _format_clubs_for_prompt(self, clubs_info: list[dict]) -> str:
        """Format club information for the ChatGPT prompt (TWO-WAY MATCHING)"""
        lines = []
        for club in clubs_info:
            lines.append(
                f"- ID: {club['id']} | Ad: {club['name']} | "
                f"Açıklama: {club['description']} | "
                f"İHTİYAÇ: {club['sponsorship_needs']} | "  # NEW - Review6
                f"BÜTÇE BEKLENTİSİ: {club['budget_expectation']} | "  # NEW - Review6
                f"Etkinlik: {club['events_count']} | "
                f"Üye: {club['members_count']} | "
                f"Takipçi: {club['followers_count']}"
            )
        return "\n".join(lines)
