import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Narayan Pharmacy - Prescription Entry & Drug Interaction Checker",
  description: "Advanced clinical pharmacist workstation for drug-drug interaction validation.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              Narayan Rx <span>Checker</span>
            </div>
            <nav className="nav-links">
              <Link href="/" className="nav-link">
                New Prescription
              </Link>
              <Link href="/prescriptions" className="nav-link">
                Prescription History
              </Link>
            </nav>
          </div>
        </header>
        <main className="app-container flex flex-col flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

