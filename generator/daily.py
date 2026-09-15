#!/usr/bin/env python3
"""Belentani Daily Engine — procedural asset generator (no API, no network).

Each day this script appends ONE brand-new React component to
``data/generated.jsonl``. The file is append-only: nothing is ever rewritten
or deleted. Re-running the same day is a no-op (idempotent).

Usage:
    python generator/daily.py                 # generate today's asset
    python generator/daily.py --days 7        # backfill the last 7 days
    python generator/daily.py --date 20260101 # generate a specific day
    python generator/daily.py --dry-run       # print, do not write
    python generator/daily.py --force         # regenerate an existing day
    python generator/daily.py --stats         # print store statistics

Deterministic: the seed is the date (YYYYMMDD), so the same day always
produces the same asset.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORE = ROOT / "data" / "generated.jsonl"

CATEGORY = "Daily"
SOURCE = "Belentani Daily Engine"
AUTHOR = "@belentani-daily"
GENERATOR_VERSION = "1.0.0"

# --------------------------------------------------------------------------- #
# Variant axes
# --------------------------------------------------------------------------- #

PALETTES = {
    "ember": ("from-red-500 to-orange-600", "0 10px 30px rgba(255,80,20,.35)"),
    "crimson": ("from-red-600 to-rose-700", "0 10px 30px rgba(220,20,60,.35)"),
    "scarlet": ("from-red-400 to-red-700", "0 10px 30px rgba(255,40,40,.35)"),
    "ruby": ("from-rose-500 to-red-800", "0 10px 30px rgba(190,20,80,.35)"),
    "garnet": ("from-red-700 to-red-950", "0 10px 30px rgba(120,0,0,.45)"),
    "vermilion": ("from-orange-500 to-red-700", "0 10px 30px rgba(230,70,20,.35)"),
    "neon": ("from-red-500 to-fuchsia-600", "0 10px 30px rgba(255,0,120,.35)"),
    "obsidian": ("from-zinc-800 to-red-950", "0 10px 30px rgba(40,0,0,.55)"),
    "frost": ("from-rose-300 to-red-500", "0 10px 30px rgba(255,150,160,.35)"),
    "molten": ("from-amber-500 to-red-700", "0 10px 30px rgba(255,140,0,.35)"),
}

ANIMATIONS = ["none", "pulse", "bounce", "shimmer", "float", "glow", "fade-in"]

RADII = ["xl", "2xl", "3xl", "[2rem]"]
LAYOUTS = ["centered", "split", "inline"]

ADJECTIVES = [
    "Ember", "Crimson", "Scarlet", "Ruby", "Vermilion", "Garnet", "Molten",
    "Neon", "Obsidian", "Frost", "Iron", "Silk", "Void", "Solar", "Velvet",
    "Aurora", "Basalt", "Cinder", "Dusk", "Fable", "Glacier", "Halo", "Ivory",
    "Jasper", "Karma", "Lumen", "Mirage", "Nova", "Onyx", "Prism", "Quartz",
    "Rift", "Sable", "Titan", "Umbra", "Vortex", "Wraith", "Zenith",
]

# type -> (noun, human label)
TYPES = {
    "button": "Button",
    "card": "Card",
    "badge": "Badge",
    "banner": "Banner",
    "stat": "Stat Tile",
    "input": "Field",
    "avatar": "Profile Chip",
    "toast": "Toast",
    "chip": "Chip",
}

LABELS = [
    "Deploy to production", "Start the tour", "Extract assets", "Inject API",
    "Sync now", "Run audit", "Open dashboard", "Generate report", "Ship it",
    "Explore the vault", "Connect engine", "Rebuild index",
]
CTAS = ["Explore", "Get started", "Learn more", "Activate", "Initialize", "Continue"]
STAT_LABELS = ["Throughput", "Latency", "Bandwidth", "Uptime", "Extractions", "Tokens/s"]
STAT_UNITS = ["ms", "TB/s", "%", "k/s", "rpm"]
ROLES = ["Core Engineer", "Data Alchemist", "Systems Architect", "Void Operator"]
INPUT_PLACEHOLDERS = ["you@belentani.dev", "Enter identification…", "Search the registry…"]
TOAST_TITLES = ["Extraction complete", "Sync finished", "New asset generated"]
TOAST_BODIES = ["Your daily component is ready.", "12 new entries indexed.", "Thick glass rendering applied."]


def _class_for(anim: str, uid: str) -> str:
    if anim in ("none",):
        return ""
    if anim in ("pulse", "bounce"):
        return f" animate-{anim}"
    return f" gen-{anim}-{uid}"


def _style_for(anim: str, uid: str) -> str:
    """Return a JSX <style> block (as a string) for the animation, or ''."""
    css = None
    if anim == "shimmer":
        css = (
            f"@keyframes gen-shimmer-{uid}{{0%{{transform:translateX(-120%)}}"
            f"100%{{transform:translateX(220%)}}}}"
            f".gen-shimmer-{uid}{{position:relative;overflow:hidden}}"
            f".gen-shimmer-{uid}::after{{content:'';position:absolute;inset:0;"
            f"transform:translateX(-120%);background:linear-gradient(90deg,"
            f"transparent,rgba(255,255,255,.35),transparent);"
            f"animation:gen-shimmer-{uid} 2.2s infinite}}"
        )
    elif anim == "float":
        css = (
            f"@keyframes gen-float-{uid}{{0%,100%{{transform:translateY(0)}}"
            f"50%{{transform:translateY(-8px)}}}}"
            f".gen-float-{uid}{{animation:gen-float-{uid} 4s ease-in-out infinite}}"
        )
    elif anim == "glow":
        css = (
            f"@keyframes gen-glow-{uid}{{0%,100%{{box-shadow:0 0 18px rgba(255,60,60,.35)}}"
            f"50%{{box-shadow:0 0 42px rgba(255,60,60,.7)}}}}"
            f".gen-glow-{uid}{{animation:gen-glow-{uid} 2.6s ease-in-out infinite}}"
        )
    elif anim == "fade-in":
        css = (
            f"@keyframes gen-fade-{uid}{{from{{opacity:0;transform:translateY(12px)}}"
            f"to{{opacity:1;transform:translateY(0)}}}}"
            f".gen-fade-{uid}{{animation:gen-fade-{uid} .6s ease-out both}}"
        )
    if not css:
        return ""
    return "<style>{`" + css + "`}</style>"


# --------------------------------------------------------------------------- #
# Component templates (token substitution — avoids f-string brace collisions)
# --------------------------------------------------------------------------- #

TEMPLATES = {
    "button": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <button
        type="button"
        className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-%%RADIUS%% bg-gradient-to-br %%PALETTE%% text-white font-bold tracking-tight shadow-[%%SHADOW%%] border border-white/20 transition-transform duration-300 hover:scale-[1.04] active:scale-[0.98]%%ANIMCLASS%%"
      >
        <span className="absolute inset-0 rounded-%%RADIUS%% bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10">%%LABEL%%</span>
        <span className="relative z-10 transition-transform group-hover:translate-x-0.5">-&gt;</span>
      </button>
    </>
  );
}
""",
    "card": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <article className="w-full max-w-sm rounded-%%RADIUS%% p-6 glass-thick-red border border-red-500/20%%ANIMCLASS%%">
        <div className="w-12 h-12 rounded-%%RADIUS2%% bg-gradient-to-br %%PALETTE%% shadow-[%%SHADOW%%] mb-4" />
        <h3 className="text-lg font-bold text-white">%%TITLE%%</h3>
        <p className="text-sm text-red-200/70 mt-2 leading-relaxed">%%DESC%%</p>
        <button className="mt-5 w-full py-2.5 rounded-%%RADIUS2%% bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-bold transition-colors">
          %%CTA%%
        </button>
      </article>
    </>
  );
}
""",
    "badge": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r %%PALETTE%% text-white text-xs font-black uppercase tracking-widest border border-white/20%%ANIMCLASS%%">
        <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
        %%LABEL%%
      </span>
    </>
  );
}
""",
    "banner": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <section className="w-full rounded-%%RADIUS%% p-8 glass-thick-red border border-red-500/20 relative overflow-hidden%%ANIMCLASS%%">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br %%PALETTE%% blur-[90px] opacity-40" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">%%TITLE%%</h2>
          <p className="text-red-200/80 mt-3">%%DESC%%</p>
          <button className="mt-6 px-6 py-3 rounded-%%RADIUS2%% bg-gradient-to-br %%PALETTE%% text-white font-bold shadow-[%%SHADOW%%] border border-white/20">
            %%CTA%%
          </button>
        </div>
      </section>
    </>
  );
}
""",
    "stat": """import React from "react";

