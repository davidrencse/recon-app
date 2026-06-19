"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { ThemeProvider } from "../lib/theme";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const showNav = !isLanding;

  return (
    <ThemeProvider>{(
    /* 
       THE REDDIT-PROVEN SHELL:
       - Since html/body is 100vh, this 100% height container 
         will fill the exact true screen height.
    */
    <div style={{
      width: "100%",
      height: "100%",
      background: "var(--bg)",
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
    )}</ThemeProvider>
  );
}
