import asyncio
import random
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Base, User, Medicine, Batch, RegionalRiskMap, ScanActivity, SupplyChainAnomaly
from app.db import engine, AsyncSessionLocal

# Seed parameters
MEDICINES_DATA = [
    {"generic_name": "Paracetamol", "brand_name": "Panadol", "dosage_form": "Tablet", "strength": "500mg", "packaging_size": "20s"},
    {"generic_name": "Amoxicillin", "brand_name": "Amoxil", "dosage_form": "Capsule", "strength": "500mg", "packaging_size": "15s"},
    {"generic_name": "Atorvastatin", "brand_name": "Lipitor", "dosage_form": "Tablet", "strength": "20mg", "packaging_size": "30s"},
    {"generic_name": "Metformin", "brand_name": "Glucophage", "dosage_form": "Tablet", "strength": "850mg", "packaging_size": "60s"},
    {"generic_name": "Omeprazole", "brand_name": "Prilosec", "dosage_form": "Capsule", "strength": "20mg", "packaging_size": "14s"},
    {"generic_name": "Amlodipine", "brand_name": "Norvasc", "dosage_form": "Tablet", "strength": "5mg", "packaging_size": "30s"},
    {"generic_name": "Ibuprofen", "brand_name": "Advil", "dosage_form": "Tablet", "strength": "400mg", "packaging_size": "24s"},
    {"generic_name": "Artesunate", "brand_name": "Artesun", "dosage_form": "Injection", "strength": "60mg", "packaging_size": "1 Vial"},
    {"generic_name": "Rabies Vaccine", "brand_name": "Rabivax-S", "dosage_form": "Injection", "strength": "2.5 IU", "packaging_size": "1 Dose"},
    {"generic_name": "Sildenafil", "brand_name": "Viagra", "dosage_form": "Tablet", "strength": "100mg", "packaging_size": "4s"}
]

MANUFACTURERS = [
    {"name": "GlaxoSmithKline", "address": "London, UK", "license": "GSK-UK-992"},
    {"name": "Pfizer Inc", "address": "New York, USA", "license": "PFI-US-108"},
    {"name": "Merck & Co", "address": "New Jersey, USA", "license": "MRK-US-451"},
    {"name": "Serum Institute of India", "address": "Pune, India", "license": "SII-IND-808"},
    {"name": "VeloPharm Ltd", "address": "Nairobi, Kenya", "license": "VLO-KE-120"},
    {"name": "AsiaVax Corp", "address": "Hanoi, Vietnam", "license": "AVX-VN-606"}
]

REGIONAL_RISKS = [
    {"region": "Sub-Saharan Africa", "threat_index": 0.85, "counterfeit_percent": 18.5, "seizure_count": 450, "trend": "increasing"},
    {"region": "South Asia", "threat_index": 0.72, "counterfeit_percent": 12.3, "seizure_count": 890, "trend": "stable"},
    {"region": "East Asia", "threat_index": 0.68, "counterfeit_percent": 9.8, "seizure_count": 1200, "trend": "increasing"},
    {"region": "North America", "threat_index": 0.45, "counterfeit_percent": 2.1, "seizure_count": 120, "trend": "decreasing"}
]

