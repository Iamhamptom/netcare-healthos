// ─────────────────────────────────────────────────────────────────────────────
// SAP for Healthcare Adapter — Netcare Health OS
// Netcare's R100M+ SAP deployment: largest private healthcare SAP globally
// Covers: Patient ADT, Billing (rules engine + medical aid claims),
//         Materials Management, Procurement, Financial Management
// OData API patterns — swap mock → real by replacing fetch calls
// ─────────────────────────────────────────────────────────────────────────────

import { logger } from "@/lib/logger";

const LOG_PREFIX = '[sap]';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SAPClinicRevenue {
  clinicId: string;
  clinicName: string;
  month: string; // YYYY-MM
  revenue: number;
  target: number;
  collectionRatio: number; // 0–1
  cashRevenue: number;
  medicalAidRevenue: number;
  outstandingDebtors: number;
  revenueGrowthYoY: number; // percentage
  currency: 'ZAR';
}

export interface SAPDebtorAgingBand {
  band: '0-30' | '31-60' | '61-90' | '91-120' | '120+';
  amount: number;
  claimCount: number;
  percentOfTotal: number;
}

export interface SAPDebtorAging {
  clinicId: string;
  clinicName: string;
  asAtDate: string;
  totalOutstanding: number;
  bands: SAPDebtorAgingBand[];
  topDebtorSchemes: { scheme: string; amount: number }[];
  currency: 'ZAR';
}

export interface SAPCapitationMetrics {
  clinicId: string;
  clinicName: string;
  month: string;
  scheme: string; // e.g. "Prime Cure"
  livesCapitated: number;
  pmpmRate: number; // Per Member Per Month contracted rate
  pmpmActual: number; // Actual cost per member
  capitationRevenue: number;
  actualCost: number;
  surplus: number; // positive = profit, negative = loss
  utilizationRate: number; // percentage
  claimsCount: number;
  currency: 'ZAR';
}

export interface SAPFinancialSummary {
  division: string;
  period: string; // e.g. "FY2026-H1"
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  netProfit: number;
  netMargin: number;
  headcount: number;
  revenuePerEmployee: number;
  currency: 'ZAR';
}

export interface SAPProcurementAlert {
  id: string;
  type: 'low_stock' | 'overspend' | 'contract_expiry' | 'price_variance' | 'delivery_delay';
  severity: 'critical' | 'warning' | 'info';
  materialCode: string;
  materialName: string;
  clinicId?: string;
  clinicName?: string;
  message: string;
  currentValue: number;
  thresholdValue: number;
  raisedAt: string;
  dueBy?: string;
}

export interface SAPODataResponse<T> {
  'd': {
    'results': T[];
    '__count'?: number;
    '__next'?: string;
  };
}

// ── SAP Adapter ──────────────────────────────────────────────────────────────

export class SAPAdapter {
  private baseUrl: string;
  private apiKey: string;
  private connected: boolean = false;

  constructor(config?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = config?.baseUrl ?? process.env.SAP_ODATA_BASE_URL ?? 'https://sap-hc.netcare.co.za/sap/opu/odata/sap';
    this.apiKey = config?.apiKey ?? process.env.SAP_API_KEY ?? '';
    logger.info(`${LOG_PREFIX} Adapter initialized (endpoint: ${this.baseUrl})`);
  }

  /** Test SAP connectivity */
  async testConnection(): Promise<{ connected: boolean; latencyMs: number; sapSystem: string }> {
    const start = Date.now();
    // In production: GET /sap/opu/odata/sap/ZHCOS_HEALTH_SRV/$metadata
    logger.info(`${LOG_PREFIX} Testing connection to SAP...`);
    await this.simulateLatency(50, 150);
    this.connected = true;
    const latency = Date.now() - start;
    logger.info(`${LOG_PREFIX} Connected (${latency}ms)`);
    return { connected: true, latencyMs: latency, sapSystem: 'SAP ECC 6.0 EHP8 — Netcare Healthcare' };
  }

  // ── Revenue ────────────────────────────────────────────────────────────────

