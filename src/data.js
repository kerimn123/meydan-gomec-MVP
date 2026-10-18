// Meydan demo — mock veriler. Tüm kişi, işletme ve tutarlar örnektir.
import { d } from './util';

export const MAHALLELER = [
  'Yaya', 'Kemalpaşa', 'Mithatpaşa', 'Karaağaç', 'Ulubeyler', 'Hacıhüseyinler', 'Hacıosman',
  'Hacıoğlu', 'Keremköy', 'Kuyualan', 'Dursunlu', 'Kobaşlar', 'Kumgedik',
];

export const SOKAKLAR = {
  Yaya: ['Cumhuriyet Caddesi', 'İstiklal Sokak', 'Zeytinlik Sokak', 'Okul Sokak'],
  Kemalpaşa: ['Atatürk Caddesi', 'Hükümet Sokak', 'Pazar Yeri Sokak', 'Cami Sokak'],
  Mithatpaşa: ['Sahil Yolu', 'Liman Sokak', 'Çınar Sokak', 'Lale Sokak'],
  Karaağaç: ['Plaj Caddesi', 'Martı Sokak', 'Deniz Sokak', 'Yalı Sokak'],
  Ulubeyler: ['Köy Yolu', 'Çeşme Sokak', 'Bağ Sokak'],
  Hacıhüseyinler: ['Okul Sokak', 'Değirmen Sokak', 'Bahçe Sokak'],
  Hacıosman: ['Köy Meydanı', 'Zeytin Sokak'],
  Hacıoğlu: ['Köy Meydanı', 'Pınar Sokak'],
  Keremköy: ['Köy Meydanı', 'Harman Sokak'],
  Kuyualan: ['Köy Meydanı', 'Kuyu Sokak'],
  Dursunlu: ['Köy Meydanı', 'Yayla Yolu'],
  Kobaşlar: ['Köy Meydanı', 'Tepe Sokak'],
  Kumgedik: ['Köy Meydanı', 'Kumsal Yolu'],
};

export const KULLANICILAR = {
  bireysel: { ad: 'Ayşe Demir', kimlik: 'TCKN 1•••••••••6', mahalle: 'Kemalpaşa' },
  kurumsal: { ad: 'Liman Kahvecisi', kimlik: 'VKN 4•••••••••2', yetkili: 'Murat Kaya', isletmeId: 'e1' },
};

export const BEYAZ_MASA_KATEGORILER = [
  'Yol ve kaldırım', 'Aydınlatma', 'Çöp ve temizlik', 'Park ve yeşil alan', 'Zabıta', 'Sokak hayvanları', 'Su ve kanalizasyon', 'Diğer',
];

export const KATEGORI_BIRIM = {
  'Yol ve kaldırım': 'Fen İşleri Müdürlüğü',
  'Aydınlatma': 'Fen İşleri Müdürlüğü',
  'Çöp ve temizlik': 'Temizlik İşleri Müdürlüğü',
  'Park ve yeşil alan': 'Park ve Bahçeler Müdürlüğü',
  'Zabıta': 'Zabıta Müdürlüğü',
  'Sokak hayvanları': 'Veteriner İşleri',
  'Su ve kanalizasyon': 'Su ve Kanalizasyon (BASKİ yönlendirme)',
  'Diğer': 'Beyaz Masa',
};

export const HEDEF_GUN = {
  'Yol ve kaldırım': 5, 'Aydınlatma': 3, 'Çöp ve temizlik': 1, 'Park ve yeşil alan': 5,
  'Zabıta': 2, 'Sokak hayvanları': 2, 'Su ve kanalizasyon': 2, 'Diğer': 5,
};

