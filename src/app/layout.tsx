import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/app-shell/AppShell';

export const metadata: Metadata = {
  title: 'Monokuro',
  description:
    'Single, zero-account web application for focused study. Unifies FocusX timer, VibraX ambient music with synced lyrics, and CineChill relaxation theater.',
};

export const viewport: Viewport = {
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#050505] text-[#f4f4f5]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