  /** GET /ZHCOS_FINANCE_SRV/ClinicRevenueSet?$filter=ClinicId eq '{clinicId}' and Period eq '{month}' */
  async getClinicRevenue(clinicId: string, month: string): Promise<SAPClinicRevenue> {
    logger.info(`${LOG_PREFIX} Fetching clinic revenue: clinic=${clinicId}, month=${month}`);
    await this.simulateLatency(100, 300);

    const clinic = MOCK_CLINICS[clinicId] ?? { name: `Medicross ${clinicId}`, tier: 'mid' };
    const tier = clinic.tier as 'flagship' | 'high' | 'mid' | 'standard';

    // Realistic revenue ranges by clinic tier (monthly)
    const revenueRanges: Record<string, { min: number; max: number }> = {
      flagship: { min: 2_800_000, max: 3_600_000 },
      high: { min: 1_800_000, max: 2_500_000 },
      mid: { min: 900_000, max: 1_500_000 },
      standard: { min: 400_000, max: 800_000 },
    };

    const range = revenueRanges[tier] ?? revenueRanges.mid;
    const revenue = this.randomInRange(range.min, range.max);
    const target = revenue * this.randomInRange(0.95, 1.10); // target +-
    const medicalAidPct = this.randomInRange(0.62, 0.78);

    const result: SAPClinicRevenue = {
      clinicId,
      clinicName: clinic.name,
      month,
      revenue: Math.round(revenue),
      target: Math.round(target),
      collectionRatio: parseFloat(this.randomInRange(0.87, 0.96).toFixed(3)),
      cashRevenue: Math.round(revenue * (1 - medicalAidPct)),
      medicalAidRevenue: Math.round(revenue * medicalAidPct),
      outstandingDebtors: Math.round(revenue * this.randomInRange(0.08, 0.18)),
      revenueGrowthYoY: parseFloat(this.randomInRange(-2, 12).toFixed(1)),
      currency: 'ZAR',
    };

    logger.info(`${LOG_PREFIX} Revenue fetched for clinic=${clinicId}, month=${month}`);
    return result;
  }

  // ── Debtor Aging ───────────────────────────────────────────────────────────

  /** GET /ZHCOS_FINANCE_SRV/DebtorAgingSet?$filter=ClinicId eq '{clinicId}' */
  async getDebtorAging(clinicId: string): Promise<SAPDebtorAging> {
    logger.info(`${LOG_PREFIX} Fetching debtor aging: clinic=${clinicId}`);
    await this.simulateLatency(100, 250);

    const clinic = MOCK_CLINICS[clinicId] ?? { name: `Medicross ${clinicId}`, tier: 'mid' };
    const totalOutstanding = this.randomInRange(180_000, 650_000);

    // Typical aging distribution — most debt is current
    const distribution = [0.42, 0.25, 0.15, 0.10, 0.08];
    const bandNames: SAPDebtorAgingBand['band'][] = ['0-30', '31-60', '61-90', '91-120', '120+'];

    const bands: SAPDebtorAgingBand[] = bandNames.map((band, i) => ({
      band,
      amount: Math.round(totalOutstanding * distribution[i]),
      claimCount: Math.round(this.randomInRange(15, 85) * (1 - i * 0.15)),
      percentOfTotal: parseFloat((distribution[i] * 100).toFixed(1)),
    }));

    const result: SAPDebtorAging = {
      clinicId,
      clinicName: clinic.name,
      asAtDate: new Date().toISOString().split('T')[0],
      totalOutstanding: Math.round(totalOutstanding),
      bands,
      topDebtorSchemes: [
        { scheme: 'Discovery Health', amount: Math.round(totalOutstanding * 0.32) },
        { scheme: 'GEMS', amount: Math.round(totalOutstanding * 0.18) },
        { scheme: 'Bonitas', amount: Math.round(totalOutstanding * 0.14) },
        { scheme: 'Medihelp', amount: Math.round(totalOutstanding * 0.11) },
        { scheme: 'Momentum Health', amount: Math.round(totalOutstanding * 0.09) },
      ],
      currency: 'ZAR',
    };

    logger.info(`${LOG_PREFIX} Debtor aging fetched for clinic=${clinicId}`);
    return result;
  }

