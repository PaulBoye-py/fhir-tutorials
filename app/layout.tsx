import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Work_Sans } from 'next/font/google';
import { Providers } from './providers';

const workSans = Work_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // Choose weights you need
});

export const metadata: Metadata = {
  title: 'HL7 FHIR Demo',
  description: 'A demonstration of HL7 FHIR Patient and Practitioner resources',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-white text-black min-h-screen ${workSans.className}`}>
        <Providers>
        <nav className="border-b border-gray-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  href="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/patients"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
                >
                  Patients
                </Link>
                <Link
                  href="/practitioners"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent hover:border-blue-600 transition-colors"
                >
                  Practitioners
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        </Providers>
      </body>
    </html>
  );
}