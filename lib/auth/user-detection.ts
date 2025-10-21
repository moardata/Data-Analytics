/**
 * User Type Detection
 * Determines if a user is a student or operator based on various signals
 */

export interface UserInfo {
  isStudent: boolean;
  isOperator: boolean;
  userId?: string;
  companyId?: string;
  userType?: string;
}

/**
 * Detect user type from various sources
 */
export function detectUserType(
  searchParams: URLSearchParams,
  headers?: Headers
): UserInfo {
  // Get parameters from URL
  const userId = searchParams.get('userId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;
  const userType = searchParams.get('userType') || undefined;
  
  // Get Whop headers if available
  const whopUserId = headers?.get('x-whop-user-id');
  const whopCompanyId = headers?.get('x-whop-company-id');
  
  // Use Whop headers if available, otherwise use URL params
  const finalUserId = whopUserId || userId;
  const finalCompanyId = whopCompanyId || companyId;
  
  // Determine if user is a student
  let isStudent = false;
  let isOperator = false;
  
  if (userType) {
    // Explicit user type provided
    isStudent = userType === 'student';
    isOperator = userType === 'operator' || userType === 'admin';
  } else if (finalUserId) {
    // Infer from user ID patterns
    isStudent = !finalUserId.startsWith('admin_') && 
                !finalUserId.startsWith('operator_') && 
                !finalUserId.startsWith('owner_');
    isOperator = !isStudent;
  } else {
    // Default to student if no clear indication
    isStudent = true;
    isOperator = false;
  }
  
  return {
    isStudent,
    isOperator,
    userId: finalUserId,
    companyId: finalCompanyId,
    userType: userType || (isStudent ? 'student' : 'operator')
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
