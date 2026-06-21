import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { User as UserType } from "../types";
import Logo from "./Logo";

interface AuthPageProps {
  initialMode?: "login" | "register";
  onSuccess: (user: UserType) => void;
  onBackToLanding: () => void;
}

export default function AuthPage({ initialMode = "login", onSuccess, onBackToLanding }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk mendapatkan semua user yang terdaftar di localStorage
  const getRegisteredUsers = (): UserType[] => {
    try {
      const usersRaw = localStorage.getItem("paraphrase_users_db_v1");
      return usersRaw ? JSON.parse(usersRaw) : [];
    } catch (e) {
      return [];
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Silakan isi semua bidang (email dan password).");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("Silakan masukkan nama lengkap Anda.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter untuk keamanan Anda.");
      return;
    }

    setIsLoading(true);

    // Simulasi loading sebentar agar kelihatan natural & pro
    setTimeout(() => {
      const users = getRegisteredUsers();

      if (mode === "register") {
        // Cek apakah email sudah terdaftar
        const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          setError("Email ini sudah terdaftar. Silakan pilih Masuk.");
          setIsLoading(false);
          return;
        }

        // Daftarkan user baru
        const newUser: UserType = {
          id: `usr_${Date.now()}`,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password, // Di simpan aman di client/browser demo
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem("paraphrase_users_db_v1", JSON.stringify(updatedUsers));
        
        setIsLoading(false);
        onSuccess({ id: newUser.id, name: newUser.name, email: newUser.email });
      } else {
        // Mode Login
        let foundUser = users.find(
          (u) => (u.email.toLowerCase() === email.toLowerCase() || u.name === email) && u.password === password
        );

        // Dukungan khusus 'akunadmin' & 'admin123'
        if ((email.toLowerCase() === "akunadmin" || email.toLowerCase() === "akunadmin@admin.com" || email.toLowerCase() === "admin@parafaseku.com") && password === "admin123") {
          foundUser = {
            id: "usr_admin",
            name: "Budi Administrator",
            email: "admin@parafaseku.com",
            role: "admin"
          };
          
          // Seed ke list lokal jika belum tercatat
          const exists = users.some(u => u.id === "usr_admin");
          if (!exists) {
            const updatedUsers = [...users, { ...foundUser, password: "admin123" }];
            localStorage.setItem("paraphrase_users_db_v1", JSON.stringify(updatedUsers));
          }
        }

        if (!foundUser) {
          setError("Kombinasi email/username atau kata sandi tidak valid. Silakan periksa kembali.");
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        onSuccess({ id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role });
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-slate-800">
      
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-100/30 blur-[120px] pointer-events-none -z-10" />

      {/* Tombol kembali ke landing di atas kiri */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToLanding}
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition flex items-center gap-1 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg"
        >
          ← Beranda
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <Logo size="lg" className="mb-4" />
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru Anda"}
          </h2>
          <p className="mt-2 text-xs text-slate-500">
            {mode === "login" 
              ? "Masuk untuk menggunakan fitur bypass deteksi AI sepuasnya." 
              : "Registrasi cepat & gratis, miliki kendali penuh atas tulisanmu."}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 border border-slate-200/80 shadow-xl rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Verifikasi</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email atau Username Admin
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com atau username admin"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                💡 Untuk login Admin default: gunakan <strong>akunadmin</strong> dan password <strong>admin123</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mode === "register" && (
                <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed">
                  Saran: Gunakan kombinasi huruf, angka, dan karakter khusus.
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/5 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === "login" ? "Masuk ke Akun" : "Daftar Akun"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              {mode === "login" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}
            </span>{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
            >
              {mode === "login" ? "Daftar di sini" : "Masuk di sini"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
