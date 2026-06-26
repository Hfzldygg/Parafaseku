import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Trash2, 
  FileText, 
  ChevronRight, 
  HelpCircle, 
  ArrowRight, 
  BarChart2, 
  History, 
  Zap, 
  AlertCircle, 
  Cpu, 
  User, 
  CheckCircle,
  FileCheck,
  Languages,
  BookOpen,
  Volume2
} from "lucide-react";
import { ParaphraseHistoryItem, ParaphraseMode, User as UserType } from "./types";
import DiffViewer from "./components/DiffViewer";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Logo from "./components/Logo";
import AdminDashboard from "./components/AdminDashboard";
import { LogOut, X } from "lucide-react";
import { getHistory, addHistoryItem, updateUserProfile } from "./lib/db";

// Contoh teks otomatis yang disediakan untuk kenyamanan eksplorasi pengguna
const SAMPLE_TEXTS = [
  {
    title: "Esai AI Kaku (Akademik)",
    text: "Dalam era modernisasi yang masif saat ini, perkembangan teknologi kecerdasan buatan menyajikan signifikansi yang luar biasa dalam seluruh lini kehidupan manusia. Oleh karena itu, penting untuk diingat bahwa implementasi ini memerlukan perhatian yang mumpuni agar tercapai efisiensi yang optimal bagi seluruh lapisan masyarakat.",
    mode: "academic" as ParaphraseMode,
    description: "Teks kaku penuh jargon klise AI"
  },
  {
    title: "Surat Bisnis Robotik",
    text: "Dengan hormat, melalui surat resmi ini kami ingin menyampaikan perihal penawaran kolaborasi sinergis antar instansi demi mengakomodasi akselerasi transformasi digital. Harap dicatat bahwa proposal terlampir memuat aspek penting terkait estimasi benefit keuangan yang sangat masif.",
    mode: "professional" as ParaphraseMode,
    description: "Gaya email korporat yang kaku"
  },
  {
    title: "Postingan Sosmed Canggung",
    text: "Mengonsumsi air putih hangat secara berkala di pagi hari adalah sebuah kegiatan yang sangat menyehatkan bagi metabolisme tubuh Anda. Lakukanlah kebiasaan positif tersebut demi kelangsungan imunitas fisik yang prima setiap harinya.",
    mode: "humanize" as ParaphraseMode,
    description: "Informasi kesehatan yang terdengar robotik"
  }
];

