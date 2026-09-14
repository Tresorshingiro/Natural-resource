/**
 * Presentation config for the workspace.
 *
 * `src/data/modules.js` stays the single source of truth for content — it is
 * what `scripts/check-data.mjs` guards on every build. This file derives the
 * catalog from it and adds only what the UI needs: stable solution ids for the
 * routes, icons, and a same-origin `embedUrl`.
 */
import { modules as catalogSource } from './modules.js'
import { srcSet } from '../config/images.js'
import { embedUrl as frameUrl, formEmbedUrl } from '../lib/portal.js'

export const portal = {
  name: "Environment Mapping",
  homeTitle: "Environment Mapping",
  tagline: "Air quality, climate hazards, protected areas and biodiversity, mapped and monitored across Rwanda.",
  /*
   * The ArcGIS Enterprise this portal signs into and embeds from.
   *
   * Named here rather than written into the components, because it is not the
   * same system for every portal — Parks & Tourism runs on RDB's Enterprise,
   * the rest on GeoHub. Hardcoding it meant the sign-in prompt and the privacy
   * note told the user to enter credentials for the wrong organisation.
   */
  identity: { name: 'GeoHub', host: 'gh.space.gov.rw' },

  // This portal's own module photograph, not a shared one — each split portal
  // is visually its own thing.
  hero: srcSet("climate-hero").src,

  /*
   * The login's colour and mark, set here because this portal spans three
   * modules. Left to default, the login borrowed the first module's — Climate's
   * purple and cloud — which read as a climate portal rather than an
   * environment one. `accent` carries the title and sits under white button
   * text, so it must hold 4.5:1 on white (#0F7B6C is 5.2:1); `tint` only
   * washes the panel and inputs.
   */
  login: { accent: '#0F7B6C', tint: '#2BB39A', icon: 'leaf' },
}

/**
 * Stable route ids for each application.
 *
 * Keyed by the application URL so a rename does not silently
 * repoint a link, and so a reorder cannot change a URL.
 *
 * `protected-areas` and `biodiversity` once named the two Experience Builder
 * apps; they now name the first dashboard of each, so a link saved before the
 * apps were split still opens the same subject.
 */
const SOLUTION_IDS = {
  "https://gh.space.gov.rw/portal/apps/dashboards/75c503067fd2423391d0789c7a4f6f8a": "air-quality",
  "https://gh.space.gov.rw/portal/apps/dashboards/3af93433d83d4c2186ee450069412077": "protected-areas",
  "https://gh.space.gov.rw/portal/apps/dashboards/2df49fb357db487491fe2ebb29ab982b": "protected-area-incidents",
  "https://gh.space.gov.rw/portal/apps/dashboards/bc469da4e9ca4d73b6ce8114d330977f": "biodiversity",
  "https://gh.space.gov.rw/portal/apps/experiencebuilder/experience/?id=d3c75b53ca5841eabe116172a1ce04b5": "biodiversity-export",
  "https://moegis.environment.gov.rw/portal/apps/dashboards/5205ea5a64b44bdb8ae4873f5597c8ea": "vcrp",
  "https://moegis.environment.gov.rw/portal/apps/dashboards/0d57726c1d35415c916910f650723695": "sfere",
  "https://moegis.environment.gov.rw/portal/apps/experiencebuilder/experience/?id=6717c827c3674a8e923da8708f6bfcf3": "green-gicumbi",
}

const MODULE_ICONS = {
  climate: "cloud",
  conservation: "leaf",
  adaptation: "mountain",
}

const SOLUTION_ICONS = {
  "air-quality": "activity",
  "protected-areas": "map",
  "protected-area-incidents": "activity",
  "biodiversity": "layers",
  "biodiversity-export": "download",
  "vcrp": "activity",
  "sfere": "activity",
  "green-gicumbi": "map",
}

/** A group's own mark, keyed by group name. */
const GROUP_ICONS = {
  "Protected Area Mapping and Monitoring": "mountain",
  "Biodiversity Mapping": "tree",
}

/*
 * Module accent for the light chrome.
 *
 * The catalog's `accentText` is the value drawn for this exact ground and
 * guarded at 4.5:1 on #FBFAF7 by scripts/check-data.mjs, so the sidebar uses it
 * directly. One palette, guarded in one place.
 */

/**
 * The Survey123 form feeding a dashboard, as a solution of its own.
 *
 * Its route id is derived from the dashboard's, so the pairing survives in the
 * URL and a form can never collide with an application id. Like every other
 * solution it is framed same-origin, through its own proxy base — see
 * formEmbedUrl() for why a direct frame does not work.
 */
