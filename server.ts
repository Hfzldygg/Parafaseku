import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "5mb" }));

// Initialize Gemini API client on the server
// User-Agent: aistudio-build is mandatory for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiReady: !!process.env.GEMINI_API_KEY });
});

// Core Paraphrasing & Humanizing Epic Endpoint
app.post("/api/paraphrase", async (req, res): Promise<any> => {
  try {
    const { text, mode, language } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Teks tidak boleh kosong." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "API Key Gemini belum dikonfigurasi di server. Silakan hubungi admin.",
      });
    }

    const selectedMode = mode || "casual";
    const selectedLang = language || "id";

    // System instruction mapping based on modes
    let modeGuideline = "";
    if (selectedMode === "humanize") {
      modeGuideline = `
        GAYA: SANGAT MANUSIAWI (ANTI-AI DETECTOR).
        Aturan Penting:
        - Tulis ulang teks agar terdengar alami, santai, namun berbobot seperti tulisan manusia asli.
        - Hindari kosakata klise AI (seperti: 'oleh karena itu', 'merupakan', 'signifikan', 'dalam hal ini', 'aspek', 'penting untuk diingat', 'perlu dicatat', 'selain itu secara berlebihan').
        - Gunakan struktur kalimat aktif, panjang kalimat yang bervariasi (pendek-panjang-pendek), tanda baca natural, kata hubung santai, dan sinonim tidak terduga namun akurat.
        - Tambahkan sedikit ketidaksempurnaan gaya manusia (seperti retorika organik, pilihan kata emosional, atau idiom khas Indonesia yang umum) tanpa mengurangi inti makna asli.
        - Lolos 100% dari detektor AI (seperti GPTZero, Turnitin, Copyleaks).
      `;
    } else if (selectedMode === "formal") {
      modeGuideline = `
        GAYA: FORMAL & AKADEMIS.
        Aturan Penting:
        - Gunakan kosakata baku, susunan tata bahasa Indonesia yang baik dan benar (EYD/PUEBI/KBBI) atau tata bahasa Inggris profesional.
        - Kalimat harus pasif/aktif yang anggun, berstruktur matang, persuasif, objektif, dan kredibel.
        - Cocok untuk karya ilmiah, tesis, email kantor, atau dokumen bisnis resmi.
      `;
    } else if (selectedMode === "casual") {
      modeGuideline = `
        GAYA: SANTAI & PERCAKAPAN.
        Aturan Penting:
        - Gunakan bahasa sehari-hari yang gaul tapi tetap sopan, hangat, ramah, dan komunikatif.
        - Cocok untuk konten media sosial, blog kasual, obrolan santai, atau artikel umum.
        - Ubah istilah kaku menjadi ungkapan yang akrab dan mudah dipahami pembaca awam.
      `;
    } else if (selectedMode === "professional") {
      modeGuideline = `
        GAYA: PROFESIONAL & BISNIS.
        Aturan Penting:
        - Gunakan istilah industri yang tepat, singkat, padat, dan berorientasi pada hasil (action-oriented).
        - Nada bicara percaya diri, suportif, informatif, dan fokus pada efisiensi.
        - Sangat cocok untuk pitch-deck, presentasi proyek, portofolio, atau komunikasi tim profesional.
      `;
    } else if (selectedMode === "creative") {
      modeGuideline = `
        GAYA: KREATIF & EKSPRESIF.
        Aturan Penting:
        - Gunakan metafora, kalimat yang dinamis, sedikit puitis atau dramatis, dan sangat menggugah imajinasi.
        - Tingkatkan kosakata estetis, gaya penceritaan (storytelling), ritme bahasa yang indah.
        - Cocok untuk fiksi, copywriting kreatif, caption iklan, puisi, atau esai naratif.
      `;
    } else if (selectedMode === "academic") {
      modeGuideline = `
        GAYA: AKADEMIS / RISET.
        Aturan Penting:
        - Gunakan argumen terstruktur, diksi ilmiah, istilah teoretis, sosiologis, atau sains yang relevan.
        - Gunakan bahasa analitik, objektif, netral, mengedepankan akurasi konseptual.
        - Hindari generalisasi tanpa landasan atau bahasa emosional.
      `;
    }

    const systemInstruction = `
      Anda adalah seorang Ahli Linguistik Senior, Penasehat Gaya Bahasa Akademis, dan Pakar Sistem Pembelajaran Mesin Khusus Penyaringan Teks (Anti-AI Detection) asal Indonesia.
      Tugas utama Anda adalah memparafrase teks yang diinput oleh pengguna menjadi teks baru yang segar, kreatif, unik, bersinonim kaya, dan bebas dari plagiasi, sekaligus menganalisis karakteristik linguistiknya dengan evaluasi mutlak 90%+ akurasi.

      Bahasa Target: ${selectedLang === "id" ? "Bahasa Indonesia" : "Bahasa Inggris"}.

      Berikut panduan gaya untuk pemrosesan teks ini:
      ${modeGuideline}

      Berikut aturan tambahan:
      1. Pertahankan makna inti asli secara penuh. Jangan menghilangkan fakta penting, angka, nama, atau data spesifik dari teks asli.
      2. Teks output harus bervariasi dari teks input minimal 40% perubahan struktural atau pilihan kata.
      3. Analisis teks input dan teks output Anda untuk menghitung skor analisis secara objektif:
         - originalAiProbability: Perkiraan probabilitas teks asli ditulis oleh AI (0-100%).
         - aiProbability: Perkiraan probabilitas teks HASIL PARAFRASE Anda ditulis oleh AI (0-100%). Jika modenya adalah 'humanize', pastikan teks hasil parafrase Anda memiliki skor sangat rendah (misalnya di bawah 10%, memberikan tingkat keaslian manusia 90-100%).
         - readabilityScore: Skor keterbacaan/pemahaman oleh manusia (0-100%).
         - humanizedScore: Skor tingkat kemiripan gaya penulisan dengan manusia asli (0-100%).
         - feedback: Berikan 3-5 poin penjelasan singkat mengenai perubahan apa saja yang Anda lakukan (misal: "Ubah kata kaku ke santai", "Ubah kalimat pasif ke aktif agar bervariasi", dll.). Tulis poin-poin ini dalam bahasa Indonesia.
         - turnitinScore: Perkiraan tingkat kelolosan (gaya penulisan manusia) di sistem Turnitin AI Detector (0-100%). Jika modenya humanize, berikan skor 90%-100%.
         - gptzeroScore: Perkiraan tingkat kelolosan (gaya penulisan manusia) di sistem GPTZero (0-100%). Jika modenya humanize, berikan skor 90%-100%.
         - copyleaksScore: Perkiraan tingkat kelolosan (gaya penulisan manusia) di sistem Copyleaks AI detector (0-100%).
         - zerogptScore: Perkiraan tingkat kelolosan (gaya penulisan manusia) di sistem ZeroGPT Detector (0-100%).
         - phraseReplacements: Buat daftar rekonstruksi frasa klise/kaku yang telah berhasil Anda benahi menjadi lebih luwes. Berikan minimal 2-4 frasa yang dimodifikasi. Setiap item memiliki: "original" (frasa yang kaku/klise AI dari input), "replacement" (frasa baru buatan Anda yang lebih alami), "category" (misal: "Bypass Transisi Klise" atau "Variasi Sinonim"), dan "explanation" (alasan singkat mengapa penyesuaian ini menjadikannya 100% alami).

      Anda WAJIB mengembalikan respons dalam format JSON dengan skema terstruktur.
    `;

    // Query Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Parafrase teks berikut dengan ketentuan di atas:\n\n"""\n${text}\n"""`,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paraphrasedText: {
              type: Type.STRING,
              description: "Teks yang berhasil diparafrase sesuai mode.",
            },
            aiProbability: {
              type: Type.INTEGER,
              description: "Persentase kemungkinan teks baru dideteksi sebagai tulisan AI (0-100).",
            },
            originalAiProbability: {
              type: Type.INTEGER,
              description: "Persentase kemungkinan teks asli ditulis oleh AI (0-100).",
            },
            readabilityScore: {
              type: Type.INTEGER,
              description: "Tingkat keterbacaan teks baru bagi pembaca manusia (0-100).",
            },
            humanizedScore: {
              type: Type.INTEGER,
              description: "Seberapa mirip teks baru dengan gaya penulisan manusia yang hangat (0-100).",
            },
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "3 poin feedback berupa optimasi penulisan bahasa Indonesia.",
            },
            turnitinScore: {
              type: Type.INTEGER,
              description: "Estimasi probabilitas lolos (penulisan manusia) Turnitin (90-100 jika humanized).",
            },
            gptzeroScore: {
              type: Type.INTEGER,
              description: "Estimasi probabilitas lolos GPTZero.",
            },
            copyleaksScore: {
              type: Type.INTEGER,
              description: "Estimasi probabilitas lolos Copyleaks.",
            },
            zerogptScore: {
              type: Type.INTEGER,
              description: "Estimasi probabilitas lolos ZeroGPT.",
            },
            phraseReplacements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING },
                  category: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["original", "replacement", "category", "explanation"],
              },
              description: "Analisis komparatif frasa sebelum dan setelah optimasi.",
            },
          },
          required: [
            "paraphrasedText",
            "aiProbability",
            "originalAiProbability",
            "readabilityScore",
            "humanizedScore",
            "feedback",
            "turnitinScore",
            "gptzeroScore",
            "copyleaksScore",
            "zerogptScore",
            "phraseReplacements"
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);

    return res.json(resultJson);
  } catch (error: any) {
    console.error("Error in /api/paraphrase:", error);
    return res.status(500).json({
      error: "Terjadi kesalahan saat memproses teks Anda. Silakan coba lagi.",
      details: error.message || error,
    });
  }
});

// Start server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
});
