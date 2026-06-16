import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { appendSheetRecord } from "@/lib/google-sheets";

// Note: Firebase Admin and Google Sheets are imported dynamically
// to allow the app to run even without credentials configured

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const batch = formData.get("batch") as string;
    const year = formData.get("year") as string;
    const email = formData.get("email") as string;

    const isIeeeMember = formData.get("isIeeeMember") === "true";
    const ieeeNumber = (formData.get("ieeeNumber") as string) || "";
    const amountToPay = (formData.get("amountToPay") as string) || "";
    const isApplyingScholarship = formData.get("isApplyingScholarship") === "true";
    const isEarlyBird = formData.get("isEarlyBird") === "true";
    const q1Financial = (formData.get("q1Financial") as string) || "";
    const q2Hours = (formData.get("q2Hours") as string) || "";
    const q3Why = (formData.get("q3Why") as string) || "";
    const q4Roadblock = (formData.get("q4Roadblock") as string) || "";
    // Screenshot is uploaded directly to Google Drive by the browser.
    // We only receive the Drive URL here.
    const screenshotUrl = (formData.get("screenshotUrl") as string) || "";

    // Validate required fields
    if (!fullName || !phone || !batch || !year || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }


    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    // Create Firebase Auth user
    let userId = "";
    let createdPasswordUser = false;

    try {
      const userRecord = await adminAuth.createUser({
        email: email.toLowerCase(),
        displayName: fullName,
      });
      userId = userRecord.uid;
      createdPasswordUser = true;
    } catch (authErr: unknown) {
      const error = authErr as { code?: string };
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json(
          { error: "Email is already registered. Please log in instead." },
          { status: 400 }
        );
      }
      console.error("Firebase Auth user creation failed:", authErr);
      return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
    }

    try {
      await adminDb.collection("students").doc(userId).set({
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        batch,
        year,
        status: "pending",
        role: "student",
        paymentScreenshot: screenshotUrl,
        isApplyingScholarship,
        scholarshipData: isApplyingScholarship ? {
          q1Financial,
          q2Hours,
          q3Why,
          q4Roadblock,
        } : null,
        registeredAt: new Date(),
        totalPoints: 0,
        streak: 0,
        tasksSubmitted: 0,
        tasksApproved: 0,
        testsTaken: 0,
        daysCompleted: 0,
      });
    } catch (dbErr) {
      if (createdPasswordUser) {
        await adminAuth.deleteUser(userId).catch(() => undefined);
      }
      console.error("Firestore registration write failed:", dbErr);
      return NextResponse.json({ error: "Could not save your registration." }, { status: 500 });
    }

    try {
      await appendSheetRecord("registrations", [
        userId,
        fullName.trim(),
        email.toLowerCase().trim(),
        phone.trim(),
        batch,
        year,
        isApplyingScholarship ? "Scholarship Applied" : screenshotUrl,
        timestamp,
        "pending",
        isIeeeMember ? "Yes" : "No",
        ieeeNumber || "N/A",
        isApplyingScholarship ? "Scholarship" : amountToPay || "N/A",
        isApplyingScholarship ? "N/A" : (isEarlyBird ? "Early Bird" : "Full Payment"),
      ]);

      if (isApplyingScholarship) {
        await appendSheetRecord("scholarships", [
          userId,
          fullName.trim(),
          email.toLowerCase().trim(),
          phone.trim(),
          q1Financial,
          q2Hours,
          q3Why,
          q4Roadblock,
          timestamp,
        ]);
      }
    } catch (sheetsErr) {
      console.warn("Google Sheets registration sync failed:", sheetsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      userId,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
