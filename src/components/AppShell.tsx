"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    /* 
       RECOMMENDED PWA FIX:
       Simplified app wrapper using standard flex layout.
       Filling 100% of the phone screen natively.
    */
    <div style={{
      width: "100%",
      minHeight: "100dvh",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      margin: "0 auto",
      /* 
         On desktop, we maintain the 430px mobile preview.
         On mobile, it fills the width.
      */
      maxWidth: 430, 
    }}>
      {/* Main content area fills all space above navigation */}
      <main style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        minHeight: 0,
        width: "100%",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        {children}
      </main>
      
      {showNav && <BottomNav />}
    </div>
  );
}
