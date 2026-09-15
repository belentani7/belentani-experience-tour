// Generates src/data/registry.ts from a SingleFile save of
// https://21st.dev/community/components
//
// Usage:
//   node scripts/gen-registry.mjs <saved-page.htm> [output.ts]
//
// The saved page is a single HTML file (SingleFile browser extension) whose
// component cards expose `href`, `data-preview-morph-key` and `aria-label`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const input = process.argv[2];
const output = process.argv[3] ?? path.join(root, 'src/data/registry.ts');

if (!input || !fs.existsSync(input)) {
  console.error('Usage: node scripts/gen-registry.mjs <saved-page.htm> [output.ts]');
  process.exit(1);
}

const html = fs.readFileSync(input, 'utf8');

const seen = new Set();
const items = [];

// Component cards (carry an aria-label with the human title).
const rxCard = /href=(https:\/\/21st\.dev\/@[^/]+\/(components|library)\/[^\s>]+)\s+(?:data-preview-morph-key=component:\d+\s+)?aria-label="([^"]*)"/g;
let m;
while ((m = rxCard.exec(html)) !== null) {
  const url = m[1];
  if (seen.has(url)) continue;
  seen.add(url);
  items.push({ url, kind: m[2], title: m[3].trim(), ...identifiers(url) });
}

// Remaining component links without an aria-label.
const rxFallback = /href=(https:\/\/21st\.dev\/@[^/]+\/components\/[^\s>]+)/g;
while ((m = rxFallback.exec(html)) !== null) {
  const url = m[1];
  if (seen.has(url)) continue;
  seen.add(url);
  items.push({ url, kind: 'components', title: titleFromSlug(url), ...identifiers(url) });
}

// Library links never carry an aria-label.
const rxLib = /href=(https:\/\/21st\.dev\/@[^/]+\/library\/[^\s>]+)/g;
while ((m = rxLib.exec(html)) !== null) {
  const url = m[1];
  if (seen.has(url)) continue;
  seen.add(url);
  items.push({ url, kind: 'library', title: titleFromSlug(url), ...identifiers(url) });
}

function identifiers(url) {
  const handle = (url.match(/@([^/]+)/) || [])[1] || 'unknown';
  return { handle, slug: url.split('/').pop() };
}

