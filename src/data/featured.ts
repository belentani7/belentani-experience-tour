import type { Asset } from '../types';

/**
 * In-house Belentani components. These ship real source code (unlike the
 * 21st.dev registry entries, which reference remote installs).
 */
export const FEATURED: Asset[] = [
  {
    id: "gsap-hero-2026",
    title: "Belentani GSAP Hero",
    category: "Heroes",
    description: "Ultimate 2026 GSAP ScrollTrigger Hero with thick glassmorphism and WebGL liquid distortion.",
    source: "Belentani Core UI",
    featured: true,
    kind: "featured",
    tags: ["scroll-linked motion", "glassmorphism", "entrance choreography"],
    code: `import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function GsapHero() {
  const container = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".hero-element", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out"
      });
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden glass-thick-red rounded-3xl p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-red-900/10 to-black blur-[100px]" />

      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        <div className="hero-element inline-flex items-center rounded-full border border-red-500/40 bg-red-950/60 px-4 py-2 text-sm text-red-200 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,0,0.3)]">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.8)]"></span>
          Belentani Experience Tour
        </div>

        <h1 className="hero-element text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
          THICK GLOSSY <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-400 to-red-800">GLASS</span>
        </h1>

        <p className="hero-element text-xl text-red-200/80 max-w-2xl mx-auto font-medium">
          Extracting the maximum open data and top UI/UX libraries of 2026. Welcome to the future of interface design.
        </p>

        <div className="hero-element pt-8 flex gap-6 justify-center">
          <button className="px-8 py-4 rounded-xl bg-gradient-to-b from-red-500 to-red-700 text-white font-bold hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(255,0,0,0.4)] border border-red-400/50">
            Start Tour
          </button>
        </div>
      </div>
    </section>
  );
}`
  },
  {
    id: "ui-glass-card-red",
    title: "Thick Glass Red Card",
    category: "Sections & Cards",
    description: "Extracted from the top 2026 Glassmorphism repos. Heavy refractive index simulation with pure CSS.",
    source: "OpenUX 2026",
    featured: true,
    kind: "featured",
    tags: ["glassmorphism"],
    code: `import { cn } from "@/lib/utils";

export function ThickGlassCard() {
  return (
    <div className="group relative w-full max-w-md p-8 rounded-[2rem] overflow-hidden glass-thick-red hover:shadow-[0_20px_60px_-10px_rgba(255,0,0,0.5)] transition-all duration-500">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500 rounded-full blur-[100px] opacity-40 group-hover:opacity-70 transition-opacity duration-700" />

      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-900 border border-red-300/50 shadow-inner mb-6 flex items-center justify-center">
          <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-md" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Refractive UI</h3>
        <p className="text-red-200/70 mb-8 leading-relaxed">
          Experience the Belentani thick glossy glassmorphism. High definition styling adapted for the 2026 web engine.
        </p>

        <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold transition-all backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
          Explore Asset
        </button>
      </div>
    </div>
  );
}`
  },
  {
    id: "open-data-grid-2026",
    title: "Open Data Quantum Grid",
    category: "Data & Dashboards",
    description: "Massive dataset visualizer with GSAP powered sticky headers and WebGL cell rendering.",
    source: "GitHub: Top Datasets 2026",
    featured: true,
    kind: "featured",
    tags: ["sticky pinning"],
    code: `import { cn } from "@/lib/utils";

export function QuantumDataGrid() {
  return (
    <div className="w-full p-6 glass-thick-red rounded-3xl flex flex-col gap-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Global OS Repositories 2026</h3>
        <span className="px-3 py-1 rounded-full bg-red-900/50 border border-red-500/30 text-xs font-mono text-red-300">Live Sync</span>
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs font-mono text-red-400 border-b border-red-900/50 pb-2">
        <div>LIBRARY NAME</div>
        <div>STARS (2026)</div>
        <div>CATEGORY</div>
        <div>STATUS</div>
      </div>

      {[1,2,3,4,5].map((i) => (
        <div key={i} className="grid grid-cols-4 gap-4 items-center p-3 rounded-xl bg-red-950/30 hover:bg-red-900/50 border border-transparent hover:border-red-500/20 transition-all cursor-pointer">
          <div className="font-bold text-white">Aceternity v3.0</div>
          <div className="text-red-200">245.8k</div>
          <div className="text-red-300/70">WebGL UI</div>
          <div><span className="px-2 py-1 rounded-md bg-green-950/50 border border-green-500/30 text-green-400 text-[10px]">Active</span></div>
        </div>
      ))}
    </div>
  );
}`
  },
  {
    id: "gsap-loader-screen",
    title: "Cinematic GSAP Loader",
    category: "Sections & Cards",
    description: "Deep red transition loader screen utilizing GSAP for heavy masking and typography scaling.",
    source: "Belentani Experience",
    featured: true,
    kind: "featured",
    tags: ["entrance choreography"],
    code: `import { useEffect } from "react";

export function CinematicLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0000]">
      <div className="text-center relative">
        <div className="text-[12vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 opacity-20 absolute inset-0 blur-xl">BELENTANI</div>
        <h2 className="text-[10vw] font-black text-white relative z-10 mix-blend-overlay">BELENTANI</h2>
        <div className="h-1 w-64 bg-red-950 mx-auto mt-8 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 w-1/3 animate-pulse rounded-full shadow-[0_0_10px_rgba(255,0,0,0.8)]" />
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: "belentani-sidebar",
    title: "Thick Glass Sidebar",
    category: "Navigation",
    description: "A highly refractive vertical navigation pane tailored for Belentani Tour experiences.",
    source: "Belentani Core UI",
    featured: true,
    kind: "featured",
    tags: ["glassmorphism"],
    code: `import { cn } from "@/lib/utils";

export function BelentaniSidebar() {
  return (
    <aside className="w-72 h-screen glass-thick-red border-r border-red-500/30 p-6 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-400 shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-white/20" />
        <span className="text-xl font-black text-white">Experience Tour</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {['Dashboard', 'Assets', 'GSAP Config', 'WebGL Shaders'].map(item => (
          <button key={item} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-900/40 text-red-100 font-medium transition-colors border border-transparent hover:border-red-500/20">
            {item}
          </button>
        ))}
      </div>
    </aside>
  );
}`
  },
  {
    id: "kinetic-nav",
    title: "GSAP Kinetic Navigation",
    category: "Navigation",
    description: "Floating navigation bar with heavy elasticity using GSAP spring logic. Built for premium SaaS.",
    source: "2026 UI Frameworks",
    featured: true,
    kind: "featured",
    tags: ["entrance choreography", "glassmorphism"],
    code: `import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";
import gsap from "gsap";

export function KineticNav() {
  const navRef = useRef(null);

  useEffect(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "elastic.out(1, 0.3)",
      delay: 0.5
    });
  }, []);

  return (
    <nav ref={navRef} className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl rounded-2xl glass-thick-red px-6 py-4 flex items-center justify-between z-50">
      <div className="text-white font-black text-xl tracking-tighter">BELENTANI<span className="text-red-500">.UI</span></div>
      <ul className="flex gap-6 text-red-200 font-bold text-sm">
        <li className="hover:text-white cursor-pointer transition-colors">Extracts</li>
        <li className="hover:text-white cursor-pointer transition-colors">Database</li>
        <li className="hover:text-white cursor-pointer transition-colors">Pricing</li>
      </ul>
      <button className="px-5 py-2 rounded-xl bg-gradient-to-b from-red-500 to-red-700 hover:scale-105 text-white font-bold transition-all shadow-[0_5px_15px_rgba(255,0,0,0.5)] border border-red-400/50">
        Inject API
      </button>
    </nav>
  );
}`
  },
  {
    id: "refractive-auth",
    title: "Refractive Auth Form",
    category: "AI & Auth",
    description: "Login panel injected with deep blur maps. Pure aesthetic for restricted data access.",
    source: "DarkWeb Open 2026",
    featured: true,
    kind: "featured",
    tags: ["glassmorphism"],
    code: `import { cn } from "@/lib/utils";

