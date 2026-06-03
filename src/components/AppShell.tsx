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
       - Since body is position: fixed, AppShell just fills 100% of it.
       - This eliminates double-fixed conflicts on Safari.
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
