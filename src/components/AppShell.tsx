"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       THE TRUE FULLSCREEN LOCK:
       - width: 100vw ensures it completely fills the Safari viewport.
       - No maxWidth constraints, so iOS doesn't try to scale it differently.
    */
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100vw",
      height: "100%",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1,
    }}>
      {/* 
          Main Content Container:
          - padding-top handles notches.
          - flex: 1 ensures it fills exactly the space above the navbar.
      */}
      <div style={{ 
        flex: 1, 
        minHeight: 0, 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden",
        paddingTop: "env(safe-area-inset-top, 0px)",
        position: "relative",
      }}>
        {children}
      </div>
      
      {showNav && <BottomNav />}
    </div>
  );
}
