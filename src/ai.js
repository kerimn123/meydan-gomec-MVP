// Demo "yapay zekâ" katmanı.
// Gerçek üründe bu fonksiyonlar Türkiye'de barındırılan bir dil modeli ve vektör aramasıyla çalışır;
// demoda kurallı eşleştirme ve şablonlarla aynı deneyim canlandırılır.
import { ES_ANLAM, HIZMETLER } from './data_mvp';
import { isOpen } from './util';

const kucuk = (s) => (s || '').toLocaleLowerCase('tr');

export function aramaYap(q, { isletmeler, duyurular, takvim }) {
  const t = ' ' + kucuk(q).trim() + ' ';
  if (t.trim().length < 2) return null;
  const kelimeler = t.trim().split(/\s+/).filter((k) => k.length > 1);
  // Kelime başından eşleşme: "attı" araması "hattı" kelimesini getirmesin
  const eslesir = (metin) => {
    const m = ' ' + kucuk(metin).replace(/[^a-z0-9çğıöşüâîû]+/g, ' ');
    return kelimeler.some((k) => k.length > 2 && m.includes(' ' + k));
  };

  const turler = Object.entries(ES_ANLAM)
    .filter(([, kw]) => kw.some((k) => t.includes(kucuk(k)) || kelimeler.some((w) => kucuk(k).startsWith(w) && w.length > 3)))
    .map(([tur]) => tur);

  const isl = isletmeler
    .filter((b) => turler.includes(b.tur) || eslesir(b.ad) || eslesir(b.tur))
    .sort((a, b) => Number(isOpen(b.hours)) - Number(isOpen(a.hours)));

  const hiz = HIZMETLER.filter((h) => h.kw.some((k) => t.includes(kucuk(k))) || eslesir(h.baslik));
  const duy = duyurular.filter((x) => eslesir(x.baslik)).slice(0, 3);
  const tak = takvim.filter((x) => eslesir(x.baslik) || eslesir(x.tur) || eslesir(x.aciklama)).slice(0, 3);

  let yorum = null;
  if (turler.length) yorum = `“${q.trim()}” için ${turler.join(', ').toLocaleLowerCase('tr')} hizmeti veren işletmeleri listeledim.`;
  else if (hiz.length) yorum = `Aradığınız konu belediyenin “${hiz[0].baslik.toLocaleLowerCase('tr')}” hizmetiyle ilgili görünüyor.`;
  return { turler, isl, hiz, duy, tak, yorum, bos: !isl.length && !hiz.length && !duy.length && !tak.length };
}

// ---------------- Doküman oluşturma ----------------
const cumle = (s) => {
  let x = (s || '').trim().replace(/\s+/g, ' ');
  if (!x) return '';
  x = x.charAt(0).toLocaleUpperCase('tr') + x.slice(1);
  if (!/[.!?]$/.test(x)) x += '.';
  return x;
};
const sec = (arr, v) => arr[v % arr.length];

