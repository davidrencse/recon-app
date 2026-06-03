"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       NATURAL FLOW SHELL:
       - No fixed or absolute positioning on the root.
       - Uses display: flex to fill the 100dvh body naturally.
       - This prevents Safari from "guessing" the height and shifting the UI.
    */
    <div style={{
      width: "100%",
      height: "100%",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
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
        paddingTop: "max(env(safe-area-inset-top), 20px)",
        position: "relative",
      }}>
        {children}
      </div>
      
      {showNav && <BottomNav />}
    </div>
  );
}
