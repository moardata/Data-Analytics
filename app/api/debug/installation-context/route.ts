import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    
    // Try to get installation context from Whop SDK
    try {
      const { whopSdk } = await import('@/lib/whop-sdk');
      
      // Get user authentication
      const authResult = await whopSdk.verifyUserToken(headersList);
      
      if (authResult.userId) {
        // Get user's companies
        const userCompanies = await whopSdk.access.getUserCompanies({ userId: authResult.userId });
        
        // Get app installations for each company
        const installations = [];
        for (const company of userCompanies || []) {
          try {
            const companySdk = whopSdk.withCompany({ companyId: company.id });
            const appInstallations = await companySdk.apps.getInstallations();
            installations.push({
              companyId: company.id,
              companyName: company.name,
              installations: appInstallations
            });
          } catch (error) {
            installations.push({
              companyId: company.id,
              companyName: company.name,
              error: error.message
            });
          }
        }
        
        return NextResponse.json({
          userId: authResult.userId,
          userCompanies,
          installations,
          timestamp: new Date().toISOString()
        });
      }
    } catch (sdkError) {
      return NextResponse.json({
        error: 'SDK Error',
        message: sdkError.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      error: 'No authentication found',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
