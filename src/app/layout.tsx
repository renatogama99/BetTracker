import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BankrollPro — Sports Betting Tracker",
  description:
    "Track your bets, manage your bankroll, and improve your betting performance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#0a0a14]`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
