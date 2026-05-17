export interface AnalysisResult {
  contractType: string;
  parties: string;
  date: string;
  jurisdiction: string;
  overallScore: number;
  fairnessScore: number;
  clarityScore: number;
  enforceabilityScore: number;
  balanceScore: number;
  verdict: string;
  clauses: { number: number; title: string; risk: 'RED' | 'AMBER' | 'GREEN'; plainEnglish: string; concern: string }[];
  topRisks: { title: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'; description: string; action: string }[];
  summary: string;
  recommendations: { priority: 'NEGOTIATE' | 'REVIEW' | 'CLARIFY'; clause: string; action: string }[];
}

export function parseAndScore(glmRawJSON: any): AnalysisResult {
  const source = unwrapAnalysisObject(glmRawJSON);
  const normalizedClauses = normalizeClauses(source);
  const normalizedTopRisks = normalizeTopRisks(source, normalizedClauses);
  const normalizedRecommendations = normalizeRecommendations(source, normalizedTopRisks, normalizedClauses);
  const inferredOverall = inferOverallScore(source, normalizedClauses, normalizedTopRisks);

  const parsed: AnalysisResult = {
    contractType: pickText(source, ['contractType', 'contract_type', 'documentType', 'document_type', 'type']) || 'Unknown',
    parties: formatParties(source.parties ?? source.party_names ?? source.partyNames ?? source.entities?.parties) || 'Unknown Parties',
    date: pickText(source, ['date', 'effectiveDate', 'effective_date', 'analysis_date', 'executionDate', 'execution_date']) || 'Unknown Date',
    jurisdiction: pickText(source, ['jurisdiction', 'governingLaw', 'governing_law', 'applicableLaw', 'applicable_law']) || 'Unknown Jurisdiction',
    overallScore: ensureScore(source.overallScore ?? source.overall_score ?? source.riskScore ?? source.risk_score ?? inferredOverall),
    fairnessScore: ensureScore(source.fairnessScore ?? source.fairness_score ?? inferredOverall),
    clarityScore: ensureScore(source.clarityScore ?? source.clarity_score ?? inferredOverall),
    enforceabilityScore: ensureScore(source.enforceabilityScore ?? source.enforceability_score ?? inferredOverall),
    balanceScore: ensureScore(source.balanceScore ?? source.balance_score ?? inferredOverall),
    verdict: pickText(source, ['verdict', 'recommendation', 'overallVerdict', 'overall_verdict']) || 'Review carefully.',
    clauses: normalizedClauses,
    topRisks: normalizedTopRisks,
    summary: pickSummary(source) || 'Summary unavailable.',
    recommendations: normalizedRecommendations,
  };

  return parsed;
}

function ensureScore(val: any): number {
  const num = Number(val);
  if (isNaN(num)) return 5;
  if (num > 10 && num <= 100) return Math.max(1, Math.min(10, Math.round(num / 10)));
  if (num < 1) return 1;
  if (num > 10) return 10;
  return Math.round(num * 10) / 10;
}

function unwrapAnalysisObject(input: any): any {
  if (!input || typeof input !== 'object') return {};

  const candidates = [
    input.analysis,
    input.result,
    input.data,
    input.contractAnalysis,
    input.contract_analysis,
    input.output
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      return candidate;
    }
  }

  return input;
}

function pickText(source: any, keys: string[]) {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickSummary(source: any) {
  if (typeof source?.summary === 'string' && source.summary.trim()) return source.summary.trim();
  if (typeof source?.overview === 'string' && source.overview.trim()) return source.overview.trim();
  if (typeof source?.plainEnglishSummary === 'string' && source.plainEnglishSummary.trim()) return source.plainEnglishSummary.trim();
  if (typeof source?.plain_english_summary === 'string' && source.plain_english_summary.trim()) return source.plain_english_summary.trim();
  if (source?.summary && typeof source.summary === 'object') {
    return pickText(source.summary, ['text', 'overview', 'plainEnglish', 'plain_english']);
  }
  return '';
}

function formatParties(value: any) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object') return pickText(entry, ['name', 'party', 'title']);
        return '';
      })
      .filter(Boolean)
      .join(' and ');
  }
  return '';
}

function normalizeClauses(source: any): AnalysisResult['clauses'] {
  const rawClauses = firstArray(
    source?.clauses,
    source?.keyClauses,
    source?.key_clauses,
    source?.clauseAnalysis,
    source?.clause_analysis,
    source?.sections
  );

  if (!rawClauses.length) return [];

  return rawClauses.slice(0, 20).map((clause: any, index: number) => {
    const severity = normalizeRiskLevel(
      clause?.risk ??
      clause?.riskLevel ??
      clause?.risk_level ??
      clause?.severity ??
      clause?.label
    );

    return {
      number: Number(clause?.number ?? clause?.index ?? clause?.clauseNumber ?? index + 1) || index + 1,
      title: pickText(clause, ['title', 'heading', 'name', 'clause']) || `Clause ${index + 1}`,
      risk: severity,
      plainEnglish: pickText(clause, ['plainEnglish', 'plain_english', 'summary', 'description', 'analysis']) || 'Clause summary unavailable.',
      concern: pickText(clause, ['concern', 'issue', 'redFlag', 'red_flag', 'note', 'action']) || defaultConcern(severity)
    };
  });
}

