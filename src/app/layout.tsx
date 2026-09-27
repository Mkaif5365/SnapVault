import type { Metadata } from "next";
import { Geist, Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Schibsted_Grotesk({
  variable: "--font-display-face",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SnapVault | The disposable camera for your event",
  description:
    "Guests scan a code and shoot a limited roll from their phone. Nobody sees a photo until your reveal time.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SnapVault",
  },
  openGraph: {
    title: "SnapVault",
    description: "Everyone shoots. Nobody peeks. The whole roll develops at once.",
    images: ["/shots/wedding-van.jpg"],
  },
};

export const viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}>
      <body className="grain antialiased">
        {children}
      </body>
    </html>
  );
}