  // ── Capitation Metrics ─────────────────────────────────────────────────────

  /** GET /ZHCOS_FINANCE_SRV/CapitationSet?$filter=ClinicId eq '{clinicId}' */
  async getCapitationMetrics(clinicId: string): Promise<SAPCapitationMetrics> {
    logger.info(`${LOG_PREFIX} Fetching capitation metrics: clinic=${clinicId}`);
    await this.simulateLatency(80, 200);

    const clinic = MOCK_CLINICS[clinicId] ?? { name: `Medicross ${clinicId}`, tier: 'mid' };
    const lives = Math.round(this.randomInRange(800, 4200));
    const pmpmRate = 287; // Prime Cure contracted rate R287 PMPM
    const pmpmActual = parseFloat(this.randomInRange(245, 320).toFixed(2));
    const capitationRevenue = lives * pmpmRate;
    const actualCost = lives * pmpmActual;

    const result: SAPCapitationMetrics = {
      clinicId,
      clinicName: clinic.name,
      month: new Date().toISOString().slice(0, 7),
      scheme: 'Prime Cure',
      livesCapitated: lives,
      pmpmRate,
      pmpmActual,
      capitationRevenue,
      actualCost: Math.round(actualCost),
      surplus: Math.round(capitationRevenue - actualCost),
      utilizationRate: parseFloat(this.randomInRange(58, 82).toFixed(1)),
      claimsCount: Math.round(lives * this.randomInRange(0.35, 0.65)),
      currency: 'ZAR',
    };

    logger.info(`${LOG_PREFIX} Capitation fetched for clinic=${clinicId}`);
    return result;
  }

  // ── Financial Summary ──────────────────────────────────────────────────────

  /** GET /ZHCOS_FINANCE_SRV/DivisionPLSet?$filter=Division eq 'Primary Care' */
  async getFinancialSummary(): Promise<SAPFinancialSummary> {
    logger.info(`${LOG_PREFIX} Fetching division-level financial summary`);
    await this.simulateLatency(150, 400);

    // Netcare Primary Care division financials (realistic — based on public disclosures)
    const revenue = 662_000_000; // R662M annual
    const costOfSales = 398_000_000;
    const grossProfit = revenue - costOfSales;
    const operatingExpenses = 102_000_000;
    const ebitda = 162_000_000; // R162M EBITDA
    const netProfit = 118_000_000;

    const result: SAPFinancialSummary = {
      division: 'Netcare Primary Care',
      period: 'FY2026-H1',
      revenue,
      costOfSales,
      grossProfit,
      grossMargin: parseFloat(((grossProfit / revenue) * 100).toFixed(1)),
      operatingExpenses,
      ebitda,
      ebitdaMargin: parseFloat(((ebitda / revenue) * 100).toFixed(1)), // ~24.5%
      netProfit,
      netMargin: parseFloat(((netProfit / revenue) * 100).toFixed(1)),
      headcount: 3_842,
      revenuePerEmployee: Math.round(revenue / 3_842),
      currency: 'ZAR',
    };

    logger.info(`${LOG_PREFIX} Division P&L fetched for period=${result.period}`);
    return result;
  }

  // ── Procurement Alerts ─────────────────────────────────────────────────────

