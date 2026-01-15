import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { LayoutWrapper } from "./components/LayoutWrapper";
import DemoBanner from "./components/ui/DemoBanner";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "🌸 ✨ Andrea's Project Manager ✨ 🌸",
  description: "A beautiful, personal project management system for organizing your life across different areas",
  keywords: ["project management", "task tracking", "productivity", "personal organization"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDemo = process.env.NEXT_PUBLIC_IS_DEMO === 'true';

  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className={`${plusJakarta.className} antialiased`}>
        {isDemo && <DemoBanner />}
        <ThemeProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
