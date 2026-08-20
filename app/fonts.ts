import { Playfair_Display, DM_Sans } from 'next/font/google'

// Headline font — the "The"/"Wyn" badge wordmark in Header.tsx. Replaces
// the local wynFont (melanin.otf) previously shared between the badge and
// the /news tagline; the badge and tagline now intentionally use two
// different typefaces, so each gets its own export.
export const headlineFont = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  display: 'swap',
})

// Supporting/tagline font — the "Your women's sports feed…" text under
// the hero on /news (NewsMosaic.tsx).
export const supportingFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})
