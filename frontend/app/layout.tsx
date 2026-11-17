import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CityProvider } from "@/context/CityContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityModal from "@/components/layout/CityModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketPass — Cinema & Event Ticket Booking",
  description: "Find movies, browse cinema venues, pick seats in real-time, and reserve your tickets instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <AuthProvider>
          <CityProvider>
            <Navbar />
            <CityModal />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </CityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
