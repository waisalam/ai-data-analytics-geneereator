import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Provider from "@/components/session-provider";
import AppShell from "@/components/app-shell";
import { report } from "process";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DataViz | Modern Data Analytics",
  description: "DataAI is an AI-powered CSV analytics platform that lets users upload CSV files and instantly get charts, insights, and answers through a conversational AI interface. Users can ask questions about their data in plain English and receive data-driven responses with visualizations. Pro plan includes unlimited CSV uploads, unlimited AI chat messages, and PDF report export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex min-w-[320px] flex-col bg-background text-foreground">
        <Provider>
          <AppShell>{children}</AppShell>
        </Provider>
      </body>
    </html>
  );
}
