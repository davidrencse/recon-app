"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = pathname !== "/";

  return (
    <div style={{
      width: "100%",
      maxWidth: 430,
      height: "100dvh",
      margin: "0 auto",
      background: "#131313",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {children}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}
