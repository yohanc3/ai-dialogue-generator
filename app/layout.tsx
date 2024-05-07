import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn } from "@/app/lib/utils";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  generator: 'Next.js',
  applicationName: 'motion',
  referrer: 'origin-when-cross-origin',
  keywords: ['Next.js', 'React', 'JavaScript', 'Deepfake', 'AI', 'Dialogue'],
  authors: [{ name: 'Yohance', url: 'https://github.com/yohanc3' }],
  creator: 'Yohance Williams-Rodriguez',
  publisher: 'Vercel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark:bg-black`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
