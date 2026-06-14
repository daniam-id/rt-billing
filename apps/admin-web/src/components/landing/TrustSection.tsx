'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  EASE, DUR, Reveal, SectionHeading,
  ShieldCheck, Lock, Layers, Gauge, Quote,
} from './shared';

function AnimatedCounter({ target, suffix = '', decimals = 0 }: { target: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}

const stats = [
  { label: 'Indeks Ketersediaan', target: 99.9, suffix: '%', decimals: 1 },
  { label: 'Cakupan Audit', target: 100, suffix: '%', decimals: 0 },
  { label: 'Integritas Data', target: 100, suffix: '%', decimals: 0 },
  { label: 'Operasi Destruktif', target: 0, suffix: '', decimals: 0, note: 'diizinkan' },
];

const cards = [
  { Icon: ShieldCheck, title: 'Jejak Audit Immutable', body: 'Setiap mutasi tagihan bersifat append-only. Catatan historis terkunci tulis setelah periode ditutup — tidak ada penghapusan retroaktif.' },
  { Icon: Lock, title: 'Pagar Pengaman Operasional', body: 'Operasi destruktif pada periode tagihan yang sudah lunas diblokir di lapisan service. Integritas referensial dijaga via kebijakan Restrict FK.' },
  { Icon: Layers, title: 'Partisi Data', body: 'Data warga, tagihan, dan pembayaran terpartisi ketat. Isolasi data antar-tenant by design.' },
  { Icon: Gauge, title: 'Autentikasi Stateless JWT', body: 'Semua rute admin dilindungi token JWT berumur pendek. Tanpa penyimpanan sesi — model autentikasi sepenuhnya stateless.' },
];

export function TrustSection() {
  return (
    <section id="trust" className="bg-canvas border-b border-border py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionHeading
          eyebrow="Kepercayaan, Keamanan & Audit"
          title="Dibangun untuk operator yang tak bisa kompromi"
          subtitle="Integritas data bukan fitur tambahan — ini fondasi sistem."
        />

        {/* Stat band */}
        <Reveal delay={0.1} className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border rounded-2xl overflow-hidden">
          {stats.map(({ label, target, suffix, decimals, note }) => (
            <div key={label} className="bg-canvas p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
                <AnimatedCounter target={target} suffix={suffix} decimals={decimals} />
                {note && <span className="text-sm font-medium text-text-muted ml-1">{note}</span>}
              </div>
              <div className="text-xs text-text-muted mt-2">{label}</div>
            </div>
          ))}
        </Reveal>

        {/* Security cards */}
        <div className="grid md:grid-cols-2 gap-5 mt-6">
          {cards.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: DUR.entry, ease: EASE, delay: i * 0.08 }}
              className="flex gap-4 border border-border rounded-2xl bg-canvas p-6"
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-brand">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mt-1.5">{body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <Reveal delay={0.1} className="mt-6">
          <figure className="border border-border rounded-2xl bg-surface p-8 md:p-10 text-center max-w-3xl mx-auto">
            <Quote className="w-8 h-8 text-border mx-auto mb-4" />
            <blockquote className="text-lg md:text-xl text-text-primary leading-relaxed font-medium">
              “Dulu rekap iuran warga butuh tiga hari penuh dan masih sering selisih. Sekarang satu periode selesai dalam hitungan menit, dan laporannya bisa langsung dipertanggungjawabkan ke warga.”
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand/10 border border-border flex items-center justify-center text-sm font-bold text-brand">PH</div>
              <div className="text-left">
                <div className="text-sm font-semibold text-text-primary">Pak Hartono</div>
                <div className="text-xs text-text-muted">Ketua RT 04 / RW 09</div>
              </div>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