export function RefractiveAuth() {
  return (
    <div className="w-full max-w-md p-10 glass-thick-red rounded-[2.5rem] relative overflow-hidden group border border-red-500/20">
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-600/30 rounded-full blur-[60px] pointer-events-none group-hover:bg-red-500/40 transition-colors" />
      <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">System Access</h2>
      <p className="text-red-300/80 font-medium mb-8">Authenticate to quantum database.</p>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest">Neural ID</label>
          <input type="text" className="w-full bg-black/40 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all placeholder:text-red-800" placeholder="Enter identification..." />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest">Passkey</label>
          <input type="password" className="w-full bg-black/40 border border-red-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all placeholder:text-red-800" placeholder="••••••••" />
        </div>
        <button className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-red-700 to-red-500 text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(200,0,0,0.4)] border border-red-400/50">
          Initialize Sync
        </button>
      </div>
    </div>
  );
}`
  },
  {
    id: "ai-command-palette",
    title: "AI Command Palette",
    category: "AI & Auth",
    description: "The core mechanic of 2026. Global search and AI injection interface (⌘K) styled with red glow.",
    source: "Belentani Engine",
    featured: true,
    kind: "featured",
    tags: ["keyboard shortcut hints", "glassmorphism"],
    code: `import { cn } from "@/lib/utils";

