"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
import "./landing.css";

const InteractiveRoadmap = dynamic(() => import("@/components/InteractiveRoadmap"), { ssr: false });
const CurriculumOrbit = dynamic(() => import("@/components/CurriculumOrbit"), { ssr: false });
const GlassCubeScene = dynamic(() => import("@/components/coming-soon/GlassCubeScene"), { ssr: false });



const MARQUEE_ITEMS = [
  "Resume Building",
  "Aptitude Training",
  "Technical Core",
  "Mock Interviews",
  "Professional Skills",
  "LinkedIn Optimization",
  "Group Discussions",
  "Domain Selection",
  "Communication",
  "Placement Prep",
  "Core Subjects",
  "Self Introduction",
];

const FEES_FEATURES = [
  "Access to all 5 phases",
  "Live interactive sessions",
  "Hands-on tasks & projects",
  "Mock interview sessions",
  "Personalized evaluator feedback",
  "Leaderboard & gamification",
  "Completion certificate",
  "Lifetime access to materials",
];

/* ===== Inline SVG Icons ===== */

function SvgSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function SvgMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SvgChevronDown({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SvgCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SvgDiamond() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L22 12L12 22L2 12Z" />
    </svg>
  );
}

function SvgBook() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function SvgMic() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
      <path d="M19 10v2a7 7 0 01-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SvgUsers() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function SvgChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* ===== Scroll Reveal Hook ===== */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const el = ref.current;
    if (el) {
      const children = el.querySelectorAll(".animate-reveal");
      children.forEach((child) => observer.observe(child));
      // also observe the element itself
      if (el.classList.contains("animate-reveal")) {
        observer.observe(el);
      }
    }

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ===== Components ===== */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("c2c_registered") === "true") {
        setIsRegistered(true);
      }
    }

    // Explicitly enforce dark mode on load
    document.body.classList.remove("theme-light");
    setTimeout(() => setIsLightMode(false), 0);

    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    if (isLightMode) {
      document.body.classList.remove("theme-light");
      setIsLightMode(false);
    } else {
      document.body.classList.add("theme-light");
      setIsLightMode(true);
    }
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`} id="header">
      <div className="container header-inner">
        <Link href="/" className="header-logo" id="logo">
          C<span>2</span>C
        </Link>

        <nav className={`header-nav ${mobileOpen ? "open" : ""}`} id="main-nav">
          <a href="#phases" className="header-nav-link" onClick={() => setMobileOpen(false)}>
            Phases
          </a>
          <a href="#features" className="header-nav-link" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#fees" className="header-nav-link" onClick={() => setMobileOpen(false)}>
            Fees
          </a>

          {isRegistered ? (
            <span className="hide-desktop" style={{ marginTop: 'var(--space-2)', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', fontSize: '12px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Registration Complete
            </span>
          ) : (
            <Link href="/register" className="btn btn-primary hide-desktop" style={{ marginTop: 'var(--space-2)' }} onClick={() => setMobileOpen(false)}>
              Register
            </Link>
          )}
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            id="theme-toggle"
            aria-label="Toggle theme"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            {isLightMode ? <SvgMoon /> : <SvgSun />}
          </button>
          {isRegistered ? (
            <span className="hide-mobile" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '14px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <SvgCheck /> Registration Complete
            </span>
          ) : (
            <Link href="/register" className="btn btn-primary hide-mobile" id="nav-register-btn">
              Register
            </Link>
          )}
          <button
            className="mobile-menu-btn hide-desktop"
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

function ScrollIndicator() {
  return (
    <div className="scroll-indicator">
      <div className="scroll-indicator-circle">
        <div className="scroll-indicator-text">
          <svg viewBox="0 0 100 100">
            <defs>
              <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            </defs>
            <text>
              <textPath xlinkHref="#circlePath">
                SCROLL DOWN • EXPLORE MORE • SCROLL DOWN •&nbsp;
              </textPath>
            </text>
          </svg>
        </div>
        <span className="scroll-indicator-arrow">
          <SvgChevronDown size={24} />
        </span>
      </div>
      <span className="scroll-indicator-label">Scroll to explore</span>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero-grid-bg" />

      <div className="container">
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="line">
              <span>CAMPUS</span>
              <span className="accent-2">2</span>
            </span>
            <span className="line">
              <span>CORPORATE</span>
            </span>
          </h1>

          <p className="hero-subtitle">
            A multi-phase online placement readiness program to help B.Tech students,
            to secure internships and job opportunities.
          </p>

          {/* Stats Bar — repositioned between subtitle and CTAs */}
          <div className="hero-stats-inline">
            <div className="hero-stat-inline">
              <span className="stat-number">5</span>
              <span className="stat-label">Phases</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-inline">
              <span className="stat-number">8+</span>
              <span className="stat-label"> Live Mentorship Sessions</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-inline">
              <span className="stat-number">60+</span>
              <span className="stat-label">Days</span>
            </div>
          </div>

          <div className="hero-cta-group" style={{ marginTop: '2rem' }}>
            <Link href="/register" className="btn btn-cta btn-large" id="hero-register-btn">
              Register Now
            </Link>
            <a href="#phases" className="btn btn-secondary btn-large" id="hero-explore-btn">
              Explore Phases
            </a>
          </div>
        </div>

        <div className="hero-right">
          <GlassCubeScene />
        </div>
      </div>
      <ScrollIndicator />
    </section >
  );
}

function BridgeSection() {
  const ref = useScrollReveal();

  return (
    <section className="bridge-section" id="bridge" ref={ref}>
      <div className="container bridge-container animate-reveal">
        <h2 className="bridge-title">
          Your Bridge to the <span className="accent-blue">Industry</span>
        </h2>
        <p className="bridge-subtitle">
          A comprehensive, multi-phase online placement readiness program by IEEE WIE SB CE Kidangoor in collaboration with IEEE SB CE Kidangoor, designed for B.Tech students.
        </p>

        <div className="bridge-features">
          <div className="bridge-feature-card">
            <div className="bridge-feature-icon"><SvgBook /></div>
            <div className="bridge-feature-title">End-to-End Placement Preparation</div>
            <div className="bridge-feature-desc">Participants receive comprehensive training covering every stage of the recruitment process</div>
          </div>

          <div className="bridge-feature-card">
            <div className="bridge-feature-icon"><SvgUsers /></div>
            <div className="bridge-feature-title">Learn Directly from Industry Professionals</div>
            <div className="bridge-feature-desc">Gain practical insights from industry professionals ,to understand recruitment processes, employer expectations, career opportunities, and interview strategies.</div>
          </div>

          <div className="bridge-feature-card">
            <div className="bridge-feature-icon"><SvgMic /></div>
            <div className="bridge-feature-title">Performance Tracking & Recognition</div>
            <div className="bridge-feature-desc">Regular assessments, leaderboards, and feedback help participants measure their progress, stay motivated, and continuously improve throughout the program.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section className="marquee-section" id="marquee">
      <div className="marquee-row">
        <div className="marquee-track animate-marquee-left">
          {items.map((item, i) => (
            <span className="marquee-item" key={`l-${i}`}>
              {item}
              <span className="marquee-separator"><SvgDiamond /></span>
            </span>
          ))}
        </div>
      </div>
      <div className="marquee-row">
        <div className="marquee-track animate-marquee-right">
          {items.map((item, i) => (
            <span className="marquee-item" key={`r-${i}`}>
              {item}
              <span className="marquee-separator"><SvgDiamond /></span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Sections removed in favor of InteractiveRoadmap and CurriculumOrbit components



function FooterCTA() {
  const ref = useScrollReveal();

  return (
    <section className="footer-cta" id="fees" ref={ref} style={{ padding: "100px 20px" }}>
      <div className="container">
        <div className="animate-reveal" style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 className="footer-cta-title">
            Start Your
            <br />
            Journey
          </h2>
          <p className="footer-cta-sub" style={{ maxWidth: 600, margin: "0 auto" }}>
            Don&apos;t wait until placements are around the corner. Start preparing now and
            be the candidate everyone wants to hire.
          </p>
        </div>

        <div className="fees-price-cards animate-reveal" style={{ marginTop: "var(--space-10)", marginBottom: "var(--space-16)" }}>
          {/* IEEE Members Tier */}
          <div className="fees-tier-card featured" style={{ padding: "var(--space-10) var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 className="fees-tier-label">IEEE Members</h3>
            <div className="fees-tier-price" style={{ margin: 0 }}>
              ₹299
            </div>
          </div>

          {/* Non-IEEE Members Tier */}
          <div className="fees-tier-card" style={{ padding: "var(--space-10) var(--space-6)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 className="fees-tier-label">Non-IEEE Members</h3>
            <div className="fees-tier-price" style={{ margin: 0 }}>
              ₹399
            </div>
          </div>
        </div>

        <div className="animate-reveal" style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <div style={{
            display: "inline-flex",
            flexDirection: "column",
            gap: "12px",
            background: "rgba(13, 0, 255, 0.19)",
            border: "1px solid  rgba(13, 0, 255, 0.2)",
            padding: "24px 48px",
            borderRadius: "var(--radius-xl)",
            boxShadow: "0 0 30px  rgba(13, 0, 255, 0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <h4 style={{ color: "#0065ff", margin: 0, fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <SvgCheck /> 100% Refund
            </h4>
            <h4 style={{ color: "#0065ff", margin: 0, fontSize: "1.25rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
              <SvgCheck /> 100% Scholarship<br /> Available
            </h4>
          </div>
        </div>

        <div className="animate-reveal" style={{ textAlign: "center" }}>
          <Link href="/register" className="btn btn-primary btn-large" id="footer-register-btn">
            Register for C2C Now
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ===== Main Page ===== */
export default function LandingPage() {
  /* Global scroll reveal observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".animate-reveal").forEach((el) => {
      observer.observe(el);
    });

    // Robust refresh for GSAP ScrollTrigger to prevent pinning glitches
    let count = 0;
    const interval = setInterval(() => {
      ScrollTrigger.refresh();
      count++;
      if (count > 5) clearInterval(interval);
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return (
    <main>
      <Header />
      <HeroSection />
      <div className="section-divider" />
      <BridgeSection />
      <div className="section-divider" />
      <MarqueeSection />
      <div className="section-divider" />
      <div id="phases"><InteractiveRoadmap /></div>
      <div className="section-divider" />
      <CurriculumOrbit />

      <FooterCTA />
      <Footer />
    </main>
  );
}
