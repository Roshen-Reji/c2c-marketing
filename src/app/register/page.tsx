"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  IconCheckCircle,
  IconFileDown,
  IconProfile,
  IconStar,
} from "@/components/SvgIcons";
import "./register.css";

/* ===== Types ===== */
interface FormData {
  fullName: string;
  phone: string;
  college: string;
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
  college?: string;
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

  if (!data.college.trim()) errors.college = "College name is required";

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
export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    college: "",
    batch: "",
    otherBranch: "",
    year: "",
    email: "",
    isIeeeMember: false,
    ieeeNumber: "",
    isApplyingScholarship: false,
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
      if (!screenshot) {
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
      submitData.append("college", formData.college.trim());
      submitData.append("batch", formData.batch === "Others.." ? (formData.otherBranch || "").trim() : formData.batch);
      submitData.append("year", formData.year);
      submitData.append("email", formData.email.trim().toLowerCase());
      submitData.append("isIeeeMember", formData.isIeeeMember ? "true" : "false");
      submitData.append("ieeeNumber", formData.ieeeNumber.trim());
      submitData.append("amountToPay", amountToPay.toString());
      submitData.append("isApplyingScholarship", formData.isApplyingScholarship ? "true" : "false");
      submitData.append("isEarlyBird", isEarlyBird ? "true" : "false");
      submitData.append("q1Financial", formData.q1Financial.trim());
      submitData.append("q2Hours", formData.q2Hours.trim());
      submitData.append("q3Why", formData.q3Why.trim());
      submitData.append("q4Roadblock", formData.q4Roadblock.trim());



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

      const res = await fetch("/C2C/api/enroll", {
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

              <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center" }}>
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ backgroundColor: "#25D366", color: "white" }}
                >
                  Continue to WhatsApp
                </a>
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
          Register <span className="accent-yellow">Now</span>
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

              <div className="input-group">
                <label className="input-label" htmlFor="college">
                  College Name <span style={{ color: "var(--accent-tertiary)" }}>*</span>
                </label>
                <input
                  id="college"
                  type="text"
                  className="input"
                  placeholder="Enter Your College Name"
                  value={formData.college}
                  onChange={(e) => updateField("college", e.target.value)}
                />
                {errors.college && <div className="form-error">{errors.college}</div>}
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

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="register-form payment-section">
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--text-xl)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Payment & Scholarship
              </h3>

              <div style={{ marginBottom: "var(--space-6)" }}>
                <h4 style={{ fontSize: "var(--text-lg)", color: "var(--text-primary)", marginBottom: "var(--space-2)" }}>Registration Fee</h4>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--space-6)",
                  }}
                >
                  {isEarlyBird ? (
                    <>
                      Pay <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '8px' }}>₹{formData.isIeeeMember ? 399 : 499}</span>
                      <strong>₹{amountToPay}</strong> (Early Bird Price) via UPI and upload a screenshot of the payment
                    </>
                  ) : (
                    <>Pay ₹{amountToPay} via UPI and upload a screenshot of the payment</>
                  )}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
                  {amountToPay === 299 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', width: '100%', maxWidth: '200px' }}>
                      <div className="qr-container" style={{ margin: 0, width: '100%', aspectRatio: '1/1', height: 'auto' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/C2C/QR/qr-299.png" alt="Payment QR Code ₹299" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                      </div>
                      <div className="upi-id" style={{ margin: 0, padding: '8px', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        <strong>paytm.s1wsfli@pty</strong>
                      </div>
                    </div>
                  )}
                  {amountToPay === 399 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', width: '100%', maxWidth: '200px' }}>
                      <div className="qr-container" style={{ margin: 0, width: '100%', aspectRatio: '1/1', height: 'auto' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/C2C/QR/qr-399.png" alt="Payment QR Code ₹399" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                      </div>
                      <div className="upi-id" style={{ margin: 0, padding: '8px', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        <strong>paytm.s1wsfli@pty</strong>
                      </div>
                    </div>
                  )}
                  {amountToPay === 499 && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', width: '100%', maxWidth: '200px' }}>
                      <div className="qr-container" style={{ margin: 0, width: '100%', aspectRatio: '1/1', height: 'auto' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/C2C/QR/qr-499.png" alt="Payment QR Code ₹499" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }} />
                      </div>
                      <div className="upi-id" style={{ margin: 0, padding: '8px', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>
                        <strong>paytm.s1wsfli@pty</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className={`screenshot-upload ${screenshot ? "has-file" : ""}`}
                  id="screenshot-upload-area"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    tabIndex={-1}
                  />

                  {screenshot ? (
                    <>
                      <div className="upload-icon"><IconCheckCircle size={28} /></div>
                      <div className="upload-text">{screenshot.name}</div>
                      <div className="upload-hint">Click to change file</div>
                    </>
                  ) : (
                    <>
                      <div className="upload-icon"><IconFileDown size={28} /></div>
                      <div className="upload-text">
                        Click to upload payment screenshot
                      </div>
                      <div className="upload-hint">PNG, JPG, JPEG — Max 10MB</div>
                    </>
                  )}
                </div>

                {screenshotPreview && (
                  <div className="screenshot-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={screenshotPreview} alt="Payment screenshot preview" />
                  </div>
                )}

                {errors.screenshot && (
                  <div className="form-error" style={{ marginTop: "var(--space-2)" }}>
                    {errors.screenshot}
                  </div>
                )}
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
                <span className="confirm-label">College</span>
                <span className="confirm-value">{formData.college}</span>
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
                <span className="confirm-value">₹{amountToPay}</span>
              </div>
              <div className="confirm-row">
                <span className="confirm-label">Email</span>
                <span className="confirm-value">{formData.email}</span>
              </div>

              <div className="confirm-row">
                <span className="confirm-label">Payment</span>
                <span className="confirm-value accent-green">Screenshot Attached</span>
              </div>

              {screenshotPreview && (
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
