/**
 * Data Source Factory
 *
 * Returns the correct data source based on environment:
 * - NETCARE_API_MODE=live → NetcareApiDataSource (real Netcare APIs)
 * - Default → SupabaseDataSource (reads from seeded Supabase tables)
 *
 * All modules fetch through this — swap demo → real by setting one env var.
 */

import { SupabaseDataSource } from "./supabase-source";
import { NetcareApiDataSource } from "./netcare";
import type {
  NetworkDataSource,
  SavingsDataSource,
  ClaimsDataSource,
  BridgeDataSource,
  WhatsAppDataSource,
} from "./types";

export type { NetworkDataSource, SavingsDataSource, ClaimsDataSource, BridgeDataSource, WhatsAppDataSource };

// Set NETCARE_API_MODE=live to switch all data sources to real Netcare APIs.
// Each adapter falls back to Supabase on failure (circuit breaker pattern).

let _network: NetworkDataSource | null = null;
let _savings: SavingsDataSource | null = null;
let _claims: ClaimsDataSource | null = null;
let _bridge: BridgeDataSource | null = null;
let _whatsapp: WhatsAppDataSource | null = null;

function createSource() {
  if (process.env.NETCARE_API_MODE === "live") return new NetcareApiDataSource();
  return new SupabaseDataSource();
}

export function getNetworkSource(): NetworkDataSource {
  if (!_network) _network = createSource();
  return _network;
}

export function getSavingsSource(): SavingsDataSource {
  if (!_savings) _savings = createSource();
  return _savings;
}

export function getClaimsSource(): ClaimsDataSource {
  if (!_claims) _claims = createSource();
  return _claims;
}

export function getBridgeSource(): BridgeDataSource {
  if (!_bridge) _bridge = createSource();
  return _bridge;
}

export function getWhatsAppSource(): WhatsAppDataSource {
  if (!_whatsapp) _whatsapp = createSource();
  return _whatsapp;
}