export function %%NAME%%() {
  const bars = [%%BARS%%];

  return (
    <>
      %%STYLE%%
      <div className="w-64 rounded-%%RADIUS%% p-6 glass-thick-red border border-red-500/20%%ANIMCLASS%%">
        <p className="text-[10px] font-mono uppercase tracking-widest text-red-400">%%LABEL%%</p>
        <p className="text-4xl font-black text-white mt-2 font-mono tabular-nums">
          %%VALUE%%<span className="text-lg text-red-400">%%UNIT%%</span>
        </p>
        <div className="h-12 mt-4 flex items-end gap-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-gradient-to-t %%PALETTE%%"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
}
""",
    "input": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <div className="w-full max-w-sm">
        <label
          htmlFor="%%ID%%"
          className="text-[10px] font-mono uppercase tracking-widest text-red-400"
        >
          %%LABEL%%
        </label>
        <input
          id="%%ID%%"
          type="text"
          placeholder="%%PLACEHOLDER%%"
          className="mt-2 w-full rounded-%%RADIUS%% bg-black/40 border border-red-500/30 px-4 py-3 text-white placeholder:text-red-800 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/40 transition%%ANIMCLASS%%"
        />
      </div>
    </>
  );
}
""",
    "avatar": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <div className="inline-flex items-center gap-3 rounded-full glass-panel pl-1.5 pr-4 py-1.5 border border-red-500/20%%ANIMCLASS%%">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br %%PALETTE%% shadow-[%%SHADOW%%] border border-white/20" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">%%NAME_TEXT%%</p>
          <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest">%%ROLE%%</p>
        </div>
      </div>
    </>
  );
}
""",
    "toast": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <div
        role="status"
        className="flex items-start gap-3 w-full max-w-sm rounded-%%RADIUS%% p-4 glass-thick-red border border-red-500/30 shadow-[%%SHADOW%%]%%ANIMCLASS%%"
      >
        <span className="mt-1 w-2 h-2 rounded-full bg-gradient-to-br %%PALETTE%%" />
        <div className="flex-1">
          <p className="text-sm font-bold text-white">%%TITLE%%</p>
          <p className="text-xs text-red-200/70 mt-0.5">%%DESC%%</p>
        </div>
        <button className="text-red-400 hover:text-white transition-colors" aria-label="Dismiss">
          x
        </button>
      </div>
    </>
  );
}
""",
    "chip": """import React from "react";

export function %%NAME%%() {
  return (
    <>
      %%STYLE%%
      <button className="inline-flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 glass-panel border border-red-500/25 text-red-100 text-xs font-bold hover:border-red-400/60 transition-colors%%ANIMCLASS%%">
        <span className="w-5 h-5 rounded-full bg-gradient-to-br %%PALETTE%%" />
        %%LABEL%%
      </button>
    </>
  );
}
""",
}


