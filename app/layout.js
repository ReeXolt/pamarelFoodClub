import "./globals.css";
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import ProviderHelper from "./Helper";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


export const metadata = {
  title: 'pamarel - Shop, save and earn on essential foodstuff',
  description: 'pamarel - discover 20% food and gadget discount, and earn while building your network',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}
        suppressHydrationWarning
      >
        <Analytics />
        <ProviderHelper>
          {children}
        </ProviderHelper>
      </body>
    </html>
  );
}
