/**
 * RAG v3 Query Router — Netcare Health OS
 * Classifies queries and determines the optimal retrieval strategy.
 * Uses pattern matching first (fast), then LLM classification for ambiguous queries.
 */

import type { QueryType, RetrievalPlan } from "./types";

// ── Pattern definitions ───────────────────────────────────────────

const PATTERNS: { type: QueryType; patterns: RegExp[] }[] = [
  {
    type: "exact_lookup",
    patterns: [
      // ICD-10 code lookups
      /\b(what is|lookup|look up|find|code)\b.*\b[A-Z]\d{2}\.?\d{0,2}\b/i,
      // NAPPI lookups
      /\b(nappi|medicine|drug)\b.*\b\d{7,10}\b/i,
      /\b\d{7,10}\b.*\b(nappi|medicine|drug)\b/i,
      // Tariff lookups
      /\b(tariff|procedure|fee)\b.*\b\d{4}\b/i,
      // Practice number lookups
      /\b(practice|facility|hospital)\b.*\b(MP|PR|DN)\d{5,7}\b/i,
      // Direct code mentions
      /^[A-Z]\d{2}\.?\d{0,2}$/,
      /^\d{4,10}$/,
    ],
  },
  {
    type: "code_search",
    patterns: [
      /\b(unbundl|code pair|violation|combin|together)\b/i,
      /\b(which code|what code|correct code|right code)\b/i,
      /\b(icd.?10|cpt|ccsa|modifier)\b.*\b(for|of|meaning)\b/i,
      /\bcode\b.*\b(search|find|match)\b/i,
    ],
  },
  {
    type: "scheme_rule",
    patterns: [
      /\b(discovery|gems|bonitas|momentum|medshield|bestmed|medihelp)\b/i,
      /\b(scheme|plan|option|benefit|formulary|drp)\b/i,
      /\b(pre.?auth|prior.?auth|authorization)\b/i,
      /\b(waiting period|late joiner|co.?payment|gap cover)\b/i,
      /\b(designated service provider|dsp|network)\b/i,
    ],
  },
  {
    type: "regulation",
    patterns: [
      /\b(medical schemes act|msa|section\s+\d+|regulation)\b/i,
      /\b(popia|protection of personal|privacy)\b/i,
      /\b(hpcsa|health professions|ethical)\b/i,
      /\b(sahpra|samd|medical device)\b/i,
      /\b(cms|council for medical|registrar)\b/i,
      /\b(nhi|national health insurance)\b/i,
      /\b(pmb|prescribed minimum)\b/i,
      /\b(cdl|chronic disease list)\b/i,
    ],
  },
  {
    type: "clinical",
    patterns: [
      /\b(diagnos|treatment|therapy|procedure|surgery|medication)\b/i,
      /\b(patient|clinical|symptom|condition|disease)\b/i,
      /\b(dtp|diagnosis.treatment pair)\b/i,
      /\b(contraindication|interaction|side effect)\b/i,
      /\b(dosage|dose|frequency|route)\b/i,
    ],
  },
  {
    type: "analytical",
    patterns: [
      /\b(how many|what percentage|trend|statistic|analysis)\b/i,
      /\b(compare|versus|vs|difference between)\b/i,
      /\b(top|most common|frequent|highest|lowest)\b/i,
      /\b(fraud|waste|abuse|fwa)\b/i,
      /\b(revenue|cost|pricing|rate)\b/i,
    ],
  },
  {
    type: "multi_hop",
    patterns: [
      /\b(and|also|additionally|furthermore)\b.*\b(and|also)\b/i,
      /\b(relationship|between|link|connect)\b.*\b(and)\b/i,
      /\b(if.*then|when.*should|what happens when)\b/i,
      /\b(step by step|process|workflow|flowchart)\b/i,
    ],
  },
];

// ── Retrieval plans for each query type ───────────────────────────

const RETRIEVAL_PLANS: Record<QueryType, RetrievalPlan> = {
  exact_lookup: {
    useVector: false,
    useKeyword: false,
    useStructured: true,
    useQueryExpansion: false,
    useHyDE: false,
    useRerank: false,
    vectorLimit: 0,
    keywordLimit: 0,
  },
  code_search: {
    useVector: true,
    useKeyword: true,
    useStructured: true,
    useQueryExpansion: false,
    useHyDE: false,
    useRerank: true,
    vectorLimit: 20,
    keywordLimit: 20,
    categories: ["coding", "claims"],
  },
  scheme_rule: {
    useVector: true,
    useKeyword: true,
    useStructured: false,
    useQueryExpansion: true,
    useHyDE: false,
    useRerank: true,
    vectorLimit: 30,
    keywordLimit: 20,
    categories: ["scheme"],
  },
  regulation: {
    useVector: true,
    useKeyword: true,
    useStructured: false,
    useQueryExpansion: true,
    useHyDE: true,
    useRerank: true,
    vectorLimit: 30,
    keywordLimit: 20,
    categories: ["law", "compliance"],
  },
  multi_hop: {
    useVector: true,
    useKeyword: true,
    useStructured: true,
    useQueryExpansion: true,
    useHyDE: true,
    useRerank: true,
    vectorLimit: 40,
    keywordLimit: 20,
  },
  analytical: {
    useVector: true,
    useKeyword: true,
    useStructured: true,
    useQueryExpansion: true,
    useHyDE: false,
    useRerank: true,
    vectorLimit: 30,
    keywordLimit: 20,
  },
  clinical: {
    useVector: true,
    useKeyword: true,
    useStructured: true,
    useQueryExpansion: true,
    useHyDE: true,
    useRerank: true,
    vectorLimit: 30,
    keywordLimit: 20,
    categories: ["clinical", "pharma", "pmb"],
  },
  general: {
    useVector: true,
    useKeyword: true,
    useStructured: false,
    useQueryExpansion: true,
    useHyDE: false,
    useRerank: true,
    vectorLimit: 20,
    keywordLimit: 20,
  },
};

// ── Public API ────────────────────────────────────────────────────

/**
 * Classify a query into one of the predefined query types.
 * Uses regex pattern matching (fast, no API call).
 */
export function classifyQuery(query: string): QueryType {
  // Score each type by how many patterns match
  const scores: { type: QueryType; score: number }[] = [];

  for (const { type, patterns } of PATTERNS) {
    let score = 0;
    for (const pattern of patterns) {
      if (pattern.test(query)) {
        score++;
      }
    }
    if (score > 0) {
      scores.push({ type, score });
    }
  }

  if (scores.length === 0) {
    return "general";
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // If the top score is significantly higher, use it
  if (scores.length === 1 || scores[0].score > scores[1].score) {
    return scores[0].type;
  }

  // Tie-breaking: prefer more specific types
  const priority: QueryType[] = [
    "exact_lookup",
    "code_search",
    "scheme_rule",
    "regulation",
    "clinical",
    "multi_hop",
    "analytical",
    "general",
  ];

  for (const type of priority) {
    if (scores.some((s) => s.type === type && s.score === scores[0].score)) {
      return type;
    }
  }

  return scores[0].type;
}

/**
 * Get the retrieval plan for a given query type.
 * Returns which retrieval strategies to use and their parameters.
 */
export function getRetrievalPlan(queryType: QueryType): RetrievalPlan {
  return { ...RETRIEVAL_PLANS[queryType] };
}

/**
 * Classify and get plan in one call.
 */
export function routeQuery(query: string): {
  queryType: QueryType;
  plan: RetrievalPlan;
} {
  const queryType = classifyQuery(query);
  const plan = getRetrievalPlan(queryType);
  return { queryType, plan };
}
