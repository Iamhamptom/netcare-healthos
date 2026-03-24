/**
 * Seed the NappiMedicine table from MediKredit PUBDOM + SEP data
 * Uses raw SQL for fast bulk insert into SQLite (482K+ records)
 *
 * Run: npx tsx scripts/seed-nappi.ts
 */

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { randomBytes } from "crypto";

const DB_PATH = path.join(process.cwd(), "dev.db");
const NAPPI_DATA_DIR = path.join(process.env.HOME || "~", "healthops-platform/data/nappi");
const BATCH_SIZE = 1000;

const DOSAGE_FORM_MAP: Record<string, string> = {
  TAB: "Tablets", CAP: "Capsules", INJ: "Injections", SYR: "Syrups",
  SUS: "Suspensions", CRE: "Creams", OIN: "Ointments", GEL: "Gels",
  LOT: "Lotions", SOL: "Solutions", DRP: "Drops", POW: "Powders",
  SUP: "Suppositories", SAC: "Sachets", AER: "Aerosols", INF: "Infusions",
  PAS: "Patches", IMP: "Implants", ZZZ: "Other", DEB: "Wound Care",
  BAN: "Bandages", MC2: "Medical Consumables", DES: "Dressings",
  SNG: "Surgical", KIT: "Kits", GAU: "Gauze", PAP: "Paper Products",
  MC1: "Medical Consumables I", NEE: "Needles", TUB: "Tubes",
  SUT: "Sutures", WAF: "Wafers", PES: "Pessaries", EFF: "Effervescent",
  ENE: "Enemas", NAD: "Nasal Drops", EAD: "Ear Drops", EYD: "Eye Drops",
  SPR: "Sprays", VAG: "Vaginal", NEB: "Nebuliser", TRA: "Transdermal",
};

const MED_FORMS = new Set([
  "TAB","CAP","INJ","DRP","SYR","CRE","SUS","OIN","LOT","SOL",
  "SUP","GEL","PAS","AER","POW","SAC","INF","EFF","ENE","NAD",
  "EAD","EYD","SPR","VAG","NEB","TRA","PES","WAF",
]);

function cuid(): string {
  return "c" + randomBytes(12).toString("hex");
}

function categorize(dosageForm: string): string {
  if (MED_FORMS.has(dosageForm)) return "medicine";
  if (dosageForm === "IMP") return "implant";
  if (["BAN","DEB","DES","GAU","PAP","SUT"].includes(dosageForm)) return "consumable";
  return "device";
}

interface SEPRecord {
  nappi_code: string;
  schedule?: string;
  sep?: string;
  cost_per_unit?: string;
  dispensing_fee?: string;
  is_generic?: string;
  ingredients?: Array<{ name: string; strength: string | number; unit: string }>;
  regno?: string;
}

function loadSEPData(): Map<string, SEPRecord> {
  const sepPath = path.join(NAPPI_DATA_DIR, "sep_dump.json");
  if (!fs.existsSync(sepPath)) return new Map();
  const data: SEPRecord[] = JSON.parse(fs.readFileSync(sepPath, "utf-8"));
  const map = new Map<string, SEPRecord>();
  for (const item of data) {
    const code = (item.nappi_code || "").trim();
    if (code) {
      map.set(code, item);
      if (code.length >= 7) map.set(code.slice(0, 7), item);
    }
  }
  console.log(`  Loaded ${data.length.toLocaleString()} SEP records`);
  return map;
}

interface NappiRow {
  id: string;
  nappiCode: string;
  packCode: string;
  fullNappiCode: string;
  name: string;
  strength: string;
  dosageForm: string;
  dosageFormDesc: string;
  packSize: number;
  manufacturerCode: string;
  category: string;
  schedule: string;
  sepPrice: string;
  costPerUnit: string;
  dispensingFee: string;
  isGeneric: string;
  ingredients: string;
  regNumber: string;
  isActive: number; // SQLite boolean
  lastUpdated: string;
}

function parsePUBDOM(filePath: string, isDiscontinued: boolean, sepMap: Map<string, SEPRecord>): NappiRow[] {
  const content = fs.readFileSync(filePath, "latin1");
  const lines = content.split("\n");
  const records: NappiRow[] = [];
  const now = new Date().toISOString();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const recType = line.slice(7, 10);
    if (line.length < 100 || (recType !== "202" && recType !== "224")) continue;

    const nappiCode = line.slice(10, 17).trim();
    const packCode = line.slice(17, 20).trim() || "001";
    const shortName = line.slice(20, 60).trim();
    const strength = line.slice(60, 75).trim();
    const dosageForm = line.slice(75, 80).trim();
    const packSizeRaw = line.slice(80, 90).trim();
    const mfrCode = line.slice(90, 95).trim();
    const fullName = line.length > 150 ? line.slice(150, 210).trim() : "";

    const name = fullName || shortName;
    if (!nappiCode || !name) continue;

    let packSize = 0;
    const psNum = parseInt(packSizeRaw.replace(/^0+/, "") || "0", 10);
    if (!isNaN(psNum)) packSize = psNum;

    const fullCode = nappiCode + packCode;
    const sep = sepMap.get(fullCode) || sepMap.get(nappiCode);

    records.push({
      id: cuid(),
      nappiCode,
      packCode,
      fullNappiCode: fullCode,
      name,
      strength,
      dosageForm,
      dosageFormDesc: DOSAGE_FORM_MAP[dosageForm] || dosageForm,
      packSize,
      manufacturerCode: mfrCode,
      category: categorize(dosageForm),
      schedule: sep?.schedule || "",
      sepPrice: sep?.sep || "",
      costPerUnit: sep?.cost_per_unit || "",
      dispensingFee: sep?.dispensing_fee || "",
      isGeneric: sep?.is_generic || "",
      ingredients: sep?.ingredients ? JSON.stringify(sep.ingredients) : "[]",
      regNumber: sep?.regno || "",
      isActive: isDiscontinued ? 0 : 1,
      lastUpdated: now,
    });
  }

  return records;
}

