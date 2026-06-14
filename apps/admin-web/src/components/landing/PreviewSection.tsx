'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence, LayoutGroup } from 'framer-motion';
import { EASE, DUR, SectionHeading } from './shared';

const kpis = [
  { label: 'Total Ditagih', value: 'Rp 4.250.000', sub: 'Jun 2025 · 17 warga' },
  { label: 'Terkumpul', value: 'Rp 3.800.000', sub: '89,4% rasio koleksi' },
  { label: 'Tertunggak', value: 'Rp 450.000', sub: '2 warga belum bayar' },
  { label: 'Rasio Koleksi', value: '89,4%', sub: '+3,2% vs periode lalu' },
];
const rows = [
  ['RT-01 / Budi S.', 'Jun 2025', 'PDAM + Sampah', 'Rp 185.000', 'LUNAS'],
  ['RT-02 / Ani W.', 'Jun 2025', 'PDAM + Keamanan', 'Rp 220.000', 'LUNAS'],
  ['RT-03 / Cahyo P.', 'Jun 2025', 'Paket Lengkap', 'Rp 310.000', 'BELUM'],
  ['RT-04 / Dewi R.', 'Jun 2025', 'Sampah + Keamanan', 'Rp 140.000', 'LUNAS'],
  ['RT-05 / Eko M.', 'Jun 2025', 'PDAM Saja', 'Rp 95.000', 'BELUM'],
];
const NAV_ITEMS = ['Dashboard', 'Warga', 'Tagihan', 'Buku Besar'];
const HEADERS = ['Warga', 'Periode', 'Layanan', 'Jumlah', 'Status'];

export function PreviewSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [tableLoaded, setTableLoaded] = useState(false);

  useEffect(() => {
    if (inView) {
      const t = setTimeout(() => setTableLoaded(true), 850);
      return () => clearTimeout(t);
    }
  }, [inView]);

  return (
    <section id="preview" className="bg-surface border-b border-border py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <SectionHeading
          eyebrow="Pratinjau Langsung"
          title="Antarmuka admin yang sebenarnya"
          subtitle="Tampilan read-only dari dashboard yang akan Anda kelola setiap hari."
        />

        <div ref={ref} className="mt-12" style={{ perspective: 1400 }}>
          <motion.div
            initial={{ opacity: 0, rotateX: 8, scale: 0.96, y: 32 }}
            animate={inView ? { opacity: 1, rotateX: 0, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ transformStyle: 'preserve-3d' }}
            className="border border-border rounded-2xl bg-canvas overflow-hidden ring-1 ring-border/40"
          >
            {/* Title bar */}
            <div className="border-b border-border bg-surface px-4 py-2.5 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-danger/50" />
              <span className="w-3 h-3 rounded-full bg-warning/50" />
              <span className="w-3 h-3 rounded-full bg-success/50" />
              <span className="ml-4 text-xs text-text-muted font-mono">app.rt-billing.id/dashboard</span>
            </div>

            <div className="flex h-[460px] md:h-[500px]">
              {/* Sidebar with shared layout active morph */}
              <LayoutGroup>
                <div className="w-44 md:w-52 border-r border-border bg-surface p-4 shrink-0">
                  <div className="text-xs font-bold text-text-primary mb-4 tracking-widest uppercase">RT-Billing</div>
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item}
                      onClick={() => setActiveNav(item)}
                      className="relative w-full flex items-center gap-2 px-3 py-2 rounded-md mb-1 text-xs font-medium text-left"
                    >
                      {activeNav === item && (
                        <motion.span
                          layoutId="preview-nav-active"
                          className="absolute inset-0 rounded-md bg-brand"
                          transition={{ duration: DUR.micro * 1.6, ease: EASE }}
                        />
                      )}
                      <span className={`relative z-10 w-3 h-3 rounded shrink-0 ${activeNav === item ? 'bg-white/40' : 'bg-border'}`} />
                      <span className={`relative z-10 ${activeNav === item ? 'text-white' : 'text-text-secondary'}`}>{item}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>

              {/* Main */}
              <div className="flex-1 p-5 md:p-6 overflow-auto space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {kpis.map(({ label, value, sub }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: DUR.entry, ease: EASE, delay: 0.3 + i * 0.08 }}
                      className="border border-border rounded-lg p-3.5 bg-canvas"
                    >
                      <div className="text-xs text-text-muted mb-1">{label}</div>
                      <div className="text-sm md:text-base font-bold text-text-primary">{value}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">{sub}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-surface px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">Matriks Transaksi</span>
                    <AnimatePresence>
                      {tableLoaded && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[11px] text-success font-medium"
                        >
                          ● Live
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-surface">
                        {HEADERS.map((h) => (
                          <th key={h} className="px-4 py-2 text-left text-text-muted font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(([hh, period, svc, amt, status], i) => (
                        <tr key={hh} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                          {tableLoaded ? (
                            <>
                              <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className="px-4 py-2.5 font-medium text-text-primary">{hh}</motion.td>
                              <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 + 0.03 }} className="px-4 py-2.5 text-text-secondary">{period}</motion.td>
                              <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 + 0.04 }} className="px-4 py-2.5 text-text-secondary">{svc}</motion.td>
                              <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 + 0.05 }} className="px-4 py-2.5 font-mono text-text-primary">{amt}</motion.td>
                              <motion.td initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 + 0.06 }} className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${status === 'LUNAS' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{status}</span>
                              </motion.td>
                            </>
                          ) : (
                            HEADERS.map((_, ci) => (
                              <td key={ci} className="px-4 py-2.5">
                                <motion.div
                                  className="h-3 bg-border/60 rounded"
                                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', delay: ci * 0.05 }}
                                  style={{ width: ci === 0 ? '85%' : ci === 3 ? '70%' : '55%' }}
                                />
                              </td>
                            ))
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
          <p className="text-center text-xs text-text-muted mt-4">Klik menu sidebar di atas untuk melihat transisi status aktif.</p>
        </div>
      </div>
    </section>
  );
}
