import csv, glob, os, json, math

def get_brazil_state(lat, lon):
    # Latitude approx -34 to +5, Longitude approx -74 to -35
    if lat > 1.0 and lon < -59.0:
        return 'Roraima'
    if lat > 0.0 and lon >= -54.0:
        return 'Amapá'
    if lon < -67.0:
        return 'Acre'
    if -10.0 <= lat <= -7.5 and -66.0 <= lon <= -60.0:
        return 'Rondônia'
    if lat >= -9.0 and lon < -55.0:
        return 'Amazonas'
    if -10.0 <= lat <= 2.0 and -57.0 <= lon <= -46.0:
        return 'Pará'
    if -18.0 <= lat <= -7.0 and -61.0 <= lon <= -50.0:
        return 'Mato Grosso'
    if -14.0 <= lat <= -5.0 and -50.0 <= lon <= -46.0:
        return 'Tocantins'
    if -10.0 <= lat <= -2.0 and -48.0 <= lon <= -41.0:
        return 'Maranhão'
    if -11.0 <= lat <= -2.5 and -46.0 <= lon <= -40.0:
        return 'Piauí'
    if -18.5 <= lat <= -8.5 and -46.5 <= lon <= -37.0:
        return 'Bahia'
    if -19.5 <= lat <= -12.5 and -53.0 <= lon <= -46.0:
        return 'Goiás'
    if -24.0 <= lat <= -17.0 and -58.0 <= lon <= -51.0:
        return 'Mato Grosso do Sul'
    if -23.0 <= lat <= -14.0 and -51.0 <= lon <= -39.0:
        return 'Minas Gerais'
    if -25.0 <= lat <= -19.5 and -53.0 <= lon <= -44.0:
        return 'São Paulo'
    if -26.5 <= lat <= -22.5 and -54.5 <= lon <= -48.0:
        return 'Paraná'
    return 'Central Brazil'

def get_canada_province(lat, lon):
    if lon < -120.0 and lat < 60.0:
        return 'British Columbia'
    if -120.0 <= lon <= -110.0 and lat < 60.0:
        return 'Alberta'
    if -110.0 <= lon <= -101.5 and lat < 60.0:
        return 'Saskatchewan'
    if -101.5 <= lon <= -95.0 and lat < 60.0:
        return 'Manitoba'
    if -95.0 <= lon <= -79.5 and lat < 57.0:
        return 'Ontario'
    if -79.5 <= lon <= -57.0 and lat < 62.0:
        return 'Quebec'
    if lat >= 60.0 and lon < -120.0:
        return 'Yukon'
    if lat >= 60.0:
        return 'Northwest Territories'
    return 'Boreal Belt'

def extract_dataset():
    records = []
    
    # 1. Brazil (2020-2024): 300 per year = 1,500 real hotspots
    for yr in [2020, 2021, 2022, 2023, 2024]:
        path = f'../brazil/viirs-jpss1_{yr}_Brazil.csv'
        if not os.path.exists(path):
            continue
        print(f'Reading {path}...')
        candidates = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    frp = float(row.get('frp', 0))
                    # Pick fires with notable FRP to represent intense fires
                    if frp >= 4.0:
                        candidates.append(row)
                except:
                    pass
        
        target = 300
        step = max(1, len(candidates) // target)
        sampled = candidates[::step][:target]
        print(f'  -> Sampled {len(sampled)} points for Brazil {yr}')
        
        for idx, row in enumerate(sampled):
            lat = round(float(row['latitude']), 4)
            lon = round(float(row['longitude']), 4)
            frp = round(float(row['frp']), 1)
            tempK = round(float(row['bright_ti4']), 1)
            conf_raw = row.get('confidence', 'n').lower()
            conf = 98 if conf_raw == 'h' else (85 if conf_raw == 'n' else 65)
            date_det = row.get('acq_date', f'{yr}-08-15')
            time_raw = row.get('acq_time', '1630').zfill(4)
            time_fmt = f'{time_raw[:2]}:{time_raw[2:]} UTC'
            
            state = get_brazil_state(lat, lon)
            status = 'Critical' if frp > 120 else ('High' if frp > 35 else 'Contained')
            acres = int(frp * 85 + 1200)
            
            # Day of year
            try:
                parts = date_det.split('-')
                doy = int(parts[1]) * 30 + int(parts[2])
            except:
                doy = 230
                
            records.append({
                'id': f'HOT-BRA-{yr}-{idx+1:03d}',
                'name': f'{state} Active Sector ({frp} MW)',
                'country': 'Brazil',
                'stateOrRegion': state,
                'lat': lat,
                'lon': lon,
                'frp': frp,
                'tempK': tempK,
                'confidence': conf,
                'satellite': 'VIIRS',
                'status': status,
                'acres': acres,
                'timeDetected': time_fmt,
                'dateDetected': date_det,
                'region': 'Brazil',
                'year': yr,
                'dayOfYear': doy
            })

    # 2. Canada (2020-2024): 240 per year = 1,200 real hotspots
    for yr in [2020, 2021, 2022, 2023, 2024]:
        path = f'../canada/viirs-jpss1_{yr}_Canada.csv'
        if not os.path.exists(path):
            continue
        print(f'Reading {path}...')
        candidates = []
        with open(path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    frp = float(row.get('frp', 0))
                    if frp >= 4.0:
                        candidates.append(row)
                except:
                    pass
        
        target = 240
        step = max(1, len(candidates) // target)
        sampled = candidates[::step][:target]
        print(f'  -> Sampled {len(sampled)} points for Canada {yr}')
        
        for idx, row in enumerate(sampled):
            lat = round(float(row['latitude']), 4)
            lon = round(float(row['longitude']), 4)
            frp = round(float(row['frp']), 1)
            tempK = round(float(row['bright_ti4']), 1)
            conf_raw = row.get('confidence', 'n').lower()
            conf = 99 if conf_raw == 'h' else (88 if conf_raw == 'n' else 68)
            date_det = row.get('acq_date', f'{yr}-07-10')
            time_raw = row.get('acq_time', '2015').zfill(4)
            time_fmt = f'{time_raw[:2]}:{time_raw[2:]} UTC'
            
            prov = get_canada_province(lat, lon)
            status = 'Critical' if frp > 140 else ('High' if frp > 40 else 'Contained')
            acres = int(frp * 110 + 1800)
            
            try:
                parts = date_det.split('-')
                doy = int(parts[1]) * 30 + int(parts[2])
            except:
                doy = 190
                
            records.append({
                'id': f'HOT-CAN-{yr}-{idx+1:03d}',
                'name': f'{prov} Boreal Fire Front ({frp} MW)',
                'country': 'Canada',
                'stateOrRegion': prov,
                'lat': lat,
                'lon': lon,
                'frp': frp,
                'tempK': tempK,
                'confidence': conf,
                'satellite': 'VIIRS',
                'status': status,
                'acres': acres,
                'timeDetected': time_fmt,
                'dateDetected': date_det,
                'region': 'Canada',
                'year': yr,
                'dayOfYear': doy
            })

    output_json = '../Recreate Dark Enterprise Dashboard/src/data/nasa_firms_hotspots.json'
    with open(output_json, 'w', encoding='utf-8') as out:
        json.dump(records, out, indent=2)
    print(f'Done! Successfully saved {len(records)} authentic NASA FIRMS hotspots to {output_json}')

if __name__ == '__main__':
    extract_dataset()