  /** GET /ZHCOS_MM_SRV/ProcurementAlertSet?$orderby=Severity desc */
  async getProcurementAlerts(): Promise<SAPProcurementAlert[]> {
    logger.info(`${LOG_PREFIX} Fetching procurement alerts`);
    await this.simulateLatency(100, 250);

    const alerts: SAPProcurementAlert[] = [
      {
        id: 'PA-2026-001',
        type: 'low_stock',
        severity: 'critical',
        materialCode: 'MAT-00145',
        materialName: 'Examination Gloves (Medium, Nitrile)',
        clinicId: 'MC-JHB-001',
        clinicName: 'Medicross Midrand',
        message: 'Stock at 12% of safety level. 3 days supply remaining at current consumption rate.',
        currentValue: 240,
        thresholdValue: 2000,
        raisedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
        dueBy: new Date(Date.now() + 3 * 86400_000).toISOString(),
      },
      {
        id: 'PA-2026-002',
        type: 'overspend',
        severity: 'warning',
        materialCode: 'MAT-00089',
        materialName: 'Rapid HIV Test Kits (Determine)',
        clinicId: 'MC-JHB-003',
        clinicName: 'Medicross Centurion',
        message: 'Monthly spend 34% above budget. R48,200 spent vs R36,000 budget.',
        currentValue: 48_200,
        thresholdValue: 36_000,
        raisedAt: new Date(Date.now() - 18 * 3600_000).toISOString(),
      },
      {
        id: 'PA-2026-003',
        type: 'contract_expiry',
        severity: 'warning',
        materialCode: 'CON-SUP-012',
        materialName: 'Surgical Consumables (Adcock Ingram contract)',
        message: 'Supply contract expires in 28 days. Renewal negotiation required.',
        currentValue: 28,
        thresholdValue: 90,
        raisedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
        dueBy: new Date(Date.now() + 28 * 86400_000).toISOString(),
      },
      {
        id: 'PA-2026-004',
        type: 'price_variance',
        severity: 'info',
        materialCode: 'MAT-00312',
        materialName: 'Metformin 500mg (Glycomin) 100s',
        clinicId: 'MC-CPT-001',
        clinicName: 'Medicross Claremont',
        message: 'Supplier price increased 8.2% vs contracted rate. SEP adjustment pending.',
        currentValue: 108.2,
        thresholdValue: 100,
        raisedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
      },
      {
        id: 'PA-2026-005',
        type: 'low_stock',
        severity: 'warning',
        materialCode: 'MAT-00201',
        materialName: 'Amlodipine 5mg (Amloc) 30s',
        clinicId: 'MC-JHB-005',
        clinicName: 'Medicross Sandton',
        message: 'Stock below reorder point. 8 days supply remaining. PO auto-generated.',
        currentValue: 45,
        thresholdValue: 120,
        raisedAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
      },
      {
        id: 'PA-2026-006',
        type: 'delivery_delay',
        severity: 'warning',
        materialCode: 'MAT-00178',
        materialName: 'Blood Collection Tubes (EDTA, Purple)',
        clinicId: 'MC-DBN-001',
        clinicName: 'Medicross Umhlanga',
        message: 'Delivery 4 days overdue from Becton Dickinson. ETA updated to next Tuesday.',
        currentValue: 4,
        thresholdValue: 0,
        raisedAt: new Date(Date.now() - 4 * 86400_000).toISOString(),
      },
    ];

    logger.info(`${LOG_PREFIX} ${alerts.length} procurement alerts (${alerts.filter(a => a.severity === 'critical').length} critical)`);
    return alerts;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private async simulateLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.floor(Math.random() * (maxMs - minMs) + minMs);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}

// ── Mock Clinic Registry ─────────────────────────────────────────────────────

const MOCK_CLINICS: Record<string, { name: string; tier: string }> = {
  'MC-JHB-001': { name: 'Medicross Midrand', tier: 'flagship' },
  'MC-JHB-002': { name: 'Medicross Fourways', tier: 'high' },
  'MC-JHB-003': { name: 'Medicross Centurion', tier: 'high' },
  'MC-JHB-004': { name: 'Medicross Woodmead', tier: 'mid' },
  'MC-JHB-005': { name: 'Medicross Sandton', tier: 'flagship' },
  'MC-JHB-006': { name: 'Medicross Benoni', tier: 'standard' },
  'MC-CPT-001': { name: 'Medicross Claremont', tier: 'high' },
  'MC-CPT-002': { name: 'Medicross Tygervalley', tier: 'mid' },
  'MC-DBN-001': { name: 'Medicross Umhlanga', tier: 'high' },
  'MC-DBN-002': { name: 'Medicross Westville', tier: 'mid' },
  'MC-PTA-001': { name: 'Medicross Menlyn', tier: 'flagship' },
  'MC-PTA-002': { name: 'Medicross Brooklyn', tier: 'high' },
};

export default SAPAdapter;
