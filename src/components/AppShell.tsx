"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       CORE FIX: Use position fixed to lock the app container 
       This prevents the mobile address bar from "pulling up" or shifting the UI.
    */
    <div style={{
      position: "fixed",
      top: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      height: "100%",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1,
    }}>
      {/* 
          Safe Area Wrapper:
          Handles notches and ensures content is centered within the fixed container.
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
