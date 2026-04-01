/**
 * Onboarding Agent — Proactive AI that guides every user through setup
 *
 * Unlike a chatbot that answers questions, this agent:
 * 1. KNOWS where the user is in their onboarding journey
 * 2. ASKS questions to gather needed information
 * 3. ACTS on answers (connects systems, configures tools, navigates)
 * 4. REMEMBERS progress across sessions
 * 5. ADAPTS to role (doctor gets scribe setup, clerk gets claims setup)
 */

export interface OnboardingState {
  userId: string;
  role: string;
  name: string;
  currentPhase: "welcome" | "role_confirm" | "systems_check" | "connections" | "first_task" | "ongoing";
  completedSteps: string[];
  pendingQuestion?: string;
  context: Record<string, unknown>;
  updatedAt: string;
}

interface OnboardingStep {
  id: string;
  phase: OnboardingState["currentPhase"];
  roles: string[];
  question: string;
  action?: string; // Tool to call after answer
  navigate?: string; // Page to navigate to
  dependsOn?: string[]; // Steps that must be done first
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  // Phase 1: Welcome
  { id: "welcome", phase: "welcome", roles: ["all"],
    question: "Welcome to Health OS! I'm your AI assistant and I'll help you get set up. First — what's your role here? Are you a **doctor**, **billing clerk**, **receptionist**, **practice manager**, or **executive**?" },

  // Phase 2: Role-specific system check
  { id: "systems_used", phase: "systems_check", roles: ["all"],
    question: "What systems do you currently use? For example: CareOn, HEAL, Healthbridge, SwitchOn, Excel spreadsheets, paper-based?" },

  { id: "medical_aid_schemes", phase: "systems_check", roles: ["admin", "receptionist", "billing"],
    question: "Which medical aid schemes do you work with most? (Discovery Health, GEMS, Bonitas, Medshield, Momentum, Bestmed?)" },

  // Phase 3: Connections
  { id: "connect_email", phase: "connections", roles: ["admin", "doctor"],
    question: "Want me to connect your email for notifications and document delivery? I support Gmail and Outlook.",
    navigate: "/dashboard/settings/microsoft" },

  { id: "connect_whatsapp", phase: "connections", roles: ["admin", "receptionist"],
    question: "Do you have a WhatsApp Business number for patient communication? I can help set up automated appointment reminders and engagement sequences.",
    navigate: "/dashboard/whatsapp" },

  // Phase 4: First task per role
  { id: "first_task_doctor", phase: "first_task", roles: ["doctor"],
    question: "Let's try the AI Scribe — your most powerful tool. Want me to take you there? You can record a consultation and I'll generate SOAP notes with ICD-10 codes automatically.",
    navigate: "/dashboard/scribe" },

  { id: "first_task_clerk", phase: "first_task", roles: ["receptionist", "billing", "admin"],
    question: "Let's validate your first claims batch. Do you have a CSV file of claims ready? I can take you to the Claims Analyzer where you'll see the AI catch errors in seconds.",
    navigate: "/dashboard/claims" },

  { id: "first_task_manager", phase: "first_task", roles: ["admin", "platform_admin"],
    question: "Want to see the executive dashboard? I'll show you the R54.2M recovery story, clinic-by-clinic performance, and the 3-year ROI model.",
    navigate: "/dashboard/executive" },

  { id: "first_task_it", phase: "first_task", roles: ["admin", "platform_admin"],
    question: "Let me show you the architecture and security setup. The tech team will want to see our 5-tier AI governance framework, POPIA compliance, and integration adapters.",
    navigate: "/dashboard/architecture" },
];

/**
 * Get the default onboarding state for a new user
 */
