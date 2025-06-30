import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cinzel, Crimson_Text, Cedarville_Cursive } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { Providers } from "@/components/Providers";
import ClientLayout from "@/components/ClientLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const cedarvilleCursive = Cedarville_Cursive({
  variable: "--font-cedarville-cursive",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "UWS",
  description: "Join the legendary UWS fleet of Privateers. Your Letter of Marque awaits!",
  keywords: ["gaming", "naval", "age of sail", "UWS", "United We Stand", "privateers", "fleet", "maritime", "Letter of Marque"],
  authors: [{ name: "UWS Gaming" }],
  creator: "UWS Gaming",
  publisher: "UWS Gaming",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' }
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      }
    ]
  },
  openGraph: {
    title: "UWS - United We Stand",
    description: "Join the legendary UWS fleet of Privateers. Your Letter of Marque awaits!",
    url: "https://krakengaming.org",
    siteName: "UWS Gaming",
    images: [
      {
        url: "https://krakengaming.org/uws-logo-og.png",
        width: 1200,
        height: 630,
        alt: "UWS - United We Stand",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UWS - United We Stand",
    description: "Join the legendary UWS fleet of Privateers. Your Letter of Marque awaits!",
    images: ["https://krakengaming.org/uws-logo-og.png"],
    creator: "@uwsgaming",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="theme-color" content="#1e3a8a" />
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google tag (gtag.js) */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-TY1LNK9ELH"></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-TY1LNK9ELH');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${cinzel.variable} ${crimsonText.variable} ${cedarvilleCursive.variable} antialiased`}
      >
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
