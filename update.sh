#!/bin/bash

# --- Bütçe Harcama Takip Uygulaması VDS Otomatik Güncelleyici ---
echo "========================================================"
echo "🔄 Bütçe ve Harcama Takibi - Güncelleme İşlemi Başlıyor..."
echo "========================================================"

# Gelecekteki güncellemeleri çekerken yerelde bir çakışma varsa koru
echo "📥 1. GitHub'dan güncel kodlar çekiliyor..."
git pull
if [ $? -ne 0 ]; then
    echo "❌ Hata: Kodlar çekilemedi. Lütfen bağlantınızı veya çakışmaları kontrol edin."
    exit 1
fi

echo "📦 2. Güncel paketler kuruluyor..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Hata: Paket kurulumu başarısız oldu."
    exit 1
fi

echo "🏗️ 3. Uygulama yeniden derleniyor (Build)..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Hata: Derleme (Build) işlemi başarısız oldu."
    exit 1
fi

echo "🔄 4. PM2 süreci kesintisiz yeniden yükleniyor..."
# PM2 süreci kayıtlı mı kontrol edelim
if pm2 list | grep -q "butce-takip"; then
    pm2 reload butce-takip
    echo "✅ PM2 Süreci kesintisiz olarak yeniden yüklendi!"
else
    echo "⚠️ Uyarı: 'butce-takip' adında aktif bir PM2 süreci bulunamadı."
    echo "🚀 İlk defa çalıştırılıyor:"
    pm2 start dist/server.cjs --name "butce-takip"
    pm2 save
fi

echo "========================================================"
echo "🎉 Güncelleme Başarıyla Tamamlandı! Uygulamanız Yayında."
echo "========================================================"
