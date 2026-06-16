"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import {
  IconCheckCircle,
  IconFileDown,
  IconProfile,
  IconStar,
} from "@/components/SvgIcons";
import "../register/register.css";

/* ===== Types ===== */
interface FormData {
  fullName: string;
  phone: string;
  batch: string;
  otherBranch?: string;
  year: string;
  email: string;
  googleUid?: string;
  isIeeeMember: boolean;
  ieeeNumber: string;
  isApplyingScholarship: boolean;
  q1Financial: string;
  q2Hours: string;
  q3Why: string;
  q4Roadblock: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  batch?: string;
  otherBranch?: string;
  year?: string;
  email?: string;
  googleUid?: string;
  screenshot?: string;
  ieeeNumber?: string;
  isIeeeMember?: string;
  isApplyingScholarship?: string;
  q1Financial?: string;
  q2Hours?: string;
  q3Why?: string;
  q4Roadblock?: string;
}

const BATCHES = ["CSE", "ECE", "EEE", "CE", "EI"];
const YEARS = ["2nd Year", "3rd Year", "4th Year"];

/* ===== Validation ===== */
function validateStep1(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.fullName.trim()) errors.fullName = "Full name is required";
  else if (data.fullName.trim().length < 3)
    errors.fullName = "Name must be at least 3 characters";

  if (!data.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^\d{10}$/.test(data.phone.replace(/\D/g, '')))
    errors.phone = "Please enter a valid 10-digit phone number";

  if (!data.batch) errors.batch = "Please select your branch";
  else if (data.batch === "Others.." && !data.otherBranch?.trim()) errors.batch = "Please specify your branch";
  if (!data.year) errors.year = "Please select your year";

  if (!data.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Please enter a valid email";

  if (data.isIeeeMember && !data.ieeeNumber.trim()) {
    errors.ieeeNumber = "IEEE number is required for members";
  }


  return errors;
}

/* ===== Image Compression ===== */
/**
 * Compress an image file using the Canvas API.
 * Resizes to maxDimension and converts to JPEG at the given quality.
 * This keeps uploads well under Vercel's 4.5MB body limit.
 */
function compressImage(file: File, maxDimension = 1200, quality = 0.6): Promise<File> {
  return new Promise((resolve, reject) => {
    // If already small enough (<1MB), skip compression
    if (file.size < 1024 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        let { width, height } = img;

        // Scale down if either dimension exceeds max
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file); // fallback: send original
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // fallback
              return;
            }
            const compressed = new File(
              [blob],
              file.name.replace(/\.\w+$/, ".jpg"),
              { type: "image/jpeg" }
            );
            resolve(compressed);
          },
          "image/jpeg",
          quality
        );
      } catch {
        resolve(file); // fallback on any error
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image for compression"));
    };
    img.src = url;
  });
}

