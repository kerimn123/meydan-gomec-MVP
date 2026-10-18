// Meydan MVP — çok belediyeli yapı, belediye portalı, ilçe takvimi, yapay zekâ arama ve doküman verileri.
// Tüm kişi, kurum adresi ve tutarlar örnektir.
import { d } from './util';

// Bir sonraki ay/gün tarihi (resmî tatiller her yıl aynı güne düşer)
function sonraki(ay, gun, saat = 0, dk = 0) {
  const now = new Date();
  let x = new Date(now.getFullYear(), ay - 1, gun, saat, dk);
  if (x < new Date(now.getFullYear(), now.getMonth(), now.getDate())) x = new Date(now.getFullYear() + 1, ay - 1, gun, saat, dk);
  return x;
}

// ---------------- BELEDİYELER (tenant) ----------------
export const BELEDIYELER = [
  { id: 'gomec', ad: 'Gömeç Belediyesi', il: 'Balıkesir', alanAdi: 'gomec.meydan.app', kullanici: 2480, esnaf: 164, paket: 'Gelişim' },
  { id: 'havran', ad: 'Havran Belediyesi', il: 'Balıkesir', alanAdi: 'havran.meydan.app', kullanici: 1310, esnaf: 92, paket: 'Başlangıç' },
];

// Pilotta her birim kendi e-posta adresinden talepleri alır
export const BIRIMLER = {
  gomec: [
    { ad: 'Beyaz Masa', eposta: 'beyazmasa@gomec.bel.tr' },
    { ad: 'Fen İşleri Müdürlüğü', eposta: 'fenisleri@gomec.bel.tr' },
    { ad: 'Temizlik İşleri Müdürlüğü', eposta: 'temizlik@gomec.bel.tr' },
    { ad: 'Park ve Bahçeler Müdürlüğü', eposta: 'parkbahce@gomec.bel.tr' },
    { ad: 'Zabıta Müdürlüğü', eposta: 'zabita@gomec.bel.tr' },
    { ad: 'Veteriner İşleri', eposta: 'veteriner@gomec.bel.tr' },
    { ad: 'Su ve Kanalizasyon (BASKİ yönlendirme)', eposta: 'beyazmasa@gomec.bel.tr' },
    { ad: 'Sosyal Yardım Birimi', eposta: 'sosyalyardim@gomec.bel.tr' },
    { ad: 'Basın ve Halkla İlişkiler', eposta: 'basin@gomec.bel.tr' },
    { ad: 'Mali Hizmetler (Gelirler)', eposta: 'gelirler@gomec.bel.tr' },
  ],
  havran: [
    { ad: 'Beyaz Masa', eposta: 'beyazmasa@havran.bel.tr' },
    { ad: 'Fen İşleri Müdürlüğü', eposta: 'fen@havran.bel.tr' },
  ],
};

// Rol modeli: her kullanıcı yalnızca kendi belediyesinde ve rolünün izin verdiği kapsamda işlem yapar
export const ROLLER = {
  platform: { ad: 'Platform yöneticisi', aciklama: 'Belediyeleri ve paketleri yönetir. Vatandaşların kişisel verilerini görmez.' },
  yonetici: { ad: 'Belediye yöneticisi', aciklama: 'Kendi belediyesinin tüm talepleri, birimleri, onayları ve raporları.' },
  birim: { ad: 'Birim sorumlusu', aciklama: 'Yalnızca kendi birimine gelen talepler.' },
  sosyal: { ad: 'Sosyal yardım personeli', aciklama: 'Yalnızca sosyal yardım başvuruları (özel nitelikli veri).' },
  onay: { ad: 'Yayın onaycısı', aciklama: 'Vatandaş duyurularını onaylar, belediye duyurusu yayınlar.' },
};