// ---------------- BEYAZ MASA ----------------
export const TALEPLER = [
  {
    id: '1047', kategori: 'Yol ve kaldırım', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Yüksek', kanal: 'Fotoğraf',
    metin: 'Okulun karşısındaki rögar kapağı yerinden çıkmış, çocuklar için tehlikeli.',
    mahalle: 'Yaya', sokak: 'Okul Sokak', foto: true, durum: 'İşlemde',
    olaylar: [
      { label: 'Oluşturuldu', at: d(0, 8, 40) },
      { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(0, 8, 41) },
      { label: 'İşleme alındı', at: d(0, 9, 15) },
    ],
  },
  {
    id: '1045', kategori: 'Yol ve kaldırım', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Sesli mesaj',
    metin: 'Pazar yeri girişindeki kaldırım taşları kırık, yaşlılar takılıp düşüyor.',
    mahalle: 'Kemalpaşa', sokak: 'Pazar Yeri Sokak', foto: false, durum: 'Birime iletildi',
    olaylar: [
      { label: 'Oluşturuldu (sesli mesaj yazıya çevrildi)', at: d(-1, 14, 5) },
      { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(-1, 14, 6) },
    ],
  },
  {
    id: '1042', kategori: 'Aydınlatma', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Yazılı',
    metin: 'Okul önündeki sokak lambası üç gündür yanmamaktadır.',
    mahalle: 'Kemalpaşa', sokak: 'Cami Sokak', foto: true, durum: 'Kapatıldı',
    aciklama: 'Arızalı armatür değiştirilmiştir. Bildiriminiz için teşekkür ederiz.',
    olaylar: [
      { label: 'Oluşturuldu', at: d(-3, 9, 12) },
      { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(-3, 9, 13) },
      { label: 'İşleme alındı', at: d(-3, 10, 30) },
      { label: 'Talep karşılandı', at: d(-2, 11, 40) },
      { label: 'Kapatıldı', at: d(-2, 16, 5) },
    ],
  },
  {
    id: '1038', kategori: 'Çöp ve temizlik', birim: 'Temizlik İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Fotoğraf',
    metin: 'Sahil yolundaki çöp konteyneri dolmuş, etrafa taşıyor.',
    mahalle: 'Mithatpaşa', sokak: 'Sahil Yolu', foto: true, durum: 'Kapatıldı',
    aciklama: 'Konteyner boşaltılmış ve çevresi temizlenmiştir. Bölgeye ek konteyner konulması planlanmaktadır.',
    olaylar: [
      { label: 'Oluşturuldu', at: d(-6, 18, 20) },
      { label: 'Temizlik İşleri Müdürlüğü’ne iletildi', at: d(-6, 18, 21) },
      { label: 'İşleme alındı', at: d(-5, 7, 45) },
      { label: 'Talep karşılandı', at: d(-5, 10, 10) },
      { label: 'Kapatıldı', at: d(-5, 10, 30) },
    ],
  },
  {
    id: '1031', kategori: 'Park ve yeşil alan', birim: 'Park ve Bahçeler Müdürlüğü', oncelik: 'Düşük', kanal: 'Yazılı',
    metin: 'Çocuk parkındaki salıncağın zinciri kopmuş.',
    mahalle: 'Karaağaç', sokak: 'Plaj Caddesi', foto: false, durum: 'Kapatıldı',
    aciklama: 'Salıncak zinciri yenilenmiştir.',
    olaylar: [
      { label: 'Oluşturuldu', at: d(-12, 11, 0) },
      { label: 'Park ve Bahçeler Müdürlüğü’ne iletildi', at: d(-12, 11, 1) },
      { label: 'İşleme alındı', at: d(-10, 9, 0) },
      { label: 'Talep karşılandı', at: d(-8, 15, 20) },
      { label: 'Kapatıldı', at: d(-8, 16, 0) },
    ],
  },
  {
    id: '1027', kategori: 'Sokak hayvanları', birim: 'Veteriner İşleri', oncelik: 'Yüksek', kanal: 'Yazılı',
    metin: 'Cami önünde ayağı yaralı bir köpek var, yürüyemiyor.',
    mahalle: 'Kemalpaşa', sokak: 'Cami Sokak', foto: true, durum: 'Kapatıldı',
    aciklama: 'Hayvan geçici bakımevine alınmış ve tedavisi yapılmıştır.',
    olaylar: [
      { label: 'Oluşturuldu', at: d(-15, 8, 10) },
      { label: 'Veteriner İşleri’ne iletildi', at: d(-15, 8, 11) },
      { label: 'İşleme alındı', at: d(-15, 8, 50) },
      { label: 'Talep karşılandı', at: d(-15, 12, 30) },
      { label: 'Kapatıldı', at: d(-15, 13, 0) },
    ],
  },
];

// ---------------- SOSYAL YARDIM ----------------
export const YARDIM_TURLERI = [
  {
    id: 'gida', ad: 'Gıda yardımı', aciklama: 'Temel gıda kolisi veya alışveriş kartı',
    belgeler: ['Gelir durumunu gösteren belge veya beyan', 'İkametgâh belgesi (e-Devlet)', 'Hane halkı bilgisi'],
  },
  {
    id: 'yakacak', ad: 'Yakacak yardımı', aciklama: 'Kış dönemi için kömür veya odun desteği',
    belgeler: ['Gelir durumunu gösteren belge veya beyan', 'İkametgâh belgesi (e-Devlet)', 'Konutta soba kullanıldığına dair beyan'],
  },
  {
    id: 'egitim', ad: 'Eğitim desteği', aciklama: 'Kırtasiye, kıyafet ve servis desteği',
    belgeler: ['Öğrenci belgesi (e-Devlet)', 'Gelir durumunu gösteren belge veya beyan', 'İkametgâh belgesi (e-Devlet)'],
  },
  {
    id: 'evde-bakim', ad: 'Evde bakım ve temizlik', aciklama: 'Yaşlı ve engelli vatandaşlara evde destek',
    belgeler: ['Sağlık raporu veya engelli raporu', 'İkametgâh belgesi (e-Devlet)', 'Bakım ihtiyacına ilişkin beyan'],
  },
  {
    id: 'engelli', ad: 'Engelli destek malzemesi', aciklama: 'Tekerlekli sandalye, hasta yatağı vb.',
    belgeler: ['Engelli sağlık kurulu raporu', 'Malzeme ihtiyacını gösteren reçete veya rapor', 'İkametgâh belgesi (e-Devlet)'],
  },
];

