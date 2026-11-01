import type { Metadata, Viewport } from "next";
import { Great_Vibes, Petit_Formal_Script, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";

const script = Great_Vibes({ weight: "400", subsets: ["latin"], variable: "--font-script" });
const formal = Petit_Formal_Script({ weight: "400", subsets: ["latin"], variable: "--font-formal" });
const serif = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});
const caps = Cinzel({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-caps" });

export const metadata: Metadata = {
  // Lets the share image resolve to a full URL in link previews
  metadataBase: new URL("https://kavindi-nalina-weddinginvitation.vercel.app"),
  title: "Kavindi & Nalina — Wedding Invitation",
  description: "Thursday, 17 December 2026 · Sangam Banquet Hall, ITC Ratnadipa, Colombo",
  openGraph: {
    title: "Kavindi & Nalina — Wedding Invitation",
    description: "Thursday, 17 December 2026 · Sangam Banquet Hall, ITC Ratnadipa, Colombo",
    type: "website",
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 1200, alt: "Kavindi & Nalina — Wedding Invitation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kavindi & Nalina — Wedding Invitation",
    description: "Thursday, 17 December 2026 · Sangam Banquet Hall, ITC Ratnadipa, Colombo",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  colorScheme: "light",
  themeColor: "#cfe0e3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${formal.variable} ${serif.variable} ${caps.variable}`}>
      <body>{children}</body>
    </html>
  );
}
