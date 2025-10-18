#!/usr/bin/env node

/**
 * Script to list all companies in the database
 */

const fetch = require('node-fetch');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rdllbtepprsf kbewqcwj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkbGxidGVwcHJzZmtiZXdxY3dqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE2NjQ5NiwiZXhwIjoyMDc1NzQyNDk2fQ.fzE4SymiGkPXBOGx95BNleFSyfysGF3NJAjQ___dxrw';

async function listCompanies() {
  try {
    console.log('📊 Fetching all companies from Supabase...\n');

    // Get all clients
    const clientsResponse = await fetch(`${SUPABASE_URL}/rest/v1/clients?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!clientsResponse.ok) {
      throw new Error(`Failed to fetch clients: ${clientsResponse.statusText}`);
    }

    const clients = await clientsResponse.json();

    console.log(`Found ${clients.length} companies:\n`);
    console.log('='.repeat(100));

    for (const client of clients) {
      // Count students
      const studentsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/entities?client_id=eq.${client.id}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'count=exact'
          }
        }
      );
      const students = await studentsResponse.json();
      const studentCount = studentsResponse.headers.get('content-range')?.split('/')[1] || students.length;

      // Count events
      const eventsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/events?client_id=eq.${client.id}&select=id`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'count=exact'
          }
        }
      );
      const events = await eventsResponse.json();
      const eventCount = eventsResponse.headers.get('content-range')?.split('/')[1] || events.length;

      console.log(`\n📍 Company ID: ${client.company_id}`);
      console.log(`   Client ID: ${client.id}`);
      console.log(`   Tier: ${client.current_tier || 'N/A'}`);
      console.log(`   Status: ${client.subscription_status || 'N/A'}`);
      console.log(`   Students: ${studentCount}`);
      console.log(`   Events: ${eventCount}`);
      console.log(`   Created: ${new Date(client.created_at).toLocaleString()}`);
      console.log(`   Dashboard URL: https://data-analytics-gold.vercel.app/analytics?companyId=${client.company_id}`);
      console.log('-'.repeat(100));
    }

    console.log(`\n✅ Total companies: ${clients.length}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listCompanies();