function titleFromSlug(url) {
  return url
    .split('/')
    .pop()
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const CATEGORY_RULES = [
  ['Pricing', /pricing|plans|tier/],
  ['Buttons', /button|cta/],
  ['Testimonials', /testimonial|review|quote/],
  ['Heroes', /hero|banner/],
  ['Navigation', /navbar|nav-|navigation|footer|sidebar|dock|menu|breadcrumb/],
  ['AI & Auth', /\bai\b|chat|assistant|agent|sign-?in|auth|login|voice|prompt|siri|mascot/],
  ['Data & Dashboards', /dashboard|stats|analytics|timeline|calendar|task|filter|slider|file-upload|table|chart|metric/],
  ['Backgrounds & Shaders', /shader|black-?hole|background|pattern|grid|wave|ripple|constellation|radial|burst|dot-|splite|sphere|paths|pixelated|water|aurora|noise|dithering|sonar/],
  ['Typography & Motion', /text|marquee|shimmer|handwriting|streaming|split|morph|scroll|rotate|animated|stagger|transition|reveal|liquid|kinetic|typewriter|gradient-text|magic-text|shining/],
  ['Sections & Cards', /card|feature|comparison|how-it-works|contact|profile|product|notification|gallery|carousel|accordion|faq|team|cta-section/],
];

const FEATURE_PHRASES = [
  [/glass/, 'glassmorphism surfaces'],
  [/shader/, 'GPU shader visuals'],
  [/scroll/, 'scroll-linked motion'],
  [/morph/, 'morphing transitions'],
  [/video/, 'video-backed imagery'],
  [/3d/, '3D depth'],
  [/animated/, 'entrance choreography'],
  [/gradient/, 'gradient treatments'],
  [/neon/, 'neon glow'],
  [/liquid/, 'liquid distortion'],
  [/dithering/, 'dithered gradients'],
  [/constellation/, 'constellation particles'],
  [/radial/, 'radial geometry'],
  [/wave/, 'waveform motion'],
  [/ripple/, 'ripple physics'],
  [/marquee/, 'infinite marquee'],
  [/shimmer/, 'shimmer sweep'],
  [/handwriting/, 'handwriting reveal'],
  [/spotlight/, 'spotlight tracking'],
  [/pixelated/, 'pixelated transitions'],
  [/prism|prisma/, 'prismatic light'],
  [/black-?hole/, 'gravitational distortion'],
  [/carousel/, 'carousel navigation'],
  [/comparison/, 'side-by-side comparison'],
  [/calendar/, 'date selection'],
  [/file-upload/, 'drag-and-drop upload'],
  [/kbd/, 'keyboard shortcut hints'],
  [/orb|sphere/, 'orbital motion'],
  [/water/, 'fluid ripple effects'],
  [/timeline/, 'orbital timeline layout'],
  [/stagger/, 'staggered reveals'],
  [/typing|typewriter|streaming/, 'streaming text'],
  [/globe|earth/, 'global data imagery'],
  [/sticky|pin/, 'sticky pinning'],
];

const LIBRARY_FEATURE = [
  [/magic-ui/, 'The library that popularised animated React + Tailwind marketing components.'],
  [/aceternity/, 'A large collection of cinematic, motion-heavy marketing blocks.'],
  [/kokonut/, 'Bold, animated UI blocks for modern landing pages.'],
  [/fancy-components/, 'Fluid, spring-based motion primitives for React.'],
  [/background-snippets/, 'Copy-paste Tailwind background patterns and gradients.'],
  [/smoothui/, 'Smooth, accessible micro-interaction components.'],
  [/ruixen/, 'Production-ready SaaS sections and blocks.'],
  [/reui/, 'Composable UI primitives and patterns.'],
  [/shadcn/, 'shadcn/ui-compatible component collections.'],
  [/threeui/, 'Three.js-powered 3D interface components.'],
  [/hextaui/, 'Polished, animated component set.'],
  [/spectrum-ui/, 'Vivid, gradient-forward interface kit.'],
  [/prism-ui/, 'Prismatic, glassy component collection.'],
  [/tailark/, 'Marketing and product page blocks.'],
  [/spell/, 'Expressive text and layout effects.'],
  [/uiable/, 'Accessible form and input components.'],
  [/ui-layouts/, 'Layout systems and page sections.'],
  [/hyperiux-vault/, 'Experimental visual effects vault.'],
  [/efferd/, 'Refined SaaS component blocks.'],
  [/lndev-ui/, 'Clean, developer-first UI components.'],
  [/reuno-ui/, 'Shader-driven React components.'],
  [/shadway/, 'Shader and gradient component library.'],
];

function categorize(slug, kind) {
  if (kind === 'library') return 'Libraries';
  for (const [cat, re] of CATEGORY_RULES) if (re.test(slug)) return cat;
  return 'UI Components';
}

function features(slug) {
  const out = [];
  for (const [re, phrase] of FEATURE_PHRASES) {
    if (re.test(slug) && !out.includes(phrase)) out.push(phrase);
    if (out.length >= 3) break;
  }
  return out;
}

function description(item, category) {
  if (item.kind === 'library') {
    const hit = LIBRARY_FEATURE.find(([re]) => re.test(item.slug));
    return (
      (hit ? hit[1] : `A curated component library by @${item.handle}.`) +
      ' Install it directly from the 21st.dev registry.'
    );
  }
  const f = features(item.slug);
  const tail = f.length ? ` Ships ${f.join(', ')}.` : ' Production-ready React + Tailwind markup.';
  const lead =
    {
      Heroes: 'Full-bleed hero section',
      Pricing: 'Pricing block',
      Buttons: 'Interactive button',
      Testimonials: 'Testimonial section',
      Navigation: 'Navigation component',
      'AI & Auth': 'AI / authentication interface',
      'Data & Dashboards': 'Data-dense dashboard block',
      'Backgrounds & Shaders': 'Ambient background effect',
      'Typography & Motion': 'Typography & motion effect',
      'Sections & Cards': 'Page section / card',
    }[category] || 'UI component';
  return `${lead} by @${item.handle}.${tail}`;
}

function pascal(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function toAsset(item) {
  const category = categorize(item.slug, item.kind);
  const comp = pascal(item.slug);
  const isLib = item.kind === 'library';
  const code = [
    `// ${item.title}`,
    `// Source: ${item.url}`,
    `// Author: @${item.handle}`,
    `//`,
    `// 1) Install from the 21st.dev registry (shadcn CLI):`,
    `//    npx shadcn@latest add "https://21st.dev/r/${item.handle}/${item.slug}"`,
    `//`,
    isLib ? `// 2) Or install the full library, then import:` : `// 2) Then import and render it:`,
    `//    import { ${comp} } from "@/components/${item.slug}";`,
    `//    <${comp} />`,
  ].join('\n');

  return {
    id: item.slug,
    title: item.title,
    category,
    description: description(item, category),
    source: isLib ? `21st.dev library · @${item.handle}` : `21st.dev · @${item.handle}`,
    author: `@${item.handle}`,
    url: item.url,
    tags: features(item.slug),
    kind: isLib ? 'library' : 'component',
    code,
  };
}

const catalog = items.map(toAsset);
const ordered = [
  ...catalog.filter((a) => a.kind === 'component'),
  ...catalog.filter((a) => a.kind === 'library'),
];

const ts = `import type { Asset } from '../types';

// AUTO-GENERATED from a saved 21st.dev/community/components page.
// Regenerate with: node scripts/gen-registry.mjs <saved-page.htm>
// ${ordered.length} entries (${ordered.filter((a) => a.kind === 'component').length} components, ${ordered.filter((a) => a.kind === 'library').length} libraries).

export const REGISTRY: Asset[] = ${JSON.stringify(ordered, null, 2)};
`;

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, ts, 'utf8');
console.log(
  `Wrote ${ordered.length} entries (${ordered.filter((a) => a.kind === 'component').length} components, ${ordered.filter((a) => a.kind === 'library').length} libraries) to ${output}`,
);
