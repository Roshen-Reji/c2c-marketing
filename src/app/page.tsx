"use client";

import Image from "next/image";
import "./closed.css";
import { useEffect } from "react";
import Footer from "@/components/Footer";
import GlassCubeScene from "@/components/coming-soon/GlassCubeScene";

export default function RegistrationsClosed() {
  useEffect(() => {
    // Explicitly enforce dark mode for this page
    document.body.style.backgroundColor = '#0f0f0f';
    return () => {
      document.body.style.backgroundColor = '';
    }
  }, []);

  return (
    <div className="closed-page-container">
      {/* Watermark Background */}
      <div className="bg-watermark">
        <h1>Campus 2</h1>
        <h1 style={{ marginTop: '-0.2em' }}>Corporate</h1>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="title-section">
          <h2 className="title-main">
            Campus<span className="accent-blue-title">2</span>
          </h2>
          <h2 className="title-main">Corporate</h2>
          <div className="subtitle">
            Where learning ends, <span className="accent-blue-text">the real journey</span> begins.
          </div>
        </div>

        <div className="center-graphics">
          <div className="chair-svg">
            <GlassCubeScene />
          </div>
          
          <div className="divider-vertical"></div>
          
          <div className="closed-text-section">
            <div className="closed-label">Registrations</div>
            <h2 className="closed-huge">Closed</h2>
            <div className="closed-thanks">Thank you.</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ zIndex: 10, position: 'relative' }}>
        <Footer />
      </div>
    </div>
  );
}
