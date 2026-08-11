import localFont from 'next/font/local'

// Used for both the Wyn badge logo wordmark and the tagline beneath the
// hero on /news — shared here so both components load the same font
// instance rather than declaring next/font/local twice.
export const mooligat = localFont({
  src: './fonts/mooligat.otf',
  weight: '400',
  display: 'swap',
})
