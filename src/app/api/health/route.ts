import { NextResponse } from "next/server";

/**
 * Health-check endpoint to debug Vercel deployment issues.
 * Returns status of each dependency without exposing secrets.
 * DELETE this file after debugging is complete.
 */
export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars (existence only, no values)
  checks["GOOGLE_SERVICE_ACCOUNT_KEY"] = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
    ? `set (${process.env.GOOGLE_SERVICE_ACCOUNT_KEY.length} chars)`
    : "NOT SET";
  checks["GOOGLE_CLIENT_EMAIL"] = process.env.GOOGLE_CLIENT_EMAIL
    ? `set (${process.env.GOOGLE_CLIENT_EMAIL})`
    : "NOT SET";
  checks["GOOGLE_PRIVATE_KEY"] = process.env.GOOGLE_PRIVATE_KEY
    ? `set (${process.env.GOOGLE_PRIVATE_KEY.length} chars)`
    : "NOT SET";
  checks["GOOGLE_SHEET_ID"] = process.env.GOOGLE_SHEET_ID ? "set" : "NOT SET";
  checks["GOOGLE_DRIVE_MASTER_FOLDER_ID"] = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID ? "set" : "NOT SET";
  checks["SUPABASE_URL"] = process.env.SUPABASE_URL ? "set" : "NOT SET";
  checks["SUPABASE_SERVICE_ROLE_KEY"] = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? `set (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)`
    : "NOT SET";
  checks["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NOT SET";
  checks["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "NOT SET";

  // 2. Check firebase-admin initialization
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase-admin");
    checks["firebase_admin_init"] = "OK";

    // Quick Firestore check
    try {
      const testRef = adminDb.collection("_health_check").doc("test");
      await testRef.get();
      checks["firestore_connection"] = "OK";
    } catch (e) {
      checks["firestore_connection"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }

    // Quick Auth check
    try {
      await adminAuth.listUsers(1);
      checks["firebase_auth"] = "OK";
    } catch (e) {
      checks["firebase_auth"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
  } catch (e) {
    checks["firebase_admin_init"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 3. Check Google Sheets JWT auth
  try {
    const { appendSheetRecord } = await import("@/lib/google-sheets");
    checks["google_sheets_import"] = "OK";
  } catch (e) {
    checks["google_sheets_import"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 4. Check Supabase
  try {
    const { supabaseAdmin, SCREENSHOTS_BUCKET } = await import("@/lib/supabase-admin");
    checks["supabase_import"] = "OK";
    
    const { data, error } = await supabaseAdmin.storage.getBucket(SCREENSHOTS_BUCKET);
    if (error) {
      checks["supabase_bucket"] = `ERROR: ${error.message}`;
    } else {
      checks["supabase_bucket"] = `OK (${data.name}, public=${data.public})`;
    }
  } catch (e) {
    checks["supabase_import"] = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks, { status: 200 });
}
