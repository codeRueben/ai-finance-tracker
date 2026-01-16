import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import Sidebar from './components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Finance Pro',
  description: 'Your intelligent financial assistant.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark h-full bg-black">
        <body className={`${inter.className} h-full`}>
          
          {/* LAYOUT FOR SIGNED IN USERS */}
          <SignedIn>
            <div className="flex h-full">
              {/* The Sidebar (Fixed width of w-20 when collapsed) */}
              <Sidebar />
              
              {/* Main Content: pl-20 creates exactly enough space for the collapsed sidebar */}
              <main className="flex-1 overflow-y-auto bg-black pl-20 transition-all duration-300">
                {children}
              </main>
            </div>
          </SignedIn>

          {/* LAYOUT FOR GUESTS (e.g. Sign In Page) */}
          <SignedOut>
            <div className="h-full flex items-center justify-center bg-black">
               {children}
            </div>
          </SignedOut>

        </body>
      </html>
    </ClerkProvider>
  )
}