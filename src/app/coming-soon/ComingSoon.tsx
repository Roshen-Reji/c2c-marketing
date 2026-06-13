"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "./coming-soon.css";
import PreRegisterForm from "@/components/coming-soon/PreRegisterForm";

/* Dynamically import the 3D scene — no SSR, only client */
const GlassCubeScene = dynamic(
  () => import("@/components/coming-soon/GlassCubeScene"),
  { ssr: false }
);

/* ── Countdown logic ── */
function useCountdown() {
  const [timeStr, setTimeStr] = useState("00 : 00 : 00 : 00");

  useEffect(() => {
    const launchDateStr = process.env.NEXT_PUBLIC_LAUNCH_DATE;
    const targetDate = launchDateStr ? new Date(launchDateStr).getTime() : 0;

    const tick = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeStr("00 : 00 : 00 : 00");
        if (targetDate > 0) window.location.reload();
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const pad = (n: number) => n.toString().padStart(2, "0");
      setTimeStr(`${pad(d)} : ${pad(h)} : ${pad(m)} : ${pad(s)}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeStr;
}

export default function ComingSoonPage() {
  const timeStr = useCountdown();

  return (
    <div className="cs-page">
      {/* Background Glows */}
      <div className="cs-bg-glow cs-bg-glow-1" />
      <div className="cs-bg-glow cs-bg-glow-2" />

      {/* Background Watermark */}
      <div className="cs-watermark">
        <div>CAMPUS</div>
        <div>CORPORATE</div>
      </div>

      <div className="cs-content-wrapper">
        <header className="cs-hero-header">
          <h1 className="cs-hero-title">
            <span className="line">
              <span>CAMPUS</span>
              <span className="cs-accent-2">2</span>
            </span>
            <span className="line">
              <span>CORPORATE</span>
            </span>
          </h1>

          <div className="cs-sub-quote">
            WHERE LEARNING ENDS, <br />
            THE <span className="text-mint">REAL JOURNEY</span> BEGINS.
          </div>
        </header>

        <div className="cs-main-body">
          <div className="cs-graphic-area">
            {/* Using the GlassCubeScene in place of the chair graphic */}
            <GlassCubeScene />
          </div>

          <div className="cs-info-area">
            <div className="cs-coming-soon-block">
              <div className="cs-vertical-line" />
              <div className="cs-coming-soon-text">
                <span className="cs-cs-top">C O M I N G</span>
                <span className="cs-cs-mid">SOON</span>
                <span className="cs-cs-bot">STAY TUNED FOR MORE</span>
              </div>
            </div>
            <div className="cs-timer-small">{timeStr}</div>
          </div>
        </div>

        <div className="cs-register-wrapper">
          <PreRegisterForm />
        </div>


        <footer className="cs-footer">
          <div className="cs-minimal-footer">
            <div className="cs-footer-motto">
              <span className="cs-dot">•</span>
              SMALL STEPS PAVE THE WAY
              <span className="cs-dot">•</span>
            </div>
          </div>

          <div className="cs-footer-top">
            <div className="cs-footer-col">
              <span className="cs-footer-label">Follow Us</span>
              <div className="cs-footer-links">
                <a href="https://www.linkedin.com/company/ieeesbcekidangoor/" className="cs-footer-link">LinkedIn</a>
                <a href="https://ieee.ce-kgr.org/" className="cs-footer-link">Web</a>
                <a href="https://www.instagram.com/ieeesbcekgr?igsh=MWczc3o1d21hdGxzcg==" className="cs-footer-link">Instagram</a>
              </div>
            </div>

            <div className="cs-footer-col">
              <span className="cs-footer-label">For Enquiries</span>
              <div className="cs-footer-links">
                <span className="cs-footer-text">
                  +91 7592 815 138 <br />
                  <span className="cs-contact-name">(Arya C Anish)</span>
                </span>
                <span className="cs-footer-text" style={{ marginTop: '0.25rem' }}>
                  +91 94000 78625 <br />
                  <span className="cs-contact-name">(Malavika C Biju)</span>
                </span>
              </div>
            </div>

            <div className="cs-footer-right">
              <img src="/ieee-sb-cek.png" alt="IEEE CE Kidangoor Student Branch" className="cs-footer-logo" />
              <img src="/ieee-logo.png" alt="IEEE" className="cs-footer-logo" />
              <img src="/ieee-wie.png" alt="IEEE WIE" className="cs-footer-logo" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
