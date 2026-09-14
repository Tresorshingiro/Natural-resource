/**
 * The embedded ArcGIS application.
 *
 * For GeoHub applications `src` is a same-origin path served by this app's
 * access server, never a gh.space.gov.rw URL: the Portal sends X-Frame-Options,
 * so a direct frame is refused, and a cross-origin frame could not carry the
 * user's session either. The Ministry of Environment's applications are the
 * exception, framed directly — see embedUrl() in src/lib/portal.js.
 *
 * flex-basis 0 matters — an iframe has a short intrinsic height, so without it
 * the frame renders ~150px tall instead of filling the pane.
 */
export default function ArcGisDashboardFrame({ src, title }) {
  return (
    <iframe
      key={src}
      src={src}
      title={title}
      className="app-frame"
      allow="geolocation; microphone; camera; fullscreen"
    />
  )
}
