"use client";

import React, { useState } from "react";

export default function PreRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/pre-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("NOTIFIED — YOU'RE IN");
        setName("");
        setEmail("");
        setPhone("");
      } else {
        setStatus("error");
        setMessage(data.error || "TRANSMISSION FAILED");
      }
    } catch {
      setStatus("error");
      setMessage("SYSTEM ERROR — RETRY");
    }
  };

  return (
    <div className="cs-register">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
        
        {/* Top Badge */}
        <div 
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 102, 255, 0.05)",
            border: "1px solid rgba(0, 102, 255, 0.2)",
            borderRadius: "100px",
            padding: "0.25rem 1rem",
            textAlign: "center",
          }}
        >
          <span style={{ 
            color: "var(--accent-light)", 
            fontFamily: "var(--font-mono, monospace)", 
            fontSize: "0.75rem", 
            fontWeight: 600, 
            letterSpacing: "1px",
            whiteSpace: "nowrap"
          }}>
            NOTIFY ME
          </span>
        </div>

        {/* Form Below */}
        <form 
          className="cs-register-row" 
          style={{ flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "400px" }} 
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            className="cs-register-input"
            style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)", width: "100%" }}
            placeholder="enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === "loading" || status === "success"}
            required
          />
          <input
            type="email"
            className="cs-register-input"
            style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)", width: "100%" }}
            placeholder="enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            required
          />
          <input
            type="tel"
            className="cs-register-input"
            style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)", width: "100%" }}
            placeholder="enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={status === "loading" || status === "success"}
            required
          />
          <button
            type="submit"
            className="cs-register-btn"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={status === "loading" || status === "success"}
          >
            {status === "loading" ? "..." : status === "success" ? "✓ DONE" : "NOTIFY ME"}
          </button>
        </form>
      </div>
      <div className={`cs-register-msg ${status === "success" ? "success" : status === "error" ? "error" : ""}`}>
        {message}
      </div>
    </div>
  );
}
