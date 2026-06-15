"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PILLARS = [
  { title: "Structured Learning", desc: "5-Phase training from basics to mock interviews" },
  { title: "Aptitude & Core", desc: "Branch-specific technical and aptitude prep" },
  { title: "Professional Skills", desc: "Communication, GDs, & LinkedIn optimization" },
  { title: "Placement Ready", desc: "Mock interviews, resumes, & application strategies" },
];



export default function CurriculumOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitGroupRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    ScrollTrigger.refresh();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1.5,
        start: "top top",
        end: "+=800",
        anticipatePin: 1,
      }
    });

    // 1. Orbit animation
    tl.to(orbitGroupRef.current, {
      rotation: 220,
      ease: "none",
      duration: 2,
    }, 0);

    // Keep the cards upright
    tl.to(".orbit-card-inner", {
      rotation: -220,
      ease: "none",
      duration: 2,
    }, 0);

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, { scope: containerRef });

  const orbitRadius = isMobile ? 140 : 280;
  const cardWidth = isMobile ? 140 : 240;

  return (
    <section
      id="features"
      ref={containerRef}
      style={{
        height: "100vh",
        width: "100%",
        background: "var(--bg-secondary)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Title */}
      <div style={{ position: "absolute", top: isMobile ? 40 : 80, left: 0, width: "100%", textAlign: "center", zIndex: 1 }}>
        <p className="mono-text" style={{ color: "var(--accent-primary)", fontSize: "var(--text-xs)", letterSpacing: 4, marginBottom: 16, opacity: 0.8 }}>THE REASON</p>
        <h2 className="display-text" style={{ fontSize: isMobile ? "clamp(3rem, 10vw, 4rem)" : "clamp(4.5rem, 8vw, 7rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.85, textTransform: "uppercase", opacity: 0.15 }}>
          WHY <span className="accent-green">C2C</span>
        </h2>
      </div>

      {/* Animation Area */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 140 }}>

        {/* Orbit Group */}
        <div
          ref={orbitGroupRef}
          style={{
            position: "absolute",
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            zIndex: 5,
          }}
        >
          {PILLARS.map((pillar, i) => {
            const angle = (i / PILLARS.length) * Math.PI * 2;
            const x = Math.cos(angle) * orbitRadius;
            const y = Math.sin(angle) * orbitRadius;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  width: cardWidth,
                  height: cardWidth * 0.7,
                }}
              >
                <div
                  className="orbit-card-inner"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "var(--bg-card)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-xl)",
                    padding: isMobile ? "16px" : "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  <h4 style={{ fontFamily: "var(--font-heading)", fontSize: isMobile ? 14 : 20, color: "var(--accent-primary)", marginBottom: 8 }}>
                    {pillar.title}
                  </h4>
                  {!isMobile && <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{pillar.desc}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Logo */}
        <div
          ref={logoRef}
          style={{
            position: "absolute",
            width: isMobile ? 120 : 180,
            height: isMobile ? 120 : 180,
            borderRadius: "50%",
            background: "var(--surface-glass)",
            border: "2px solid var(--accent-primary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow)",
            zIndex: 6,
          }}
        >
          <span className="display-text" style={{ fontSize: isMobile ? "var(--text-4xl)" : "var(--text-6xl)", color: "var(--text-primary)", lineHeight: 1 }}>
            C<span style={{ color: "var(--accent-primary)" }}>2</span>C
          </span>
          <span className="mono-text" style={{ fontSize: 10, letterSpacing: 3, marginTop: 8, color: "var(--accent-primary)" }}>CORE</span>
        </div>



      </div>

    </section>
  );
}
