import React, { useState } from "react";
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { User as UserType } from "../types";
import Logo from "./Logo";
import { getUsers, addUser, syncGoogleUser } from "../lib/db";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email) {
        throw new Error("Email tidak ditemukan dari akun Google Anda.");
      }

      // Sync user to Firestore
      const syncedUser = await syncGoogleUser(user.uid, user.displayName || "Pengguna Google", user.email);
      
      setIsLoading(false);
      onSuccess(syncedUser);
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Gagal masuk menggunakan Google. Silakan coba lagi.";
      if (e.code === 'auth/popup-blocked') {
        errorMsg = "Popup diblokir oleh browser Anda. Izinkan popup untuk situs ini.";
      } else if (e.message) {
        errorMsg = e.message;
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
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

    try {
      const users = await getUsers();

      if (mode === "register") {
        const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          setError("Email ini sudah terdaftar. Silakan pilih Masuk.");
          setIsLoading(false);
          return;
        }

        const newUserBase = {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: password,
          role: "user" as const,
          createdAt: new Date().toISOString(),
        };

        const docRef = await addUser(newUserBase);
        
        setIsLoading(false);
        onSuccess({ id: docRef.id, ...newUserBase });
      } else {
        // Mode Login
        let foundUser = users.find(
          (u) => (u.email.toLowerCase() === email.toLowerCase() || u.name === email) && u.password === password
        );

        // Fallback khusus Admin
        if (!foundUser && (email.toLowerCase() === "akunadmin" || email.toLowerCase() === "admin@parafaseku.com") && password === "admin123") {
          foundUser = {
            id: "usr_admin",
            name: "Budi Administrator",
            email: "admin@parafaseku.com",
            role: "admin",
            password: "admin123",
            createdAt: new Date().toISOString()
          };
        }

        if (!foundUser) {
          setError("Kombinasi email/username atau kata sandi tidak valid.");
          setIsLoading(false);
          return;
        }

        setIsLoading(false);
        onSuccess(foundUser);
      }
    } catch (e) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsLoading(false);
      console.error(e);
    }
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
                Alamat Email
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
                  placeholder="name@email.com"
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-semibold tracking-wider">
                Atau lanjut dengan
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm cursor-pointer disabled:opacity-75"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Masuk dengan Google</span>
          </button>

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
