# Meydan MVP · Gömeç Belediyesi

Pilot (Faz 1) kapsamındaki modülleri içeren demo uygulaması. Tüm kişi, işletme, adres ve tutarlar örnektir; veriler `src/data.js` ve `src/data_mvp.js` dosyalarındadır.

## MVP kapsamı

**Belediye ⇔ Vatandaş**
- Beyaz Masa (konumlu talep, fotoğrafta yüz bulanıklaştırma, kişisel veri maskeleme, otomatik birim önerisi, süre takibi)
- Belediye Duyuruları
- Ödeme Hatırlatmaları ve ödeme sayfasına yönlendirme
- Sosyal Yardım (başvuru, belge, sonuç takibi)
- Vatandaş Duyuruları (vefat, davet, satılık/kiralık; belediye onaylı)
- İlçe Takvimi (elektrik/su kesintisi, nöbetçi eczane, resmî duyurular; bölgeye göre süzülür)

**Belediye ⇔ Esnaf**
- Ödeme Yönlendirme (kira, işgaliye, ilan-reklam vergisi)
- Esnaf Rehberi (işletme bilgisi, çalışma saatleri, paylaşımlar)

**Yapay zekâ**
- Akıllı arama (“sigorta attı” → elektrik ustaları; “nikâh” → ilgili belediye hizmeti)
- Doküman oluşturma (dilekçe, sosyal yardım açıklaması, vefat/davet/satılık duyurusu, esnaf paylaşımı)

**Belediye Yönetim Portalı (pilot sürümü)**
- Talepler birimlerin kurumsal e-posta adreslerine düşer; e-postadaki güvenli bağlantıyla giriş yapmadan “İşleme al / Karşılandı / Kapat (açıklamalı) ” işlemleri yapılır
- Rol ve belediye bazlı yetki: platform yöneticisi, belediye yöneticisi, birim sorumlusu, sosyal yardım personeli, yayın onaycısı
- Onay kuyruğu, duyuru yayınlama, raporlar, çok belediyeli platform görünümü

Yol haritasındaki modüller (İhale ve İlan, Başvuru süreçleri, Belge Takvimi, Tanıtım Çevirisi, İstihdam, gelişmiş belediye modülleri) bu sürümde yoktur.

## Demo akışı (önerilen sıra)

1. **Bireysel** → “Demo hesabıyla hızlı giriş” → Beyaz Masa → Yeni talep. Metni yazın, “Resmî dile çevir”e basın, konum seçip gönderin.
2. Çıkış → **Belediye** → *Hakan Yurt · Fen İşleri*. Gelen kutusunda talebi açın → “İşleme al” → “Talebi kapat”, açıklama yazın.
3. Çıkış → **Bireysel**. Beyaz Masa → Kapalı: talebin süreleri ve belediyenin açıklaması görünür.
4. Vatandaş Duyuruları → Duyuru ver → “Yapay zekâ ile oluştur”. Sonra **Belediye** → *Melike Er* ile onay kuyruğundan yayınlayın.
5. *Emre Tan · Havran* ile giriş yapın: yalnızca Havran’ın talepleri görünür. *Meydan Destek* yalnızca toplu sayıları görür.

## Telefonda çalıştırma

**Bilgisayarsız (önerilen):** Bu depo GitHub’a gönderildiğinde `.github/workflows/build-apk.yml` APK’yı derleyip **Releases** bölümüne `Meydan-MVP.apk` olarak ekler. Telefondan indirip kurabilirsiniz.

**Bilgisayarla (Expo Go):**
```bash
npm install
npx expo start
```
Terminaldeki QR kodu Android’de Expo Go ile okutun. Bağlanmazsa `npx expo start --tunnel`.

## Kod yapısı

| Dosya | İçerik |
|---|---|
| `App.js` | Ekran yönlendirme; vatandaş ve portal ekran setleri |
| `src/store.js` | Ortak veri deposu ve `yetki` kuralları (tenant + rol kapsamı) |
| `src/data.js`, `src/data_mvp.js` | Mock veriler: belediyeler, birimler, personel, takvim, arama dizini |
| `src/ai.js` | Demo yapay zekâ katmanı: arama ve doküman üretimi (gerçekte Türkiye’de barındırılan model) |
| `src/screens/` | `beyazmasa`, `yardim`, `icerik` (duyurular), `takvim`, `odeme`, `esnaf`, `arama`, `dokuman`, `portal` |
