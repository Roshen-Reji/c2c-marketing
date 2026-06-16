"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PHASES = [
  {
    id: 1,
    title: "Phase 1: Career Compass",
    subtitle: "Explore. Decide. Grow.",
  },
  {
    id: 2,
    title: "Phase 2: Aptitude Mastery",
    subtitle: "Think Faster, Solve Better",
  },
  {
    id: 3,
    title: "Phase 3: Tech & Core Mastery",
    subtitle: "Master Core Concepts and Technical Interviews",
  },
  {
    id: 4,
    title: "Phase 4: Skill Up",
    subtitle: "Speak, Connect, Succeed",
  },
  {
    id: 5,
    title: "Phase 5: Career Launch",
    subtitle: "Step Into the Corporate World",
  },
];

export default function InteractiveRoadmap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const bgPathRef = useRef<SVGPathElement>(null);
  const timelineCanvasRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 1024);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 40); // account for padding
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const numPhases = PHASES.length;

  // Refresh ScrollTrigger to ensure CurriculumOrbit gets correct pin coordinates
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Bulletproof IntersectionObserver to detect when the section is in view
  useEffect(() => {
    const el = timelineCanvasRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // Triggers when 10% is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animation timeline
  useGSAP(() => {
    if (!pathRef.current || !timelineCanvasRef.current || !hasEntered) {
      gsap.set(".day-node", { opacity: 0, scale: 0 });
      gsap.set(".day-card", { opacity: 0, y: 20 });
      if (pathRef.current) {
        const pathLength = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
      }
      return;
    }

    gsap.set(".day-node", { opacity: 0, scale: 0 });
    gsap.set(".day-card", { opacity: 0, y: 20 });

    const path = pathRef.current;
    const pathLength = path.getTotalLength();
    gsap.set(path, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

    const tl = gsap.timeline();

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 1.0,
      ease: "power2.inOut",
    });

    tl.to(".day-node", {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.15,
      ease: "back.out(1.5)",
    }, "-=0.6");

    tl.to(".day-card", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.15,
      ease: "power2.out",
    }, "-=0.6");

  }, { scope: containerRef, dependencies: [isMobile, hasEntered] });

  // Generate SVG Path
  const generatePath = () => {
    if (isMobile) {
      const canvasHeight = Math.max(450, numPhases * 135);
      const startOffsetY = 80;
      const step = (canvasHeight - 160) / (numPhases - 1 || 1);
      const centerX = 12;

      let d = `M ${centerX} 0 L ${centerX} ${startOffsetY}`;
      for (let i = 0; i < numPhases; i++) {
        const y = i * step + startOffsetY;
        d += ` L ${centerX} ${y}`;
      }
      return d;
    } else {
      const startOffsetX = 140;
      const endOffsetX = 140;
      const step = Math.max(220, (containerWidth - startOffsetX - endOffsetX) / (numPhases - 1 || 1));
      const computedWidth = (numPhases - 1) * step + startOffsetX + endOffsetX;
      const canvasWidth = Math.max(containerWidth, computedWidth);
      const centerY = 250;
      const amplitude = 60;

      let d = `M 0 ${centerY} L ${startOffsetX} ${centerY}`;
      for (let i = 0; i < numPhases; i++) {
        const x = i * step + startOffsetX;
        const isTop = i % 2 === 0;

        if (i === 0) {
          d += ` L ${x} ${centerY}`;
        } else {
          const prevX = (i - 1) * step + startOffsetX;
          const cp1X = prevX + step / 2;
          const cp1Y = isTop ? centerY + amplitude : centerY - amplitude;
          const cp2X = prevX + step / 2;
          const cp2Y = isTop ? centerY - amplitude : centerY + amplitude;

          d += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x} ${centerY}`;
        }
      }
      d += ` L ${canvasWidth} ${centerY}`;
      return d;
    }
  };

  return (
    <section
      ref={containerRef}
      style={{
        padding: "80px 20px 20px 20px",
        background: "var(--bg-primary)",
        position: "relative",
        overflow: "hidden", 
      }}
    >
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.03, zIndex: 0 }}
        preserveAspectRatio="none"
        viewBox="0 0 1200 600"
      >
        {[100, 200, 300, 400, 500].map((y) => (
          <path
            key={y}
            d={`M0 ${y} C300 ${y - 80} 600 ${y + 80} 900 ${y - 40} S1200 ${y + 60} 1200 ${y}`}
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 className="display-text" style={{ fontSize: "clamp(3rem, 10vw, 5rem)", lineHeight: 1 }}>
            YOUR <span className="accent-yellow">5-PHASE</span> JOURNEY
          </h2>
        </div>

        <div style={{ width: "100%", overflowX: isMobile ? "visible" : "auto", overflowY: "visible", paddingBottom: 40, WebkitOverflowScrolling: "touch" }}>
          <div
            ref={timelineCanvasRef}
            style={{
              position: "relative",
              height: isMobile ? Math.max(450, numPhases * 135) : 550,
              minWidth: isMobile ? "100%" : Math.max(containerWidth, (numPhases - 1) * Math.max(220, (containerWidth - 280) / (numPhases - 1 || 1)) + 280),
              margin: "0 auto",
              padding: isMobile ? "0 20px" : "0 40px",
            }}
          >
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
                opacity: 0.1,
                filter: "blur(2px)",
              }}
              preserveAspectRatio="none"
            >
              <path
                ref={bgPathRef}
                d={generatePath()}
                fill="none"
                stroke="var(--border-strong)"
                strokeWidth="2"
              />
            </svg>

            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 2,
              }}
              preserveAspectRatio="none"
            >
              <path
                ref={pathRef}
                d={generatePath()}
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="4"
              />
            </svg>

            {PHASES.map((phase, i) => {
              let xPos, yPos, cardLeft, cardTop;
              const isTop = i % 2 === 0;

              if (isMobile) {
                const canvasHeight = Math.max(450, numPhases * 135);
                const step = (canvasHeight - 160) / (numPhases - 1 || 1);
                xPos = 12;
                yPos = i * step + 80;
                cardLeft = xPos + 24;
                cardTop = yPos - 55; 
              } else {
                const startOffsetX = 140;
                const endOffsetX = 140;
                const step = Math.max(220, (containerWidth - startOffsetX - endOffsetX) / (numPhases - 1 || 1));
                const computedWidth = (numPhases - 1) * step + startOffsetX + endOffsetX;
                const canvasWidth = Math.max(containerWidth, computedWidth);
                xPos = i * step + startOffsetX;
                yPos = 250; 
                cardLeft = xPos - 120; 
                cardTop = isTop ? yPos - 240 : yPos + 80;
              }

              return (
                <div key={phase.id} style={{ position: "absolute", zIndex: 5, left: 0, top: 0 }}>
                  <div
                    className="day-node"
                    style={{
                      position: "absolute",
                      left: xPos - 16,
                      top: yPos - 16,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--bg-primary)",
                      border: "4px solid var(--accent-primary)",
                      boxShadow: "0 0 20px var(--accent-primary)",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-primary)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.2)";
                      e.currentTarget.style.boxShadow = "0 0 35px var(--accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 0 20px var(--accent-primary)";
                    }}
                  >
                    {phase.id}
                  </div>

                  <div style={{ 
                    position: "absolute", 
                    left: isMobile ? xPos + 16 : cardLeft + 119, 
                    top: isMobile ? yPos - 1 : isTop ? yPos - 120 : yPos, 
                    width: isMobile ? 8 : 2, 
                    height: isMobile ? 2 : 120, 
                    background: "var(--border-strong)", 
                    zIndex: 1 
                  }} />
                  
                  <div
                    className="day-card"
                    style={{
                      position: "absolute",
                      zIndex: 10,
                      left: cardLeft,
                      top: cardTop,
                      width: isMobile ? "calc(100vw - 56px)" : 240,
                      height: isMobile ? 110 : 150,
                      maxWidth: 320,
                      background: "linear-gradient(135deg, rgba(30, 30, 35, 0.9) 0%, rgba(10, 10, 12, 0.95) 100%)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "var(--radius-xl)",
                      padding: isMobile ? "12px 16px" : "20px 24px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
                      transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.2)";
                      e.currentTarget.style.borderColor = "var(--accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    <h4 style={{ 
                      fontFamily: "var(--font-heading)", 
                      fontSize: isMobile ? 14 : 16, 
                      color: "var(--accent-primary)", 
                      marginBottom: isMobile ? 8 : 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      lineHeight: 1.2
                    }}>
                      {phase.title}
                    </h4>
                    <p style={{ 
                      color: "var(--text-secondary)", 
                      fontSize: isMobile ? 14 : 16, 
                      fontWeight: 400,
                      lineHeight: isMobile ? 1.2 : 1.4,
                      margin: 0
                    }}>
                      "{phase.subtitle}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
