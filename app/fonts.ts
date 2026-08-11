import localFont from 'next/font/local'

// Used for both the Wyn badge logo wordmark and the tagline beneath the
// hero on /news — shared here so both components load the same font
// instance rather than declaring next/font/local twice. Named generically
// (not after the specific font) since this has already been swapped once
// and will likely be swapped again — only this file needs to change, not
// every place that imports it.
export const wynFont = localFont({
  src: './fonts/melanin.otf',
  weight: '400',
  display: 'swap',
})
