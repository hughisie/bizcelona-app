import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Bizcelona | Exclusive Business Community for Barcelona Entrepreneurs & Executives",
  description: "Join Barcelona's premier invite-only business community for entrepreneurs, senior executives, business owners, and digital nomads. Connect with like-minded professionals, collaborate on ventures, and grow your network in Spain's most vibrant business hub.",
  keywords: [
    "Barcelona business community",
    "Barcelona entrepreneurs network",
    "Barcelona digital nomad community",
    "Barcelona business executives",
    "Barcelona startup community",
    "Barcelona business owners network",
    "Spain digital nomad visa community",
    "Barcelona professional networking",
    "Barcelona coworking community",
    "Barcelona business WhatsApp group",
    "Barcelona entrepreneur meetup",
    "Barcelona business networking",
    "Barcelona C-level executives",
    "Barcelona senior professionals",
    "Barcelona freelancer community",
    "Barcelona expat business",
    "Barcelona venture capital network",
    "Barcelona angel investors",
    "Barcelona business collaboration",
  ].join(", "),
  authors: [{ name: "Bizcelona" }],
  creator: "Bizcelona",
  publisher: "Bizcelona",
  category: "Business Networking",
  openGraph: {
    title: "Bizcelona | Barcelona's Exclusive Community for Entrepreneurs & Business Leaders",
    description: "Connect with Barcelona's top entrepreneurs, executives, and digital nomads. Invite-only business community focused on collaboration, growth, and meaningful partnerships.",
    url: "https://bizcelona.com",
    siteName: "Bizcelona",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bizcelona - Barcelona Business Community",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bizcelona | Barcelona's Premier Business Community",
    description: "Join Barcelona's exclusive network of entrepreneurs, executives, and digital nomads. Curated. Collaborative. Connected.",
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
  alternates: {
    canonical: "https://bizcelona.com",
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/apple-touch-icon.png",
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-inter text-navy bg-off-white antialiased`}>
        <GoogleAnalytics measurementId="G-88GKT7X9KG" />
        {children}
      </body>
    </html>
  );
}