export const DOKUMAN_ALANLARI = {
  dilekce: [
    { k: 'konu', l: 'Konu', tip: 'secim', secenekler: ['Yol ve kaldırım', 'Aydınlatma', 'Çöp ve temizlik', 'Park ve yeşil alan', 'Zabıta', 'Sokak hayvanları', 'Diğer'] },
    { k: 'yer', l: 'Yer (mahalle, sokak)', ph: 'Örn: Kemalpaşa Mahallesi, Cami Sokak' },
    { k: 'anlatim', l: 'Kendi cümlelerinizle anlatın', ph: 'Örn: lamba 3 gündür yanmıyor akşam çok karanlık', cok: true },
  ],
  yardim: [
    { k: 'tur', l: 'Yardım türü', tip: 'secim', secenekler: ['Gıda', 'Yakacak', 'Eğitim', 'Evde bakım'] },
    { k: 'hane', l: 'Hanede yaşayan kişi sayısı', ph: '4', sayi: true },
    { k: 'durum', l: 'Durumunuzu kısaca yazın', ph: 'Örn: eşim çalışamıyor, iki çocuğum okula gidiyor', cok: true },
  ],
  vefat: [
    { k: 'ad', l: 'Merhumun adı soyadı', ph: 'Örn: Mehmet Yılmaz' },
    { k: 'lakap', l: 'Bilinen adı (isteğe bağlı)', ph: 'Örn: Hacı Mehmet' },
    { k: 'mahalle', l: 'Mahalle', ph: 'Örn: Yaya' },
    { k: 'gun', l: 'Cenaze günü', tip: 'secim', secenekler: ['Bugün', 'Yarın'] },
    { k: 'vakit', l: 'Namaz', tip: 'secim', secenekler: ['Öğle namazı', 'İkindi namazı', 'Cuma namazı'] },
    { k: 'cami', l: 'Cami', ph: 'Örn: Yaya Camii' },
    { k: 'taziye', l: 'Taziye yeri', ph: 'Örn: cami avlusu' },
  ],
  davet: [
    { k: 'tur', l: 'Davet türü', tip: 'secim', secenekler: ['Hayır yemeği', 'Mevlit', 'Düğün', 'Sünnet düğünü'] },
    { k: 'kim', l: 'Kimin için / kimler', ph: 'Örn: rahmetli babamız / oğlumuz Can ile Selin' },
    { k: 'yer', l: 'Yer', ph: 'Örn: Hacıosman köy camii avlusu' },
    { k: 'zaman', l: 'Gün ve saat', ph: 'Örn: Cumartesi 12:30' },
  ],
  satilik: [
    { k: 'tur', l: 'İlan türü', tip: 'secim', secenekler: ['Satılık', 'Kiralık'] },
    { k: 'ne', l: 'Ne?', ph: 'Örn: 2+1 yazlık, zeytinlik, traktör' },
    { k: 'ozellik', l: 'Özellikler', ph: 'Örn: denize 300 m, bahçeli, eşyalı', cok: true },
    { k: 'fiyat', l: 'Fiyat (₺)', ph: 'Örn: 3.450.000', sayi: true },
  ],
  paylasim: [
    { k: 'tur', l: 'Paylaşım türü', tip: 'secim', secenekler: ['Kampanya', 'Menü', 'Çalışma saatleri'] },
    { k: 'detay', l: 'Ne duyurmak istiyorsunuz?', ph: 'Örn: hafta içi sıcak içecekler %20 indirimli', cok: true },
    { k: 'sure', l: 'Geçerlilik', ph: 'Örn: ay sonuna kadar' },
  ],
};

