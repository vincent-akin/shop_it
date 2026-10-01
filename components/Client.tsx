'use client'
export function ThemeToggle() {
  return (
    <button className="ic" type="button" aria-label="Switch theme" style={{ marginLeft: 'auto', marginTop: 6 }}
      onClick={() => {
        const r = document.documentElement
        const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches
        r.dataset.theme = dark ? 'light' : 'dark'
        try { localStorage.setItem('shopit_theme', r.dataset.theme) } catch {}
      }}>🌓</button>
  )
}
