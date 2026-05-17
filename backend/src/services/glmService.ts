import axios from 'axios';
import { buildAnalysisPrompt } from './promptBuilder';
import { parseAndScore } from './riskScorer';

const ROUTEWAY_URL = 'https://api.routeway.ai/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 25000;
const DEFAULT_MAX_TOKENS = 2600;
const DEFAULT_MODELS = [
  'llama-3.2-3b-instruct:free',
  'nemotron-nano-9b-v2:free',
  'step-3.5-flash:free',
  'ling-2.6-flash:free',
  'glm-4.5-air:free'
];

type RoutewayAttemptError = {
  model: string;
  message: string;
};

export async function analyzeWithGLM(contractText: string): Promise<any> {
  const prompt = buildAnalysisPrompt(contractText);
  const timeout = Number(process.env.ROUTEWAY_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
  const maxTokens = Number(process.env.ROUTEWAY_MAX_TOKENS || DEFAULT_MAX_TOKENS);
  const models = getRoutewayModels();
  const attemptErrors: RoutewayAttemptError[] = [];

  for (const model of models) {
    try {
      console.log(`Trying Routeway model: ${model}`);
      const data = await callRouteway(model, prompt, timeout, maxTokens);
      const responseText = extractResponseText(data);
      const parsed = parseGLMResponse(responseText);
      validateAnalysisPayload(parsed);
      console.log(`Routeway model succeeded: ${model}`);
      return {
        ...parsed,
        _routewayModel: model
      };
    } catch (error: any) {
      const message = formatRoutewayError(error);
      attemptErrors.push({ model, message });
      console.error(`Routeway model failed: ${model} -> ${message}`);

      if (isQuotaError(message)) {
        continue;
      }

      if (isRetryableProviderError(message)) {
        continue;
      }

      continue;
    }
  }

  throw new Error(
    `All Routeway models failed: ${attemptErrors.map((attempt) => `${attempt.model}: ${attempt.message}`).join(' | ')}`
  );
}

function getRoutewayModels(): string[] {
  const fromEnv = (process.env.ROUTEWAY_MODELS || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return fromEnv.length > 0 ? fromEnv : DEFAULT_MODELS;
}

async function callRouteway(model: string, prompt: string, timeout: number, maxTokens: number) {
  const payload: Record<string, any> = {
    model,
    messages: [
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: maxTokens
  };

  if (process.env.ROUTEWAY_JSON_MODE === 'true') {
    payload.response_format = { type: 'json_object' };
  }

  const response = await axios.post(
    ROUTEWAY_URL,
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.ROUTEWAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout
    }
  );

  const data = typeof response.data === 'string' ? safeJsonParse(response.data) ?? response.data : response.data;

  if (data?.error) {
    const status = data.error.status_code || data.error.code || 'unknown';
    const message = data.error.message || 'Routeway provider error';
    throw new Error(`Routeway provider error (${status}): ${message}`);
  }

  return data;
}

function extractResponseText(data: any): string {
  const messageObj = data?.choices?.[0]?.message;
  const responseText = messageObj?.content || data?.choices?.[0]?.messages?.[0]?.content;

  if (!responseText) {
    throw new Error(`Routeway API did not return choices content. Raw response: ${JSON.stringify(data)}`);
  }

  return responseText;
}

function parseGLMResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {}

  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch {}

  try {
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      return JSON.parse(text.substring(startIdx, endIdx + 1));
    }
  } catch {}

  throw new Error('Routeway model returned invalid JSON.');
}

function validateAnalysisPayload(payload: any) {
  const normalized = parseAndScore(payload);
  const problems: string[] = [];

  if (!normalized.summary || normalized.summary === 'Summary unavailable.' || normalized.summary.length < 80) {
    problems.push('summary too short or missing');
  }

  if (normalized.clauses.length < 4) {
    problems.push(`only ${normalized.clauses.length} clauses`);
  }

  if (normalized.topRisks.length < 2) {
    problems.push(`only ${normalized.topRisks.length} top risks`);
  }

  if (normalized.recommendations.length < 2) {
    problems.push(`only ${normalized.recommendations.length} recommendations`);
  }

  const scores = [
    normalized.overallScore,
    normalized.fairnessScore,
    normalized.clarityScore,
    normalized.enforceabilityScore,
    normalized.balanceScore
  ];
  if (scores.every((score) => score === 5)) {
    problems.push('all scores are default 5');
  }

  if (problems.length) {
    throw new Error(`Routeway model returned incomplete analysis: ${problems.join(', ')}`);
  }
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatRoutewayError(error: any): string {
  return String(
    error?.response?.data?.error?.message ||
    error?.response?.data?.error?.code ||
    error?.message ||
    'Unknown Routeway error'
  );
}

function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('rate limit') || lower.includes('429') || lower.includes('quota') || lower.includes('premium users');
}

function isRetryableProviderError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('timeout') || lower.includes('502') || lower.includes('bad_gateway') || lower.includes('unable to process');
}
