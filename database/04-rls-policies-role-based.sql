/**
 * Role-Based Row-Level Security Policies
 * Based on GPT's security recommendations
 * 
 * These policies enforce:
 * 1. Multi-tenancy (tenant_id/client_id filtering)
 * 2. Role-based access (only owners/admins can read admin data)
 * 
 * Usage: Set session variables before queries:
 *   SET LOCAL app.tenant_id = 'company_id_here';
 *   SET LOCAL app.role = 'owner' | 'admin' | 'member';
 *   SET LOCAL app.user_id = 'user_id_here';
 */

-- Drop existing basic policies (if they exist)
DROP POLICY IF EXISTS clients_tenant_isolation ON clients;
DROP POLICY IF EXISTS events_tenant_isolation ON events;
DROP POLICY IF EXISTS entities_tenant_isolation ON entities;
DROP POLICY IF EXISTS subscriptions_tenant_isolation ON subscriptions;
DROP POLICY IF EXISTS form_templates_tenant_isolation ON form_templates;
DROP POLICY IF EXISTS form_submissions_tenant_isolation ON form_submissions;

-- ==============================================
-- CLIENTS TABLE (Owner/Admin only)
-- ==============================================

CREATE POLICY clients_read_owner_admin ON clients
FOR SELECT USING (
  company_id = current_setting('app.tenant_id', true)
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY clients_write_owner_admin ON clients
FOR INSERT WITH CHECK (
  company_id = current_setting('app.tenant_id', true)
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY clients_update_owner_admin ON clients
FOR UPDATE USING (
  company_id = current_setting('app.tenant_id', true)
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- EVENTS TABLE (Owner/Admin only)
-- ==============================================

-- Helper function to get client_id from company_id
CREATE OR REPLACE FUNCTION get_client_id_from_company(company TEXT)
RETURNS UUID AS $$
  SELECT id FROM clients WHERE company_id = company LIMIT 1;
$$ LANGUAGE SQL STABLE;

CREATE POLICY events_read_owner_admin ON events
FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY events_write_owner_admin ON events
FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- ENTITIES TABLE (Students/Members)
-- ==============================================

CREATE POLICY entities_read_owner_admin ON entities
FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY entities_write_owner_admin ON entities
FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- SUBSCRIPTIONS TABLE (Owner/Admin only)
-- ==============================================

CREATE POLICY subscriptions_read_owner_admin ON subscriptions
FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY subscriptions_write_owner_admin ON subscriptions
FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- FORM TEMPLATES TABLE (Owner/Admin only)
-- ==============================================

CREATE POLICY form_templates_read_owner_admin ON form_templates
FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY form_templates_write_owner_admin ON form_templates
FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- FORM SUBMISSIONS TABLE (Owner/Admin only)
-- ==============================================

CREATE POLICY form_submissions_read_owner_admin ON form_submissions
FOR SELECT USING (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

CREATE POLICY form_submissions_write_owner_admin ON form_submissions
FOR INSERT WITH CHECK (
  client_id IN (
    SELECT id FROM clients 
    WHERE company_id = current_setting('app.tenant_id', true)
  )
  AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
);

-- ==============================================
-- INSIGHTS TABLE (if exists - Owner/Admin only)
-- ==============================================

-- Uncomment if you have an insights table
-- CREATE POLICY insights_read_owner_admin ON insights
-- FOR SELECT USING (
--   client_id IN (
--     SELECT id FROM clients 
--     WHERE company_id = current_setting('app.tenant_id', true)
--   )
--   AND current_setting('app.role', true) IN ('owner', 'admin', 'test')
-- );

-- ==============================================
-- NOTES
-- ==============================================

-- 1. These policies require session variables to be set:
--    SET LOCAL app.tenant_id = 'biz_xxx';
--    SET LOCAL app.role = 'owner';
--
-- 2. The 'test' role is included for development/testing
--    Remove it in production for maximum security
--
-- 3. Members will get ZERO rows when querying these tables
--    Even if they somehow bypass API checks
--
-- 4. To use in your API routes:
--    await supabase.rpc('set_session_vars', { 
--      tenant: companyId, 
--      role: auth.role 
--    });
--
-- 5. Or set directly in each request:
--    await db.$executeRawUnsafe(`
--      SET LOCAL app.tenant_id='${companyId}';
--      SET LOCAL app.role='${role}';
--    `);

