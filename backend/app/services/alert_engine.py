from datetime import datetime, timedelta
from typing import List
from app.schemas import AlertNewsItem

class AlertEngine:
    # A base list of static global news alerts
    STATIC_ALERTS = [
        {
            "article_id": "alert-who-2026-001",
            "publish_date": datetime.utcnow() - timedelta(days=2),
            "source": "WHO Alert",
            "title": "Falsified Rabies Vaccine Batches Detected in South Asia",
            "severity_level": "CRITICAL",
            "message_body": "The World Health Organization has issued an alert regarding falsified batches of Rabies Vaccines detected in regional clinical channels. Batch numbers RV-20612 and RV-20613 are reported to have failed laboratory authentication. Please verify serial status immediately.",
            "targeted_batch_prefixes": ["RV-206"],
            "targeted_manufacturers": ["AsiaVax Corp"]
        },
        {
            "article_id": "alert-dcgi-2026-004",
            "publish_date": datetime.utcnow() - timedelta(days=5),
            "source": "DCGI Mandate",
            "title": "New QR Serialization Requirements for Schedule H Medicines",
            "severity_level": "INFO",
            "message_body": "India's DCGI mandates that all Schedule H drug packaging must display a high-resolution, secure cryptographic QR code containing 13 serialization parameters (batch, exp, mfg, licensing, dosage details) verified via registered public keys.",
            "targeted_batch_prefixes": ["*"],
            "targeted_manufacturers": []
        },
        {
            "article_id": "alert-who-2026-002",
            "publish_date": datetime.utcnow() - timedelta(days=7),
            "source": "WHO Alert",
            "title": "Counterfeit Antibiotic Suspicion: Amoxicillin Batch AM-409",
            "severity_level": "HIGH",
            "message_body": "Suspect packages of Amoxicillin 500mg capsules found in East African border pharmacies. Counterfeits have a logo deviation of >12% and lack valid holographic tags. If batch AM-409 is scanned, report directly to national regulators.",
            "targeted_batch_prefixes": ["AM-409"],
            "targeted_manufacturers": ["VeloPharm Ltd"]
        }
    ]

    @classmethod
    def get_alerts(cls, regional_risks: List[dict]) -> List[AlertNewsItem]:
        alerts = []
        
        # Add static alerts
        for sa in cls.STATIC_ALERTS:
            alerts.append(AlertNewsItem(**sa))
            
        # Dynamically generate alerts for regions with threat_index >= 0.70
        for rr in regional_risks:
            threat = rr.get("threat_index", 0.0)
            region = rr.get("region", "Unknown")
            
            if threat >= 0.70:
                alerts.append(
                    AlertNewsItem(
                        article_id=f"alert-irs-{region.lower().replace(' ', '-')}-{int(datetime.utcnow().timestamp())}",
                        publish_date=datetime.utcnow(),
                        source="Internal Risk System",
                        title=f"Counterfeit Alert: High Risk Level Detected in {region}",
                        severity_level="CRITICAL" if threat >= 0.8 else "HIGH",
                        message_body=f"VeriMed's Risk Engine has flag-logged abnormal scan activity in {region}. The regional Threat Index is currently {int(threat * 100)}%, with an elevated rate of failed QR signatures and packaging image deviations. System recommends increased vigilance.",
                        targeted_batch_prefixes=[],
                        targeted_manufacturers=[]
                    )
                )
                
        # Sort by publish date descending
        return sorted(alerts, key=lambda x: x.publish_date, reverse=True)
