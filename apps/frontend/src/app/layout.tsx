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
  title: "Kraken - Naval Gaming Empire",
  description: "Join the legendary fleet. Cloud-native gaming platform with Age of Sail aesthetics and modern brutalist design.",
  icons: {
    icon: '/uws-logo.png',
    shortcut: '/uws-logo.png',
    apple: '/uws-logo.png',
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
