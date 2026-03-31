/* ─── Health OS Module System — Types ─── */

export type IntegrationStatus = "connected" | "needs_setup" | "stubbed" | "inactive";

export interface ModuleIntegration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  /** What breaks without this integration */
  impact: string;
  /** What to do if not connected */
  fallback: string;
  /** Environment variable(s) required */
  envKeys?: string[];
  /** Setup instructions or link */
  setupHint?: string;
}

export interface ModuleNavItem {
  href: string;
  icon: string; // Lucide icon name
  label: string;
  roles: string[];
  /** Step number in the workflow (for ordered modules like Practice Manager) */
  step?: number;
}

export interface ModuleDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Lucide icon name
  /** Accent color for the module header */
  color: string;
  /** Badge text (e.g. "NEW", "AI", "LIVE") */
  badge?: string;
  badgeColor?: string;
  /** Pages within this module — these are existing routes */
  pages: ModuleNavItem[];
  /** External integrations this module depends on */
  integrations: ModuleIntegration[];
  /** Agent context — what the agent should know when inside this module */
  agentContext: {
    capabilities: string[];
    scope: string;
    /** Tools the agent should prioritize in this module */
    priorityTools?: string[];
  };
  /** Feature gate — maps to TenantFeatures key */
  featureGate?: string;
  /** Roles that can access this module */
  roles: string[];
  /** Whether this module runs in background (no primary UI) */
  isBackground?: boolean;
}

export interface ModuleRegistry {
  modules: ModuleDefinition[];
  /** Get a module by ID */
  getModule: (id: string) => ModuleDefinition | undefined;
  /** Get modules visible to a role */
  getModulesForRole: (role: string) => ModuleDefinition[];
  /** Find which module a route belongs to */
  getModuleForRoute: (pathname: string) => ModuleDefinition | undefined;
}
