"use client";

import { useState, useEffect } from "react";
import ComingSoonPage from "./coming-soon/ComingSoon";
import LandingPage from "./LandingPage";

export default function MarketingRoot() {
  const [isPreLaunch, setIsPreLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const launchDateStr = process.env.NEXT_PUBLIC_LAUNCH_DATE;
    const targetDate = launchDateStr ? new Date(launchDateStr).getTime() : 0;
    
    if (Date.now() < targetDate) {
      setIsPreLaunch(true);
    } else {
      setIsPreLaunch(false);
    }

    const interval = setInterval(() => {
      if (targetDate > 0 && Date.now() >= targetDate) {
        setIsPreLaunch(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isPreLaunch === null) {
    return null;
  }

  if (isPreLaunch) {
    return <ComingSoonPage />;
  }

  return <LandingPage />;
}
