import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  // The public site ships its own trimmed Inter, so this full one is not preloaded for every page.
  preload: false,
  variable: '--font-inter',
});

const TITLE = "Bizcelona | Building wealth through community";
const DESCRIPTION =
  "Where Barcelona's founders and professionals collaborate, share insight, and scale together. A membership community by invitation, free during the relaunch.";

export const metadata: Metadata = {
  metadataBase: new URL("https://bizcelona.com"),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Bizcelona" }],
  creator: "Bizcelona",
  publisher: "Bizcelona",
  category: "Business community",
  openGraph: {
    title: "Bizcelona | Building wealth through community",
    description:
      "Barcelona's business community for founders, independents and senior business people. Members help each other. By invitation, free during the relaunch.",
    url: "https://bizcelona.com",
    siteName: "Bizcelona",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bizcelona logo in off-white on navy, with the line Curated. Collaborative. Connected.",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bizcelona | Building wealth through community",
    description:
      "Barcelona's business community for founders, independents and senior business people. By invitation, free during the relaunch.",
    images: ["/images/og-image.jpg"],
    creator: "@bizcelona",
  },
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
  icons: {
    icon: [{ url: "/images/favicon-48.png", sizes: "48x48", type: "image/png" }],
    apple: "/images/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a202c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className={`${inter.className} font-inter text-navy bg-off-white antialiased`}>
        <GoogleAnalytics measurementId="G-88GKT7X9KG" />
        {children}
      </body>
    </html>
  );
}
