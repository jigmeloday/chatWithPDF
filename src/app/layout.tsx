import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from '@/lib/utils';
import Provider from '@/components/provider';
import { Toaster } from '@/components/ui/toaster';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Otterly: chat with your PDFs",
  description: "Upload a PDF and ask it questions. Get answers with page citations, plus an API for your own apps.",
};

// Only the document shell lives here. Each route group — (auth), (public) and (private) — adds its own chrome.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body
            className={cn(geistSans.variable, geistMono.variable, 'antialiased min-h-screen font-sans grainy' )}
        >
        <Toaster />
        {children}
        </body>
      </Provider>
    </html>
  );
}
