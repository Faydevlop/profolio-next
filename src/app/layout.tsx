import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Fayis Namiyath — Best Web Developer & Designer in Kerala, India",
    template: "%s | Fayis Namiyath",
  },

  description:
    "Fayis Namiyath is a top-rated full-stack web developer and UI/UX designer from Kerala, India. Specializing in React, Next.js, Node.js, and modern web development. Available for freelance projects and collaborations.",

  keywords: [
    "Fayis Namiyath",
    "Fayis",
    "Namiyath",
    "best web developer in Kerala",
    "web developer Kerala",
    "web designer Kerala",
    "freelance web developer India",
    "full-stack developer Kerala",
    "React developer Kerala",
    "Next.js developer India",
    "UI/UX designer Kerala",
    "frontend developer Kerala",
    "best web designer India",
    "web development services Kerala",
    "hire web developer Kerala",
    "portfolio Fayis Namiyath",
    "top developer Kerala",
    "Node.js developer India",
    "MERN stack developer Kerala",
  ],

  authors: [{ name: "Fayis Namiyath", url: siteUrl }],
  creator: "Fayis Namiyath",
  publisher: "Fayis Namiyath",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Fayis Namiyath — Portfolio",
    title:
      "Fayis Namiyath — Best Web Developer & Designer in Kerala, India",
    description:
      "Top-rated full-stack web developer and UI/UX designer from Kerala, India. Expert in React, Next.js, Node.js, and modern web technologies.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fayis Namiyath — Web Developer & Designer Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Fayis Namiyath — Best Web Developer & Designer in Kerala, India",
    description:
      "Top-rated full-stack web developer and UI/UX designer from Kerala. Expert in React, Next.js, Node.js.",
    images: ["/og-image.png"],
  },

  alternates: {
    canonical: "/",
  },

  verification: {
    // Add your Google Search Console verification code here
    // google: "your-google-verification-code",
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${display.variable} antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
