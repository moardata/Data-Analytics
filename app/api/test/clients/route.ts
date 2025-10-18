import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'companyId parameter required' },
        { status: 400 }
      );
    }

    // Get client for this specific company
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      return NextResponse.json({
        companyId,
        client: null,
        error: error.message,
        exists: false
      });
    }

    // Count related data
    const { count: studentCount } = await supabase
      .from('entities')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    const { count: insightCount } = await supabase
      .from('insights')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id);

    return NextResponse.json({
      companyId,
      client,
      exists: true,
      data: {
        students: studentCount || 0,
        events: eventCount || 0,
        insights: insightCount || 0
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}
