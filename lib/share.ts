/**
 * FX-69 shareable views. `?bp=<project>:L<n>` opens that project's Blueprint bench on layer n, and
 * `?photo=<gallery>:<n>` opens that gallery's lightbox on photo n. Values are validated by the caller against
 * the ids it knows, so an unknown or malformed link simply does nothing.
 */
export type DeepLink = { id: string; n: number };

export function readDeepLink(key: 'bp' | 'photo'): DeepLink | null {
  if (typeof window === 'undefined') return null;
  const raw = new URLSearchParams(window.location.search).get(key);
  const m = raw?.match(key === 'bp' ? /^([a-z0-9-]+):L([1-9]\d?)$/i : /^([a-z0-9-]+):([1-9]\d?)$/i);
  return m ? { id: m[1].toLowerCase(), n: Number(m[2]) } : null;
}

/** the current page URL with exactly one share parameter */
export function shareUrl(key: 'bp' | 'photo', id: string, n: number) {
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.delete('bp');
  url.searchParams.delete('photo');
  url.searchParams.set(key, key === 'bp' ? `${id}:L${n}` : `${id}:${n}`);
  return url.toString();
}

/** a short status toast (role="status"), above every overlay, gone after 2 s */
export function toast(text: string) {
  document.querySelector('[data-fx-toast]')?.remove();
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.dataset.fxToast = '';
  el.className = 'fx-toast nb-tag bg-pop-mint shadow-brutal-sm'; // positioned in globals.css (lib/ is not a Tailwind source)
  el.textContent = text;
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), 2000);
}

export async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // insecure context / permissions: fall back to a hidden textarea + execCommand
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast('Link copied');
}
