import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer"; 
import Provider from "@/components/session-provider";

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
  description: "A minimalist data analytics platform with powerful CSV analysis and visualization.",
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
          <Navbar />
          <main className="flex-1">{children}</main>
           <Footer />
        </Provider>
        
       
      </body>
    </html>
  );
}
