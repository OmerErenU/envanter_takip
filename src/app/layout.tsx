'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <html lang="tr">
      <body className={inter.className}>
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
          {/* Mobile Header */}
          <div className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">📊 Envanter</span>
            </Link>
            <button 
              className="text-white p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:flex w-64 bg-slate-900 text-white flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-gray-700">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-white">📊 Envanter Paneli</span>
              </Link>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                <NavItem href="/" icon="🏠" label="Ana Sayfa" />
                <NavItem href="/employees" icon="👥" label="Çalışanlar" />
                <NavItem href="/devices" icon="💻" label="Cihazlar" />
                <NavItem href="/assignments" icon="📋" label="Zimmetler" />
                <NavItem href="/import-all" icon="📥" label="İçe Aktar" />
                <NavItem href="/reports" icon="📊" label="Raporlar" />
              </ul>
              
              <div className="mt-8 pt-4 border-t border-gray-700">
                <ul className="space-y-1">
                  <NavItem href="/api/export/all" icon="📤" label="Veriyi Dışa Aktar" />
                  <NavItem href="/settings" icon="⚙️" label="Ayarlar" />
                </ul>
              </div>
            </nav>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Envanter Takip Sistemi
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white shadow">
              <div className="px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-800">Envanter Yönetimi</h1>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-600 hover:text-gray-800">
                    <span>🔔</span>
                  </button>
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    A
                  </div>
                </div>
              </div>
            </header>
            
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40">
            <div className="bg-slate-900 w-64 h-full">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-white">📊 Envanter</span>
                </Link>
                <button 
                  className="text-white p-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <nav className="py-4">
                <ul className="space-y-1">
                  <MobileNavItem href="/" icon="🏠" label="Ana Sayfa" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavItem href="/employees" icon="👥" label="Çalışanlar" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavItem href="/devices" icon="💻" label="Cihazlar" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavItem href="/assignments" icon="📋" label="Zimmetler" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavItem href="/import-all" icon="📥" label="İçe Aktar" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavItem href="/reports" icon="📊" label="Raporlar" onClick={() => setIsMobileMenuOpen(false)} />
                </ul>
                <div className="mt-8 pt-4 border-t border-gray-700">
                  <ul className="space-y-1">
                    <MobileNavItem href="/api/export/all" icon="📤" label="Veriyi Dışa Aktar" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavItem href="/settings" icon="⚙️" label="Ayarlar" onClick={() => setIsMobileMenuOpen(false)} />
                  </ul>
                </div>
              </nav>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <li>
      <Link 
        href={href} 
        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md group transition-colors"
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function MobileNavItem({ 
  href, 
  icon, 
  label, 
  onClick 
}: { 
  href: string; 
  icon: string; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <li>
      <Link 
        href={href} 
        className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
        onClick={onClick}
      >
        <span className="mr-3 text-lg">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}