function toForm(app, parentId) {
  return {
    id: `${parentId}-form`,
    name: app.form.name,
    icon: 'clipboard',
    isForm: true,
    embedUrl: formEmbedUrl(app.form.url),
  }
}

/** Turn one catalog application into the shape the UI renders. */
function toSolution(app) {
  const id = SOLUTION_IDS[app.url]
  return {
    id,
    name: app.name,
    year: app.year,
    icon: SOLUTION_ICONS[id] || 'map',
    isForm: false,
    // Same-origin for GeoHub. The Portal sends X-Frame-Options, so a frame
    // pointed straight at gh.space.gov.rw is refused; this routes through the
    // access server, which attaches the signed-in user's token. MoE
    // applications are the exception and are framed directly — see embedUrl().
    embedUrl: id ? frameUrl(app.url) : null,
    form: id && app.form ? toForm(app, id) : null,
  }
}

/*
 * Group a module's applications for the sidebar.
 *
 * A catalog entry carrying `apps` becomes a named group; a bare application
 * becomes an unnamed one, so the sidebar has a single list to walk rather than
 * two shapes to branch on. A named group is a LABEL — no id, no route, because
 * the Experience Builder app it is named after is no longer embedded.
 */
function toGroups(mod) {
  return mod.apps.map((app) =>
    app.apps
      ? {
          name: app.name,
          icon: GROUP_ICONS[app.name] || 'layers',
          solutions: app.apps.map(toSolution),
        }
      : { name: null, icon: null, solutions: [toSolution(app)] },
  )
}

/*
 * The flat list of routable applications.
 *
 * Flattened FROM `groups` rather than built alongside it, so the router and the
 * sidebar hold the same objects and not two equal copies.
 */
const flatten = (groups) =>
  groups.flatMap((g) => g.solutions.flatMap((s) => (s.form ? [s, s.form] : [s])))

const catalog = catalogSource.map((mod) => {
  const groups = toGroups(mod)
  return {
    id: mod.id,
    name: mod.name,
    description: mod.description,
    icon: MODULE_ICONS[mod.id] || 'map',
    accent: mod.accent,
    accentText: mod.accentText,
    // Named for its role in the CSS (the module and group icons, and the open
    // row's icon), which is a dark accent on light chrome — the guarded,
    // contrast-checked catalog value.
    accentDark: mod.accentText,
    image: srcSet(mod.heroSlug).src,
    // What the sidebar draws.
    groups,
    // What the router, getSolution and every total consume — none of which
    // know groups exist.
    solutions: flatten(groups),
  }
})

/*
 * Drop anything that cannot actually be framed, then drop whatever that leaves
 * empty — a group whose dashboards have all gone, then a module with nothing
 * left. Filtering the groups alone is enough: the flat view is re-flattened
 * from the result, so the two cannot disagree about what is published.
 */
function publishedModules(source) {
  const live = (app) => Boolean(app.embedUrl)
  return source
    .map((mod) => {
      const groups = mod.groups
        .map((g) => ({
          ...g,
          solutions: g.solutions
            .filter(live)
            // A dashboard whose form went missing still publishes; the form is
            // an extra way in, not a requirement.
            .map((s) => (s.form && !live(s.form) ? { ...s, form: null } : s)),
        }))
        .filter((g) => g.solutions.length > 0)
      return { ...mod, groups, solutions: flatten(groups) }
    })
    .filter((mod) => mod.solutions.length > 0)
}

export const modules = publishedModules(catalog)

export const getModule = (id) => modules.find((m) => m.id === id)
export const getSolution = (mod, solutionId) =>
  mod ? mod.solutions.find((s) => s.id === solutionId) : undefined

export const stats = {
  modules: modules.length,
  // Dashboards, matching totals.apps. A form is another way into one of these,
  // not another solution, so counting it here would overstate the portal.
  solutions: modules.reduce((n, m) => n + m.solutions.filter((s) => !s.isForm).length, 0),
  forms: modules.reduce((n, m) => n + m.solutions.filter((s) => s.isForm).length, 0),
}

export const footer = {
  agency: '',
  blurb:
    'National environmental and natural resource intelligence, built on Earth observation and national field reporting.',
  contact: { email: '', phone: '' },
  quickLinks: [
    { label: 'Home', to: '/' },
    // Dashboards only. A form is another way into one of these, not another
    // solution, so it stays out of the footer like it stays out of stats.
    ...modules.flatMap((mod) =>
      mod.solutions
        .filter((s) => !s.isForm)
        .map((s) => ({ label: s.name, to: `/module/${mod.id}/app/${s.id}` })),
    ),
  ],
}
