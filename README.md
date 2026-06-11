# 📊 Bütçe ve Harcama Takibi - Sunucu Kurulum ve Güncelleme Kılavuzu

Bu kılavuz, yapay zeka destekli, uçtan uca şifreli **Bütçe ve Harcama Takibi** uygulamanızı yerel bilgisayarınızdan **GitHub**'a yüklemeyi ve ardından bir **VDS / VPS (Ubuntu/Debian)** bulut sunucusuna kurup kesintisiz çalıştırma adımlarını içerir.

---

## 🛠️ 1. Yerel Bilgisayardan GitHub'a Yükleme (İlk Sefer)

Eğer projenizi henüz GitHub'a yüklemediyseniz, yerel bilgisayarınızdaki proje klasöründe şu adımları izleyin:

1. **Git'i Başlatın:**
   ```bash
   git init
   ```

2. **Dosyaları Sahneye Ekleyin:**
   ```bash
   git add .
   ```

3. **İlk Commit'i Atın:**
   ```bash
   git commit -m "feat: bütçe takip uygulaması ilk kurulum"
   ```

4. **GitHub'da Yeni Bir Depo (Repository) Oluşturun:**
   * [github.com](https://github.com) adresine gidin.
   * Sağ üstteki **+** ikonuna tıklayıp **New repository** deyin.
   * Bir isim verin (Örn: `butce-takip-app`) ve **Create repository** butonuna basın.

5. **Uzak Depoyu (Remote) Ekleyin ve Kodu Gönderin:**
   * GitHub'ın size verdiği bağlantıyı kopyalayın ve terminale yapıştırın:
   ```bash
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
   git push -u origin main
   ```

---

## 🖥️ 2. VDS / VPS Sunucu Hazırlığı (Ubuntu / Debian)

Uygulamanın çalışacağı sunucuya SSH ile bağlandıktan sonra, gerekli temel araçları kurmamız gerekir.

### A. Paket Listesini Güncelleyin ve Git Kurun
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git curl build-essential -y
```

### B. Node.js (v20+) Kurulumu
En güncel kararlı LTS sürümünü kurmak için NodeSource LTS deposunu kullanalım:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```
*Node.js ve NPM kurulduğunu doğrulamak için:*
```bash
node -v
npm -v
```

### C. PM2 (Süreç Yöneticisi) Kurulumu
Uygulamanın sunucu arka planında kesintisiz çalışmasını, kapanırsa otomatik yeniden başlamasını ve sunucu reboot edildiğinde otomatik devreye girmesini sağlamak için **PM2**'yi kuruyoruz:
```bash
sudo npm install -g pm2
```

---

## 🚀 3. Sunucuya İlk Kurulum ve Yayına Alma

VDS sunucunuz hazır olduktan sonra aşağıdaki adımlarla projeyi çekip çalıştırın:

1. **Projeyi GitHub'dan Klonlayın:**
   ```bash
   cd /var/www  # veya dilediğiniz bir klasör
   git clone https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git butce-takip
   cd butce-takip
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Çevre Değişkenlerini Ayarlayın (.env):**
   Proje dizininde bir `.env` dosyası oluşturun ve gerekli bilgileri girin:
   ```bash
   nano .env
   ```
   *İçeriğine aşağıdakileri ekleyin ve kopyalayın:*
   ```env
   # Sunucunun çalışacağı port (Varsayılan: 3000)
   PORT=3000
   NODE_ENV=production

   # Yapay Zeka Raporları İçin Gemini API Anahtarı (Opsiyonel ama önerilir)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Kaydetmek için `Ctrl+O` -> `Enter` -> Çıkmak için `Ctrl+X` tuşlarına basın)*

4. **Uygulamayı İnşa Edin (Build):**
   Uygulama tam katmanlı (Express backend + Vite frontend) bir yapıdadır. Projeyi derlemek için:
   ```bash
   npm run build
   ```
   Bu işlem, istemci dosyalarını oluşturur ve backend kodunu tek bir CJS dosyası olarak `dist/server.cjs` içine paketler.

5. **Uygulamayı PM2 ile Başlatın:**
   Uygulamayı pm2 ile arka planda 7/24 çalışacak şekilde başlatalım:
   ```bash
   pm2 start dist/server.cjs --name "butce-takip"
   ```

6. **PM2 Başlangıç Yapılandırması (Sunucu Kapanıp Açılınca Otomatik Başlasın):**
   Sunucunuz resetlendiğinde uygulamanın kendi kendine açılması için şu komutları uygulayın:
   ```bash
   pm2 startup
   ```
   *Yukarıdaki komutun çıktı olarak verdiği uzun `sudo env PATH=...` komutunu kopyalayıp terminale yapıştırın ve çalıştırın.* Sonrasında ayarları kaydedin:
   ```bash
   pm2 save
   ```

---

## 🔄 4. Sunucu Güncelleme ve Yeniden Başlatma (Kod Değişikliklerinde)

Yerel bilgisayarınızda bir değişiklik yaptıktan ve GitHub'a yolladıktan sonra, sunucudaki uygulamayı güncellemek için aşağıdaki komut zincirini kullanın:

### El ile Güncelleme Adımları:
```bash
# Klasöre geçiş yapın
cd /var/www/butce-takip

# Yeni kodları GitHub'dan çekin
git pull

# Yeni paketler eklenmişse yükleyin
npm install

# Tekrar Build edin
npm run build

# PM2 uygulamasını yeniden başlatın (Kesintisiz - Downtime olmadan)
pm2 reload butce-takip
```

---

## ⚡ 5. Tek Komutla Güncelleme Scripti (update.sh)

Sunucuda her seferinde yukarıdaki komutları tek tek yazmak yerine, proje ile birlikte gelen pratik güncelleme scriptini kullanabilirsiniz.

Uygulama dizinindeyken sadece şu komutu çalıştırmanız yeterlidir:
```bash
chmod +x update.sh  # (Yalnızca ilk defa izin vermek için)
./update.sh
```

---

## 🛡️ 6. Opsiyonel: Nginx & SSL (HTTPS) Kurulumu

Uygulamanın dış dünyaya `3000` portu olmadan, doğrudan `http://alanadiniz.com` veya `https://alanadiniz.com` şeklinde açılabilmesi için revers proxy kurmanız önerilir:

1. **Nginx Yükleyin:**
   ```bash
   sudo apt install nginx -y
   ```

2. **Nginx Yapılandırma Dosyası Oluşturun:**
   ```bash
   sudo nano /etc/nginx/sites-available/butce-takip
   ```
   *Şu blok kodunu içine yazın:*
   ```nginx
   server {
       listen 80;
       server_name alanadiniz.com www.alanadiniz.com;  # Kendi alan adınızla değiştirin

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. **Yapılandırmayı Aktif Edin ve Nginx'i Test Edin:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/butce-takip /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # (Varsa çakışmaması için varsayılanı kaldırın)
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Ücretsiz SSL (Certbot) Kurun:**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d alanadiniz.com -d www.alanadiniz.com
   ```
   Sistem size yönlendirmeler sunacaktır, yönlendirmeleri onaylayarak SSL kurulumunu saniyeler içinde tamamlayabilirsiniz.

Artık uygulamanız güvenli, şifreli ve profesyonel bir şekilde VDS bulut sunucunuzda yayında! 🚀
