// Suppress DOM pollution and console noise from third-party browser extensions
// (e.g. Bitdefender TrafficLight bis_skin_checked, Urban VPN M_ID unhandled rejections, adblockers)

if (typeof window !== 'undefined') {
  try {
    // 1. Immediately scrub attributes already injected by Bitdefender before script execution
    const cleanBisAttributes = () => {
      try {
        const els = document.querySelectorAll('[bis_skin_checked], [bis_register]');
        for (let i = 0; i < els.length; i++) {
          els[i].removeAttribute('bis_skin_checked');
          els[i].removeAttribute('bis_register');
        }
        if (document.body) {
          document.body.removeAttribute('bis_register');
          document.body.removeAttribute('bis_skin_checked');
        }
      } catch {}
    };

    cleanBisAttributes();

    // 2. Override setAttribute immediately before React hydration begins
    const origSet = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name: string, val: string) {
      if (
        typeof name === 'string' &&
        (name.startsWith('bis_') || name === 'bis_skin_checked' || name === 'bis_register')
      ) {
        return;
      }
      return origSet.call(this, name, val);
    };

    const origSetNS = Element.prototype.setAttributeNS;
    Element.prototype.setAttributeNS = function (ns: string | null, name: string, val: string) {
      if (
        typeof name === 'string' &&
        (name.startsWith('bis_') || name === 'bis_skin_checked' || name === 'bis_register')
      ) {
        return;
      }
      return origSetNS.call(this, ns, name, val);
    };

    // Re-clean once DOM is interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', cleanBisAttributes, { once: true });
    }
  } catch {}

  // 3. Intercept console.error to filter out extension-caused hydration attribute mismatches & errors
  try {
    const origConsoleError = console.error;
    console.error = function (...args: any[]) {
      const text = args
        .map((a) => {
          if (typeof a === 'string') return a;
          if (a instanceof Error) return `${a.message}\n${a.stack}`;
          try {
            return JSON.stringify(a);
          } catch {
            return String(a);
          }
        })
        .join(' ');

      if (
        text.includes('bis_skin_checked') ||
        text.includes('bis_register') ||
        text.includes('chrome-extension://') ||
        text.includes('moz-extension://') ||
        text.includes('eppiocemhmnlbhjplcgkofciiegomcon') ||
        text.includes('M_ID')
      ) {
        return;
      }
      return origConsoleError.apply(this, args);
    };
  } catch {}

  // 4. Capture phase error & unhandledrejection handlers for extension crashes
  try {
    window.addEventListener(
      'unhandledrejection',
      (e: PromiseRejectionEvent) => {
        const reason = e.reason;
        const stack = typeof reason === 'string' ? reason : reason?.stack || '';
        const message = typeof reason === 'string' ? reason : reason?.message || '';
        if (
          stack.includes('chrome-extension://') ||
          stack.includes('moz-extension://') ||
          stack.includes('eppiocemhmnlbhjplcgkofciiegomcon') ||
          message.includes('M_ID')
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );

    window.addEventListener(
      'error',
      (e: ErrorEvent) => {
        const filename = e.filename || '';
        const stack = e.error?.stack || '';
        const message = e.message || '';
        if (
          filename.includes('chrome-extension://') ||
          filename.includes('moz-extension://') ||
          stack.includes('chrome-extension://') ||
          stack.includes('moz-extension://') ||
          stack.includes('eppiocemhmnlbhjplcgkofciiegomcon') ||
          message.includes('M_ID')
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true
    );
  } catch {}
}

export {};
