import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, SCREENSHOTS_BUCKET } from "@/lib/supabase-admin";

/**
 * Accepts a compressed image via FormData and uploads it to Supabase Storage.
 * Returns a public URL for the uploaded file.
 *
 * Supabase SDK is ~50KB — orders of magnitude smaller than googleapis (~40MB),
 * so this works perfectly within Vercel's serverless function limits.
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const email = formData.get("email") as string | null;

    if (!file || !email) {
      return NextResponse.json(
        { error: "Missing required fields (file, email)" },
        { status: 400 }
      );
    }

    // Safety check: reject files over 4MB (Vercel limit is 4.5MB for the whole body)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File is too large. Please use a smaller image." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${email.toLowerCase().trim()}/payment_${Date.now()}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(SCREENSHOTS_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(SCREENSHOTS_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath,
    });
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
