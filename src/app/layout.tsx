import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock★Star — Market Simulation",
  description: "Compete against an AI trader. Learn how real markets work.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}