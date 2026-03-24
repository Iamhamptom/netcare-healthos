# SA Healthcare Facility Raw Data Sources

**Generated**: 2026-03-24
**Purpose**: Raw data files for building SA's most comprehensive healthcare facility database
**Current merged output**: `../sa_facilities_merged.csv` (6,829 unique facilities)

## Folder Structure

### `/government/` — Official NDoH & WHO data
| File | Records | Fields | Source |
|------|---------|--------|--------|
| `healthestablishments-facilities.csv` | 3,418 | name, type, ownership, province, district, municipality, code | Scraped from healthestablishments.org.za API |
| `healthestablishments-districts.json` | 61 districts | district_id, name, province | Same source |
| `who-mfl-sa-4303.csv` | 4,303 | name, type, ownership, lat, lon, source | WHO/KEMRI Sub-Saharan Africa MFL via HDX |
| `phc-spider-3411.json` | 3,411 | name, type, ownership, province, district, municipality, lat, lon, address, email, Ideal Clinic score, WBOT, HPRS | Scraped by Kebalepile from healthestablishments.org.za |

### `/osm/` — OpenStreetMap data
| File | Records | Fields | Source |
|------|---------|--------|--------|
| `overpass-sa-health-3260.csv` | 3,260 | id, name, amenity, healthcare, addr:city, addr:street, phone, website, lat, lon | Fresh Overpass API query 2026-03-24 |
| `healthsites-io-3055.csv` | 3,055 | 34 fields incl. name, amenity, lat, lon, operator, beds, staff, dispensing, wheelchair, emergency | Healthsites.io via HDX |

### `/dsfsi/` — University of Pretoria COVID-19 SA data
| File | Records | Key Data |
|------|---------|----------|
| `dsfsi_hospitals_v1.csv` | 945 | Name, lat/lon, category, province, district, beds (usable/approved/surgical), surgeons, theatres, total staff, services, webpage |
| `dsfsi_public.csv` | 856 | Name, lat/lon, category, province, district |
| `dsfsi_public_ext.csv` | 859 | Name, type, min/max capacity, speciality services, COVID readiness |
| `dsfsi_private.csv` | 430 | Hospital name, lat/lon, province |
| `dsfsi_contacts.csv` | 887 | Name, CEO, postal/physical address, phone, email |
| `dsfsi_vacc.csv` | 1,396 | Vaccination site name, province, district, sub-district, address, days/week, type |
| `dsfsi_CommunityHealthCenters.csv` | 287 | Name, lat/lon, province, district, municipality, address |
| `dsfsi_CommunityDayCentre.csv` | 74 | Same fields |
| `dsfsi_EMS_Stations.csv` | 678 | Name, lat/lon, province, district, municipality, address |
| `dsfsi_LongtermCare.csv` | 121 | Name, lat/lon, ownership |
| `dsfsi_CorrectionalCentre.csv` | 259 | Health facilities in correctional centres |
| `dsfsi_testing.csv` | 51 | COVID testing sites with lat/lon, address, contact |

### `/sahpra/` — SA Health Products Regulatory Authority
| File | Records | Key Data |
|------|---------|----------|
| `sahpra-licensed-establishments-flat.csv` | 281 | Pharmaceutical manufacturers, distributors, bond stores — company, licence, address, phone, email, pharmacist |

### `/municipality/` — Metro & Provincial scraped data
| File | Records | Source |
|------|---------|--------|
| `capetown_clinics_and_healthcare_facilities.csv` | 50 | City of Cape Town website |
| `ekurhuleni_clinics_directory.csv` | 37 | Ekurhuleni metro website |
| `ekurhuleni_hospitals_and_additional.csv` | 15 | Same |
| `ethekwini_hospitals.csv` | 17 | eThekwini metro website |
| `ethekwini_primary_healthcare.csv` | 9 | Same |
| `tshwane_24_primary_healthcare_clinics.csv` | 24 | City of Tshwane website |
| `tshwane_all_health_facilities.csv` | varies | Same |
| `johannesburg_health_facilities.csv` | 14 | City of Joburg website |
| `buffalo_city_clinics.csv` | 15 | Buffalo City metro |
| `gauteng_public_hospitals.csv` | 31 | Gauteng Provincial Health |
| `kzn_public_hospitals.csv` | 35 | KZN Health Dept |
| `limpopo_public_hospitals.csv` | 34 | Limpopo Health |
| `mpumalanga_public_hospitals.csv` | 35 | Mpumalanga Health |
| `freestate_health_facilities_by_district.csv` | varies | Free State Health |
| `eastern_cape_health_institutions.csv` | 16 | EC Health |
| `western_cape_public_hospitals.csv` | 20 | WC Government Health |
| `north_west_public_hospitals.csv` | 22 | NW Health |
| `northern_cape_public_hospitals.csv` | 16 | NC Health |

### PDFs (need conversion to CSV — 7 files)
- `capetown_clinics_contact_list.pdf` — Full Cape Town clinic contacts
- `freestate_health_institutions_contact_list.pdf` — All FS health institutions with contacts
- `freestate_mangaung_hospitals.pdf` — Mangaung hospitals brochure
- `gems_hospital_network_eastern_cape.pdf` — GEMS hospital network EC
- `gems_hospital_network_freestate.pdf` — GEMS hospital network FS
- `gems_hospital_network_kzn.pdf` — GEMS hospital network KZN
- `gems_hospital_network_western_cape.pdf` — GEMS hospital network WC

## What's NOT here yet (unlocks to 40K+)
1. **CSIR MFL** (mfl.csir.co.za) — 51,928 facilities, needs free registration (hissupport@health.gov.za)
2. **SAPC pharmacy register** — 4,000+ pharmacies, search-only (no bulk export)
3. **HPCSA practice register** — 40,000+ practitioners, search-only
4. **healthestablishments.org.za detailed scrape** — GPS for each of the 3,418 facilities (background task was running)
5. **BHF PCNS** — 70,000 practice numbers (paid, R35K+/year)
