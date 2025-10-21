/**
 * User Type Detection
 * Determines if a user is a student or operator based on various signals
 * Based on Whop Forms app pattern analysis
 */

export interface UserInfo {
  isStudent: boolean;
  isOperator: boolean;
  userId?: string;
  companyId?: string;
  userType?: string;
  viewType?: string;
  companyRoute?: string;
  experienceId?: string;
}

/**
 * Detect user type from various sources
 * Based on Whop Forms app pattern: /joined/company/app/ = student
 */
export function detectUserType(
  searchParams: URLSearchParams,
  headers?: Headers,
  url?: string
): UserInfo {
  // Get parameters from URL
  const userId = searchParams.get('userId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;
  const userType = searchParams.get('userType') || undefined;
  const viewType = searchParams.get('viewType') || undefined;
  const companyRoute = searchParams.get('companyRoute') || undefined;
  const experienceId = searchParams.get('experienceId') || undefined;
  
  // Get Whop headers if available
  const whopUserId = headers?.get('x-whop-user-id');
  const whopCompanyId = headers?.get('x-whop-company-id');
  
  // Use Whop headers if available, otherwise use URL params
  const finalUserId = whopUserId || userId;
  const finalCompanyId = whopCompanyId || companyId;
  
  // Determine if user is a student based on URL pattern
  let isStudent = false;
  let isOperator = false;
  
  // Check URL pattern first (most reliable indicator)
  if (url) {
    // Pattern: /joined/company/app/ = student access
    if (url.includes('/joined/') && url.includes('/app/')) {
      console.log('🎓 [UserDetection] Student detected via URL pattern:', url);
      isStudent = true;
      isOperator = false;
    }
    // Pattern: /dashboard/company = operator access
    else if (url.includes('/dashboard/') || url.includes('/analytics')) {
      console.log('👑 [UserDetection] Operator detected via URL pattern:', url);
      isStudent = false;
      isOperator = true;
    }
  }
  
  // Check viewType parameter (highest priority for student detection)
  if (viewType) {
    console.log('🔍 [UserDetection] ViewType detected:', viewType);
    if (viewType === 'app') {
      console.log('🎓 [UserDetection] Student detected via viewType:', viewType);
      isStudent = true;
      isOperator = false;
    } else if (viewType === 'admin' || viewType === 'analytics') {
      console.log('👑 [UserDetection] Operator detected via viewType:', viewType);
      isStudent = false;
      isOperator = true;
    }
  }
  
  // Check explicit userType parameter
  if (userType) {
    isStudent = userType === 'student';
    isOperator = userType === 'operator' || userType === 'admin';
  }
  
  // Fallback: infer from user ID patterns
  if (!isStudent && !isOperator && finalUserId) {
    isStudent = !finalUserId.startsWith('admin_') && 
                !finalUserId.startsWith('operator_') && 
                !finalUserId.startsWith('owner_');
    isOperator = !isStudent;
  }
  
  // Default to student if no clear indication
  if (!isStudent && !isOperator) {
    isStudent = true;
    isOperator = false;
  }
  
  return {
    isStudent,
    isOperator,
    userId: finalUserId,
    companyId: finalCompanyId,
    userType: userType || (isStudent ? 'student' : 'operator'),
    viewType,
    companyRoute,
    experienceId
  };
}

/**
 * Get redirect URL based on user type
 */
export function getRedirectUrl(userInfo: UserInfo): string {
  const { isStudent, userId, companyId } = userInfo;
  
  if (!companyId) {
    return isStudent ? '/student/surveys' : '/analytics';
  }
  
  if (isStudent) {
    const studentUrl = userId 
      ? `/student/surveys?companyId=${companyId}&userId=${userId}`
      : `/student/surveys?companyId=${companyId}`;
    return studentUrl;
  } else {
    return `/analytics?companyId=${companyId}`;
  }
}
