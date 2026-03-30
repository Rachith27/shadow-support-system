import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shadow Support System — Safe Space",
  description:
    "A safe, anonymous space to share how you're feeling. No account, no name, no judgment.",
  keywords: ["mental health", "anonymous", "safe space", "support", "youth"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FDFDFF]">
        <Navbar />
        <main className="flex-1 pt-16 md:pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