export const PORTAL_KULLANICILARI = [
  { id: 'u1', ad: 'Selin Arı', unvan: 'Beyaz Masa Sorumlusu', tenant: 'gomec', rol: 'yonetici' },
  { id: 'u2', ad: 'Hakan Yurt', unvan: 'Fen İşleri Müdürü', tenant: 'gomec', rol: 'birim', birim: 'Fen İşleri Müdürlüğü' },
  { id: 'u3', ad: 'Derya Koç', unvan: 'Sosyal Yardım Uzmanı', tenant: 'gomec', rol: 'sosyal', birim: 'Sosyal Yardım Birimi' },
  { id: 'u4', ad: 'Melike Er', unvan: 'Basın ve Halkla İlişkiler', tenant: 'gomec', rol: 'onay', birim: 'Basın ve Halkla İlişkiler' },
  { id: 'u5', ad: 'Emre Tan', unvan: 'Beyaz Masa Sorumlusu', tenant: 'havran', rol: 'yonetici' },
  { id: 'u6', ad: 'Meydan Destek', unvan: 'Platform ekibi', tenant: null, rol: 'platform' },
];

// Başka vatandaşların talepleri (portalda görünür, vatandaş uygulamasında görünmez)
export const DIGER_TALEPLER = [
  {
    id: '1046', tenant: 'gomec', sahip: 'diger', basvuran: 'M*** K***', kategori: 'Aydınlatma', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Yazılı',
    metin: 'Sahil yolundaki üç direkte lamba yanmıyor, akşam yürüyüş yolu karanlık.', mahalle: 'Mithatpaşa', sokak: 'Sahil Yolu', foto: false, durum: 'Birime iletildi',
    olaylar: [{ label: 'Oluşturuldu', at: d(-2, 19, 20) }, { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(-2, 19, 21) }],
  },
  {
    id: '1044', tenant: 'gomec', sahip: 'diger', basvuran: 'A*** Y***', kategori: 'Yol ve kaldırım', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Fotoğraf',
    metin: 'Plaj caddesinde asfaltta çukur oluşmuş, yağmurda su birikiyor.', mahalle: 'Karaağaç', sokak: 'Plaj Caddesi', foto: true, durum: 'İşlemde',
    olaylar: [{ label: 'Oluşturuldu', at: d(-7, 11, 20) }, { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(-7, 11, 21) }, { label: 'İşleme alındı', at: d(-6, 9, 0) }],
  },
  {
    id: '1043', tenant: 'gomec', sahip: 'diger', basvuran: 'H*** Ç***', kategori: 'Çöp ve temizlik', birim: 'Temizlik İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Yazılı',
    metin: 'Pazar yeri sonrası çevrede çöpler toplanmadı.', mahalle: 'Kemalpaşa', sokak: 'Pazar Yeri Sokak', foto: false, durum: 'Birime iletildi',
    olaylar: [{ label: 'Oluşturuldu', at: d(0, 7, 50) }, { label: 'Temizlik İşleri Müdürlüğü’ne iletildi', at: d(0, 7, 51) }],
  },
  {
    id: '1040', tenant: 'gomec', sahip: 'diger', basvuran: 'S*** B***', kategori: 'Zabıta', birim: 'Zabıta Müdürlüğü', oncelik: 'Orta', kanal: 'Yazılı',
    metin: 'Kaldırıma taşan seyyar tezgâhlar yaya geçişini engelliyor.', mahalle: 'Kemalpaşa', sokak: 'Atatürk Caddesi', foto: false, durum: 'Kapatıldı',
    aciklama: 'Zabıta ekiplerimizce gerekli uyarı yapılmış ve kaldırım açılmıştır.',
    olaylar: [{ label: 'Oluşturuldu', at: d(-9, 10, 0) }, { label: 'Zabıta Müdürlüğü’ne iletildi', at: d(-9, 10, 1) }, { label: 'İşleme alındı', at: d(-9, 11, 0) }, { label: 'Talep karşılandı', at: d(-8, 10, 0) }, { label: 'Kapatıldı', at: d(-8, 10, 30) }],
  },
  {
    id: 'H-210', tenant: 'havran', sahip: 'diger', basvuran: 'K*** E***', kategori: 'Yol ve kaldırım', birim: 'Fen İşleri Müdürlüğü', oncelik: 'Orta', kanal: 'Yazılı',
    metin: 'Köy yolunda menfez tıkanmış.', mahalle: 'Merkez', sokak: 'Köy Yolu', foto: false, durum: 'Birime iletildi',
    olaylar: [{ label: 'Oluşturuldu', at: d(-1, 9, 0) }, { label: 'Fen İşleri Müdürlüğü’ne iletildi', at: d(-1, 9, 1) }],
  },
];

