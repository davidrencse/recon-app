"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       THE ROCK-SOLID MOBILE LOCK:
       - position: fixed + inset: 0 locks the app to the visual viewport.
       - height: 100% inside fixed is the safest way to prevent Safari UI shifts.
       - overflow: hidden prevents the entire app from being "pulled up".
    */
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      maxWidth: 430,
      margin: "0 auto",
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
