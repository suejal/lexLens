export type RiskLevel = 'GREEN' | 'AMBER' | 'RED';

export let contractMeta = {
  title: 'Contract Analysis',
  parties: 'Pending',
  date: 'Pending',
  jurisdiction: 'Pending',
  type: 'Pending',
  stats: 'Loading',
};

export let scoreBreakdown = [
  { label: 'Fairness Score', value: 5 },
  { label: 'Clarity Score', value: 5 },
  { label: 'Enforceability Score', value: 5 },
  { label: 'Balance Score', value: 5 },
];

export let overallConfig = {
  score: 5,
  verdict: 'Pending',
  summary: ''
};

export let clauses: Array<{
  number: number;
  title: string;
  badge: RiskLevel;
  plainEnglish: string;
  concern?: string;
  positive?: string;
}> = [];

export let topRisks: Array<{
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  body: string;
  action: string;
  color: string;
}> = [];

export let recommendations: Array<{
  label: string;
  detail: string;
}> = [];

export function setAnalysisData(data: any) {
  const routewayModel = data.routewayModel ? String(data.routewayModel) : null;
  const providerLabel = routewayModel
    ? `Analyzed via ${humanizeModelName(routewayModel)}`
    : data.provider === 'routeway'
      ? 'Analyzed via Routeway'
      : 'Analyzed via LexLens';

  contractMeta = {
    title: data.contractType || 'Legal Contract',
    parties: data.parties || 'Unknown',
    date: data.date || 'Unknown',
    jurisdiction: data.jurisdiction || 'Unknown',
    type: data.contractType || 'Unknown',
    stats: providerLabel
  };

  scoreBreakdown = [
    { label: 'Fairness Score', value: Number(data.fairnessScore) || 5 },
    { label: 'Clarity Score', value: Number(data.clarityScore) || 5 },
    { label: 'Enforceability Score', value: Number(data.enforceabilityScore) || 5 },
    { label: 'Balance Score', value: Number(data.balanceScore) || 5 },
  ];

  overallConfig = {
    score: Number(data.overallScore) || 5,
    verdict: data.verdict || 'Review required.',
    summary: data.summary || 'Summary unavailable'
  };

  clauses = (data.clauses || []).map((c: any) => ({
    number: c.number || 0,
    title: c.title || 'Clause',
    badge: c.risk || 'GREEN',
    plainEnglish: c.plainEnglish || '',
    concern: c.risk === 'GREEN' ? undefined : (c.concern || ''),
    positive: c.risk === 'GREEN' ? (c.concern || 'Standard clause.') : undefined
  }));

  topRisks = (data.topRisks || []).map((tr: any) => ({
    title: tr.title,
    severity: tr.severity,
    body: tr.description,
    action: tr.action,
    color: tr.severity === 'CRITICAL' ? '#8B1A1A' : tr.severity === 'HIGH' ? '#B45309' : '#7A5200'
  }));

  recommendations = (data.recommendations || []).map((r: any) => ({
    label: `${r.priority} — ${r.clause}`,
    detail: r.action
  }));
}

function humanizeModelName(model: string) {
  return model
    .replace(/:free$/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
