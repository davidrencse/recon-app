"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      /* 
         "ZOOMED IN" FIX: 
         - Remove maxWidth on small mobile screens to let it fill the space.
         - On desktop, keep the 430px container for mobile-app preview.
      */
      maxWidth: "100%", 
      margin: "0 auto",
      height: "100dvh",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1,
      paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)",
    }}>
      {/* 
          Media query style simulation:
          Using a wrapper to enforce 430px max-width ONLY if screen is wider than mobile.
      */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 430,
        margin: "0 auto",
        minHeight: 0,
        position: "relative",
      }}>
        <div style={{ 
          flex: 1, 
          minHeight: 0, 
          display: "flex", 
          flexDirection: "column", 
          overflow: "hidden",
          position: "relative",
        }}>
          {children}
        </div>
        
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
