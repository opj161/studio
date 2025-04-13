
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StyleAI - Virtual Fashion App',
  description: 'Virtually try on clothes using AI models.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`h-full ${geistSans.variable} ${geistMono.variable} antialiased`}>
      <header className="bg-background border-b">
        <div className="container flex items-center justify-between h-16">
          <a href="/" className="text-2xl font-bold">
            StyleAI
          </a>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">John Doe</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-10">
        {children}
      </main>
      </body>
    </html>
  );
}
