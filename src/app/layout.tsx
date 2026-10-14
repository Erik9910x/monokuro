import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/app-shell/AppShell';

export const metadata: Metadata = {
  title: 'Monokuro — Minimalist Study Workspace',
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var o=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){if(typeof n==='string'&&(n.indexOf('bis_')===0||n==='bis_skin_checked'||n==='bis_register'))return;return o.call(this,n,v);};}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-[#050505] text-[#f4f4f5]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
