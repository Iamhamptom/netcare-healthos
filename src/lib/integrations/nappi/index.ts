// ─────────────────────────────────────────────────────────────────────────────
// NAPPI Adapter — Netcare Health OS
// National Pharmaceutical Product Index (maintained by MediKredit)
// 300K+ products: medicines, surgical consumables, medical devices
// 7-9 digit codes, each product-pack combo has unique NAPPI code
// SEP = Single Exit Price (regulated maximum wholesale price in SA)
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "@/lib/logger";

const LOG_PREFIX = '[nappi]';

// ── Types ────────────────────────────────────────────────────────────────────

export interface NAPPIProduct {
  nappiCode: string;
  productName: string;
  genericName: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  packSize: string;
  schedule: string; // S0–S8
  manufacturer: string;
  sepPrice: number; // Single Exit Price in ZAR
  sepEffectiveDate: string;
  atcCode: string;
  atcDescription: string;
  status: 'active' | 'discontinued' | 'withdrawn';
  category: 'medicine' | 'surgical_consumable' | 'medical_device';
  lastUpdated: string;
}

export interface NAPPISearchResult {
  query: string;
  totalResults: number;
  results: NAPPIProduct[];
}

export interface NAPPICodeValidation {
  nappiCode: string;
  valid: boolean;
  status: 'active' | 'expired' | 'withdrawn' | 'not_found';
  productName?: string;
  message: string;
}

export interface NAPPIFormularyItem {
  nappiCode: string;
  productName: string;
  genericName: string;
  formularyStatus: 'preferred' | 'allowed' | 'restricted' | 'excluded';
  requiresPreAuth: boolean;
  maxQuantity?: number;
  maxDaysSupply?: number;
  copayAmount?: number; // ZAR
  schemeNotes?: string;
}

export interface NAPPIFormularyResult {
  schemeName: string;
  optionName?: string;
  effectiveDate: string;
  items: NAPPIFormularyItem[];
  totalItems: number;
}

export interface NAPPISEPResult {
  nappiCode: string;
  productName: string;
  sepPrice: number;
  sepEffectiveDate: string;
  previousSep?: number;
  changePercent?: number;
  dispensingFee: number; // regulated max
  vatInclusive: boolean;
  currency: 'ZAR';
}

// ── NAPPI Adapter ────────────────────────────────────────────────────────────