export function getDefaultState(userId: string, name: string, role: string): OnboardingState {
  return {
    userId,
    role,
    name,
    currentPhase: "welcome",
    completedSteps: [],
    context: {},
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get the next step for this user based on their state
 */
export function getNextStep(state: OnboardingState): OnboardingStep | null {
  const userRole = state.role;

  for (const step of ONBOARDING_STEPS) {
    // Skip completed steps
    if (state.completedSteps.includes(step.id)) continue;

    // Check role match
    if (!step.roles.includes("all") && !step.roles.includes(userRole)) continue;

    // Check dependencies
    if (step.dependsOn?.some(dep => !state.completedSteps.includes(dep))) continue;

    return step;
  }

  return null; // All steps done
}

/**
 * Process user's answer and advance the onboarding state
 */
export function processAnswer(state: OnboardingState, answer: string, currentStep: OnboardingStep): {
  newState: OnboardingState;
  response: string;
  navigate?: string;
} {
  const newState = { ...state, updatedAt: new Date().toISOString() };

  // Process based on step
  switch (currentStep.id) {
    case "welcome": {
      // Extract role from answer
      const lower = answer.toLowerCase();
      let detectedRole = state.role;
      if (lower.includes("doctor") || lower.includes("gp") || lower.includes("physician")) detectedRole = "doctor";
      else if (lower.includes("clerk") || lower.includes("billing")) detectedRole = "billing";
      else if (lower.includes("reception") || lower.includes("front desk")) detectedRole = "receptionist";
      else if (lower.includes("manager") || lower.includes("practice")) detectedRole = "admin";
      else if (lower.includes("executive") || lower.includes("ceo") || lower.includes("md") || lower.includes("director")) detectedRole = "platform_admin";

      newState.role = detectedRole;
      newState.completedSteps.push("welcome");
      newState.currentPhase = "systems_check";
      newState.context.confirmedRole = detectedRole;

      const roleLabel = { doctor: "Doctor", billing: "Billing Clerk", receptionist: "Receptionist", admin: "Practice Manager", platform_admin: "Executive" }[detectedRole] || detectedRole;

      return {
        newState,
        response: `Got it — you're a **${roleLabel}**. I'll set up your dashboard with the tools you need most.\n\nNow let me understand your current setup...`,
      };
    }

    case "systems_used": {
      newState.completedSteps.push("systems_used");
      newState.context.currentSystems = answer;

      const usesCareon = answer.toLowerCase().includes("careon");
      const usesHeal = answer.toLowerCase().includes("heal");
      const usesExcel = answer.toLowerCase().includes("excel") || answer.toLowerCase().includes("spreadsheet");

      let response = "Thanks — I've noted your current systems.\n\n";
      if (usesCareon) response += "- **CareOn**: Great — our CareOn Bridge translates HL7v2 to FHIR R4 automatically. No changes needed to CareOn.\n";
      if (usesHeal) response += "- **HEAL**: We have an adapter ready for HEAL integration. Once A2D24 provides API specs, it's a 2-week connection.\n";
      if (usesExcel) response += "- **Excel**: Our Claims Analyzer replaces Excel-based claims validation. Upload your CSV and see the difference in 2 seconds.\n";
      if (!usesCareon && !usesHeal && !usesExcel) response += "We'll integrate with whatever you're using. Our adapter pattern makes it a configuration task, not a development project.\n";

      return { newState, response };
    }

    case "medical_aid_schemes": {
      newState.completedSteps.push("medical_aid_schemes");
      newState.context.schemes = answer;
      newState.currentPhase = "connections";
      return {
        newState,
        response: `Noted. We have full scheme profiles for **Discovery Health, GEMS, Bonitas, Medshield, Momentum, and Bestmed** — including scheme-specific coding rules, option code requirements, and PMB/CDL coverage.\n\nLet's get you connected...`,
      };
    }

    default: {
      // Generic step completion
      newState.completedSteps.push(currentStep.id);
      if (currentStep.navigate) {
        return {
          newState,
          response: `Taking you to **${currentStep.question.split("?")[0].split("—")[0].trim()}**...`,
          navigate: currentStep.navigate,
        };
      }
      return { newState, response: "Got it. Moving on..." };
    }
  }
}

/**
 * Generate a proactive greeting based on user role and time of day
 */
export function getProactiveGreeting(state: OnboardingState): string {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = state.name.split(" ")[0]; // First name

  if (state.currentPhase === "ongoing") {
    // Returning user — role-specific briefing
    switch (state.role) {
      case "doctor":
        return `${timeGreeting}, Dr. ${name}. Ready to start consultations? I can open the scribe, check your schedule, or look up a patient.`;
      case "receptionist":
      case "billing":
        return `${timeGreeting}, ${name}. Today's bookings are loaded. Want me to open the check-in queue or run claims validation?`;
      case "admin":
        return `${timeGreeting}, ${name}. Want your morning briefing? I can show you today's KPIs, pending recalls, or the engagement dashboard.`;
      case "platform_admin":
        return `${timeGreeting}, ${name}. Executive summary ready. Want me to open the revenue dashboard or check the latest claims recovery numbers?`;
      default:
        return `${timeGreeting}, ${name}. How can I help you today?`;
    }
  }

  // New user — start onboarding
  const nextStep = getNextStep(state);
  if (nextStep) {
    return nextStep.question;
  }

  return `${timeGreeting}, ${name}. You're all set up. How can I help you today?`;
}
