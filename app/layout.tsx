import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navigation from '@/components/layout/Navigation'
import Footer from '@/components/layout/Footer'
import { AuthProvider } from '@/components/auth/AuthContext';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Control - AI-powered Desktop Assistant',
  description: 'Control your computer and browser using natural language with Control Desktop, an AI-powered desktop assistant.',
  keywords: 'AI, desktop assistant, natural language, computer control, browser automation',
  authors: [{ name: 'Control AI Team' }],
  creator: 'Control AI',
  publisher: 'Control AI',
  openGraph: {
    title: 'Control - AI-powered Desktop Assistant',
    description: 'Control your computer and browser using natural language with Control Desktop, an AI-powered desktop assistant.',
    url: 'https://control.ai',
    siteName: 'Control AI',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Control AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Control - AI-powered Desktop Assistant',
    description: 'Control your computer and browser using natural language with Control Desktop, an AI-powered desktop assistant.',
    creator: '@control_ai',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navigation />
        <AuthProvider>
        <main className="flex-grow">
          {children}
        </main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  )
}