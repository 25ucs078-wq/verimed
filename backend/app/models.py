import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="patient")  # patient, pharmacist, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scan_activities = relationship("ScanActivity", back_populates="user")
    reports = relationship("Report", back_populates="user")
    qr_verifications = relationship("QRVerification", back_populates="user")
    offline_caches = relationship("OfflineCache", back_populates="user")


class Medicine(Base):
    __tablename__ = "medicines"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    generic_name = Column(String, nullable=False)
    brand_name = Column(String, nullable=False)
    manufacturer_name = Column(String, nullable=False)
    manufacturer_address = Column(String, nullable=True)
    manufacturer_license_no = Column(String, nullable=True)
    dosage_form = Column(String, nullable=True)
    strength = Column(String, nullable=True)
    packaging_size = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    batches = relationship("Batch", back_populates="medicine")


class Batch(Base):
    __tablename__ = "batches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    medicine_id = Column(String, ForeignKey("medicines.id"), nullable=False)
    batch_number = Column(String, unique=True, nullable=False)
    manufacturing_date = Column(DateTime, nullable=False)
    expiry_date = Column(DateTime, nullable=False)
    status = Column(String, default="active")  # active, recalled, expired, unknown
    hologram_status = Column(String, default="genuine")  # fake_hologram, none_hologram, simulated_hologram, genuine
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    medicine = relationship("Medicine", back_populates="batches")
    scan_activities = relationship("ScanActivity", back_populates="batch")
    dispatch_records = relationship("ManufacturerDispatchRecord", back_populates="batch")


class PackagingImage(Base):
    __tablename__ = "packaging_images"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    image_hash = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    detected_label = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    ai_result = relationship("AIAnalysisResult", uselist=False, back_populates="packaging_image")


class AIAnalysisResult(Base):
    __tablename__ = "ai_analysis_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    packaging_image_id = Column(String, ForeignKey("packaging_images.id"), nullable=False)
    logo_deviation = Column(Float, default=0.0)
    typography_deviation = Column(Float, default=0.0)
    color_gamut_deviation = Column(Float, default=0.0)
    confidence_score = Column(Float, default=1.0)
    is_authentic = Column(Boolean, default=True)
    flagged_categories = Column(JSON, default=list)  # list of strings
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    packaging_image = relationship("PackagingImage", back_populates="ai_result")


class QRVerification(Base):
    __tablename__ = "qr_verifications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    scan_activity_id = Column(String, ForeignKey("scan_activity.id"), nullable=True)
    batch_number = Column(String, nullable=False)
    serialization_code = Column(String, nullable=False)
    signature_valid = Column(Boolean, default=False)
    verification_status = Column(String, default="unverified")
    signature_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="qr_verifications")
    scan_activity = relationship("ScanActivity", back_populates="qr_verification")


class ScanActivity(Base):
    __tablename__ = "scan_activity"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    batch_id = Column(String, ForeignKey("batches.id"), nullable=True)
    scan_type = Column(String, nullable=False)  # image, qr
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    region = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="scan_activities")
    batch = relationship("Batch", back_populates="scan_activities")
    qr_verification = relationship("QRVerification", uselist=False, back_populates="scan_activity")
    anomaly = relationship("SupplyChainAnomaly", uselist=False, back_populates="scan_activity")
    reports = relationship("Report", back_populates="scan_activity")


class RegionalRiskMap(Base):
    __tablename__ = "regional_risk_map"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    region = Column(String, unique=True, nullable=False)
    threat_index = Column(Float, default=0.0)  # 0.0 to 1.0
    counterfeit_percent = Column(Float, default=0.0)
    seizure_count = Column(Integer, default=0)
    trend = Column(String, default="stable")  # increasing, stable, decreasing
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SupplyChainAnomaly(Base):
    __tablename__ = "supply_chain_anomalies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_activity_id = Column(String, ForeignKey("scan_activity.id"), nullable=False)
    risk_score = Column(Float, default=0.0)
    flags = Column(JSON, default=list)  # list of strings (e.g. route_deviation, temperature_break)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    scan_activity = relationship("ScanActivity", back_populates="anomaly")


class ManufacturerDispatchRecord(Base):
    __tablename__ = "manufacturer_dispatch_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    batch_id = Column(String, ForeignKey("batches.id"), nullable=False)
    dispatch_date = Column(DateTime, default=datetime.utcnow)
    origin = Column(String, nullable=False)
    expected_destination = Column(String, nullable=False)
    current_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    batch = relationship("Batch", back_populates="dispatch_records")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    scan_activity_id = Column(String, ForeignKey("scan_activity.id"), nullable=True)
    report_type = Column(String, default="suspicious_product")
    notes = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, investigating, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="reports")
    scan_activity = relationship("ScanActivity", back_populates="reports")


class OfflineCache(Base):
    __tablename__ = "offline_caches"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    cached_at = Column(DateTime, default=datetime.utcnow)
    cache_expiry = Column(DateTime, nullable=False)
    payload_hash = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="offline_caches")
