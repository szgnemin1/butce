import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

// Body parsing with generous limit for image uploads (base64 receipts)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to store physical encrypted database states on this VDS server
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db_encrypted.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Lazy initialization pattern for Gemini API client to prevent crash if key is missing
function getGeminiClient(customKey?: string): GoogleGenAI {
  const key = customKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY bulunamadı. Lütfen Ayarlar panelinden bir Gemini API Anahtarı tanımlayın veya Sunucuda GEMINI_API_KEY çevre değişkenini ayarlayın.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// -------------------------------------------------------------
// Core API Endpoints
// -------------------------------------------------------------

/**
 * Endpoint to load the end-to-end encrypted database bundle.
 * If file does not exist, returns empty state or default configuration.
 */
app.get("/api/db/load", (req: Request, res: Response) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, "utf-8");
      res.json(JSON.parse(fileData));
    } else {
      res.json({ encryptedState: null, lastBackupDate: null });
    }
  } catch (error) {
    console.error("Database load error:", error);
    res.status(500).json({ error: "Veri yüklenirken hata oluştu." });
  }
});

/**
 * Endpoint to synchronize/persist the encrypted state.
 * Supports end-to-end encryption by saving whatever payload the client provides.
 */
app.post("/api/db/save", (req: Request, res: Response) => {
  try {
    const { encryptedState } = req.body;
    if (!encryptedState) {
       res.status(400).json({ error: "Yüklenecek şifreli veri bulunamadı." });
       return;
    }

    const payload = {
      encryptedState,
      lastBackupDate: new Date().toISOString()
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), "utf-8");
    res.json({ success: true, lastBackupDate: payload.lastBackupDate });
  } catch (error) {
    console.error("Database save error:", error);
    res.status(500).json({ error: "Veri kaydedilirken hata oluştu." });
  }
});

/**
 * Endpoint to completely reset/delete the server-side encrypted state.
 * Lets users start fresh with a clean database if they forget their encryption PIN or deploy code newly.
 */
app.post("/api/db/reset", (req: Request, res: Response) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    res.json({ success: true, message: "Sunucu veri dosyası başarıyla sıfırlandı." });
  } catch (error) {
    console.error("Database reset error:", error);
    res.status(500).json({ error: "Veri dosyası sıfırlanırken sunucu hatası oluştu." });
  }
});

/**
 * Endpoint to perform OCR / Fiş okuma.
 * Receives a base64 receipt image, queries Gemini 3.5 Flash, extracts fields in standard format.
 */
app.post("/api/ocr-receipt", async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType, geminiApiKey } = req.body;

    if (!base64Image) {
      res.status(400).json({ error: "Görüntü verisi bulunamadı." });
      return;
    }

    const customKey = (req.headers["x-gemini-key"] as string) || geminiApiKey;
    const client = getGeminiClient(customKey);

    const promptText = `
      You are an expert receipt OCR and finance categorization parser.
      Analyze this image of a shopping receipt/fatura/fiş/makbuz.
      Extract information strictly matching the target JSON schema below.
      Translate fields like vendor (store name) and description to Turkish.
      Try to match the total cost accurately as a number.
      Determine the best category from this list of Turkish categories:
      - "Gıda" (for cafes, bakery, restaurant, supermarket, groceries)
      - "Alışveriş" (clothing, electronics, retail shopping, home items)
      - "Ulaşım" (gas/petrol, taxi, bus, metro, toll)
      - "Fatura/Aidat" (internet, electric, water, residential fees, subscription services)
      - "Eğlence" (cinema, games, hobbies, bars, events)
      - "Sağlık" (pharmacy, doctor, health insurance, fitness)
      - "Eğitim" (books, courses, school, stationery)
      - "Diğer" (any other category)

      JSON format should map to:
      {
        "vendor": string,
        "date": "YYYY-MM-DD" (strictly ISO format, use current date 2026-06-11 if not clear),
        "totalAmount": number,
        "category": string (must be one of the 8 Turkish categories listed above),
        "description": string (brief summary of items or purchase purpose in Turkish)
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: base64Image
          }
        },
        promptText
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["vendor", "date", "totalAmount", "category", "description"],
          properties: {
            vendor: { type: Type.STRING },
            date: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            category: { 
              type: Type.STRING,
              enum: ["Gıda", "Alışveriş", "Ulaşım", "Fatura/Aidat", "Eğlence", "Sağlık", "Eğitim", "Diğer"]
            },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("OCR receipt error:", error);
    res.status(500).json({ 
      error: "Fiş analiz edilirken yapay zeka hatası oluştu.",
      details: error.message 
    });
  }
});

/**
 * Endpoint to generate localized saving recommendations and financial reports.
 * Receives the recent statistics (budget, spending, goals achieved) and returns custom advice.
 */
app.post("/api/fin-advice", async (req: Request, res: Response) => {
  try {
    const { monthlyStats, geminiApiKey } = req.body;

    if (!monthlyStats) {
      res.status(400).json({ error: "Analiz için istatistik verisi bulunamadı." });
      return;
    }

    const customKey = (req.headers["x-gemini-key"] as string) || geminiApiKey;
    const client = getGeminiClient(customKey);

    const promptText = `
      You are an expert personal finance advisor (Bireysel Finans Danışmanı).
      Analyze the user's spending habits, goals, and budget patterns provided below:
      ${JSON.stringify(monthlyStats, null, 2)}

      Write a thorough financial assessment report (Öneri ve Tasarruf Raporu) in Turkish.
      Do NOT write clinical developer jargon or list code files. Write with a warm, professional and encouraging personality.
      The report must include:
      1. Overall monthly status (Aylık Finansal Durum Değerlendirmesi)
      2. Specific, actionable savings recommendations (Tasarruf ve Birikim Tavsiyeleri)
      3. Tips corresponding to the specific categories where they spent the most.
      4. Action plan for their unpaid installments or budget threshold overruns.
      
      Format the response beautifully in Markdown. Do not include self-praising or flowery AI marketing talk. Make it strictly practical, customized to the actual numbers provided.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText
    });

    res.json({ report: response.text });
  } catch (error: any) {
    console.error("AI financial advice error:", error);
    res.status(500).json({ 
      error: "Tasarruf raporu oluşturulurken hata oluştu.",
      details: error.message 
    });
  }
});


// -------------------------------------------------------------
// Vite Dev Server Middleware or Production Static Handler
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
