import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

/**
 * Admin endpoint to list all companies and their associated data
 * This helps identify which company IDs exist in the database
 */
export async function GET(request: NextRequest) {
  try {
    // Get all clients from the database
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsError) {
      throw clientsError;
    }

    // For each client, get associated data counts
    const companiesWithData = await Promise.all(
      (clients || []).map(async (client) => {
        // Count students
        const { count: studentCount } = await supabase
          .from('entities')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Count events
        const { count: eventCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Count insights
        const { count: insightCount } = await supabase
          .from('insights')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Count forms
        const { count: formCount } = await supabase
          .from('form_templates')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Count form submissions
        const { count: submissionCount } = await supabase
          .from('form_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        // Get revenue data (order events)
        const { data: orderEvents } = await supabase
          .from('events')
          .select('event_data')
          .eq('client_id', client.id)
          .eq('event_type', 'order');

        const totalRevenue = orderEvents?.reduce((sum, event) => {
          const amount = event.event_data?.amount || 0;
          return sum + amount;
        }, 0) || 0;

        return {
          companyId: client.company_id,
          clientId: client.id,
          whopUserId: client.whop_user_id,
          tier: client.current_tier,
          subscriptionStatus: client.subscription_status,
          createdAt: client.created_at,
          updatedAt: client.updated_at,
          data: {
            students: studentCount || 0,
            events: eventCount || 0,
            insights: insightCount || 0,
            forms: formCount || 0,
            formSubmissions: submissionCount || 0,
            totalRevenue: totalRevenue
          },
          dashboardUrl: `https://data-analytics-gold.vercel.app/analytics?companyId=${client.company_id}`
        };
      })
    );

    // Group by company ID (in case there are duplicates)
    const uniqueCompanies = companiesWithData.reduce((acc, company) => {
      if (!acc[company.companyId]) {
        acc[company.companyId] = company;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      totalCompanies: Object.keys(uniqueCompanies).length,
      companies: Object.values(uniqueCompanies),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({
      error: error.message || 'Failed to fetch companies',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
