import React, { useState, useRef } from "react";
import { Upload, Camera, FileText, Check, Loader2, Sparkles, LayoutGrid, CheckCircle } from "lucide-react";
import { CATEGORIES } from "../utils/mockData";

interface ReceiptScannerProps {
  onAddTransaction: (t: {
    type: "income" | "expense";
    amount: number;
    category: string;
    date: string;
    description: string;
  }) => void;
  palette: any;
  geminiApiKey?: string;
}

export default function ReceiptScanner({ onAddTransaction, palette, geminiApiKey }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [base64Data, setBase64Data] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [extractedData, setExtractedData] = useState<{
    vendor: string;
    date: string;
    totalAmount: number;
    category: string;
    description: string;
  } | null>(null);

  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      
      // Extract base64 part
      const base64Parts = result.split(",");
      if (base64Parts.length === 2) {
        setBase64Data(base64Parts[1]);
        setMimeType(file.type || "image/jpeg");
      }
    };
    reader.readAsDataURL(file);
    // Reset any previous extraction
    setExtractedData(null);
    setSuccess(false);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Run AI OCR scanning
  const startScanning = async () => {
    if (!base64Data) return;

    setIsLoading(true);
    setLoadingMessage("Fiş okunuyor ve yapay zeka analizine gönderiliyor...");

    // Periodic comforting loading messages
    const messages = [
      "Görüntü kalitesi iyileştiriliyor...",
      "Tutar ve döviz birimleri ayrıştırılıyor...",
      "Fişi düzenleyen kurum (satıcı) tespit ediliyor...",
      "Fatura otomatik olarak kategorilendiriliyor...",
      "Finansal analiz tamamlanıyor..."
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < messages.length) {
        setLoadingMessage(messages[msgIdx++]);
      }
    }, 2000);

    try {
      const headersValue: Record<string, string> = { "Content-Type": "application/json" };
      if (geminiApiKey) {
        headersValue["x-gemini-key"] = geminiApiKey;
      }

      const response = await fetch("/api/ocr-receipt", {
        method: "POST",
        headers: headersValue,
        body: JSON.stringify({ 
          base64Image: base64Data, 
          mimeType,
          geminiApiKey 
        })
      });

      if (!response.ok) {
        throw new Error("Sunucu analiz talebine hata döndü.");
      }

      const data = await response.json();
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      alert("Okuma yapılamadı. Lütfen başka bir görsel seçin ya da doğrudan harcamalardan elle girin.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // Add OCR outcome into transaction log
  const handleConfirmSave = () => {
    if (!extractedData) return;

    onAddTransaction({
      type: "expense",
      amount: extractedData.totalAmount,
      category: extractedData.category,
      date: extractedData.date,
      description: `${extractedData.vendor} - ${extractedData.description}`
    });

    setSuccess(true);
    setTimeout(() => {
      // Clear states
      setImagePreview(null);
      setBase64Data(null);
      setExtractedData(null);
      setSuccess(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Yapay Zeka Fiş & Makbuz Okuyucu</h3>
      </div>
      <p className="text-slate-400 text-xs mb-6">
        Fişinizin fotoğrafını yükleyerek tutar, tarih ve kategoriyi saniyeler içinde otomatik olarak ayrıştırabilirsiniz.
      </p>

      {/* Upload layout / Drag Active */}
      {!imagePreview && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerUploadClick}
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition duration-300 min-h-[250px] ${
            dragActive
              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept="image/*"
            className="hidden"
          />
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Görseli Buraya Sürükleyin veya Tıklayın</p>
            <p className="text-xs text-slate-400">PNG, JPEG, HEIC (Maks. 10MB)</p>
          </div>
        </div>
      )}

      {/* Preview, Loading, Analysis Screen */}
      {imagePreview && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Yüklenen Fiş Görseli</h4>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[350px] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
              <img
                src={imagePreview}
                alt="Receipt Preview"
                className="max-h-[350px] object-contain w-full"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {!isLoading && !extractedData && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setBase64Data(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 font-semibold text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer hover:bg-slate-50 text-xs transition"
                >
                  Farklı Görsel Seç
                </button>
                <button
                  type="button"
                  onClick={startScanning}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 font-semibold text-white rounded-xl cursor-pointer shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" /> Fiş Analiz Et
                </button>
              </div>
            )}
          </div>

          {/* Loader or Outcome Panel */}
          <div className="space-y-4 min-h-[250px] flex flex-col justify-center">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center animate-pulse">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Akıllı Analiz Devam Ediyor</h4>
                  <p className="text-xs text-indigo-500 font-medium uppercase tracking-wider mt-1.5">{loadingMessage}</p>
                </div>
              </div>
            )}

            {/* Extracted form outcome */}
            {extractedData && !isLoading && (
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/70 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold uppercase tracking-wider">
                  <Check className="w-4 h-4 bg-emerald-100 dark:bg-emerald-950/50 p-0.5 rounded-full" />
                  Başarıyla Ayrıştırıldı!
                </div>

                <div className="space-y-3.5">
                  {/* Vendor */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Satıcı Firma</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={extractedData.vendor}
                      onChange={(e) => setExtractedData({ ...extractedData, vendor: e.target.value })}
                    />
                  </div>

                  {/* Date & Amount */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Tarih</label>
                      <input
                        type="date"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={extractedData.date}
                        onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Tutar (TL)</label>
                      <input
                        type="number"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={extractedData.totalAmount}
                        onChange={(e) => setExtractedData({ ...extractedData, totalAmount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Önerilen Kategori</label>
                    <select
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={extractedData.category}
                      onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-0.5">Gider Detayı</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={extractedData.description}
                      onChange={(e) => setExtractedData({ ...extractedData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  {success ? (
                    <div className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center text-xs font-bold font-semibold flex items-center justify-center gap-1.5 border border-emerald-300">
                      <CheckCircle className="w-4 h-4" /> Bütçenize Eklendi!
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConfirmSave}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow cursor-pointer text-center"
                    >
                      Verileri Onayla ve Bütçeye Kaydet
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
