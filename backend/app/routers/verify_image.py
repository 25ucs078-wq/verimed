from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import os
import uuid

from app.db import get_db
from app.config import settings
from app.schemas import AIAnalysisResponse, Deviations
from app.services.cv_engine import CVEngine
from app.models import PackagingImage, AIAnalysisResult, ScanActivity, Batch

router = APIRouter(prefix="/verify", tags=["CV & Packaging Analysis"])

@router.post("/image", response_model=AIAnalysisResponse)
async def verify_image(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    region: Optional[str] = Form(None),
    batch_number: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    # Verify file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPG, JPEG, and PNG are allowed."
        )
        
    try:
        image_bytes = await file.read()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not read uploaded file."
        )

    # Perform CV Analysis Simulation
    analysis_res = CVEngine.analyze_packaging(image_bytes)
    
    # Save upload record
    # (In a real system, we'd save to S3/Disk; we'll simulate paths here)
    file_id = str(uuid.uuid4())
    simulated_path = f"/uploads/packages/{file_id}{ext}"
    image_hash = str(hash(image_bytes))
    
    # Check if we can map this image to an existing batch
    batch_id = None
    if batch_number:
        stmt = select(Batch).where(Batch.batch_number == batch_number)
        res = await db.execute(stmt)
        batch = res.scalars().first()
        if batch:
            batch_id = batch.id
            
    # Create DB records
    pkg_img = PackagingImage(
        image_hash=image_hash,
        file_path=simulated_path,
        detected_label="Verified Medicine Package"
    )
    db.add(pkg_img)
    await db.flush() # Populate pkg_img.id
    
    ai_result = AIAnalysisResult(
        packaging_image_id=pkg_img.id,
        logo_deviation=analysis_res["deviations"]["logo"],
        typography_deviation=analysis_res["deviations"]["typography"],
        color_gamut_deviation=analysis_res["deviations"]["color_gamut"],
        confidence_score=analysis_res["confidence_score"],
        is_authentic=analysis_res["is_authentic"],
        flagged_categories=analysis_res["flagged_categories"]
    )
    db.add(ai_result)
    
    # Add to ScanActivity
    scan_act = ScanActivity(
        batch_id=batch_id,
        scan_type="image",
        latitude=latitude,
        longitude=longitude,
        region=region
    )
    db.add(scan_act)
    await db.commit()
    
    # Structure return
    return AIAnalysisResponse(
        is_authentic=analysis_res["is_authentic"],
        confidence_score=analysis_res["confidence_score"],
        deviations=Deviations(**analysis_res["deviations"]),
        flagged_categories=analysis_res["flagged_categories"]
    )
