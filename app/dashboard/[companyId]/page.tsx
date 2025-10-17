/**
 * Dynamic Dashboard Route for Whop Integration
 * Validates user access and shows appropriate view
 */

import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  
  try {
    // Get user token from headers
    const headersList = await headers();
    const { userId } = await whopSdk.verifyUserToken(headersList);
    
    // Check if user has access to this company
    const result = await whopSdk.access.checkIfUserHasAccessToCompany({
      userId,
      companyId,
    });
    
    if (!result.hasAccess) {
      return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Access Denied</div>
            <div className="text-[#9AA4B2] text-sm">
              You are not an authorized member of this company.
            </div>
          </div>
        </div>
      );
    }
    
    // Check if user is admin (can see analytics) or just a customer
    const { accessLevel } = result;
    
    if (accessLevel === "admin") {
      // Admin can see full analytics dashboard
      redirect(`/analytics?companyId=${companyId}`);
    } else if (accessLevel === "customer") {
      // Customer sees limited view
      redirect(`/customer-view?companyId=${companyId}`);
    } else {
      return (
        <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-2">Access Denied</div>
            <div className="text-[#9AA4B2] text-sm">
              You do not have access to this company.
            </div>
          </div>
        </div>
      );
    }
    
  } catch (error) {
    console.error('Error validating access:', error);
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-2">Authentication Error</div>
          <div className="text-[#9AA4B2] text-sm">
            Unable to verify your access. Please try again.
          </div>
        </div>
      </div>
    );
  }
}
