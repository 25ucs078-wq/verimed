from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db import get_db
from app.schemas import AnomalyDetectRequest, AnomalyDetectResponse, RiskMapItem
from app.services.risk_engine import RiskEngine
from app.models import RegionalRiskMap

router = APIRouter(tags=["Supply-Chain Anomaly & Mapping"])

@router.post("/anomalies/detect", response_model=AnomalyDetectResponse)
async def detect_anomalies(
    payload: AnomalyDetectRequest,
    regional_baseline: float = 0.2
):
    # Perform analysis using RiskEngine
    analysis = RiskEngine.detect_anomalies(payload.scan_history, regional_baseline)
    
    return AnomalyDetectResponse(
        risk_score=analysis["risk_score"],
        flags=analysis["flags"],
        details=analysis["details"]
    )

@router.get("/risk-map", response_model=List[RiskMapItem])
async def get_risk_map(
    db: AsyncSession = Depends(get_db)
):
    stmt = select(RegionalRiskMap)
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    return [
        RiskMapItem(
            region=r.region,
            threat_index=r.threat_index,
            counterfeit_percent=r.counterfeit_percent,
            seizure_count=r.seizure_count,
            trend=r.trend
        )
        for r in records
    ]
