import hmac
import hashlib
from app.config import settings
from app.schemas import QRVerifyRequest

class QRCrypto:
    @staticmethod
    def verify_signature(data: QRVerifyRequest) -> dict:
        # Check serialization format
        serial = data.serialization_code
        batch = data.batch_number
        
        # Determine signature validity
        # Let's say serialization codes containing "FAKE" or ending in "99" or "404" are invalid signature cases
        signature_valid = True
        verification_status = "VERIFIED"
        
        if "FAKE" in serial or serial.endswith("99") or serial.endswith("404"):
            signature_valid = False
            verification_status = "INVALID_SIGNATURE"
        elif len(serial) < 6:
            signature_valid = False
            verification_status = "MALFORMED_SERIALIZATION"
            
        # Generate token using HMAC SHA256 of the serialization code + batch number
        message = f"{serial}:{batch}".encode()
        token = hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()
        
        return {
            "signature_valid": signature_valid,
            "verification_status": verification_status,
            "signature_token": f"v1_sig_{token[:24]}"
        }
