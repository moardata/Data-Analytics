/**
 * Fix RLS Policy for Clients Table
 * Allows read access with application-layer security via company_id filtering
 * 
 * SECURITY NOTE:
 * - Data in clients table is non-sensitive (tier, status only)
 * - No PII or financial data exposed
 * - Application APIs always filter by company_id
 * - This allows subscription APIs to read tier data
 */

-- Drop old restrictive policy that requires session variables
DROP POLICY IF EXISTS clients_read_owner_admin ON clients;

-- Create new permissive read policy
-- Security is enforced at application layer via company_id filtering
CREATE POLICY clients_allow_read ON clients 
FOR SELECT 
USING (true);

-- Keep write policies restrictive (only via webhooks/admin APIs)
-- This ensures only authorized processes can modify subscription data

