'use client';

/** Icons swap via CSS on [data-theme], so there is no hydration flicker. */
export function ThemeToggle() {
  function flip() {
    const root = document.documentElement;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem('luxe_theme', next);
    } catch {}
  }

  return (
    <button className="theme-toggle" onClick={flip} aria-label="Toggle light / dark theme" title="Toggle theme">
      <svg className="i-moon" viewBox="0 0 24 24" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      <svg className="i-sun" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