function normalizeTopRisks(source: any, clauses: AnalysisResult['clauses']): AnalysisResult['topRisks'] {
  const rawRisks = firstArray(
    source?.topRisks,
    source?.top_risks,
    source?.risks,
    source?.keyRisks,
    source?.key_risks,
    source?.redFlags,
    source?.red_flags
  );

  if (rawRisks.length) {
    return rawRisks.slice(0, 5).map((risk: any, index: number) => ({
      title: pickText(risk, ['title', 'name', 'risk', 'issue']) || `Risk ${index + 1}`,
      severity: normalizeSeverity(risk?.severity ?? risk?.riskLevel ?? risk?.risk_level ?? risk?.priority),
      description: pickText(risk, ['description', 'summary', 'detail', 'analysis']) || 'Risk description unavailable.',
      action: pickText(risk, ['action', 'recommendation', 'mitigation', 'fix']) || 'Review this clause before signing.'
    }));
  }

  return clauses
    .filter((clause) => clause.risk !== 'GREEN')
    .slice(0, 5)
    .map((clause) => ({
      title: clause.title,
      severity: clause.risk === 'RED' ? 'HIGH' : 'MEDIUM',
      description: clause.concern,
      action: 'Review and negotiate this clause before signing.'
    }));
}

function normalizeRecommendations(
  source: any,
  topRisks: AnalysisResult['topRisks'],
  clauses: AnalysisResult['clauses']
): AnalysisResult['recommendations'] {
  const rawRecommendations = firstArray(
    source?.recommendations,
    source?.actionItems,
    source?.action_items,
    source?.suggestedChanges,
    source?.suggested_changes,
    source?.nextSteps,
    source?.next_steps
  );

  if (rawRecommendations.length) {
    return rawRecommendations.slice(0, 7).map((item: any, index: number) => ({
      priority: normalizePriority(item?.priority ?? item?.severity ?? item?.riskLevel ?? item?.risk_level),
      clause: pickText(item, ['clause', 'title', 'topic', 'name']) || `Recommendation ${index + 1}`,
      action: pickText(item, ['action', 'detail', 'recommendation', 'description']) || 'Review this point before signing.'
    }));
  }

  return topRisks.slice(0, 5).map((risk) => ({
    priority: risk.severity === 'CRITICAL' || risk.severity === 'HIGH' ? 'NEGOTIATE' as const : 'REVIEW' as const,
    clause: risk.title,
    action: risk.action
  })).concat(
    topRisks.length === 0 && clauses.length > 0
      ? [{
          priority: 'REVIEW' as const,
          clause: clauses[0].title,
          action: 'Confirm the commercial and legal terms align with your intent before signing.'
        }]
      : []
  );
}

function inferOverallScore(source: any, clauses: AnalysisResult['clauses'], topRisks: AnalysisResult['topRisks']) {
  const direct = Number(source?.score ?? source?.risk ?? source?.risk_rating);
  if (!Number.isNaN(direct) && direct > 0) return direct;

  let score = 4;
  for (const clause of clauses) {
    if (clause.risk === 'RED') score += 1.5;
    else if (clause.risk === 'AMBER') score += 0.7;
  }
  for (const risk of topRisks) {
    if (risk.severity === 'CRITICAL') score += 1.2;
    else if (risk.severity === 'HIGH') score += 0.8;
    else score += 0.4;
  }
  return Math.min(10, Math.max(2, score));
}

function firstArray(...values: any[]) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeRiskLevel(value: any): 'RED' | 'AMBER' | 'GREEN' {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized.includes('CRIT') || normalized.includes('HIGH') || normalized === 'RED') return 'RED';
  if (normalized.includes('MED') || normalized.includes('AMBER') || normalized.includes('WARN') || normalized.includes('YELLOW')) return 'AMBER';
  return 'GREEN';
}

function normalizeSeverity(value: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized.includes('CRIT')) return 'CRITICAL';
  if (normalized.includes('HIGH') || normalized === 'RED') return 'HIGH';
  return 'MEDIUM';
}

function normalizePriority(value: any): 'NEGOTIATE' | 'REVIEW' | 'CLARIFY' {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized.includes('NEGOT')) return 'NEGOTIATE';
  if (normalized.includes('CLAR')) return 'CLARIFY';
  if (normalized.includes('HIGH') || normalized.includes('CRIT')) return 'NEGOTIATE';
  return 'REVIEW';
}

function defaultConcern(risk: 'RED' | 'AMBER' | 'GREEN') {
  if (risk === 'RED') return 'This clause may create a material legal or commercial risk.';
  if (risk === 'AMBER') return 'This clause should be reviewed carefully before signing.';
  return 'This clause appears relatively standard.';
}
