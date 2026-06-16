import { NextRequest, NextResponse } from "next/server";
import { appendSheetRecord } from "@/lib/google-sheets";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone number are required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    try {
      await appendSheetRecord("preRegistrations", [
        name.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        timestamp,
        "pending",
      ]);
    } catch (sheetsErr) {
      console.warn("Google Sheets pre-registration sync failed:", sheetsErr);
      const sheetsErrMsg = sheetsErr instanceof Error ? sheetsErr.message : "Unknown Sheets error";
      return NextResponse.json(
        { error: `Could not save your notification request: ${sheetsErrMsg}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification requested successfully",
    });
  } catch (err) {
    console.error("Pre-registration error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