export const DIGER_YARDIMLAR = [
  {
    id: 'Y-322', tenant: 'gomec', sahip: 'diger', basvuran: 'F*** Ş***', turId: 'gida', tur: 'Gıda yardımı', durum: 'Alındı', hane: 5, hedefGun: 21,
    aciklama: 'Eşim çalışamıyor, kış için gıda desteği rica ediyorum.', olaylar: [{ label: 'Başvuru alındı', at: d(-1, 15, 0) }],
  },
  {
    id: 'Y-320', tenant: 'gomec', sahip: 'diger', basvuran: 'R*** A***', turId: 'evde-bakim', tur: 'Evde bakım ve temizlik', durum: 'İncelemede', hane: 1, hedefGun: 21,
    aciklama: '82 yaşındayım, evde temizlik desteğine ihtiyacım var.', olaylar: [{ label: 'Başvuru alındı', at: d(-5, 10, 0) }, { label: 'İncelemeye alındı', at: d(-4, 9, 0) }],
  },
];

export const DIGER_ILANLAR_BEKLEYEN = [
  { id: 'i80', tenant: 'gomec', basvuran: 'N*** T***', kategori: 'Satılık', tarih: d(0, 9, 10), mahalle: 'Yaya', baslik: 'Az kullanılmış çocuk bisikleti', metin: '20 jant, bakımlı çocuk bisikleti satılıktır.', fiyat: '₺2.500', durum: 'Onay bekliyor' },
  { id: 'i81', tenant: 'gomec', basvuran: 'B*** Ö***', kategori: 'Düğün', tarih: d(0, 8, 40), mahalle: 'Kemalpaşa', baslik: 'Kına gecesi daveti', metin: 'Kızımız Elif’in kına gecesi Perşembe akşamı 20:00’de düğün salonunda yapılacaktır.', durum: 'Onay bekliyor' },
];

// ---------------- İLÇE TAKVİMİ ----------------
// sokaklar: etkilenen sokaklar; '*' tüm mahalle
export const TAKVIM = [
  {
    id: 't1', tur: 'Elektrik', kaynak: 'UEDAŞ', baslik: 'Planlı elektrik kesintisi', bas: d(1, 9, 0), bit: d(1, 14, 0),
    aciklama: 'Şebeke bakım ve iyileştirme çalışması', yayim: d(-2, 17, 40),
    etki: [{ mahalle: 'Kemalpaşa', sokaklar: ['Atatürk Caddesi', 'Hükümet Sokak', 'Cami Sokak'] }, { mahalle: 'Yaya', sokaklar: ['Okul Sokak'] }],
  },
  {
    id: 't2', tur: 'Su', kaynak: 'BASKİ', baslik: 'Planlı su kesintisi', bas: d(3, 10, 0), bit: d(3, 16, 0),
    aciklama: 'İsale hattı bağlantı çalışması', yayim: d(-1, 11, 15),
    etki: [{ mahalle: 'Kemalpaşa', sokaklar: ['*'] }, { mahalle: 'Mithatpaşa', sokaklar: ['Liman Sokak', 'Çınar Sokak'] }],
  },
  {
    id: 't3', tur: 'Elektrik', kaynak: 'UEDAŞ', baslik: 'Planlı elektrik kesintisi', bas: d(2, 13, 0), bit: d(2, 17, 0),
    aciklama: 'Trafo yenileme', yayim: d(-1, 9, 0),
    etki: [{ mahalle: 'Karaağaç', sokaklar: ['*'] }],
  },
  {
    id: 't4', tur: 'Su', kaynak: 'BASKİ', baslik: 'Arıza nedeniyle su kesintisi', bas: d(0, 8, 30), bit: d(0, 15, 0),
    aciklama: 'Ana boru arızası onarımı', yayim: d(0, 8, 10),
    etki: [{ mahalle: 'Hacıhüseyinler', sokaklar: ['*'] }, { mahalle: 'Ulubeyler', sokaklar: ['Çeşme Sokak'] }],
  },
  {
    id: 't5', tur: 'Elektrik', kaynak: 'UEDAŞ', baslik: 'Planlı elektrik kesintisi', bas: d(5, 9, 30), bit: d(5, 12, 30),
    aciklama: 'Hat bakım çalışması', yayim: d(0, 10, 0),
    etki: [{ mahalle: 'Hacıosman', sokaklar: ['*'] }, { mahalle: 'Hacıoğlu', sokaklar: ['*'] }],
  },
  {
    id: 't6', tur: 'Eczane', kaynak: 'Balıkesir Eczacı Odası', baslik: 'Nöbetçi eczane: Hayat Eczanesi', bas: d(0, 19, 0), bit: d(1, 8, 30),
    aciklama: 'Atatürk Caddesi No: 18, Kemalpaşa · Tel: 0266 000 00 18', yayim: d(0, 9, 0),
    etki: [{ mahalle: '*', sokaklar: ['*'] }],
  },
  {
    id: 't7', tur: 'Eczane', kaynak: 'Balıkesir Eczacı Odası', baslik: 'Nöbetçi eczane: Deniz Eczanesi', bas: d(1, 19, 0), bit: d(2, 8, 30),
    aciklama: 'Sahil Yolu No: 7, Mithatpaşa · Tel: 0266 000 00 07', yayim: d(0, 9, 0),
    etki: [{ mahalle: '*', sokaklar: ['*'] }],
  },
  {
    id: 't8', tur: 'Resmî', kaynak: 'Resmî tatil takvimi', baslik: 'Cumhuriyet Bayramı (resmî tatil)', bas: sonraki(10, 29, 0, 0), bit: sonraki(10, 29, 23, 59),
    aciklama: '28 Ekim öğleden sonra yarım gün, 29 Ekim tam gün resmî tatil.', yayim: d(-30, 9, 0),
    etki: [{ mahalle: '*', sokaklar: ['*'] }],
  },
  {
    id: 't9', tur: 'Resmî', kaynak: 'Gömeç Kaymakamlığı', baslik: 'Okullarda veli toplantısı günü', bas: d(4, 14, 0), bit: d(4, 17, 0),
    aciklama: 'İlçedeki tüm okullarda veli toplantısı yapılacaktır; öğrenciler öğleden sonra serbesttir.', yayim: d(-1, 14, 0),
    etki: [{ mahalle: '*', sokaklar: ['*'] }],
  },
];

