import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path to store physical encrypted database states on this VDS server
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db_encrypted.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
