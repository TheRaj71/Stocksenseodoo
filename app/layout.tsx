import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockSense - Inventory Management System",
  description: "Powerful inventory management system for multi-warehouse operations",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#2563eb',
              colorBackground: '#ffffff',
              colorInputBackground: '#ffffff',
              colorInputText: '#1f2937',
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}