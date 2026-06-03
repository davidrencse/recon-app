import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "../components/AppShell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-dm-sans",
});

/* 
   THE FORCED MOBILE VIEWPORT:
   - initialScale 1.0 + maximumScale 1.0 + userScalable false
   - This is the most aggressive way to prevent Safari from zooming out.
*/
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#131313",
};

export const metadata: Metadata = {
  title: "Recon",
  description: "See your city, as it is, right now.",
  manifest: "/manifest.json",
  /* 
     iOS APP ICON FIX:
     - iOS REQUIRES PNG for the home screen icon. SVG will not show up.
     - I am pointing to icon-192.png and apple-touch-icon.png.
  */
  icons: {
    icon: [
      { url: "/next.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recon",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
