import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { BracketProvider } from "@/lib/bracket/BracketProvider";
import { PredictionsProvider } from "@/lib/predictions/PredictionsProvider";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "World Cup Bracket Challenge",
  description: "Interactive circular tournament bracket with live scores, predictions, and global leaderboards.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "WC Bracket" },
  openGraph: {
    title: "World Cup Bracket Challenge",
    description: "Predict. Compete. Win.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#00A651",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${oswald.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <BracketProvider>
              <PredictionsProvider>
                <ServiceWorkerRegister />
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 pb-20 pt-6">{children}</main>
              </PredictionsProvider>
            </BracketProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
