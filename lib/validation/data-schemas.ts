/**
 * Data Validation Schemas
 * Ensures data quality and consistency across the platform
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Event data validation
export function validateEventData(event: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!event.event_type) errors.push('Missing event_type');
  if (!event.client_id) errors.push('Missing client_id');
  if (!event.created_at) errors.push('Missing created_at');

  // Event type validation
  const validEventTypes = [
    'order', 'subscription', 'activity', 'form_submission', 'custom',
    'payment.succeeded', 'payment.failed', 'payment.refunded',
    'membership.went_invalid', 'course_enrollment', 'course_completion'
  ];
  
  if (event.event_type && !validEventTypes.includes(event.event_type)) {
    errors.push(`Invalid event_type: ${event.event_type}`);
  }

  // Data quality checks
  if (event.event_data && typeof event.event_data !== 'object') {
    errors.push('event_data must be an object');
  }

  // Timestamp validation
  if (event.created_at && isNaN(new Date(event.created_at).getTime())) {
    errors.push('Invalid created_at timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Form submission validation
export function validateFormSubmission(submission: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!submission.client_id) errors.push('Missing client_id');
  if (!submission.form_id) errors.push('Missing form_id');
  if (!submission.responses) errors.push('Missing responses');
  if (!submission.submitted_at) errors.push('Missing submitted_at');

  // Response validation
  if (submission.responses && typeof submission.responses !== 'object') {
    errors.push('responses must be an object');
  }

  // Check for empty responses
  if (submission.responses && Object.keys(submission.responses).length === 0) {
    warnings.push('Empty responses object');
  }

  // Timestamp validation
  if (submission.submitted_at && isNaN(new Date(submission.submitted_at).getTime())) {
    errors.push('Invalid submitted_at timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Entity validation
export function validateEntity(entity: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!entity.client_id) errors.push('Missing client_id');
  if (!entity.name) errors.push('Missing name');
  if (!entity.email) errors.push('Missing email');

  // Email validation
  if (entity.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entity.email)) {
    errors.push('Invalid email format');
  }

  // Name validation
  if (entity.name && entity.name.trim().length < 2) {
    warnings.push('Name is very short');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Subscription validation
export function validateSubscription(subscription: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!subscription.client_id) errors.push('Missing client_id');
  if (!subscription.status) errors.push('Missing status');
  if (!subscription.whop_subscription_id) errors.push('Missing whop_subscription_id');

  // Status validation
  const validStatuses = ['active', 'cancelled', 'expired', 'paused'];
  if (subscription.status && !validStatuses.includes(subscription.status)) {
    errors.push(`Invalid status: ${subscription.status}`);
  }

  // Date validation
  if (subscription.starts_at && isNaN(new Date(subscription.starts_at).getTime())) {
    errors.push('Invalid starts_at timestamp');
  }

  if (subscription.ends_at && isNaN(new Date(subscription.ends_at).getTime())) {
    errors.push('Invalid ends_at timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Data quality scoring
export function calculateDataQuality(data: any[]): {
  completeness: number;
  accuracy: number;
  freshness: number;
  overall: number;
} {
  if (data.length === 0) {
    return { completeness: 0, accuracy: 0, freshness: 0, overall: 0 };
  }

  // Completeness: percentage of records with all required fields
  const requiredFields = ['id', 'client_id', 'created_at'];
  const completeRecords = data.filter(record => 
    requiredFields.every(field => record[field] !== undefined && record[field] !== null)
  );
  const completeness = (completeRecords.length / data.length) * 100;

  // Accuracy: percentage of records with valid data
  const validRecords = data.filter(record => {
    // Check for valid timestamps
    if (record.created_at && isNaN(new Date(record.created_at).getTime())) return false;
    
    // Check for valid IDs (non-empty strings)
    if (record.id && typeof record.id !== 'string') return false;
    if (record.client_id && typeof record.client_id !== 'string') return false;
    
    return true;
  });
  const accuracy = (validRecords.length / data.length) * 100;

  // Freshness: percentage of records from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const freshRecords = data.filter(record => {
    const recordDate = new Date(record.created_at || record.submitted_at || 0);
    return recordDate > sevenDaysAgo;
  });
  const freshness = (freshRecords.length / data.length) * 100;

  // Overall score (weighted average)
  const overall = (completeness * 0.4) + (accuracy * 0.4) + (freshness * 0.2);

  return {
    completeness: Math.round(completeness),
    accuracy: Math.round(accuracy),
    freshness: Math.round(freshness),
    overall: Math.round(overall)
  };
}
