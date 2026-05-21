// Upside-down W (M-shape) border — two spikes per tile pointing UP into the
// hero section, thin base connecting tiles at the bottom.
export default function WBorder() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: '8px',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='8' viewBox='0 0 80 8'%3E%3Cpath d='M0 7 L20 0 L40 5 L60 0 L80 7 L80 8 L0 8 Z' fill='%239966CB'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat-x',
        backgroundSize: '80px 8px',
      }}
    />
  )
}
