import hashlib
import random
from app.config import settings

class CVEngine:
    @staticmethod
    def analyze_packaging(image_bytes: bytes) -> dict:
        # Generate a stable hash from image bytes
        hasher = hashlib.sha256()
        hasher.update(image_bytes)
        img_hash = hasher.hexdigest()
        
        # Seed random number generator with hash to make results deterministic per image
        seed_value = int(img_hash[:8], 16)
        rng = random.Random(seed_value)
        
        # Simulate EfficientNet-B0 feature distance deviations
        # deviations are float values in range [0, 0.15]
        logo_dev = rng.uniform(0.0, 0.12)
        typo_dev = rng.uniform(0.0, 0.08)
        color_dev = rng.uniform(0.0, 0.15)
        
        flagged = []
        if logo_dev > settings.CV_LOGO_THRESHOLD:
            flagged.append("Logo Misalignment / Distorted Hologram")
        if typo_dev > settings.CV_TYPO_THRESHOLD:
            flagged.append("Typography Inconsistency / Font Mismatch")
        if color_dev > settings.CV_COLOR_THRESHOLD:
            flagged.append("Color Gamut / Low-quality Print Color")
            
        # Is authentic if no deviations are flagged
        is_authentic = len(flagged) == 0
        
        # Calculate confidence score based on the worst deviation
        max_dev = max(logo_dev, typo_dev, color_dev)
        # Scale score between 30% and 99%
        confidence_score = max(0.30, 0.99 - (max_dev * 4.0))
        
        # Force a highly authentic result if the image bytes hash matches a special seed case
        # (e.g. if the image contains the word 'genuine' or similar)
        if b"genuine" in image_bytes:
            logo_dev = rng.uniform(0.0, 0.02)
            typo_dev = rng.uniform(0.0, 0.015)
            color_dev = rng.uniform(0.0, 0.03)
            flagged = []
            is_authentic = True
            confidence_score = rng.uniform(0.95, 0.99)
            
        return {
            "is_authentic": is_authentic,
            "confidence_score": round(confidence_score, 4),
            "deviations": {
                "logo": round(logo_dev, 4),
                "typography": round(typo_dev, 4),
                "color_gamut": round(color_dev, 4)
            },
            "flagged_categories": flagged
        }
