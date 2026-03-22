const FLAGGED_TERMS = [
  'spam',
  'scam',
  'free money',
  'guaranteed results',
  'mlm',
  'pyramid',
  'get rich',
  'miracle cure',
  'buy now',
  'limited time offer',
  'act now',
  'click here',
  'earn cash',
  'no risk',
  'winner',
  'congratulations',
  'urgent',
  'prescription',
  'diagnose',
  'cure',
];

const THERAPY_ALLOWED_TERMS = [
  'diagnosis',
  'treatment',
  'medication',
  'prescription pad',
];

export interface ModerationResult {
  passed: boolean;
  flaggedTerms: string[];
  severity: 'none' | 'low' | 'high';
}

export function scanContent(text: string): ModerationResult {
  const lower = text.toLowerCase();

  // Allow therapy-specific terms that might otherwise flag
  const isTherapyContext = THERAPY_ALLOWED_TERMS.some((term) => lower.includes(term));

  const found = FLAGGED_TERMS.filter((term) => {
    if (isTherapyContext && (term === 'prescription' || term === 'diagnose' || term === 'cure')) {
      return false;
    }
    return lower.includes(term);
  });

  let severity: 'none' | 'low' | 'high' = 'none';
  if (found.length >= 3) severity = 'high';
  else if (found.length >= 1) severity = 'low';

  return {
    passed: found.length === 0,
    flaggedTerms: found,
    severity,
  };
}

export function shouldAutoFlag(title: string, description: string): boolean {
  const titleResult = scanContent(title);
  const descResult = scanContent(description);

  // Auto-flag if title has any flagged terms or description has high severity
  return !titleResult.passed || descResult.severity === 'high';
}