// ---------------- YAPAY ZEKÂ DESTEKLİ ARAMA ----------------
// Gündelik ifadeleri hizmet türlerine eşler (gerçek üründe Türkiye'de barındırılan dil modeli + vektör arama)
export const ES_ANLAM = {
  'Elektrik ustası': ['elektrik', 'elektrikçi', 'sigorta', 'priz', 'kablo', 'tesisat elektrik', 'aydınlatma montaj', 'ışık yanmıyor', 'kaçak akım'],
  'Tesisatçı': ['tesisat', 'tesisatçı', 'musluk', 'su kaçağı', 'kombi', 'petek', 'lavabo', 'tıkanık', 'boru'],
  'Boya badana': ['boya', 'badana', 'boyacı', 'alçı', 'duvar', 'cephe'],
  'Marangoz': ['marangoz', 'kapı', 'pencere', 'dolap', 'ahşap', 'mobilya'],
  'Oto tamir': ['araba', 'oto', 'tamir', 'lastik', 'fren', 'akü', 'servis'],
  'Fırın': ['ekmek', 'fırın', 'pide', 'poğaça'],
  'Pastane': ['pasta', 'tatlı', 'kurabiye', 'doğum günü'],
  'Kafe': ['kahve', 'çay', 'kahvaltı', 'kafe'],
  'Lokanta': ['yemek', 'lokanta', 'öğle yemeği', 'çorba'],
  'Restoran': ['balık', 'restoran', 'meze', 'akşam yemeği'],
  'Market': ['market', 'bakkal', 'alışveriş'],
  'Berber': ['berber', 'tıraş', 'saç', 'sakal', 'kuaför'],
  'Pansiyon': ['pansiyon', 'konaklama', 'otel', 'oda'],
  'Üretici': ['zeytinyağı', 'zeytin', 'sabun', 'yerel ürün'],
};

