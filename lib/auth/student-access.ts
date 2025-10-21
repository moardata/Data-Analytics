/**
 * Student Access Control
 * Determines what surveys students can see and access
 */

export interface StudentAccess {
  canViewSurvey: boolean;
  canSubmitSurvey: boolean;
  allowedSurveys: string[];
  isStudent: boolean;
  isOperator: boolean;
}

export interface SurveyAccess {
  surveyId: string;
  isLive: boolean;
  isEnabled: boolean;
  allowedForStudent: boolean;
  startDate?: string;
  endDate?: string;
  maxSubmissions?: number;
  currentSubmissions?: number;
}

/**
 * Check if a user is a student (not an operator)
 */
export function isStudent(userId: string, companyId: string): boolean {
  // For now, we'll use a simple check
  // In production, this would check against your user database
  // Students typically have IDs that don't start with 'admin_' or 'operator_'
  return !userId.startsWith('admin_') && !userId.startsWith('operator_');
}

/**
 * Get surveys that a student is allowed to see
 */
export async function getStudentAllowedSurveys(
  companyId: string,
  userId: string
): Promise<SurveyAccess[]> {
  // This would typically query your database
  // For now, return mock data showing the logic
  
  const allSurveys = [
    {
      surveyId: 'survey-1',
      isLive: true,
      isEnabled: true,
      allowedForStudent: true,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      maxSubmissions: 100,
      currentSubmissions: 45
    },
    {
      surveyId: 'survey-2', 
      isLive: false, // Not live yet
      isEnabled: true,
      allowedForStudent: false,
      startDate: '2024-02-01',
      endDate: '2024-12-31',
      maxSubmissions: 50,
      currentSubmissions: 0
    },
    {
      surveyId: 'survey-3',
      isLive: true,
      isEnabled: false, // Disabled by operator
      allowedForStudent: false,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      maxSubmissions: 200,
      currentSubmissions: 150
    }
  ];

  // Filter surveys that students can access
  return allSurveys.filter(survey => 
    survey.isLive && 
    survey.isEnabled && 
    survey.allowedForStudent &&
    (!survey.startDate || new Date() >= new Date(survey.startDate)) &&
    (!survey.endDate || new Date() <= new Date(survey.endDate)) &&
    (!survey.maxSubmissions || (survey.currentSubmissions || 0) < survey.maxSubmissions)
  );
}

/**
 * Check if a student can access a specific survey
 */
export async function canStudentAccessSurvey(
  surveyId: string,
  companyId: string,
  userId: string
): Promise<boolean> {
  const allowedSurveys = await getStudentAllowedSurveys(companyId, userId);
  return allowedSurveys.some(survey => survey.surveyId === surveyId);
}

/**
 * Get student access level
 */
export async function getStudentAccess(
  userId: string,
  companyId: string
): Promise<StudentAccess> {
  const isStudentUser = isStudent(userId, companyId);
  const allowedSurveys = await getStudentAllowedSurveys(companyId, userId);
  
  return {
    canViewSurvey: isStudentUser,
    canSubmitSurvey: isStudentUser,
    allowedSurveys: allowedSurveys.map(s => s.surveyId),
    isStudent: isStudentUser,
    isOperator: !isStudentUser
  };
}
