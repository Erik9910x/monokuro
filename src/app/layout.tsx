import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/app-shell/AppShell';

export const metadata: Metadata = {
  title: 'Monokuro — Minimalist Study Workspace',
  description:
    'Single, zero-account web application for focused study. Unifies FocusX timer, VibraX ambient music with synced lyrics, and FrameWhisper video study workspace.',
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
            __html: `
              (function() {
                try {
                  const origSet = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (typeof name === 'string' && (name.startsWith('bis_') || name === 'bis_skin_checked' || name === 'bis_register')) {
                      return;
                    }
                    return origSet.call(this, name, val);
                  };
                  const clean = () => {
                    const els = document.querySelectorAll('[bis_skin_checked], [bis_register]');
                    for (let i = 0; i < els.length; i++) {
                      els[i].removeAttribute('bis_skin_checked');
                      els[i].removeAttribute('bis_register');
                    }
                    if (document.body) document.body.removeAttribute('bis_register');
                  };
                  clean();
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', clean, { once: true });
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[#050505] text-[#f4f4f5]" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
