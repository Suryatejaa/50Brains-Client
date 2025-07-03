import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: '50BraIns - Creator Economy Platform',
    template: '%s | 50BraIns',
  },
  description:
    'The premier platform where creativity meets opportunity. Connect brands with creators, influencers, and creative professionals.',
  keywords: [
    'creator economy',
    'influencer marketing',
    'brand collaboration',
    'creative professionals',
    'freelance',
  ],
  authors: [{ name: '50BraIns Team' }],
  creator: '50BraIns',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://50brains.com',
    siteName: '50BraIns',
    title: '50BraIns - Creator Economy Platform',
    description: 'The premier platform where creativity meets opportunity.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '50BraIns - Creator Economy Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@50brains',
    creator: '@50brains',
    title: '50BraIns - Creator Economy Platform',
    description: 'The premier platform where creativity meets opportunity.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
