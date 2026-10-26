// Minimal typing for the pieces of window.grecaptcha this app actually
// uses — Google doesn't ship official types for the classic (non-Enterprise)
// reCAPTCHA API.
export type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
  render: (
    container: HTMLElement,
    options: { sitekey: string; callback: (token: string) => void },
  ) => number;
  reset: (widgetId?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const loadedScripts = new Set<string>();

/**
 * Injects a reCAPTCHA <script> tag at most once per src — v3's invisible
 * check (?render=SITE_KEY) and v2's explicit checkbox (?render=explicit)
 * are loaded on-demand, separately, only on the pages/forms that actually
 * need them (not globally in the root layout), and only when Site
 * Settings > Integrations actually has reCAPTCHA turned on.
 */
export function loadRecaptchaScript(src: string): Promise<void> {
  if (loadedScripts.has(src)) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      loadedScripts.add(src);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function getRecaptchaV3Token(siteKey: string, action: string): Promise<string> {
  await loadRecaptchaScript(`https://www.google.com/recaptcha/api.js?render=${siteKey}`);

  return new Promise((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error("grecaptcha failed to load"));
      return;
    }

    window.grecaptcha.ready(() => {
      window
        .grecaptcha!.execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}

export async function renderRecaptchaV2(
  container: HTMLElement,
  siteKey: string,
  onVerify: (token: string) => void,
): Promise<void> {
  await loadRecaptchaScript("https://www.google.com/recaptcha/api.js?render=explicit");

  if (!window.grecaptcha) {
    throw new Error("grecaptcha failed to load");
  }

  window.grecaptcha.ready(() => {
    window.grecaptcha!.render(container, { sitekey: siteKey, callback: onVerify });
  });
}
