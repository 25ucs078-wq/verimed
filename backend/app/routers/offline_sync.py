from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.db import get_db
from app.schemas import OfflineSyncRequest, OfflineSyncResponse, MedicineSchema, BatchSchema, ReportCreate, ReportResponse
from app.models import Medicine, Batch, ScanActivity, SupplyChainAnomaly, Report, User

router = APIRouter(tags=["Offline Sync & Reports"])

@router.post("/offline/sync", response_model=OfflineSyncResponse)
async def offline_sync(
    payload: OfflineSyncRequest,
    db: AsyncSession = Depends(get_db)
):
    # Retrieve default user for attribution
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    default_user = res.scalars().first()
    user_id = default_user.id if default_user else None

    # Bulk insert cached scan activities
    for item in payload.cached_scans:
        # Resolve batch_id if batch_number is in metadata
        batch_id = None
        batch_number = item.metadata.get("batch_number")
        if batch_number:
            b_stmt = select(Batch).where(Batch.batch_number == batch_number)
            b_res = await db.execute(b_stmt)
            batch = b_res.scalars().first()
            if batch:
                batch_id = batch.id

        scan_act = ScanActivity(
            user_id=user_id,
            batch_id=batch_id,
            scan_type=item.scan_type,
            latitude=item.latitude,
            longitude=item.longitude,
            region=item.region,
            timestamp=item.timestamp
        )
        db.add(scan_act)
        await db.flush()

        # If it was counterfeit, flag as anomaly
        is_suspicious = item.metadata.get("is_suspicious", False)
        if is_suspicious:
            anom = SupplyChainAnomaly(
                scan_activity_id=scan_act.id,
                risk_score=0.85,
                flags=["offline_queued_suspicion"],
                details={"offline_meta": item.metadata}
            )
            db.add(anom)

    await db.commit()

    # Build Refreshed Cache Bundle
    # Get 50 medicines
    med_stmt = select(Medicine).limit(50)
    med_res = await db.execute(med_stmt)
    medicines = med_res.scalars().all()

    # Get 100 batches
    batch_stmt = select(Batch).limit(100)
    batch_res = await db.execute(batch_stmt)
    batches = batch_res.scalars().all()

    # Create a QR lookup tree (mapping batch_number to status & metadata)
    qr_tree = {}
    for b in batches:
        qr_tree[b.batch_number] = {
            "status": b.status,
            "hologram_status": b.hologram_status,
            "expiry_date": b.expiry_date.isoformat()
        }

    return OfflineSyncResponse(
        medicines=[
            MedicineSchema(
                id=m.id,
                generic_name=m.generic_name,
                brand_name=m.brand_name,
                manufacturer_name=m.manufacturer_name,
                manufacturer_address=m.manufacturer_address,
                manufacturer_license_no=m.manufacturer_license_no,
                dosage_form=m.dosage_form,
                strength=m.strength,
                packaging_size=m.packaging_size
            )
            for m in medicines
        ],
        batches=[
            BatchSchema(
                id=b.id,
                medicine_id=b.medicine_id,
                batch_number=b.batch_number,
                manufacturing_date=b.manufacturing_date,
                expiry_date=b.expiry_date,
                status=b.status,
                hologram_status=b.hologram_status
            )
            for b in batches
        ],
        qr_lookup_tree=qr_tree,
        cache_expiry=datetime.utcnow() + timedelta(days=7)
    )

@router.post("/reports", response_model=ReportResponse)
async def create_report(
    payload: ReportCreate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).limit(1)
    res = await db.execute(stmt)
    default_user = res.scalars().first()
    user_id = default_user.id if default_user else None

    # Resolve batch
    batch_id = None
    if payload.batch_number:
        b_stmt = select(Batch).where(Batch.batch_number == payload.batch_number)
        b_res = await db.execute(b_stmt)
        batch = b_res.scalars().first()
        if batch:
            batch_id = batch.id

    # Create ScanActivity to anchor coordinates
    scan_act = ScanActivity(
        user_id=user_id,
        batch_id=batch_id,
        scan_type="report_anchor",
        latitude=payload.latitude,
        longitude=payload.longitude,
        region=payload.region
    )
    db.add(scan_act)
    await db.flush()

    report = Report(
        user_id=user_id,
        scan_activity_id=scan_act.id,
        report_type=payload.report_type,
        notes=payload.notes,
        status="pending"
    )
    db.add(report)
    await db.commit()

    return ReportResponse(
        id=report.id,
        status=report.status,
        created_at=report.created_at
    )
