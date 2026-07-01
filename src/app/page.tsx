"use client";

import { useState, useEffect } from "react";
import ComingSoonPage from "./coming-soon/ComingSoon";
import LandingPage from "./LandingPage";
import Footer from "@/components/Footer";
import GlassCubeScene from "@/components/coming-soon/GlassCubeScene";
import "./closed.css";

function RegistrationsClosed() {
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

export default function MarketingRoot() {
  const [isPreLaunch, setIsPreLaunch] = useState<boolean | null>(null);
  const [isClosed, setIsClosed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDates = () => {
      const launchDateStr = process.env.NEXT_PUBLIC_LAUNCH_DATE;
      const endDateStr = process.env.NEXT_PUBLIC_REG_END_DATE;
      const now = Date.now();
      
      const launchTarget = launchDateStr ? new Date(launchDateStr).getTime() : 0;
      const endTarget = endDateStr ? new Date(endDateStr).getTime() : Infinity;

      setIsPreLaunch(now < launchTarget);
      setIsClosed(now > endTarget);
    };

    checkDates();

    const interval = setInterval(checkDates, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isPreLaunch === null || isClosed === null) {
    return null;
  }

  if (isPreLaunch) {
    return <ComingSoonPage />;
  }

  if (isClosed) {
    return <RegistrationsClosed />;
  }

  return <LandingPage />;
}