async def seed_data(session: AsyncSession):
    # Check if database is already seeded
    result = await session.execute(select(User).limit(1))
    if result.scalars().first():
        print("Database already seeded. Skipping...")
        return

    print("Seeding database with 50 genuine and 50 counterfeit records...")

    # 1. Create Default Users
    users = [
        User(name="Dr. Sarah Jenkins", email="sarah.jenkins@verimed.org", role="pharmacist"),
        User(name="John Doe", email="john.doe@gmail.com", role="patient"),
        User(name="System Monitor", email="monitor@verimed.org", role="admin")
    ]
    session.add_all(users)
    await session.commit()
    
    user_id = users[0].id

    # 2. Seed Regional Risk Map
    for rr in REGIONAL_RISKS:
        risk_map = RegionalRiskMap(**rr)
        session.add(risk_map)
    await session.commit()

    # 3. Create Medicines
    medicines = []
    for med in MEDICINES_DATA:
        mfg = random.choice(MANUFACTURERS)
        m = Medicine(
            generic_name=med["generic_name"],
            brand_name=med["brand_name"],
            manufacturer_name=mfg["name"],
            manufacturer_address=mfg["address"],
            manufacturer_license_no=mfg["license"],
            dosage_form=med["dosage_form"],
            strength=med["strength"],
            packaging_size=med["packaging_size"]
        )
        session.add(m)
        medicines.append(m)
    await session.commit()

    # 4. Create Batches (50 Genuine + 50 Counterfeit)
    batches = []
    
    # 50 Genuine Batches
    for i in range(50):
        med = random.choice(medicines)
        # Create standard batch
        b = Batch(
            medicine_id=med.id,
            batch_number=f"GEN-{100000 + i}",
            manufacturing_date=datetime.utcnow() - timedelta(days=random.randint(10, 300)),
            expiry_date=datetime.utcnow() + timedelta(days=random.randint(100, 700)),
            status="active",
            hologram_status="genuine"
        )
        session.add(b)
        batches.append(b)

    # 50 Counterfeit / Suspect Batches
    for i in range(50):
        med = random.choice(medicines)
        status = random.choice(["recalled", "expired", "active", "unknown"])
        hologram = random.choice(["fake_hologram", "none_hologram", "simulated_hologram"])
        # Some are recalled/expired, others look normal but have fake holograms
        b = Batch(
            medicine_id=med.id,
            batch_number=f"CNT-{200000 + i}",
            manufacturing_date=datetime.utcnow() - timedelta(days=random.randint(100, 500)),
            expiry_date=datetime.utcnow() - timedelta(days=random.randint(1, 90)) if status == "expired" else datetime.utcnow() + timedelta(days=random.randint(10, 300)),
            status=status,
            hologram_status=hologram
        )
        session.add(b)
        batches.append(b)

    await session.commit()

    # 5. Create some historic scans for dashboards and graphs
    # We want ~30 historic scans to show a trend on the client app
    regions = ["South Asia", "Sub-Saharan Africa", "East Asia", "North America"]
    
    for i in range(40):
        b = random.choice(batches)
        scan_type = "qr" if i % 2 == 0 else "image"
        # Genuine batches are mostly in North America/East Asia, Counterfeit mostly in Sub-Saharan Africa/South Asia
        is_cnt = b.batch_number.startswith("CNT-")
        if is_cnt:
            region = random.choice(["Sub-Saharan Africa", "South Asia"])
            lat = 9.0820 if region == "Sub-Saharan Africa" else 20.5937
            lng = 8.6753 if region == "Sub-Saharan Africa" else 78.9629
        else:
            region = random.choice(["North America", "East Asia", "South Asia"])
            lat = 37.0902 if region == "North America" else 35.8617
            lng = -95.7129 if region == "North America" else 104.1954
            
        # Add random offset to coordinates
        lat += random.uniform(-5.0, 5.0)
        lng += random.uniform(-5.0, 5.0)

        timestamp = datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        sa = ScanActivity(
            user_id=user_id,
            batch_id=b.id,
            scan_type=scan_type,
            latitude=lat,
            longitude=lng,
            region=region,
            timestamp=timestamp
        )
        session.add(sa)
        
        # If it was counterfeit, generate a supply chain anomaly entry
        if is_cnt and random.random() > 0.3:
            # Commit the scan activity to get ID
            await session.flush()
            anomaly_types = ["duplicate_scan", "geographic_impossible", "route_deviation", "temperature_break"]
            flags = random.sample(anomaly_types, k=random.randint(1, 2))
            
            anom = SupplyChainAnomaly(
                scan_activity_id=sa.id,
                risk_score=round(random.uniform(0.6, 0.95), 2),
                flags=flags,
                details={"message": "Seeded counterfeit anomaly scan"}
            )
            session.add(anom)
            
    await session.commit()
    print("Database seeding completed successfully.")

async def initialize_and_seed():
    async with engine.begin() as conn:
        # Create all tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        await seed_data(session)

if __name__ == "__main__":
    asyncio.run(initialize_and_seed())
