import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vulpes lagopus",
  description: "Research First AI Video Script Generator",
  openGraph: {
    title: "Vulpes lagopus",
    description: "Research First AI Video Script Generator",
    url: "https://vulpes-lagopus.vercel.app",
    siteName: "Vulpes lagopus",
    images: [
      {
        url: "https://vulpes-lagopus.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vulpes lagopus",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vulpes lagopus",
    description: "Research First AI Video Script Generator",
    images: ["https://vulpes-lagopus.vercel.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
