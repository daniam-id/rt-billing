'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, DUR, Reveal, SectionHeading, CTAButton, Plus } from './shared';

const faqs = [
  ['Apakah RT-Billing mendukung tarif PDAM bertingkat?', 'Ya. Mesin utilitas menghitung tagihan berdasarkan selisih meteran awal dan akhir dikalikan tarif per meter kubik, dan mendukung beberapa tingkat tarif sekaligus.'],
  ['Bagaimana dengan iuran tetap seperti sampah dan keamanan?', 'Iuran flat-rate dikonfigurasi per warga dan diinisialisasi massal per periode. Anda bisa mengaktifkan layanan parsial untuk warga tertentu.'],
  ['Bisakah data tagihan yang sudah lunas dihapus?', 'Tidak. Operasi destruktif pada periode yang sudah lunas diblokir di lapisan service untuk menjaga integritas audit. Hanya periode yang belum dibayar yang dapat di-reset.'],
  ['Apakah perlu instalasi server sendiri?', 'Tidak perlu setup rumit. Cukup masuk ke dashboard, dan seluruh manajemen warga, tagihan, serta buku besar tersedia di satu antarmuka.'],
];

function FaqItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl bg-canvas overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-text-primary">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: DUR.micro, ease: EASE }} className="shrink-0 text-text-muted">
          <Plus className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const footerCols = [
  ['Produk', ['Fitur', 'Dashboard', 'Keamanan', 'Harga']],
  ['Modul', ['Utilitas PDAM', 'Iuran Sampah', 'Keamanan', 'AI Agent']],
  ['Sumber Daya', ['Dokumentasi', 'Panduan RT/RW', 'API', 'Dukungan']],
];

export function ClosingSection() {
  return (
    <>
      {/* FAQ */}
      <section id="faq" className="bg-surface border-b border-border py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <SectionHeading eyebrow="FAQ" title="Pertanyaan yang sering diajukan" />
          <div className="mt-10 space-y-3">
            {faqs.map(([q, a], i) => (
              <Reveal key={q} delay={i * 0.06}>
                <FaqItem q={q} a={a} defaultOpen={i === 0} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-canvas border-b border-border py-24">
        <Reveal className="relative max-w-4xl mx-auto px-6 md:px-8">
          <div className="relative border border-border rounded-3xl bg-surface overflow-hidden px-8 py-16 text-center">
            <div
              className="pointer-events-none absolute inset-0 [background-size:24px_24px] opacity-50"
              style={{
                backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
                maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 30%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, #000 30%, transparent 100%)',
              }}
            />
            <div className="relative space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary tracking-tight leading-tight">
                Siap modernkan operasi<br className="hidden md:block" /> tagihan lingkungan Anda?
              </h2>
              <p className="text-base text-text-secondary leading-relaxed max-w-xl mx-auto">
                Kelola warga, inisialisasi periode tagihan, dan lacak setiap transaksi dari satu antarmuka terpadu.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <CTAButton label="Akses Dashboard" className="!px-8 !py-4 text-base" />
                <CTAButton label="Pelajari Fitur" href="#features" variant="secondary" icon={false} className="!px-8 !py-4 text-base" />
              </div>
              <p className="text-xs text-text-muted">Tanpa setup. Data Anda, kendali Anda.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-canvas">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
                  <span className="w-3 h-3 rounded-sm bg-white/90 block" />
                </div>
                <span className="text-sm font-bold text-text-primary">RT-Billing</span>
              </Link>
              <p className="text-sm text-text-muted leading-relaxed max-w-xs">
                Platform administrasi tagihan lingkungan yang teraudit penuh untuk pengurus RT/RW modern.
              </p>
            </div>
            {footerCols.map(([title, links]) => (
              <div key={title as string}>
                <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">{title}</h4>
                <ul className="space-y-2">
                  {(links as string[]).map((l) => (
                    <li key={l}>
                      <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">© {new Date().getFullYear()} RT-Billing. Semua hak dilindungi.</p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150">Privasi</Link>
              <Link href="/login" className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150">Ketentuan</Link>
              <Link href="/login" className="text-xs text-text-muted hover:text-text-primary transition-colors duration-150">Masuk</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
