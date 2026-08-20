import { DM_Sans } from 'next/font/google'

// Supporting/tagline font — the "Your women's sports feed…" text under
// the hero on /news (NewsMosaic.tsx). The badge wordmark this used to be
// shared with (see git history — local wynFont, then Playfair Display) is
// now the official WynFeed logo image (public/wynlogo), so there's no
// second "headline" font to export here anymore.
export const supportingFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})
