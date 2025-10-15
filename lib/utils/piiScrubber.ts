/**
 * PII Scrubbing Utility
 * Removes personally identifiable information before sending to AI
 */

export function scrubText(text: string): string {
  if (!text) return '';

  let scrubbed = text;

  // Remove emails
  scrubbed = scrubbed.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    '[EMAIL]'
  );

  // Remove phone numbers (various formats)
  scrubbed = scrubbed.replace(
    /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[PHONE]'
  );

  // Remove credit card numbers
  scrubbed = scrubbed.replace(
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    '[CARD]'
  );

  // Remove long numbers (could be IDs, accounts, etc.)
  scrubbed = scrubbed.replace(
    /\b\d{10,16}\b/g,
    '[NUMBER]'
  );

  // Remove social media handles
  scrubbed = scrubbed.replace(
    /(@\w+)/g,
    '[@HANDLE]'
  );

  // Remove full names (capitalized first + last)
  scrubbed = scrubbed.replace(
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    '[NAME]'
  );

  // Remove URLs
  scrubbed = scrubbed.replace(
    /https?:\/\/[^\s]+/g,
    '[URL]'
  );

  // Remove IP addresses
  scrubbed = scrubbed.replace(
    /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    '[IP]'
  );

  return scrubbed;
}

export function scrubTexts(texts: string[]): string[] {
  return texts.map(scrubText);
}

export function isSafeText(text: string): boolean {
  // Check if text still contains potential PII
  const piiPatterns = [
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, // email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // card
  ];

  return !piiPatterns.some(pattern => pattern.test(text));
}



