from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# ----------------- A. CV & Packaging -----------------
class Deviations(BaseModel):
    logo: float
    typography: float
    color_gamut: float

class AIAnalysisResponse(BaseModel):
    is_authentic: bool
    confidence_score: float
    deviations: Deviations
    flagged_categories: List[str]

# ----------------- B. Cryptographic QR -----------------
class QRVerifyRequest(BaseModel):
    unique_product_id: str
    generic_name: str
    brand_name: str
    manufacturer_name: str
    manufacturer_address: Optional[str] = None
    manufacturer_license_no: Optional[str] = None
    batch_number: str
    manufacturing_date: str  # YYYY-MM-DD
    expiry_date: str         # YYYY-MM-DD
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    packaging_size: Optional[str] = None
    serialization_code: str

class QRVerifyResponse(BaseModel):
    signature_valid: bool
    verification_status: str
    batch_status: str  # active, recalled, expired, unknown
    signature_token: str

# ----------------- C. Anomalies & Mapping -----------------
class ScanLocation(BaseModel):
    lat: float
    lng: float

class ScanHistoryItem(BaseModel):
    location: ScanLocation
    timestamp: datetime
    batch_id: Optional[str] = None
    scan_type: str  # image, qr

class AnomalyDetectRequest(BaseModel):
    scan_history: List[ScanHistoryItem]

class AnomalyDetectResponse(BaseModel):
    risk_score: float
    flags: List[str]
    details: Dict[str, Any]

class RiskMapItem(BaseModel):
    region: str
    threat_index: float
    counterfeit_percent: float
    seizure_count: int
    trend: str

# ----------------- D. Offline Sync -----------------
class OfflineScanItem(BaseModel):
    scan_type: str  # image, qr
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None
    metadata: Dict[str, Any]

class OfflineSyncRequest(BaseModel):
    cached_scans: List[OfflineScanItem]

class MedicineSchema(BaseModel):
    id: str
    generic_name: str
    brand_name: str
    manufacturer_name: str
    manufacturer_address: Optional[str]
    manufacturer_license_no: Optional[str]
    dosage_form: Optional[str]
    strength: Optional[str]
    packaging_size: Optional[str]

class BatchSchema(BaseModel):
    id: str
    medicine_id: str
    batch_number: str
    manufacturing_date: datetime
    expiry_date: datetime
    status: str
    hologram_status: str

class OfflineSyncResponse(BaseModel):
    medicines: List[MedicineSchema]
    batches: List[BatchSchema]
    qr_lookup_tree: Dict[str, Any]
    cache_expiry: datetime

# ----------------- E. Alerts & News -----------------
class AlertNewsItem(BaseModel):
    article_id: str
    publish_date: datetime
    source: str  # WHO Alert, DCGI Mandate, Internal Risk System
    title: str
    severity_level: str  # CRITICAL, HIGH, INFO
    message_body: str
    targeted_batch_prefixes: Optional[List[str]] = None
    targeted_manufacturers: Optional[List[str]] = None

# ----------------- F. Reports -----------------
class ReportCreate(BaseModel):
    report_type: str = "suspicious_product"
    notes: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    region: Optional[str] = None
    batch_number: Optional[str] = None

class ReportResponse(BaseModel):
    id: str
    status: str
    created_at: datetime