export function AICommandPalette() {
  return (
    <div className="w-full max-w-2xl glass-thick-red rounded-3xl overflow-hidden border border-red-500/40 shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col">
      <div className="p-5 border-b border-red-500/20 flex items-center gap-4 bg-red-950/40">
        <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.8)] animate-pulse" />
        <input
          type="text"
          placeholder="Prompt the Belentani UI Engine..."
          className="flex-1 bg-transparent border-none text-white text-lg font-medium focus:outline-none placeholder:text-red-700/60"
        />
        <div className="px-2 py-1 rounded bg-red-900/50 border border-red-500/30 text-[10px] font-mono text-red-300">ESC</div>
      </div>
      <div className="p-4 bg-[#0a0000]/60 max-h-80 overflow-y-auto">
        <div className="text-[10px] font-bold font-mono text-red-500 uppercase mb-3 px-2 tracking-widest">Global Injections</div>
        <div className="space-y-2">
          {['Extract GSAP Architecture', 'Initialize Thick Glassmorphism', 'Deploy Holographic Analytics Grid'].map((cmd, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-900/40 text-red-100 font-medium transition-colors border border-transparent hover:border-red-500/30 text-left">
              <span className="text-red-500 font-mono text-xs opacity-70">0{i+1}</span>
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: "kinetic-pricing-cards",
    title: "Kinetic Pricing Cards",
    category: "Pricing",
    description: "Deep red tier selections. Leverages intense shadows and thick borders for tier differentiation.",
    source: "Open Data Pricing",
    featured: true,
    kind: "featured",
    tags: ["entrance choreography"],
    code: `import { cn } from "@/lib/utils";

export function KineticPricing() {
  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-8 items-center">
      {[
        { tier: 'Starter', price: '0', extra: 'border-red-900/50 hover:border-red-500/30 bg-red-950/20' },
        { tier: 'Pro', price: '49', extra: 'scale-105 border-red-400/50 glass-thick-red shadow-[0_0_50px_rgba(255,0,0,0.2)]' },
        { tier: 'Enterprise', price: '99', extra: 'border-red-900/50 hover:border-red-500/30 bg-red-950/20' }
      ].map((plan, i) => (
        <div key={i} className={cn("rounded-[2rem] p-8 flex flex-col gap-6 transition-all duration-500 border group", plan.extra)}>
          <div>
            <h3 className="text-xl font-bold text-red-100 uppercase tracking-widest">{plan.tier}</h3>
            <div className="text-5xl font-black text-white mt-4 drop-shadow-md">
              \${plan.price}<span className="text-lg text-red-400/50 font-medium">/mo</span>
            </div>
          </div>
          <ul className="space-y-4 flex-1 mt-4">
            {[1,2,3,4].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-red-200/80 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                WebGL Feature {f}
              </li>
            ))}
          </ul>
          <button className="w-full mt-6 py-4 rounded-xl bg-white/5 hover:bg-red-600 text-white font-bold transition-all border border-red-500/20 hover:border-transparent">
            Select Plan
          </button>
        </div>
      ))}
    </div>
  );
}`
  },
  {
    id: "holographic-metric",
    title: "Holographic Stats Widget",
    category: "Data & Dashboards",
    description: "Compact data visualizer with glowing procedural red bars and blur mapping.",
    source: "Belentani Analytics",
    featured: true,
    kind: "featured",
    tags: ["glassmorphism"],
    code: `import { cn } from "@/lib/utils";

export function HolographicMetric() {
  return (
    <div className="w-80 glass-thick-red rounded-3xl p-6 relative overflow-hidden group cursor-pointer border border-red-500/30 hover:border-red-400/60 transition-colors">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-400 blur-xl opacity-0 group-hover:opacity-10 transition duration-500" />
      <div className="relative z-10 flex flex-col gap-2">
        <div className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest flex items-center justify-between">
          Bandwidth <span className="text-red-300 bg-red-950 px-2 py-0.5 rounded border border-red-500/30">+14.2%</span>
        </div>
        <div className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,0,0,0.4)] mt-2">
          8.4<span className="text-2xl text-red-500">TB/s</span>
        </div>

        {/* Procedural Bar Chart */}
        <div className="h-16 w-full mt-4 flex items-end gap-1.5">
          {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-red-900/50 to-red-500/30 rounded-t-sm hover:to-red-400 transition-colors relative group-hover:animate-pulse"
              style={{ height: \`\${h}%\`, animationDelay: \`\${i * 0.1}s\` }}
            >
              <div className="absolute top-0 w-full h-1 bg-red-400 rounded-t-sm shadow-[0_0_5px_rgba(255,0,0,0.8)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: "cyberpunk-ticker",
    title: "Cyberpunk Data Ticker",
    category: "Typography & Motion",
    description: "An infinite scrolling data ticker for real-time WebGL extraction statistics.",
    source: "Global Data Feeds",
    featured: true,
    kind: "featured",
    tags: ["infinite marquee"],
    code: `import { cn } from "@/lib/utils";

export function CyberpunkTicker() {
  return (
    <div className="w-full overflow-hidden bg-red-950/80 border-y border-red-500/30 py-3 relative flex items-center">
      <div className="absolute left-0 w-20 h-full bg-gradient-to-r from-red-950/80 to-transparent z-10" />
      <div className="absolute right-0 w-20 h-full bg-gradient-to-l from-red-950/80 to-transparent z-10" />

      <div className="flex gap-8 animate-[ticker_20s_linear_infinite] whitespace-nowrap px-4">
        {[1, 2, 3].map((set) => (
          <div key={set} className="flex gap-8 items-center">
            {['ACETERNITY: ACTIVE', 'GSAP: LOADED', 'SHADERS: COMPILED', 'GLASSMORPHISM: MAX'].map((msg, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-sm shadow-[0_0_8px_rgba(255,0,0,1)]" />
                <span className="text-xs font-black font-mono text-red-300 tracking-widest uppercase">{msg}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Tailwind Config Extension Needed for Animation */}
      {/* theme: { extend: { keyframes: { ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } } } } } */}
    </div>
  );
}`
  }
];