def build_asset(seed: int) -> dict:
    rng = random.Random(seed)
    type_key = rng.choice(list(TYPES))
    palette_name = rng.choice(list(PALETTES))
    palette, shadow = PALETTES[palette_name]
    anim = rng.choice(ANIMATIONS)
    radius = rng.choice(RADII)
    radius2 = rng.choice(RADII)
    adjective = rng.choice(ADJECTIVES)
    noun = TYPES[type_key]

    slug = f"{adjective.lower()}-{noun.lower().replace(' ', '-')}"
    uid = hashlib.sha1(f"{seed}-{type_key}-{palette_name}-{anim}".encode()).hexdigest()[:8]
    name = f"{adjective}{noun.replace(' ', '')}"

    title = f"{adjective} {noun}"
    desc = (
        f"{adjective} {noun.lower()} with {anim.replace('-', ' ')} motion and a "
        f"{palette_name} gradient. Generated by the Belentani daily engine."
    )

    code = TEMPLATES[type_key]
    replacements = {
        "%%NAME%%": name,
        "%%TITLE%%": title,
        "%%DESC%%": desc,
        "%%PALETTE%%": palette,
        "%%SHADOW%%": shadow,
        "%%RADIUS2%%": radius2,
        "%%RADIUS%%": radius,
        "%%ANIMCLASS%%": _class_for(anim, uid),
        "%%STYLE%%": _style_for(anim, uid),
        "%%ID%%": f"{slug}-{uid}",
        "%%LABEL%%": rng.choice(LABELS if type_key != "stat" else STAT_LABELS),
        "%%CTA%%": rng.choice(CTAS),
        "%%PLACEHOLDER%%": rng.choice(INPUT_PLACEHOLDERS),
        "%%NAME_TEXT%%": adjective,
        "%%ROLE%%": rng.choice(ROLES),
        "%%VALUE%%": str(rng.choice([2, 8, 12, 24, 48, 99, 128, 256])),
        "%%UNIT%%": rng.choice(STAT_UNITS),
        "%%BARS%%": ", ".join(str(rng.randint(25, 100)) for _ in range(7)),
    }
    for token, value in replacements.items():
        code = code.replace(token, value)

    if type_key == "toast":
        code = code.replace("Extraction complete", rng.choice(TOAST_TITLES))
        code = code.replace("Your daily component is ready.", rng.choice(TOAST_BODIES))

    digest = hashlib.sha256(code.encode("utf-8")).hexdigest()[:16]
    iso = datetime.strptime(str(seed), "%Y%m%d").replace(tzinfo=timezone.utc).isoformat()

    return {
        "id": f"gen-{seed}-{slug}",
        "title": title,
        "category": CATEGORY,
        "description": desc,
        "source": SOURCE,
        "author": AUTHOR,
        "tags": ["generated", type_key, anim, palette_name],
        "kind": "generated",
        "code": code,
        "createdAt": iso,
        "seed": seed,
        "hash": digest,
        "generatorVersion": GENERATOR_VERSION,
    }


