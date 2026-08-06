import type { Metadata, Viewport } from "next";
import { Archivo_Black, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const display = Archivo_Black({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "点讯",
  description: "加密快讯与交易参考点位",
  applicationName: "点讯",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "点讯",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E8ECF1" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F14" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${plexSans.variable} ${plexMono.variable} ${display.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