export const YARDIM_BASVURULARI = [
  {
    id: 'Y-318', turId: 'yakacak', tur: 'Yakacak yardımı', durum: 'Eksik belge', hane: 4, hedefGun: 21,
    aciklama: 'Kış ayları için yakacak desteği talep ediyorum.',
    eksik: 'Konutta soba kullanıldığına dair beyan',
    olaylar: [
      { label: 'Başvuru alındı', at: d(-15, 10, 5) },
      { label: 'Sosyal Yardım Birimi incelemeye aldı', at: d(-14, 9, 30) },
      { label: 'Eksik belge istendi', at: d(-3, 15, 10) },
    ],
  },
  {
    id: 'Y-287', turId: 'egitim', tur: 'Eğitim desteği', durum: 'Onaylandı', hane: 4, hedefGun: 21,
    aciklama: 'İki çocuğum için okul kırtasiye desteği.',
    sonuc: 'Kırtasiye desteğiniz onaylanmıştır. Teslimat için sizinle iletişime geçilecektir.',
    olaylar: [
      { label: 'Başvuru alındı', at: d(-45, 11, 0) },
      { label: 'İncelemeye alındı', at: d(-44, 9, 0) },
      { label: 'Hane ziyareti yapıldı', at: d(-38, 14, 0) },
      { label: 'Onaylandı', at: d(-31, 10, 0) },
    ],
  },
  {
    id: 'Y-142', turId: 'gida', tur: 'Gıda yardımı', durum: 'Sonuçlandı', hane: 4, hedefGun: 21,
    aciklama: 'Ramazan dönemi gıda desteği.',
    sonuc: 'Gıda kolisi teslim edilmiştir.',
    olaylar: [
      { label: 'Başvuru alındı', at: d(-220, 10, 0) },
      { label: 'Onaylandı', at: d(-210, 10, 0) },
      { label: 'Teslim edildi', at: d(-205, 13, 0) },
    ],
  },
];

// ---------------- BELEDİYE DUYURULARI ----------------
export const DUYURU_KATEGORILER = ['Tümü', 'Önemli', 'Çalışma', 'Etkinlik', 'Sağlık', 'Vergi', 'Genel'];

