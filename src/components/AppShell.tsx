"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       FINAL NUCLEAR FIX:
       - position: fixed + inset: 0 locks the app to the viewport.
       - height: 100dvh handles the mobile address bar perfectly in all browsers.
    */
    <div style={{
      position: "fixed",
      inset: 0,
      width: "100%",
      maxWidth: 430,
      margin: "0 auto",
      height: "100dvh",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zIndex: 1,
      /* 
         Purposeful downward shift: 
         Add an extra 10px buffer to ensure it NEVER shifts into the status bar area.
      */
      paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
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
  );
}
