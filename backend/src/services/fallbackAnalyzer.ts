import { AnalysisResult } from './riskScorer';

type RiskSignal = {
  title: string;
  pattern: RegExp;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  action: string;
};

const RISK_SIGNALS: RiskSignal[] = [
  {
    title: 'Unlimited liability',
    pattern: /unlimited liability|liable for all|all losses/i,
    severity: 'CRITICAL',
    action: 'Negotiate a liability cap tied to fees paid or a fixed amount.'
  },
  {
    title: 'One-sided termination',
    pattern: /terminate.*(sole discretion|without cause|without notice)|at any time/i,
    severity: 'HIGH',
    action: 'Ask for mutual termination rights and a written notice period.'
  },
  {
    title: 'Automatic renewal',
    pattern: /automatic renewal|automatically renew/i,
    severity: 'MEDIUM',
    action: 'Add advance renewal notice and an easy opt-out window.'
  },
  {
    title: 'Broad indemnity',
    pattern: /indemnif(?:y|ication).*?(all|any|against)/i,
    severity: 'HIGH',
    action: 'Limit indemnity to direct losses caused by breach or negligence.'
  },
  {
    title: 'Perpetual obligation',
    pattern: /perpetual|forever|survive indefinitely/i,
    severity: 'MEDIUM',
    action: 'Define a reasonable survival period unless trade secrets are involved.'
  },
  {
    title: 'Exclusive jurisdiction or venue',
    pattern: /exclusive jurisdiction|exclusive venue|courts of/i,
    severity: 'MEDIUM',
    action: 'Confirm the venue is practical and commercially acceptable.'
  }
];

export function buildFallbackAnalysis(contractText: string, reason?: string): AnalysisResult {
  const text = contractText.replace(/\s+/g, ' ').trim();
  const detectedRisks = RISK_SIGNALS.filter(signal => signal.pattern.test(text));
  const score = Math.min(10, Math.max(2, 3 + detectedRisks.length * 2));
  const hasLiabilityCap = /liability (?:is )?capped|cap(?:ped)? at|aggregate liability/i.test(text);
  const adjustedScore = hasLiabilityCap ? Math.max(2, score - 1) : score;

  const contractType = detectContractType(text);
  const parties = detectParties(text);
  const date = detectDate(text);
  const jurisdiction = detectJurisdiction(text);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);

  const clauses = sentences.slice(0, 12).map((sentence, index) => {
    const risk = RISK_SIGNALS.find(signal => signal.pattern.test(sentence));
    return {
      number: index + 1,
      title: inferClauseTitle(sentence),
      risk: risk ? (risk.severity === 'CRITICAL' || risk.severity === 'HIGH' ? 'RED' as const : 'AMBER' as const) : 'GREEN' as const,
      plainEnglish: sentence.slice(0, 240),
      concern: risk ? risk.title : 'No obvious high-risk issue detected in this sentence.'
    };
  });

  const topRisks = detectedRisks.slice(0, 5).map(signal => ({
    title: signal.title,
    severity: signal.severity,
    description: `${signal.title} language appears in the contract.`,
    action: signal.action
  }));

  const recommendations = detectedRisks.slice(0, 7).map(signal => ({
    priority: signal.severity === 'CRITICAL' || signal.severity === 'HIGH' ? 'NEGOTIATE' as const : 'REVIEW' as const,
    clause: signal.title,
    action: signal.action
  }));

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'REVIEW',
      clause: 'General review',
      action: 'Confirm party names, dates, payment terms, termination rights, and liability limits before signing.'
    });
  }

  return {
    contractType,
    parties,
    date,
    jurisdiction,
    overallScore: adjustedScore,
    fairnessScore: Math.max(1, 11 - adjustedScore),
    clarityScore: estimateClarity(text),
    enforceabilityScore: jurisdiction === 'Unknown' ? 5 : 7,
    balanceScore: Math.max(1, 10 - detectedRisks.length),
    verdict: reason
      ? `AI provider unavailable (${reason}). Generated a local preliminary review.`
      : 'Generated a local preliminary review.',
    clauses,
    topRisks,
    summary: `${contractType} involving ${parties}. Local review found ${detectedRisks.length} notable risk signal(s). This is a fallback analysis and should be checked by counsel.`,
    recommendations
  };
}

function detectContractType(text: string): string {
  if (/non-disclosure|confidentiality agreement|NDA/i.test(text)) return 'Non-Disclosure Agreement';
  if (/service agreement|services agreement/i.test(text)) return 'Service Agreement';
  if (/employment agreement|employment contract/i.test(text)) return 'Employment Contract';
  if (/lease agreement|rental agreement/i.test(text)) return 'Lease Agreement';
  if (/license agreement/i.test(text)) return 'License Agreement';
  return 'Contract';
}

function detectParties(text: string): string {
  const between = text.match(/between\s+(.{2,80}?)\s+and\s+(.{2,80}?)(?:\.|,| dated| effective|$)/i);
  if (between) return `${between[1].trim()} and ${between[2].trim()}`;
  return 'Unknown Parties';
}

function detectDate(text: string): string {
  const match = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/i);
  return match?.[0] || 'Unknown Date';
}

function detectJurisdiction(text: string): string {
  const match = text.match(/governed by(?: the laws of)?\s+([A-Za-z ]{2,40})(?:\.|,| and|$)/i);
  return match?.[1]?.trim() || (/Indian law|laws of India/i.test(text) ? 'India' : 'Unknown');
}

function inferClauseTitle(sentence: string): string {
  if (/confidential/i.test(sentence)) return 'Confidentiality';
  if (/liability|damages/i.test(sentence)) return 'Liability';
  if (/terminate|termination/i.test(sentence)) return 'Termination';
  if (/payment|fee|invoice/i.test(sentence)) return 'Payment';
  if (/jurisdiction|governed by|law/i.test(sentence)) return 'Governing Law';
  return 'General';
}

function estimateClarity(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(1, words.length);
  if (averageWordLength > 8) return 5;
  if (averageWordLength > 6) return 7;
  return 8;
}
