/**
 * Sky stage for the showcase page.
 *
 * Pure CSS: a deep-to-light altitude gradient, a moon-ish halo, a star veil
 * near the top of the page and three cloud bands drifting at different speeds.
 * The bands are transform-animated (two duplicated tiles) instead of animating
 * `background-position`, so the whole thing stays on the compositor.
 */
export default function SkyBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="sx-sky pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="sx-sky-stars" />
      <div className="sx-sky-halo" />

      <div className="sx-cloud-band" style={{ top: "4%", opacity: 0.45 }}>
        <div className="sx-cloud-track" style={{ animationDuration: "300s" }}>
          <div className="sx-cloud-tile" />
          <div className="sx-cloud-tile" />
        </div>
      </div>

      <div className="sx-cloud-band" style={{ top: "22%", opacity: 0.7 }}>
        <div className="sx-cloud-track" style={{ animationDuration: "210s" }}>
          <div className="sx-cloud-tile" />
          <div className="sx-cloud-tile" />
        </div>
      </div>

      <div className="sx-cloud-band" style={{ top: "52%", opacity: 0.55 }}>
        <div
          className="sx-cloud-track sx-cloud-track--reverse"
          style={{ animationDuration: "170s" }}
        >
          <div className="sx-cloud-tile sx-cloud-tile--far" />
          <div className="sx-cloud-tile sx-cloud-tile--far" />
        </div>
      </div>

      <div className="sx-sky-haze" />
    </div>
  )
}
