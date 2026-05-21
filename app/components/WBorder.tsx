// Decorative W-pattern border — tiles a single W zigzag unit horizontally.
// Each 40×8 tile traces the W letterform: outer peaks flush to top,
// inner peak at mid-height, dips near the bottom.
export default function WBorder() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '8px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='8' viewBox='0 0 40 8'%3E%3Cpath d='M0 0 L10 7 L20 3 L30 7 L40 0 L40 8 L0 8 Z' fill='%239966CB'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '40px 8px',
      }}
    />
  )
}
