import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Providers } from "@/components/Providers";

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

export const metadata: Metadata = {
  title: "Kraken - Naval Gaming Empire",
  description: "Join the legendary fleet. Cloud-native gaming platform with Age of Sail aesthetics and modern brutalist design.",
  icons: {
    icon: 'https://i.imgur.com/VwfpogC.png',
    shortcut: 'https://i.imgur.com/VwfpogC.png',
    apple: 'https://i.imgur.com/VwfpogC.png',
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
        className={`${inter.variable} ${jetBrainsMono.variable} ${cinzel.variable} ${crimsonText.variable} antialiased`}
      >
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