def load_existing() -> tuple[set, int]:
    ids: set = set()
    count = 0
    if not STORE.exists():
        return ids, count
    with STORE.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                ids.add(entry["id"])
                count += 1
            except (json.JSONDecodeError, KeyError):
                # Never delete or "fix" a line: just skip it on read.
                continue
    return ids, count


def append_entry(entry: dict) -> None:
    STORE.parent.mkdir(parents=True, exist_ok=True)
    with STORE.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
        fh.flush()
        os.fsync(fh.fileno())


def seed_for(day: date) -> int:
    return int(day.strftime("%Y%m%d"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Belentani daily asset generator")
    parser.add_argument("--days", type=int, default=1, help="generate the last N days (default 1)")
    parser.add_argument("--date", type=str, default=None, help="generate a specific day (YYYYMMDD)")
    parser.add_argument("--dry-run", action="store_true", help="print without writing")
    parser.add_argument("--force", action="store_true", help="regenerate days that already exist")
    parser.add_argument("--stats", action="store_true", help="print store statistics and exit")
    args = parser.parse_args(argv)

    existing, total = load_existing()

    if args.stats:
        print(f"store: {STORE}")
        print(f"entries: {total}")
        return 0

    if args.date:
        days = [datetime.strptime(args.date, "%Y%m%d").date()]
    else:
        today = date.today()
        days = [today - timedelta(days=offset) for offset in range(args.days - 1, -1, -1)]

    created = 0
    for day in days:
        seed = seed_for(day)
        asset = build_asset(seed)
        if asset["id"] in existing and not args.force:
            print(f"skip   {asset['id']} (already exists)")
            continue
        if args.dry_run:
            print(json.dumps(asset, indent=2, ensure_ascii=False))
        else:
            append_entry(asset)
            existing.add(asset["id"])
            created += 1
            print(f"create {asset['id']}  [{asset['title']}]  {asset['hash']}")

    if not args.dry_run:
        print(f"done: {created} new asset(s), {len(existing)} total")
    return 0


if __name__ == "__main__":
    sys.exit(main())