function main() {
  console.log("=== NAPPI Medicine Database Seeder ===\n");

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = OFF");
  db.pragma("cache_size = -64000"); // 64MB cache

  // Clear existing records
  const existingCount = (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine").get() as { c: number }).c;
  if (existingCount > 0) {
    console.log(`Clearing ${existingCount.toLocaleString()} existing records...`);
    db.exec("DELETE FROM NappiMedicine");
  }

  // Load SEP data
  console.log("Loading SEP pricing data...");
  const sepMap = loadSEPData();

  // Parse active records
  console.log(`\nParsing PUBDOM.TXT (active NAPPI records)...`);
  const activeRecords = parsePUBDOM(path.join(NAPPI_DATA_DIR, "PUBDOM.TXT"), false, sepMap);
  console.log(`  Parsed ${activeRecords.length.toLocaleString()} active records`);

  // Parse discontinued records
  console.log(`Parsing PUBDOMD.TXT (discontinued NAPPI records)...`);
  const discontinuedRecords = parsePUBDOM(path.join(NAPPI_DATA_DIR, "PUBDOMD.TXT"), true, sepMap);
  console.log(`  Parsed ${discontinuedRecords.length.toLocaleString()} discontinued records`);

  // Deduplicate — active wins
  const seen = new Set<string>();
  const allRecords: NappiRow[] = [];

  for (const rec of activeRecords) {
    const key = `${rec.nappiCode}-${rec.packCode}`;
    if (!seen.has(key)) {
      seen.add(key);
      allRecords.push(rec);
    }
  }
  for (const rec of discontinuedRecords) {
    const key = `${rec.nappiCode}-${rec.packCode}`;
    if (!seen.has(key)) {
      seen.add(key);
      allRecords.push(rec);
    }
  }

  console.log(`\nTotal unique records: ${allRecords.length.toLocaleString()}`);
  console.log(`Inserting into SQLite...\n`);

  // Prepared statement for insert
  const insert = db.prepare(`
    INSERT OR IGNORE INTO NappiMedicine (
      id, nappiCode, packCode, fullNappiCode, name, strength,
      dosageForm, dosageFormDesc, packSize, manufacturerCode,
      category, schedule, sepPrice, costPerUnit, dispensingFee,
      isGeneric, ingredients, regNumber, isActive, lastUpdated
    ) VALUES (
      @id, @nappiCode, @packCode, @fullNappiCode, @name, @strength,
      @dosageForm, @dosageFormDesc, @packSize, @manufacturerCode,
      @category, @schedule, @sepPrice, @costPerUnit, @dispensingFee,
      @isGeneric, @ingredients, @regNumber, @isActive, @lastUpdated
    )
  `);

  // Batch insert in transaction
  const startTime = Date.now();
  let inserted = 0;

  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE);
    const tx = db.transaction(() => {
      for (const row of batch) {
        insert.run(row);
      }
    });
    tx();
    inserted += batch.length;

    if (inserted % 50000 === 0 || i + BATCH_SIZE >= allRecords.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const pct = ((inserted / allRecords.length) * 100).toFixed(1);
      console.log(`  ${inserted.toLocaleString()} / ${allRecords.length.toLocaleString()} (${pct}%) [${elapsed}s]`);
    }
  }

  // Final stats
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  const stats = {
    total: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine").get() as { c: number }).c,
    medicines: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE category='medicine'").get() as { c: number }).c,
    devices: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE category='device'").get() as { c: number }).c,
    implants: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE category='implant'").get() as { c: number }).c,
    consumables: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE category='consumable'").get() as { c: number }).c,
    active: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE isActive=1").get() as { c: number }).c,
    discontinued: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE isActive=0").get() as { c: number }).c,
    withSEP: (db.prepare("SELECT COUNT(*) as c FROM NappiMedicine WHERE sepPrice != ''").get() as { c: number }).c,
  };

  console.log(`\n=== NAPPI Database Seeded in ${totalTime}s ===`);
  console.log(`  Total:          ${stats.total.toLocaleString()}`);
  console.log(`  ├─ Medicines:   ${stats.medicines.toLocaleString()}`);
  console.log(`  ├─ Devices:     ${stats.devices.toLocaleString()}`);
  console.log(`  ├─ Implants:    ${stats.implants.toLocaleString()}`);
  console.log(`  └─ Consumables: ${stats.consumables.toLocaleString()}`);
  console.log(`  Active:         ${stats.active.toLocaleString()}`);
  console.log(`  Discontinued:   ${stats.discontinued.toLocaleString()}`);
  console.log(`  With SEP price: ${stats.withSEP.toLocaleString()}`);

  db.close();
}

main();
