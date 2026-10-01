import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { AuthProvider, SidebarProvider } from "@/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import { DynamicMetadata } from "@/components/common";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nursery Marketplace Admin Console",
    template: "%s | Nursery Marketplace Admin Console",
  },
  description:
    "Administrative operations, botanical catalog taxonomy, nursery stores, and doorstep delivery.",
  applicationName: "Nursery Marketplace Admin Console",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Nursery Marketplace Admin Console",
    description:
      "Administrative operations, botanical catalog taxonomy, nursery stores, and doorstep delivery.",
    siteName: "Nursery Marketplace Admin",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans tracking-tight">
        <DynamicMetadata />
        <TooltipProvider>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
