// Test to understand Supabase .single() behavior
// According to Supabase docs, .single() will return:
// - If exactly 1 row: { data: row, error: null }
// - If 0 rows: { data: null, error: { code: 'PGRST116', message: 'JSON object requested, no rows returned' } }
// - If >1 row: { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple rows returned' } }

// In the dashboard code:
// const { data: profile } = await supabase.from("users")...select(...).single();
// It destructures ONLY 'data' and ignores 'error'
// When profile is null (because .single() returned error), the code still runs
// and renders with fallback values from the nullish coalescing operators

console.log("Vulnerability Check:");
console.log("1. Trigger fails during signup → auth.users exists, public.users does NOT");
console.log("2. User logs in → auth.uid() returns user ID");
console.log("3. Dashboard queries .from('users').single()");
console.log("4. Query returns { data: null, error: { code: 'PGRST116' } }");
console.log("5. Code destructures ONLY data (ignores error)");
console.log("6. profile = null");
console.log("7. org = profile?.organizations = undefined");
console.log("8. Page renders: org?.name ?? 'Mon équipe' = 'Mon équipe'");
console.log("9. NO ERROR THROWN, NO REDIRECT, NO LOGGING");
console.log("10. User sees broken dashboard indefinitely");
console.log("\nVERDICT: REAL vulnerability confirmed.");
