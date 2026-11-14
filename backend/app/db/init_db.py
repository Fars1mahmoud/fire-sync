from sqlalchemy import text
from app.db.session import engine, SessionLocal, Base
from app.db.models import Country, Region, SatelliteSource
from app.core.logging import logger

def init_database(target_engine=None, session_factory=None):
    """Initializes PostGIS extensions, creates all tables, and seeds initial reference data"""
    use_engine = target_engine or engine
    use_session_maker = session_factory or SessionLocal

    logger.info("Initializing database extensions and tables...")
    
    if use_engine.dialect.name == "postgresql":
        with use_engine.connect() as conn:
            try:
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
                conn.execute(text('CREATE EXTENSION IF NOT EXISTS postgis;'))
                conn.commit()
                logger.info("PostGIS extension confirmed.")
            except Exception as e:
                logger.warning(f"Could not enable PostGIS extension (might already exist or non-superuser): {e}")

    # Create all tables defined in models.py
    Base.metadata.create_all(bind=use_engine)
    logger.info("Database tables verified/created.")

    # Seed baseline reference data
    db = use_session_maker()
    try:
        # 1. Countries
        countries_data = [
            {"iso_code": "BRA", "name": "Brazil"},
            {"iso_code": "CAN", "name": "Canada"},
            {"iso_code": "EGY", "name": "Egypt"},
            {"iso_code": "GRC", "name": "Greece"},
            {"iso_code": "USA", "name": "United States"},
        ]
        for c in countries_data:
            existing = db.query(Country).filter(Country.iso_code == c["iso_code"]).first()
            if not existing:
                db.add(Country(**c))
        
        # 2. Satellite Sources
        sources_data = [
            {
                "id": "VIIRS_N20",
                "satellite": "N20",
                "instrument": "VIIRS",
                "provider": "NASA FIRMS / NOAA",
                "product_id": "VNP14IMGTDL (JPSS-1)",
                "spatial_resolution_m": 375.0,
                "version": "2"
            },
            {
                "id": "MODIS_AQUA",
                "satellite": "Aqua",
                "instrument": "MODIS",
                "provider": "NASA FIRMS",
                "product_id": "MYD14",
                "spatial_resolution_m": 1000.0,
                "version": "6.1"
            },
            {
                "id": "MODIS_TERRA",
                "satellite": "Terra",
                "instrument": "MODIS",
                "provider": "NASA FIRMS",
                "product_id": "MOD14",
                "spatial_resolution_m": 1000.0,
                "version": "6.1"
            }
        ]
        for s in sources_data:
            existing = db.query(SatelliteSource).filter(SatelliteSource.id == s["id"]).first()
            if not existing:
                db.add(SatelliteSource(**s))

        # 3. Default Monitoring Regions (supporting existing frontend regions + Brazil and Canada datasets)
        regions_data = [
            {
                "id": "brazil",
                "country_code": "BRA",
                "name_en": "Brazil (Amazon & Cerrado)",
                "name_ar": "البرازيل (حوض الأمازون وسيرادو)",
                "flag": "🇧🇷",
                "center_lat": -10.0,
                "center_lon": -55.0,
                "default_zoom": 5,
                "bounds_sw_lat": -33.75,
                "bounds_sw_lon": -73.99,
                "bounds_ne_lat": 5.27,
                "bounds_ne_lon": -34.79,
                "risk_baseline": "Extreme",
                "description_en": "Amazon basin, Pantanal wetlands, and Cerrado savanna biome fire fronts.",
                "description_ar": "حوض الأمازون ومستنقعات بانتانال وسافانا سيرادو."
            },
            {
                "id": "canada",
                "country_code": "CAN",
                "name_en": "Canada (Boreal & West)",
                "name_ar": "كندا (الغابات الشمالية والغرب)",
                "flag": "🇨🇦",
                "center_lat": 56.13,
                "center_lon": -106.35,
                "default_zoom": 4,
                "bounds_sw_lat": 41.68,
                "bounds_sw_lon": -141.0,
                "bounds_ne_lat": 83.11,
                "bounds_ne_lon": -52.62,
                "risk_baseline": "Critical",
                "description_en": "Canadian Boreal forest complex, Northwest Territories, Alberta and Quebec belts.",
                "description_ar": "الغابات الشمالية الكندية والمقاطعات الغربية."
            },
            {
                "id": "mediterranean",
                "country_code": "GRC",
                "name_en": "Mediterranean Basin",
                "name_ar": "حوض البحر الأبيض المتوسط",
                "flag": "🇬🇷",
                "center_lat": 38.3,
                "center_lon": 23.8,
                "default_zoom": 6,
                "bounds_sw_lat": 30.0,
                "bounds_sw_lon": -10.0,
                "bounds_ne_lat": 45.0,
                "bounds_ne_lon": 36.0,
                "risk_baseline": "Extreme",
                "description_en": "Southern Europe, Greece, Italy, and coastal Mediterranean fire zones.",
                "description_ar": "جنوب أوروبا واليونان وإيطاليا وحوض المتوسط."
            },
            {
                "id": "california",
                "country_code": "USA",
                "name_en": "California",
                "name_ar": "ولاية كاليفورنيا",
                "flag": "🇺🇸",
                "center_lat": 37.2,
                "center_lon": -119.5,
                "default_zoom": 6,
                "bounds_sw_lat": 32.5,
                "bounds_sw_lon": -124.5,
                "bounds_ne_lat": 42.0,
                "bounds_ne_lon": -114.1,
                "risk_baseline": "Critical",
                "description_en": "Sierra Nevada, chaparral belts, and Diablo wind wildfire sectors.",
                "description_ar": "غابات سييرا نيفادا وأحزمة الشابارال في كاليفورنيا."
            },
            {
                "id": "egypt",
                "country_code": "EGY",
                "name_en": "Egypt (Delta & Coast)",
                "name_ar": "مصر (الدلتا والساحل)",
                "flag": "🇪🇬",
                "center_lat": 30.0,
                "center_lon": 31.2,
                "default_zoom": 7,
                "bounds_sw_lat": 22.0,
                "bounds_sw_lon": 24.7,
                "bounds_ne_lat": 31.8,
                "bounds_ne_lon": 36.9,
                "risk_baseline": "Moderate",
                "description_en": "Nile Delta, Mediterranean coast, and Nile valley agricultural thermal hotspots.",
                "description_ar": "دلتا النيل والساحل الشمالي ووادي النيل ورصد البؤر الحرارية الزراعية."
            },
            {
                "id": "global",
                "country_code": None,
                "name_en": "Global (Beta)",
                "name_ar": "رصد كوكبي شامل",
                "flag": "🌐",
                "center_lat": 20.0,
                "center_lon": 0.0,
                "default_zoom": 2,
                "bounds_sw_lat": -90.0,
                "bounds_sw_lon": -180.0,
                "bounds_ne_lat": 90.0,
                "bounds_ne_lon": 180.0,
                "risk_baseline": "Moderate",
                "description_en": "Planetary satellite hotspot monitoring across all continents.",
                "description_ar": "رصد كوكبي شامل للنقاط الحرارية الفضائية عبر جميع القارات."
            }
        ]
        for r in regions_data:
            existing = db.query(Region).filter(Region.id == r["id"]).first()
            if not existing:
                db.add(Region(**r))

        db.commit()
        logger.info("Baseline reference data seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