export class NAPPIAdapter {
  private baseUrl: string;
  private apiKey: string;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = config?.baseUrl ?? process.env.NAPPI_API_URL ?? 'https://api.medikredit.co.za/nappi/v1';
    this.apiKey = config?.apiKey ?? process.env.NAPPI_API_KEY ?? '';
    logger.info(`${LOG_PREFIX} Adapter initialized (endpoint: ${this.baseUrl})`);
  }

  /** Test NAPPI database connectivity */
  async testConnection(): Promise<{ connected: boolean; latencyMs: number; productCount: number }> {
    const start = Date.now();
    logger.info(`${LOG_PREFIX} Testing connection to NAPPI database...`);
    await this.simulateLatency(30, 80);
    const latency = Date.now() - start;
    logger.info(`${LOG_PREFIX} Connected (${latency}ms) — 312,847 active products`);
    return { connected: true, latencyMs: latency, productCount: 312_847 };
  }

  // ── Lookup ─────────────────────────────────────────────────────────────────

  /** GET /products/{nappiCode} — Get product details by NAPPI code */
  async lookup(nappiCode: string): Promise<NAPPIProduct | null> {
    logger.info(`${LOG_PREFIX} Looking up NAPPI code: ${nappiCode}`);
    await this.simulateLatency(40, 100);

    const product = MOCK_PRODUCTS[nappiCode];
    if (!product) {
      logger.info(`${LOG_PREFIX} Product not found: ${nappiCode}`);
      return null;
    }

    logger.info(`${LOG_PREFIX} Found: ${product.productName} (${product.manufacturer}) — SEP R${product.sepPrice.toFixed(2)}`);
    return product;
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  /** GET /products?q={query}&limit=20 — Search by product name or active ingredient */
  async search(query: string): Promise<NAPPISearchResult> {
    logger.info(`${LOG_PREFIX} Searching products: "${query}"`);
    await this.simulateLatency(60, 150);

    const normQuery = query.toLowerCase().trim();
    const results = Object.values(MOCK_PRODUCTS).filter(
      (p) =>
        p.productName.toLowerCase().includes(normQuery) ||
        p.genericName.toLowerCase().includes(normQuery) ||
        p.activeIngredient.toLowerCase().includes(normQuery) ||
        p.manufacturer.toLowerCase().includes(normQuery)
    );

    logger.info(`${LOG_PREFIX} Search "${query}": ${results.length} result(s)`);
    return {
      query,
      totalResults: results.length,
      results,
    };
  }

  // ── Validate ───────────────────────────────────────────────────────────────

  /** GET /products/{nappiCode}/validate — Check if NAPPI code is active/expired */
  async validateCode(nappiCode: string): Promise<NAPPICodeValidation> {
    logger.info(`${LOG_PREFIX} Validating NAPPI code: ${nappiCode}`);
    await this.simulateLatency(30, 80);

    // Check format: 7-9 digits
    if (!/^\d{7,9}$/.test(nappiCode)) {
      logger.info(`${LOG_PREFIX} Invalid format: ${nappiCode} (must be 7-9 digits)`);
      return {
        nappiCode,
        valid: false,
        status: 'not_found',
        message: `Invalid NAPPI format. Expected 7-9 digits, got "${nappiCode}".`,
      };
    }

    const product = MOCK_PRODUCTS[nappiCode];

    if (!product) {
      // Check expired/withdrawn codes
      const expired = EXPIRED_CODES[nappiCode];
      if (expired) {
        logger.info(`${LOG_PREFIX} Code ${nappiCode} is ${expired.status}: ${expired.productName}`);
        return {
          nappiCode,
          valid: false,
          status: expired.status as 'expired' | 'withdrawn',
          productName: expired.productName,
          message: expired.message,
        };
      }

      logger.info(`${LOG_PREFIX} Code ${nappiCode} not found in database`);
      return {
        nappiCode,
        valid: false,
        status: 'not_found',
        message: `NAPPI code ${nappiCode} not found in the national product index.`,
      };
    }

    logger.info(`${LOG_PREFIX} Code ${nappiCode} is active: ${product.productName}`);
    return {
      nappiCode,
      valid: true,
      status: 'active',
      productName: product.productName,
      message: `Active product: ${product.productName} (${product.manufacturer})`,
    };
  }

  // ── Formulary ──────────────────────────────────────────────────────────────

  /** GET /formulary/{schemeName}?option={optionName} — Get scheme-specific formulary */
  async getFormulary(schemeName: string, optionName?: string): Promise<NAPPIFormularyResult> {
    logger.info(`${LOG_PREFIX} Fetching formulary for scheme: ${schemeName}${optionName ? ` (${optionName})` : ''}`);
    await this.simulateLatency(80, 200);

    const normScheme = schemeName.toLowerCase().trim();
    const formulary = MOCK_FORMULARIES[normScheme] ?? MOCK_FORMULARIES['default'];
    const items = formulary(optionName);

    logger.info(`${LOG_PREFIX} Formulary for ${schemeName}: ${items.length} items`);
    return {
      schemeName,
      optionName,
      effectiveDate: '2026-01-01',
      items,
      totalItems: items.length,
    };
  }

  // ── SEP Pricing ────────────────────────────────────────────────────────────

  /** GET /products/{nappiCode}/sep — Get Single Exit Price */
  async getSEP(nappiCode: string): Promise<NAPPISEPResult | null> {
    logger.info(`${LOG_PREFIX} Fetching SEP for NAPPI code: ${nappiCode}`);
    await this.simulateLatency(30, 80);

    const product = MOCK_PRODUCTS[nappiCode];
    if (!product) {
      logger.info(`${LOG_PREFIX} Product not found for SEP lookup: ${nappiCode}`);
      return null;
    }

    // Dispensing fee is regulated — max R98.16 for medicines up to R227.43 SEP (2026 schedule)
    const dispensingFee = product.sepPrice <= 227.43
      ? Math.min(product.sepPrice * 0.36 + 28.00, 98.16)
      : product.sepPrice <= 922.46
        ? Math.min(product.sepPrice * 0.10 + 87.11, 148.00)
        : 148.00;

    const previousSep = product.sepPrice * (1 - Math.random() * 0.08); // up to 8% lower previous price

    const result: NAPPISEPResult = {
      nappiCode,
      productName: product.productName,
      sepPrice: product.sepPrice,
      sepEffectiveDate: product.sepEffectiveDate,
      previousSep: parseFloat(previousSep.toFixed(2)),
      changePercent: parseFloat((((product.sepPrice - previousSep) / previousSep) * 100).toFixed(1)),
      dispensingFee: parseFloat(dispensingFee.toFixed(2)),
      vatInclusive: false,
      currency: 'ZAR',
    };

    logger.info(`${LOG_PREFIX} SEP for ${product.productName}: R${result.sepPrice} (fee: R${result.dispensingFee})`);
    return result;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async simulateLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// ── Mock NAPPI Product Database ──────────────────────────────────────────────
// Common primary care medications with realistic SA pricing

const MOCK_PRODUCTS: Record<string, NAPPIProduct> = {
  // ── Analgesics / Antipyretics ──
  '7010101': {
    nappiCode: '7010101',
    productName: 'Panado Tablets 500mg',
    genericName: 'Paracetamol',
    activeIngredient: 'Paracetamol 500mg',
    strength: '500mg',
    dosageForm: 'Tablet',
    packSize: '24 tablets',
    schedule: 'S0',
    manufacturer: 'Adcock Ingram',
    sepPrice: 22.45,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'N02BE01',
    atcDescription: 'Paracetamol',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7010102': {
    nappiCode: '7010102',
    productName: 'Panado Syrup 120mg/5ml',
    genericName: 'Paracetamol',
    activeIngredient: 'Paracetamol 120mg/5ml',
    strength: '120mg/5ml',
    dosageForm: 'Syrup',
    packSize: '100ml',
    schedule: 'S0',
    manufacturer: 'Adcock Ingram',
    sepPrice: 34.90,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'N02BE01',
    atcDescription: 'Paracetamol',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Cardiovascular ──
  '7081411': {
    nappiCode: '7081411',
    productName: 'Amloc 5mg Tablets',
    genericName: 'Amlodipine',
    activeIngredient: 'Amlodipine besylate 5mg',
    strength: '5mg',
    dosageForm: 'Tablet',
    packSize: '30 tablets',
    schedule: 'S3',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 68.42,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'C08CA01',
    atcDescription: 'Amlodipine',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7081412': {
    nappiCode: '7081412',
    productName: 'Amloc 10mg Tablets',
    genericName: 'Amlodipine',
    activeIngredient: 'Amlodipine besylate 10mg',
    strength: '10mg',
    dosageForm: 'Tablet',
    packSize: '30 tablets',
    schedule: 'S3',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 112.85,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'C08CA01',
    atcDescription: 'Amlodipine',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7043215': {
    nappiCode: '7043215',
    productName: 'Pharmapress 10mg Tablets',
    genericName: 'Enalapril',
    activeIngredient: 'Enalapril maleate 10mg',
    strength: '10mg',
    dosageForm: 'Tablet',
    packSize: '30 tablets',
    schedule: 'S3',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 45.78,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'C09AA02',
    atcDescription: 'Enalapril',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7053118': {
    nappiCode: '7053118',
    productName: 'Adco-Simvastatin 20mg Tablets',
    genericName: 'Simvastatin',
    activeIngredient: 'Simvastatin 20mg',
    strength: '20mg',
    dosageForm: 'Tablet',
    packSize: '30 tablets',
    schedule: 'S3',
    manufacturer: 'Adcock Ingram',
    sepPrice: 52.30,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'C10AA01',
    atcDescription: 'Simvastatin',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7076521': {
    nappiCode: '7076521',
    productName: 'Adco-Bisocor 5mg Tablets',
    genericName: 'Bisoprolol',
    activeIngredient: 'Bisoprolol fumarate 5mg',
    strength: '5mg',
    dosageForm: 'Tablet',
    packSize: '30 tablets',
    schedule: 'S3',
    manufacturer: 'Adcock Ingram',
    sepPrice: 78.15,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'C07AB07',
    atcDescription: 'Bisoprolol',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Diabetes ──
  '7062912': {
    nappiCode: '7062912',
    productName: 'Glycomin 500mg Tablets',
    genericName: 'Metformin',
    activeIngredient: 'Metformin hydrochloride 500mg',
    strength: '500mg',
    dosageForm: 'Tablet',
    packSize: '60 tablets',
    schedule: 'S3',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 38.92,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'A10BA02',
    atcDescription: 'Metformin',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7062913': {
    nappiCode: '7062913',
    productName: 'Glycomin 850mg Tablets',
    genericName: 'Metformin',
    activeIngredient: 'Metformin hydrochloride 850mg',
    strength: '850mg',
    dosageForm: 'Tablet',
    packSize: '60 tablets',
    schedule: 'S3',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 56.40,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'A10BA02',
    atcDescription: 'Metformin',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Gastrointestinal ──
  '7018790': {
    nappiCode: '7018790',
    productName: 'Altosec 20mg Capsules',
    genericName: 'Omeprazole',
    activeIngredient: 'Omeprazole 20mg',
    strength: '20mg',
    dosageForm: 'Capsule',
    packSize: '28 capsules',
    schedule: 'S2',
    manufacturer: 'Aspen Pharmacare',
    sepPrice: 82.15,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'A02BC01',
    atcDescription: 'Omeprazole',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Antibiotics ──
  '7029534': {
    nappiCode: '7029534',
    productName: 'Betamox 500mg Capsules',
    genericName: 'Amoxicillin',
    activeIngredient: 'Amoxicillin trihydrate 500mg',
    strength: '500mg',
    dosageForm: 'Capsule',
    packSize: '100 capsules',
    schedule: 'S2',
    manufacturer: 'Sandoz SA',
    sepPrice: 95.60,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'J01CA04',
    atcDescription: 'Amoxicillin',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7029540': {
    nappiCode: '7029540',
    productName: 'Augmentin 625mg Tablets',
    genericName: 'Amoxicillin/Clavulanate',
    activeIngredient: 'Amoxicillin 500mg + Clavulanic acid 125mg',
    strength: '625mg',
    dosageForm: 'Tablet',
    packSize: '20 tablets',
    schedule: 'S3',
    manufacturer: 'GSK',
    sepPrice: 148.70,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'J01CR02',
    atcDescription: 'Amoxicillin and enzyme inhibitor',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },
  '7034821': {
    nappiCode: '7034821',
    productName: 'Azithromycin Sandoz 500mg Tablets',
    genericName: 'Azithromycin',
    activeIngredient: 'Azithromycin 500mg',
    strength: '500mg',
    dosageForm: 'Tablet',
    packSize: '3 tablets',
    schedule: 'S3',
    manufacturer: 'Sandoz SA',
    sepPrice: 67.80,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'J01FA10',
    atcDescription: 'Azithromycin',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Respiratory ──
  '7091245': {
    nappiCode: '7091245',
    productName: 'Venteze Inhaler 100mcg',
    genericName: 'Salbutamol',
    activeIngredient: 'Salbutamol sulphate 100mcg/dose',
    strength: '100mcg/dose',
    dosageForm: 'Pressurised inhalation',
    packSize: '200 doses',
    schedule: 'S2',
    manufacturer: 'Cipla Medpro',
    sepPrice: 42.90,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'R03AC02',
    atcDescription: 'Salbutamol',
    status: 'active',
    category: 'medicine',
    lastUpdated: '2026-03-01',
  },

  // ── Surgical Consumables ──
  '8501234': {
    nappiCode: '8501234',
    productName: 'Examination Gloves Nitrile Medium',
    genericName: 'Nitrile Examination Gloves',
    activeIngredient: 'N/A',
    strength: 'N/A',
    dosageForm: 'Glove',
    packSize: '100 gloves',
    schedule: 'N/A',
    manufacturer: 'Lasec SA',
    sepPrice: 89.00,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'V07AN',
    atcDescription: 'Medical devices - examination',
    status: 'active',
    category: 'surgical_consumable',
    lastUpdated: '2026-03-01',
  },

  // ── Medical Devices ──
  '9201567': {
    nappiCode: '9201567',
    productName: 'OneTouch Select Plus Test Strips',
    genericName: 'Blood Glucose Test Strips',
    activeIngredient: 'N/A',
    strength: 'N/A',
    dosageForm: 'Test strip',
    packSize: '50 strips',
    schedule: 'N/A',
    manufacturer: 'LifeScan (J&J)',
    sepPrice: 215.40,
    sepEffectiveDate: '2026-01-15',
    atcCode: 'V04CA',
    atcDescription: 'Tests for diabetes',
    status: 'active',
    category: 'medical_device',
    lastUpdated: '2026-03-01',
  },
};

// ── Expired / Withdrawn Codes ────────────────────────────────────────────────

const EXPIRED_CODES: Record<string, { productName: string; status: string; message: string }> = {
  '7010050': {
    productName: 'Panado Co-Codamol (old formulation)',
    status: 'expired',
    message: 'NAPPI code expired 2024-06-30. Replaced by code 7010055 (reformulated).',
  },
  '7098765': {
    productName: 'Ranitidine 150mg (Zantac)',
    status: 'withdrawn',
    message: 'Product withdrawn from SA market (2020) due to NDMA contamination. Use alternatives: omeprazole, famotidine.',
  },
  '7045001': {
    productName: 'Vioxx 25mg (Rofecoxib)',
    status: 'withdrawn',
    message: 'Globally withdrawn 2004 due to cardiovascular risk. Use alternatives: celecoxib, meloxicam.',
  },
};

// ── Mock Formulary Data ──────────────────────────────────────────────────────

type FormularyGenerator = (option?: string) => NAPPIFormularyItem[];

const MOCK_FORMULARIES: Record<string, FormularyGenerator> = {
  'discovery health': (_option?: string) => [
    { nappiCode: '7010101', productName: 'Panado 500mg', genericName: 'Paracetamol', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7081411', productName: 'Amloc 5mg', genericName: 'Amlodipine', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7043215', productName: 'Pharmapress 10mg', genericName: 'Enalapril', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7062912', productName: 'Glycomin 500mg', genericName: 'Metformin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7053118', productName: 'Adco-Simvastatin 20mg', genericName: 'Simvastatin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7018790', productName: 'Altosec 20mg', genericName: 'Omeprazole', formularyStatus: 'allowed', requiresPreAuth: false, maxDaysSupply: 28, schemeNotes: 'Step-therapy: trial lifestyle changes first. Max 8 weeks initial course.' },
    { nappiCode: '7029534', productName: 'Betamox 500mg', genericName: 'Amoxicillin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 10 },
    { nappiCode: '7029540', productName: 'Augmentin 625mg', genericName: 'Amoxicillin/Clavulanate', formularyStatus: 'restricted', requiresPreAuth: true, maxDaysSupply: 10, schemeNotes: 'Requires pre-auth. Only if first-line antibiotic failed or culture-directed.' },
    { nappiCode: '7076521', productName: 'Adco-Bisocor 5mg', genericName: 'Bisoprolol', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '9201567', productName: 'OneTouch Select Plus Strips', genericName: 'Glucose Test Strips', formularyStatus: 'allowed', requiresPreAuth: false, maxQuantity: 100, copayAmount: 45.00, schemeNotes: 'Max 100 strips/month for insulin-dependent. 50/month for Type 2.' },
  ],

  'gems': (_option?: string) => [
    { nappiCode: '7010101', productName: 'Panado 500mg', genericName: 'Paracetamol', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7081411', productName: 'Amloc 5mg', genericName: 'Amlodipine', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7062912', productName: 'Glycomin 500mg', genericName: 'Metformin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7053118', productName: 'Adco-Simvastatin 20mg', genericName: 'Simvastatin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7029534', productName: 'Betamox 500mg', genericName: 'Amoxicillin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 7 },
    { nappiCode: '7018790', productName: 'Altosec 20mg', genericName: 'Omeprazole', formularyStatus: 'restricted', requiresPreAuth: true, maxDaysSupply: 28, schemeNotes: 'Requires motivational letter for chronic use beyond 8 weeks.' },
    { nappiCode: '7029540', productName: 'Augmentin 625mg', genericName: 'Amoxicillin/Clavulanate', formularyStatus: 'excluded', requiresPreAuth: true, schemeNotes: 'Not on GEMS formulary for Sapphire option. Available on Emerald/Ruby.' },
  ],

  'bonitas': (_option?: string) => [
    { nappiCode: '7010101', productName: 'Panado 500mg', genericName: 'Paracetamol', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7081411', productName: 'Amloc 5mg', genericName: 'Amlodipine', formularyStatus: 'allowed', requiresPreAuth: false, maxDaysSupply: 30, copayAmount: 15.00 },
    { nappiCode: '7062912', productName: 'Glycomin 500mg', genericName: 'Metformin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7029534', productName: 'Betamox 500mg', genericName: 'Amoxicillin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 10 },
    { nappiCode: '7091245', productName: 'Venteze Inhaler 100mcg', genericName: 'Salbutamol', formularyStatus: 'preferred', requiresPreAuth: false, maxQuantity: 2, schemeNotes: 'Max 2 inhalers per month.' },
  ],

  'prime cure': (_option?: string) => [
    { nappiCode: '7010101', productName: 'Panado 500mg', genericName: 'Paracetamol', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7081411', productName: 'Amloc 5mg', genericName: 'Amlodipine', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7043215', productName: 'Pharmapress 10mg', genericName: 'Enalapril', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7062912', productName: 'Glycomin 500mg', genericName: 'Metformin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7053118', productName: 'Adco-Simvastatin 20mg', genericName: 'Simvastatin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 30 },
    { nappiCode: '7029534', productName: 'Betamox 500mg', genericName: 'Amoxicillin', formularyStatus: 'preferred', requiresPreAuth: false, maxDaysSupply: 5, schemeNotes: 'Capitated — generic only. Max 5-day course for acute infections.' },
    { nappiCode: '7018790', productName: 'Altosec 20mg', genericName: 'Omeprazole', formularyStatus: 'allowed', requiresPreAuth: false, maxDaysSupply: 14, schemeNotes: 'Capitated formulary — max 14-day course. Chronic use requires review.' },
  ],

  'default': (_option?: string) => [
    { nappiCode: '7010101', productName: 'Panado 500mg', genericName: 'Paracetamol', formularyStatus: 'preferred', requiresPreAuth: false },
    { nappiCode: '7081411', productName: 'Amloc 5mg', genericName: 'Amlodipine', formularyStatus: 'allowed', requiresPreAuth: false },
    { nappiCode: '7062912', productName: 'Glycomin 500mg', genericName: 'Metformin', formularyStatus: 'allowed', requiresPreAuth: false },
    { nappiCode: '7029534', productName: 'Betamox 500mg', genericName: 'Amoxicillin', formularyStatus: 'allowed', requiresPreAuth: false },
  ],
};

export default NAPPIAdapter;
