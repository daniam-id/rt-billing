'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CTAButton, EASE, DUR, Reveal } from './shared';

const NAV_LINKS = [
  ['Fitur', '#features'],
  ['Dashboard', '#preview'],
  ['Keamanan', '#trust'],
  ['FAQ', '#faq'],
];

function LandingNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.entry, ease: EASE }}
      className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-md border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <span className="w-3 h-3 rounded-sm bg-white/90 block" />
          </div>
          <span className="text-sm font-bold text-text-primary tracking-tight">RT-Billing</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
          >
            Masuk
          </Link>
          <CTAButton label="Mulai Sekarang" icon={false} className="!px-4 !py-2" />
        </div>
      </div>
    </motion.header>
  );
}

const heroStagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.entry, ease: EASE, delay },
});

export function HeroSection() {
  return (
    <>
      <LandingNav />
      <section className="relative bg-canvas border-b border-border overflow-hidden">
        {/* Faint dot-grid texture with radial fade mask */}
        <div
          className="pointer-events-none absolute inset-0 [background-size:26px_26px] opacity-60"
          style={{
            backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <motion.div {...heroStagger(0.05)} className="inline-flex items-center gap-2 border border-border bg-surface rounded-full px-3 py-1">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-success opacity-60 animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
              </span>
              <span className="text-xs text-text-secondary font-medium">Platform Tagihan Lingkungan Enterprise</span>
            </motion.div>

            <motion.h1 {...heroStagger(0.15)} className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              <span className="text-text-primary">Tagihan Warga,</span>
              <br />
              <span className="bg-gradient-to-br from-text-primary via-text-primary to-text-secondary bg-clip-text text-transparent">
                Otomatis & Tanpa Selisih.
              </span>
            </motion.h1>

            <motion.p {...heroStagger(0.25)} className="text-base md:text-lg text-text-secondary leading-relaxed max-w-md">
              RT-Billing menyatukan meteran air PDAM, iuran sampah & keamanan flat-rate, dan buku besar transaksi yang teraudit penuh — dirancang khusus untuk pengurus RT/RW.
            </motion.p>

            <motion.div {...heroStagger(0.35)} className="flex flex-wrap items-center gap-3">
              <CTAButton label="Akses Dashboard" className="!px-7 !py-3.5 text-base" />
              <CTAButton label="Lihat Fitur" href="#features" variant="secondary" icon={false} className="!px-7 !py-3.5 text-base" />
            </motion.div>

            <motion.div {...heroStagger(0.45)} className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-4">
              {[
                ['100%', 'Jejak Audit'],
                ['3-tingkat', 'Mesin Utilitas'],
                ['< 1 dtk', 'Buat Laporan'],
              ].map(([val, lbl]) => (
                <div key={lbl} className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-text-primary">{val}</span>
                  <span className="text-xs text-text-muted">{lbl}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — floating wireframe mock */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: DUR.entry, ease: EASE, delay: 0.5 }}
            className="relative"
          >
            {/* offset layered border for depth (no shadow) */}
            <div className="absolute -inset-3 rounded-2xl border border-border/60 bg-surface/40" />
            <div className="relative border border-border rounded-xl bg-surface p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <span className="w-2.5 h-2.5 rounded-full bg-border" />
                <div className="flex-1 h-5 bg-border/50 rounded ml-2" />
              </div>
              <div className="flex gap-3 h-52">
                <div className="w-32 bg-canvas border border-border rounded-lg p-3 space-y-2 shrink-0">
                  {['Dashboard', 'Warga', 'Tagihan', 'Buku Besar'].map((item, i) => (
                    <div key={item} className={`h-7 rounded flex items-center gap-2 px-2 ${i === 0 ? 'bg-brand/10' : ''}`}>
                      <div className={`w-3 h-3 rounded ${i === 0 ? 'bg-brand/50' : 'bg-border'}`} />
                      <div className={`text-xs ${i === 0 ? 'text-brand font-medium' : 'text-text-muted'}`}>{item}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {['Tagih', 'Bayar', 'Rasio'].map((k) => (
                      <div key={k} className="bg-canvas border border-border rounded p-2">
                        <div className="text-[10px] text-text-muted">{k}</div>
                        <div className="h-3.5 w-10 bg-border/60 rounded mt-1" />
                      </div>
                    ))}
                  </div>
                  <div className="bg-canvas border border-border rounded p-2 space-y-1.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-5 bg-surface rounded flex items-center gap-2 px-2">
                        <div className="w-7 h-2.5 bg-border/60 rounded" />
                        <div className="flex-1 h-2.5 bg-border/40 rounded" />
                        <div className="w-8 h-2.5 bg-border/60 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <Reveal delay={0.1} className="relative border-t border-border bg-surface/50">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="text-xs text-text-muted">Dipercaya pengurus lingkungan modern</span>
            {['PDAM Terintegrasi', 'Iuran Sampah', 'Keamanan 24/7', 'Audit Penuh'].map((t) => (
              <span key={t} className="text-sm font-semibold text-text-secondary">{t}</span>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
