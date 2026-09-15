import React, { useState, useEffect, useRef } from 'react';
import { Asset } from '../types';
import { Code2, Check, Copy, X, TerminalSquare, ExternalLink, BadgeCheck, Library, Box, WandSparkles } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import gsap from 'gsap';

interface AssetModalProps {
  asset: Asset;
  onClose: () => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function AssetModal({ asset, onClose }: AssetModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    if (!prefersReducedMotion()) {
      gsap.fromTo(bgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' },
      );
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    if (prefersReducedMotion()) {
      onClose();
      return;
    }
    gsap.to(bgRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.9,
      y: 30,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleCopyPrompt = () => {
    const prompt = `Belentani experience tour extraction: Create a new component in my project using the following React/Tailwind/GSAP code. Adapt it to the thick glossy red glassmorphism theme:\n\n\`\`\`tsx\n${asset.code}\n\`\`\``;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const kindIcon =
    asset.kind === 'library' ? (
      <Library size={16} />
    ) : asset.kind === 'featured' ? (
      <BadgeCheck size={16} />
    ) : asset.kind === 'generated' ? (
      <WandSparkles size={16} />
    ) : (
      <Box size={16} />
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12"
      role="dialog"
      aria-modal="true"
      aria-label={`${asset.title} details`}
    >
      <div ref={bgRef} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleClose} />

      <div
        ref={modalRef}
        className="relative w-full max-w-6xl h-[85vh] glass-thick-red rounded-3xl flex flex-col overflow-hidden shadow-[0_0_100px_rgba(255,0,0,0.2)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-red-500/30 bg-red-950/50 backdrop-blur-2xl">
          <div className="min-w-0">
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 drop-shadow-md truncate">
              <TerminalSquare className="text-red-400 shrink-0" size={24} />
              <span className="truncate">{asset.title}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-900 border border-red-500/30 text-red-200">
                {asset.category}
              </span>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/40 border border-red-500/20 text-red-300 flex items-center gap-1">
                {kindIcon}
                {asset.kind ?? 'component'}
              </span>
              <span className="text-[11px] text-red-400/80 font-mono flex items-center gap-1 font-bold">
                {asset.author ? (
                  <>
                    Author: <span className="text-white">{asset.author}</span>
                  </>
                ) : (
                  <>
                    Extract Source: <span className="text-white">{asset.source}</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {asset.url && (
              <a
                href={asset.url}
                target="_blank"
                rel="noreferrer noopener"
                className="hidden sm:flex items-center gap-2 glass-panel text-red-100 px-5 py-3 rounded-xl text-sm font-bold hover:bg-red-900/50 transition-colors border border-red-500/30"
              >
                <ExternalLink size={16} /> Open on 21st.dev
              </a>
            )}
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 bg-gradient-to-b from-white to-red-100 text-red-950 px-6 py-3 rounded-xl text-sm font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)] border border-white/50"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              <span className="hidden sm:inline">{copied ? 'Extraction Complete' : 'Copy Source Code'}</span>
            </button>
            <button
              ref={closeRef}
              onClick={handleClose}
              aria-label="Close dialog"
              className="p-3 text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900/80 rounded-xl transition-colors border border-red-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#0a0000]/60">
          {/* Sidebar Context */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-red-500/20 p-8 bg-red-950/20 overflow-y-auto">
            <div className="space-y-8">
              <div>
                <h3 className="text-[11px] font-black text-red-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,1)]" />
                  Description
                </h3>
                <p className="text-sm text-red-100/90 leading-relaxed font-medium">{asset.description}</p>
              </div>

              {(asset.tags?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-[11px] font-black text-red-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,1)]" />
                    Features
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags!.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-red-950/80 border border-red-500/20 text-red-300 font-mono shadow-inner"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[11px] font-black text-red-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,1)]" />
                  Integration
                </h3>
                <p className="text-sm text-red-300/80 leading-relaxed">
                  {asset.kind === 'featured'
                    ? 'In-house Belentani component. Copy the source below and inject it directly into your architecture.'
                    : asset.kind === 'generated'
                      ? 'Generated autonomously by the Belentani daily engine — no API, no network. Copy the source below and drop it straight into your project.'
                      : 'Extracted from the 21st.dev community registry. Install it with the shadcn CLI, then adapt it to the thick glossy red glassmorphism theme.'}
                </p>
              </div>

              {asset.kind === 'generated' && (
                <div>
                  <h3 className="text-[11px] font-black text-red-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,1)]" />
                    Generation
                  </h3>
                  <dl className="space-y-2 text-xs font-mono">
                    {asset.createdAt && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-red-500 uppercase tracking-widest">Created</dt>
                        <dd className="text-red-100">{asset.createdAt.slice(0, 10)}</dd>
                      </div>
                    )}
                    {asset.seed !== undefined && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-red-500 uppercase tracking-widest">Seed</dt>
                        <dd className="text-red-100">{asset.seed}</dd>
                      </div>
                    )}
                    {asset.hash && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-red-500 uppercase tracking-widest">Hash</dt>
                        <dd className="text-red-100 truncate">{asset.hash}</dd>
                      </div>
                    )}
                  </dl>
                  <p className="text-[11px] text-red-400/70 mt-3 leading-relaxed">
                    Appended to <span className="font-mono text-red-300">data/generated.jsonl</span> by the Belentani
                    daily engine. Deterministic for this date; never overwritten.
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-[11px] font-black text-red-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(255,0,0,1)]" />
                  Dependencies
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(asset.kind === 'featured'
                    ? ['react', 'lucide-react', 'gsap', 'tailwindcss']
                    : asset.kind === 'generated'
                      ? ['react', 'tailwindcss']
                      : ['react', 'tailwindcss', 'shadcn/ui', 'lucide-react']
                  ).map((dep) => (
                    <span
                      key={dep}
                      className="text-[10px] font-bold px-2.5 py-1.5 rounded-md bg-red-950/80 border border-red-500/20 text-red-300 font-mono shadow-inner"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Code View */}
          <div className="flex-1 flex flex-col min-w-0 h-full relative bg-black/40">
            <div className="flex items-center gap-2 px-6 py-3 border-b border-red-500/20 bg-red-950/30 backdrop-blur-md absolute top-0 w-full z-10">
              <Code2 size={16} className="text-red-500" />
              <span className="text-xs font-bold font-mono text-red-300">{asset.id}.tsx</span>
            </div>
            <div className="flex-1 overflow-auto pt-14">
              <SyntaxHighlighter
                language="tsx"
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '2rem', background: 'transparent', fontSize: '0.9rem', lineHeight: '1.7' }}
                wrapLines={true}
                showLineNumbers={true}
                lineNumberStyle={{ minWidth: '3.5em', paddingRight: '1.5em', color: '#880011', textAlign: 'right', fontWeight: 'bold' }}
              >
                {asset.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
