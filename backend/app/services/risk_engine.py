from typing import List, Dict, Any
import math
from datetime import datetime
from app.schemas import ScanHistoryItem

class RiskEngine:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        # Haversine formula to compute distance in km
        R = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = math.sin(d_lat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @classmethod
    def detect_anomalies(cls, scan_history: List[ScanHistoryItem], regional_baseline: float = 0.2) -> dict:
        flags = []
        details = {}
        
        # Sort scans by timestamp
        sorted_scans = sorted(scan_history, key=lambda x: x.timestamp)
        
        # 1. Geographic Impossible & Timing Anomalies
        for i in range(1, len(sorted_scans)):
            prev = sorted_scans[i - 1]
            curr = sorted_scans[i]
            
            time_diff = (curr.timestamp - prev.timestamp).total_seconds()
            dist = cls.calculate_distance(
                prev.location.lat, prev.location.lng,
                curr.location.lat, curr.location.lng
            )
            
            # Speed in km/h
            speed = (dist / (time_diff / 3600.0)) if time_diff > 0 else float('inf')
            
            if speed > 900.0 and dist > 10.0:  # Exceeds jet speed
                flags.append("geographic_impossible")
                details["geographic_impossible"] = {
                    "distance_km": round(dist, 2),
                    "time_seconds": time_diff,
                    "implied_speed_kmh": round(speed, 2)
                }
            
            if time_diff < 5 and dist > 1.0:  # Same item scanned far away within seconds
                flags.append("timing_anomaly")
                details["timing_anomaly"] = {
                    "time_seconds": time_diff,
                    "distance_km": round(dist, 2)
                }

        # 2. Duplicate Scan Check
        # Check if the same batch/id is scanned multiple times in a short interval or in distant cities
        batch_locations = {}
        for scan in sorted_scans:
            if scan.batch_id:
                if scan.batch_id not in batch_locations:
                    batch_locations[scan.batch_id] = []
                batch_locations[scan.batch_id].append(scan)
                
        for batch_id, scans in batch_locations.items():
            if len(scans) > 2:
                flags.append("duplicate_scan")
                details["duplicate_scan"] = {
                    "batch_id": batch_id,
                    "total_scans": len(scans)
                }

        # 3. Route Deviation & Temperature Break (Simulated based on counts/region)
        # If there are scans in known high-risk regions or unexpected remote areas
        for scan in sorted_scans:
            # Let's say if lat/lng is 0, 0, or is specifically flagged
            if scan.location.lat == 0.0 and scan.location.lng == 0.0:
                flags.append("route_deviation")
                details["route_deviation"] = "Zero coordinates scanned; suspicious transit lane."
                
            # If batch_id ends in "TEMP", trigger temperature_break anomaly
            if scan.batch_id and "TEMP" in scan.batch_id:
                flags.append("temperature_break")
                details["temperature_break"] = "Cold-chain alert: temperature logged at 28.4°C (expected max 8.0°C)."
                
            # Quantity mismatches simulated
            if scan.batch_id and "QTY" in scan.batch_id:
                flags.append("quantity_mismatch")
                details["quantity_mismatch"] = "Quantity shipped (10,000 units) does not match scanned scan receipt count."

        # Compute counts for risk score
        suspicious_rate = 0.0
        counterfeit_rate = 0.0
        
        anomaly_count = len(flags)
        if anomaly_count > 0:
            suspicious_rate = min(1.0, 0.3 * anomaly_count)
            counterfeit_rate = min(1.0, 0.2 * anomaly_count)
            
        # Risk = suspicious_rate*0.4 + counterfeit_rate*0.35 + anomaly_count*0.15 + regional_baseline*0.1
        risk_score = (suspicious_rate * 0.4) + (counterfeit_rate * 0.35) + (min(4, anomaly_count) * 0.15) + (regional_baseline * 0.1)
        risk_score = min(1.0, max(0.0, risk_score))
        
        return {
            "risk_score": round(risk_score, 4),
            "flags": list(set(flags)),
            "details": details
        }
