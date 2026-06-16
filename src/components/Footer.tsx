import React from "react";
import "./footer.css";

export default function Footer() {
  return (
    <footer className="cs-footer">
      <div className="cs-minimal-footer">
        <div className="cs-footer-motto">
          <span className="cs-dot">•</span>
          Small steps. Big <span style={{ color: "var(--accent-primary, #007bff)" }}>progress</span>
          <span className="cs-dot">•</span>
        </div>
      </div>

      <div className="cs-footer-top">
        {/* Mobile-only location (renders at the very top of the footer) */}
        <a href="https://maps.google.com/?q=College+of+Engineering,+Kidangoor,+Kerala,+686583" target="_blank" rel="noopener noreferrer" className="cs-footer-location cs-mobile-only" style={{ textDecoration: 'none' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span style={{ transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = ''}>College of Engineering, Kidangoor, Kerala, 686583.</span>
        </a>

        <div className="cs-footer-col">
          <span className="cs-footer-label">Follow Us</span>
          <div className="cs-footer-links">
            <a href="https://www.linkedin.com/company/ieeesbcekidangoor/" className="cs-footer-link">LinkedIn</a>
            <a href="https://ieee.ce-kgr.org/" className="cs-footer-link">Web</a>
            <a href="https://www.instagram.com/ieeesbcekgr" className="cs-footer-link">Instagram</a>
          </div>
        </div>

        <div className="cs-footer-center">
          <a href="https://maps.google.com/?q=College+of+Engineering,+Kidangoor,+Kerala,+686583" target="_blank" rel="noopener noreferrer" className="cs-footer-location cs-desktop-only" style={{ textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span style={{ transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseOut={(e) => e.currentTarget.style.color = ''}>College of Engineering, Kidangoor, Kerala, 686583.</span>
          </a>
          <div className="cs-footer-logos">
            <img src="/C2C/ieee-sb-cek.png" alt="IEEE CE Kidangoor Student Branch" className="cs-footer-logo" />
            <img src="/C2C/ieee-wie.png" alt="IEEE WIE" className="cs-footer-logo" />
          </div>
        </div>

        <div className="cs-footer-col">
          <span className="cs-footer-label">For Enquiries</span>
          <div className="cs-footer-links">
            <span className="cs-footer-text">
              +91 75928 15138 <br />
              <span className="cs-contact-name">(Arya C Anish)</span>
            </span>
            <span className="cs-footer-text" style={{ marginTop: '0.25rem' }}>
              +91 88482 75740 <br />
              <span className="cs-contact-name">(A Ansila Safrin)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="cs-footer-copyright">
        © C2C 2026 <span style={{ color: "#009688" }}>•</span> IEEE WIE SBC CE Kidangoor & IEEE SBC CE Kidangoor
      </div>
    </footer>
  );
}