/* ===== Component ===== */
export default function ScholarshipPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    batch: "",
    otherBranch: "",
    year: "",
    email: "",
    isIeeeMember: false,
    ieeeNumber: "",
    isApplyingScholarship: true,
    q1Financial: "",
    q2Hours: "",
    q3Why: "",
    q4Roadblock: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEarlyBird, setIsEarlyBird] = useState(true);

  const amountToPay = isEarlyBird
    ? (formData.isIeeeMember ? 299 : 399)
    : (formData.isIeeeMember ? 399 : 499);

  useEffect(() => {
    const endStr = process.env.NEXT_PUBLIC_REG_END_DATE;
    if (endStr && Date.now() > new Date(endStr).getTime()) {
      setTimeout(() => setIsClosed(true), 0);
    }

    const earlyBirdEndStr = process.env.NEXT_PUBLIC_EARLY_BIRD_END_DATE;
    if (earlyBirdEndStr && Date.now() > new Date(earlyBirdEndStr).getTime()) {
      setIsEarlyBird(false);
    }
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || prev.fullName,
        email: user.email || prev.email,
        googleUid: user.uid,
      }));

      // Clear errors for fields we just populated
      setErrors((prev) => ({
        ...prev,
        fullName: undefined,
        email: undefined,
      }));
    } catch (error) {
      console.error("Google sign in failed:", error);
      alert("Failed to sign in with Google. You can still register manually.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, screenshot: "File must be under 10MB" }));
        return;
      }
      setScreenshot(file);
      setErrors((prev) => ({ ...prev, screenshot: undefined }));
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const goToStep = (targetStep: number) => {
    if (targetStep === 2) {
      const stepErrors = validateStep1(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    if (targetStep === 3) {
      if (formData.isApplyingScholarship) {
        let hasErrors = false;
        const newErrors: FormErrors = {};
        if (formData.q1Financial.trim().length < 20) { newErrors.q1Financial = "Please provide a more detailed answer."; hasErrors = true; }
        if (formData.q2Hours.trim().length < 20) { newErrors.q2Hours = "Please provide a more detailed answer."; hasErrors = true; }
        if (formData.q3Why.trim().length < 20) { newErrors.q3Why = "Please provide a more detailed answer."; hasErrors = true; }
        if (formData.q4Roadblock.trim().length < 20) { newErrors.q4Roadblock = "Please provide a more detailed answer."; hasErrors = true; }
        if (hasErrors) {
          setErrors(newErrors);
          return;
        }
      } else if (!screenshot) {
        setErrors({ screenshot: "Please upload your payment screenshot" });
        return;
      }
    }
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Build FormData for server submission
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName.trim());
      submitData.append("phone", formData.phone.trim());
      submitData.append("batch", formData.batch === "Others.." ? (formData.otherBranch || "").trim() : formData.batch);
      submitData.append("year", formData.year);
      submitData.append("email", formData.email.trim().toLowerCase());
      submitData.append("isIeeeMember", formData.isIeeeMember ? "true" : "false");
      submitData.append("ieeeNumber", formData.ieeeNumber.trim());
      submitData.append("amountToPay", amountToPay.toString());
      submitData.append("isApplyingScholarship", formData.isApplyingScholarship ? "true" : "false");
      submitData.append("q1Financial", formData.q1Financial.trim());
      submitData.append("q2Hours", formData.q2Hours.trim());
      submitData.append("q3Why", formData.q3Why.trim());
      submitData.append("q4Roadblock", formData.q4Roadblock.trim());


      if (formData.googleUid) {
        submitData.append("googleUid", formData.googleUid);
        const currentUser = auth.currentUser;
        if (currentUser) {
          submitData.append("googleIdToken", await currentUser.getIdToken());
        }
      }
      // Upload screenshot: compress client-side then send through server
      let screenshotUrl = "";
      if (screenshot) {
        try {
          // Compress image client-side to stay under Vercel's 4.5MB body limit
          const compressed = await compressImage(screenshot, 1200, 0.6);

          // Upload compressed image to our server API which proxies to Google Drive
          const uploadForm = new FormData();
          uploadForm.append("file", compressed, screenshot.name);
          uploadForm.append("email", formData.email.trim().toLowerCase());

          const uploadRes = await fetch("/C2C/api/upload-url", {
            method: "POST",
            body: uploadForm,
          });

          if (!uploadRes.ok) {
            const errData = await uploadRes.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to upload screenshot");
          }

          const uploadData = await uploadRes.json();
          screenshotUrl = uploadData.url || "";
        } catch (uploadErr) {
          console.error("Screenshot upload failed:", uploadErr);
          const msg = uploadErr instanceof Error ? uploadErr.message : "Unknown upload error";
          throw new Error(
            `Could not upload payment screenshot: ${msg}`
          );
        }
      }

      // 3. Send registration data (text only — no file) to register API
      submitData.append("screenshotUrl", screenshotUrl);

      const res = await fetch("/C2C/api/register", {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) {
        let data;
        let errorMessage = "Registration failed";
        try {
          data = await res.json();
          errorMessage = data.error || errorMessage;
        } catch (parseErr) {
          errorMessage = `Server error (${res.status}). Please try again or contact support.`;
        }
        throw new Error(errorMessage);
      }

      // Save registration state locally
      localStorage.setItem('c2c_registered', 'true');
      setIsSuccess(true);
    } catch (err) {
      console.error("Registration error:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="register-page">
        <div className="container register-container">
          <div className="register-card">
            <div className="success-container">
              <div className="success-icon"><IconStar size={44} /></div>
              {formData.isApplyingScholarship ? (
                <>
                  <h2 className="success-title" style={{ fontSize: "var(--text-2xl)" }}>
                    Submission <span className="accent-green">Successful</span>
                  </h2>
                  <p className="success-text" style={{ marginBottom: "var(--space-4)" }}>
                    Thank you for completing the first phase of the C2C Scholarship Application. Your responses have been recorded.
                  </p>
                  <div style={{ textAlign: "left", background: "var(--surface-glass)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
                    <h4 style={{ color: "var(--accent-primary)", marginBottom: "var(--space-2)" }}>Next Steps:</h4>
                    <ul style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingLeft: "var(--space-4)" }}>
                      <li><strong style={{ color: "var(--text-primary)" }}>Evaluation Status:</strong> This selection process requires the completion of two distinct tasks. Your application will be evaluated based on your performance across both rounds.</li>
                      <li><strong style={{ color: "var(--text-primary)" }}>Task 2 Notification:</strong> Detailed instructions for Task 2 will be issued shortly.</li>
                      <li><strong style={{ color: "var(--text-primary)" }}>Communications:</strong> Please closely monitor your registered email address and WhatsApp number for further updates.</li>
                    </ul>
                    <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: "var(--space-4)", fontStyle: "italic" }}>
                      — Organizing Committee, Team C2C
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="success-title" style={{ fontSize: "var(--text-2xl)" }}>
                    Submission <span className="accent-green">Successful</span>
                  </h2>
                  <p className="success-text" style={{ marginBottom: "var(--space-4)" }}>
                    Thank you for registering for the event. Your responses have been securely recorded.
                  </p>
                  <div style={{ textAlign: "left", background: "var(--surface-glass)", padding: "var(--space-4)", borderRadius: "var(--radius-md)", marginBottom: "var(--space-6)" }}>
                    <h4 style={{ color: "var(--accent-primary)", marginBottom: "var(--space-2)" }}>Next Steps:</h4>
                    <ul style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingLeft: "var(--space-4)" }}>
                      <li><strong style={{ color: "var(--text-primary)" }}>Payment Verification:</strong> Your application will be officially confirmed once your payment has been verified by our team.</li>
                      <li><strong style={{ color: "var(--text-primary)" }}>Communications:</strong> Please closely monitor your registered email address and WhatsApp number for onboarding updates.</li>
                      <li><strong style={{ color: "var(--text-primary)" }}>Further Updates:</strong> Kindly check the official WhatsApp group regularly for all real-time announcements.</li>
                    </ul>
                    <p style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)", marginTop: "var(--space-4)", fontStyle: "italic" }}>
                      — Organizing Committee, Team C2C
                    </p>
                  </div>
                </>
              )}
              <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center" }}>

                <Link href="/" className="btn btn-primary">
                  ← Back Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="register-page">
        <div className="container register-container">
          <div className="register-card">
            <div className="success-container">
              <h2 className="success-title">
                Registration <span className="accent-yellow">Closed</span>
              </h2>
              <p className="success-text">
                The registration period for this program has ended.
              </p>
              <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center" }}>
                <Link href="/" className="btn btn-secondary">
                  ← Back Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="container register-container">
        <Link href="/" className="register-back" id="register-back-link">
          ← Back to Home
        </Link>

        <h1 className="register-title">
          Apply for <span className="accent-yellow">Scholarship</span>
        </h1>
        <p className="register-subtitle">
          Join the Campus 2 Corporate program and start your transformation.
        </p>

        {/* Steps Indicator */}
        <div className="steps-indicator" id="steps-indicator">
          <div className={`step-dot ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <div className="step-number">{step > 1 ? <IconCheckCircle size={18} /> : "1"}</div>
            <span className="step-label">Details</span>
          </div>
          <div className={`step-line ${step > 1 ? "completed" : ""}`} />
          <div className={`step-dot ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
            <div className="step-number">{step > 2 ? <IconCheckCircle size={18} /> : "2"}</div>
            <span className="step-label">Payment</span>
          </div>
          <div className={`step-line ${step > 2 ? "completed" : ""}`} />
          <div className={`step-dot ${step >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <span className="step-label">Confirm</span>
          </div>
        </div>

        <div className="register-card">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="register-form">

              {!formData.googleUid && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary w-full"
                    onClick={handleGoogleSignIn}
                    style={{ marginBottom: "var(--space-4)", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                    <span style={{ padding: '0 10px', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>OR REGISTER WITH EMAIL</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></div>
                  </div>
                </>
              )}

              {formData.googleUid && (
                <div style={{
                  background: 'var(--border-subtle)',
                  border: '1px solid var(--border-default)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)'
                }}>
                  <IconCheckCircle size={20} color="var(--accent-secondary)" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>Google Account Linked</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{formData.email}</div>
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', padding: '4px 8px' }}
                    onClick={() => setFormData(prev => ({ ...prev, googleUid: undefined }))}
                  >
                    Unlink
                  </button>
                </div>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="fullName">
                  Full Name <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="input"
                  placeholder="Enter Your Full Name"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  disabled={!!formData.googleUid}
                />
                {errors.fullName && <div className="form-error">{errors.fullName}</div>}
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="phone">
                  Phone Number <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  placeholder="Enter your WhatsApp number"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="batch">
                    Branch <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                  </label>
                  <select
                    id="batch"
                    className="input select"
                    value={formData.batch}
                    onChange={(e) => updateField("batch", e.target.value)}
                  >
                    <option value="">Select branch</option>
                    {BATCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="Others..">Others..</option>
                  </select>
                  {formData.batch === "Others.." && (
                    <input
                      type="text"
                      className="input"
                      placeholder="Type your branch"
                      value={formData.otherBranch || ""}
                      onChange={(e) => updateField("otherBranch", e.target.value)}
                      style={{ marginTop: 'var(--space-2)' }}
                    />
                  )}
                  {errors.batch && <div className="form-error">{errors.batch}</div>}
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="year">
                    Year <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                  </label>
                  <select
                    id="year"
                    className="input select"
                    value={formData.year}
                    onChange={(e) => updateField("year", e.target.value)}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  {errors.year && <div className="form-error">{errors.year}</div>}
                </div>
              </div>

              <div className="input-group checkbox-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-4)' }}>
                <input
                  id="isIeee"
                  type="checkbox"
                  checked={formData.isIeeeMember}
                  onChange={(e) => updateField("isIeeeMember", e.target.checked as any)}
                  style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                />
                <label className="input-label" htmlFor="isIeee" style={{ margin: 0, cursor: 'pointer' }}>
                  I am an IEEE Member
                </label>
              </div>

              {formData.isIeeeMember && (
                <div className="input-group">
                  <label className="input-label" htmlFor="ieeeNumber">
                    IEEE Membership Number <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                  </label>
                  <input
                    id="ieeeNumber"
                    type="text"
                    className="input"
                    placeholder="Enter your IEEE number"
                    value={formData.ieeeNumber}
                    onChange={(e) => updateField("ieeeNumber", e.target.value)}
                  />
                  {errors.ieeeNumber && <div className="form-error">{errors.ieeeNumber}</div>}
                </div>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="email">
                  Email ID <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  disabled={!!formData.googleUid}
                />
                <span
                  className="mono-text"
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--text-muted)",
                    marginTop: "var(--space-1)",
                    display: "block",
                  }}
                >
                  This email will be used for login
                </span>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>


              <div className="form-actions">
                <button type="button" className="btn btn-primary btn-large" onClick={() => goToStep(2)} id="step1-next-btn">
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Questionnaire */}
          {step === 2 && (
            <div className="register-form payment-section">
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Financial Aid Application
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                  <div className="input-group">
                    <label className="input-label">1. Please briefly describe your current financial situation or constraints that make the upfront ₹{amountToPay} fee a barrier for you right now. <span style={{ color: "var(--accent-tertiary)" }}>*</span></label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.q1Financial}
                      onChange={(e) => updateField("q1Financial", e.target.value)}
                    />
                    {errors.q1Financial && <div className="form-error">{errors.q1Financial}</div>}
                  </div>
                  <div className="input-group">
                    <label className="input-label">2. This 5-month bootcamp requires consistency. How many hours per week do you plan to dedicate to C2C, and how will you balance this with your college curriculum/exams? <span style={{ color: "var(--accent-tertiary)" }}>*</span></label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.q2Hours}
                      onChange={(e) => updateField("q2Hours", e.target.value)}
                    />
                    {errors.q2Hours && <div className="form-error">{errors.q2Hours}</div>}
                  </div>
                  <div className="input-group">
                    <label className="input-label">3. (The Personal &apos;Why&apos;) Where do you see yourself technically and professionally 5 months from now, and why is the C2C bootcamp the exact vehicle you need to get there? <span style={{ color: "var(--accent-tertiary)" }}>*</span></label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.q3Why}
                      onChange={(e) => updateField("q3Why", e.target.value)}
                    />
                    {errors.q3Why && <div className="form-error">{errors.q3Why}</div>}
                  </div>
                  <div className="input-group">
                    <label className="input-label">4. (The Problem-Solving Mindset) Tell us about a time you encountered a tough technical roadblock (a bug, a difficult concept, or a failed project). How did you go about solving it, and what did you learn about your own learning process? <span style={{ color: "var(--accent-tertiary)" }}>*</span></label>
                    <textarea
                      className="input"
                      rows={4}
                      value={formData.q4Roadblock}
                      onChange={(e) => updateField("q4Roadblock", e.target.value)}
                    />
                    {errors.q4Roadblock && <div className="form-error">{errors.q4Roadblock}</div>}
                  </div>
                </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary btn-large" onClick={() => goToStep(1)} id="step2-back-btn">
                  ← Back
                </button>
                <button type="button" className="btn btn-primary btn-large" onClick={() => goToStep(3)} id="step2-next-btn">
                  Review →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="confirm-section">
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Review Your Details
              </h3>
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-6)",
                }}
              >
                Please confirm all the information below is correct before submitting.
              </p>

              <div className="confirm-row">
                <span className="confirm-label">Full Name</span>
                <span className="confirm-value">{formData.fullName}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Phone</span>
                <span className="confirm-value">{formData.phone}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Branch</span>
                <span className="confirm-value">{formData.batch === "Others.." ? formData.otherBranch : formData.batch}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Year</span>
                <span className="confirm-value">{formData.year}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">IEEE Member</span>
                <span className="confirm-value">{formData.isIeeeMember ? `Yes (${formData.ieeeNumber})` : "No"}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Amount to Pay</span>
                <span className="confirm-value">{formData.isApplyingScholarship ? "₹0 (Scholarship Applied)" : `₹${amountToPay}`}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email</span>
                <span className="confirm-value">{formData.email}</span>
              </div>
              {formData.googleUid && (
                <div className="confirm-row">
                  <span className="confirm-label">Authentication</span>
                  <span className="confirm-value">Google Sign-In</span>
                </div>
              )}
              <div className="confirm-row">
                <span className="confirm-label">{formData.isApplyingScholarship ? "Scholarship" : "Payment"}</span>
                <span className="confirm-value accent-green">{formData.isApplyingScholarship ? "Applied for Financial Aid" : "Screenshot Attached"}</span>
              </div>

              {!formData.isApplyingScholarship && screenshotPreview && (
                <div className="confirm-screenshot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screenshotPreview} alt="Payment screenshot" />
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary btn-large" onClick={() => goToStep(2)} id="step3-back-btn">
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-large"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  id="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner" /> Submitting...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
