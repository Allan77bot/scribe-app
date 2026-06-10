-- Test for implicit DENY on INSERT/DELETE when no policy exists

-- SCENARIO 1: Table with SELECT policy only (like organizations in current code)
CREATE TABLE test_org (
  id uuid primary key,
  name text
);

ALTER TABLE test_org ENABLE ROW LEVEL SECURITY;

CREATE POLICY "test_org_select" ON test_org
  FOR SELECT
  USING (true);

-- At this point, INSERT and DELETE are IMPLICITLY DENIED
-- But we need to verify this is sufficient

-- SCENARIO 2: Check if a developer could accidentally use a flawed SELECT
-- with check (true) thinking it allows INSERT

-- The actual Supabase/PostgreSQL RLS documentation states:
-- "By default, if no policy is set, then a DENY rule is implicit for all operations."
-- "This is the secure-by-default design."

-- However, the reviewer's concern is valid: 
-- 1. Implicit DENY is hard to audit (grep won't show it)
-- 2. Future developers might not realize INSERT/DELETE is blocked
-- 3. If someone adds policies in future, they might miss DELETE/INSERT
-- 4. It's best practice to be EXPLICIT about security intent

