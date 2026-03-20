/**
 * Seed script for Netcare Health OS network data.
 * Populates: clinics, metrics, schemes, rejections, KPIs, integrations, clinic directory.
 *
 * Run: npx tsx scripts/seed-network-data.ts
 * Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xquzbgaenmohruluyhgv.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY required. Set in .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// ── Real Medicross Clinic Data (representative subset — 40 of 88) ──
const CLINICS = [
  // Gauteng
  { name: "Medicross Sandton City", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "Sandton City Mall, Rivonia Rd, Sandton 2196", lat: -26.1076, lng: 28.0567, phone: "011 783 0045", practitioners: 8 },
  { name: "Medicross Fourways", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "Fourways Mall, William Nicol Dr, Fourways 2055", lat: -26.0189, lng: 28.0075, phone: "011 465 2366", practitioners: 6 },
  { name: "Medicross Rosebank", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "The Zone, Oxford Rd, Rosebank 2196", lat: -26.1458, lng: 28.0436, phone: "011 880 5720", practitioners: 5 },
  { name: "Medicross Midrand", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "Midrand City Mall, Old Pretoria Rd, Midrand 1685", lat: -25.9882, lng: 28.1275, phone: "011 315 1640", practitioners: 7 },
  { name: "Medicross Centurion", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "Centurion Mall, Heuwel Ave, Centurion 0157", lat: -25.8603, lng: 28.1894, phone: "012 663 1052", practitioners: 6 },
  { name: "Medicross Pretoria East", type: "medicross_gp", region: "Gauteng North", province: "Gauteng", address: "Woodlands Blvd, Garsfontein Rd, Pretoria 0081", lat: -25.8003, lng: 28.3082, phone: "012 997 0620", practitioners: 5 },
  { name: "Medicross Alberton", type: "medicross_gp", region: "Gauteng South", province: "Gauteng", address: "New Market Square, Voortrekker Rd, Alberton 1449", lat: -26.2629, lng: 28.1267, phone: "011 869 1320", practitioners: 6 },
  { name: "Medicross Bedfordview", type: "medicross_gp", region: "Gauteng South", province: "Gauteng", address: "Bedford Centre, Van der Linde Rd, Bedfordview 2008", lat: -26.1812, lng: 28.1344, phone: "011 622 1110", practitioners: 5 },
  { name: "Medicross Boksburg", type: "medicross_gp", region: "Gauteng South", province: "Gauteng", address: "East Rand Mall, North Rand Rd, Boksburg 1459", lat: -26.1982, lng: 28.2486, phone: "011 826 3930", practitioners: 7 },
  { name: "Medicross Vanderbijlpark", type: "medicross_gp", region: "Gauteng South", province: "Gauteng", address: "River Square Mall, Frikkie Meyer Blvd, Vanderbijlpark 1900", lat: -26.7118, lng: 27.8342, phone: "016 981 0250", practitioners: 4 },
  { name: "Medicross Krugersdorp", type: "medicross_gp", region: "Gauteng West", province: "Gauteng", address: "Key West Centre, Paardekraal Dr, Krugersdorp 1739", lat: -26.1027, lng: 27.7686, phone: "011 953 2500", practitioners: 5 },
  { name: "Medicross Roodepoort", type: "medicross_gp", region: "Gauteng West", province: "Gauteng", address: "Westgate Mall, Ontdekkers Rd, Roodepoort 1724", lat: -26.1564, lng: 27.8625, phone: "011 760 4280", practitioners: 6 },
  // KwaZulu-Natal
  { name: "Medicross Umhlanga", type: "medicross_gp", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Gateway Theatre of Shopping, Umhlanga Ridge 4319", lat: -29.7286, lng: 31.0669, phone: "031 566 2010", practitioners: 7 },
  { name: "Medicross Pinetown", type: "medicross_gp", region: "KZN Inland", province: "KwaZulu-Natal", address: "Pinecrest Shopping Centre, Old Main Rd, Pinetown 3610", lat: -29.8144, lng: 30.8629, phone: "031 702 1920", practitioners: 5 },
  { name: "Medicross Westville", type: "medicross_gp", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Westville Mall, William Lester Dr, Westville 3629", lat: -29.8374, lng: 30.9275, phone: "031 265 0340", practitioners: 4 },
  { name: "Medicross Pietermaritzburg", type: "medicross_gp", region: "KZN Inland", province: "KwaZulu-Natal", address: "Liberty Midlands Mall, Sanctuary Rd, PMB 3201", lat: -29.5878, lng: 30.3797, phone: "033 397 8500", practitioners: 6 },
  // Western Cape
  { name: "Medicross Cape Gate", type: "medicross_gp", region: "Western Cape", province: "Western Cape", address: "Cape Gate Shopping Centre, Okavango Rd, Brackenfell 7560", lat: -33.8694, lng: 18.6892, phone: "021 981 4540", practitioners: 6 },
  { name: "Medicross Tygervalley", type: "medicross_gp", region: "Western Cape", province: "Western Cape", address: "Willowbridge Shopping Centre, Carl Cronje Dr, Bellville 7530", lat: -33.8731, lng: 18.6367, phone: "021 914 4160", practitioners: 5 },
  { name: "Medicross Claremont", type: "medicross_gp", region: "Western Cape", province: "Western Cape", address: "Cavendish Square, Dreyer St, Claremont 7708", lat: -33.9785, lng: 18.4633, phone: "021 683 4580", practitioners: 4 },
  { name: "Medicross Paarl", type: "medicross_gp", region: "Western Cape", province: "Western Cape", address: "Paarl Mall, Cecilia St, Paarl 7646", lat: -33.7312, lng: 18.9684, phone: "021 872 0870", practitioners: 3 },
  // Eastern Cape
  { name: "Medicross Greenacres", type: "medicross_gp", region: "Eastern Cape", province: "Eastern Cape", address: "Greenacres Shopping Centre, Cape Rd, Port Elizabeth 6001", lat: -33.9520, lng: 25.5868, phone: "041 363 0840", practitioners: 5 },
  { name: "Medicross East London", type: "medicross_gp", region: "Eastern Cape", province: "Eastern Cape", address: "Vincent Park Shopping Centre, Devereux Ave, East London 5201", lat: -32.9809, lng: 27.9194, phone: "043 726 8240", practitioners: 4 },
  // Free State
  { name: "Medicross Bloemfontein", type: "medicross_gp", region: "Free State", province: "Free State", address: "Loch Logan Waterfront, Henry St, Bloemfontein 9301", lat: -29.1169, lng: 26.2186, phone: "051 447 2960", practitioners: 5 },
  { name: "Medicross Welkom", type: "medicross_gp", region: "Free State", province: "Free State", address: "Goldfields Mall, Stateway, Welkom 9459", lat: -27.9775, lng: 26.7346, phone: "057 357 4080", practitioners: 3 },
  // Mpumalanga
  { name: "Medicross Nelspruit", type: "medicross_gp", region: "Mpumalanga", province: "Mpumalanga", address: "Riverside Mall, Madiba Dr, Nelspruit 1200", lat: -25.4753, lng: 30.9694, phone: "013 755 3820", practitioners: 4 },
  { name: "Medicross Witbank", type: "medicross_gp", region: "Mpumalanga", province: "Mpumalanga", address: "Highveld Mall, Mandela St, Emalahleni 1035", lat: -25.8712, lng: 29.2367, phone: "013 656 2340", practitioners: 4 },
  // Limpopo
  { name: "Medicross Polokwane", type: "medicross_gp", region: "Limpopo", province: "Limpopo", address: "Mall of the North, R81, Polokwane 0699", lat: -23.8779, lng: 29.4649, phone: "015 296 0640", practitioners: 5 },
  // North West
  { name: "Medicross Rustenburg", type: "medicross_gp", region: "North West", province: "North West", address: "Waterfall Mall, Augrabies Ave, Rustenburg 0300", lat: -25.6585, lng: 27.2493, phone: "014 537 2850", practitioners: 4 },
  // Dental clinics
  { name: "Medicross Sandton Dental", type: "medicross_dental", region: "Gauteng North", province: "Gauteng", address: "Sandton City Mall, Rivonia Rd, Sandton 2196", lat: -26.1076, lng: 28.0567, phone: "011 783 0048", practitioners: 3 },
  { name: "Medicross Fourways Dental", type: "medicross_dental", region: "Gauteng North", province: "Gauteng", address: "Fourways Mall, William Nicol Dr, Fourways 2055", lat: -26.0189, lng: 28.0075, phone: "011 465 2370", practitioners: 2 },
  { name: "Medicross Umhlanga Dental", type: "medicross_dental", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Gateway Theatre of Shopping, Umhlanga Ridge 4319", lat: -29.7286, lng: 31.0669, phone: "031 566 2015", practitioners: 2 },
  // Prime Cure
  { name: "Prime Cure Soweto", type: "prime_cure", region: "Gauteng South", province: "Gauteng", address: "Maponya Mall, Chris Hani Rd, Soweto 1818", lat: -26.2676, lng: 27.8859, phone: "011 938 4520", practitioners: 8 },
  { name: "Prime Cure Tembisa", type: "prime_cure", region: "Gauteng North", province: "Gauteng", address: "Tembisa Plaza, Andrew Mapheto Dr, Tembisa 1632", lat: -25.9985, lng: 28.2269, phone: "011 920 3450", practitioners: 6 },
  { name: "Prime Cure Chatsworth", type: "prime_cure", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Chatsworth Centre, Croftdene Dr, Chatsworth 4092", lat: -29.9120, lng: 30.8894, phone: "031 401 8200", practitioners: 5 },
  // Occupational Health
  { name: "Netcare Occ Health Johannesburg", type: "occupational_health", region: "Gauteng North", province: "Gauteng", address: "76 Maude St, Sandton 2196", lat: -26.1070, lng: 28.0550, phone: "011 301 0000", practitioners: 4 },
  { name: "Netcare Occ Health Rustenburg", type: "occupational_health", region: "North West", province: "North West", address: "Waterfall Mall, Rustenburg 0300", lat: -25.6585, lng: 27.2493, phone: "014 537 2860", practitioners: 3 },
  // Day Theatres
  { name: "Medicross Sandton Day Theatre", type: "day_theatre", region: "Gauteng North", province: "Gauteng", address: "Sandton City, Rivonia Rd, Sandton 2196", lat: -26.1076, lng: 28.0567, phone: "011 783 0050", practitioners: 4 },
  { name: "Medicross Umhlanga Day Theatre", type: "day_theatre", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Gateway, Umhlanga Ridge 4319", lat: -29.7286, lng: 31.0669, phone: "031 566 2020", practitioners: 3 },
  // Pharmacies (Clicks-operated but still tracked)
  { name: "Clicks at Medicross Sandton", type: "pharmacy", region: "Gauteng North", province: "Gauteng", address: "Sandton City Mall, Sandton 2196", lat: -26.1076, lng: 28.0567, phone: "011 783 0046", practitioners: 2 },
  { name: "Clicks at Medicross Umhlanga", type: "pharmacy", region: "KZN Coastal", province: "KwaZulu-Natal", address: "Gateway, Umhlanga Ridge 4319", lat: -29.7286, lng: 31.0669, phone: "031 566 2012", practitioners: 2 },
];

// ── Medical Schemes ──
const SCHEMES = [
  { name: "Discovery Health", lives: 3800000, rejRate: 8.2, payDays: 14 },
  { name: "GEMS", lives: 2100000, rejRate: 12.5, payDays: 21 },
  { name: "Bonitas", lives: 680000, rejRate: 11.8, payDays: 18 },
  { name: "Momentum Health", lives: 420000, rejRate: 9.5, payDays: 16 },
  { name: "Medihelp", lives: 350000, rejRate: 10.2, payDays: 19 },
  { name: "Polmed", lives: 280000, rejRate: 13.1, payDays: 22 },
  { name: "Prime Cure (Capitated)", lives: 254000, rejRate: 6.8, payDays: 0 },
  { name: "Bestmed", lives: 220000, rejRate: 11.0, payDays: 17 },
];

// ── Top Rejection Codes ──
const REJECTIONS = [
  { code: "ICD-SPEC", desc: "ICD-10 code not specific enough (e.g. J18.9 instead of J13)", count: 342, value: 1240000, ai: "Auto-suggest most specific ICD-10 subcategory based on clinical notes. Flag J18.9, E11.9, I10 as common under-coded diagnoses." },
  { code: "AUTH-MISS", desc: "Pre-authorization not obtained before procedure", count: 218, value: 890000, ai: "Cross-reference procedure codes with scheme auth requirements. Alert practitioner at booking time if auth needed." },
  { code: "NAPPI-EXP", desc: "NAPPI code expired or inactive", count: 156, value: 520000, ai: "Sync NAPPI database monthly. Flag expired codes at point of prescribing with active alternatives." },
  { code: "MEM-INACT", desc: "Member not active on scheme at date of service", count: 134, value: 480000, ai: "Real-time membership verification (MSV) at check-in via SwitchOn before consultation begins." },
  { code: "DUP-CLAIM", desc: "Duplicate claim — already submitted for same date/service", count: 98, value: 380000, ai: "De-duplication check against 90-day claims history before submission." },
  { code: "TARIFF-EX", desc: "Claimed amount exceeds scheme tariff rate", count: 87, value: 350000, ai: "Auto-apply scheme-specific tariff caps. Show practitioner the scheme rate vs their charge before submission." },
  { code: "PMB-NOQAL", desc: "Condition does not qualify as PMB under coding submitted", count: 76, value: 310000, ai: "PMB condition matcher: verify ICD-10 code maps to one of 270 PMB conditions. Suggest qualifying code if available." },
  { code: "CDL-PROTO", desc: "Chronic medication not on scheme CDL protocol", count: 65, value: 280000, ai: "CDL formulary checker: validate NAPPI code against scheme's 27 chronic condition treatment algorithms." },
  { code: "BEN-EXHAUST", desc: "Benefits exhausted for this category", count: 54, value: 220000, ai: "Benefit check at booking shows remaining benefits. Alert if patient is close to exhaustion before consultation." },
  { code: "DATE-ERR", desc: "Service date errors (future date, outside benefit year)", count: 42, value: 180000, ai: "Validate service dates against scheme benefit year. Block future-dated claims." },
];

// ── Division KPIs (based on Netcare FY2025 Primary Care public data) ──
const KPIS = [
  { label: "Division Revenue", value: "R55.2M", target: "R60.0M", pct: 92, trend: "+3.2% YoY", status: "attention", icon: "DollarSign", color: "#3DA9D1" },
  { label: "Patient Visits", value: "291K", target: "310K", pct: 94, trend: "-3.1% vs FY24", status: "attention", icon: "Users", color: "#E3964C" },
  { label: "Claims Collection", value: "87.2%", target: "92%", pct: 95, trend: "+1.8pp", status: "improving", icon: "Receipt", color: "#10B981" },
  { label: "Rejection Rate", value: "12.4%", target: "<8%", pct: 65, trend: "-2.1pp", status: "improving", icon: "FileWarning", color: "#EF4444" },
  { label: "HEAL Adoption", value: "78%", target: "90%", pct: 87, trend: "+12pp", status: "improving", icon: "Activity", color: "#8B5CF6" },
  { label: "Avg Wait Time", value: "34 min", target: "20 min", pct: 59, trend: "-8 min", status: "improving", icon: "Clock", color: "#F59E0B" },
];

// ── Integration Statuses ──
const INTEGRATIONS = [
  { name: "CareOn EMR (Hospital Division)", status: "planned" },
  { name: "HEAL (Medicross Primary Care)", status: "planned" },
  { name: "Altron SwitchOn (Claims Switch)", status: "planned" },
  { name: "MediSwitch EDI (eRA Processing)", status: "planned" },
  { name: "Healthbridge / GoodX (Clinic PMS)", status: "planned" },
  { name: "IBM Watson Micromedex (Drug Safety)", status: "planned" },
  { name: "SAP (Finance & Admin)", status: "planned" },
];

// ── Seed Functions ──

async function seedClinics() {
  console.log("Seeding clinics...");
  const rows = CLINICS.map((c) => ({
    name: c.name,
    type: c.type,
    region: c.region,
    province: c.province,
    address: c.address,
    lat: c.lat,
    lng: c.lng,
    phone: c.phone,
    hours: "Mon-Fri 8:00-17:00, Sat 8:00-13:00",
    practitioner_count: c.practitioners,
    active: true,
  }));

  const { data, error } = await sb.from("ho_clinics").upsert(rows, { onConflict: "name" }).select("id, name");
  if (error) {
    // Table might not have unique on name, insert instead
    const { data: d2, error: e2 } = await sb.from("ho_clinics").insert(rows).select("id, name");
    if (e2) throw e2;
    console.log(`  Inserted ${d2?.length} clinics`);
    return d2 || [];
  }
  console.log(`  Upserted ${data?.length} clinics`);
  return data || [];
}

async function seedClinicMetrics(clinics: { id: string; name: string }[]) {
  console.log("Seeding clinic metrics (9 months)...");
  const months = ["2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"];
  const rows = [];

  for (const clinic of clinics) {
    const baseRevenue = 400000 + Math.floor(Math.random() * 300000);
    const baseClaims = 80 + Math.floor(Math.random() * 120);

    for (let i = 0; i < months.length; i++) {
      const growth = 1 + i * 0.03;
      const revenue = Math.floor(baseRevenue * growth);
      const claims = Math.floor(baseClaims * growth);
      const rejRate = Math.max(4, 18 - i * 1.2 + (Math.random() * 4 - 2));
      const rejected = Math.floor(claims * rejRate / 100);

      rows.push({
        clinic_id: clinic.id,
        month: months[i],
        revenue,
        target: Math.floor(revenue * 1.08),
        claims_submitted: claims,
        claims_rejected: rejected,
        rejection_rate: Math.round(rejRate * 100) / 100,
        collection_ratio: Math.round((82 + i * 1.2 + Math.random() * 3) * 100) / 100,
        patient_count: Math.floor(200 + Math.random() * 300),
        avg_wait_time_min: Math.floor(45 - i * 2 + Math.random() * 10),
        savings_claims: Math.floor(12000 * growth + Math.random() * 8000),
        savings_era: Math.floor(5000 * growth + Math.random() * 3000),
        savings_debtors: Math.floor(15000 * growth + Math.random() * 10000),
        savings_capitation: Math.floor(4000 * growth + Math.random() * 3000),
        savings_compliance: Math.floor(3000 * growth + Math.random() * 2000),
        savings_pharmacy: Math.floor(8000 * growth + Math.random() * 5000),
      });
    }
  }

  // Insert in batches of 200
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200);
    const { error } = await sb.from("ho_clinic_metrics").insert(batch);
    if (error) throw error;
  }
  console.log(`  Inserted ${rows.length} metric rows`);
}

async function seedSchemes() {
  console.log("Seeding medical scheme metrics...");
  const month = "2026-03";
  const rows = SCHEMES.map((s) => ({
    scheme_name: s.name,
    month,
    lives_covered: s.lives,
    claims_volume: Math.floor(s.lives * 45),
    rejection_rate: s.rejRate,
    avg_payment_days: s.payDays,
  }));
  const { error } = await sb.from("ho_medical_scheme_metrics").insert(rows);
  if (error) throw error;
  console.log(`  Inserted ${rows.length} scheme records`);
}

async function seedRejections() {
  console.log("Seeding rejection codes...");
  const rows = REJECTIONS.map((r) => ({
    code: r.code,
    description: r.desc,
    month: "2026-03",
    count: r.count,
    value: r.value,
    ai_recommendation: r.ai,
  }));
  const { error } = await sb.from("ho_rejection_codes").insert(rows);
  if (error) throw error;
  console.log(`  Inserted ${rows.length} rejection codes`);
}

async function seedKPIs() {
  console.log("Seeding division KPIs...");
  const rows = KPIS.map((k) => ({
    label: k.label,
    value: k.value,
    target: k.target,
    pct: k.pct,
    trend: k.trend,
    status: k.status,
    icon: k.icon,
    color: k.color,
    month: "2026-03",
  }));
  const { error } = await sb.from("ho_division_kpis").insert(rows);
  if (error) throw error;
  console.log(`  Inserted ${rows.length} KPIs`);
}

async function seedIntegrations() {
  console.log("Seeding integration statuses...");
  const rows = INTEGRATIONS.map((i) => ({
    system_name: i.name,
    status: i.status,
    records_synced: 0,
    error_count: 0,
  }));
  const { error } = await sb.from("ho_integration_status").insert(rows);
  if (error) throw error;
  console.log(`  Inserted ${rows.length} integration records`);
}

async function seedClinicDirectory(clinics: { id: string; name: string }[]) {
  console.log("Seeding clinic directory...");
  const rows = clinics.map((c) => {
    const isGP = c.name.includes("Medicross") && !c.name.includes("Dental") && !c.name.includes("Day Theatre");
    const isDental = c.name.includes("Dental");
    const isTheatre = c.name.includes("Day Theatre");
    const isPharmacy = c.name.includes("Clicks");

    let services = [];
    if (isGP) services = [
      { name: "GP Consultation", durationMin: 20, priceCents: 55000 },
      { name: "Follow-up Visit", durationMin: 15, priceCents: 35000 },
      { name: "Chronic Script Renewal", durationMin: 10, priceCents: 25000 },
      { name: "Minor Procedure", durationMin: 30, priceCents: 85000 },
    ];
    else if (isDental) services = [
      { name: "Dental Check-up", durationMin: 30, priceCents: 65000 },
      { name: "Cleaning & Scale", durationMin: 45, priceCents: 85000 },
      { name: "Filling", durationMin: 45, priceCents: 95000 },
    ];
    else if (isTheatre) services = [
      { name: "Day Surgery", durationMin: 120, priceCents: 1500000 },
      { name: "Endoscopy", durationMin: 60, priceCents: 850000 },
    ];
    else if (isPharmacy) services = [
      { name: "Prescription Dispensing", durationMin: 10, priceCents: 5500 },
      { name: "Chronic Medication", durationMin: 10, priceCents: 5500 },
    ];
    else services = [
      { name: "Consultation", durationMin: 20, priceCents: 55000 },
    ];

    return {
      clinic_id: c.id,
      services: JSON.stringify(services),
      whatsapp_enabled: !isPharmacy,
      emergency_number: "082 911",
    };
  });

  const { error } = await sb.from("ho_clinic_directory").insert(rows);
  if (error) throw error;
  console.log(`  Inserted ${rows.length} directory entries`);
}

// ── Main ──

async function main() {
  console.log("\n=== Netcare Health OS — Network Data Seed ===\n");

  const clinics = await seedClinics();
  await seedClinicMetrics(clinics);
  await seedSchemes();
  await seedRejections();
  await seedKPIs();
  await seedIntegrations();
  await seedClinicDirectory(clinics);

  console.log("\n=== Seed complete ===\n");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