export const HIZMETLER = [
  { baslik: 'Nikâh başvurusu ve nikâh salonu', birim: 'Yazı İşleri', metin: 'Nikâh başvurusu için çiftlerin kimlik, sağlık raporu ve fotoğraflarla Yazı İşleri’ne başvurması gerekir. Salon tarihi başvuruda belirlenir.', kw: ['nikah', 'nikâh', 'evlilik', 'düğün salonu', 'evlenmek'] },
  { baslik: 'Cenaze aracı ve defin hizmeti', birim: 'Zabıta / Mezarlık', metin: 'Cenaze nakil aracı ve defin işlemleri için 7/24 belediyeyi arayabilir veya Beyaz Masa’ya yazabilirsiniz.', kw: ['cenaze', 'vefat', 'defin', 'mezarlık', 'cenaze aracı'] },
  { baslik: 'Çöp toplama saatleri', birim: 'Temizlik İşleri', metin: 'İlçe merkezinde her gün 06:00–10:00, kırsal mahallelerde Salı ve Cuma günleri.', kw: ['çöp', 'atık', 'toplama', 'konteyner'] },
  { baslik: 'Emlak vergisi ve çevre temizlik vergisi', birim: 'Mali Hizmetler', metin: 'Taksitler Mayıs ve Kasım sonunda ödenir. Borçlarınızı Ödemelerim bölümünde görebilir, belediyenin ödeme sayfasına geçebilirsiniz.', kw: ['vergi', 'emlak', 'borç', 'ödeme', 'taksit', 'çtv'] },
  { baslik: 'Nöbetçi eczane', birim: 'İlçe Takvimi', metin: 'Bugünkü nöbetçi eczane ilçe takviminde gösterilir.', kw: ['eczane', 'nöbetçi', 'ilaç'] },
  { baslik: 'Elektrik ve su kesintileri', birim: 'İlçe Takvimi', metin: 'UEDAŞ ve BASKİ duyuruları bölgenize göre ilçe takviminde gösterilir.', kw: ['kesinti', 'elektrik yok', 'su yok', 'elektrik kesintisi', 'su kesintisi', 'uedaş', 'baski'] },
  { baslik: 'Sosyal yardım başvurusu', birim: 'Sosyal Yardım Birimi', metin: 'Gıda, yakacak, eğitim ve evde bakım desteği için uygulamadan başvurabilirsiniz.', kw: ['yardım', 'sosyal', 'yakacak', 'kömür', 'gıda', 'erzak', 'evde bakım'] },
  { baslik: 'Sokak hayvanları', birim: 'Veteriner İşleri', metin: 'Yaralı veya hasta sokak hayvanlarını konumla birlikte Beyaz Masa’ya bildirebilirsiniz.', kw: ['köpek', 'kedi', 'hayvan', 'yaralı hayvan'] },
];

// ---------------- YAPAY ZEKÂ İLE DOKÜMAN OLUŞTURMA ----------------
export const DOKUMAN_TURLERI = [
  { id: 'dilekce', ad: 'Belediyeye dilekçe / talep', aciklama: 'Beyaz Masa’ya gönderilecek resmî dilde talep metni', icon: 'document-text-outline', hedef: 'BM_New', kim: ['bireysel', 'kurumsal'] },
  { id: 'yardim', ad: 'Sosyal yardım açıklaması', aciklama: 'Başvurunuz için durumunuzu anlatan açıklama', icon: 'heart-outline', hedef: 'SY_New', kim: ['bireysel'] },
  { id: 'vefat', ad: 'Vefat ve taziye duyurusu', aciklama: 'Cenaze saati, cami ve taziye yeri', icon: 'flower-outline', hedef: 'IL_New', kategori: 'Vefat', kim: ['bireysel'] },
  { id: 'davet', ad: 'Düğün, sünnet, hayır daveti', aciklama: 'Davet duyurusu metni', icon: 'heart-circle-outline', hedef: 'IL_New', kategori: 'Hayır', kim: ['bireysel'] },
  { id: 'satilik', ad: 'Satılık / kiralık ilanı', aciklama: 'Ev, arsa, araç veya eşya ilanı', icon: 'pricetag-outline', hedef: 'IL_New', kategori: 'Satılık', kim: ['bireysel', 'kurumsal'] },
  { id: 'paylasim', ad: 'İşletme paylaşımı', aciklama: 'Kampanya, menü veya çalışma saati duyurusu', icon: 'storefront-outline', hedef: 'ES_New', kim: ['kurumsal'] },
];
