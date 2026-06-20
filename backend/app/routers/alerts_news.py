from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional

from app.db import get_db
from app.schemas import AlertNewsItem
from app.services.alert_engine import AlertEngine
from app.models import RegionalRiskMap

router = APIRouter(prefix="/alerts", tags=["Alerts & Regulatory News Hub"])

@router.get("/news", response_model=List[AlertNewsItem])
async def get_alerts_news(
    region: Optional[str] = Query(None, description="Filter alerts by target region"),
    limit: int = Query(20, description="Max number of alerts to retrieve"),
    db: AsyncSession = Depends(get_db)
):
    # Fetch regional risk profiles to pass to the AlertEngine
    stmt = select(RegionalRiskMap)
    res = await db.execute(stmt)
    risk_records = res.scalars().all()
    
    risks = [
        {"region": r.region, "threat_index": r.threat_index}
        for r in risk_records
    ]
    
    # Generate combined alerts feed
    alerts = AlertEngine.get_alerts(risks)
    
    # Apply filtering by region if requested
    if region:
        # Check if the alert details mention the region
        filtered_alerts = []
        for alert in alerts:
            # We match if region name is in title/body/region field
            if region.lower() in alert.title.lower() or region.lower() in alert.message_body.lower():
                filtered_alerts.append(alert)
        alerts = filtered_alerts
        
    return alerts[:limit]
