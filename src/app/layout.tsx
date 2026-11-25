import type { Metadata } from "next";
import { Fraunces, Jost } from "next/font/google";
import "./globals.css";
import { GettingStarted } from "@/components/GettingStarted";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const title = "Finity — Money lessons kids actually remember";
const description =
  "A classroom economy where students earn, save and grow tokens to build real financial habits.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Finity" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <GettingStarted />
      </body>
    </html>
  );
}
