import { features } from './features.generated.js'

/**
 * This portal carries ONE module. It was split out of the combined
 * Environmental and Natural Resource portal so each module ships, deploys and
 * is access-controlled on its own.
 *
 * The shape is unchanged from the parent — same fields, same guard — so a
 * module can be moved back or across without touching any component.
 */
export const modules = [
  {
    id: "climate",
    index: '01',
    name: "Environmental and Climate Mapping",
    accent: "#7C5CBF",
    accentText: "#7C5CBF",
    description: "Air pollutants, carbon emissions and climate hazards, charted over time and ranked by district.",
    cardSlug: "climate-card",
    heroSlug: "climate-hero",
    cardAlt: "Open sky over Rwandan wetlands",
    apps: [
      {
        name: "Air Quality and Pollution Mapping, Monitoring and Reporting",
        url: "https://gh.space.gov.rw/portal/apps/dashboards/75c503067fd2423391d0789c7a4f6f8a",
        year: "Year 1",
      },
    ],
    features: features.climate,
  },
]

// Derived, never typed.
export const totals = {
  modules: modules.length,
  apps: modules.reduce((n, m) => n + m.apps.length, 0),
  features: modules.reduce((n, m) => n + m.features.length, 0),
}

export const getModule = (id) => modules.find((m) => m.id === id)