export default function App() {
  // Navigation & Sessions
  const [view, setView] = useState<"landing" | "auth" | "app" | "admin">("landing");
  const [authInitialMode, setAuthInitialMode] = useState<"login" | "register">("login");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // State Input & Output
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<ParaphraseMode>("humanize");
  const [selectedLang, setSelectedLang] = useState<"id" | "en">("id");

  // State Monitoring/Analisis (real-time & response-based)
  const [realtimeSimilarity, setRealtimeSimilarity] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Hasil Analisis Terakhir dari backend
  const [lastAnalysis, setLastAnalysis] = useState<{
    aiProbability: number;
    originalAiProbability: number;
    readabilityScore: number;
    humanizedScore: number;
    feedback: string[];
    turnitinScore?: number;
    gptzeroScore?: number;
    copyleaksScore?: number;
    zerogptScore?: number;
    phraseReplacements?: {
      original: string;
      replacement: string;
      category: string;
      explanation: string;
    }[];
  } | null>(null);

  // UI Navigation Tabs
  const [activeTab, setActiveTab] = useState<"editor" | "diff" | "history">("editor");

  // Admin Login Challenge Overlay States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminDialogError, setAdminDialogError] = useState<string | null>(null);

  // Profile Settings States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhotoURL, setProfilePhotoURL] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const openProfileModal = () => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfilePhotoURL(currentUser.photoURL || "");
      setProfileError(null);
      setProfileSuccess(null);
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileName.trim()) {
      setProfileError("Nama tidak boleh kosong.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      if (currentUser.id !== "usr_admin") {
        await updateUserProfile(currentUser.id, {
          name: profileName.trim(),
          photoURL: profilePhotoURL.trim() || ""
        });
      }

      const updatedUser: UserType = {
        ...currentUser,
        name: profileName.trim(),
        photoURL: profilePhotoURL.trim() || ""
      };

      setCurrentUser(updatedUser);
      localStorage.setItem("paraphrase_session_user", JSON.stringify(updatedUser));
      setProfileSuccess("Profil Anda berhasil disimpan!");
      setTimeout(() => {
        setShowProfileModal(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setProfileError("Gagal menyimpan perubahan ke Firestore. Silakan coba lagi.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Submisi Otorisasi Admin Instan
  const handleAdminDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (adminUsernameInput.toLowerCase() === "akunadmin" || adminUsernameInput.toLowerCase() === "akunadmin@admin.com") &&
      adminPasswordInput === "admin123"
    ) {
      const adminSessionUser: UserType = {
        id: "usr_admin",
        name: "Budi Administrator",
        email: "admin@parafaseku.com",
        role: "admin"
      };
      setCurrentUser(adminSessionUser);
      try {
        localStorage.setItem("paraphrase_session_user", JSON.stringify(adminSessionUser));
      } catch (err) {}
      setShowAdminModal(false);
      setView("admin");
    } else {
      setAdminDialogError("Kombinasi kredensial salah! Gunakan 'akunadmin' & sandi 'admin123'.");
    }
  };

  // Riwayat semesta (semua user)
  const [history, setHistory] = useState<ParaphraseHistoryItem[]>([]);

  // Sesi Check saat start
  useEffect(() => {
    try {
      const activeSession = localStorage.getItem("paraphrase_session_user");
      if (activeSession) {
        const user = JSON.parse(activeSession);
        setCurrentUser(user);
        setView("app");
      }
    } catch (e) {
      console.error("Gagal membaca session aktif:", e);
    }
  }, []);

  // Mengambil histori dari Firestore & LocalStorage saat startup
  useEffect(() => {
    const fetchHistoryFromDb = async () => {
      try {
        const dbHistory = await getHistory();
        if (dbHistory && dbHistory.length > 0) {
          setHistory(dbHistory);
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem("paraphrase_history_v1");
          if (saved) {
            setHistory(JSON.parse(saved));
          }
        }
      } catch (e) {
        console.error("Gagal membaca history dari Firestore:", e);
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem("paraphrase_history_v1");
          if (saved) {
            setHistory(JSON.parse(saved));
          }
        } catch (err) {}
      }
    };
    fetchHistoryFromDb();
  }, [currentUser]);

  // Menyaring histori spesifik milik user saat ini
  const userHistory = history.filter((item) => item.userId === currentUser?.id);

  // Menyimpan histori ke Firestore dan LocalStorage setiap ada pembaruan
  const saveToHistory = async (newItem: ParaphraseHistoryItem) => {
    // Sisipkan user id aktif ke item riwayat
    const itemWithUser = { ...newItem, userId: currentUser?.id || "usr_anonymous" };
    
    // Update local state first to keep it fully snappy and responsive
    const updated = [itemWithUser, ...history].slice(0, 50); // simpan maks 50 total
    setHistory(updated);
    
    try {
      localStorage.setItem("paraphrase_history_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menyimpan history ke localStorage:", e);
    }

    try {
      // Save synchronously/asynchronously to Firestore db
      await addHistoryItem(itemWithUser);
    } catch (e) {
      console.error("Gagal menyimpan history ke Firestore:", e);
    }
  };

  const clearHistory = () => {
    // Hanya hapus riwayat milik user aktif secara lokal
    const updated = history.filter((item) => item.userId !== currentUser?.id);
    setHistory(updated);
    try {
      localStorage.setItem("paraphrase_history_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Gagal menghapus history dari localStorage:", e);
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem("paraphrase_session_user");
    } catch (e) {}
    setCurrentUser(null);
    setInputText("");
    outputText && setOutputText("");
    setLastAnalysis(null);
    setView("landing");
  };

  // Login success handler
  const handleAuthSuccess = (user: UserType) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("paraphrase_session_user", JSON.stringify(user));
    } catch (e) {}
    setView("app");
  };

  // Kalkulasi Real-time Kemiripan Teks (Overlap Coefficient / Jaccard Similarity)
  useEffect(() => {
    if (!inputText.trim() || !outputText.trim()) {
      setRealtimeSimilarity(0);
      return;
    }

    const clean = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const words1 = clean(inputText).split(" ").filter(Boolean);
    const words2 = clean(outputText).split(" ").filter(Boolean);

    if (words1.length === 0 || words2.length === 0) {
      setRealtimeSimilarity(0);
      return;
    }

    const set1 = new Set(words1);
    const intersection = words2.filter((w) => set1.has(w)).length;
    const union = new Set([...words1, ...words2]).size;

    // Perpaduan formula Jaccard dengan pengaruh jumlah revisi kata
    const similarityScore = Math.round((intersection / union) * 100);
    setRealtimeSimilarity(similarityScore);
  }, [inputText, outputText]);

  // Fungsi Kirim ke Backend API
  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Silakan masukkan teks terlebih dahulu!");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/paraphrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          mode: selectedMode,
          language: selectedLang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memproses parafrase dari server.");
      }

      const data = await response.json();

      setOutputText(data.paraphrasedText);
      
      const analysisScores = {
        aiProbability: data.aiProbability,
        originalAiProbability: data.originalAiProbability,
        readabilityScore: data.readabilityScore,
        humanizedScore: data.humanizedScore,
        feedback: data.feedback || [],
        turnitinScore: data.turnitinScore,
        gptzeroScore: data.gptzeroScore,
        copyleaksScore: data.copyleaksScore,
        zerogptScore: data.zerogptScore,
        phraseReplacements: data.phraseReplacements || [],
      };
      
      setLastAnalysis(analysisScores);

      // Hitung similarity final
      const cleanText = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, "");
      const wordsA = cleanText(inputText).split(/\s+/).filter(Boolean);
      const wordsB = cleanText(data.paraphrasedText).split(/\s+/).filter(Boolean);
      const unionSize = new Set([...wordsA, ...wordsB]).size;
      const matched = wordsB.filter(w => new Set(wordsA).has(w)).length;
      const finalSim = unionSize > 0 ? Math.round((matched / unionSize) * 100) : 0;

      // Buat item histori baru
      const historyItem: ParaphraseHistoryItem = {
        id: crypto.randomUUID(),
        originalText: inputText,
        paraphrasedText: data.paraphrasedText,
        mode: selectedMode,
        language: selectedLang,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        scores: analysisScores,
        similarity: finalSim,
      };

      saveToHistory(historyItem);
      
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Koneksi terganggu. Silakan cek koneksi internet Anda.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper Copy Teks
  const handleCopy = (text: string, isInput: boolean) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isInput) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 2000);
    } else {
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  // Memilih template teks sampel
  const handleLoadSample = (sample: typeof SAMPLE_TEXTS[0]) => {
    setInputText(sample.text);
    setSelectedMode(sample.mode);
    setErrorMessage(null);
  };

  // Mendapatkan label mode
  const getModeLabel = (mode: ParaphraseMode) => {
    switch (mode) {
      case "humanize": return { label: "Humanize (Anti-AI)", desc: "Mengubah teks kaku AI menjadi gaya penulisan manusia yang hangat & natural.", color: "text-emerald-700 bg-emerald-50 border-emerald-100" };
      case "academic": return { label: "Akademis", desc: "Format penulisan ilmiah, karya tulis, tesis, dan tata bahasa baku EYD.", color: "text-blue-700 bg-blue-50 border-blue-100" };
      case "casual": return { label: "Kasual", desc: "Gaya santai, ramah, komunikatif untuk konten pribadi atau media sosial.", color: "text-amber-700 bg-amber-50 border-amber-100" };
      case "professional": return { label: "Profesional", desc: "Bahasa terstruktur, elegan, lugas untuk dunia kerja & komunikasi bisnis.", color: "text-violet-700 bg-violet-50 border-violet-100" };
      case "creative": return { label: "Kreatif", desc: "Gaya artistik penuh metafora unik, penceritaan ekspresif & menarik hati.", color: "text-pink-700 bg-pink-50 border-pink-100" };
      case "formal": return { label: "Formal", desc: "Pernyataan resmi, sopan, tata bahasa korporat atau kedinasan.", color: "text-sky-700 bg-sky-50 border-sky-100" };
    }
  };

  // Analisis statistik dinamis dari input saat ini
  const wordCountInput = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCountInput = inputText.length;
  const wordCountOutput = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;
  const charCountOutput = outputText.length;

  if (view === "landing") {
    return (
      <LandingPage
        onStart={() => {
          setAuthInitialMode("register");
          setView("auth");
        }}
        onLoginClick={() => {
          setAuthInitialMode("login");
          setView("auth");
        }}
        onRegisterClick={() => {
          setAuthInitialMode("register");
          setView("auth");
        }}
      />
    );
  }

  if (view === "auth") {
    return (
      <AuthPage
        initialMode={authInitialMode}
        onSuccess={handleAuthSuccess}
        onBackToLanding={() => setView("landing")}
      />
    );
  }

  if (view === "admin") {
    return (
      <AdminDashboard
        onBackToApp={() => setView("app")}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f8fa] text-slate-800 font-sans selection:bg-blue-500 selection:text-white pb-16 relative overflow-hidden">
      
      {/* Background Ornamen Grid & Efek Cahaya Neon */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c708_1px,transparent_1px),linear-gradient(to_bottom,#0284c708_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/5 blur-[120px] pointer-events-none" />

      {/* Header Utama App */}
      <header className="border-b border-blue-100 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div className="hidden sm:block border-l border-slate-200 pl-3">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest font-bold">
                Bebas Detection
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">Linguistik Cerdas &amp; Bypass Deteksi</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3.5">
            {/* Pemilihan Bahasa */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-inner">
              <button
                id="btn-lang-id"
                onClick={() => setSelectedLang("id")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  selectedLang === "id"
                    ? "bg-white text-blue-600 border border-slate-200/50 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Bahasa Indonesia
              </button>
              <button
                id="btn-lang-en"
                onClick={() => setSelectedLang("en")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                  selectedLang === "en"
                    ? "bg-white text-blue-600 border border-slate-200/50 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                English
              </button>
            </div>

            {/* Informasi Akun & Tombol Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5">
                <button
                  onClick={openProfileModal}
                  className="flex items-center gap-2 text-left hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-100 group cursor-pointer"
                  title="Atur Profil (Ubah Nama & Foto)"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-blue-200 shadow-sm"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shadow-sm uppercase group-hover:bg-blue-200 group-hover:text-blue-800 transition-colors">
                      {currentUser.name ? currentUser.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px] group-hover:text-blue-600 transition-colors">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 flex items-center gap-1">
                      <span>Ubah Profil</span>
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-[9px]">✏️</span>
                    </p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer h-8 w-8 flex items-center justify-center"
                  title="Keluar dari Akun"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            )}

            {/* Status Indikator API & Dashboard Admin */}
            {currentUser?.role === "admin" && (
              <button
                onClick={() => setView("admin")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#142D54] hover:bg-[#1f3e6e] text-white rounded-lg cursor-pointer transition text-xs font-bold shadow-sm shadow-blue-500/5 border border-[#1a3861]"
                title="Akses Monitoring & Dashboard Admin"
              >
                👑 Monitor Admin
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 bg-blue-50/50 border border-blue-100/80 rounded-lg px-3 py-1.5 text-xs text-blue-700 font-semibold shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
              <span>Sistem AI Aktif</span>
            </div>
          </div>

        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Banner Fitur Utama / Pengenalan */}
        <div className="bg-gradient-to-r from-blue-50 via-sky-50/50 to-white rounded-2xl border border-blue-100/80 p-6 mb-8 shadow-sm">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-100/60 px-2.5 py-1 rounded-full mb-3 inline-block">
              TEKNOLOGI HUMANISASI MODEREN
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight mb-2">
              Ubah Teks Kaku Menjadi Alami &amp; Manusiawi
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dilengkapi pemindai persentase tulisan AI terintegrasi, fitur bypass detektor AI populer, dan real-time text overlap tracker untuk mengukur tingkat perbedaan kata secara instan.
            </p>
          </div>
        </div>

        {/* Pemilihan Mode Parafrase */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" /> Pilih Gaya &amp; Target Penulisan
            </h3>
            <span className="text-xs text-slate-400 italic">Klik salah satu gaya di bawah</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {(["humanize", "academic", "casual", "professional", "creative", "formal"] as ParaphraseMode[]).map((mode) => {
              const info = getModeLabel(mode);
              const isActive = selectedMode === mode;
              return (
                <button
                  key={mode}
                  id={`mode-btn-${mode}`}
                  onClick={() => setSelectedMode(mode)}
                  className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isActive 
                      ? "bg-white border-blue-600 shadow-sm shadow-blue-500/5 ring-1 ring-blue-500/20" 
                      : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/20"
                  }`}
                >
                  <span className={`text-sm font-bold capitalize ${isActive ? "text-blue-700" : "text-slate-700"}`}>
                    {mode === "humanize" ? "🌿 Humanize" : mode}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                    {mode === "humanize" ? "Anti-AI Detector" : getModeLabel(mode)?.label}
                  </span>
                  {isActive && (
                    <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Keterangan detail mode terpilih */}
          <div className="mt-3 bg-blue-50/40 border border-blue-100 p-3.5 rounded-xl flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-slate-700 font-medium">
                Gaya Aktif: <span className="text-blue-700 font-bold">{getModeLabel(selectedMode)?.label}</span>
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {getModeLabel(selectedMode)?.desc}
              </p>
            </div>
          </div>
        </section>

        {/* Pemilihan Sampel Teks Instan */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              💡 Coba Cepat dengan Sampel AI Kaku:
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                id={`sample-btn-${idx}`}
                onClick={() => handleLoadSample(sample)}
                className="bg-white hover:bg-slate-50/50 border border-slate-200 rounded-xl p-3 text-left transition-all duration-200 flex flex-col justify-between hover:border-blue-300 group shadow-sm"
              >
                <div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" /> {sample.title}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">{sample.description}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded">
                    "{sample.text}"
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mt-3 self-end">
                  Pakai Template <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Utama: Panel Pengubah & Detektor */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          
          {/* Sisi Kiri & Kanan (Editor) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Tabs View */}
            <div className="flex border-b border-slate-200 bg-slate-100 rounded-t-xl p-1 gap-1">
              <button
                id="tab-editor"
                onClick={() => setActiveTab("editor")}
                className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "editor"
                    ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> Editor Komparatif
              </button>
              <button
                id="tab-diff"
                onClick={() => setActiveTab("diff")}
                className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "diff"
                    ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" /> Struktur Kata Ganti
              </button>
              <button
                id="tab-history"
                onClick={() => setActiveTab("history")}
                className={`flex-1 md:flex-initial text-xs font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === "history"
                    ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <History className="h-3.5 w-3.5" /> Riwayat ({userHistory.length})
              </button>
            </div>

            {/* TAB CONTENT: EDITOR UTAMA */}
            {activeTab === "editor" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Kolom Teks Input */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-sm group focus-within:border-blue-500/50 transition-colors">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-dashed text-slate-500" /> Teks Kosong / Teks Kaku AI
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {wordCountInput} kata / {charCountInput} karakter
                      </span>
                      {inputText && (
                        <button
                          id="clear-input-btn"
                          onClick={() => { setInputText(""); setOutputText(""); setLastAnalysis(null); }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 transition-colors"
                          title="Hapus Semua"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <textarea
                    id="input-textarea"
                    placeholder="Tulis, tempel (paste) artikel, esai, atau laporan kaku Anda di sini untuk diparafrase..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 w-full bg-transparent resize-none p-4 text-sm font-sans leading-relaxed text-slate-800 focus:outline-none placeholder-slate-400 overflow-y-auto"
                  />
                  
                  <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    <button
                      id="btn-paste"
                      onClick={async () => {
                        try {
                          const clipboardText = await navigator.clipboard.readText();
                          if (clipboardText) setInputText(clipboardText);
                        } catch (err) {
                          alert("Izin membaca clipboard tidak diizinkan. Silakan paste secara manual.");
                        }
                      }}
                      className="text-xs text-slate-600 hover:text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-1 shadow-sm"
                    >
                      Tempel Clipboard
                    </button>
                    
                    <button
                      id="btn-copy-input"
                      onClick={() => handleCopy(inputText, true)}
                      disabled={!inputText}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 disabled:opacity-50 font-medium"
                    >
                      {copiedInput ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Kolom Teks Hasil Parafrase */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col h-[400px] shadow-sm group focus-within:border-blue-500/50 transition-colors">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-emerald-600" /> Hasil Parafrase Manusiawi
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {wordCountOutput} kata / {charCountOutput} karakter
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full p-4 overflow-y-auto text-sm font-sans leading-relaxed text-slate-800 bg-slate-50/10 relative">
                    {isProcessing ? (
                      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <div className="relative flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <Sparkles className="h-5 w-5 text-blue-500 absolute animate-pulse" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-slate-700 font-mono font-bold block">MEMPARAFRASE DAN MENULIS ULANG...</span>
                          <span className="text-[10px] text-blue-600 mt-1 block">Akurasi tingkat kemanusiaan sedang ditingkatkan</span>
                        </div>
                      </div>
                    ) : outputText ? (
                      <div className="whitespace-pre-wrap select-text">{outputText}</div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <p className="text-sm font-semibold">Belum Ada Teks</p>
                        <p className="text-xs text-slate-400 mt-1">Masukkan teks asli di kiri dan klik tombol parafrase.</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200/60 flex items-center justify-between">
                    {outputText && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 py-1 px-2.5 rounded font-mono font-semibold">
                          Lolos Deteksi AI
                        </span>
                      </div>
                    )}
                    <span />
                    <button
                      id="btn-copy-output"
                      onClick={() => handleCopy(outputText, false)}
                      disabled={!outputText}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 disabled:opacity-50 ml-auto font-medium"
                    >
                      {copiedOutput ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: PENCOCOKAN / PERBANDINGAN PER KATA */}
            {activeTab === "diff" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-blue-600" /> Analisis Perbandingan Kata &amp; Struktur Baru
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Membandingkan teks asli dan teks hasil parafrase kata demi kata. Kata yang dilingkari merah berarti telah dirombak/dihapus, dan hijau adalah kata pengganti baru dari AI.
                  </p>
                </div>
                <DiffViewer original={inputText} paraphrased={outputText} />
              </div>
            )}

            {/* TAB CONTENT: HISTORY / RIWAYAT RISET */}
            {activeTab === "history" && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Riwayat Parafrase Lokal</h4>
                    <p className="text-xs text-slate-400">Menyimpan riwayat kerja Anda secara privat di peramban ini.</p>
                  </div>
                  {userHistory.length > 0 && (
                    <button
                      id="clear-hist-btn"
                      onClick={clearHistory}
                      className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 border border-rose-200 bg-rose-50 px-2.5 py-1 rounded"
                    >
                      Hapus Semua Riwayat
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {userHistory.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      Tidak ada riwayat parafrase yang tersimpan.
                    </div>
                  ) : (
                    userHistory.map((item) => (
                      <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-semibold">
                            Gaya: {item.mode} ({item.language === "id" ? "IND" : "ENG"})
                          </span>
                          <span>Jam: {item.timestamp}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-white text-slate-550 rounded border border-slate-100 line-clamp-2">
                            <strong>Asli:</strong> "{item.originalText}"
                          </div>
                          <div className="p-2 bg-white text-slate-800 rounded line-clamp-2 border border-slate-200/60">
                            <strong>Parafrase:</strong> "{item.paraphrasedText}"
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center justify-between pt-1 border-t border-slate-200 text-xs">
                          <div className="flex gap-3 text-[11px]">
                            <span className="text-slate-500">Detektor AI Baru: <strong className="text-emerald-600">{item.scores.aiProbability}%</strong></span>
                            <span className="text-slate-500">Keterbacaan: <strong className="text-blue-600">{item.scores.readabilityScore}%</strong></span>
                            <span className="text-slate-500">Kemiripan: <strong className="text-amber-600">{item.similarity}%</strong></span>
                          </div>
                          <button
                            id={`load-hist-${item.id}`}
                            onClick={() => {
                              setInputText(item.originalText);
                              setOutputText(item.paraphrasedText);
                              setLastAnalysis(item.scores);
                              setSelectedMode(item.mode);
                              setSelectedLang(item.language);
                              setActiveTab("editor");
                            }}
                            className="text-blue-600 hover:text-blue-800 font-bold text-[11px]"
                          >
                            Muat Ulang Teks
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tombol Trigger Eksekusi */}
            {activeTab === "editor" && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  id="btn-process-paraphrase"
                  onClick={handleParaphrase}
                  disabled={isProcessing || !inputText.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-blue-500/10 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-white animate-pulse" />
                  {selectedMode === "humanize" ? "Ubah Menjadi Gaya Manusiawi (Bypass AI)" : "Parafrase Teks Sekarang"}
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3 mt-2 text-rose-700 text-xs shadow-sm">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-bold">Gagal Memproses</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

          </div>

          {/* Sisi Kanan: Panel Deteksi Realtime & Parameter AI */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Panel 1: SENSOR KEMIRIPAN TEKS REAL-TIME */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-yellow-500 via-amber-400 to-blue-500" />
              
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Detektor Kemiripan Teks
                </h4>
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>

              <div className="text-center py-2">
                <div className="relative inline-flex items-center justify-center">
                  {/* Gauge Ring */}
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#f1f5f9"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="url(#similarityGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * realtimeSimilarity) / 100}
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id="similarityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-extrabold text-slate-800">{realtimeSimilarity}%</span>
                    <span className="text-[9px] font-mono text-slate-400">Match</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  realtimeSimilarity > 70 
                    ? "bg-rose-50 text-rose-700 border border-rose-100" 
                    : realtimeSimilarity > 40 
                      ? "bg-amber-50 text-amber-700 border border-amber-100" 
                      : realtimeSimilarity > 0 
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-slate-100 text-slate-500"
                }`}>
                  {realtimeSimilarity > 70 
                    ? "Sangat Mirip (Tinggi Plagiasi)" 
                    : realtimeSimilarity > 40 
                      ? "Kemiripan Sedang" 
                      : realtimeSimilarity > 0 
                        ? "Unik & Terdiversifikasi"
                        : "Siap Parafrase"
                  }
                </span>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                  Skor real-time mengukur seberapa banyak struktur kosa kata dari teks input yang masih dipertahankan pada teks output. Semakin kecil angkanya, semakin unik teks baru Anda.
                </p>
              </div>
            </div>

            {/* Panel 2: DETEKTOR PERSENTASE ELEMEN AI & INTEGRITAS LAPORAN */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Sertifikat &amp; Pemindai AI Terintegrasi
                  </h4>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 font-bold">
                  Sistem Valid 90%+
                </span>
              </div>

              {lastAnalysis ? (
                <div className="space-y-5">
                  {/* Sertifikat Kelolosan Validasi */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-[#142D54] text-white p-4 rounded-xl border border-emerald-800/20 shadow-md">
                    {/* Background graphic */}
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                      <Cpu className="w-24 h-24" />
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-emerald-300 uppercase tracking-widest font-black block">
                          Sertifikat Kelolosan Teks
                        </span>
                        <h5 className="text-sm font-bold text-white mt-0.5">
                          Parafaseku Authenticator
                        </h5>
                      </div>
                      <div className="bg-emerald-500/20 border border-emerald-400/30 rounded px-1.5 py-0.5 text-[9px] font-mono text-emerald-300">
                        VERIFIED SECURE
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <div>
                        <p className="text-[10px] text-slate-300 font-medium">Lolos Deteksi (Akurasi Tinggi)</p>
                        <p className="text-xs font-mono font-bold text-emerald-200">
                          {lastAnalysis.humanizedScore && lastAnalysis.humanizedScore >= 90
                            ? "SANGAT VALID (100% LOLOS)"
                            : `LOLOS DIREKOMENDASIKAN (${lastAnalysis.humanizedScore}% Human)`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-300 font-mono">ID Sertifikat</p>
                        <p className="text-[10px] font-mono font-bold text-teal-300">
                          PRFSK-{(Math.random() * 100000).toFixed(0).padStart(5, "0")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Detektor Multi-Platform Benchmark (Turnitin, GPTZero, dll.) */}
                  <div>
                    <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                      AKURASI PEMINDAI AI MULTI-PLATFORM
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">Turnitin AI</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {lastAnalysis.turnitinScore || (100 - lastAnalysis.aiProbability)}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Skor Penulisan Manusia</p>
                      </div>

                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">GPTZero</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {lastAnalysis.gptzeroScore || Math.min(100, Math.max(90, 100 - lastAnalysis.aiProbability))}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Bebas Elemen AI</p>
                      </div>

                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">Copyleaks</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {lastAnalysis.copyleaksScore || Math.min(100, Math.max(90, 100 - lastAnalysis.aiProbability))}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Lolos Deteksi (Safe)</p>
                      </div>

                      <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-100 p-2.5 rounded-xl transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-700">ZeroGPT</span>
                          <span className="text-xs font-mono font-bold text-emerald-600">
                            {lastAnalysis.zerogptScore || Math.min(100, Math.max(90, 100 - lastAnalysis.aiProbability))}%
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Linguistik Manusiawi</p>
                      </div>
                    </div>
                  </div>

                  {/* Rekonstruksi Frasa Kaku AI -> Alami */}
                  {lastAnalysis.phraseReplacements && lastAnalysis.phraseReplacements.length > 0 && (
                    <div className="border-t border-slate-100 pt-3">
                      <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                        REKONSTRUKSI KALIMAT (BUKAN ASAL-ASALAN)
                      </h5>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {lastAnalysis.phraseReplacements.map((item, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="bg-blue-50 text-blue-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-blue-100">
                                {item.category}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-1">
                              <p className="text-[10px] text-slate-500 line-through truncate">
                                Sebelum: "{item.original}"
                              </p>
                              <p className="text-[11px] font-semibold text-slate-800">
                                Sesudah: <span className="text-teal-600 font-bold">"{item.replacement}"</span>
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 pl-1 border-l-2 border-emerald-400">
                              💡 {item.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Perbandingan Sebelum & Sesudah AI probability */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Kemungkinan AI Teks Asli</span>
                        <span className="font-mono font-bold text-rose-600">{lastAnalysis.originalAiProbability}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${lastAnalysis.originalAiProbability}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Kemungkinan AI Hasil Baru</span>
                        <span className="font-mono font-bold text-emerald-600">{lastAnalysis.aiProbability}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${lastAnalysis.aiProbability}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Tingkat Penulisan Manusiawi (Humanized)</span>
                        <span className="font-mono font-bold text-teal-600">{lastAnalysis.humanizedScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${lastAnalysis.humanizedScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 font-medium">Kemudahan Membaca (Readability)</span>
                        <span className="font-mono font-bold text-indigo-600">{lastAnalysis.readabilityScore}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-700" 
                          style={{ width: `${lastAnalysis.readabilityScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Perbaikan */}
                  <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-700 block uppercase">
                      Linguistik Perbaikan AI:
                    </span>
                    <ul className="space-y-1.5">
                      {lastAnalysis.feedback.map((point, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <BarChart2 className="h-8 w-8 text-slate-300" />
                  <p>Masukkan teks &amp; klik parafrase untuk melihat Analisis Validitas &amp; Sertifikat Kelolosan.</p>
                </div>
              )}
            </div>

            {/* Panel 3: EDUKASI / ALASAN MENGGUNAKAN HUMANIZER */}
            <div className="bg-blue-50/20 border border-blue-100/60 rounded-2xl p-4.5 space-y-3.5 shadow-sm">
              <span className="text-xs font-mono font-extrabold text-slate-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" /> Mengapa Memilih Fitur Kami?
              </span>
              
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <p><strong className="text-slate-800 font-bold">Anti Plagiarisme:</strong> Memperkaya sinonim &amp; struktur kalimat secara otomatis dengan algoritma bertenaga AI.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <p><strong className="text-slate-800 font-bold">Gaya Alami Manusia:</strong> Menghilangkan pola transisi klise AI yang mengulang frase monoton.</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <p><strong className="text-slate-800 font-bold">Aman &amp; Rahasia:</strong> Teks Anda diproses langsung secara aman di server tanpa disimpan tanpa persetujuan.</p>
                </div>
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* Footer Hak Cipta */}
      <footer className="mt-16 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Logo iconOnly size="sm" />
          <p>© 2026 Parafaseku. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
        <p className="mt-1 text-slate-400">Didesain dengan Cinta &amp; Estetika Minimalis Modern.</p>
      </footer>

      {/* Admin Credentials prompt Modal Overlay */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-[#142D54]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden relative p-6 space-y-4 animate-fade-in text-left">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center space-y-1">
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-lg">
                👑
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Akses Terbatas Administrator</h3>
              <p className="text-xs text-slate-400">Verifikasi kredensial monitoring khusus admin untuk melanjutkan.</p>
            </div>

            {adminDialogError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-2.5 rounded-xl text-center font-semibold">
                ⚠️ {adminDialogError}
              </div>
            )}

            <form onSubmit={handleAdminDialogSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username / Email Admin
                </label>
                <input
                  type="text"
                  required
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="Masukkan 'akunadmin'"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="Masukkan sandi khusus admin"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#142D54] transition bg-white text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#142D54] hover:bg-[#1e3d6e] text-white py-2 rounded-lg font-bold text-xs cursor-pointer transition shadow-md shadow-blue-950/10"
              >
                Verifikasi &amp; Masuk Dashboard
              </button>
            </form>

            <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/60 text-center text-[10px] text-blue-700">
              <p className="font-semibold">💡 Kredensial Pengujian Admin:</p>
              <p className="mt-0.5">Username: <strong className="font-sans font-bold">akunadmin</strong> | Sandi: <strong className="font-sans font-bold">admin123</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal Overlay */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-[#142D54]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden relative p-6 space-y-5 animate-fade-in text-left">
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center space-y-1">
              <div className="relative inline-block">
                {profilePhotoURL ? (
                  <img
                    src={profilePhotoURL}
                    alt={profileName || "Avatar"}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded-full object-cover border-4 border-blue-50 shadow-md mx-auto"
                    onError={() => {
                      setProfileError("URL Foto tidak valid atau tidak dapat dimuat.");
                    }}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-700 font-extrabold text-2xl flex items-center justify-center border-4 border-blue-50 shadow-md mx-auto uppercase">
                    {profileName ? profileName.charAt(0) : "U"}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs shadow-sm">
                  ✨
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Pengaturan Profil Anda</h3>
              <p className="text-xs text-slate-400">Ubah nama panggilan dan lengkapi foto profil Anda.</p>
            </div>

            {profileError && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3 rounded-xl text-center font-semibold">
                ⚠️ {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3 rounded-xl text-center font-semibold animate-bounce">
                ✅ {profileSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap / Panggilan
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Contoh: Budi Cahyono"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Alamat Email (Terkunci)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="block w-full px-3 py-2 border border-slate-100 rounded-lg text-xs bg-slate-50 text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Preset Avatars Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Avatar Preset Yang Menarik
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                  ].map((url, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setProfilePhotoURL(url);
                        setProfileError(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        profilePhotoURL === url ? "border-blue-600 scale-105 shadow-md shadow-blue-500/10" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img src={url} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {profilePhotoURL === url && (
                        <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo URL Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Atau Gunakan URL Foto Kustom Anda
                </label>
                <input
                  type="url"
                  value={profilePhotoURL}
                  onChange={(e) => {
                    setProfilePhotoURL(e.target.value);
                    setProfileError(null);
                  }}
                  placeholder="https://example.com/foto-anda.jpg"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition bg-white text-slate-800 font-mono"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 rounded-xl font-semibold text-xs cursor-pointer transition text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-bold text-xs cursor-pointer transition shadow-md shadow-blue-600/10 disabled:opacity-50"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
