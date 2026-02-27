import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitCoach — Science-Backed Training",
  description: "Personalized, science-backed workout programs. Know exactly what to do every day.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#050505" }}>
      <body
        className="antialiased"
        style={{ backgroundColor: "#050505", color: "#ffffff", minHeight: "100vh" }}
      >
        {children}
      </body>
    </html>
  );
}