export function dokumanUret(tur, a, v = 0, kurum = 'Gömeç Belediyesi') {
  switch (tur) {
    case 'dilekce': {
      const yer = a.yer ? `${a.yer.trim()} adresinde ` : '';
      const giris = sec([`Sayın ${kurum} Beyaz Masa Birimi,`, `${kurum} Başkanlığına,`], v);
      const kapanis = sec([
        'Konunun incelenerek gerekli işlemin yapılmasını saygılarımla arz ederim.',
        'Gereğinin yapılmasını ve sonucu hakkında tarafıma bilgi verilmesini saygılarımla rica ederim.',
      ], v);
      return {
        baslik: `${a.konu || 'Talep'} hakkında`,
        metin: `${giris}\n\n${yer}${cumle(a.anlatim).replace(/^./, (c) => (yer ? c.toLocaleLowerCase('tr') : c))} Bu durum bölgede yaşayan vatandaşlarımız için sorun oluşturmaktadır.\n\n${kapanis}`,
      };
    }
    case 'yardim': {
      return {
        baslik: `${a.tur || 'Sosyal'} yardımı başvurusu`,
        metin: sec([
          `Hanemizde ${a.hane || '…'} kişi yaşamaktadır. ${cumle(a.durum)} Bu nedenle ${kucuk(a.tur || 'sosyal')} yardımı desteğinden yararlanmak istiyorum. Gerekli belgeleri başvuruma ekledim; değerlendirmenizi saygılarımla rica ederim.`,
          `${a.hane || '…'} kişilik hanemizin geçimini sağlamakta güçlük çekiyoruz. ${cumle(a.durum)} Belediyemizin ${kucuk(a.tur || 'sosyal')} yardımı kapsamında değerlendirilmeyi talep ediyorum.`,
        ], v),
      };
    }
    case 'vefat': {
      const ad = a.ad || '…';
      const lak = a.lakap ? ` (${a.lakap})` : '';
      const gun = a.gun === 'Yarın' ? 'yarın' : 'bugün';
      return {
        baslik: `Vefat: ${ad}`,
        metin: sec([
          `${a.mahalle || '…'} Mahallesi’nden ${ad}${lak} vefat etmiştir. Cenazesi ${gun} ${kucuk(a.vakit || 'öğle namazı')}nı müteakip ${a.cami || '…'}’nden kaldırılacaktır. Taziyeler ${a.taziye || 'cami avlusunda'} kabul edilecektir. Merhuma Allah’tan rahmet, ailesine ve yakınlarına başsağlığı dileriz.`,
          `Hemşehrimiz ${ad}${lak} Hakk’ın rahmetine kavuşmuştur. Cenaze namazı ${gun} ${a.cami || '…'}’nde kılınacak ${kucuk(a.vakit || 'öğle namazı')}nın ardından defnedilecektir. Taziyeler ${a.taziye || 'cami avlusunda'} kabul edilecektir. Allah rahmet eylesin.`,
        ], v),
      };
    }
    case 'davet': {
      const t = a.tur || 'Hayır yemeği';
      const yer = a.yer || '…';
      const z = a.zaman || '…';
      let metin;
      if (t === 'Düğün' || t === 'Sünnet düğünü') {
        metin = sec([
          `${cumle(`${a.kim || '…'} ${t === 'Düğün' ? 'düğünü' : 'sünnet düğünü'} ${z} ${yer} yapılacaktır`)} Bu mutlu günümüzde tüm dost, akraba ve hemşehrilerimizi aramızda görmekten mutluluk duyarız.`,
          `Sevgili hemşehrilerimiz, ${a.kim || '…'} ${t === 'Düğün' ? 'düğün' : 'sünnet'} törenine sizleri de bekliyoruz. Yer: ${yer}. Zaman: ${z}.`,
        ], v);
      } else {
        metin = sec([
          `${cumle(`${a.kim || '…'} hayrına ${z} ${yer} ${t === 'Mevlit' ? 'mevlit okutulacak, ardından yemek ikram edilecektir' : 'yemek verilecektir'}`)} Tüm hemşehrilerimiz davetlidir.`,
          `${a.kim ? cumle(a.kim + ' için') : ''} ${t} ${z} tarihinde ${yer} düzenlenecektir. Katılımlarınızı bekleriz.`.trim(),
        ], v);
      }
      return { baslik: t === 'Hayır yemeği' ? `${z.split(' ')[0]} hayır yemeği` : t, metin, kategori: t === 'Düğün' ? 'Düğün' : t === 'Sünnet düğünü' ? 'Sünnet' : 'Hayır' };
    }
    case 'satilik': {
      const t = a.tur || 'Satılık';
      return {
        baslik: `${t} ${a.ne || ''}`.trim(),
        metin: sec([
          `${cumle(`${a.ne || '…'} ${kucuk(t)}tır`)} ${cumle(a.ozellik)} İlgilenenler uygulama üzerinden mesaj gönderebilir.`,
          `${t}: ${a.ne || '…'}. ${cumle(a.ozellik)} Ayrıntılı bilgi için uygulama içinden iletişime geçebilirsiniz.`,
        ], v),
        fiyat: a.fiyat,
        kategori: t,
      };
    }
    case 'paylasim': {
      const t = a.tur || 'Kampanya';
      const sure = a.sure ? ` Geçerlilik: ${a.sure}.` : '';
      return {
        baslik: t === 'Çalışma saatleri' ? 'Güncel çalışma saatlerimiz' : t === 'Menü' ? 'Bugünün menüsü' : cumle(a.detay).replace(/\.$/, ''),
        metin: sec([
          `${cumle(a.detay)}${sure} Sizleri işletmemizde ağırlamaktan mutluluk duyarız.`,
          `Değerli müşterilerimiz, ${cumle(a.detay).replace(/^./, (c) => c.toLocaleLowerCase('tr'))}${sure} Bekliyoruz!`,
        ], v),
        tur: t,
      };
    }
    default:
      return { baslik: '', metin: '' };
  }
}
