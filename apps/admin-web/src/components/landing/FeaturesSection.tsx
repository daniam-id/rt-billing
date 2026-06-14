'use client';

import { motion } from 'framer-motion';
import {
  EASE, DUR, Reveal, SectionHeading, Check,
  Droplet, Receipt, Cpu,
} from './shared';

const features = [
  {
    Icon: Droplet,
    title: 'Mesin Utilitas Multi-tingkat',
    sub: 'Meteran Air PDAM',
    points: ['Pencatatan meter awal & akhir', 'Tarif per meter kubik otomatis', 'Tagihan delta per periode', 'Riwayat meter yang immutable'],
  },
  {
    Icon: Receipt,
    title: 'Akuntansi Flat-rate Otomatis',
    sub: 'Sampah & Keamanan',
    points: ['Modul tarif tetap per warga', 'Inisialisasi periode massal', 'Konfigurasi layanan parsial', 'Rekonsiliasi audit tanpa selisih'],
  },
  {
    Icon: Cpu,
    title: 'Pusat Komando AI Agent',
    sub: 'Intelijen Operasional',
    points: ['Pemicu siklus tagihan otomatis', 'Deteksi anomali baca meter', 'Analisis tren rasio koleksi', 'API terstruktur untuk integrasi agent'],
  },
];

const steps = [
  ['01', 'Daftarkan Warga', 'Impor data rumah tangga dan tetapkan paket layanan — PDAM, sampah, keamanan, atau kombinasi.'],
  ['02', 'Inisialisasi Periode', 'Buat tagihan satu periode untuk seluruh warga sekaligus. Catat meteran, sistem hitung otomatis.'],
  ['03', 'Lacak & Audit', 'Tandai pembayaran, pantau rasio koleksi, dan ekspor buku besar yang teraudit penuh.'],
];

export function FeaturesSection() {
  return (
    <>
      <section id="features" className="bg-canvas border-b border-border py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <SectionHeading
            eyebrow="Matriks Fitur Enterprise"
            title="Modul inti untuk administrasi lingkungan"
            subtitle="Tiga pilar sistem yang menggantikan spreadsheet manual dengan kontrol finansial penuh."
          />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {features.map(({ Icon, title, sub, points }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: DUR.entry, ease: EASE, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: '#94A3B8' }}
                className="group border border-border rounded-2xl p-6 bg-canvas cursor-default"
                style={{ transitionProperty: 'border-color' }}
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: DUR.micro, ease: EASE }}
                  className="w-11 h-11 rounded-xl border border-border bg-surface flex items-center justify-center mb-4 text-text-secondary group-hover:text-brand group-hover:border-brand/30 transition-colors duration-150"
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                <p className="text-xs text-text-muted mt-0.5 mb-4">{sub}</p>
                <ul className="space-y-2.5">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-success/10 text-success flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-b border-border py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <SectionHeading
            eyebrow="Cara Kerja"
            title="Tiga langkah, nol kerumitan"
            subtitle="Dari pendaftaran warga sampai laporan teraudit — semua dalam satu alur."
          />
          <div className="relative grid md:grid-cols-3 gap-8 mt-14">
            {/* connecting line */}
            <div className="hidden md:block absolute top-5 left-[16%] right-[16%] h-px bg-border" />
            {steps.map(([num, title, body], i) => (
              <Reveal key={num} delay={i * 0.12} className="relative text-center">
                <div className="mx-auto w-11 h-11 rounded-full bg-canvas border border-border flex items-center justify-center text-sm font-bold text-brand mb-4 relative z-10">
                  {num}
                </div>
                <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed max-w-xs mx-auto">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
