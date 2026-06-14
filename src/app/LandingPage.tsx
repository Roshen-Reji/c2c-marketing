"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./landing.css";

const InteractiveRoadmap = dynamic(() => import("@/components/InteractiveRoadmap"), { ssr: false });
const CurriculumOrbit = dynamic(() => import("@/components/CurriculumOrbit"), { ssr: false });



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
            {isLightMode ? "☾" : "☀"}
          </button>
          {isRegistered ? (
            <span className="hide-mobile" style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '14px', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
              ✓ Registration Complete
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
        <span className="scroll-indicator-arrow">↓</span>
      </div>
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
            4 to 6 Weeks Online Training Program — B.Tech Students
          </p>

          <div className="hero-cta-group" style={{ marginTop: '4rem' }}>
            <Link href="/register" className="btn btn-cta btn-large" id="hero-register-btn">
              Register Now
            </Link>
            <a href="#phases" className="btn btn-secondary btn-large" id="hero-explore-btn">
              Explore Phases
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-info-card">
            <h2 className="hero-info-title">
              Your Bridge to the <span className="accent-blue">Industry</span>
            </h2>
            <div className="hero-info-text">
              <p style={{ marginBottom: '1rem' }}>
                A comprehensive online program by IEEE CEK WIE designed for B.Tech students in CSE, ECE, EEE, CE & EL.
              </p>
              <ul className="hero-info-list" style={{ listStyle: 'none', padding: 0 }}>
                <li><span style={{ color: 'var(--accent-primary)' }}>▹</span> <strong>Structured Learning:</strong> From basics to advanced concepts.</li>
                <li><span style={{ color: 'var(--accent-primary)' }}>▹</span> <strong>Mock Interviews:</strong> Real-world simulations with industry experts.</li>
                <li><span style={{ color: 'var(--accent-primary)' }}>▹</span> <strong>Professional Skills:</strong> GDs, resumes, and LinkedIn prep.</li>
              </ul>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">5</div>
              <div className="hero-stat-label">Phases</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">9+</div>
              <div className="hero-stat-label">Sessions</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">20+</div>
              <div className="hero-stat-label">Days</div>
            </div>
          </div>
        </div>
      </div>
      <ScrollIndicator />
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
              <span className="marquee-separator">◆</span>
            </span>
          ))}
        </div>
      </div>
      <div className="marquee-row">
        <div className="marquee-track animate-marquee-right">
          {items.map((item, i) => (
            <span className="marquee-item" key={`r-${i}`}>
              {item}
              <span className="marquee-separator">◆</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Sections removed in favor of InteractiveRoadmap and CurriculumOrbit components

function FeesSection() {
  const ref = useScrollReveal();
  const IS_EARLY_BIRD = true; // Toggle for early bird pricing

  return (
    <section className="fees-section" id="fees" ref={ref}>
      <div className="container">
        <div className="animate-reveal" style={{ textAlign: "center", marginBottom: "var(--space-16)" }}>
          <p className="section-label" style={{ textAlign: "center" }}>Investment</p>
          <h2
            className="section-title"
            style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto var(--space-6)" }}
          >
            One <span className="accent-blue">Program</span>, Complete <span className="accent-blue">Transformation</span>
          </h2>
        </div>

        <div className="fees-card animate-reveal">
          <span className="badge badge-green fees-badge">Limited Seats</span>
          <div className="fees-price" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {IS_EARLY_BIRD ? (
              <>
                <div style={{ fontSize: "1rem", textDecoration: "line-through", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <span>Non-IEEE: ₹499</span>
                  <span>IEEE: ₹399</span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "0.5rem" }}>
                  <span>₹399 <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>(Non-IEEE)</span></span>
                  <span style={{ fontSize: "2rem", color: "var(--text-muted)", margin: "0 0.5rem" }}>/</span>
                  <span style={{ color: "var(--accent-cyan)", fontSize: "3rem", fontWeight: 900 }}>₹299 <span style={{ fontSize: "1.2rem", color: "var(--accent-cyan)" }}>(IEEE)</span></span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--accent-blue)", fontWeight: "bold", marginTop: "0.5rem" }}>Early Bird Pricing Active!</div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: "0.5rem" }}>
                <span>₹499 <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>(Non-IEEE)</span></span>
                <span style={{ fontSize: "2rem", color: "var(--text-muted)", margin: "0 0.5rem" }}>/</span>
                <span>₹399 <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>(IEEE)</span></span>
              </div>
            )}
            <div className="fees-price-sub" style={{ marginTop: "1rem" }}>One-time payment • Full access</div>
          </div>
          <p className="fees-description">
            Get complete access to all 5 phases, live sessions, hands-on tasks,
            mock interviews, and your completion certificate — all for less than
            the cost of a textbook.
          </p>
          <ul className="fees-features">
            {FEES_FEATURES.map((feature, i) => (
              <li key={i}>
                <span className="fees-check">✓</span>
                {feature}
              </li>
            ))}
            <li>
              <span className="fees-check">✓</span>
              <strong>100% REFUND</strong>
            </li>
            <li>
              <span className="fees-check">✓</span>
              <strong>100% SCHOLARSHIP AVAILABLE*</strong>
            </li>
          </ul>
          <Link href="/register" className="btn btn-primary btn-large w-full" id="fees-register-btn">
            Register Now
          </Link>
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  const ref = useScrollReveal();

  return (
    <section className="footer-cta" ref={ref}>
      <div className="container">
        <div className="animate-reveal">
          <h2 className="footer-cta-title">
            Start Your
            <br />
            Journey
          </h2>
          <p className="footer-cta-sub">
            Don&apos;t wait until placements are around the corner. Start preparing now and
            be the candidate everyone wants to hire.
          </p>
          <Link href="/register" className="btn btn-primary btn-large" id="footer-register-btn">
            Register for C2C
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-motto-wrapper">
          <div className="footer-motto">
            <span className="footer-dot">•</span>
            SMALL <span className="accent-blue">STEPS</span> PAVE THE WAY
            <span className="footer-dot">•</span>
          </div>
        </div>

        <div className="footer-top">
          <div className="footer-col">
            <span className="footer-label">Navigate</span>
            <div className="footer-links">
              <a href="#phases" className="footer-link">Phases</a>
              <a href="#features" className="footer-link">Features</a>
              <a href="#fees" className="footer-link">Fees</a>
              <Link href="/register" className="footer-link">Register</Link>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-label">Follow Us</span>
            <div className="footer-links">
              <a href="https://www.linkedin.com/company/ieeesbcekidangoor/" className="footer-link">LinkedIn</a>
              <a href="https://ieee.ce-kgr.org/" className="footer-link">Web</a>
              <a href="https://www.instagram.com/ieeesbcekgr?igsh=MWczc3o1d21hdGxzcg==" className="footer-link">Instagram</a>
            </div>
          </div>

          <div className="footer-col">
            <span className="footer-label">For Enquiries</span>
            <div className="footer-links">
              <span className="footer-text">
                +91 7592 815 138 <br/>
                <span className="footer-contact-name">(Arya C Anish)</span>
              </span>
              <span className="footer-text" style={{ marginTop: '0.25rem' }}>
                +91 79071 97146 <br/>
                <span className="footer-contact-name">(Nidha Najeeb)</span>
              </span>
              <span className="footer-text" style={{ marginTop: '0.25rem' }}>
                +91 884 827 5740 <br/>
                <span className="footer-contact-name">(A Ansila Safrin)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-logos" style={{ display: 'flex', gap: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <img src="/ieee-sb-cek.png" alt="IEEE CE Kidangoor Student Branch" className="footer-logo-img" />
            <img src="/ieee-wie.png" alt="IEEE WIE" className="footer-logo-img" />
          </div>
          <div className="footer-copyright">
            © 2026 Campus 2 Corporate.
          </div>
        </div>
      </div>
    </footer>
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

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <Header />
      <HeroSection />
      <div className="section-divider" />
      <MarqueeSection />
      <div className="section-divider" />
      <div id="phases"><InteractiveRoadmap /></div>
      <div className="section-divider" />
      <div id="features"><CurriculumOrbit /></div>
      <div className="section-divider" />
      <FeesSection />
      <FooterCTA />
      <Footer />
    </main>
  );
}
