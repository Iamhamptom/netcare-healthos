# South African Healthcare Facility Data — Collection Summary
Generated: 2026-03-24

## Successfully Scraped Sources

### 1. healthestablishments.org.za (NDoH Primary Health Care)
- **API discovered**: `/Home/FacilitySearch?name={letter}` (JSON, double-encoded)
- **Detail API**: `/Home/FacilityInformation?code={facilityId}` (JSON with lat/long, address, type, ownership, Ideal Clinic score)
- **Other endpoints**: `/Home/ProvinceList`, `/Home/DistrictData?ou2code={code}`
- **Data**: 3,418 facilities with ID, name, province, district, sub-district, org unit codes
- **Detailed data** (background scrape): lat/long, address, facility type, ownership, HPRS status, Ideal Clinic score, WBOT linkage
- **Files**: `/tmp/healthestablishments-facilities.csv`, `/tmp/healthestablishments-detailed.csv`

### 2. Humanitarian Data Exchange (data.humdata.org)
- **healthsites.io SA**: 3,055 facilities with coordinates, amenity type, operator, speciality, wheelchair access, opening hours
- **OpenStreetMap export**: 1,872 health facility points with GeoJSON geometry
- **Sub-Saharan Africa XLSX**: 98,745 facilities across 50 countries (needs filtering for ZAF)
- **Files**: `/tmp/south-africa-healthsites.csv`, `/tmp/za-health-osm-points/*.geojson`, `/tmp/subsaharan-health-facilities.xlsx`

### 3. SAHPRA Licensed Establishments (sahpra.org.za)
- **API discovered**: WordPress Ninja Tables AJAX at `/wp-admin/admin-ajax.php`
- **Table IDs**: 6964 (API Mfg), 6972 (Bond Stores), 6591 (Cannabis), 6868 (Distributors), 9444 (Gas Mfg), 7144 (Cert of Product Reg)
- **Data**: 281 licensed establishments with company name, licence number, address, phone, email, pharmacist, licence type
- **Files**: `/tmp/sahpra-licensed-establishments-flat.csv`

### 4. DSFSI/COVID19ZA GitHub Repository
- **Source**: https://github.com/dsfsi/covid19za/tree/master/data
- **Public hospitals**: 856 with lat/long, district, beds, ICU beds, type, services
- **Private hospitals**: 430 with lat/long, province
- **Hospital contacts**: 887 with CEO name, postal/physical address, phone, email
- **Extended details**: 859 with operational functions, capacity, speciality services, COVID readiness
- **Vaccination sites**: 1,397 with address, open days, type
- **Testing sites**: 51 with lat/long, address, contact
- **District counts**: 52 districts with hospital counts by type and population
- **Files**: `/tmp/za-dsfsi-health_system_za_*.csv` (11 files)

## Sources Requiring Authentication

### 5. CSIR Master Facility List (mfl.csir.co.za)
- **Total facilities**: 51,928 (public + private)
- **API base**: `/user-manager/api/facility/`
- **Endpoints found**: `getFacilityCount`, `getLatestUpdates`
- **Status**: All endpoints return 401 — requires user registration and login
- **Contact**: hissupport@health.gov.za or 080 034 4777

### 6. DHMIS Data Dictionary (dd.dhmis.org)
- **API pattern**: DHIS2 standard — `api/organisationUnits.json`, `api/sqlViews/{id}/data.csv`
- **Status**: Requires DHIS2 authentication (username/password)

### 7. healthsites.io API v3
- **Status**: Requires API key registration at https://healthsites.io/enrollment/form

## Sources With No Bulk Data Access

### 8. SAPC Pharmacy Council (pharmcouncil.co.za)
- Search form at `interns.pharma.mm3.co.za/SearchRegister` — no bulk API, individual lookups only

### 9. HPCSA Practitioner Registry
- Form at `hpcsaonline.custhelp.com/app/i_reg_form` — individual searches only

### 10. data.gov.za
- Site was down (ECONNREFUSED) during collection

## Additional Resources Identified (Not Downloaded)
- Medicine Price Registry: https://mpr.code4sa.org/ (SSL issue)
- ICPA Pharmacy Finder: https://icpa.co.za/find-a-pharmacy/ (interactive map, no bulk API)
- SAHPRA Registered Products DB: https://medapps.sahpra.org.za:6006/
- WHO AFRO MFL: https://aho.afro.who.int/mfl/af (requires interaction)
- District Health Barometer: https://www.hst.org.za/publications/Pages/DISTRICT-HEALTH-BAROMETER-201819.aspx
