"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";
import "./coming-soon.css";
import PreRegisterForm from "@/components/coming-soon/PreRegisterForm";

/* Dynamically import the 3D scene — no SSR, only client */
const GlassCubeScene = dynamic(
  () => import("@/components/coming-soon/GlassCubeScene"),
  { ssr: false }
);

/* ── Countdown logic ── */
function useCountdown() {
  const [timeStr, setTimeStr] = useState("0 days : 00 hrs : 00 min : 00 sec");

  useEffect(() => {
    const launchDateStr = process.env.NEXT_PUBLIC_LAUNCH_DATE;
    const targetDate = launchDateStr ? new Date(launchDateStr).getTime() : 0;

    const tick = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeStr("0 days : 00 hrs : 00 min : 00 sec");
        if (targetDate > 0) window.location.reload();
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dayLabel = d === 1 ? "day" : "days";
      setTimeStr(`${d} ${dayLabel} : ${pad(h)} hrs : ${pad(m)} min : ${pad(s)} sec`);
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
      {/* Background Glows (contained to prevent scroll overflow) */}
      <div className="cs-bg-glow-container">
        <div className="cs-bg-glow cs-bg-glow-1" />
        <div className="cs-bg-glow cs-bg-glow-2" />
      </div>

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
            THE <span className="text-blue">REAL JOURNEY</span> BEGINS.
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

        <div className="cs-divider" />

        <div className="cs-register-wrapper">
          <PreRegisterForm />
        </div>

        <div className="cs-divider cs-divider-bottom" />

        <Footer />
      </div>
    </div>
  );
}
