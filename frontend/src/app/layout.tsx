import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StayEase Tirupati - Comfortable Stays Near Tirumala Temple",
  description: "Book comfortable and affordable rooms in Tirupati and Tirumala. Easy access to Venkateswara Temple with 24/7 assistance. Best hotel booking for pilgrims.",
  keywords: "Tirupati hotels, Tirumala accommodation, temple stay, pilgrimage stay, Tirupati rooms, affordable hotels Tirupati",
  openGraph: {
    title: "StayEase Tirupati - Comfortable Stays Near Tirumala Temple",
    description: "Book comfortable and affordable rooms in Tirupati. Easy access to Venkateswara Temple.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
