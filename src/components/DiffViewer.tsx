import { useMemo } from "react";

interface DiffViewerProps {
  original: string;
  paraphrased: string;
}

export default function DiffViewer({ original, paraphrased }: DiffViewerProps) {
  // Simple word-by-word comparative analysis
  const diffResult = useMemo(() => {
    if (!original && !paraphrased) return { originalWords: [], paraphrasedWords: [] };

    const clean = (word: string) => {
      return word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    };

    const origWordsList = original.split(/\s+/).filter(Boolean);
    const paraWordsList = paraphrased.split(/\s+/).filter(Boolean);

    const origSet = new Set(origWordsList.map(clean));
    const paraSet = new Set(paraWordsList.map(clean));

    // For original words: see if they were removed
    const originalWords = origWordsList.map((word) => {
      const isRemoved = !paraSet.has(clean(word));
      return {
        text: word,
        isRemoved,
      };
    });

    // For paraphrased words: see if they are newly added / substituted
    const paraphrasedWords = paraWordsList.map((word) => {
      const isAdded = !origSet.has(clean(word));
      return {
        text: word,
        isAdded,
      };
    });

    return { originalWords, paraphrasedWords };
  }, [original, paraphrased]);

  if (!original && !paraphrased) {
    return (
      <div className="text-center py-8 text-slate-500 font-sans text-sm">
        Masukkan teks dan klik tombol parafrase untuk melihat perbandingan teks.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Teks Asli dengan Penghapusan */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100 font-semibold">
            Teks Asli (Kata Terganti/Terhapus)
          </span>
        </div>
        <div className="text-sm leading-relaxed text-slate-700 font-sans max-h-64 overflow-y-auto pr-1">
          {diffResult.originalWords.map((item, idx) => (
            <span
              key={idx}
              className={`inline-block mr-1.5 my-0.5 transition-colors duration-200 ${
                item.isRemoved
                  ? "bg-rose-50 text-rose-600 line-through decoration-rose-500/40 px-0.5 rounded font-medium"
                  : "text-slate-500"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* Teks Parafrase dengan Penambahan */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 font-semibold">
            Hasil Baru (Kata Pengganti/Struktur Baru)
          </span>
        </div>
        <div className="text-sm leading-relaxed text-slate-800 font-sans max-h-64 overflow-y-auto pr-1">
          {diffResult.paraphrasedWords.map((item, idx) => (
            <span
              key={idx}
              className={`inline-block mr-1.5 my-0.5 transition-all duration-200 ${
                item.isAdded
                  ? "bg-blue-50 text-blue-700 font-semibold px-1 rounded shadow-sm shadow-blue-500/5 border border-blue-100"
                  : "text-slate-700"
              }`}
            >
              {item.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
