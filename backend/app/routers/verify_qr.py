from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db import get_db
from app.schemas import QRVerifyRequest, QRVerifyResponse
from app.services.qr_crypto import QRCrypto
from app.models import Batch, QRVerification, ScanActivity

router = APIRouter(prefix="/verify", tags=["Cryptographic QR & Barcode"])

@router.post("/qr", response_model=QRVerifyResponse)
async def verify_qr(
    payload: QRVerifyRequest,
    latitude: float = None,
    longitude: float = None,
    region: str = None,
    db: AsyncSession = Depends(get_db)
):
    # Perform SmartID signature verification simulation
    crypto_res = QRCrypto.verify_signature(payload)
    
    # Check if batch exists in DB
    batch_status = "unknown"
    batch_id = None
    
    stmt = select(Batch).where(Batch.batch_number == payload.batch_number)
    res = await db.execute(stmt)
    batch = res.scalars().first()
    
    if batch:
        batch_status = batch.status
        batch_id = batch.id
        
        # Override signature check if the batch hologram status itself is flagged as fake
        if batch.hologram_status == "fake_hologram":
            crypto_res["signature_valid"] = False
            crypto_res["verification_status"] = "INVALID_SIGNATURE_SUSPECT_BATCH"
    else:
        # If it's a simulated fake batch scan, or batch not in db
        if payload.batch_number.startswith("CNT-") or "FAKE" in payload.serialization_code:
            batch_status = "recalled"
        else:
            batch_status = "unknown"

    # Log Scan Activity
    scan_act = ScanActivity(
        batch_id=batch_id,
        scan_type="qr",
        latitude=latitude,
        longitude=longitude,
        region=region
    )
    db.add(scan_act)
    await db.flush() # Populate scan_act.id
    
    # Save Verification Log
    qr_verif = QRVerification(
        scan_activity_id=scan_act.id,
        batch_number=payload.batch_number,
        serialization_code=payload.serialization_code,
        signature_valid=crypto_res["signature_valid"],
        verification_status=crypto_res["verification_status"],
        signature_token=crypto_res["signature_token"]
    )
    db.add(qr_verif)
    await db.commit()
    
    return QRVerifyResponse(
        signature_valid=crypto_res["signature_valid"],
        verification_status=crypto_res["verification_status"],
        batch_status=batch_status,
        signature_token=crypto_res["signature_token"]
    )
