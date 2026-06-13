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
      <form 
        className="cs-register-row" 
        style={{ flexDirection: "column", gap: "0.5rem" }} 
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          className="cs-register-input"
          style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)" }}
          placeholder="enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={status === "loading" || status === "success"}
          required
        />
        <input
          type="email"
          className="cs-register-input"
          style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)" }}
          placeholder="enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          required
        />
        <input
          type="tel"
          className="cs-register-input"
          style={{ borderRight: "1px solid rgba(255, 255, 255, 0.12)" }}
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
      <div className={`cs-register-msg ${status === "success" ? "success" : status === "error" ? "error" : ""}`}>
        {message}
      </div>
    </div>
  );
}
