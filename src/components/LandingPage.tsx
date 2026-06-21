import React from "react";
import { Sparkles, ArrowRight, Shield, Zap, FileText, Cpu, CheckCircle } from "lucide-react";
import Logo from "./Logo";

interface LandingPageProps {
  onStart: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onStart, onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-white font-sans text-slate-800">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
            >
              Masuk
            </button>
            <button
              onClick={onRegisterClick}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/10 transition"
            >
              Daftar Gratis
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Decorative Blur */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[70%] h-[350px] bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <Zap className="h-3.5 w-3.5 text-blue-500 fill-blue-500/20" />
              <span>Detektor AI Bypass &amp; Parafrase Instan</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
              Tulis Layaknya <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                Manusia Sejati
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Konversi tulisan bermesin atau kaku hasil AI menjadi paragraf yang natural, berkelas, dan 100% lolos pemindaian detektor AI terpopuler secara instan.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200"
              >
                Mulai Gunakan Sekarang
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onLoginClick}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Sudah Punya Akun? Masuk
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 w-full">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">99.8%</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Bypass Score</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">10k+</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Pengguna Aktif</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">&lt;2 Detik</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Kecepatan Proses</p>
              </div>
            </div>
          </div>
          
          {/* Hero Mockup Panel */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[420px] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
              {/* Fake Window Controls */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-4">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">parafrase-ai.id</span>
              </div>
              
              {/* Fake UI: Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-700">🌿 Humanize</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Akademis</span>
                </div>
              </div>

              {/* Fake UI: Textboxes area */}
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Teks Kaku AI</span>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                    "Dalam era modernisasi, penggunaan kecerdasan buatan menyajikan signifikansi luar biasa..."
                  </p>
                </div>
                
                <div className="bg-blue-50/20 rounded-xl p-3 border border-blue-100">
                  <span className="text-[9px] font-mono font-bold text-blue-600 uppercase">Hasil Manusiawi</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1 line-clamp-2">
                    "Hari ini kecerdasan buatan tidak lagi asing dan memberikan pengaruh besar bagi kehidupan kita..."
                  </p>
                </div>
              </div>

              {/* Fake UI: Bottom Detector score display */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <span className="font-semibold text-slate-600">Skor Kemiripan Teks:</span>
                <span className="font-mono font-black text-emerald-600">12% (Bebas Plagiasi)</span>
              </div>
            </div>
            
            {/* Ambient blur effects behind mockup */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Keunggulan Utama / Bento Grid feature */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
              MENGAPA KAMI?
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-950">
              Fitur Premium untuk Hasil Tulisan Luar Biasa
            </h3>
            <p className="text-sm text-slate-500">
              Dirakit khusus dengan teknologi pemrosesan linguistik tercanggih untuk tingkat kecocokan terbaik.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Gaya Penulisan Cerdas</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pilih dari 6 sub-gaya penulisan berbeda, mulai dari Humanize, Akademis, Kasual, Profesional, hingga Kreatif untuk berbagai kebutuhan tugas atau karir Anda.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Bebas Detektor AI</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Algoritma kami dirancang khusus dan terus dilatih untuk melewati pemindai populer, mengubah kalimat berulang menjadi untaian kata yang hangat dan luwes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-950">Privasi &amp; Riwayat Terjamin</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Semua proyek parafrase Anda disimpan dengan enkripsi privat di peramban dan halaman profil tersendiri sehingga aman dari pengintip data eksterior.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 sm:p-12 md:p-16 text-center text-white overflow-hidden shadow-xl shadow-blue-600/10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="max-w-2xl mx-auto space-y-6 relative">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Siap Mengubah Tulisan Anda Menjadi Keren?
            </h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Bergabunglah dengan ribuan mahasiswa, blogger, dan jurnalis profesional yang telah menggunakan Parafrase AI untuk meningkatkan kualitas tulisan harian.
            </p>
            <div className="pt-4">
              <button
                onClick={onStart}
                className="px-8 py-4 bg-white hover:bg-blue-50 text-blue-600 font-bold text-base rounded-xl cursor-pointer shadow-md transition-all inline-flex items-center gap-2"
              >
                Uji Coba Sekarang (Gratis)
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo iconOnly size="sm" />
            <p>© 2026 Parafaseku. Hak Cipta Dilindungi Undang-Undang.</p>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-blue-600 cursor-pointer">Syarat &amp; Ketentuan</span>
            <span className="hover:text-blue-600 cursor-pointer">Kebijakan Privasi</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