export const DUYURULAR = [
  {
    id: 'd1', kategori: 'Sağlık', onemli: true, tarih: d(0, 8, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Sivrisinek ve karasinek ilaçlaması',
    metin: 'Salı günü saat 10:00’dan itibaren ilçe genelinde sivrisinek ve karasinekle mücadele kapsamında ilaçlama çalışması yapılacaktır. Arıcılarımızın kovanlarını kapalı tutmaları, vatandaşlarımızın çalışma süresince pencerelerini kapalı tutmaları rica olunur.',
  },
  {
    id: 'd2', kategori: 'Etkinlik', onemli: false, tarih: d(-1, 11, 0), mahalleler: 'Tüm ilçe',
    baslik: '29 Ekim Cumhuriyet Bayramı kutlama programı',
    metin: 'Cumhuriyetimizin kuruluş yıl dönümü kutlamaları 29 Ekim sabahı 09:00’da Atatürk Anıtı önünde çelenk sunma töreniyle başlayacaktır. Akşam 19:00’da fener alayı ve ardından Cumhuriyet Meydanı’nda konser düzenlenecektir. Tüm hemşehrilerimiz davetlidir.',
  },
  {
    id: 'd3', kategori: 'Çalışma', onemli: true, tarih: d(-2, 16, 30), mahalleler: 'Kemalpaşa',
    baslik: 'Atatürk Caddesi’nde altyapı çalışması',
    metin: 'Atatürk Caddesi’nin Hükümet Sokak ile kesiştiği bölümde yağmur suyu hattı yenileme çalışması nedeniyle yol 3 gün süreyle trafiğe kapalı olacaktır. Araç trafiği Cami Sokak üzerinden sağlanacaktır. Anlayışınız için teşekkür ederiz.',
  },
  {
    id: 'd4', kategori: 'Vergi', onemli: true, tarih: d(-3, 9, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Emlak vergisi 2. taksit ödeme dönemi',
    metin: 'Emlak vergisi ve çevre temizlik vergisi 2. taksit ödemeleri 30 Kasım tarihine kadar yapılabilir. Ödemelerinizi Meydan uygulamasındaki Yaklaşan Ödemeler bölümünden belediyemizin ödeme sayfası üzerinden veya belediye veznesinden gerçekleştirebilirsiniz.',
  },
  {
    id: 'd5', kategori: 'Genel', onemli: false, tarih: d(-4, 14, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Kış dönemi çöp toplama saatleri',
    metin: '1 Kasım itibarıyla evsel atıklar ilçe merkezinde her gün 06:00–10:00 saatleri arasında, kırsal mahallelerde ise Salı ve Cuma günleri toplanacaktır. Çöplerin poşetlenerek konteynerlere bırakılması rica olunur.',
  },
  {
    id: 'd6', kategori: 'Etkinlik', onemli: false, tarih: d(-5, 10, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Zeytin hasat şenliği',
    metin: 'Geleneksel Zeytin Hasat Şenliği kapsamında yerel üreticilerimizin ürünlerini sergileyeceği stantlar, halk oyunları gösterileri ve çocuk etkinlikleri düzenlenecektir. Şenlik 2 gün sürecek olup giriş ücretsizdir.',
  },
  {
    id: 'd7', kategori: 'Sağlık', onemli: false, tarih: d(-6, 9, 30), mahalleler: 'Tüm ilçe',
    baslik: 'Ücretsiz göz taraması',
    metin: 'Belediyemiz ile ilçe sağlık müdürlüğü iş birliğiyle 65 yaş üstü vatandaşlarımıza yönelik ücretsiz göz taraması yapılacaktır. Randevu için Beyaz Masa’ya başvurabilirsiniz.',
  },
  {
    id: 'd8', kategori: 'Çalışma', onemli: false, tarih: d(-8, 13, 0), mahalleler: 'Karaağaç, Mithatpaşa',
    baslik: 'Sahil yolu kaldırım yenileme',
    metin: 'Sahil yolu boyunca kaldırım yenileme çalışmaları başlamıştır. Çalışmaların 2 hafta içinde tamamlanması planlanmaktadır. Yayaların geçici geçiş yollarını kullanmaları rica olunur.',
  },
  {
    id: 'd9', kategori: 'Genel', onemli: false, tarih: d(-9, 10, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Kurs kayıtları başladı',
    metin: 'Belediyemiz kültür merkezinde açılacak ahşap boyama, ebru, satranç ve İngilizce kurslarına kayıtlar başlamıştır. Kurslar ücretsizdir ve kontenjan sınırlıdır.',
  },
  {
    id: 'd10', kategori: 'Genel', onemli: false, tarih: d(-11, 15, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Sokak hayvanları için mama noktaları',
    metin: 'İlçemizin 12 noktasına sokak hayvanları için mama ve su kapları yerleştirilmiştir. Noktaların temizliği belediyemiz ekiplerince düzenli olarak yapılmaktadır.',
  },
  {
    id: 'd11', kategori: 'Etkinlik', onemli: false, tarih: d(-13, 12, 0), mahalleler: 'Tüm ilçe',
    baslik: 'Kitap okuma etkinliği',
    metin: 'Halk kütüphanesinde her Cumartesi 11:00’de çocuklara yönelik masal ve kitap okuma etkinliği düzenlenmektedir.',
  },
  {
    id: 'd12', kategori: 'Vergi', onemli: false, tarih: d(-16, 9, 0), mahalleler: 'Tüm ilçe',
    baslik: 'İşgaliye ve ilan reklam vergisi hatırlatması',
    metin: 'İşyeri önü işgaliye harcı ve ilan reklam vergisi ödemelerinin süresi içinde yapılması gerekmektedir. Kurumsal hesap sahipleri ödemelerini uygulama üzerinden takip edebilir.',
  },
];

// ---------------- ESNAF TANITIMLARI ----------------
const H = (a, b) => [a, b];
const hafta = (a, b, pazar = null, cumartesi) => ({
  0: pazar, 1: H(a, b), 2: H(a, b), 3: H(a, b), 4: H(a, b), 5: H(a, b), 6: cumartesi === undefined ? H(a, b) : cumartesi,
});

export const ISLETMELER = [
  { id: 'e1', ad: 'Liman Kahvecisi', tur: 'Kafe', mahalle: 'Mithatpaşa', adres: 'Liman Sokak No: 4', yetkili: 'Murat Kaya', tel: '0555 000 00 01', hours: hafta('08:00', '23:00', H('09:00', '23:00')), tanitim: 'Deniz manzaralı terasta Türk kahvesi, ev yapımı tatlılar ve kahvaltı.' },
  { id: 'e2', ad: 'Merkez Fırın', tur: 'Fırın', mahalle: 'Kemalpaşa', adres: 'Atatürk Caddesi No: 21', yetkili: 'Hasan Öztürk', tel: '0555 000 00 02', hours: hafta('06:30', '20:00', H('07:00', '14:00')), tanitim: 'Taş fırında ekmek, pide ve zeytinli poğaça.' },
  { id: 'e3', ad: 'Zeytin Dalı Lokantası', tur: 'Lokanta', mahalle: 'Kemalpaşa', adres: 'Hükümet Sokak No: 7', yetkili: 'Fatma Aydın', tel: '0555 000 00 03', hours: hafta('11:00', '21:00', null), tanitim: 'Ev yemekleri, zeytinyağlılar ve günlük çorbalar.' },
  { id: 'e4', ad: 'Karaağaç Balıkçısı', tur: 'Restoran', mahalle: 'Karaağaç', adres: 'Plaj Caddesi No: 15', yetkili: 'Ali Şahin', tel: '0555 000 00 04', hours: hafta('12:00', '23:00', H('12:00', '23:00')), tanitim: 'Günlük taze balık ve Ege mezeleri.' },
  { id: 'e5', ad: 'Ege Market', tur: 'Market', mahalle: 'Yaya', adres: 'Cumhuriyet Caddesi No: 33', yetkili: 'Emre Yıldız', tel: '0555 000 00 05', hours: hafta('08:00', '22:00', H('09:00', '21:00')), tanitim: 'Gıda, temizlik ve yerel üretici ürünleri.' },
  { id: 'e6', ad: 'Usta Berber', tur: 'Berber', mahalle: 'Kemalpaşa', adres: 'Cami Sokak No: 2', yetkili: 'Kemal Arslan', tel: '0555 000 00 06', hours: hafta('09:00', '20:00', null), tanitim: 'Saç, sakal ve çocuk tıraşı. Randevulu çalışılır.' },
  { id: 'e7', ad: 'Işık Elektrik', tur: 'Elektrik ustası', mahalle: 'Yaya', adres: 'Okul Sokak No: 9', yetkili: 'Mustafa Koç', tel: '0555 000 00 07', hours: hafta('08:00', '19:00', null), tanitim: 'Ev ve işyeri elektrik tesisatı, arıza ve aydınlatma montajı.' },
  { id: 'e8', ad: 'Kıyı Tesisat', tur: 'Tesisatçı', mahalle: 'Mithatpaşa', adres: 'Çınar Sokak No: 12', yetkili: 'Ahmet Doğan', tel: '0555 000 00 08', hours: hafta('09:00', '18:00', null), tanitim: 'Su tesisatı, kombi ve petek bakımı.' },
  { id: 'e9', ad: 'Renk Boya Dekorasyon', tur: 'Boya badana', mahalle: 'Hacıhüseyinler', adres: 'Bahçe Sokak No: 3', yetkili: 'İbrahim Çelik', tel: '0555 000 00 09', hours: hafta('08:00', '18:00', null), tanitim: 'İç ve dış cephe boya, alçı ve dekorasyon.' },
  { id: 'e10', ad: 'Sahil Pansiyon', tur: 'Pansiyon', mahalle: 'Karaağaç', adres: 'Yalı Sokak No: 6', yetkili: 'Zeynep Kurt', tel: '0555 000 00 10', hours: hafta('00:00', '23:59', H('00:00', '23:59')), tanitim: 'Denize 50 metre, kahvaltı dahil odalar.' },
  { id: 'e11', ad: 'Ayva Pastanesi', tur: 'Pastane', mahalle: 'Kemalpaşa', adres: 'Atatürk Caddesi No: 40', yetkili: 'Elif Polat', tel: '0555 000 00 11', hours: hafta('07:30', '21:00', H('08:30', '20:00')), tanitim: 'Yaş pasta, kurabiye ve siparişe özel pastalar.' },
  { id: 'e12', ad: 'Hacıosman Zeytinyağı', tur: 'Üretici', mahalle: 'Hacıosman', adres: 'Zeytin Sokak No: 1', yetkili: 'Osman Güneş', tel: '0555 000 00 12', hours: hafta('09:00', '17:00', null, null), tanitim: 'Soğuk sıkım zeytinyağı, sele zeytin ve sabun.' },
  { id: 'e13', ad: 'Oto Bakım Merkezi', tur: 'Oto tamir', mahalle: 'Ulubeyler', adres: 'Köy Yolu No: 18', yetkili: 'Serkan Aksoy', tel: '0555 000 00 13', hours: hafta('08:30', '18:30', null), tanitim: 'Periyodik bakım, lastik ve fren onarımı.' },
  { id: 'e14', ad: 'Marangoz Hüseyin', tur: 'Marangoz', mahalle: 'Yaya', adres: 'Zeytinlik Sokak No: 5', yetkili: 'Hüseyin Er', tel: '0555 000 00 14', hours: hafta('08:00', '18:00', null), tanitim: 'Kapı, pencere, mutfak dolabı yapım ve tamiri.' },
];

export const PAYLASIM_TURLERI = ['Kampanya', 'Menü', 'Çalışma saatleri', 'Duyuru'];

export const PAYLASIMLAR = [
  { id: 'p1', isletmeId: 'e1', tur: 'Kampanya', tarih: d(0, 9, 0), gecerlilik: d(20), baslik: 'Hafta içi sıcak içeceklerde %20 indirim', metin: 'Pazartesi–Cuma 10:00–16:00 arasında tüm sıcak içeceklerde %20 indirim. Öğrencilere ek olarak ev yapımı kurabiye ikramı.' },
  { id: 'p2', isletmeId: 'e2', tur: 'Çalışma saatleri', tarih: d(0, 7, 0), gecerlilik: d(120), baslik: 'Kış dönemi çalışma saatleri', metin: 'Kış döneminde hafta içi 06:30–20:00, Pazar günleri 07:00–14:00 saatleri arasında hizmet vermekteyiz.' },
  { id: 'p3', isletmeId: 'e3', tur: 'Menü', tarih: d(0, 10, 30), gecerlilik: d(1), baslik: 'Bugünün menüsü', metin: 'Mercimek çorbası\nZeytinyağlı taze fasulye\nFırında tavuk ve pilav\nSütlaç', menu: [['Mercimek çorbası', 60], ['Zeytinyağlı taze fasulye', 110], ['Fırında tavuk, pilav', 180], ['Sütlaç', 70]] },
  { id: 'p4', isletmeId: 'e4', tur: 'Kampanya', tarih: d(-1, 12, 0), gecerlilik: d(10), baslik: 'Hafta sonu 2 kişilik balık menüsü', metin: 'Cumartesi ve Pazar günleri günün balığı, meze tabağı ve salatadan oluşan iki kişilik menü özel fiyatla.' },
  { id: 'p5', isletmeId: 'e5', tur: 'Kampanya', tarih: d(-1, 9, 0), gecerlilik: d(6), baslik: 'Yerel üretici haftası', metin: 'Gömeç’in üreticilerinden zeytin, zeytinyağı, peynir ve reçellerde bu hafta indirim.' },
  { id: 'p6', isletmeId: 'e6', tur: 'Duyuru', tarih: d(-2, 18, 0), gecerlilik: d(30), baslik: 'Online randevu başladı', metin: 'Bekleme yapmamak için telefonla randevu alabilirsiniz. Çarşamba günleri 65 yaş üstüne indirim.' },
  { id: 'p7', isletmeId: 'e11', tur: 'Menü', tarih: d(-2, 8, 0), gecerlilik: d(60), baslik: 'Sonbahar tatlıları', metin: 'Ayva tatlısı, kabak tatlısı ve elmalı turta vitrinde.', menu: [['Ayva tatlısı', 120], ['Kabak tatlısı', 100], ['Elmalı turta (dilim)', 90]] },
  { id: 'p8', isletmeId: 'e12', tur: 'Duyuru', tarih: d(-3, 11, 0), gecerlilik: d(45), baslik: 'Yeni hasat zeytinyağı satışta', metin: 'Bu yılın erken hasat soğuk sıkım zeytinyağımız satışta. Teneke ve cam şişe seçenekleri mevcuttur.' },
  { id: 'p9', isletmeId: 'e10', tur: 'Kampanya', tarih: d(-4, 10, 0), gecerlilik: d(40), baslik: 'Kış sezonu konaklama indirimi', metin: 'Kasım–Mart döneminde 3 gece kalana 1 gece hediye.' },
  { id: 'p10', isletmeId: 'e1', tur: 'Menü', tarih: d(-5, 9, 0), gecerlilik: d(90), baslik: 'Kahvaltı menüsü', metin: 'Serpme köy kahvaltısı ve tost çeşitleri.', menu: [['Serpme kahvaltı (kişi)', 350], ['Kaşarlı tost', 120], ['Menemen', 150], ['Türk kahvesi', 70]] },
  { id: 'p11', isletmeId: 'e7', tur: 'Duyuru', tarih: d(-6, 17, 0), gecerlilik: d(30), baslik: 'Acil arıza hizmeti', metin: 'Mesai saatleri dışında acil elektrik arızaları için telefonla ulaşabilirsiniz.' },
  { id: 'p12', isletmeId: 'e13', tur: 'Kampanya', tarih: d(-7, 9, 0), gecerlilik: d(25), baslik: 'Kış lastiği değişiminde ücretsiz kontrol', metin: 'Kış lastiği takımlarında akü ve fren kontrolü ücretsiz.' },
  { id: 'p13', isletmeId: 'e9', tur: 'Kampanya', tarih: d(-8, 9, 0), gecerlilik: d(15), baslik: 'Kış öncesi dış cephe bakımı', metin: 'Yağmur öncesi dış cephe izolasyon boyasında ücretsiz keşif.' },
  { id: 'p14', isletmeId: 'e3', tur: 'Çalışma saatleri', tarih: d(-9, 9, 0), gecerlilik: d(60), baslik: 'Pazar günleri kapalıyız', metin: 'Kış döneminde Pazar günleri kapalıyız. Hafta içi 11:00–21:00.' },
];

// ---------------- İLANLAR (vatandaş) ----------------
export const ILAN_KATEGORILER = ['Vefat', 'Düğün', 'Sünnet', 'Hayır', 'Satılık', 'Kiralık', 'Usta aranıyor', 'Kayıp / Buluntu', 'Yol kapanması'];

export const ILANLAR = [
  { id: 'i1', kategori: 'Vefat', tarih: d(0, 7, 30), mahalle: 'Yaya', baslik: 'Vefat ve cenaze bilgisi', metin: 'Yaya Mahallesi’nden Mehmet Yılmaz (Hacı Mehmet) vefat etmiştir. Cenazesi bugün öğle namazını müteakip Yaya Camii’nden kaldırılacaktır. Taziyeler cami avlusunda kabul edilecektir. Allah rahmet eylesin.', durum: 'Yayında' },
  { id: 'i2', kategori: 'Hayır', tarih: d(-1, 15, 0), mahalle: 'Hacıosman', baslik: 'Cumartesi hayır yemeği', metin: 'Rahmetli babamızın hayrına Cumartesi günü 12:30’da Hacıosman köy camii avlusunda yemek verilecektir. Tüm hemşehrilerimiz davetlidir.', durum: 'Yayında' },
  { id: 'i3', kategori: 'Düğün', tarih: d(-1, 11, 0), mahalle: 'Ulubeyler', baslik: 'Düğün davetiyesi', metin: 'Oğlumuz Can ile Selin’in düğünü önümüzdeki Cumartesi akşamı 19:00’da Ulubeyler düğün salonunda yapılacaktır. Tüm dost ve akrabalarımız davetlidir.', durum: 'Yayında' },
  { id: 'i4', kategori: 'Sünnet', tarih: d(-2, 10, 0), mahalle: 'Kemalpaşa', baslik: 'Sünnet düğünü', metin: 'Oğlumuz Yusuf’un sünnet düğünü Pazar günü 14:00’te evimizin bahçesinde yapılacaktır. Mevlit sonrası yemek ikram edilecektir.', durum: 'Yayında' },
  { id: 'i5', kategori: 'Yol kapanması', tarih: d(0, 9, 30), mahalle: 'Mithatpaşa', baslik: 'Rögar taşması nedeniyle sokak kapalı', metin: 'Lale Sokak’ta rögar taşması nedeniyle sokak geçici olarak kapatılmıştır. Belediye ekipleri çalışmaktadır.', durum: 'Yayında' },
  { id: 'i6', kategori: 'Satılık', tarih: d(-2, 18, 0), mahalle: 'Karaağaç', baslik: 'Denize yakın 2+1 yazlık', metin: 'Karaağaç’ta denize 300 metre, 85 m², bahçeli, eşyalı 2+1 yazlık satılıktır.', fiyat: '₺3.450.000', durum: 'Yayında' },
  { id: 'i7', kategori: 'Satılık', tarih: d(-3, 12, 0), mahalle: 'Hacıhüseyinler', baslik: '25 dönüm zeytinlik', metin: 'Yola cepheli, sulu, yaklaşık 450 ağaçlı zeytinlik satılıktır.', fiyat: '₺4.200.000', durum: 'Yayında' },
  { id: 'i8', kategori: 'Satılık', tarih: d(-4, 9, 0), mahalle: 'Yaya', baslik: '2014 model traktör', metin: 'Bakımlı, tek sahibinden, 4 çeker bahçe traktörü.', fiyat: '₺1.150.000', durum: 'Yayında' },
  { id: 'i9', kategori: 'Kiralık', tarih: d(-1, 20, 0), mahalle: 'Kemalpaşa', baslik: 'Kışlık kiralık 3+1 daire', metin: 'İlçe merkezinde, doğalgazlı, asansörlü 3+1 daire Kasım–Mayıs dönemi için kiralıktır.', fiyat: '₺14.000 / ay', durum: 'Yayında' },
  { id: 'i10', kategori: 'Kiralık', tarih: d(-5, 14, 0), mahalle: 'Kemalpaşa', baslik: 'Cadde üzeri kiralık dükkân', metin: 'Atatürk Caddesi üzerinde 60 m², vitrinli dükkân kiralıktır.', fiyat: '₺18.000 / ay', durum: 'Yayında' },
  { id: 'i11', kategori: 'Usta aranıyor', tarih: d(0, 8, 15), mahalle: 'Kemalpaşa', baslik: 'İç cephe boya ustası aranıyor', metin: 'İki odalı dairenin iç cephe boyası için önümüzdeki hafta müsait usta aranıyor.', durum: 'Yayında' },
  { id: 'i12', kategori: 'Usta aranıyor', tarih: d(-1, 19, 0), mahalle: 'Karaağaç', baslik: 'Kombi bakımı yapacak usta', metin: 'Kış öncesi kombi bakımı ve petek temizliği yaptırmak istiyorum.', durum: 'Yayında' },
  { id: 'i15', kategori: 'Kayıp / Buluntu', tarih: d(-1, 17, 30), mahalle: 'Mithatpaşa', baslik: 'Sahilde anahtar bulundu', metin: 'Sahil yolunda üzerinde mavi anahtarlık bulunan anahtar bulunmuştur. Belediye Beyaz Masa’ya teslim edilmiştir.', durum: 'Yayında' },
  { id: 'i16', kategori: 'Kayıp / Buluntu', tarih: d(-4, 8, 0), mahalle: 'Ulubeyler', baslik: 'Kayıp kedi', metin: 'Gri tekir, mavi tasmalı kedimiz kaybolmuştur. Görenlerin uygulama üzerinden bildirmesi rica olunur.', durum: 'Yayında' },
];

export const BENIM_ILANLARIM = [
  { id: 'i90', kategori: 'Hayır', tarih: d(0, 10, 20), mahalle: 'Kemalpaşa', baslik: 'Mevlit ve yemek', metin: 'Annemizin ruhuna Cuma günü ikindi namazından sonra Kemalpaşa Camii’nde mevlit okutulacak, ardından yemek ikram edilecektir.', durum: 'Onay bekliyor' },
];

// ---------------- ÖDEMELER ----------------
function nextDate(month, day) {
  const now = new Date();
  let y = now.getFullYear();
  const t = new Date(y, month - 1, day, 23, 59);
  if (t < now) y += 1;
  return new Date(y, month - 1, day, 23, 59);
}

export const ODEMELER = {
  bireysel: [
    { id: 'o1', kalem: 'Emlak vergisi · 2. taksit', aciklama: 'Kemalpaşa Mah. Atatürk Cad. No: 12 (konut)', tutar: 1284.5, sonGun: nextDate(11, 30), durum: 'Bekliyor' },
    { id: 'o2', kalem: 'Çevre temizlik vergisi · 2. taksit', aciklama: 'Konut', tutar: 312.0, sonGun: nextDate(11, 30), durum: 'Bekliyor' },
    { id: 'o3', kalem: 'Emlak vergisi · 2. taksit', aciklama: 'Hacıhüseyinler Mah. zeytinlik (arazi)', tutar: 438.75, sonGun: nextDate(11, 30), durum: 'Bekliyor' },
    { id: 'o4', kalem: 'Emlak vergisi · 1. taksit', aciklama: 'Kemalpaşa Mah. Atatürk Cad. No: 12 (konut)', tutar: 1284.5, sonGun: d(-140), durum: 'Ödendi', odeme: d(-142) },
    { id: 'o5', kalem: 'Çevre temizlik vergisi · 1. taksit', aciklama: 'Konut', tutar: 312.0, sonGun: d(-140), durum: 'Ödendi', odeme: d(-142) },
  ],
  kurumsal: [
    { id: 'k1', kalem: 'Belediye dükkân kirası · Ekim', aciklama: 'Mithatpaşa Liman Sokak No: 4', tutar: 6500.0, sonGun: d(-2), durum: 'Gecikmiş' },
    { id: 'k2', kalem: 'İşgaliye harcı · masa-sandalye', aciklama: 'Teras önü 24 m²', tutar: 2160.0, sonGun: d(9), durum: 'Bekliyor' },
    { id: 'k3', kalem: 'İlan ve reklam vergisi', aciklama: 'Işıklı tabela 3 m²', tutar: 945.0, sonGun: nextDate(11, 30), durum: 'Bekliyor' },
    { id: 'k4', kalem: 'Çevre temizlik vergisi · işyeri', aciklama: '2. taksit', tutar: 1180.0, sonGun: nextDate(11, 30), durum: 'Bekliyor' },
    { id: 'k5', kalem: 'Belediye dükkân kirası · Eylül', aciklama: 'Mithatpaşa Liman Sokak No: 4', tutar: 6500.0, sonGun: d(-32), durum: 'Ödendi', odeme: d(-33) },
    { id: 'k6', kalem: 'İşyeri açma ruhsat harcı', aciklama: 'Ek faaliyet: açık alan', tutar: 1750.0, sonGun: d(-60), durum: 'Ödendi', odeme: d(-61) },
  ],
};

