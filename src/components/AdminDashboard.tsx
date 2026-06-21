import React, { useState, useEffect } from "react";
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  Activity, 
  Search, 
  Trash2, 
  UserX, 
  UserCheck, 
  Database, 
  Cpu, 
  RefreshCw, 
  ArrowLeft,
  X,
  Play,
  CheckCircle,
  Eye,
  TrendingUp,
  Award
} from "lucide-react";
import { getUsers, getHistory, updateUserRole, deleteUser, addHistoryItem } from "../lib/db";
import Logo from "./Logo";

interface AdminDashboardProps {
  onBackToApp: () => void;
  currentUser: UserType | null;
}

export default function AdminDashboard({ onBackToApp, currentUser }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [history, setHistory] = useState<ParaphraseHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "users" | "tasks" | "health">("overview");
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    cpu: 24,
    memory: 48,
    responseTime: 1.15,
    uptime: "99.98%"
  });
  const [selectedTask, setSelectedTask] = useState<ParaphraseHistoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load Real Data from Firestore on Mount
  useEffect(() => {
    const fetchData = async () => {
      const usersList = await getUsers();
      setUsers(usersList);
      const historyList = await getHistory();
      setHistory(historyList);
    };
    fetchData();
  }, []);

  // Simulating live telemetry charts fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedMetrics(prev => ({
        ...prev,
        cpu: Math.min(95, Math.max(12, prev.cpu + Math.floor(Math.random() * 9) - 4)),
        memory: Math.min(85, Math.max(40, prev.memory + Math.floor(Math.random() * 3) - 1)),
        responseTime: parseFloat(Math.min(1.8, Math.max(0.6, prev.responseTime + (Math.random() * 0.2 - 0.1))).toFixed(2))
      }));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // User Actions: Toggle Role (User <-> Admin)
  const handleToggleRole = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newRole = user.role === "admin" ? "user" : "admin";
    await updateUserRole(userId, newRole);
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    triggerToast(`Peran ${user.name} berhasil diubah menjadi ${newRole.toUpperCase()}`);
  };

  // User Actions: Hapus Akun
  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      triggerToast("Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }
    const target = users.find(u => u.id === userId);
    if (!target) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${target.name} secara permanen? All riwayat akan terasosiasi anonim.`)) {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      triggerToast(`Akun ${target.name} telah dihapus dari sistem.`);
    }
  };

  // Generate Sample Traffic
  const handleGenerateSampleTraffic = async () => {
    const samples = [
      {
        userId: users[Math.floor(Math.random() * users.length)]?.id || "usr_1",
        originalText: "Pendidikan adalah hal yang mendasar bagi semua orang di negara kita.",
        paraphrasedText: "Akses proses pembelajaran merupakan fondasi utama bagi seluruh elemen masyarakat.",
        mode: "humanize" as const,
        language: "id" as const,
        timestamp: new Date().toISOString(),
        scores: {
          aiProbability: 5,
          originalAiProbability: 89,
          readabilityScore: 94,
          humanizedScore: 98,
          feedback: ["Rekonstruksi klausa subordinat", "Mengikis klise monoton"],
          turnitinScore: 99,
          gptzeroScore: 98,
          copyleaksScore: 99,
          zerogptScore: 98
        },
        similarity: 12
      }
    ];

    for (const sample of samples) {
      await addHistoryItem(sample);
    }
    await refreshData();
    triggerToast("Berhasil mendatangkan tugas simulasi baru!");
  };

  const refreshData = async () => {
    const usersList = await getUsers();
    setUsers(usersList);
    const historyList = await getHistory();
    setHistory(historyList);
    triggerToast("Data disinkronkan dengan Firestore!");
  };

  // Math Calculations for Dashboard
  const totalUsersCount = users.length;
  const totalTasksCount = history.length;
  
  const avgBypassScore = totalTasksCount > 0
    ? Math.round(history.reduce((acc, curr) => acc + (curr.scores.humanizedScore || 90), 0) / totalTasksCount)
    : 96;

  // Search filter for tasks
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = history.filter(t => 
    t.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.paraphrasedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.mode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-20 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#142D54] border border-blue-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in text-xs font-semibold">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Panel */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToApp}
              className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition text-slate-600 flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </button>
            <div className="h-px bg-slate-200 w-4 hidden sm:block" />
            <Logo size="md" />
            <span className="bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider">
              Admin Web Monitor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-[#142D54]">{currentUser?.name || "Administrator"}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Status: Superuser</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-[#142D54] text-white font-extrabold text-xs flex items-center justify-center border border-blue-900 shadow shadow-blue-500/10 uppercase">
              👑
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Banner Selamat Datang */}
        <div className="bg-gradient-to-r from-[#142D54] to-blue-800 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-blue-900/10">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-6 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              Berdikari Monitoring Web System <Activity className="h-6 w-6 text-emerald-400 animate-pulse" />
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Selamat datang di pusat komando data Parafaseku. Di sini Anda memiliki akses mutlak untuk menganalisis akurasi, melakukan bypass check, mengontrol daftar anggota, dan mengamati metrik performa AI secara real-time.
            </p>
            
            <div className="pt-4 flex flex-wrap items-center gap-2.5">
              <button 
                onClick={handleGenerateSampleTraffic}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
              >
                <Play className="h-3 w-3 fill-white" /> Gelontorkan Trafik Simulasi AI
              </button>
              <button 
                onClick={refreshData}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3" /> Sinkron Data
              </button>
            </div>
          </div>
        </div>

        {/* ... (rest of code) ... */}

        {/* 4 Cards Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex items-center justify-between group hover:border-blue-400/55 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Akun Terdaftar
              </span>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalUsersCount}</p>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100 inline-block mt-1">
                +100% Aktif Client
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex items-center justify-between group hover:border-blue-400/55 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Tugas Diproses
              </span>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalTasksCount}</p>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100 inline-block mt-1">
                Linguistik Real-time
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <FileText className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex items-center justify-between group hover:border-blue-400/55 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rata-rata Bypass AI
              </span>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{avgBypassScore}%</p>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100 inline-block mt-1">
                Sangat Valid 90%+
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 flex items-center justify-between group hover:border-blue-400/55 transition-all">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Latency Rata-rata
              </span>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{simulatedMetrics.responseTime}s</p>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold border border-blue-100 inline-block mt-1">
                Uptime: {simulatedMetrics.uptime}
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
              <Cpu className="h-6 w-6" />
            </div>
          </div>

        </div>

        {/* Sub-NavigationBar Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeSubTab === "overview" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Analytics &amp; Tren
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab("users");
              setSearchQuery("");
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeSubTab === "users" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" /> Daftar Anggota ({users.length})
          </button>
          
          <button
            onClick={() => {
              setActiveSubTab("tasks");
              setSearchQuery("");
            }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeSubTab === "tasks" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Database className="h-4 w-4" /> Log Aktivitas ({history.length})
          </button>

          <button
            onClick={() => setActiveSubTab("health")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
              activeSubTab === "health" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Cpu className="h-4 w-4" /> Telemetri Server
          </button>
        </div>

        {/* Content Section based on selected tab */}
        <div>
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Visual Chart - SVG Line/Area Chart */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#142D54]">Volume Tugas Harian (Grafik Aktivitas)</h4>
                    <p className="text-xs text-slate-400">Total request parafrase yang diproses dalam periode terakhir.</p>
                  </div>

                  {/* SVG Custom Responsive Graph */}
                  <div className="h-64 w-full bg-slate-50 rounded-xl p-4 my-4 flex flex-col justify-between relative border border-slate-100 overflow-hidden">
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-50">
                      <div className="border-b border-dashed border-slate-200 w-full h-0" />
                      <div className="border-b border-dashed border-slate-200 w-full h-0" />
                      <div className="border-b border-dashed border-slate-200 w-full h-0" />
                      <div className="border-b border-dashed border-slate-200 w-full h-0" />
                    </div>

                    {/* Chart Line Path inside responsive box */}
                    <svg className="w-full h-48 mt-2" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area under curve */}
                      <path
                        d="M0,120 L0,100 L80,95 L160,82 L240,64 L320,50 L400,24 L480,18 L500,18 L500,120 Z"
                        fill="url(#chartGradient)"
                      />
                      {/* Grid Line */}
                      <path
                        d="M0,100 L80,95 L160,82 L240,64 L320,50 L400,24 L480,18 L500,18"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Pulsing Dots */}
                      <circle cx="240" cy="64" r="5" fill="#3B82F6" stroke="white" strokeWidth="2" />
                      <circle cx="400" cy="24" r="5" fill="#3B82F6" stroke="white" strokeWidth="2" />
                      <circle cx="480" cy="18" r="6" fill="#10B981" stroke="white" strokeWidth="2.5" />
                    </svg>

                    <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-200/60">
                      <span>Senin (18)</span>
                      <span>Selasa (19)</span>
                      <span>Rabu (20)</span>
                      <span>Kamis (Hari Ini)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-slate-500 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Lalu lintas data aman. Seluruh server AI berjalan <strong>normal di bawah 1.5 detik</strong>.</span>
                  </div>
                </div>

                {/* Mode distribution side panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950">Grup Mode Populer</h4>
                    <p className="text-xs text-slate-400">Distribusi sub-alat pengubah linguistik yang sering dieksekusi.</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">🌿 Humanize AI (Bypass)</span>
                        <span className="font-mono font-bold text-blue-600">64%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: "64%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">🎓 Akademis / Formal</span>
                        <span className="font-mono font-bold text-blue-600">22%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: "22%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">⚡ Kreatif / Professional</span>
                        <span className="font-mono font-bold text-blue-600">10%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: "10%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">☕ Kasual</span>
                        <span className="font-mono font-bold text-blue-600">4%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#2CB1BC] h-full rounded-full" style={{ width: "4%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-slate-700">📌 Info Menarik:</p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Mode "Humanize" menduduki posisi pertama karena terintegrasi langsung dengan Bypass Turnitin &amp; GPTZero.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeSubTab === "users" && (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">Daftar Akun Anggota Terverifikasi</h4>
                  <p className="text-xs text-slate-400">Manipulasi daftar status, otorisasi hak istimewa, atau audit email login.</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari user (nama, email)..."
                    className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Table User List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-6 py-3">Nama Anggota</th>
                      <th className="px-6 py-3">Alamat Email</th>
                      <th className="px-6 py-3">Tanggal Bergabung</th>
                      <th className="px-6 py-3">Peran (Role)</th>
                      <th className="px-6 py-3 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium">
                          Tidak ditemukan anggota dengan kueri pencarian "{searchQuery}"
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px] select-none">
                              {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                            </div>
                            <span>{user.name}</span>
                          </td>
                          <td className="px-6 py-4 font-mono text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 text-slate-400">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "long",
                              day: "numeric"
                            }) : "18 Juni 2026"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              user.role === "admin"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                : "bg-slate-100 text-slate-500 border-slate-150"
                            }`}>
                              {user.role || "user"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {/* Toggle Role Button */}
                              <button
                                onClick={() => handleToggleRole(user.id)}
                                className={`p-1.5 rounded-lg border transition ${
                                  user.role === "admin"
                                    ? "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                                    : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800"
                                }`}
                                title={user.role === "admin" ? "Ubah ke User Biasa" : "Jadikan Admin"}
                              >
                                {user.role === "admin" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </button>
                              
                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition"
                                title="Hapus Akun Permanen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM TASK LOGS */}
          {activeSubTab === "tasks" && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-900">Histori Validasi &amp; Logs Pekerjaan</h4>
                    <p className="text-xs text-slate-400">Monitoring muatan tulisan yang diproses, skor Turnitin, dan kemiripan teks.</p>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kata kunci dalam teks..."
                      className="block w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Task Logs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTasks.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-400 font-medium">
                      Tidak ditemukan logs aktivitas dengan kueri "{searchQuery}"
                    </div>
                  ) : (
                    filteredTasks.map((task) => {
                      const userObj = users.find(u => u.id === task.userId);
                      return (
                        <div 
                          key={task.id} 
                          className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3.5 hover:shadow-md hover:bg-white transition"
                        >
                          {/* Top Meta info */}
                          <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <p className="text-[11px] font-bold text-[#142D54]">
                                {userObj ? userObj.name : "Pengguna Anonim"}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({userObj ? userObj.email : "demo@anon.com"})
                              </span>
                            </div>

                            <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md uppercase font-bold border border-blue-200">
                              {task.mode}
                            </span>
                          </div>

                          {/* Preview the original and paraphrased content */}
                          <div className="space-y-2">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                                INPUT ASLI (AI)
                              </span>
                              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                "{task.originalText}"
                              </p>
                            </div>

                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-widest block">
                                OUTPUT BARU (HUMANIZED)
                              </span>
                              <p className="text-xs text-slate-800 font-semibold line-clamp-2 leading-relaxed">
                                "{task.paraphrasedText}"
                              </p>
                            </div>
                          </div>

                          {/* Scores panel */}
                          <div className="flex gap-2.5 pt-2.5 border-t border-slate-200/50 text-[10px]">
                            <div className="flex-1 bg-white p-1.5 rounded border border-slate-100 text-center">
                              <p className="text-slate-400">Match Skor</p>
                              <p className="font-mono font-extrabold text-blue-600 mt-0.5">{task.similarity}%</p>
                            </div>
                            <div className="flex-1 bg-white p-1.5 rounded border border-slate-100 text-center">
                              <p className="text-slate-400">Turnitin Lolos</p>
                              <p className="font-mono font-extrabold text-emerald-600 mt-0.5">
                                {task.scores.turnitinScore || (100 - task.scores.aiProbability)}%
                              </p>
                            </div>
                            <div className="flex-1 bg-white p-1.5 rounded border border-slate-100 text-center">
                              <p className="text-slate-400">Linguistik Manusia</p>
                              <p className="font-mono font-extrabold text-[#37B1AA] mt-0.5">
                                {task.scores.humanizedScore}%
                              </p>
                            </div>
                          </div>

                          {/* Action Button to inspect full details */}
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="w-full text-center py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-[11px] font-bold text-slate-600 rounded-xl cursor-pointer transition flex items-center justify-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspeksi Teks &amp; Sertifikasi
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Task Detail Modal */}
              {selectedTask && (
                <div className="fixed inset-0 z-50 bg-[#142D54]/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in relative">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#142D54] to-blue-800 text-white p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-emerald-300 font-extrabold block uppercase tracking-widest">
                          Analisis Detail Perbandingan
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">ID Pekerjaan: {selectedTask.id}</h4>
                      </div>
                      <button 
                        onClick={() => setSelectedTask(null)}
                        className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                      {/* Comparison Columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">
                            Teks Masukan AI (Probability {selectedTask.scores.originalAiProbability}%)
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed font-mono">
                            {selectedTask.originalText}
                          </p>
                        </div>

                        <div className="bg-blue-50/20 border border-blue-150 p-4 rounded-xl space-y-1.5">
                          <span className="text-[10px] font-mono font-bold text-blue-600 block uppercase">
                            Teks Hasil Manusiawi (Probability {selectedTask.scores.aiProbability}%)
                          </span>
                          <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                            {selectedTask.paraphrasedText}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Bypass scores */}
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest mb-2.5">
                          Hasil Detektor Eksternal
                        </span>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <p className="text-[9px] text-slate-400 font-medium">Turnitin</p>
                            <p className="text-sm font-mono font-black text-emerald-600 mt-1">
                              {selectedTask.scores.turnitinScore || 100 - selectedTask.scores.aiProbability}%
                            </p>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <p className="text-[9px] text-slate-400 font-medium">GPTZero</p>
                            <p className="text-sm font-mono font-black text-emerald-600 mt-1">
                              {selectedTask.scores.gptzeroScore || 97}%
                            </p>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <p className="text-[9px] text-slate-400 font-medium">Copyleaks</p>
                            <p className="text-sm font-mono font-black text-emerald-600 mt-1">
                              {selectedTask.scores.copyleaksScore || 96}%
                            </p>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                            <p className="text-[9px] text-slate-400 font-medium">ZeroGPT</p>
                            <p className="text-sm font-mono font-black text-emerald-600 mt-1">
                              {selectedTask.scores.zerogptScore || 95}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Reconstructed Phrases */}
                      {selectedTask.scores.phraseReplacements && selectedTask.scores.phraseReplacements.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-widest">
                            Kalimat Yang Direvisi Algoritma
                          </span>
                          <div className="space-y-2">
                            {selectedTask.scores.phraseReplacements.map((phrase, pi) => (
                              <div key={pi} className="bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs">
                                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase inline-block mb-1">
                                  {phrase.category}
                                </span>
                                <div className="space-y-0.5">
                                  <p className="text-slate-400 line-through">"{phrase.original}"</p>
                                  <p className="text-slate-800 font-semibold">"{phrase.replacement}"</p>
                                </div>
                                <p className="text-[10px] text-slate-500 italic mt-1.5 pl-2 border-l border-emerald-500">
                                  - Alasan: {phrase.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-slate-50 p-4 border-t border-slate-150 text-right">
                      <button
                        onClick={() => setSelectedTask(null)}
                        className="px-4 py-2 bg-[#142D54] hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition"
                      >
                        Tutup Panel Inspeksi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SERVER HEALTH TELEMETRY */}
          {activeSubTab === "health" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Telemetry charts */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Penggunaan CPU &amp; Memory Host
                </h4>

                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">CPU Server Load</span>
                      <span className="font-mono font-bold text-blue-600">{simulatedMetrics.cpu}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          simulatedMetrics.cpu > 80 
                            ? "bg-rose-500" 
                            : simulatedMetrics.cpu > 50 
                              ? "bg-amber-400" 
                              : "bg-blue-600"
                        }`} 
                        style={{ width: `${simulatedMetrics.cpu}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Cores: 4 Cores VCPU</span>
                      <span>Clock: 3.4 GHz</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Ram Allocation</span>
                      <span className="font-mono font-bold text-blue-600">{simulatedMetrics.memory}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all duration-700" 
                        style={{ width: `${simulatedMetrics.memory}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>Used: 3.84 GB</span>
                      <span>Total: 8.00 GB Allocated</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API and Google GenAI endpoints telemetry */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Daftar Konektor &amp; Endpoint Integrasi
                  </h4>
                  
                  <div className="space-y-3 pt-3 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-semibold text-slate-800">Google Gemini-2.5 Pro SDK</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">CONNECT (Okey)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Express Node Proxy Gateway (3000)</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">CONNECT (Okey)</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-800">Bypass turnitin &amp; gptzero Validator</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">99.8% READY</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-700 leading-relaxed font-semibold">
                  ⚠️ Status Sistem: Seluruh pipeline model pemrosesan bahasa alami (NLP) beroperasi dengan ketersediaan tinggi 99.98% serta bebas kendala kemacetan memori.
                </div>
              </div>

            </div>
          )}
        </div>

      </main>

      {/* Admin Footer */}
      <footer className="mt-16 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-400 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p>© 2026 Parafaseku Admin Board. All Rights Reserved.</p>
        <p className="mt-1">Pemberdayaan Validitas &amp; Pengamatan Linguistik Tingkat Lanjut.</p>
      </footer>

    </div>
  );
}
